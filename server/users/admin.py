from django.contrib import admin
from .models import UserProfile, TrekkingSession, LocationLog
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(TrekkingSession)
admin.site.register(LocationLog)