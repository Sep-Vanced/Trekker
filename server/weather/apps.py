# weather/apps.py
from django.apps import AppConfig
class WeatherConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'weather'

    def ready(self):
        self._register_periodic_tasks()

    def _register_periodic_tasks(self):
        try:
            from django_celery_beat.models import PeriodicTask, IntervalSchedule
            import json

            # Every 1 hour
            hourly, _ = IntervalSchedule.objects.get_or_create(
                every=1,
                period=IntervalSchedule.HOURS,
            )
            PeriodicTask.objects.update_or_create(
                name='Hourly Weather Update – All Routes',
                defaults={
                    'interval': hourly,
                    'task':     'weather.tasks.update_weather_for_all_routes',
                    'args':     json.dumps([]),
                    'enabled':  True,
                }
            )
        except Exception:
            pass  # Tables may not exist yet during initial migrate