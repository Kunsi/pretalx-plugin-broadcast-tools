function update_lower_third() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

    $('#broadcast_tools_lower_thirds_box').css('background-color', event_info['color']);

    if (!schedule)  {
        $('#broadcast_tools_lower_thirds_title').text('Waiting for schedule ...')
        return
    }

    if ('error' in schedule) {
        $('#broadcast_tools_lower_thirds_title').text('Error')
        $('#broadcast_tools_lower_thirds_speaker').html(schedule['error'].join('<br>'));
        $('#broadcast_tools_lower_thirds_infoline').text('');
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        $('#broadcast_tools_lower_thirds_title').text('Error')
        $('#broadcast_tools_lower_thirds_speaker').text('Invalid room_name. Valid names: ' + schedule['rooms'].join(', '));
        $('#broadcast_tools_lower_thirds_infoline').text('');
        return
    }

    current_talk = get_current_talk(5);
    if (current_talk) {
        $('#broadcast_tools_lower_thirds_title').text(current_talk['title']);
        $('#broadcast_tools_lower_thirds_speaker').text(current_talk['persons'].join(', '));
        $('#broadcast_tools_lower_thirds_infoline').text(current_talk['infoline']);
    } else {
        $('#broadcast_tools_lower_thirds_title').text(event_info['no_talk']);
        $('#broadcast_tools_lower_thirds_speaker').text('');
        $('#broadcast_tools_lower_thirds_infoline').text('');
    }

    if (current_talk && current_talk['track']) {
        $('#broadcast_tools_lower_thirds_box').css('border-bottom', '10px solid ' + current_talk['track']['color']);
    } else {
        $('#broadcast_tools_lower_thirds_box').css('border-bottom', 'none');
    }
}
window.setInterval(update_lower_third, 1000);
