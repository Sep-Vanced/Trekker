from django.db import models
from users.models import UserProfile
from navigation.models import TrekkingRoute

class WeatherReport(models.Model):
    CONDITION_CHOICES = [
        ('clear',       'Clear'),
        ('cloudy',      'Cloudy'),
        ('rain',        'Rain'),
        ('heavy_rain',  'Heavy Rain'),
        ('storm',       'Storm'),
        ('flood_risk',  'Flood Risk'),
        ('strong_wind', 'Strong Wind'),
        ('fog',         'Fog'),
    ]

    route             = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE, related_name='weather_reports')
    condition         = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    temperature_c     = models.DecimalField(max_digits=5, decimal_places=1)
    wind_speed_kph    = models.DecimalField(max_digits=5, decimal_places=1)
    rainfall_mm       = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    humidity_pct      = models.IntegerField(default=0)
    is_safe_to_trek   = models.BooleanField(default=True)
    recorded_at       = models.DateTimeField(auto_now_add=True)
    valid_until       = models.DateTimeField(null=True, blank=True)
    source            = models.CharField(max_length=100, default='manual', blank=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.route.name} - {self.condition} @ {self.recorded_at:%Y-%m-%d %H:%M}"


class WeatherAlert(models.Model):
    SEVERITY_CHOICES = [
        ('info',    'Info'),
        ('warning', 'Warning'),
        ('danger',  'Danger'),
        ('extreme', 'Extreme'),
    ]
    ALERT_TYPE_CHOICES = [
        ('heavy_rain',     'Heavy Rainfall'),
        ('flood',          'Flood Risk'),
        ('strong_wind',    'Strong Wind'),
        ('unsafe_trail',   'Unsafe Trail'),
        ('river_crossing', 'River Crossing Risk'),
        ('storm',          'Storm Warning'),
    ]

    route       = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE, related_name='weather_alerts')
    alert_type  = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES)
    severity    = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='warning')
    title       = models.CharField(max_length=200)
    message     = models.TextField()
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    expires_at  = models.DateTimeField(null=True, blank=True)
    created_by  = models.ForeignKey(UserProfile, null=True, blank=True,
                                    on_delete=models.SET_NULL, related_name='created_alerts')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity.upper()}] {self.title}"
