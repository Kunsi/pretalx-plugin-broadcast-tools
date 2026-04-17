const lt_box      = document.getElementById('broadcast_tools_lower_thirds_box');
const lt_title    = document.getElementById('broadcast_tools_lower_thirds_title');
const lt_speaker  = document.getElementById('broadcast_tools_lower_thirds_speaker');
const lt_infoline = document.getElementById('broadcast_tools_lower_thirds_infoline');

function update_lower_third() {
    let room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return;
    }

    lt_box.style.backgroundColor = event_info['color'];

    if (!room_name) {
        lt_title.innerHTML = 'Room not found. Please check your configuration.';
        lt_speaker.innerHTML = '';
        lt_infoline.innerHTML = '';
        lt_box.style.borderBottom = 'none';
        return;
    }

    if (!schedule)  {
        lt_title.innerHTML = 'Waiting for schedule ...';
        return;
    }

    if ('error' in schedule) {
        lt_title.innerHTML = 'Error';
        lt_speaker.innerHTML = schedule['error'].join('<br>');
        lt_infoline.innerHTML = '';
        return;
    }

    let current_talk = get_current_talk(5);
    if (current_talk) {
        lt_title.innerHTML = current_talk['title'];
        lt_speaker.innerHTML = current_talk['persons'].join(', ');
        lt_infoline.innerHTML = current_talk['infoline'];
    } else {
        lt_title.innerHTML = event_info['no_talk'];
        lt_speaker.innerHTML = '';
        lt_infoline.innerHTML = '';
    }

    if (current_talk && current_talk['track']) {
        lt_box.style.borderBottom = '10px solid ' + current_talk['track']['color'];
    } else {
        lt_box.style.borderBottom = 'none';
    }
}
window.setInterval(update_lower_third, 1000);
