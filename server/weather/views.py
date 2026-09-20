# weather/views.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.shortcuts import get_object_or_404

from navigation.models import TrekkingRoute
from .services import WeatherService
from .models import WeatherReport, WeatherAlert
from .serializers import (
    RouteWeatherStatusSerializer,
    RouteWeatherFreshSerializer,
    AllRoutesWeatherSerializer,
    WeatherHistorySerializer,
    ActiveAlertsResponseSerializer,
    RouteAlertsResponseSerializer,
    TriggerUpdateResponseSerializer,
    WeatherReportAdminListSerializer
)

import logging

logger = logging.getLogger(__name__)

service = WeatherService()


# ================================================================
# PERMISSIONS
# ================================================================

class IsRanger(IsAdminUser):
    """Staff/ranger only endpoints."""
    message = "Only rangers or staff can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


# ================================================================
# TOURIST-FACING VIEWS
# ================================================================

class RouteWeatherDetailView(APIView):
    """
    GET /api/weather/routes/<route_id>/

    Returns the latest cached weather status for a specific route.
    No new API call — reads from DB only.
    Best for frequent polling from the mobile app (cached 60s).

    Response 200:
        {
            "route":   "Aglao Lahar Trail → Camp Aglao Riverside",
            "status":  "caution",
            "report": {
                "condition":       "rain",
                "temperature_c":   "27.5",
                "wind_speed_kph":  "18.0",
                "rainfall_mm":     "4.2",
                "humidity_pct":    88,
                "is_safe_to_trek": false,
                "recorded_at":     "2025-07-15T06:00:00+08:00",
                "valid_until":     "2025-07-15T07:00:00+08:00"
            },
            "alerts": [
                {
                    "type":     "river_crossing",
                    "severity": "warning",
                    "title":    "River Crossing Risk — ...",
                    "message":  "Rainfall of 4.2mm/hr detected..."
                }
            ]
        }

    Response 404:
        { "message": "Route not found." }
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60))  # cache for 60 seconds
    def get(self, request, route_id):
        route      = get_object_or_404(TrekkingRoute, id=route_id, is_active=True)
        data       = service.get_current_status(route)
        serializer = RouteWeatherStatusSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RouteWeatherFreshView(APIView):
    """
    GET /api/weather/routes/<route_id>/refresh/

    Forces a fresh API call to OpenWeatherMap for a specific route.
    Use sparingly — triggers a live OWM API call.
    Good for when user taps a "Refresh" button manually.

    Response 200:
        {
            "route":    "...",
            "is_safe":  false,
            "profile":  "river_crossing",
            "weather":  { ... },
            "reasons":  ["Heavy rainfall 16.0mm/hr — trail unsafe."],
            "alerts":   [ ... ]
        }

    Response 503:
        { "message": "Weather API is currently unavailable. Try again later." }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, route_id):
        route  = get_object_or_404(TrekkingRoute, id=route_id, is_active=True)
        result = service.run_for_route(route)

        if 'error' in result:
            return Response(
                {'message': 'Weather API unavailable. Try again later.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        serializer = RouteWeatherFreshSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AllRoutesWeatherView(APIView):
    """
    GET /api/weather/routes/

    Returns current weather status for ALL active routes.
    Useful for the home screen route list — shows safe/caution/closed
    badge on each route card without needing per-route calls.
    Cached for 2 minutes.

    Query params:
        ?status=caution     filter by route status (open/caution/closed)
        ?safe_only=true     only return routes safe to trek

    Response 200:
        {
            "count": 22,
            "weather_summary": {
                "condition":     "rain",
                "temperature_c": "27.5",
                "rainfall_mm":   "4.2"
            },
            "results": [
                {
                    "route_id":   1,
                    "route_name": "Aglao Lahar Trail...",
                    "status":     "caution",
                    "is_safe":    false,
                    "condition":  "rain",
                    "alert_count": 2
                },
                ...
            ]
        }
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(120))
    def get(self, request):
        routes      = TrekkingRoute.objects.filter(is_active=True)
        status_filter = request.query_params.get('status')
        safe_only     = request.query_params.get('safe_only', '').lower() == 'true'

        if status_filter:
            valid = ['open', 'caution', 'closed']
            if status_filter not in valid:
                return Response(
                    {'message': f"Invalid status. Choose from: {', '.join(valid)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            routes = routes.filter(status=status_filter)

        # Build summary list from latest DB reports
        results = []
        for route in routes:
            latest_report = (
                WeatherReport.objects
                .filter(route=route)
                .order_by('-recorded_at')
                .first()
            )
            alert_count = WeatherAlert.objects.filter(
                route=route, is_active=True
            ).count()

            is_safe = latest_report.is_safe_to_trek if latest_report else True

            if safe_only and not is_safe:
                continue

            results.append({
                'route_id':    route.id,
                'route_name':  route.name,
                'difficulty':  route.difficulty,
                'status':      route.status,
                'is_safe':     is_safe,
                'condition':   latest_report.condition if latest_report else 'unknown',
                'temperature_c': str(latest_report.temperature_c) if latest_report else None,
                'rainfall_mm': str(latest_report.rainfall_mm) if latest_report else None,
                'alert_count': alert_count,
                'last_updated': latest_report.recorded_at.isoformat() if latest_report else None,
            })

        # Global weather summary from any latest report
        any_report = (
            WeatherReport.objects
            .order_by('-recorded_at')
            .first()
        )
        weather_summary = {
            'condition':     any_report.condition if any_report else 'unknown',
            'temperature_c': str(any_report.temperature_c) if any_report else None,
            'rainfall_mm':   str(any_report.rainfall_mm) if any_report else None,
            'wind_speed_kph':str(any_report.wind_speed_kph) if any_report else None,
            'last_updated':  any_report.recorded_at.isoformat() if any_report else None,
        }

        serializer = AllRoutesWeatherSerializer({
            'count':           len(results),
            'weather_summary': weather_summary,
            'results':         results,
        })
        return Response(serializer.data, status=status.HTTP_200_OK)


class RouteWeatherHistoryView(APIView):
    """
    GET /api/weather/routes/<route_id>/history/

    Returns the last N weather reports for a route.
    Useful for a weather trend chart in the route detail screen.
    Cached for 5 minutes.

    Query params:
        ?limit=24    number of records to return (default 24, max 168)

    Response 200:
        {
            "route_id":   1,
            "route_name": "...",
            "count":      24,
            "history": [
                {
                    "condition":       "clear",
                    "temperature_c":   "29.0",
                    "rainfall_mm":     "0.0",
                    "wind_speed_kph":  "12.0",
                    "humidity_pct":    75,
                    "is_safe_to_trek": true,
                    "recorded_at":     "2025-07-15T05:00:00+08:00"
                },
                ...
            ]
        }
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(300))
    def get(self, request, route_id):
        route = get_object_or_404(TrekkingRoute, id=route_id, is_active=True)

        try:
            limit = int(request.query_params.get('limit', 24))
            limit = max(1, min(limit, 168))  # clamp between 1 and 168 (7 days)
        except ValueError:
            limit = 24

        reports = WeatherReport.objects.filter(route=route).order_by('-recorded_at')[:limit]
        serializer = WeatherHistorySerializer({
            'route_id':   route.id,
            'route_name': route.name,
            'count':      len(reports),
            'history':    reports,
        })
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActiveAlertsView(APIView):
    """
    GET /api/weather/alerts/

    Returns all currently active weather alerts across all routes.
    Used for a global alert banner on the app home screen.
    Cached for 60 seconds.

    Query params:
        ?severity=danger    filter by severity (info/warning/danger/extreme)
        ?route_id=3         filter by specific route

    Response 200:
        {
            "count": 3,
            "has_extreme": false,
            "alerts": [
                {
                    "id":         12,
                    "route_id":   3,
                    "route_name": "...",
                    "alert_type": "river_crossing",
                    "severity":   "warning",
                    "title":      "River Crossing Risk — ...",
                    "message":    "...",
                    "created_at": "2025-07-15T06:00:00+08:00",
                    "expires_at": "2025-07-15T09:00:00+08:00"
                }
            ]
        }
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60))
    def get(self, request):
        qs = WeatherAlert.objects.filter(
            is_active=True
        ).select_related('route').order_by('-created_at')

        # ── Filters ──────────────────────────────────────────────
        severity_filter = request.query_params.get('severity')
        route_id_filter = request.query_params.get('route_id')

        if severity_filter:
            valid = ['info', 'warning', 'danger', 'extreme']
            if severity_filter not in valid:
                return Response(
                    {'message': f"Invalid severity. Choose from: {', '.join(valid)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(severity=severity_filter)

        if route_id_filter:
            qs = qs.filter(route__id=route_id_filter)

        alerts     = list(qs)
        serializer = ActiveAlertsResponseSerializer({
            'count':       len(alerts),
            'has_extreme': any(a.severity == 'extreme' for a in alerts),
            'alerts':      alerts,
        })
        return Response(serializer.data, status=status.HTTP_200_OK)



class RouteAlertsView(APIView):
    """
    GET /api/weather/routes/<route_id>/alerts/

    Returns all active alerts for a specific route.
    Shown on the route detail screen as warning banners.

    Response 200:
        {
            "route_id":   1,
            "route_name": "...",
            "count":      2,
            "alerts":     [ ... ]
        }
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60))
    def get(self, request, route_id):
        route  = get_object_or_404(TrekkingRoute, id=route_id, is_active=True)
        alerts = WeatherAlert.objects.filter(route=route, is_active=True).order_by('-created_at')
        serializer = RouteAlertsResponseSerializer({
            'route_id':   route.id,
            'route_name': route.name,
            'count':      alerts.count(),
            'alerts':     list(alerts),
        })
        return Response(serializer.data, status=status.HTTP_200_OK)


