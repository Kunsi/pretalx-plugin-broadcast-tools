from xml.etree import ElementTree

import qrcode
import qrcode.image.svg
from django.conf import settings
from django.http import HttpResponse
from django.utils.safestring import mark_safe
from django.views import View


def _make_svg_response(url):
    image = qrcode.make(url, image_factory=qrcode.image.svg.SvgImage)
    svg_data = mark_safe(ElementTree.tostring(image.get_image()).decode())
    return HttpResponse(svg_data, content_type="image/svg+xml")


class BroadcastToolsFeedbackQrCodeSvg(View):
    def get(self, request, *args, **kwargs):
        talk = self.request.event.submissions.filter(id=kwargs["talk"]).first()
        domain = request.event.custom_domain or settings.SITE_URL
        return _make_svg_response(f"{domain}{talk.urls.feedback}")


class BroadcastToolsPublicQrCodeSvg(View):
    def get(self, request, *args, **kwargs):
        talk = self.request.event.submissions.filter(id=kwargs["talk"]).first()
        domain = request.event.custom_domain or settings.SITE_URL
        return _make_svg_response(f"{domain}{talk.urls.public}")
