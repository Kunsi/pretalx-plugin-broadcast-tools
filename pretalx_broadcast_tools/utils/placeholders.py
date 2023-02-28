from django.conf import settings

def placeholders(schedule, talk):
    return {
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
    }
