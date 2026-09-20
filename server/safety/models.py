from django.db import models
from django.contrib.auth.models import User
from users.models import UserProfile, TrekkingSession
from navigation.models import TrekkingRoute


class VehicleSafetyCheck(models.Model):
    """
    Pre-entry vehicle suitability check for a route.
    Created when a user starts or plans a trek.
    """
    RESULT_CHOICES = [
        ('approved',     'Approved'),
        ('caution',      'Proceed with Caution'),
        ('not_recommended', 'Not Recommended'),
        ('blocked',      'Blocked / Unsafe'),
    ]

    profile     = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='vehicle_checks')
    route       = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE, related_name='vehicle_checks')
    vehicle_type = models.CharField(max_length=20)
    result      = models.CharField(max_length=20, choices=RESULT_CHOICES)
    alert_message = models.TextField()
    checked_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-checked_at']

    def __str__(self):
        return f"{self.profile.full_name} - {self.vehicle_type} on {self.route.name}: {self.result}"


class EmergencyAlert(models.Model):
    """SOS alert triggered by a user in the field."""
    STATUS_CHOICES = [
        ('sent',       'Sent'),
        ('acknowledged', 'Acknowledged'),
        ('responding', 'Responding'),
        ('resolved',   'Resolved'),
    ]

    profile         = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sos_alerts')
    session         = models.ForeignKey(TrekkingSession, null=True, blank=True,
                                        on_delete=models.SET_NULL, related_name='sos_alerts')
    latitude        = models.DecimalField(max_digits=9, decimal_places=6)
    longitude       = models.DecimalField(max_digits=9, decimal_places=6)
    message         = models.TextField(blank=True, default="SOS — I need help!")
    status          = models.CharField(max_length=15, choices=STATUS_CHOICES, default='sent')
    rescue_team_notified = models.BooleanField(default=False)
    contacts_notified    = models.BooleanField(default=False)
    triggered_at    = models.DateTimeField(auto_now_add=True)
    resolved_at     = models.DateTimeField(null=True, blank=True)
    notes           = models.TextField(blank=True, help_text="Rescue team notes")

    class Meta:
        ordering = ['-triggered_at']

    def __str__(self):
        return f"SOS by {self.profile.full_name} [{self.status}] @ {self.triggered_at:%Y-%m-%d %H:%M}"

    @property
    def maps_link(self):
        return f"https://maps.google.com/?q={self.latitude},{self.longitude}"