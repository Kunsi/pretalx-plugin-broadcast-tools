def placeholders(schedule, talk):
    return {
        "EVENT_SLUG": str(schedule.event.slug),
        "TALK_SLUG": talk.frab_slug,
        "CODE": talk.submission.code,
    }
