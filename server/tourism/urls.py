from django.urls import path
from . import views

app_name = 'tourism'

urlpatterns = [

    # ── Tourist endpoints ─────────────────────────────────────────
    path(
        'register/',
        views.RegistrationCreateView.as_view(),
        name='register',
    ),
    path(
        'my-registrations/',
        views.MyRegistrationsView.as_view(),
        name='my-registrations',
    ),
    path(
        'my-registrations/history/',
        views.MyRegistrationHistoryView.as_view(),
        name='my-registrations-history',
    ),
    path(
        'registrations/<str:permit_number>/',
        views.RegistrationDetailView.as_view(),
        name='registration-detail',
    ),
    path(
        'registrations/<str:permit_number>/qr/',
        views.RegenerateQRView.as_view(),
        name='regenerate-qr',
    ),

    # ── Ranger endpoints ──────────────────────────────────────────
    path(
        'ranger/scan/',
        views.RangerScanView.as_view(),
        name='ranger-scan',
    ),
    # manually check ---------------------
    path(
        'ranger/entry/<str:permit_number>/',
        views.RangerManualEntryView.as_view(),
        name='ranger-manual-entry',
    ),
    path(
        'ranger/exit/<str:permit_number>/',
        views.RangerManualExitView.as_view(),
        name='ranger-manual-exit',
    ),
    # dashboard --------------------------
    path(
        'ranger/dashboard/',
        views.RangerDashboardView.as_view(),
        name='ranger-dashboard',
    ),
    path(
        'ranger/registrations/',
        views.RangerRegistrationListView.as_view(),
        name='ranger-registrations',
    ),
]