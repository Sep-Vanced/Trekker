# weather/services.py
import requests
import logging
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from navigation.models import TrekkingRoute
from .models import WeatherReport, WeatherAlert

logger = logging.getLogger(__name__)


# ================================================================
# CONFIG CLASS
# Centralizes all thresholds and route risk profiles.
# Edit here to tune sensitivity without touching logic.
# ================================================================

class WeatherConfig:
    """
    All magic numbers and route classifications live here.
    Change thresholds or add new route profiles without
    touching any other class.
    """

    # ── Rainfall thresholds (mm/hour) ────────────────────────────
    RAINFALL = {
        'light':    2.0,   # slippery surfaces, caution
        'moderate': 7.5,   # river crossings risky
        'heavy':   15.0,   # trail unsafe
        'extreme': 30.0,   # full closure, lahar surge risk
    }

    # ── Wind speed thresholds (kph) ──────────────────────────────
    WIND = {
        'moderate': 30.0,  # caution on ridge routes
        'strong':   50.0,  # dangerous on Camp Kuta / knife ridge
        'extreme':  70.0,  # all routes unsafe
    }

    # ── Temperature thresholds (°C) ──────────────────────────────
    HEAT = {
        'caution': 33.0,   # heat index warning, early start recommended
        'danger':  38.0,   # dangerous heat index
    }

    # ── Humidity threshold (%) ───────────────────────────────────
    HUMIDITY_HIGH = 85     # combined with heat = dangerous

    # ── How long a WeatherReport is valid ───────────────────────
    REPORT_VALID_HOURS  = 1
    ALERT_EXPIRES_HOURS = 3

    # ── Forecast window (OWM 3hr slots, 8 = 24 hours) ───────────
    FORECAST_SLOTS = 8

    # ── Route risk profiles ──────────────────────────────────────
    # Partial name matching — add new route names here as needed.
    # A route can only belong to ONE profile (first match wins).
    # Priority: remote > river_crossing > ridge > boat > standard

    RISK_PROFILES = {
        'remote': [
            "Eagles Paradise Extension",
            "Camp Kuta North Descent → Far Camp",
            "Full Northern Loop → Far Camp",
            "Full Overland Traverse → Eagles Paradise",
        ],
        'river_crossing': [
            "Aglao Lahar Trail",
            "Buhawen Overland Trail",
            "Central Lahar Trail",
            "Buhawen Long Loop",
            "Aglao Lahar + Shore Traverse",
            "Full Overland Traverse",
            "Full Northern Loop",
        ],
        'ridge': [
            "Phase 3 Ridge Hike",
            "Eagles Paradise Ridge Hike",
            "Camp Kuta North Descent",
        ],
        'boat': [
            "Aglao Boat Crossing",
        ],
    }

    # ── OWM condition ID → internal condition string ─────────────
    OWM_CONDITION_MAP = [
        (900, None,  'storm'),
        (800, 800,   'clear'),
        (800, None,  'cloudy'),
        (700, None,  'fog'),
        (600, None,  'cloudy'),
        (502, None,  'heavy_rain'),
        (500, None,  'rain'),
        (300, None,  'rain'),
        (200, None,  'storm'),
    ]


# ================================================================
# FETCHER CLASS
# Responsible only for HTTP calls to OpenWeatherMap.
# Swap this out to use a different API without touching anything else.
# ================================================================

