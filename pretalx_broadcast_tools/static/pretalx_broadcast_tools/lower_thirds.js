function update_lower_third() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

    box = document.getElementById('broadcast_tools_lower_thirds_box');
    title = document.getElementById('broadcast_tools_lower_thirds_title').innerHTML;
    speaker = document.getElementById('broadcast_tools_lower_thirds_speaker').innerHTML;
    infoline = document.getElementById('broadcast_tools_lower_thirds_infoline').innerHTML;

    box.style.backgroundColor = event_info['color']);

    if (!schedule)  {
        title = 'Waiting for schedule ...';
        return
    }

    if ('error' in schedule) {
        title = 'Error';
        speaker = schedule['error'].join('<br>');
        infoline = '';
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        title = 'Error';
        speaker = 'Invalid room_name. Valid names: ' + schedule['rooms'].join(', ');
        infoline = '';
        return
    }

    current_talk = get_current_talk(5);
    if (current_talk) {
        title = current_talk['title'];
        speaker = current_talk['persons'].join(', ');
        infoline = current_talk['infoline'];
    } else {
        title = event_info['no_talk'];
        speaker = '';
        infoline = '';
    }

    if (current_talk && current_talk['track']) {
        box.style.borderBottom = '10px solid ' + current_talk['track']['color'];
    } else {
        box.style.borderBottom = 'none';
    }
}
window.setInterval(update_lower_third, 1000);
