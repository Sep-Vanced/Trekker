from django.urls import path
from .views import (
    CampsiteView,
    TrekkingRouteView,
    CheckpointView
)

urlpatterns = [
    # users
    path('campsite/', CampsiteView.as_view(), name='campsite'),
    path('trekroute/<int:campsite_id>/', TrekkingRouteView.as_view(), name='trekroute'),
    path('checkpoint/<int:route_id>/', CheckpointView.as_view(), name='checkpoint')
    #admin
]