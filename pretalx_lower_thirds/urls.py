from django.urls import re_path
from pretalx.event.models.event import SLUG_CHARS

from . import views

urlpatterns = [
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/lower-thirds/$",
        views.LowerThirdsView.as_view(),
        name="lowerthirds",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/lower-thirds/event.json$",
        views.EventInfoView.as_view(),
        name="event_info",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/lower-thirds/schedule.json$",
        views.ScheduleView.as_view(),
        name="schedule",
    ),
    re_path(
        f"^orga/event/(?P<event>[{SLUG_CHARS}]+)/p/lower-thirds/$",
        views.LowerThirdsOrgaView.as_view(),
        name="orga",
    ),
]
