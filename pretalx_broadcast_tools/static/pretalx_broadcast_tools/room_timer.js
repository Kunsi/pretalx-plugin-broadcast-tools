function _left_zero_pad(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function update_room_info() {
    room_name = get_room_name();

    if (!event_info) {
        console.warn("Waiting for event info ...");
        return;
    }

    let timeleft = document.getElementById('broadcast_tools_room_timer_timeleft_timer');
    let timehint = document.getElementById('broadcast_tools_room_timer_timeleft_hint');
    let eventbar_fill = document.getElementById('broadcast_tools_room_timer_eventbar_fill');
    let eventbar_text = document.getElementById('broadcast_tools_room_timer_eventbar_text');

    let now = new Date();

    function set_timer(text, hint, color, flashing) {
        timeleft.innerHTML = text;
        timehint.innerHTML = hint;
        timeleft.style.color = color;
        if (flashing) {
            timeleft.classList.add('flashing');
        } else {
            timeleft.classList.remove('flashing');
        }
    }

    function wall_clock() {
        return _left_zero_pad(now.getHours()) + ':' + _left_zero_pad(now.getMinutes()) + ':' + _left_zero_pad(now.getSeconds());
    }

    function format_duration(ms) {
        let h = Math.floor(ms / 1000 / 60 / 60);
        let m = Math.floor(ms / 1000 / 60) % 60;
        let s = Math.floor(ms / 1000) % 60;
        if (h > 0) {
            return h + ':' + _left_zero_pad(m) + ':' + _left_zero_pad(s);
        }
        return m + ':' + _left_zero_pad(s);
    }

    if (!room_name) {
        set_timer(wall_clock(), '', 'white', false);
        eventbar_fill.style.width = '0';
        eventbar_text.textContent = event_info['name'];
        return;
    }

    if (!schedule) {
        set_timer('', 'Waiting for schedule \u2026', 'white', false);
        return;
    }

    if ('error' in schedule) {
        set_timer('Error', schedule['error'].join(' / '), 'white', false);
        return;
    }

    if (!schedule['rooms'].includes(room_name)) {
        set_timer(wall_clock(), '', 'white', false);
        eventbar_fill.style.width = '0';
        eventbar_text.textContent = room_name;
        return;
    }

    let current_talk = get_current_talk(60);
    let next_talk = get_next_talk();

    if (current_talk) {
        let scheduled_start = new Date(current_talk['start']);
        let scheduled_end = new Date(current_talk['end']);

        if (scheduled_start > now) {
            // Talk not yet started
            set_timer('', '', 'white', false);
            eventbar_fill.style.width = '0';
            eventbar_text.textContent = format_time_from_pretalx(current_talk['start']) + ' \u2013 ' + current_talk['title'];
        } else if (scheduled_end <= now) {
            // Talk has ended (within grace period)
            if (next_talk) {
                // Break before next talk
                set_timer(wall_clock(), '', 'white', false);
                eventbar_fill.style.width = '0';
                eventbar_text.textContent = format_time_from_pretalx(next_talk['start']) + ' \u2013 ' + next_talk['title'];
            } else {
                // No following talk — count up from scheduled end, flash
                let overtime = now - scheduled_end;
                set_timer('+' + format_duration(overtime), 'talk has ended', 'red', true);
                eventbar_fill.style.width = '100%';
                eventbar_text.textContent = current_talk['title'];
            }
        } else {
            // Talk is running
            let remaining = scheduled_end - now;
            let total = scheduled_end - scheduled_start;
            let progress = ((now - scheduled_start) / total) * 100;

            let color;
            if (remaining < 2 * 60 * 1000) {
                color = 'red';
            } else if (remaining < 5 * 60 * 1000) {
                color = 'orange';
            } else {
                color = 'white';
            }

            set_timer(format_duration(remaining), 'left in this talk', color, false);
            eventbar_fill.style.width = Math.min(100, progress) + '%';
            eventbar_text.textContent = current_talk['title'];
        }
    } else {
        // Break
        set_timer(wall_clock(), '', 'white', false);
        eventbar_fill.style.width = '0';
        if (next_talk) {
            eventbar_text.textContent = format_time_from_pretalx(next_talk['start']) + ' \u2013 ' + next_talk['title'];
        } else {
            eventbar_text.textContent = '';
        }
    }
}
window.setInterval(update_room_info, 1000);
