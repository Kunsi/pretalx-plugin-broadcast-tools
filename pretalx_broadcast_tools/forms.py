from django.forms import BooleanField, CharField
from django.utils.translation import gettext_lazy as _
from hierarkey.forms import HierarkeyForm
from i18nfield.forms import I18nFormField, I18nFormMixin, I18nTextInput


class BroadcastToolsSettingsForm(I18nFormMixin, HierarkeyForm):
    lower_thirds_no_talk_info = I18nFormField(
        help_text=_(
            "Will be shown as talk title if there's currently no talk running."
        ),
        label=_('"no talk running" information'),
        widget=I18nTextInput,
        required=True,
    )
    lower_thirds_info_string = I18nFormField(
        help_text=_("Will only be shown if there's a talk running."),
        label=_("info line"),
        required=False,
        widget=I18nTextInput,
    )
    broadcast_tools_pdf_show_internal_notes = BooleanField(
        help_text=_(
            "If checked, the value of the 'internal notes' field in a "
            "submission will get added to the pdf export."
        ),
        label=_("Show internal notes in pdf export"),
        required=False,
    )
    broadcast_tools_pdf_ignore_do_not_record = BooleanField(
        help_text=_(
            "If checked, 'do not record' talks will not generate a page "
            "in the pdf export."
        ),
        label=_("Ignore 'do not record' talks when generating pdf"),
        required=False,
    )
    broadcast_tools_pdf_questions_to_include = CharField(
        help_text=_(
            "Comma-Separated list of question ids to include in pdf export. "
            "If empty, no questions will get added."
        ),
        label=_("Questions to include"),
        required=False,
    )
