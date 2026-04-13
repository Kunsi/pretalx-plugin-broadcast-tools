const ri_box      = document.getElementById('broadcast_tools_room_info');
const ri_roomname = document.getElementById('broadcast_tools_room_info_roomname');
const ri_title    = document.getElementById('broadcast_tools_room_info_title');
const ri_speaker  = document.getElementById('broadcast_tools_room_info_speaker');
const ri_qr       = document.getElementById('broadcast_tools_room_info_qr');

function update_room_info() {
    let room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return;
    }

    if (!room_name) {
        ri_roomname.innerHTML = event_info['name'];
        ri_title.innerHTML = 'Backstage';
        ri_speaker.innerHTML = '';
        ri_box.style.backgroundColor = event_info['color'];
        return;
    }

    if (!schedule)  {
        ri_speaker.innerHTML = 'Waiting for schedule ...';
        return;
    }

    if ('error' in schedule) {
        ri_title.innerHTML = 'Error';
        ri_speaker.innerHTML = schedule['error'].join('<br>');
        ri_qr.innerHTML = '';
        return;
    }

    if (!schedule['rooms'].includes(room_name)) {
        ri_roomname.innerHTML = event_info['name'];
        ri_title.innerHTML = room_name;
        ri_speaker.innerHTML = '';
        ri_qr.innerHTML = '';
        ri_box.style.backgroundColor = event_info['color'];
        return;
    }

    let current_talk = get_current_talk(15);
    let next_talk = get_next_talk();

    if (current_talk) {
        let qr_info;
        if (event_info['room-info']['lower_info'] == 'feedback_qr') {
            qr_info = '<img src="' + current_talk['urls']['feedback_qr'] + '" alt="Feedback QR Code"><p>Leave Feedback by scanning the code or visiting ' + current_talk['urls']['feedback'] + '</p>';
        } else if (event_info['room-info']['lower_info'] == 'public_qr') {
            qr_info = '<img src="' + current_talk['urls']['public_qr'] + '" alt="QR Code linking to URL below"><p>' + current_talk['urls']['public'] + '</p>';
        } else if (event_info['room-info']['lower_info'] == 'talk_image' && current_talk['image_url']) {
            qr_info = '<img src="' + current_talk['image_url'] + '" alt="Talk image">';
        } else {
            qr_info = '';
        }

        ri_roomname.innerHTML = room_name;
        ri_title.innerHTML = current_talk['title'];
        ri_speaker.innerHTML = current_talk['persons'].join(', ');
        ri_qr.innerHTML = qr_info;
    } else {
        ri_roomname.innerHTML = event_info['name'];
        ri_title.innerHTML = room_name;
        ri_qr.innerHTML = '';

        if (next_talk && event_info['room-info']['show_next_talk']) {
            ri_speaker.innerHTML = format_time_from_pretalx(next_talk['start']) + ' ' + next_talk['title'];
        } else {
            ri_speaker.innerHTML = '';
        }
    }

    if (current_talk && current_talk['track']) {
        ri_box.style.backgroundColor = current_talk['track']['color'];
    } else if (next_talk && next_talk['track'] && event_info['room-info']['show_next_talk']) {
        ri_box.style.backgroundColor = next_talk['track']['color'];
    } else {
        ri_box.style.backgroundColor = event_info['color'];
    }
}
window.setInterval(update_room_info, 1000);
