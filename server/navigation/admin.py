from django.contrib import admin
from .models import Campsite, TrekkingRoute, Checkpoint
# Register your models here.
admin.site.register(Campsite)
admin.site.register(TrekkingRoute)
admin.site.register(Checkpoint)