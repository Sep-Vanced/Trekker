from rest_framework import serializers
from .models import Campsite, TrekkingRoute, Checkpoint

class CampsiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campsite
        fields = '__all__'

class TrekkingRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrekkingRoute
        fields = '__all__'

class CheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkpoint
        fields = '__all__'

