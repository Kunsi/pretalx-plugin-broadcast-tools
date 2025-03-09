function _left_zero_pad(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

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
    timeleft = document.getElementById('broadcast_tools_room_timer_timeleft_timer');
    timehint = document.getElementById('broadcast_tools_room_timer_timeleft_hint');
    progressbar= document.getElementById('broadcast_tools_room_timer_progressbar');
    progressbar_bar = document.getElementById('broadcast_tools_room_timer_progressbar_bar');

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
    now = new Date();

    if (current_talk) {
        title.innerHTML = current_talk['title'];
        speaker.innerHTML = current_talk['persons'].join(', ');
        scheduledata.innerHTML = format_time_from_pretalx(current_talk['start']);
        scheduledata.innerHTML += ' - ';
        scheduledata.innerHTML += format_time_from_pretalx(current_talk['end']);

        scheduled_start = new Date(current_talk['start']);
        scheduled_end = new Date(current_talk['end']);

        if (scheduled_start > now) {
            timeleft.innerHTML = '';
            progressbar_bar.style.width = '0';
            timehint.innerHTML = '';
        } else if (scheduled_end < now) {
            timeleft.innerHTML = '0sec';
            progressbar_bar.style.width = '100vw';
            timehint.innerHTML = 'talk has ended';
        } else {
            diff = scheduled_end - now;
            let diff_s = Math.floor(Math.floor(diff / 1000) % 60);
            let diff_m = Math.floor(diff / 1000 / 60) % 60;

            timeleft.innerHTML = diff_m + 'min ' + diff_s + 'sec';

            total_time = scheduled_end - scheduled_start;
            progressbar_bar.style.width = (((diff/total_time)*100)-100)*-1 + 'vw';
            timehint.innerHTML = 'left in this talk';
        }

        if (current_talk['track']) {
            header.style.backgroundColor = current_talk['track']['color'];
            progressbar.style.borderTop = '2px solid ' + current_talk['track']['color'];
            progressbar_bar.style.backgroundColor = current_talk['track']['color'];
        } else {
            header.style.backgroundColor = null;
            progressbar.style.borderTop = '2px solid white';
            progressbar_bar.style.backgroundColor = 'white';
        }
    } else {
        progressbar.style.borderTop = 'none';
        progressbar_bar.style.width = '0';
        speaker.innerHTML = 'Break';
        timehint.innerHTML = '';
        title.innerHTML = room_name;

        timeleft.innerHTML = _left_zero_pad(now.getHours()) + ":" + _left_zero_pad(now.getMinutes()) + ":" + _left_zero_pad(now.getSeconds());

        if (next_talk) {
            scheduledata.innerHTML = format_time_from_pretalx(next_talk['start']) + ' ' + next_talk['title'];

            if (next_talk['track']) {
                header.style.backgroundColor = next_talk['track']['color'];
            } else {
                header.style.backgroundColor = null;
            }
        } else {
            scheduledata.innerHTML = '';
        }
    }
}
window.setInterval(update_room_info, 1000);
