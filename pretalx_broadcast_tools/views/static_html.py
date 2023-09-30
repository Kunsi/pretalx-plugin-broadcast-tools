from django.views.generic.base import TemplateView


class BroadcastToolsLowerThirdsView(TemplateView):
    template_name = "pretalx_broadcast_tools/lower_thirds.html"


class BroadcastToolsRoomInfoView(TemplateView):
    template_name = "pretalx_broadcast_tools/room_info.html"
