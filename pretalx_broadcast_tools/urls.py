from django.urls import re_path
from pretalx.event.models.event import SLUG_CHARS

from . import views

urlpatterns = [
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/broadcast-tools/event.json$",
        views.BroadcastToolsEventInfoView.as_view(),
        name="event_info",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/broadcast-tools/schedule.json$",
        views.BroadcastToolsScheduleView.as_view(),
        name="schedule",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/broadcast-tools/lower-thirds/$",
        views.BroadcastToolsLowerThirdsView.as_view(),
        name="lowerthirds",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/broadcast-tools/feedback-qr/(?P<talk>[0-9]+).svg$",
        views.BroadcastToolsFeedbackQrCodeSvg.as_view(),
        name="feedback_qr_id",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/broadcast-tools/public-qr/(?P<talk>[0-9]+).svg$",
        views.BroadcastToolsPublicQrCodeSvg.as_view(),
        name="public_qr_id",
    ),
    re_path(
        f"^(?P<event>[{SLUG_CHARS}]+)/p/broadcast-tools/room-info/$",
        views.BroadcastToolsRoomInfoView.as_view(),
        name="room_info",
    ),
    re_path(
        f"^orga/event/(?P<event>[{SLUG_CHARS}]+)/settings/p/broadcast-tools/$",
        views.BroadcastToolsOrgaView.as_view(),
        name="orga",
    ),
]