class WeatherFetcher:
    """
    Handles all outbound HTTP requests to OpenWeatherMap API.
    Returns raw API dicts or safe fallback values on failure.
    """

    BASE_URL = "https://api.openweathermap.org/data/2.5"

    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.lat     = settings.MAPANUEPE_LAT
        self.lon     = settings.MAPANUEPE_LON

    def _get(self, endpoint: str, extra_params: dict = None) -> dict | None:
        """
        Internal DRY GET request helper.
        Returns parsed JSON or None on any failure.
        """
        params = {
            'lat':   self.lat,
            'lon':   self.lon,
            'appid': self.api_key,
            'units': 'metric',
            **(extra_params or {}),
        }
        try:
            response = requests.get(
                f"{self.BASE_URL}/{endpoint}",
                params=params,
                timeout=10,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"[WeatherFetcher] {endpoint} request failed: {e}")
            return None

    def get_current(self) -> dict | None:
        """
        Fetches current weather for Mapanuepe coordinates.
        Returns raw OWM dict or None.
        """
        data = self._get('weather')
        if data:
            condition = data.get('weather', [{}])[0].get('main', 'Unknown')
            logger.info(f"[WeatherFetcher] Current condition: {condition}")
        return data

    def get_forecast(self) -> list:
        """
        Fetches next 24 hours of 3-hour forecast slots.
        Returns list of slot dicts or empty list.
        """
        data = self._get('forecast', {'cnt': WeatherConfig.FORECAST_SLOTS})
        return data.get('list', []) if data else []


# ================================================================
# PARSER CLASS
# Converts raw OWM API dicts into clean internal dicts.
# ================================================================

class WeatherParser:
    """
    Stateless parser — converts raw OpenWeatherMap API responses
    into clean normalized dicts that match our model fields.
    All methods are static.
    """

    @staticmethod
    def parse_current(raw: dict) -> dict:
        """
        Parses raw OWM current weather response.

        Returns:
            {
                'condition':      str,
                'temperature_c':  Decimal,
                'wind_speed_kph': Decimal,
                'rainfall_mm':    Decimal,
                'humidity_pct':   int,
            }
        """
        weather_id = raw.get('weather', [{}])[0].get('id', 800)
        main       = raw.get('main', {})
        wind       = raw.get('wind', {})
        rain       = raw.get('rain', {})

        return {
            'condition':      WeatherParser._map_condition(weather_id),
            'temperature_c':  Decimal(str(round(main.get('temp', 30.0), 1))),
            'wind_speed_kph': Decimal(str(round(wind.get('speed', 0) * 3.6, 1))),
            'rainfall_mm':    Decimal(str(round(rain.get('1h', 0.0), 1))),
            'humidity_pct':   int(main.get('humidity', 70)),
        }

    @staticmethod
    def parse_forecast_slot(slot: dict) -> dict:
        """
        Parses a single 3-hour forecast slot from OWM.

        Returns:
            {
                'rain_3h':     float,   # mm per 3 hours
                'wind_kph':    float,
                'weather_id':  int,
                'dt_txt':      str,     # e.g. "2025-07-15 06:00:00"
            }
        """
        return {
            'rain_3h':    slot.get('rain', {}).get('3h', 0.0),
            'wind_kph':   slot.get('wind', {}).get('speed', 0) * 3.6,
            'weather_id': slot.get('weather', [{}])[0].get('id', 800),
            'dt_txt':     slot.get('dt_txt', ''),
        }

    @staticmethod
    def _map_condition(weather_id: int) -> str:
        """
        Maps OWM weather condition ID to our CONDITION_CHOICES string.
        Uses WeatherConfig.OWM_CONDITION_MAP — ordered from highest to lowest.
        """
        for lower, exact, condition in WeatherConfig.OWM_CONDITION_MAP:
            if exact is not None:
                if weather_id == exact:
                    return condition
            elif weather_id >= lower:
                return condition
        return 'clear'


# ================================================================
# EVALUATOR CLASS
# Core safety logic — evaluates each route against weather data.
# ================================================================

