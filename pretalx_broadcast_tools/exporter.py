from tempfile import NamedTemporaryFile

from django.http import HttpResponse
from django.utils.timezone import now
from pretalx.schedule.exporters import ScheduleData
from pretalx.submission.models import SubmissionStates
from reportlab.graphics import renderPDF
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, StyleSheet1
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable,
    PageBreak,
    PageTemplate,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

A4_WIDTH, A4_HEIGHT = A4
PAGE_PADDING = 10 * mm


class PDFInfoPage(Flowable):
    def __init__(self, event, fahrplan_day, room_details, talk, style):
        super().__init__()
        self.event = event
        self.talk = talk
        self.day = fahrplan_day
        self.room = room_details
        self.style = style
        self.y_position = PAGE_PADDING

    def _add(self, item, gap=2):
        _, height = item.wrapOn(
            self.canv, A4_WIDTH - 2 * PAGE_PADDING, A4_HEIGHT - 2 * PAGE_PADDING
        )
        self.y_position += height + gap * mm
        item.drawOn(self.canv, PAGE_PADDING, -self.y_position)

    def _checkbox_text(self, text, **kwargs):
        item = Paragraph(text, **kwargs)
        _, height = item.wrapOn(
            self.canv, A4_WIDTH - 2 * PAGE_PADDING, A4_HEIGHT - 2 * PAGE_PADDING
        )
        self.y_position += height + 2 * mm
        item.drawOn(self.canv, PAGE_PADDING + 1.3 * height, -self.y_position)
        self.canv.rect(PAGE_PADDING, -self.y_position, height * 0.8, height * 0.8)

    def _space(self):
        self._add(Spacer(1, PAGE_PADDING / 2))

    def draw(self):
        # add Submission code, type, title and "do not record"
        # horizontally to the side of the page.
        self.canv.saveState()
        self.canv.rotate(90)
        self.canv.setFont("Helvetica", 12)
        self.canv.drawString(
            -(A4_HEIGHT - (PAGE_PADDING / 3)),
            -(PAGE_PADDING / 3),
            f"{self.talk.submission.code} | {self.talk.submission.submission_type.name} | {self.event.name} | {self.talk.local_start.isoformat()} | Day {self.day['index']} | {self.room['name']}",
        )
        self.canv.restoreState()

        if self.talk.submission.do_not_record:
            self._add(
                Paragraph("DO NOT RECORD. DO NOT STREAM", style=self.style["Warning"]),
                gap=0,
            )
            self._space()

        self._add(
            Paragraph(
                f"{self.event.name} | {self.room['name']} | {self.talk.local_start.strftime('%F %T')} {self.event.timezone}",
                style=self.style["Meta"],
            )
        )
        self._add(
            Paragraph(self.talk.submission.title, style=self.style["Title"]), gap=0
        )
        self._space()

        for spk in self.talk.submission.speakers.all():
            self._checkbox_text(
                spk.get_display_name(),
                style=self.style["Speaker"],
            )
        self._space()

        self._add(
            Table(
                [
                    (
                        "Duration",
                        "Language",
                        "Type",
                        "Code",
                    ),
                    (
                        self.talk.export_duration,
                        self.talk.submission.content_locale,
                        self.talk.submission.submission_type.name,
                        self.talk.submission.code,
                    ),
                ],
                colWidths=30 * mm,
                style=TableStyle(
                    [
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                        ("BOX", (0, 0), (-1, -1), 0.25, colors.black),
                    ]
                ),
            )
        )

        if self.talk.submission.abstract:
            self._space()
            self._add(
                Paragraph(
                    self.talk.submission.abstract,
                    style=self.style["Abstract"],
                )
            )

        if self.talk.submission.notes:
            self._space()
            for line in self.talk.submission.notes.splitlines():
                line = line.strip()
                if not line:
                    continue
                self._add(
                    Paragraph(
                        line,
                        style=self.style["Notes"],
                    )
                )

        if self.talk.submission.internal_notes:
            self._space()
            for line in self.talk.submission.internal_notes.splitlines():
                line = line.strip()
                if not line:
                    continue
                self._add(
                    Paragraph(
                        line,
                        style=self.style["Notes"],
                    )
                )


class PDFExporter(ScheduleData):
    identifier = "broadcast_pdf"
    verbose_name = "Broadcast Tools PDF (with internal notes)"
    public = False
    show_qrcode = False
    icon = "fa-file-pdf"

    def _add_pages(self, doc):
        style = self._style()
        pages = []
        for fahrplan_day in self.data:
            for room_details in fahrplan_day["rooms"]:
                for talk in room_details["talks"]:
                    pages.append(
                        PDFInfoPage(self.event, fahrplan_day, room_details, talk, style)
                    )
                    pages.append(PageBreak())
        return pages

    def _style(self):
        stylesheet = StyleSheet1()
        stylesheet.add(
            ParagraphStyle(name="Normal", fontName="Helvetica", fontSize=12, leading=14)
        )
        stylesheet.add(
            ParagraphStyle(
                name="Title", fontName="Helvetica-Bold", fontSize=20, leading=24
            )
        )
        stylesheet.add(
            ParagraphStyle(
                name="Speaker", fontName="Helvetica-Oblique", fontSize=12, leading=14
            )
        )
        stylesheet.add(
            ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=10, leading=12)
        )
        stylesheet.add(
            ParagraphStyle(
                name="Abstract", fontName="Helvetica", fontSize=14, leading=16
            )
        )
        stylesheet.add(
            ParagraphStyle(
                name="Notes", fontName="Helvetica-Oblique", fontSize=12, leading=14
            )
        )
        stylesheet.add(
            ParagraphStyle(
                name="Warning",
                fontName="Helvetica-Bold",
                fontSize=20,
                leading=24,
                alignment=TA_CENTER,
                textColor=colors.red,
            )
        )
        return stylesheet

    def render(self, *args, **kwargs):
        with NamedTemporaryFile(suffix=".pdf") as f:
            doc = SimpleDocTemplate(
                f.name,
                pagesize=A4,
                rightMargin=0,
                leftMargin=0,
                topMargin=0,
                bottomMargin=0,
            )
            doc.build(self._add_pages(doc))
            f.seek(0)
            timestamp = now().strftime("%Y-%m-%d-%H%M")

            return (
                f"{self.event.slug}_broadcast_tools_{timestamp}.pdf",
                "application/pdf",
                f.read(),
            )