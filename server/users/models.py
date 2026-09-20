from django.db import models
from django.contrib.auth.models import User
from navigation.models import TrekkingRoute

# Create your models here
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('trekker', 'Trekker'),
        ('ranger',  'Park Ranger'),
        ('admin',   'Tourism Admin'),
        ('rescue',  'Rescue Team'),
    ]
 
    user                     = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role                     = models.CharField(max_length=20, choices=ROLE_CHOICES, default='trekker')
    phone                    = models.CharField(max_length=20, blank=True)
    emergency_contact_name   = models.CharField(max_length=100, blank=True)
    emergency_contact_phone  = models.CharField(max_length=20, blank=True)
    offline_maps_downloaded  = models.BooleanField(default=False)
    last_known_latitude      = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_known_longitude     = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update     = models.DateTimeField(null=True, blank=True)
    created_at               = models.DateTimeField(auto_now_add=True)
    updated_at               = models.DateTimeField(auto_now=True)
 
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"
 
    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username
    
# navigation real time data of user during trekking 
class TrekkingSession(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    route = models.ForeignKey(TrekkingRoute, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

# realtime location of the user
class LocationLog(models.Model):
    session = models.ForeignKey(TrekkingSession, on_delete=models.CASCADE, related_name='locations')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    recorded_at = models.DateTimeField(auto_now_add=True)