class WeatherEvaluator:
    """
    Evaluates route safety based on current weather and route
    risk profile. Produces human-readable reasons and alert payloads.

    Usage:
        evaluator = WeatherEvaluator(route, weather_dict)
        result    = evaluator.evaluate()
        # result = {'is_safe': bool, 'reasons': [...], 'alerts': [...]}
    """

    def __init__(self, route: TrekkingRoute, weather: dict):
        self.route      = route
        self.weather    = weather
        self.condition  = weather['condition']
        self.rainfall   = float(weather['rainfall_mm'])
        self.wind_speed = float(weather['wind_speed_kph'])
        self.temperature= float(weather['temperature_c'])
        self.humidity   = weather['humidity_pct']
        self.profile    = self._resolve_profile()

        self.is_safe    = True
        self.reasons    = []
        self.alerts     = []

    def _resolve_profile(self) -> str:
        """
        Matches the route name against WeatherConfig.RISK_PROFILES.
        Priority order: remote > river_crossing > ridge > boat > standard.
        First match wins.
        """
        route_lower = self.route.name.lower()
        for profile, partials in WeatherConfig.RISK_PROFILES.items():
            for partial in partials:
                if partial.lower() in route_lower:
                    return profile
        return 'standard'

    # ── Public entry point ───────────────────────────────────────

    def evaluate(self) -> dict:
        """
        Runs all safety checks and returns consolidated result.

        Returns:
            {
                'is_safe': bool,
                'profile': str,
                'reasons': [str],
                'alerts':  [dict],
            }
        """
        self._check_rainfall()
        self._check_wind()
        self._check_storm()
        self._check_flood()
        self._check_heat()

        return {
            'is_safe': self.is_safe,
            'profile': self.profile,
            'reasons': self.reasons,
            'alerts':  self.alerts,
        }

    # ── Private check methods ────────────────────────────────────

    def _check_rainfall(self):
        r  = self.rainfall
        R  = WeatherConfig.RAINFALL
        nm = self.route.name

        if r >= R['extreme']:
            self.is_safe = False
            self.reasons.append(f"Extreme rainfall {r}mm/hr — full trail closure.")
            self.alerts.append(self._alert(
                type     = 'heavy_rain',
                severity = 'extreme',
                title    = f'Extreme Rainfall — {nm} CLOSED',
                message  = (
                    f"Rainfall has reached {r}mm/hr at Lake Mapanuepe. "
                    f"This route is immediately closed. Flash flood and lahar "
                    f"surge risk is critical. All trekkers must move to "
                    f"emergency high ground immediately."
                ),
            ))

        elif r >= R['heavy']:
            self.is_safe = False
            self.reasons.append(f"Heavy rainfall {r}mm/hr — trail unsafe.")
            self.alerts.append(self._alert(
                type     = 'heavy_rain',
                severity = 'danger',
                title    = f'Heavy Rainfall Warning — {nm}',
                message  = (
                    f"Rainfall of {r}mm/hr detected. River crossings are "
                    f"impassable and the lahar trail is extremely slippery. "
                    f"Do not start this route. Trekkers already on trail must "
                    f"return to the nearest camp immediately."
                ),
            ))

        elif r >= R['moderate'] and self.profile in ('river_crossing', 'remote'):
            self.is_safe = False
            self.reasons.append(f"Moderate rainfall {r}mm/hr — river crossings risky.")
            self.alerts.append(self._alert(
                type     = 'river_crossing',
                severity = 'warning',
                title    = f'River Crossing Risk — {nm}',
                message  = (
                    f"Rainfall of {r}mm/hr detected. Stream channels on this "
                    f"route may be running higher than normal. Cross only with "
                    f"a guide. Turn back if water is above knee height."
                ),
            ))

        elif r >= R['light']:
            self.reasons.append(f"Light rain {r}mm/hr — slippery surfaces.")
            self.alerts.append(self._alert(
                type     = 'unsafe_trail',
                severity = 'info',
                title    = f'Light Rain Advisory — {nm}',
                message  = (
                    f"Light rainfall detected ({r}mm/hr). Trail surfaces are "
                    f"slippery. Trekking poles strongly recommended. Exercise "
                    f"extra caution on all ridge sections."
                ),
            ))

    def _check_wind(self):
        w  = self.wind_speed
        W  = WeatherConfig.WIND
        nm = self.route.name

        if w >= W['extreme']:
            self.is_safe = False
            self.reasons.append(f"Extreme wind {w}kph — all routes unsafe.")
            self.alerts.append(self._alert(
                type     = 'strong_wind',
                severity = 'extreme',
                title    = f'Extreme Wind Warning — {nm}',
                message  = (
                    f"Wind speed has reached {w}kph. All routes are immediately "
                    f"unsafe. Stay in camp, secure tents, and await conditions "
                    f"to improve."
                ),
            ))

        elif w >= W['strong'] and self.profile in ('ridge', 'boat'):
            self.is_safe = False
            self.reasons.append(f"Strong wind {w}kph — ridge/boat routes dangerous.")
            self.alerts.append(self._alert(
                type     = 'strong_wind',
                severity = 'danger',
                title    = f'Strong Wind — {nm} High Risk',
                message  = (
                    f"Wind speed of {w}kph detected. Ridge sections and boat "
                    f"crossings are dangerous. Camp Kuta knife ridge and open "
                    f"lake crossings must not be attempted until wind subsides."
                ),
            ))

        elif w >= W['moderate'] and self.profile == 'ridge':
            self.reasons.append(f"Moderate wind {w}kph — ridge route caution.")
            self.alerts.append(self._alert(
                type     = 'strong_wind',
                severity = 'warning',
                title    = f'Wind Advisory — {nm}',
                message  = (
                    f"Wind speed of {w}kph on ridge sections. Secure all loose "
                    f"gear and move carefully at every exposed section."
                ),
            ))

    def _check_storm(self):
        if self.condition == 'storm':
            self.is_safe = False
            self.reasons.append("Active storm — all trekking suspended.")
            self.alerts.append(self._alert(
                type     = 'storm',
                severity = 'extreme',
                title    = f'Storm Warning — {self.route.name} SUSPENDED',
                message  = (
                    "An active storm is detected over Lake Mapanuepe. All "
                    "trekking is immediately suspended. Move to the nearest "
                    "emergency assembly point and await caretaker instructions."
                ),
            ))

    def _check_flood(self):
        flood_condition = self.condition == 'flood_risk'
        heavy_on_risky  = (
            self.rainfall >= WeatherConfig.RAINFALL['heavy']
            and self.profile in ('river_crossing', 'remote')
        )
        if flood_condition or heavy_on_risky:
            self.is_safe = False
            self.alerts.append(self._alert(
                type     = 'flood',
                severity = 'danger',
                title    = f'Flood Risk — {self.route.name}',
                message  = (
                    "Flood risk detected on this route. The Mapanuepe lahar "
                    "dam is highly sensitive to heavy upstream rainfall. Move "
                    "to high ground immediately and do not attempt any river "
                    "crossings until conditions are confirmed safe."
                ),
            ))

    def _check_heat(self):
        t  = self.temperature
        h  = self.humidity
        nm = self.route.name
        H  = WeatherConfig.HEAT

        if t >= H['danger'] and h >= WeatherConfig.HUMIDITY_HIGH:
            self.reasons.append(
                f"Dangerous heat index — {t}°C at {h}% humidity."
            )
            self.alerts.append(self._alert(
                type     = 'unsafe_trail',
                severity = 'warning',
                title    = f'Extreme Heat Advisory — {nm}',
                message  = (
                    f"Temperature is {t}°C with {h}% humidity — dangerously "
                    f"high heat index. Trek only between 5–8 AM. Carry minimum "
                    f"3L of water. Rest fully in shade from 10 AM to 3 PM."
                ),
            ))

        elif t >= H['caution']:
            self.reasons.append(
                f"High heat {t}°C — early morning start recommended."
            )

    # ── Alert builder ────────────────────────────────────────────

    @staticmethod
    def _alert(*, type: str, severity: str, title: str, message: str) -> dict:
        """
        Builds a consistent alert payload dict.
        Named 'type' instead of 'alert_type' internally for brevity;
        mapped back to 'alert_type' key for DB compatibility.
        """
        return {
            'alert_type': type,
            'severity':   severity,
            'title':      title,
            'message':    message,
        }


