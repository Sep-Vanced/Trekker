from django.db import models
from users.models import UserProfile, TrekkingSession
from navigation.models import TrekkingRoute

class TouristRegistration(models.Model):
    """
    Mandatory registration before entering a trekking area.
    Allows rangers to know who is inside and enables emergency tracking.
    """
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('inside',     'Inside Trek Area'),
        ('exited',     'Exited'),
        ('overdue',    'Overdue / Not Exited'),
    ]

    profile             = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='registrations')
    route               = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE, related_name='registrations')
    session             = models.OneToOneField(TrekkingSession, null=True, blank=True,
                                               on_delete=models.SET_NULL, related_name='registration')
    status              = models.CharField(max_length=15, choices=STATUS_CHOICES, default='registered')
    group_size          = models.PositiveIntegerField(default=1)
    planned_entry       = models.DateTimeField()
    planned_exit        = models.DateTimeField()
    actual_entry        = models.DateTimeField(null=True, blank=True)
    actual_exit         = models.DateTimeField(null=True, blank=True)

    # Local ID or permit number
    permit_number       = models.CharField(max_length=50, unique=True)

    # Additional notes or special needs
    notes               = models.TextField(blank=True)

    registered_at       = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-registered_at']

    def __str__(self):
        return f"Permit #{self.permit_number} - {self.profile.full_name} on {self.route.name}"

    def save(self, *args, **kwargs):
        if not self.permit_number:
            import uuid
            self.permit_number = f"TRK-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class IncidentReport(models.Model):
    """Filed by rangers or admins when an incident occurs on a route."""
    SEVERITY_CHOICES = [
        ('minor',    'Minor'),
        ('moderate', 'Moderate'),
        ('serious',  'Serious'),
        ('critical', 'Critical'),
    ]
    INCIDENT_TYPE_CHOICES = [
        ('injury',      'Injury'),
        ('lost',        'Lost Trekker'),
        ('vehicle',     'Vehicle Incident'),
        ('weather',     'Weather Related'),
        ('wildlife',    'Wildlife Encounter'),
        ('other',       'Other'),
    ]

    reported_by     = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='filed_incidents')
    involved_user   = models.ForeignKey(UserProfile, null=True, blank=True,
                                        on_delete=models.SET_NULL, related_name='incidents_involved')
    route           = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE, related_name='incidents')
    incident_type   = models.CharField(max_length=20, choices=INCIDENT_TYPE_CHOICES)
    severity        = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='minor')
    description     = models.TextField()
    latitude        = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude       = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_resolved     = models.BooleanField(default=False)
    occurred_at     = models.DateTimeField()
    reported_at     = models.DateTimeField(auto_now_add=True)
    resolved_at     = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-occurred_at']

    def __str__(self):
        return f"[{self.severity}] {self.incident_type} on {self.route.name} @ {self.occurred_at:%Y-%m-%d}"