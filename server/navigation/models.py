from django.db import models

class Campsite(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    phase = models.CharField(max_length=50, blank=True)  
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
class TrekkingRoute(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy',   'Easy'),
        ('medium', 'Medium'),
        ('hard',   'Hard'),
        ('expert', 'Expert'),
    ]
    STATUS_CHOICES = [
        ('open',   'Open'),
        ('closed', 'Closed'),
        ('caution','Caution'),
    ]
    destination = models.ForeignKey(
        Campsite,
        on_delete=models.CASCADE,
        related_name='routes',
        null=True,
        blank=True
    )
    name              = models.CharField(max_length=200, default='San Marcelino Mapanuepe')
    description       = models.TextField(blank=True)
    difficulty        = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    difficulty_score  = models.IntegerField(default=1)
    status            = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')    
    start_name        = models.CharField(max_length=200, blank=True)
    start_latitude    = models.DecimalField(max_digits=9, decimal_places=6)
    start_longitude   = models.DecimalField(max_digits=9, decimal_places=6)
    end_latitude      = models.DecimalField(max_digits=9, decimal_places=6)
    end_longitude     = models.DecimalField(max_digits=9, decimal_places=6)
    total_distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    estimated_hours   = models.DecimalField(max_digits=4, decimal_places=1)
    allowed_vehicles  = models.CharField(
                            max_length=100,
                            default='motorcycle,4x4,suv')
    elevation_gain_m  = models.IntegerField(default=0)
    offline_map_file  = models.FileField(upload_to='offline_maps/', null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.status})"
    
    def is_vehicle_allowed(self, vehicle_type):
        return vehicle_type.lower() in [v.strip() for v in self.allowed_vehicles.split(',')]
class Checkpoint(models.Model):
    CHECKPOINT_TYPE_CHOICES = [
        ('waypoint',      'Waypoint'),
        ('camp',          'Camp Entrance'),
        ('river',         'River Crossing'),
        ('danger',        'Danger Zone'),
        ('rest',          'Rest Area'),
        ('emergency',     'Emergency Point'),
    ]

    route       = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE, related_name='checkpoints')
    name        = models.CharField(max_length=200)
    order       = models.PositiveIntegerField()
    latitude    = models.DecimalField(max_digits=9, decimal_places=6)
    longitude   = models.DecimalField(max_digits=9, decimal_places=6)
    cp_type     = models.CharField(max_length=20, choices=CHECKPOINT_TYPE_CHOICES, default='waypoint')
    description = models.TextField(blank=True)
    alert_message = models.CharField(max_length=300, blank=True,
                                     help_text="Alert shown when user is ~200m away")
    radius_meters = models.IntegerField(default=200, help_text="Trigger radius in metres")
    is_mandatory = models.BooleanField(default=False)

    class Meta:
        ordering = ['route', 'order']

    def __str__(self):
        return f"{self.route.name} > #{self.order} {self.name}"