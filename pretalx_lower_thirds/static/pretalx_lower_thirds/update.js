schedule = null;
room_name = null;

$(function() {
    $('#speaker').text('Content will appear soon.');
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

    if (!schedule) {
        console.warn("There's no schedule yet, exiting ...");
        return
    }

    if (schedule['rooms'].length > 1 && !schedule['rooms'].includes(room_name)) {
        $('#title').text('Error')
        $('#speaker').text('Invalid room_name. Valid names: ' + schedule['rooms'].join(', '));

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
        $('#title').text(current_talk['title']);
        $('#speaker').text(current_talk['persons'].join(', '));
        $('#info_line').text(current_talk['infoline']);
    } else {
        $('#title').text(schedule['conference']['no_talk']);
        $('#speaker').text('');
        $('#info_line').text('');
    }

    if (current_talk && current_talk['track']) {
        $('#box').css('border-bottom', '10px solid ' + current_talk['track']['color']);
    } else {
        $('#box').css('border-bottom', 'none');
    }
}
window.setInterval(update_lower_third, 1000);

function update_schedule() {
    $.getJSON('schedule.json', function(data) {
        console.info('schedule updated with ' + data['talks'].length + ' talks in ' + data['rooms'].length + ' rooms');

        schedule = data;

        window.setTimeout(update_schedule, 30000);
    });
}
update_schedule();