# ================================================================
# FORECAST EVALUATOR CLASS
# Generates proactive alerts from upcoming forecast data.
# ================================================================

class ForecastEvaluator:
    """
    Looks ahead at the next 24 hours of forecast slots and
    generates proactive WeatherAlert payloads before bad
    weather actually arrives.

    Usage:
        fe      = ForecastEvaluator(route, forecast_slots)
        alerts  = fe.evaluate()
    """

    def __init__(self, route: TrekkingRoute, forecast_slots: list):
        self.route   = route
        self.slots   = [WeatherParser.parse_forecast_slot(s) for s in forecast_slots]

    def evaluate(self) -> list:
        """
        Scans all forecast slots and returns a list of
        proactive alert dicts (same format as WeatherEvaluator alerts).
        """
        alerts           = []
        heavy_rain_times = []
        storm_times      = []

        heavy_threshold = WeatherConfig.RAINFALL['heavy'] * 3  # scaled to 3hr window

        for slot in self.slots:
            if slot['rain_3h'] >= heavy_threshold:
                heavy_rain_times.append(slot['dt_txt'])
            if slot['weather_id'] < 300:   # OWM thunderstorm IDs: 200–299
                storm_times.append(slot['dt_txt'])

        if heavy_rain_times:
            alerts.append({
                'alert_type': 'heavy_rain',
                'severity':   'warning',
                'title':      f'Upcoming Heavy Rain — {self.route.name}',
                'message':    (
                    f"Heavy rainfall is forecast in the next 24 hours "
                    f"(expected: {', '.join(heavy_rain_times[:3])}). "
                    f"River crossings may become impassable. Plan your trek "
                    f"accordingly or consider a boat route as an alternative."
                ),
            })

        if storm_times:
            alerts.append({
                'alert_type': 'storm',
                'severity':   'danger',
                'title':      f'Storm Forecast — {self.route.name}',
                'message':    (
                    f"A storm is forecast for this area within 24 hours "
                    f"(expected: {', '.join(storm_times[:2])}). "
                    f"Do not begin multi-day treks. Ensure all tents and "
                    f"camp gear are secured before the storm arrives."
                ),
            })

        return alerts


