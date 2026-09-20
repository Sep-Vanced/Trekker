# weather/tasks.py

from celery import shared_task
from .services import WeatherService
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def update_weather_for_all_routes(self):
    """Hourly Celery Beat task — processes all active routes."""
    try:
        service = WeatherService()
        summary = service.run_update()
        logger.info(f"[Task] Weather update done: {summary}")
        return summary
    except Exception as exc:
        logger.error(f"[Task] Weather update failed: {exc}")
        raise self.retry(exc=exc)


@shared_task
def update_weather_now():
    """
    Manual trigger — force immediate update without waiting for schedule.

    Usage:
        from weather.tasks import update_weather_now
        update_weather_now.delay()
    """
    return WeatherService().run_update()


@shared_task
def update_weather_for_route(route_id: int):
    """
    On-demand single route update — useful when a user
    opens a specific route detail screen in the app.

    Usage:
        update_weather_for_route.delay(route.id)
    """
    from navigation.models import TrekkingRoute
    try:
        route = TrekkingRoute.objects.get(id=route_id, is_active=True)
        return WeatherService().run_for_route(route)
    except TrekkingRoute.DoesNotExist:
        logger.error(f"[Task] Route id={route_id} not found.")
        return {'error': 'Route not found'}