function update_lower_third() {
    room_name = get_room_name();

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

    $('#l3box').css('background-color', event_info['color']);

    if (!schedule)  {
        $('#l3title').text('Waiting for schedule ...')
        return
    }

    if ('error' in schedule) {
        $('#l3title').text('Error')
        $('#l3speaker').html(schedule['error'].join('<br>'));
        $('#l3info_line').text('');
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        $('#l3title').text('Error')
        $('#l3speaker').text('Invalid room_name. Valid names: ' + schedule['rooms'].join(', '));
        $('#l3info_line').text('');
        return
    }

    current_talk = get_current_talk(5);
    if (current_talk) {
        $('#l3title').text(current_talk['title']);
        $('#l3speaker').text(current_talk['persons'].join(', '));
        $('#l3info_line').text(current_talk['infoline']);
    } else {
        $('#l3title').text(event_info['no_talk']);
        $('#l3speaker').text('');
        $('#l3info_line').text('');
    }

    if (current_talk && current_talk['track']) {
        $('#l3box').css('border-bottom', '10px solid ' + current_talk['track']['color']);
    } else {
        $('#l3box').css('border-bottom', 'none');
    }
}
window.setInterval(update_lower_third, 1000);
