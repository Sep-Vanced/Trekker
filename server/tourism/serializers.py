# tourism/serializers.py

from rest_framework import serializers
from django.utils import timezone
from .models import TouristRegistration
from navigation.models import TrekkingRoute


class RegistrationCreateSerializer(serializers.Serializer):
    """Validates incoming POST data for registration creation."""
    route_id      = serializers.IntegerField()
    planned_entry = serializers.DateTimeField()
    planned_exit  = serializers.DateTimeField()
    group_size    = serializers.IntegerField(default=1, min_value=1, max_value=30)
    notes         = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        if data['planned_exit'] <= data['planned_entry']:
            raise serializers.ValidationError(
                "planned_exit must be after planned_entry."
            )
        if data['planned_entry'] < timezone.now():
            raise serializers.ValidationError(
                "planned_entry cannot be in the past."
            )
        return data


class RangerScanSerializer(serializers.Serializer):
    """Validates ranger QR scan payload."""
    qr_payload = serializers.CharField()
    action     = serializers.ChoiceField(choices=['entry', 'exit'])


class RouteMinimalSerializer(serializers.ModelSerializer):
    """Minimal route info embedded in registration responses."""
    class Meta:
        model  = TrekkingRoute
        fields = ['id', 'name', 'difficulty', 'status', 'total_distance_km']


class TouristRegistrationSerializer(serializers.ModelSerializer):
    """
    Standard registration serializer for list views.
    Shows key fields without full route detail.
    """
    route_name  = serializers.CharField(source='route.name', read_only=True)
    full_name   = serializers.CharField(source='profile.full_name', read_only=True)
    is_overdue  = serializers.SerializerMethodField()

    class Meta:
        model  = TouristRegistration
        fields = [
            'id',
            'permit_number',
            'full_name',
            'route_name',
            'status',
            'group_size',
            'planned_entry',
            'planned_exit',
            'actual_entry',
            'actual_exit',
            'is_overdue',
            'registered_at',
        ]

    def get_is_overdue(self, obj) -> bool:
        return (
            obj.status == 'inside'
            and timezone.now() > obj.planned_exit
        )


class RegistrationDetailSerializer(serializers.ModelSerializer):
    """
    Full registration detail serializer.
    Used in ranger dashboard, detail view, and confirmation responses.
    """
    route       = RouteMinimalSerializer(read_only=True)
    full_name   = serializers.CharField(source='profile.full_name',  read_only=True)
    profile_id  = serializers.IntegerField(source='profile.id',      read_only=True)
    is_overdue  = serializers.SerializerMethodField()
    trek_duration = serializers.SerializerMethodField()

    class Meta:
        model  = TouristRegistration
        fields = [
            'id',
            'permit_number',
            'profile_id',
            'full_name',
            'route',
            'status',
            'group_size',
            'planned_entry',
            'planned_exit',
            'actual_entry',
            'actual_exit',
            'is_overdue',
            'trek_duration',
            'notes',
            'registered_at',
            'updated_at',
        ]

    def get_is_overdue(self, obj) -> bool:
        return (
            obj.status == 'inside'
            and timezone.now() > obj.planned_exit
        )

    def get_trek_duration(self, obj) -> str | None:
        """
        Returns formatted duration string if trek is complete.
        Returns None if trek hasn't ended yet.
        """
        if obj.actual_entry and obj.actual_exit:
            delta   = obj.actual_exit - obj.actual_entry
            hours   = int(delta.total_seconds() // 3600)
            minutes = int((delta.total_seconds() % 3600) // 60)
            return f"{hours}h {minutes}m"
        return None


class RangerDashboardSerializer(serializers.Serializer):
    """Top-level shape for the ranger dashboard response."""
    total_inside     = serializers.IntegerField()
    total_overdue    = serializers.IntegerField()
    currently_inside = RegistrationDetailSerializer(many=True)
    overdue          = RegistrationDetailSerializer(many=True)