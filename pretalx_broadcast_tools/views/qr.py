from xml.etree import ElementTree as ET

import qrcode
import qrcode.image.svg
from django.conf import settings
from django.http import HttpResponse
from django.utils.safestring import mark_safe
from django.views import View


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
