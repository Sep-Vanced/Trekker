from django.db.models import Count, Max
from .models import UserProfile
from django.utils import timezone
from .models import TrekkingSession

class UserStatsSelectors:
    # user stats
    def get_user_stats():
        total = UserProfile.objects.count()

        role_counts = (
            UserProfile.objects
            .values('role')
            .annotate(count=Count('id'))
            .order_by('role')
        )

        users_per_role = {
            entry['role']: entry['count']
            for entry in role_counts
        }

        # Fill in zeros for roles with no members yet
        all_roles = dict(UserProfile.ROLE_CHOICES)
        for role_key in all_roles:
            users_per_role.setdefault(role_key, 0)

        return {
            'total_users': total,
            'users_per_role': users_per_role,
        }
        
    # get trekking stats
    def get_trekking_dashboard_stats():
        today = timezone.localdate()

        # Active sessions right now
        active_sessions = (
            TrekkingSession.objects
            .filter(is_active=True)
            .select_related('profile__user', 'route')
            .prefetch_related('locations')
        )

        # All sessions that started today (active + completed)
        todays_sessions = (
            TrekkingSession.objects
            .filter(started_at__date=today)
            .select_related('profile__user', 'route')
        )

        active_trekkers = []
        for session in active_sessions:
            last_loc = session.locations.order_by('-recorded_at').first()
            active_trekkers.append({
                'session_id':  session.id,
                'trekker':     session.profile.full_name,
                'route':       session.route.name,
                'started_at':  session.started_at,
                'last_lat':    last_loc.latitude  if last_loc else None,
                'last_lng':    last_loc.longitude if last_loc else None,
                'last_update': last_loc.recorded_at if last_loc else None,
            })

        todays_trekkers = []
        for session in todays_sessions:
            todays_trekkers.append({
                'session_id': session.id,
                'trekker':    session.profile.full_name,
                'route':      session.route.name,
                'started_at': session.started_at,
                'ended_at':   session.ended_at,
                'is_active':  session.is_active,
            })

        return {
            'active_count':     active_sessions.count(),
            'today_total':      todays_sessions.count(),
            'today_completed':  todays_sessions.filter(is_active=False).count(),
            'active_trekkers':  active_trekkers,
            'todays_trekkers':  todays_trekkers,
        }