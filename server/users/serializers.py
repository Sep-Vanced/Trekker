from rest_framework.serializers import ModelSerializer, CharField
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, TrekkingSession, LocationLog

# user serializers
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# user profile serializers
class RegistrationSerializer(ModelSerializer):
    username = CharField(write_only=True)
    password = CharField(write_only=True)
    first_name = CharField(write_only=True)
    last_name = CharField(write_only=True)
    email = CharField(write_only=True)
    class Meta:
        model = UserProfile
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }
    
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        user.save()
        profile = UserProfile.objects.create(user=user, **validated_data)
        return profile
    
    def update(self, instance, validated_data):
        user = instance.user  # get the related user

        user.username = validated_data.pop('username', user.username)
        user.email = validated_data.pop('email', user.email)
        user.first_name = validated_data.pop('first_name', user.first_name)
        user.last_name = validated_data.pop('last_name', user.last_name)

        password = validated_data.pop('password', None)
        if password:
            user.set_password(password)

        user.save()

        # update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance
        
        
class UserProfileSerializer(ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserProfile
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }
        
    
# trekking session serializers ==============================================
class TrekkingSessionSerializer(ModelSerializer):
    class Meta:
        model = TrekkingSession
        fields = '__all__'
        
class LocationLogSerializer(ModelSerializer):
    class Meta:
        model = LocationLog
        fields = '__all__'
        
# admin get user dashboard ========================================================
class UserRoleCountSerializer(serializers.Serializer):
    role = serializers.CharField()
    role_display = serializers.SerializerMethodField()
    count = serializers.IntegerField()

    def get_role_display(self, obj):
        role_map = dict(UserProfile.ROLE_CHOICES)
        return role_map.get(obj['role'], obj['role'])


class UserStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    users_per_role = UserRoleCountSerializer(many=True)
    
# admin trekking user session dashboard ============================================
class ActiveTrekkerSerializer(serializers.Serializer):
    session_id  = serializers.IntegerField()
    trekker     = serializers.CharField()
    route       = serializers.CharField()
    started_at  = serializers.DateTimeField()
    last_lat    = serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    last_lng    = serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    last_update = serializers.DateTimeField(allow_null=True)


class TodayTrekkerSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    trekker    = serializers.CharField()
    route      = serializers.CharField()
    started_at = serializers.DateTimeField()
    ended_at   = serializers.DateTimeField(allow_null=True)
    is_active  = serializers.BooleanField()


class TrekkingDashboardSerializer(serializers.Serializer):
    active_count    = serializers.IntegerField()
    today_total     = serializers.IntegerField()
    today_completed = serializers.IntegerField()
    active_trekkers = ActiveTrekkerSerializer(many=True)
    todays_trekkers = TodayTrekkerSerializer(many=True)
    
# admin get the trek of serializer for a user =============================================
class CurrentTrekSerializer(serializers.ModelSerializer):
    route = serializers.CharField(source='route.name')
    latest_location = serializers.SerializerMethodField()

    class Meta:
        model = TrekkingSession
        fields = ['id', 'route', 'started_at', 'latest_location']

    def get_latest_location(self, obj):
        latest = obj.locations.order_by('-recorded_at').first()

        if not latest:
            return None

        return {
            "latitude": latest.latitude,
            "longitude": latest.longitude,
            "recorded_at": latest.recorded_at
        }