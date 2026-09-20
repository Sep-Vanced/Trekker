# tourism/services.py

import uuid
import qrcode
import io
import base64
import logging

from django.utils import timezone
from django.db import transaction
from datetime import timedelta

from users.models import UserProfile
from navigation.models import TrekkingRoute
from .models import TouristRegistration

logger = logging.getLogger(__name__)


# ================================================================
# CONFIG
# ================================================================

class RegistrationConfig:
    """Centralized config for registration rules."""

    # How many hours after planned_exit before marking overdue
    OVERDUE_GRACE_HOURS = 2

    # Max group size allowed per registration
    MAX_GROUP_SIZE = 30

    # How far in advance a registration can be made (days)
    MAX_ADVANCE_BOOKING_DAYS = 30

    # Minimum hours between planned_entry and planned_exit
    MIN_TREK_HOURS = 1

    # QR code version
    QR_VERSION = 1
    QR_BOX_SIZE = 10
    QR_BORDER = 4


# ================================================================
# PERMIT GENERATOR
# ================================================================

class PermitGenerator:
    """
    Handles permit number and QR code generation.
    All methods are static.
    """

    @staticmethod
    def generate_permit_number() -> str:
        """
        Generates a unique human-readable permit number.
        Format: TRK-XXXXXXXX (e.g. TRK-A3F9B12C)
        """
        return f"TRK-{uuid.uuid4().hex[:8].upper()}"

    @staticmethod
    def generate_qr_code(registration: TouristRegistration) -> str:
        """
        Generates a QR code for the registration permit.
        Encodes key info so ranger can scan offline.

        QR content:
            SMARTTREK|<permit_number>|<route_id>|<profile_id>|<planned_exit_iso>

        Returns base64-encoded PNG string for embedding in API response.
        """
        qr_content = (
            f"SMARTTREK"
            f"|{registration.permit_number}"
            f"|{registration.route.id}"
            f"|{registration.profile.id}"
            f"|{registration.planned_exit.isoformat()}"
        )

        qr = qrcode.QRCode(
            version           = RegistrationConfig.QR_VERSION,
            error_correction  = qrcode.constants.ERROR_CORRECT_L,
            box_size          = RegistrationConfig.QR_BOX_SIZE,
            border            = RegistrationConfig.QR_BORDER,
        )
        qr.add_data(qr_content)
        qr.make(fit=True)

        img        = qr.make_image(fill_color="black", back_color="white")
        buffer     = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        return base64.b64encode(buffer.getvalue()).decode('utf-8')

    @staticmethod
    def decode_qr_payload(payload: str) -> dict | None:
        """
        Decodes the QR payload string back into a dict.
        Used by the ranger scanner endpoint.

        Returns:
            {
                'app':           'SMARTTREK',
                'permit_number': str,
                'route_id':      int,
                'profile_id':    int,
                'planned_exit':  str,
            }
        or None if invalid format.
        """
        try:
            parts = payload.strip().split('|')
            if len(parts) != 5 or parts[0] != 'SMARTTREK':
                return None
            return {
                'app':           parts[0],
                'permit_number': parts[1],
                'route_id':      int(parts[2]),
                'profile_id':    int(parts[3]),
                'planned_exit':  parts[4],
            }
        except (ValueError, IndexError):
            return None


# ================================================================
# REGISTRATION VALIDATOR
# ================================================================

