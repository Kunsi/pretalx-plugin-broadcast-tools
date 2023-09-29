import datetime as dt
from xml.etree import ElementTree as ET

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
                "name": self.request.event.name.localize(self.request.event.locale),
                "no_talk": str(
                    self.request.event.settings.broadcast_tools_lower_thirds_no_talk_info
                ),
                "room-info": {
                    "lower_info": self.request.event.settings.broadcast_tools_room_info_lower_content
                    or "",
                    "show_next_talk": True
                    if self.request.event.settings.broadcast_tools_room_info_show_next_talk
                    else False,
                },
                "slug": self.request.event.slug,
                "start": self.request.event.date_from.isoformat(),
                "end": self.request.event.date_to.isoformat(),
                "timezone": str(self.request.event.tz),
                "locale": self.request.event.locale,
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
                            "start": talk.start.astimezone(
                                schedule.event.tz
                            ).isoformat(),
                            "start_ts": int(talk.start.timestamp()),
                            "end": (talk.start + dt.timedelta(minutes=talk.duration))
                            .astimezone(schedule.event.tz)
                            .isoformat(),
                            "end_ts": int(
                                (
                                    talk.start + dt.timedelta(minutes=talk.duration)
                                ).timestamp()
                            ),
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
                            "image_url": talk.submission.image_url,
                            "locale": talk.submission.content_locale,
                            "do_not_record": talk.submission.do_not_record,
                            "abstract": talk.submission.abstract,
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
