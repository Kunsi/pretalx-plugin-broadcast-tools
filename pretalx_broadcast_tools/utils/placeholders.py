from django.conf import settings


def placeholders(schedule, talk, supports_html_colour=False):
    track_name = str(talk.submission.track.name) if talk.submission.track else ""

    result = {
        "CODE": talk.submission.code,
        "EVENT_SLUG": str(schedule.event.slug),
        "FEEDBACK_URL": "{}{}".format(
            schedule.event.custom_domain or settings.SITE_URL,
            talk.submission.urls.feedback,
        ),
        "TALK_SLUG": talk.frab_slug,
        "TALK_URL": "{}{}".format(
            schedule.event.custom_domain or settings.SITE_URL,
            talk.submission.urls.public,
        ),
        "TRACK_NAME": track_name,
    }

    if talk.submission.track and supports_html_colour:
        result["TRACK_NAME_COLOURED"] = '<span style="color: {}">{}</span>'.format(
            talk.submission.track.color, track_name
        )
    else:
        result["TRACK_NAME_COLOURED"] = track_name

    # for the americans
    result["TRACK_NAME_COLORED"] = result["TRACK_NAME_COLOURED"]

    return result
