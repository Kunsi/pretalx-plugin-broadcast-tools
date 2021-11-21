from django.apps import AppConfig
from django.utils.translation import gettext_lazy


class PluginApp(AppConfig):
    name = "pretalx_lower_thirds"
    verbose_name = "Lower Thirds"

    class PretalxPluginMeta:
        name = gettext_lazy("Lower Thirds")
        author = "kunsi"
        description = gettext_lazy(
            "Creates lower thirds from your current schedule. Will show "
            "speaker names and talk title using the configured track and "
            "event colours."
        )
        visible = True
        version = "0.0.0"

    def ready(self):
        from . import signals  # NOQA