class RegistrationValidator:
    """
    Validates registration data before saving.
    Raises ValueError with user-friendly messages on failure.
    """

    def __init__(
        self,
        profile: UserProfile,
        route: TrekkingRoute,
        planned_entry,
        planned_exit,
        group_size: int,
    ):
        self.profile       = profile
        self.route         = route
        self.planned_entry = planned_entry
        self.planned_exit  = planned_exit
        self.group_size    = group_size

    def validate(self):
        """Run all validations. Raises ValueError on first failure."""
        self._validate_route_status()
        self._validate_group_size()
        self._validate_entry_time()
        self._validate_exit_time()
        self._validate_no_duplicate()

    def _validate_route_status(self):
        if self.route.status == 'closed':
            raise ValueError(
                f"Route '{self.route.name}' is currently closed due to "
                f"weather or safety conditions. Please choose another route "
                f"or check back later."
            )

    def _validate_group_size(self):
        if self.group_size < 1:
            raise ValueError("Group size must be at least 1.")
        if self.group_size > RegistrationConfig.MAX_GROUP_SIZE:
            raise ValueError(
                f"Group size cannot exceed {RegistrationConfig.MAX_GROUP_SIZE} people "
                f"per registration. For larger groups, please contact the "
                f"Barangay Aglao office directly."
            )

    def _validate_entry_time(self):
        now     = timezone.now()
        max_adv = now + timedelta(days=RegistrationConfig.MAX_ADVANCE_BOOKING_DAYS)

        if self.planned_entry < now:
            raise ValueError(
                "Planned entry time cannot be in the past. "
                "Please select a future date and time."
            )
        if self.planned_entry > max_adv:
            raise ValueError(
                f"Registrations can only be made up to "
                f"{RegistrationConfig.MAX_ADVANCE_BOOKING_DAYS} days in advance."
            )

    def _validate_exit_time(self):
        min_duration = timedelta(hours=RegistrationConfig.MIN_TREK_HOURS)
        if self.planned_exit <= self.planned_entry + min_duration:
            raise ValueError(
                f"Planned exit must be at least "
                f"{RegistrationConfig.MIN_TREK_HOURS} hour(s) after entry."
            )

    def _validate_no_duplicate(self):
        """
        Prevents a user from having two overlapping active registrations
        on the same route.
        """
        conflict = TouristRegistration.objects.filter(
            profile = self.profile,
            route   = self.route,
            status__in = ['registered', 'inside'],
        ).exists()

        if conflict:
            raise ValueError(
                "You already have an active registration for this route. "
                "Please exit your current trek before registering again."
            )


# ================================================================
# REGISTRATION REPOSITORY
# ================================================================

class RegistrationRepository:
    """
    All DB read/write operations for TouristRegistration.
    All methods are static.
    """

    @staticmethod
    def create(
        profile: UserProfile,
        route: TrekkingRoute,
        planned_entry,
        planned_exit,
        group_size: int,
        notes: str = '',
    ) -> TouristRegistration:
        """Creates and saves a new TouristRegistration."""
        return TouristRegistration.objects.create(
            profile       = profile,
            route         = route,
            planned_entry = planned_entry,
            planned_exit  = planned_exit,
            group_size    = group_size,
            notes         = notes,
            status        = 'registered',
        )

    @staticmethod
    def get_by_permit(permit_number: str) -> TouristRegistration | None:
        """Fetch registration by permit number. Returns None if not found."""
        try:
            return TouristRegistration.objects.select_related(
                'profile', 'route'
            ).get(permit_number=permit_number)
        except TouristRegistration.DoesNotExist:
            return None

    @staticmethod
    def get_active_for_profile(profile: UserProfile):
        """Returns all active (registered/inside) registrations for a user."""
        return TouristRegistration.objects.filter(
            profile    = profile,
            status__in = ['registered', 'inside'],
        ).select_related('route').order_by('-registered_at')

    @staticmethod
    def get_currently_inside():
        """
        Returns all registrations with status='inside'.
        Used by the ranger dashboard to see who is on the trail.
        """
        return TouristRegistration.objects.filter(
            status='inside'
        ).select_related('profile', 'route').order_by('planned_exit')

    @staticmethod
    def get_overdue_candidates():
        """
        Returns registrations that should be marked overdue:
        - status is 'inside'
        - planned_exit + grace period has passed
        - no actual_exit recorded
        """
        grace_cutoff = timezone.now() - timedelta(
            hours=RegistrationConfig.OVERDUE_GRACE_HOURS
        )
        return TouristRegistration.objects.filter(
            status       = 'inside',
            planned_exit__lt = grace_cutoff,
            actual_exit  = None,
        ).select_related('profile', 'route')

    @staticmethod
    def mark_entered(registration: TouristRegistration) -> TouristRegistration:
        """Ranger confirms entry — updates status to 'inside'."""
        registration.status       = 'inside'
        registration.actual_entry = timezone.now()
        registration.save(update_fields=['status', 'actual_entry', 'updated_at'])
        return registration

    @staticmethod
    def mark_exited(registration: TouristRegistration) -> TouristRegistration:
        """Ranger confirms exit — updates status to 'exited'."""
        registration.status      = 'exited'
        registration.actual_exit = timezone.now()
        registration.save(update_fields=['status', 'actual_exit', 'updated_at'])
        return registration

    @staticmethod
    def mark_overdue(registration: TouristRegistration) -> TouristRegistration:
        """Celery task marks registration as overdue."""
        registration.status = 'overdue'
        registration.save(update_fields=['status', 'updated_at'])
        return registration

    @staticmethod
    def get_history_for_profile(profile: UserProfile):
        """Full registration history for a user's profile page."""
        return TouristRegistration.objects.filter(
            profile = profile,
        ).select_related('route').order_by('-registered_at')


