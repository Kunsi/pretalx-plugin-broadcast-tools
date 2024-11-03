function update_room_info() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

    box = document.getElementById('broadcast_tools_room_timer');
    header = document.getElementById('broadcast_tools_room_timer_header');
    title = document.getElementById('broadcast_tools_room_timer_title');
    speaker = document.getElementById('broadcast_tools_room_timer_speaker');
    scheduledata = document.getElementById('broadcast_tools_room_timer_scheduledata');
    timeleft = document.getElementById('broadcast_tools_room_timer_timeleft');
    progressbar = document.getElementById('broadcast_tools_room_timer_progressbar');

    box.style.backgroundColor = event_info['color'];

    if (!schedule)  {
        speaker.innerHTML = 'Waiting for schedule ...';
        return
    }

    if ('error' in schedule) {
        title.innerHTML = 'Error';
        speaker.innerHTML = schedule['error'].join('<br>');
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        title.innerHTML = 'Error';
        speaker.innerHTML = 'Invalid room_name. Valid names: ' + schedule['rooms'].join(', ');
        return
    }

    current_talk = get_current_talk(60);
    next_talk = get_next_talk();

    if (current_talk) {
        title.innerHTML = current_talk['title'];
        speaker.innerHTML = current_talk['persons'].join(', ');
        scheduledata.innerHTML = format_time_from_pretalx(current_talk['start']);
        scheduledata.innerHTML += ' - ';
        scheduledata.innerHTML += format_time_from_pretalx(current_talk['end']);

        now = new Date();
        scheduled_start = new Date(current_talk['start']);
        scheduled_end = new Date(current_talk['end']);

        if (scheduled_start > now || scheduled_end < now) {
            timeleft.innerHTML = '';
            progressbar.style.width = '0';
        } else {
            diff = scheduled_end - now;
            let diff_s = Math.floor(Math.floor(diff / 1000) % 60/10);
            let diff_m = Math.floor(diff / 1000 / 60) % 60;

            timeleft.innerHTML = diff_m + 'min ' + diff_s + '0sec';

            total_time = scheduled_end - scheduled_start;
            progressbar.style.width = (((diff/total_time)*100)-100)*-1 + 'vw';
        }

        if (current_talk['track']) {
            header.style.backgroundColor = current_talk['track']['color'];
            progressbar.style.backgroundColor = current_talk['track']['color'];
        } else {
            header.style.backgroundColor = null;
            progressbar.style.backgroundColor = event_info['color'];
        }
    } else {
        title.innerHTML = room_name;
        scheduledata.innerHTML = '';
        timeleft.innerHTML = '';
        progressbar.style.width = '0';

        if (next_talk) {
            speaker.innerHTML = format_time_from_pretalx(next_talk['start']) + ' ' + next_talk['title'];

            if (next_talk['track']) {
                header.style.backgroundColor = next_talk['track']['color'];
            } else {
                header.style.backgroundColor = null;
            }
        } else {
            speaker.innerHTML = '';
        }
    }
}
window.setInterval(update_room_info, 1000);
