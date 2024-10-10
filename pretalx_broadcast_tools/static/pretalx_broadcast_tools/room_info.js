function update_room_info() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

    box = document.getElementById('broadcast_tools_room_info');
    roomname = document.getElementById('broadcast_tools_room_info_roomname').innerHTML;
    title = document.getElementById('broadcast_tools_room_info_title').innerHTML;
    speaker = document.getElementById('broadcast_tools_room_info_speaker').innerHTML;
    qr = document.getElementById('broadcast_tools_room_info_qr').innerHTML;

    if (!room_name) {
        roomname = event_info['name'];
        title = 'Backstage';
        speaker = '';
        qr = '';
        box.style.backgroundColor = event_info['color'];
        return
    }

    if (!schedule)  {
        speaker = 'Waiting for schedule ...';
        return
    }

    if ('error' in schedule) {
        title = 'Error';
        speaker = schedule['error'].join('<br>');
        qr = '';
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        title = 'Error';
        speaker = 'Invalid room_name. Valid names: ' + schedule['rooms'].join(', ');
        qr = '';
        return
    }

    current_talk = get_current_talk(15);
    next_talk = get_next_talk();

    if (current_talk) {
        if (event_info['room-info']['lower_info'] == 'feedback_qr') {
            qr_info = '<img src="' + current_talk['urls']['feedback_qr'] + '" alt="Feedback QR Code"><p>Leave Feedback by scanning the code or visiting ' + current_talk['urls']['feedback'] + '</p>';
        } else if (event_info['room-info']['lower_info'] == 'public_qr') {
            qr_info = '<img src="' + current_talk['urls']['public_qr'] + '" alt="QR Code linking to URL below"><p>' + current_talk['urls']['public'] + '</p>';
        } else if (event_info['room-info']['lower_info'] == 'talk_image' && current_talk['image_url']) {
            qr_info = '<img src="' + current_talk['image_url'] + '" alt="Talk image">';
        } else {
            qr_info = '';
        }

        roomname = room_name;
        title = current_talk['title'];
        speaker = current_talk['persons'].join(', ');
        qr = qr_info;
    } else {
        roomname = event_info['name'];
        title = room_name;
        qr = '';

        if (next_talk && event_info['room-info']['show_next_talk']) {
            speaker = format_time_from_pretalx(next_talk['start']) + ' ' + next_talk['title'];
        } else {
            speaker = '';
        }
    }

    if (current_talk && current_talk['track']) {
        box.style.backgroundColor = current_talk['track']['color'];
    } else if (next_talk && next_talk['track'] && event_info['room-info']['show_next_talk']) {
        box.style.backgroundColor = next_talk['track']['color'];
    } else {
        box.style.backgroundColor = event_info['color'];
    }
}
window.setInterval(update_room_info, 1000);
