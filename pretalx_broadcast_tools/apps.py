from django.apps import AppConfig
from django.utils.translation import gettext_lazy

from pretalx_broadcast_tools import __version__


class PluginApp(AppConfig):
    name = "pretalx_broadcast_tools"
    verbose_name = "Broadcasting Tools"

    class PretalxPluginMeta:
        name = gettext_lazy("Broadcasting Tools")
        author = "kunsi"
        description = gettext_lazy(
            "Some tools which can be used for supporting a broadcasting "
            "software, for example a 'lower third' page which can be "
            "embedded into your broadcasting software"
        )
        visible = True
        version = __version__
        category = "FEATURE"

    def ready(self):
        from . import signals  # NOQA
