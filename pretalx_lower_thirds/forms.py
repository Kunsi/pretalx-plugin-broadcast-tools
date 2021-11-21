from django.utils.translation import gettext_lazy as _
from hierarkey.forms import HierarkeyForm
from i18nfield.forms import I18nFormField, I18nFormMixin, I18nTextInput


class LowerThirdsSettingsForm(I18nFormMixin, HierarkeyForm):
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
