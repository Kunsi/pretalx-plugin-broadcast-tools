import datetime as dt
from xml.etree import ElementTree as ET

import pytz
import qrcode
import qrcode.image.svg
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.views import View
from django.views.generic import FormView
from django.views.generic.base import TemplateView
from pretalx.agenda.views.schedule import ScheduleMixin
from pretalx.common.mixins.views import EventPermissionRequired, PermissionRequired
from pretalx.schedule.exporters import ScheduleData

from .forms import BroadcastToolsSettingsForm
from .utils.placeholders import placeholders


class BroadcastToolsLowerThirdsView(TemplateView):
    template_name = "pretalx_broadcast_tools/lower_thirds.html"


class BroadcastToolsRoomInfoView(TemplateView):
    template_name = "pretalx_broadcast_tools/room_info.html"


class BroadcastToolsFeedbackQrCode(TemplateView):
    template_name = "pretalx_broadcast_tools/feedback_qr.html"


class BroadcastToolsOrgaView(PermissionRequired, FormView):
    form_class = BroadcastToolsSettingsForm
    permission_required = "orga.change_settings"
    template_name = "pretalx_broadcast_tools/orga.html"

    def get_success_url(self):
        return self.request.path

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["localized_rooms"] = [
            room.name.localize(self.request.event.locale)
            for room in self.request.event.rooms.all()
        ]
        return context

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

    def get_object(self):
        return self.request.event

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        return {
            "obj": self.request.event,
            "attribute_name": "settings",
            "locales": self.request.event.locales,
            **kwargs,
        }


class BroadcastToolsEventInfoView(View):
    def get(self, request, *args, **kwargs):
        color = self.request.event.primary_color or "#3aa57c"
        return JsonResponse(
            {
                "color": color,
                "name": str(self.request.event.name),
                "no_talk": str(
                    self.request.event.settings.broadcast_tools_lower_thirds_no_talk_info
                ),
                "room-info": {
                    "qr_type": "feedback" if self.request.event.settings.broadcast_tools_room_info_feedback_instead_of_public else "public",
                },
                "slug": self.request.event.slug,
            },
        )


class BroadcastToolsFeedbackQrCodeSvg(View):
    def get(self, request, *args, **kwargs):
        talk = self.request.event.submissions.filter(id=kwargs["talk"]).first()
        domain = request.event.custom_domain or settings.SITE_URL
        image = qrcode.make(
            f"{domain}{talk.urls.feedback}", image_factory=qrcode.image.svg.SvgImage
        )
        svg_data = mark_safe(ET.tostring(image.get_image()).decode())
        return HttpResponse(svg_data, content_type="image/svg+xml")


class BroadcastToolsPublicQrCodeSvg(View):
    def get(self, request, *args, **kwargs):
        talk = self.request.event.submissions.filter(id=kwargs["talk"]).first()
        domain = request.event.custom_domain or settings.SITE_URL
        image = qrcode.make(
            f"{domain}{talk.urls.public}", image_factory=qrcode.image.svg.SvgImage
        )
        svg_data = mark_safe(ET.tostring(image.get_image()).decode())
        return HttpResponse(svg_data, content_type="image/svg+xml")


class BroadcastToolsScheduleView(EventPermissionRequired, ScheduleMixin, View):
    permission_required = "agenda.view_schedule"

    def get(self, request, *args, **kwargs):
        schedule = ScheduleData(
            event=self.request.event,
            schedule=self.schedule,
        )
        tz = pytz.timezone(schedule.event.timezone)
        infoline = str(
            schedule.event.settings.broadcast_tools_lower_thirds_info_string or ""
        )
        try:
            return JsonResponse(
                {
                    "rooms": sorted(
                        {
                            room["name"].localize(schedule.event.locale)
                            for day in schedule.data
                            for room in day["rooms"]
                        }
                    ),
                    "talks": [
                        {
                            "id": talk.submission.id,
                            "start": talk.start.astimezone(tz).isoformat(),
                            "end": (talk.start + dt.timedelta(minutes=talk.duration))
                            .astimezone(tz)
                            .isoformat(),
                            "slug": talk.frab_slug,
                            "title": talk.submission.title,
                            "persons": [
                                person.get_display_name()
                                for person in talk.submission.speakers.all()
                            ],
                            "track": {
                                "color": talk.submission.track.color,
                                "name": str(talk.submission.track.name),
                            }
                            if talk.submission.track
                            else None,
                            "room": room["name"].localize(schedule.event.locale),
                            "infoline": infoline.format(**placeholders(schedule, talk)),
                            "urls": {
                                "feedback": "{}{}".format(
                                    schedule.event.custom_domain or settings.SITE_URL,
                                    talk.submission.urls.feedback,
                                ),
                                "feedback_qr": reverse(
                                    "plugins:pretalx_broadcast_tools:feedback_qr_id",
                                    kwargs={
                                        "event": schedule.event.slug,
                                        "talk": talk.submission.id,
                                    },
                                ),
                                "public": "{}{}".format(
                                    schedule.event.custom_domain or settings.SITE_URL,
                                    talk.submission.urls.public,
                                ),
                                "public_qr": reverse(
                                    "plugins:pretalx_broadcast_tools:public_qr_id",
                                    kwargs={
                                        "event": schedule.event.slug,
                                        "talk": talk.submission.id,
                                    },
                                ),
                            },
                        }
                        for day in schedule.data
                        for room in day["rooms"]
                        for talk in room["talks"]
                    ],
                },
            )
        except KeyError as e:
            key = str(e)[1:-1]
            return JsonResponse(
                {
                    "error": [
                        f"Could not find value for placeholder {{{key}}} in info line.",
                        f"If you want to use {{{key}}} without evaluating it, please use as follows: {{{{{key}}}}}",
                    ],
                }
            )
        except Exception as e:
            return JsonResponse(
                {
                    "error": [
                        repr(e),
                    ],
                }
            )
