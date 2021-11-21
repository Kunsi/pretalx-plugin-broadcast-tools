import datetime as dt

import pytz
from django.http import JsonResponse
from django.views.generic import FormView
from django.views.generic.base import TemplateView
from pretalx.agenda.views.schedule import ScheduleMixin
from pretalx.common.mixins.views import (
    EventPermissionRequired, PermissionRequired,
)
from pretalx.schedule.exporters import ScheduleData

from .forms import LowerThirdsSettingsForm


class LowerThirdsView(TemplateView):
    template_name = "pretalx_lower_thirds/lower_thirds.html"


class LowerThirdsOrgaView(PermissionRequired, FormView):
    form_class = LowerThirdsSettingsForm
    permission_required = "orga.change_settings"
    template_name = "pretalx_lower_thirds/orga.html"

    def get_success_url(self):
        return self.request.path

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
            **kwargs,
        }


class ScheduleView(EventPermissionRequired, ScheduleMixin, TemplateView):
    permission_required = "agenda.view_schedule"

    def get(self, request, *args, **kwargs):
        schedule = ScheduleData(
            event=self.request.event,
            schedule=self.schedule,
        )
        tz = pytz.timezone(schedule.event.timezone)
        return JsonResponse(
            {
                "conference": {
                    "slug": schedule.event.slug,
                    "name": str(schedule.event.name),
                    "no_talk": str(
                        schedule.event.settings.lower_thirds_no_talk_info),
                },
                "rooms": sorted(
                    {
                        str(room["name"])
                        for day in schedule.data
                        for room in day["rooms"]
                    }
                ),
                "talks": [
                    {
                        "id": talk.submission.id,
                        "start": talk.start.astimezone(tz).isoformat(),
                        "end": (
                            talk.start +
                            dt.timedelta(minutes=talk.duration)
                        ).astimezone(tz).isoformat(),
                        "slug": talk.frab_slug,
                        "title": talk.submission.title,
                        "persons": sorted(
                            {
                                person.get_display_name()
                                for person in talk.submission.speakers.all()
                            }
                        ),
                        "track": {
                            "color": talk.submission.track.color,
                            "name": str(talk.submission.track.name),
                        }
                        if talk.submission.track
                        else None,
                        "room": str(room["name"]),
                        "infoline": str(
                            schedule.event.settings.lower_thirds_info_string
                        ).format(
                            EVENT_SLUG=str(schedule.event.slug),
                            TALK_SLUG=talk.frab_slug,
                            CODE=talk.submission.code,
                        ),
                    }
                    for day in schedule.data
                    for room in day["rooms"]
                    for talk in room["talks"]
                ],
            },
            json_dumps_params={
                "indent": 4,
            },
        )
