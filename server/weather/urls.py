from django.urls import path
from . import views

app_name = 'weather'

urlpatterns = [

    # ── Tourist-facing ────────────────────────────────────────────
    path(
        'routes/',
        views.AllRoutesWeatherView.as_view(),
        name='all-routes-weather',
    ),
    path(
        'routes/<int:route_id>/',
        views.RouteWeatherDetailView.as_view(),
        name='route-weather-detail',
    ),
    path(
        'routes/<int:route_id>/refresh/',
        views.RouteWeatherFreshView.as_view(),
        name='route-weather-refresh',
    ),
    path(
        'routes/<int:route_id>/history/',
        views.RouteWeatherHistoryView.as_view(),
        name='route-weather-history',
    ),
    path(
        'routes/<int:route_id>/alerts/',
        views.RouteAlertsView.as_view(),
        name='route-alerts',
    ),
    path(
        'alerts/',
        views.ActiveAlertsView.as_view(),
        name='active-alerts',
    ),

    # ── Ranger / Admin ────────────────────────────────────────────
    path(
        'admin/update/',
        views.TriggerWeatherUpdateView.as_view(),
        name='trigger-update',
    ),
    path(
        'admin/reports/',
        views.WeatherReportListView.as_view(),
        name='report-list',
    ),
]