from django.urls import re_path
from pretalx.event.models.event import SLUG_REGEX

from .views.event_info import BroadcastToolsEventInfoView
from .views.orga import BroadcastToolsOrgaView
from .views.qr import BroadcastToolsFeedbackQrCodeSvg, BroadcastToolsPublicQrCodeSvg
from .views.schedule import BroadcastToolsScheduleView
from .views.static_html import BroadcastToolsLowerThirdsView, BroadcastToolsRoomInfoView

urlpatterns = [
    re_path(
        rf"^(?P<event>{SLUG_REGEX})/p/broadcast-tools/event.json$",
        BroadcastToolsEventInfoView.as_view(),
        name="event_info",
    ),
    re_path(
        f"^(?P<event>{SLUG_REGEX})/p/broadcast-tools/schedule.json$",
        BroadcastToolsScheduleView.as_view(),
        name="schedule",
    ),
    re_path(
        f"^(?P<event>{SLUG_REGEX})/p/broadcast-tools/lower-thirds/$",
        BroadcastToolsLowerThirdsView.as_view(),
        name="lowerthirds",
    ),
    re_path(
        f"^(?P<event>{SLUG_REGEX})/p/broadcast-tools/feedback-qr/(?P<talk>[0-9]+).svg$",
        BroadcastToolsFeedbackQrCodeSvg.as_view(),
        name="feedback_qr_id",
    ),
    re_path(
        f"^(?P<event>{SLUG_REGEX})/p/broadcast-tools/public-qr/(?P<talk>[0-9]+).svg$",
        BroadcastToolsPublicQrCodeSvg.as_view(),
        name="public_qr_id",
    ),
    re_path(
        f"^(?P<event>{SLUG_REGEX})/p/broadcast-tools/room-info/$",
        BroadcastToolsRoomInfoView.as_view(),
        name="room_info",
    ),
    re_path(
        f"^orga/event/(?P<event>{SLUG_REGEX})/settings/p/broadcast-tools/$",
        BroadcastToolsOrgaView.as_view(),
        name="orga",
    ),
]
