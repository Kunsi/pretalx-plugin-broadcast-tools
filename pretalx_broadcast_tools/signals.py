from django.dispatch import receiver
from django.urls import resolve, reverse
from django.utils.translation import gettext_noop
from django.utils.translation import ugettext_lazy as _
from i18nfield.strings import LazyI18nString
from pretalx.common.models.settings import hierarkey
from pretalx.orga.signals import nav_event_settings

hierarkey.add_default(
    "lower_thirds_no_talk_info",
    LazyI18nString.from_gettext(
        gettext_noop("Sorry, there's currently no talk running")
    ),
    LazyI18nString,
)
hierarkey.add_default("lower_thirds_info_string", "", LazyI18nString)


@receiver(nav_event_settings)
def navbar_info(sender, request, **kwargs):
    url = resolve(request.path_info)
    if not request.user.has_perm("orga.change_settings", request.event):
        return []
    return [
        {
            "label": _("broadcast tools"),
            "url": reverse(
                "plugins:pretalx_broadcast_tools:orga",
                kwargs={
                    "event": request.event.slug,
                },
            ),
            "active": url.namespace == "plugins:pretalx_broadcast_tools"
            and url.url_name == "orga",
        }
    ]
