import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class SqlappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "sqlapp"

    def ready(self):
        """
        Called once when Django finishes loading.  Starts a background
        scheduler that:
          • runs refresh_hot_cache immediately on startup
          • re-runs it every 7 days thereafter
        """
        # Avoid running twice in Django's dev-server autoreload child process
        import os
        if os.environ.get("RUN_MAIN") == "true" or os.environ.get("RAILWAY_ENVIRONMENT"):
            self._start_scheduler()

    @staticmethod
    def _start_scheduler():
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from apscheduler.triggers.interval import IntervalTrigger
            from django.core.management import call_command

            def run_cache_refresh():
                try:
                    logger.info("[Scheduler] Running refresh_hot_cache…")
                    call_command("refresh_hot_cache")
                    logger.info("[Scheduler] refresh_hot_cache complete.")
                except Exception as exc:
                    logger.error(f"[Scheduler] refresh_hot_cache failed: {exc}")

            scheduler = BackgroundScheduler()

            # Run once immediately so the cache is never cold after a deploy
            scheduler.add_job(run_cache_refresh, "date")

            # Then repeat every 7 days
            scheduler.add_job(
                run_cache_refresh,
                IntervalTrigger(weeks=1),
                id="weekly_cache_refresh",
                replace_existing=True,
            )

            scheduler.start()
            logger.info("[Scheduler] Weekly cache refresh scheduled.")

        except Exception as exc:
            logger.error(f"[Scheduler] Failed to start scheduler: {exc}")
