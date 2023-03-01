$(function() {
    $('#broadcast_tools_room_info_title').text('Content will appear soon.');
    $('#broadcast_tools_room_info_speaker').text('');
    $('#broadcast_tools_room_info_qr').text('');
});

function update_room_info() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

    if (!room_name) {
        $('#broadcast_tools_room_info_roomname').text(event_info['name']);
        $('#broadcast_tools_room_info_title').text('Backstage');
        $('#broadcast_tools_room_info_speaker').text('');
        $('#broadcast_tools_room_info_qr').text('');
        $('#broadcast_tools_room_info').css('background-color', event_info['color']);
        return
    }

    if (!schedule)  {
        $('#broadcast_tools_room_info_speaker').text('Waiting for schedule ...')
        return
    }

    if ('error' in schedule) {
        $('#broadcast_tools_room_info_title').text('Error')
        $('#broadcast_tools_room_info_speaker').html(schedule['error'].join('<br>'));
        $('#broadcast_tools_room_info_qr').text('');
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        $('#broadcast_tools_room_info_title').text('Error')
        $('#broadcast_tools_room_info_speaker').text('Invalid room_name. Valid names: ' + schedule['rooms'].join(', '));
        $('#broadcast_tools_room_info_qr').text('');
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

        $('#broadcast_tools_room_info_roomname').text(room_name);
        $('#broadcast_tools_room_info_title').text(current_talk['title']);
        $('#broadcast_tools_room_info_speaker').text(current_talk['persons'].join(', '));
        $('#broadcast_tools_room_info_qr').html(qr_info);
    } else {
        $('#broadcast_tools_room_info_roomname').text(event_info['name']);
        $('#broadcast_tools_room_info_title').text(room_name);
        $('#broadcast_tools_room_info_qr').text('');

        if (next_talk && event_info['room-info']['show_next_talk']) {
            $('#broadcast_tools_room_info_speaker').text(format_time_from_pretalx(next_talk['start']) + ' ' + next_talk['title']);
        } else {
            $('#broadcast_tools_room_info_speaker').text('');
        }
    }

    if (current_talk && current_talk['track']) {
        $('#broadcast_tools_room_info').css('background-color', current_talk['track']['color']);
    } else {
        $('#broadcast_tools_room_info').css('background-color', event_info['color']);
    }
}
window.setInterval(update_room_info, 1000);