# ================================================================
# REPOSITORY CLASS
# All database read/write operations live here.
# Keeps DB logic out of the service orchestrator.
# ================================================================

class WeatherRepository:
    """
    Handles all database operations for WeatherReport
    and WeatherAlert models.
    All methods are static — no instance needed.
    """

    @staticmethod
    def save_report(
        route: TrekkingRoute,
        weather: dict,
        is_safe: bool,
    ) -> WeatherReport:
        """
        Creates and saves a new WeatherReport for a route.
        valid_until is set to now + REPORT_VALID_HOURS.
        """
        now = timezone.now()
        return WeatherReport.objects.create(
            route           = route,
            condition       = weather['condition'],
            temperature_c   = weather['temperature_c'],
            wind_speed_kph  = weather['wind_speed_kph'],
            rainfall_mm     = weather['rainfall_mm'],
            humidity_pct    = weather['humidity_pct'],
            is_safe_to_trek = is_safe,
            valid_until     = now + timedelta(hours=WeatherConfig.REPORT_VALID_HOURS),
            source          = 'openweathermap',
        )

    @staticmethod
    def save_alerts(route: TrekkingRoute, alert_dicts: list):
        """
        Deactivates all existing active alerts for the route first
        (prevents stacking), then bulk-creates new ones.
        """
        # Deactivate old alerts
        WeatherAlert.objects.filter(
            route=route, is_active=True
        ).update(is_active=False)

        if not alert_dicts:
            return

        now      = timezone.now()
        expires  = now + timedelta(hours=WeatherConfig.ALERT_EXPIRES_HOURS)

        WeatherAlert.objects.bulk_create([
            WeatherAlert(
                route      = route,
                alert_type = a['alert_type'],
                severity   = a['severity'],
                title      = a['title'],
                message    = a['message'],
                is_active  = True,
                expires_at = expires,
            )
            for a in alert_dicts
        ])

    @staticmethod
    def update_route_status(route: TrekkingRoute, is_safe: bool, condition: str):
        """
        Auto-updates TrekkingRoute.status based on weather evaluation.
        Only writes to DB if the status actually changed.
        """
        if not is_safe or condition in ('storm', 'flood_risk'):
            new_status = 'closed'
        elif condition in ('heavy_rain', 'strong_wind', 'rain'):
            new_status = 'caution'
        else:
            new_status = 'open'

        if route.status != new_status:
            logger.info(
                f"[WeatherRepository] Status change: "
                f"'{route.name}' → {new_status}"
            )
            route.status = new_status
            route.save(update_fields=['status', 'updated_at'])

    @staticmethod
    def get_active_routes():
        """Returns all active TrekkingRoute queryset."""
        return TrekkingRoute.objects.filter(is_active=True)

    @staticmethod
    def get_latest_report(route: TrekkingRoute) -> WeatherReport | None:
        """Returns the most recent WeatherReport for a route or None."""
        return (
            WeatherReport.objects
            .filter(route=route)
            .order_by('-recorded_at')
            .first()
        )

    @staticmethod
    def get_active_alerts(route: TrekkingRoute):
        """Returns all currently active WeatherAlerts for a route."""
        return WeatherAlert.objects.filter(route=route, is_active=True)


