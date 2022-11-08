schedule = null;
room_name = null;
event_info = null;

$(function() {
    $('#l3speaker').text('Content will appear soon.');
});

function update_lower_third() {
    current_time = new Date(Date.now()).getTime()

    try {
        hash = decodeURIComponent(window.location.hash.substring(1));
        room_name = hash;
    } catch (e) {
        console.error(e);
        return
    }

    if (!event_info)  {
        console.warn("Waiting for event info ...");
        return
    }

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

    current_talk = null;

    for (talk_i in schedule['talks']) {
        talk = schedule['talks'][talk_i]

        if (schedule['rooms'].length > 1 && talk['room'] != room_name) {
            // not in this room
            continue;
        }

        talk_start = new Date(talk['start']).getTime();
        talk_end = new Date(talk['end']).getTime();

        if (talk_start < current_time && talk_end > current_time) {
            current_talk = talk;
        }
    }

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

function update_schedule() {
    $.getJSON('../event.json', function(data) {
        event_info = data;

        $('#l3box').css('background-color', data['color']);
    });
    $.getJSON('../schedule.json', function(data) {
        if ('error' in data) {
            console.error(data['error']);
        } else {
            console.info('schedule updated with ' + data['talks'].length + ' talks in ' + data['rooms'].length + ' rooms');
        }

        schedule = data;

        window.setTimeout(update_schedule, 30000);
    });
}
update_schedule();
