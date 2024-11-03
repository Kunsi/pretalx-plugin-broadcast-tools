from django.http import FileResponse, Http404
from django.views import View
from pretalx.common.text.path import safe_filename
from pretalx.common.views.mixins import EventPermissionRequired

from pretalx_broadcast_tools.management.commands.export_voctomix_lower_thirds import (
    get_export_targz_path,
)


class BroadcastToolsLowerThirdsVoctomixDownloadView(EventPermissionRequired, View):
    permission_required = "agenda.view_schedule"

    def get(self, request, *args, **kwargs):
        targz_path = get_export_targz_path(self.request.event)
        if not targz_path.exists():
            raise Http404()
        response = FileResponse(open(targz_path, "rb"), as_attachment=True)
        response["Content-Disposition"] = (
            f"attachment; filename={safe_filename(targz_path.name)}"
        )
        return response
