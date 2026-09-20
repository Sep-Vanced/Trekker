from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Campsite, TrekkingRoute, Checkpoint
from .serializers import CampsiteSerializer, TrekkingRouteSerializer, CheckpointSerializer

# Create your views here.
class CampsiteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        campsite = Campsite.objects.all()
        serializer = CampsiteSerializer(campsite, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TrekkingRouteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, campsite_id):
        trekroute = TrekkingRoute.objects.filter(destination=campsite_id)
        serializer = TrekkingRouteSerializer(trekroute, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CheckpointView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, route_id):
        checkpoint = Checkpoint.objects.filter(route=route_id)
        serializer = CheckpointSerializer(checkpoint, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)