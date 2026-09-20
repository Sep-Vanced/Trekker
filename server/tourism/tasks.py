# tourism/tasks.py
from celery import shared_task
from .services import RegistrationService
import logging

logger = logging.getLogger(__name__)


@shared_task
def check_overdue_registrations():
    """
    Runs every 30 minutes via Celery Beat.
    Marks overdue trekkers and alerts rangers.
    """
    return RegistrationService().run_overdue_check()