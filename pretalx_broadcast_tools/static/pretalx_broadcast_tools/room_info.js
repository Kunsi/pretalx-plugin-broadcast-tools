function update_room_info() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return;
    }

    box = document.getElementById('broadcast_tools_room_info');
    roomname = document.getElementById('broadcast_tools_room_info_roomname');
    title = document.getElementById('broadcast_tools_room_info_title');
    speaker = document.getElementById('broadcast_tools_room_info_speaker');
    qr = document.getElementById('broadcast_tools_room_info_qr');

    if (!room_name) {
        roomname.innerHTML = event_info['name'];
        title.innerHTML = 'Backstage';
        speaker.innerHTML = '';
        box.style.backgroundColor = event_info['color'];
        return;
    }

    if (!schedule)  {
        speaker.innerHTML = 'Waiting for schedule ...';
        return;
    }

    if ('error' in schedule) {
        title.innerHTML = 'Error';
        speaker.innerHTML = schedule['error'].join('<br>');
        qr.innerHTML = '';
        return;
    }

    if (!schedule['rooms'].includes(room_name)) {
        roomname.innerHTML = event_info['name'];
        title.innerHTML = room_name;
        speaker.innerHTML = '';
        qr.innerHTML = '';
        box.style.backgroundColor = event_info['color'];
        return;
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

        roomname.innerHTML = room_name;
        title.innerHTML = current_talk['title'];
        speaker.innerHTML = current_talk['persons'].join(', ');
        qr.innerHTML = qr_info;
    } else {
        roomname.innerHTML = event_info['name'];
        title.innerHTML = room_name;
        qr.innerHTML = '';

        if (next_talk && event_info['room-info']['show_next_talk']) {
            speaker.innerHTML = format_time_from_pretalx(next_talk['start']) + ' ' + next_talk['title'];
        } else {
            speaker.innerHTML = '';
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