# ================================================================
# NOTIFICATION SERVICE
# Plug in Firebase / Django signals / email here
# ================================================================

class RegistrationNotifier:
    """
    Handles all notifications related to registration events.
    Swap the notification backend here without touching service logic.
    """

    @staticmethod
    def notify_registration_success(registration: TouristRegistration):
        """Push notification to tourist after successful registration."""
        logger.info(
            f"[Notifier] Registration confirmed: "
            f"{registration.permit_number} — {registration.profile}"
        )
        # TODO: integrate Firebase Cloud Messaging (FCM)
        # FCMService.send(
        #     token   = registration.profile.fcm_token,
        #     title   = "Trek Registration Confirmed",
        #     body    = f"Permit #{registration.permit_number} is ready. "
        #               f"Show your QR code at Barangay Aglao gate.",
        #     data    = {'permit': registration.permit_number},
        # )

    @staticmethod
    def notify_entry_confirmed(registration: TouristRegistration):
        """Push notification when ranger confirms entry."""
        logger.info(
            f"[Notifier] Entry confirmed: {registration.permit_number}"
        )
        # TODO: FCM push
        # FCMService.send(
        #     token = registration.profile.fcm_token,
        #     title = "Trek Entry Confirmed ✅",
        #     body  = f"Safe trekking on {registration.route.name}! "
        #             f"Expected exit: {registration.planned_exit:%b %d, %I:%M %p}",
        # )

    @staticmethod
    def notify_exit_confirmed(registration: TouristRegistration):
        """Push notification when ranger confirms exit."""
        logger.info(
            f"[Notifier] Exit confirmed: {registration.permit_number}"
        )
        # TODO: FCM push

    @staticmethod
    def notify_overdue_tourist(registration: TouristRegistration):
        """Alert the tourist that they are marked overdue."""
        logger.warning(
            f"[Notifier] OVERDUE TOURIST: {registration.permit_number} "
            f"— {registration.profile} on {registration.route.name}"
        )
        # TODO: FCM push + SMS via Semaphore/Vonage

    @staticmethod
    def notify_rangers_overdue(registration: TouristRegistration):
        """
        Alerts rangers that a trekker has not exited on time.
        This is the critical safety notification.
        """
        logger.warning(
            f"[Notifier] RANGER ALERT — Overdue trekker: "
            f"{registration.permit_number} | "
            f"{registration.profile} | "
            f"Route: {registration.route.name} | "
            f"Planned exit: {registration.planned_exit}"
        )
        # TODO: Send to ranger dashboard + SMS to Aglao barangay contact


# ================================================================
# REGISTRATION SERVICE
# Master orchestrator — the only class imported by views/tasks
# ================================================================

