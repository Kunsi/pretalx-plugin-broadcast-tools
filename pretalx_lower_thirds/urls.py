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
        f"^(?P<event>[{SLUG_CHARS}]+)/p/lower-thirds/schedule.json$",
        views.ScheduleView.as_view(),
        name="schedule",
    ),
]