# ================================================================
# WEATHER SERVICE CLASS
# Master orchestrator — ties all classes together.
# This is the only class that should be imported by tasks/views.
# ================================================================

class WeatherService:
    """
    Main entry point for the entire weather system.
    Orchestrates: fetch → parse → evaluate → save → update status.

    Usage (from Celery task):
        service = WeatherService()
        summary = service.run_update()

    Usage (single route, e.g. from a view):
        service = WeatherService()
        result  = service.run_for_route(route)
    """

    def __init__(self):
        self.fetcher    = WeatherFetcher()
        self.parser     = WeatherParser()
        self.repository = WeatherRepository()

    # ── Public API ───────────────────────────────────────────────

    def run_update(self) -> dict:
        """
        Full hourly update — processes all active routes.
        Called by Celery Beat every hour.

        Returns summary dict:
            {
                'success':        bool,
                'condition':      str,
                'temperature_c':  float,
                'rainfall_mm':    float,
                'wind_speed_kph': float,
                'routes_updated': int,
                'routes_closed':  int,
                'routes_caution': int,
                'alerts_created': int,
            }
        """
        logger.info("[WeatherService] ── Starting hourly weather update ──")

        weather, forecast = self._fetch_all()
        if weather is None:
            return self._failure_summary("API fetch failed")

        routes  = self.repository.get_active_routes()
        summary = self._process_routes(routes, weather, forecast)

        logger.info(f"[WeatherService] ── Update complete: {summary} ──")
        return summary

    def run_for_route(self, route: TrekkingRoute) -> dict:
        """
        On-demand update for a single route.
        Useful for API endpoints that need fresh data for one route.

        Returns:
            {
                'route':    str,
                'is_safe':  bool,
                'profile':  str,
                'weather':  dict,
                'reasons':  [str],
                'alerts':   [dict],
            }
        """
        logger.info(f"[WeatherService] On-demand update for: {route.name}")

        weather, forecast = self._fetch_all()
        if weather is None:
            return {'route': route.name, 'error': 'API fetch failed'}

        result = self._process_single_route(route, weather, forecast)
        return {
            'route':   route.name,
            'is_safe': result['is_safe'],
            'profile': result['profile'],
            'weather': {k: str(v) for k, v in weather.items()},
            'reasons': result['reasons'],
            'alerts':  result['alerts'],
        }

    def get_current_status(self, route: TrekkingRoute) -> dict:
        """
        Returns the latest cached status for a route
        without making any new API calls.
        Good for frequent polling from the mobile app.

        Returns:
            {
                'route':     str,
                'status':    str,  # open / caution / closed
                'report':    dict | None,
                'alerts':    list,
            }
        """
        report  = self.repository.get_latest_report(route)
        alerts  = self.repository.get_active_alerts(route)

        return {
            'route':  route.name,
            'status': route.status,
            'report':  report,
            'alerts': [
                {
                    'type':     a.alert_type,
                    'severity': a.severity,
                    'title':    a.title,
                    'message':  a.message,
                }
                for a in alerts
            ],
        }

    # ── Private helpers ──────────────────────────────────────────

    def _fetch_all(self) -> tuple[dict | None, list]:
        """
        Fetches and parses current weather and forecast in one call.
        Returns (parsed_weather_dict, forecast_slots_list).
        """
        raw_current = self.fetcher.get_current()
        if not raw_current:
            logger.error("[WeatherService] Failed to fetch current weather.")
            return None, []

        forecast    = self.fetcher.get_forecast()
        weather     = WeatherParser.parse_current(raw_current)
        return weather, forecast

    def _process_routes(
        self,
        routes,
        weather: dict,
        forecast: list,
    ) -> dict:
        """
        Iterates over all active routes and processes each one.
        Returns aggregated summary dict.
        """
        updated        = 0
        closed         = 0
        cautioned      = 0
        alerts_created = 0

        for route in routes:
            try:
                result          = self._process_single_route(route, weather, forecast)
                alerts_created += len(result['alerts'])

                if not result['is_safe']:
                    closed += 1
                elif weather['condition'] in ('rain', 'heavy_rain', 'strong_wind'):
                    cautioned += 1

                updated += 1

                if result['reasons']:
                    logger.warning(
                        f"[WeatherService] {route.name} "
                        f"[{result['profile']}]: "
                        f"{' | '.join(result['reasons'])}"
                    )

            except Exception as e:
                logger.error(
                    f"[WeatherService] Error on route '{route.name}': {e}",
                    exc_info=True,
                )
                continue

        return {
            'success':        True,
            'condition':      weather['condition'],
            'temperature_c':  float(weather['temperature_c']),
            'rainfall_mm':    float(weather['rainfall_mm']),
            'wind_speed_kph': float(weather['wind_speed_kph']),
            'routes_updated': updated,
            'routes_closed':  closed,
            'routes_caution': cautioned,
            'alerts_created': alerts_created,
        }

    def _process_single_route(
        self,
        route: TrekkingRoute,
        weather: dict,
        forecast: list,
    ) -> dict:
        """
        Full pipeline for one route:
        1. Evaluate current weather safety
        2. Evaluate forecast (proactive alerts)
        3. Merge alerts
        4. Save report + alerts to DB
        5. Update route status
        Returns the evaluation result dict.
        """
        # 1. Current weather evaluation
        evaluator   = WeatherEvaluator(route, weather)
        result      = evaluator.evaluate()

        # 2. Proactive forecast alerts
        fe          = ForecastEvaluator(route, forecast)
        forecast_alerts = fe.evaluate()

        # 3. Merge
        result['alerts'].extend(forecast_alerts)

        # 4. Save
        self.repository.save_report(route, weather, result['is_safe'])
        self.repository.save_alerts(route, result['alerts'])

        # 5. Update status
        self.repository.update_route_status(
            route,
            result['is_safe'],
            weather['condition'],
        )

        return result

    @staticmethod
    def _serialize_report(report: WeatherReport | None) -> dict | None:
        """Converts a WeatherReport model instance to a plain dict."""
        if not report:
            return None
        return {
            'condition':      report.condition,
            'temperature_c':  str(report.temperature_c),
            'wind_speed_kph': str(report.wind_speed_kph),
            'rainfall_mm':    str(report.rainfall_mm),
            'humidity_pct':   report.humidity_pct,
            'is_safe_to_trek':report.is_safe_to_trek,
            'recorded_at':    report.recorded_at.isoformat(),
            'valid_until':    report.valid_until.isoformat() if report.valid_until else None,
        }

    @staticmethod
    def _failure_summary(reason: str) -> dict:
        return {'success': False, 'reason': reason}