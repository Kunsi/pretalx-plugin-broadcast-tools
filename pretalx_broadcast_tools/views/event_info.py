from django.http import JsonResponse
from django.views import View


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
                    "show_next_talk": (
                        True
                        if self.request.event.settings.broadcast_tools_room_info_show_next_talk
                        else False
                    ),
                },
                "slug": self.request.event.slug,
                "start": self.request.event.date_from.isoformat(),
                "end": self.request.event.date_to.isoformat(),
                "timezone": str(self.request.event.tz),
                "locale": self.request.event.locale,
            },
        )
