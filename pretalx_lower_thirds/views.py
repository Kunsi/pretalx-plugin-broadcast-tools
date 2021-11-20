import datetime as dt
import json
import pytz
import random

from django.contrib import messages
from django.db.models import Case, OuterRef, Subquery, When
from django.http import Http404, JsonResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.functional import cached_property
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _
from django.views.generic.base import TemplateView
from django_context_decorator import context

from pretalx.agenda.views.schedule import ScheduleMixin
from pretalx.common.mixins.views import EventPermissionRequired
from pretalx.common.signals import register_data_exporters
from pretalx.schedule.exporters import ScheduleData


class LowerThirdsView(TemplateView):
    template_name = "pretalx_lower_thirds/lower_thirds.html"


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
                },
                "rooms": sorted({
                    str(room["name"])
                    for day in schedule.data
                    for room in day["rooms"]
                }),
                "talks": [
                    {
                        "id": talk.submission.id,
                        "start": talk.start.astimezone(tz).isoformat(),
                        "end": (talk.start + dt.timedelta(minutes=talk.duration)).astimezone(tz).isoformat(),
                        "slug": talk.frab_slug,
                        "title": talk.submission.title,
                        "persons": sorted({
                            person.get_display_name() for person in talk.submission.speakers.all()
                        }),
                        "track": {
                            "color": talk.submission.track.color,
                            "name": str(talk.submission.track.name),
                        } if talk.submission.track else None,
                        "room": str(room["name"]),
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
