# tourism/views.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.permissions import BasePermission
from rest_framework.parsers import JSONParser
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .services import RegistrationService
from .models import TouristRegistration
from .serializers import (
    TouristRegistrationSerializer,
    RegistrationCreateSerializer,
    RangerScanSerializer,
    RegistrationDetailSerializer,
    RangerDashboardSerializer,
)
from navigation.models import TrekkingRoute

import logging

logger = logging.getLogger(__name__)

service = RegistrationService()


# ================================================================
# PERMISSIONS
# ================================================================


class IsRanger(BasePermission):
    message = "Only rangers or staff can perform this action."
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Check staff/superuser first
        if user.is_staff or user.is_superuser:
            return True
        # Check role from UserProfile
        profile = getattr(user, "userprofile", None)
        return profile and profile.role == "Park Ranger"

# ================================================================
# TOURIST VIEWS
# ================================================================

class RegistrationCreateView(APIView):
    """
    POST /api/tourism/register/

    Tourist registers for a trekking route before entering.
    Validates the route, group size, and timing.
    Returns permit number and QR code on success.

    Request body:
        {
            "route_id":      int,
            "planned_entry": "2025-07-15T06:00:00+08:00",
            "planned_exit":  "2025-07-15T14:00:00+08:00",
            "group_size":    3,
            "notes":         "One member has asthma."  (optional)
        }

    Response 201:
        {
            "success":       true,
            "permit_number": "TRK-A3F9B12C",
            "qr_code":       "<base64 PNG>",
            "message":       "Registration successful!...",
            "registration":  { ...registration fields... }
        }

    Response 400:
        {
            "success": false,
            "message": "Route is currently closed..."
        }
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [JSONParser]

    def post(self, request):
        serializer = RegistrationCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors':  serializer.errors,
                    'message': 'Invalid registration data. Please check your input.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data  = serializer.validated_data
        route = get_object_or_404(TrekkingRoute, id=data['route_id'], is_active=True)

        result = service.register(
            profile       = request.user.profile,
            route         = route,
            planned_entry = data['planned_entry'],
            planned_exit  = data['planned_exit'],
            group_size    = data.get('group_size', 1),
            notes         = data.get('notes', ''),
        )

        if not result['success']:
            return Response(
                {'success': False, 'message': result['message']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration_data = RegistrationDetailSerializer(
            result['registration']
        ).data

        logger.info(
            f"[RegistrationCreateView] New permit: "
            f"{result['permit_number']} by {request.user}"
        )

        return Response(
            {
                'success':       True,
                'permit_number': result['permit_number'],
                'qr_code':       result['qr_code'],
                'message':       result['message'],
                'registration':  registration_data,
            },
            status=status.HTTP_201_CREATED,
        )


class MyRegistrationsView(APIView):
    """
    GET /api/tourism/my-registrations/

    Returns all active (registered/inside) registrations
    for the logged-in tourist.

    Response 200:
        {
            "count": 1,
            "results": [ ...registration objects... ]
        }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registrations = service.get_my_registrations(request.user.profile)
        serializer    = TouristRegistrationSerializer(
            registrations, many=True
        )
        return Response(
            {
                'count':   len(registrations),
                'results': serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class MyRegistrationHistoryView(APIView):
    """
    GET /api/tourism/my-registrations/history/

    Returns full registration history for the logged-in tourist.
    Includes all statuses: registered, inside, exited, overdue.

    Response 200:
        {
            "count": 12,
            "results": [ ...registration objects... ]
        }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registrations = service.get_my_history(request.user.profile)
        serializer    = TouristRegistrationSerializer(
            registrations, many=True
        )
        return Response(
            {
                'count':   len(registrations),
                'results': serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RegistrationDetailView(APIView):
    """
    GET /api/tourism/registrations/<permit_number>/

    Returns detailed info for a specific registration.
    Tourist can only view their own permits.

    Response 200: { ...full registration detail... }
    Response 403: { "message": "Not your permit." }
    Response 404: { "message": "Permit not found." }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, permit_number: str):
        registration = TouristRegistration.objects.select_related(
            'profile', 'route'
        ).filter(permit_number=permit_number).first()

        if not registration:
            return Response(
                {'message': f'Permit #{permit_number} not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Tourist can only see their own; rangers can see all
        is_ranger = request.user.is_staff or request.user.is_superuser
        if not is_ranger and registration.profile != request.user.profile:
            return Response(
                {'message': 'You are not authorized to view this permit.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RegistrationDetailSerializer(registration)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegenerateQRView(APIView):
    """
    POST /api/tourism/registrations/<permit_number>/qr/

    Re-generates the QR code for a registration.
    Only the permit owner can regenerate.
    Useful when the tourist's phone needs a fresh QR display.

    Response 200:
        {
            "success":  true,
            "qr_code":  "<base64 PNG>",
            "message":  "QR code regenerated successfully."
        }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, permit_number: str):
        result = service.regenerate_qr(
            permit_number = permit_number,
            profile       = request.user.profile,
        )

        http_status = (
            status.HTTP_200_OK
            if result['success']
            else status.HTTP_400_BAD_REQUEST
        )
        return Response(result, status=http_status)


# ================================================================
# RANGER VIEWS
# ================================================================

class RangerScanView(APIView):
    """
    POST /api/tourism/ranger/scan/

    Ranger scans a tourist's QR code at the entry or exit gate.
    Decodes the QR payload and confirms entry or exit.

    Request body:
        {
            "qr_payload": "SMARTTREK|TRK-A3F9B12C|1|42|2025-07-15T14:00:00",
            "action":     "entry"   or   "exit"
        }

    Response 200 (entry success):
        {
            "success":      true,
            "tourist_name": "Juan dela Cruz",
            "route_name":   "Aglao Lahar Trail → Camp Aglao Riverside",
            "group_size":   3,
            "planned_exit": "2025-07-15T14:00:00+08:00",
            "message":      "Entry confirmed for..."
        }

    Response 400:
        {
            "success": false,
            "message": "Already marked as inside."
        }
    """
    permission_classes = [IsRanger]
    parser_classes     = [JSONParser]

    def post(self, request):
        serializer = RangerScanSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors':  serializer.errors,
                    'message': 'Invalid scan data.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data   = serializer.validated_data
        result = service.scan_qr(
            qr_payload = data['qr_payload'],
            action     = data['action'],
        )

        http_status = (
            status.HTTP_200_OK
            if result['success']
            else status.HTTP_400_BAD_REQUEST
        )

        logger.info(
            f"[RangerScanView] {data['action'].upper()} scan "
            f"by ranger {request.user}: {result.get('message', '')}"
        )

        return Response(result, status=http_status)


class RangerManualEntryView(APIView):
    """
    POST /api/tourism/ranger/entry/<permit_number>/

    Manual entry confirmation by permit number
    (for when QR scanning fails or tourist lost phone).

    Response 200: { "success": true, "message": "Entry confirmed..." }
    Response 400: { "success": false, "message": "..." }
    """
    permission_classes = [IsRanger]

    def post(self, request, permit_number: str):
        result = service.confirm_entry(permit_number)
        http_status = (
            status.HTTP_200_OK
            if result['success']
            else status.HTTP_400_BAD_REQUEST
        )
        logger.info(
            f"[RangerManualEntryView] Manual entry for {permit_number} "
            f"by ranger {request.user}"
        )
        return Response(result, status=http_status)


class RangerManualExitView(APIView):
    """
    POST /api/tourism/ranger/exit/<permit_number>/

    Manual exit confirmation by permit number.

    Response 200:
        {
            "success":      true,
            "tourist_name": "Juan dela Cruz",
            "duration":     "4h 30m",
            "message":      "Exit confirmed..."
        }
    """
    permission_classes = [IsRanger]

    def post(self, request, permit_number: str):
        result = service.confirm_exit(permit_number)
        http_status = (
            status.HTTP_200_OK
            if result['success']
            else status.HTTP_400_BAD_REQUEST
        )
        logger.info(
            f"[RangerManualExitView] Manual exit for {permit_number} "
            f"by ranger {request.user}"
        )
        return Response(result, status=http_status)


class RangerDashboardView(APIView):
    """
    GET /api/tourism/ranger/dashboard/

    Returns live dashboard data for the ranger:
    - Who is currently inside
    - Who is overdue
    - Total counts

    Cached for 60 seconds to reduce DB load on polling.

    Response 200:
        {
            "total_inside":     5,
            "total_overdue":    1,
            "currently_inside": [ ...registration objects... ],
            "overdue":          [ ...registration objects... ]
        }
    """
    permission_classes = [IsRanger]

    @method_decorator(cache_page(60))
    def get(self, request):
        data = service.get_dashboard_data()

        inside_serialized  = RegistrationDetailSerializer(
            data['currently_inside'], many=True
        ).data
        overdue_serialized = RegistrationDetailSerializer(
            data['overdue'], many=True
        ).data

        return Response(
            {
                'total_inside':     data['total_inside'],
                'total_overdue':    data['total_overdue'],
                'currently_inside': inside_serialized,
                'overdue':          overdue_serialized,
            },
            status=status.HTTP_200_OK,
        )


class RangerRegistrationListView(APIView):
    """
    GET /api/tourism/ranger/registrations/

    Paginated list of all registrations for the ranger to browse.
    Supports filtering by status and route.

    Query params:
        ?status=inside          filter by status
        ?route_id=3             filter by route
        ?date=2025-07-15        filter by planned entry date

    Response 200:
        {
            "count":   42,
            "results": [ ...registration objects... ]
        }
    """
    permission_classes = [IsRanger]

    def get(self, request):
        qs = TouristRegistration.objects.select_related(
            'profile', 'route'
        ).order_by('-registered_at')

        # ── Filters ──────────────────────────────────────────────
        status_filter   = request.query_params.get('status')
        route_id_filter = request.query_params.get('route_id')
        date_filter     = request.query_params.get('date')

        if status_filter:
            valid_statuses = ['registered', 'inside', 'exited', 'overdue']
            if status_filter not in valid_statuses:
                return Response(
                    {
                        'message': f"Invalid status. Choose from: "
                                   f"{', '.join(valid_statuses)}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(status=status_filter)

        if route_id_filter:
            qs = qs.filter(route__id=route_id_filter)

        if date_filter:
            try:
                from datetime import datetime
                date_obj = datetime.strptime(date_filter, '%Y-%m-%d').date()
                qs = qs.filter(planned_entry__date=date_obj)
            except ValueError:
                return Response(
                    {'message': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # ── Simple pagination ─────────────────────────────────────
        page      = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start     = (page - 1) * page_size
        end       = start + page_size

        total      = qs.count()
        page_items = qs[start:end]

        serializer = RegistrationDetailSerializer(page_items, many=True)

        return Response(
            {
                'count':     total,
                'page':      page,
                'page_size': page_size,
                'pages':     (total + page_size - 1) // page_size,
                'results':   serializer.data,
            },
            status=status.HTTP_200_OK,
        )
