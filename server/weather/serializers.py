# weather/serializers.py

from rest_framework import serializers
from django.utils import timezone
from .models import WeatherReport, WeatherAlert
from navigation.models import TrekkingRoute
from django.utils import timezone

# ================================================================
# WEATHER REPORT SERIALIZERS
# ================================================================
# support serializers for weather reports ==================================================================================================
class WeatherReportSerializer(serializers.ModelSerializer):
    """
    Full weather report serializer.
    Used in history views and admin report list.
    """
    route_name        = serializers.CharField(source='route.name',       read_only=True)
    route_id          = serializers.IntegerField(source='route.id',      read_only=True)
    route_status      = serializers.CharField(source='route.status',     read_only=True)
    route_difficulty  = serializers.CharField(source='route.difficulty', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    is_expired        = serializers.SerializerMethodField()

    class Meta:
        model  = WeatherReport
        fields = [
            'id',
            'route_id',
            'route_name',
            'route_status',
            'route_difficulty',
            'condition',
            'condition_display',
            'temperature_c',
            'wind_speed_kph',
            'rainfall_mm',
            'humidity_pct',
            'is_safe_to_trek',
            'is_expired',
            'recorded_at',
            'valid_until',
            'source',
        ]

    def get_is_expired(self, obj) -> bool:
        """True if this report is past its valid_until time."""
        if not obj.valid_until:
            return False
        return timezone.now() > obj.valid_until


class WeatherReportMinimalSerializer(serializers.ModelSerializer):
    """
    Minimal weather report — embedded inside route list items.
    Keeps the all-routes response lightweight.
    """
    condition_display = serializers.CharField(
        source='get_condition_display', read_only=True
    )
    recorded_at = serializers.SerializerMethodField()

    class Meta:
        model  = WeatherReport
        fields = [
            'condition',
            'condition_display',
            'temperature_c',
            'wind_speed_kph',
            'rainfall_mm',
            'humidity_pct',
            'is_safe_to_trek',
            'recorded_at',
        ]

    def get_recorded_at(self, obj):
        return timezone.localtime(obj.recorded_at).isoformat()

# ================================================================
# WEATHER ALERT SERIALIZERS
# ================================================================

class WeatherAlertSerializer(serializers.ModelSerializer):
    """
    Full weather alert serializer.
    Used in active alerts list and per-route alert views.
    """
    route_id          = serializers.IntegerField(source='route.id',   read_only=True)
    route_name        = serializers.CharField(source='route.name',    read_only=True)
    route_status      = serializers.CharField(source='route.status',  read_only=True)
    alert_type_display= serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display  = serializers.CharField(source='get_severity_display',   read_only=True)
    is_expired        = serializers.SerializerMethodField()
    expires_in_minutes= serializers.SerializerMethodField()

    class Meta:
        model  = WeatherAlert
        fields = [
            'id',
            'route_id',
            'route_name',
            'route_status',
            'alert_type',
            'alert_type_display',
            'severity',
            'severity_display',
            'title',
            'message',
            'is_active',
            'is_expired',
            'expires_in_minutes',
            'created_at',
            'expires_at',
        ]

    def get_is_expired(self, obj) -> bool:
        """True if alert has passed its expires_at time."""
        if not obj.expires_at:
            return False
        return timezone.now() > obj.expires_at

    def get_expires_in_minutes(self, obj) -> int | None:
        """
        Returns how many minutes until the alert expires.
        Returns None if no expiry set.
        Returns 0 if already expired.
        """
        if not obj.expires_at:
            return None
        delta = obj.expires_at - timezone.now()
        return max(0, int(delta.total_seconds() // 60))


class WeatherAlertMinimalSerializer(serializers.ModelSerializer):
    """
    Minimal alert — embedded inside route weather status responses.
    """
    alert_type_display = serializers.CharField(
        source='get_alert_type_display', read_only=True
    )
    severity_display   = serializers.CharField(
        source='get_severity_display', read_only=True
    )

    class Meta:
        model  = WeatherAlert
        fields = [
            'id',
            'alert_type',
            'alert_type_display',
            'severity',
            'severity_display',
            'title',
            'message',
            'expires_at',
        ]


# ================================================================
# ROUTE WEATHER STATUS SERIALIZER
# Used by RouteWeatherDetailView and get_current_status()
# ================================================================
# serializer for view =============================================================================================================================

class RouteWeatherStatusSerializer(serializers.Serializer):
    """
    Serializes the full weather status for a single route.
    Shape matches WeatherService.get_current_status() output.

    Used in:
        - RouteWeatherDetailView  GET /api/weather/routes/<id>/
        - RouteWeatherFreshView   GET /api/weather/routes/<id>/refresh/
    """
    route         = serializers.CharField()
    status        = serializers.ChoiceField(
        choices=['open', 'caution', 'closed']
    )
    report        = WeatherReportMinimalSerializer(allow_null=True)
    alerts        = WeatherAlertMinimalSerializer(many=True)
    alert_count   = serializers.SerializerMethodField()
    has_danger    = serializers.SerializerMethodField()

    def get_alert_count(self, obj) -> int:
        return len(obj.get('alerts', []))

    def get_has_danger(self, obj) -> bool:
        """True if any alert is severity danger or extreme."""
        return any(
            a.get('severity') in ('danger', 'extreme')
            for a in obj.get('alerts', [])
        )

# refresh serializer
        
class RouteWeatherFreshSerializer(serializers.Serializer):
    route    = serializers.CharField()
    is_safe  = serializers.BooleanField()
    profile  = serializers.CharField()
    weather  = serializers.DictField()
    reasons  = serializers.ListField(child=serializers.CharField())
    alerts   = WeatherAlertMinimalSerializer(many=True)

# ====================================================================================================================
# ================================================================
# ALL ROUTES WEATHER LIST SERIALIZER
# Used by AllRoutesWeatherView
# ================================================================

class RouteWeatherSummarySerializer(serializers.Serializer):
    """
    Lightweight per-route weather summary for the home screen list.
    One item per active route — shows safe/caution/closed badge.

    Used in:
        - AllRoutesWeatherView  GET /api/weather/routes/
    """
    route_id      = serializers.IntegerField()
    route_name    = serializers.CharField()
    difficulty    = serializers.CharField()
    status        = serializers.CharField()
    is_safe       = serializers.BooleanField()
    condition     = serializers.CharField()
    condition_display = serializers.SerializerMethodField()
    temperature_c = serializers.CharField(allow_null=True)
    rainfall_mm   = serializers.CharField(allow_null=True)
    alert_count   = serializers.IntegerField()
    last_updated  = serializers.CharField(allow_null=True)

    def get_condition_display(self, obj) -> str:
        """Maps condition key to human-readable label."""
        condition_map = {
            'clear':       'Clear',
            'cloudy':      'Cloudy',
            'rain':        'Rain',
            'heavy_rain':  'Heavy Rain',
            'storm':       'Storm',
            'flood_risk':  'Flood Risk',
            'strong_wind': 'Strong Wind',
            'fog':         'Fog',
            'unknown':     'Unknown',
        }
        return condition_map.get(obj.get('condition', 'unknown'), 'Unknown')


class WeatherSummarySerializer(serializers.Serializer):
    """
    Global weather summary block embedded in AllRoutesWeatherView.
    Shows the current overall lake conditions at a glance.
    """
    condition      = serializers.CharField()
    temperature_c  = serializers.CharField(allow_null=True)
    rainfall_mm    = serializers.CharField(allow_null=True)
    wind_speed_kph = serializers.CharField(allow_null=True)
    last_updated   = serializers.CharField(allow_null=True)


class AllRoutesWeatherSerializer(serializers.Serializer):
    """
    Top-level serializer for AllRoutesWeatherView response.
    """
    count           = serializers.IntegerField()
    weather_summary = WeatherSummarySerializer()
    results         = RouteWeatherSummarySerializer(many=True)


# ================================================================
# WEATHER HISTORY SERIALIZER
# Used by RouteWeatherHistoryView
# ================================================================

class WeatherHistorySerializer(serializers.Serializer):
    """
    Top-level serializer for weather history response.
    Wraps a list of WeatherReportSerializer items with route info.

    Used in:
        - RouteWeatherHistoryView  GET /api/weather/routes/<id>/history/
    """
    route_id   = serializers.IntegerField()
    route_name = serializers.CharField()
    count      = serializers.IntegerField()
    history    = WeatherReportSerializer(many=True)


# ================================================================
# ACTIVE ALERTS LIST SERIALIZER
# Used by ActiveAlertsView
# ================================================================

class ActiveAlertsResponseSerializer(serializers.Serializer):
    """
    Top-level serializer for the global active alerts endpoint.
    Used for the home screen alert banner.

    Used in:
        - ActiveAlertsView  GET /api/weather/alerts/
    """
    count       = serializers.IntegerField()
    has_extreme = serializers.BooleanField()
    alerts      = WeatherAlertSerializer(many=True)


# ================================================================
# ROUTE ALERTS SERIALIZER
# Used by RouteAlertsView
# ================================================================

class RouteAlertsResponseSerializer(serializers.Serializer):
    """
    Top-level serializer for per-route active alerts.

    Used in:
        - RouteAlertsView  GET /api/weather/routes/<id>/alerts/
    """
    route_id    = serializers.IntegerField()
    route_name  = serializers.CharField()
    count       = serializers.IntegerField()
    has_extreme = serializers.SerializerMethodField()
    alerts      = WeatherAlertSerializer(many=True)

    def get_has_extreme(self, obj) -> bool:
        return any(
            a.get('severity') in ('danger', 'extreme')
            for a in obj.get('alerts', [])
        )


# ================================================================
# ADMIN / RANGER SERIALIZERS
# ================================================================

class TriggerUpdateResponseSerializer(serializers.Serializer):
    """
    Response shape for TriggerWeatherUpdateView.

    Used in:
        - TriggerWeatherUpdateView  POST /api/weather/admin/update/
    """
    success         = serializers.BooleanField()
    condition       = serializers.CharField(required=False)
    temperature_c   = serializers.FloatField(required=False)
    rainfall_mm     = serializers.FloatField(required=False)
    wind_speed_kph  = serializers.FloatField(required=False)
    routes_updated  = serializers.IntegerField(required=False)
    routes_closed   = serializers.IntegerField(required=False)
    routes_caution  = serializers.IntegerField(required=False)
    alerts_created  = serializers.IntegerField(required=False)
    reason          = serializers.CharField(required=False)  # on failure


class WeatherReportAdminListSerializer(serializers.Serializer):
    """
    Paginated report list for ranger admin view.

    Used in:
        - WeatherReportListView  GET /api/weather/admin/reports/
    """
    count     = serializers.IntegerField()
    page      = serializers.IntegerField()
    page_size = serializers.IntegerField()
    pages     = serializers.IntegerField()
    results   = WeatherReportSerializer(many=True)