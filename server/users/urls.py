from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import (
    RegistrationView,
    LocationView,
    ProfileView,
    TrekkingSessionListCreateView,
    TrekkingSessionDetailView,
    LocationLogCreateView,
    LocationLogListView,
    UserStatsView,
    TrekkingDashboardView,
    AdminTouristListView,
    AdminCurrentTrekView
)

urlpatterns = [
    # general
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('register/', RegistrationView.as_view(), name='register'),
    # users 
    path('profile/', ProfileView.as_view(), name='profile'),
    path('location/', LocationView.as_view(), name='location'),
    path('trekking-session/', TrekkingSessionListCreateView.as_view(), name='trekking-session'),
    path('trekking-session/<int:session_id>/', TrekkingSessionDetailView.as_view(), name='trekking-session-details'),
    path('location-log/', LocationLogCreateView.as_view(), name='location-log'),
    path('location-log/<int:session_id>/', LocationLogListView.as_view(), name='location-log-list'),
    path('user-stats/', UserStatsView.as_view(), name='user-stats'),
    # admin
    path('admin/user-stats/', UserStatsView.as_view(), name='admin-user-stats'),
    path('admin/trekking-dashboard/', TrekkingDashboardView.as_view(), name='trekking-dashboard'),
    path('admin/tourist-list/', AdminTouristListView.as_view(), name='admin-tourist-list'),
    path('admin/tourist-current-trek/<int:user_id>/', AdminCurrentTrekView.as_view(), name='admin-current-trek'),
]       