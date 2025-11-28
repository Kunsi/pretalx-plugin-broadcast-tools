function update_lower_third() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return;
    }

    box = document.getElementById('broadcast_tools_lower_thirds_box');
    title = document.getElementById('broadcast_tools_lower_thirds_title');
    speaker = document.getElementById('broadcast_tools_lower_thirds_speaker');
    infoline = document.getElementById('broadcast_tools_lower_thirds_infoline');

    box.style.backgroundColor = event_info['color'];

    if (!room_name) {
        title.innerHTML = 'Room not found. Please check your configuration.';
        speaker.innerHTML = '';
        infoline.innerHTML = '';
        box.style.borderBottom = 'none';
        return;
    }

    if (!schedule)  {
        title.innerHTML = 'Waiting for schedule ...';
        return;
    }

    if ('error' in schedule) {
        title.innerHTML = 'Error';
        speaker.innerHTML = schedule['error'].join('<br>');
        infoline.innerHTML = '';
        return;
    }

    current_talk = get_current_talk(5);
    if (current_talk) {
        title.innerHTML = current_talk['title'];
        speaker.innerHTML = current_talk['persons'].join(', ');
        infoline.innerHTML = current_talk['infoline'];
    } else {
        title.innerHTML = event_info['no_talk'];
        speaker.innerHTML = '';
        infoline.innerHTML = '';
    }

    if (current_talk && current_talk['track']) {
        box.style.borderBottom = '10px solid ' + current_talk['track']['color'];
    } else {
        box.style.borderBottom = 'none';
    }
}
window.setInterval(update_lower_third, 1000);