class RegistrationService:
    """
    Main entry point for all tourist registration operations.

    Usage (from DRF view):
        service = RegistrationService()

        # Tourist registers
        result = service.register(
            profile       = request.user.profile,
            route         = route,
            planned_entry = planned_entry,
            planned_exit  = planned_exit,
            group_size    = 3,
            notes         = "One member has asthma",
        )

        # Ranger scans QR on entry
        result = service.confirm_entry(permit_number="TRK-A3F9B12C")

        # Ranger scans QR on exit
        result = service.confirm_exit(permit_number="TRK-A3F9B12C")
    """

    def __init__(self):
        self.repo      = RegistrationRepository()
        self.notifier  = RegistrationNotifier()
        self.generator = PermitGenerator()

    # ── Tourist-facing operations ────────────────────────────────

    @transaction.atomic
    def register(
        self,
        profile: UserProfile,
        route: TrekkingRoute,
        planned_entry,
        planned_exit,
        group_size: int = 1,
        notes: str = '',
    ) -> dict:
        """
        Creates a new tourist registration.
        Validates, saves, generates QR code.

        Returns:
            {
                'success':        bool,
                'permit_number':  str,
                'qr_code':        str,  # base64 PNG
                'registration':   TouristRegistration,
                'message':        str,
            }
        """
        # 1. Validate
        try:
            RegistrationValidator(
                profile, route, planned_entry, planned_exit, group_size
            ).validate()
        except ValueError as e:
            return {'success': False, 'message': str(e)}

        # 2. Create registration
        registration = self.repo.create(
            profile       = profile,
            route         = route,
            planned_entry = planned_entry,
            planned_exit  = planned_exit,
            group_size    = group_size,
            notes         = notes,
        )

        # 3. Generate QR
        qr_code = self.generator.generate_qr_code(registration)

        # 4. Notify tourist
        self.notifier.notify_registration_success(registration)

        logger.info(
            f"[RegistrationService] New registration: "
            f"{registration.permit_number} — "
            f"{profile} on {route.name}"
        )

        return {
            'success':       True,
            'permit_number': registration.permit_number,
            'qr_code':       qr_code,
            'registration':  registration,
            'message':       (
                f"Registration successful! Your permit is "
                f"#{registration.permit_number}. Show the QR code "
                f"to the ranger at Barangay Aglao gate before entering."
            ),
        }

    def get_my_registrations(self, profile: UserProfile) -> list:
        """Returns active registrations for the tourist's profile screen."""
        return list(self.repo.get_active_for_profile(profile))

    def get_my_history(self, profile: UserProfile) -> list:
        """Returns full registration history for a user."""
        return list(self.repo.get_history_for_profile(profile))

    def regenerate_qr(self, permit_number: str, profile: UserProfile) -> dict:
        """
        Re-generates the QR code for a registration.
        Useful if the tourist's phone screen was off during scanning.
        Only the owner of the registration can regenerate.
        """
        registration = self.repo.get_by_permit(permit_number)

        if not registration:
            return {'success': False, 'message': 'Permit not found.'}

        if registration.profile != profile:
            return {'success': False, 'message': 'Unauthorized.'}

        if registration.status not in ('registered', 'inside'):
            return {
                'success': False,
                'message': 'QR can only be regenerated for active registrations.',
            }

        qr_code = self.generator.generate_qr_code(registration)
        return {
            'success':  True,
            'qr_code':  qr_code,
            'message':  'QR code regenerated successfully.',
        }

    # ── Ranger-facing operations ─────────────────────────────────

    def confirm_entry(self, permit_number: str) -> dict:
        """
        Called when ranger scans QR at the entry gate.
        Updates status to 'inside' and records actual_entry time.

        Returns:
            {
                'success':       bool,
                'registration':  TouristRegistration | None,
                'tourist_name':  str,
                'route_name':    str,
                'group_size':    int,
                'planned_exit':  datetime,
                'message':       str,
            }
        """
        registration = self.repo.get_by_permit(permit_number)

        if not registration:
            return {'success': False, 'message': f'Permit #{permit_number} not found.'}

        if registration.status == 'inside':
            return {
                'success': False,
                'message': f'Already marked as inside. Entry recorded at {registration.actual_entry}.',
            }

        if registration.status in ('exited', 'overdue'):
            return {
                'success': False,
                'message': f'This permit is already {registration.status}. Cannot re-enter.',
            }

        # Update to inside
        registration = self.repo.mark_entered(registration)
        self.notifier.notify_entry_confirmed(registration)

        logger.info(
            f"[RegistrationService] Entry confirmed: {permit_number} "
            f"— {registration.profile} on {registration.route.name}"
        )

        return {
            'success':      True,
            'tourist_name': str(registration.profile),
            'route_name':   registration.route.name,
            'group_size':   registration.group_size,
            'planned_exit': registration.planned_exit,
            'message':      (
                f"Entry confirmed for {registration.profile}. "
                f"Group of {registration.group_size}. "
                f"Expected exit: {registration.planned_exit:%b %d, %I:%M %p}."
            ),
        }

    def confirm_exit(self, permit_number: str) -> dict:
        """
        Called when ranger scans QR at the exit gate.
        Updates status to 'exited' and records actual_exit time.
        """
        registration = self.repo.get_by_permit(permit_number)

        if not registration:
            return {'success': False, 'message': f'Permit #{permit_number} not found.'}

        if registration.status == 'exited':
            return {
                'success': False,
                'message': f'Already marked as exited at {registration.actual_exit}.',
            }

        if registration.status == 'registered':
            return {
                'success': False,
                'message': 'Entry was never confirmed for this permit. Cannot exit.',
            }

        registration = self.repo.mark_exited(registration)
        self.notifier.notify_exit_confirmed(registration)

        duration = registration.actual_exit - registration.actual_entry
        hours    = int(duration.total_seconds() // 3600)
        minutes  = int((duration.total_seconds() % 3600) // 60)

        logger.info(
            f"[RegistrationService] Exit confirmed: {permit_number} "
            f"— duration: {hours}h {minutes}m"
        )

        return {
            'success':       True,
            'tourist_name':  str(registration.profile),
            'duration':      f"{hours}h {minutes}m",
            'message':       (
                f"Exit confirmed for {registration.profile}. "
                f"Total trek time: {hours}h {minutes}m. Safe travels!"
            ),
        }

    def scan_qr(self, qr_payload: str, action: str) -> dict:
        """
        Ranger scans QR and specifies action: 'entry' or 'exit'.
        Decodes the QR payload and routes to confirm_entry/confirm_exit.

        Args:
            qr_payload: raw string from QR scanner
            action:     'entry' or 'exit'
        """
        decoded = self.generator.decode_qr_payload(qr_payload)

        if not decoded:
            return {
                'success': False,
                'message': 'Invalid QR code. Not a SmartTrek permit.',
            }

        permit_number = decoded['permit_number']

        if action == 'entry':
            return self.confirm_entry(permit_number)
        elif action == 'exit':
            return self.confirm_exit(permit_number)
        else:
            return {'success': False, 'message': f"Unknown action: '{action}'."}

    def get_dashboard_data(self) -> dict:
        """
        Returns data for the ranger dashboard:
        - Who is currently inside
        - Who is overdue
        - Total counts

        Used by the ranger mobile/web view.
        """
        currently_inside = list(self.repo.get_currently_inside())
        overdue          = list(self.repo.get_overdue_candidates())

        return {
            'currently_inside': currently_inside,
            'overdue':          overdue,
            'total_inside':     len(currently_inside),
            'total_overdue':    len(overdue),
        }

    # ── Celery task entry point ──────────────────────────────────

    def run_overdue_check(self) -> dict:
        """
        Called by Celery Beat every 30 minutes.
        Marks overdue registrations and notifies rangers.

        Returns summary dict.
        """
        logger.info("[RegistrationService] Running overdue check...")

        candidates = self.repo.get_overdue_candidates()
        marked     = 0

        for reg in candidates:
            try:
                self.repo.mark_overdue(reg)
                self.notifier.notify_overdue_tourist(reg)
                self.notifier.notify_rangers_overdue(reg)
                marked += 1
                logger.warning(
                    f"[RegistrationService] Marked overdue: "
                    f"{reg.permit_number} — {reg.profile}"
                )
            except Exception as e:
                logger.error(f"[RegistrationService] Overdue check error: {e}")
                continue

        summary = {
            'success':        True,
            'overdue_marked': marked,
        }
        logger.info(f"[RegistrationService] Overdue check done: {summary}")
        return summary