from django import forms
from django.utils.translation import gettext_lazy as _
from hierarkey.forms import HierarkeyForm


class LowerThirdsSettingsForm(HierarkeyForm):
    lower_thirds_no_talk_info = forms.CharField(
        help_text=_(
            "Will be shown as talk title if there's currently no talk "
            "running."
        ),
        initial="Sorry, there's currently no talk running",
        label=_('"no talk running" information'),
        required=True,
    )
    lower_thirds_info_string = forms.CharField(
        help_text=_(
            "Will only be shown if there's a talk running."
        ),
        initial="",
        label=_("info line"),
        required=False,
    )
