"""
Django Management Command: update_agricultural_news
Executes a 24-hour live agricultural news refresh from Google News RSS & Gemini AI,
persisting the latest bilingual advisories directly into the database.
Usage:
    python manage.py update_agricultural_news
"""

from django.core.management.base import BaseCommand
from core.ml.news_analyzer import get_analyzed_agricultural_news


class Command(BaseCommand):
    help = "Performs 24-hour automated live agricultural news refresh for Kerala farmers"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force live refresh even if within 24-hour window',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        self.stdout.write(self.style.NOTICE(f"Starting 24-hour live news refresh (force={force})..."))
        try:
            result = get_analyzed_agricultural_news(force_refresh=force)
            total = result.get('total', 0)
            mode = result.get('mode', 'unknown')
            last_updated = result.get('last_updated_display', 'N/A')
            next_refresh = result.get('hours_until_next_refresh', '24')

            self.stdout.write(self.style.SUCCESS(
                f"Successfully processed {total} agricultural news articles.\n"
                f"Mode: {mode}\n"
                f"Last Updated: {last_updated}\n"
                f"Next auto-refresh in: {next_refresh} hours"
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to update agricultural news: {e}"))
