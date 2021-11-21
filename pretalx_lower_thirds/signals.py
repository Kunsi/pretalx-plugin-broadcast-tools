from django.dispatch import receiver
from django.urls import resolve, reverse
from django.utils.translation import ugettext_lazy as _
from pretalx.orga.signals import nav_event_settings


@receiver(nav_event_settings)
def navbar_info(sender, request, **kwargs):
    url = resolve(request.path_info)
    if not request.user.has_perm("orga.change_settings", request.event):
        return []
    return [
        {
            "label": _("lower thirds"),
            "url": reverse(
                "plugins:pretalx_lower_thirds:orga",
                kwargs={
                    "event": request.event.slug,
                },
            ),
            "active": url.namespace == "plugins:pretalx_lower_thirds"
            and url.url_name == "orga",
        }
    ]
