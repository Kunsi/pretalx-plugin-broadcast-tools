schedule = null;
event_info = null;

function get_current_talk(max_offset) {
    room_name = get_room_name();

    if (!room_name) {
        return null;
    }

    current_talk = null;

    for (let offset = 0; offset <= max_offset; offset++) {
        time_start = new Date(Date.now() + offset*60000).getTime();
        time_end = new Date(Date.now() - offset*60000).getTime();

        for (talk_i in schedule['talks']) {
            talk = schedule['talks'][talk_i]

            if (schedule['rooms'].length > 1 && talk['room'] != room_name) {
                // not in this room
                continue;
            }

            talk_start = new Date(talk['start']).getTime();
            talk_end = new Date(talk['end']).getTime();

            if (talk_start < time_start && talk_end > time_end) {
                current_talk = talk;
                break;
            }
        }

        if (current_talk) {
            break;
        }
    }

    return current_talk;
}

function get_room_name() {
    room_name = null;
    try {
        hash = decodeURIComponent(window.location.hash.substring(1));
        room_name = hash;
    } catch (e) {
        console.error(e);
    }
    return room_name;
}

function update_schedule() {
    $.getJSON('../event.json', function(data) {
        event_info = data;
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
