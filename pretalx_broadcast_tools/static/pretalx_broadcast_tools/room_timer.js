const _pad = i => String(i).padStart(2, '0');

const rt_topbar       = document.getElementById('broadcast_tools_room_timer_topbar');
const rt_topbar_text  = document.getElementById('broadcast_tools_room_timer_topbar_text');
const rt_timeleft     = document.getElementById('broadcast_tools_room_timer_timeleft_timer');
const rt_eventbar_fill = document.getElementById('broadcast_tools_room_timer_eventbar_fill');
const rt_eventbar_text = document.getElementById('broadcast_tools_room_timer_eventbar_text');

function set_timer(text, color, flashing) {
    rt_timeleft.innerHTML = text;
    rt_timeleft.style.color = color;
    rt_timeleft.classList.toggle('flashing', flashing);
}

function wall_clock(now) {
    return _pad(now.getHours()) + ':' + _pad(now.getMinutes()) + ':' + _pad(now.getSeconds());
}

function format_duration(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return (h > 0 ? h + ':' + _pad(m) : m) + ':' + _pad(s);
}

function update_room_info() {
    let room_name = get_room_name();

    if (!event_info) {
        console.warn("Waiting for event info ...");
        return;
    }

    let now = new Date();

    rt_topbar_text.textContent = event_info['name'];
    rt_topbar.style.backgroundColor = event_info['color'];

    if (!room_name) {
        set_timer(wall_clock(now), 'white', false);
        rt_eventbar_fill.style.width = '0';
        rt_eventbar_text.textContent = event_info['name'];
        return;
    }

    if (!schedule) {
        set_timer('', 'white', false);
        rt_eventbar_fill.style.width = '0';
        rt_eventbar_text.textContent = 'Waiting for schedule \u2026';
        return;
    }

    if ('error' in schedule) {
        set_timer('Error', 'white', false);
        rt_eventbar_fill.style.width = '0';
        rt_eventbar_text.textContent = schedule['error'].join(' / ');
        return;
    }

    if (!schedule['rooms'].includes(room_name)) {
        set_timer(wall_clock(now), 'white', false);
        rt_eventbar_fill.style.width = '0';
        rt_eventbar_text.textContent = room_name;
        return;
    }

    let current_talk = get_current_talk(60);

    if (current_talk) {
        let scheduled_start = new Date(current_talk['start']);
        let scheduled_end = new Date(current_talk['end']);

        if (scheduled_start > now) {
            // Talk not yet started — show allocated duration in grey
            set_timer(format_duration(scheduled_end - scheduled_start), '#666', false);
            rt_eventbar_fill.style.width = '0';
            rt_eventbar_text.textContent = format_time_from_pretalx(current_talk['start']) + ' \u2013 ' + current_talk['title'];
        } else if (scheduled_end <= now) {
            // Talk has ended (within grace period) — count up from scheduled end
            set_timer('+' + format_duration(now - scheduled_end), 'red', true);
            rt_eventbar_fill.style.width = '100%';
            rt_eventbar_text.textContent = current_talk['title'];
        } else {
            // Talk is running
            let remaining = scheduled_end - now;
            let progress = ((now - scheduled_start) / (scheduled_end - scheduled_start)) * 100;
            let color = remaining < 120000 ? 'red' : remaining < 300000 ? 'orange' : 'white';

            set_timer(format_duration(remaining), color, false);
            rt_eventbar_fill.style.width = Math.min(100, progress) + '%';
            rt_eventbar_text.textContent = current_talk['title'];
            if (current_talk['track']) {
                rt_topbar.style.backgroundColor = current_talk['track']['color'];
            }
        }
    } else {
        // Break
        let next_talk = get_next_talk();
        rt_eventbar_fill.style.width = '0';
        if (next_talk) {
            let next_start = new Date(next_talk['start']);
            let next_end = new Date(next_talk['end']);
            if (next_start - now <= 3600000) {
                set_timer(format_duration(next_end - next_start), '#666', false);
            } else {
                set_timer(wall_clock(now), 'white', false);
            }
            rt_eventbar_text.textContent = format_time_from_pretalx(next_talk['start']) + ' \u2013 ' + next_talk['title'];
        } else {
            set_timer(wall_clock(now), 'white', false);
            rt_eventbar_text.textContent = '';
        }
    }
}
window.setInterval(update_room_info, 1000);
