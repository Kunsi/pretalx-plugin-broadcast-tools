from django.views.generic import FormView
from pretalx.common.views.mixins import PermissionRequired

from ..forms import BroadcastToolsSettingsForm


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
