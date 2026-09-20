from django.contrib import admin
from .models import WeatherReport, WeatherAlert
# Register your models here.
admin.site.register(WeatherReport)
admin.site.register(WeatherAlert)