# weather/management/commands/update_weather.py

from django.core.management.base import BaseCommand
from weather.services import WeatherService, WeatherFetcher, WeatherParser, WeatherEvaluator
from navigation.models import TrekkingRoute
import json


class Command(BaseCommand):
    help = 'Manually trigger a weather update for all active routes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Fetch and evaluate but do NOT save anything to DB',
        )
        parser.add_argument(
            '--route-id',
            type=int,
            help='Process a single route by ID instead of all routes',
        )

    def handle(self, *args, **options):
        service = WeatherService()

        if options['dry_run']:
            self._dry_run()
        elif options['route_id']:
            self._single_route(service, options['route_id'])
        else:
            self._full_update(service)

    def _dry_run(self):
        self.stdout.write("🌤  Dry run — no data will be saved...\n")

        raw = WeatherFetcher().get_current()
        if not raw:
            self.stderr.write("  Failed to fetch weather data.")
            return

        weather = WeatherParser.parse_current(raw)
        self.stdout.write("📡  Current conditions at Lake Mapanuepe:")
        self.stdout.write(json.dumps(
            {k: str(v) for k, v in weather.items()}, indent=2
        ))

        self.stdout.write("\n🗺   Route safety evaluation:")
        for route in TrekkingRoute.objects.filter(is_active=True):
            result = WeatherEvaluator(route, weather).evaluate()
            icon   = "✅" if result['is_safe'] else "🚫"
            self.stdout.write(
                f"  {icon}  [{result['profile']:<15}]  {route.name}"
            )
            for reason in result['reasons']:
                self.stdout.write(f"              ⚠  {reason}")

    def _single_route(self, service: WeatherService, route_id: int):
        try:
            route  = TrekkingRoute.objects.get(id=route_id, is_active=True)
            self.stdout.write(f"🌤  Updating weather for: {route.name}")
            result = service.run_for_route(route)
            self.stdout.write(self.style.SUCCESS(
                f"\n✅  Done!\n"
                f"   Safe:    {result.get('is_safe')}\n"
                f"   Profile: {result.get('profile')}\n"
                f"   Reasons: {result.get('reasons')}\n"
                f"   Alerts:  {len(result.get('alerts', []))}\n"
            ))
        except TrekkingRoute.DoesNotExist:
            self.stderr.write(f"❌  Route id={route_id} not found.")

    def _full_update(self, service: WeatherService):
        self.stdout.write("🌤  Running full weather update for all routes...")
        summary = service.run_update()
        self.stdout.write(self.style.SUCCESS(
            f"\n✅  Done!\n"
            f"   Condition:      {summary.get('condition')}\n"
            f"   Temperature:    {summary.get('temperature_c')}°C\n"
            f"   Rainfall:       {summary.get('rainfall_mm')}mm/hr\n"
            f"   Wind:           {summary.get('wind_speed_kph')}kph\n"
            f"   Routes updated: {summary.get('routes_updated')}\n"
            f"   Routes closed:  {summary.get('routes_closed')}\n"
            f"   Routes caution: {summary.get('routes_caution')}\n"
            f"   Alerts created: {summary.get('alerts_created')}\n"
        ))