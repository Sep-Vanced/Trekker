from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .selectors import UserStatsSelectors
from django.contrib.auth.models import User
from .models import (
    UserProfile,
    TrekkingSession,
    LocationLog
)
from .serializers import (
    RegistrationSerializer,
    UserProfileSerializer,
    TrekkingSessionSerializer,
    LocationLogSerializer,
    UserStatsSerializer,
    TrekkingDashboardSerializer,
    CurrentTrekSerializer
)
from .mapper import (
    UserProfileMapper
)
from navigation.models import (
    TrekkingRoute
)

# Create your views here
# USER =========================================================================
# user registration 
class RegistrationView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User profile created successfully"}, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(status=status.HTTP_400_BAD_REQUEST)

# get user profile
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, request):
        return get_object_or_404(UserProfile, user=request.user)
    
    def get(self, request):
        profile = self.get_object(request)
        serializer = UserProfileSerializer(profile)
        data = UserProfileMapper.map_user_profile(serializer.data)
        return Response(data, status=status.HTTP_200_OK)
    
    def put(self, request):
        profile = self.get_object(request)
        serializer = RegistrationSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Update Successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# get and update location 
class LocationView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, request):
        return get_object_or_404(UserProfile, user=request.user)
    
    def put(self, request):
        profile = self.get_object(request)
        try:
            last_known_latitude = request.data.get('last_known_latitude')
            last_known_longitude = request.data.get('last_known_longitude')
            last_location_update = request.data.get('last_location_update')

            profile.last_known_latitude  = last_known_latitude
            profile.last_known_longitude = last_known_longitude
            profile.last_location_update = last_location_update
            profile.save()
            return Response({"message": "Location updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request):
        profile = self.get_object(request)
        return Response(
            {"last_known_latitude": profile.last_known_latitude, 
                "last_known_longitude": profile.last_known_longitude, 
                "last_location_update": profile.last_location_update
            },status=status.HTTP_200_OK)
        
# trekking session and location log ================================================================
# start the trekking insert the value, and get base on the user
class TrekkingSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        sessions = TrekkingSession.objects.filter(profile=profile)
        serializer = TrekkingSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK) 
    
    def post(self, request):
        route_id = request.data.get('route_id')
        if not route_id:
            return Response({"message": "route_id is required"}, status=400)
        profile = get_object_or_404(UserProfile, user=request.user)
        route = get_object_or_404(TrekkingRoute, id=route_id)
        session = TrekkingSession.objects.create(
            profile=profile,
            route=route
        )
        return Response({
            "message": "Trekking session created successfully",
            "session_id": session.id
        }, status=status.HTTP_201_CREATED)

# user trekking session update ended at =========================================================
class TrekkingSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, session_id):
        return get_object_or_404(
            TrekkingSession,
            id=session_id,
            profile__user=request.user
        )
    
    def get(self, request, session_id):
        session = self.get_object(request, session_id)
        serializer = TrekkingSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, session_id):
        session = self.get_object(request,session_id)
        try:
            session.ended_at = request.data.get('ended_at')
            session.save()
            return Response({"message": "Trekking session updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# location log for the trekking session ===========================================================
class LocationLogCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LocationLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Location log recorded successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# gt the location log base on the trekking session id=========================================================== 
class LocationLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(TrekkingSession, id=session_id)
        logs = LocationLog.objects.filter(session=session)
        serializer = LocationLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

# user dashboard ============================================================================================
class UserStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        raw = UserStatsSelectors.get_user_stats()

        # Reshape for the nested serializer
        payload = {
            'total_users': raw['total_users'],
            'users_per_role': [
                {'role': role, 'count': count}
                for role, count in raw['users_per_role'].items()
            ]
        }

        serializer = UserStatsSerializer(payload)
        return Response(serializer.data)
    
class TrekkingDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = UserStatsSelectors.get_trekking_dashboard_stats()
        serializer = TrekkingDashboardSerializer(stats)
        return Response(serializer.data)
    
    
# ADMIN PANNEL ===========================================================================================
class AdminTouristListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = UserProfile.objects.filter(user__is_staff=False)
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)
    

class AdminCurrentTrekView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        profile = get_object_or_404(UserProfile, user__id=user_id)

        session = TrekkingSession.objects.filter(
            profile=profile,
            is_active=True
        ).select_related('route').prefetch_related('locations').first()

        if not session:
            return Response({"message": "No active trekking session"}, status=404)

        serializer = CurrentTrekSerializer(session)
        return Response(serializer.data)