# ================================================================
# RANGER / ADMIN VIEWS
# ================================================================

class TriggerWeatherUpdateView(APIView):
    """
    POST /api/weather/admin/update/

    Ranger manually triggers a full weather update
    without waiting for the hourly Celery task.
    Staff only.

    Response 200:
        {
            "success":        true,
            "condition":      "rain",
            "temperature_c":  27.5,
            "rainfall_mm":    4.2,
            "wind_speed_kph": 18.0,
            "routes_updated": 22,
            "routes_closed":  5,
            "routes_caution": 8,
            "alerts_created": 14
        }

    Response 503:
        { "success": false, "reason": "API fetch failed" }
    """
    permission_classes = [IsRanger]

    def post(self, request):
        summary    = service.run_update()
        serializer = TriggerUpdateResponseSerializer(summary)
        http_status = (
            status.HTTP_200_OK
            if summary.get('success')
            else status.HTTP_503_SERVICE_UNAVAILABLE
        )
        return Response(serializer.data, status=http_status)


class WeatherReportListView(APIView):
    """
    GET /api/weather/admin/reports/

    Paginated list of all weather reports across all routes.
    For the ranger weather history dashboard.
    Staff only.

    Query params:
        ?route_id=3         filter by route
        ?condition=rain     filter by condition
        ?safe_only=true     only unsafe reports
        ?page=1
        ?page_size=50

    Response 200:
        {
            "count":   200,
            "page":    1,
            "pages":   4,
            "results": [ ... ]
        }
    """
    permission_classes = [IsRanger]

    def get(self, request):
        qs = WeatherReport.objects.select_related(
            'route'
        ).order_by('-recorded_at')

        # ── Filters ──────────────────────────────────────────────
        route_id  = request.query_params.get('route_id')
        condition = request.query_params.get('condition')
        safe_only = request.query_params.get('safe_only', '').lower() == 'true'

        if route_id:
            qs = qs.filter(route__id=route_id)
        if condition:
            qs = qs.filter(condition=condition)
        if safe_only:
            qs = qs.filter(is_safe_to_trek=False)

        # ── Pagination ────────────────────────────────────────────
        page      = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        start     = (page - 1) * page_size
        end       = start + page_size

        total      = qs.count()
        page_items = qs[start:end]
        serializer = WeatherReportAdminListSerializer({
            'count':     total,
            'page':      page,
            'page_size': page_size,
            'pages':     (total + page_size - 1) // page_size,
            'results':   list(page_items),
        })
        return Response(serializer.data, status=status.HTTP_200_OK)



