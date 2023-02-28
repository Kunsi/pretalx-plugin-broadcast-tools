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
        $('#broadcast_tools_room_info_title').text(event_info['name']);
        $('#broadcast_tools_room_info_speaker').text('Backstage');
        $('#broadcast_tools_room_info_qr').text('');
        $('#broadcast_tools_room_info').css('background-color', event_info['color']);
        return
    }

    $('#broadcast_tools_room_info_roomname').text(room_name);

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
    if (current_talk) {
        if (event_info['room-info']['qr_type'] == 'feedback') {
            qr_info = '<img src="' + current_talk['urls']['feedback_qr'] + '" alt="Feedback QR Code"><p>Leave Feedback by scanning the code or visiting ' + current_talk['urls']['feedback'] + '</p>';
        } else {
            qr_info = '<img src="' + current_talk['urls']['public_qr'] + '" alt="QR Code linking to URL below"><p>' + current_talk['urls']['public'] + '</p>';
        }

        $('#broadcast_tools_room_info_title').text(current_talk['title']);
        $('#broadcast_tools_room_info_speaker').text(current_talk['persons'].join(', '));
        $('#broadcast_tools_room_info_qr').html(qr_info);
    } else {
        $('#broadcast_tools_room_info_title').text(event_info['name']);
        $('#broadcast_tools_room_info_speaker').text('');
        $('#broadcast_tools_room_info_qr').text('');
    }

    if (current_talk && current_talk['track']) {
        $('#broadcast_tools_room_info').css('background-color', current_talk['track']['color']);
    } else {
        $('#broadcast_tools_room_info').css('background-color', event_info['color']);
    }
}
window.setInterval(update_room_info, 1000);