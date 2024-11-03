schedule = null;
event_info = null;
req = {};

function get_current_talk(max_offset) {
    room_name = get_room_name();

    if (!room_name) {
        return null;
    }

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
                return talk;
            }
        }
    }

    return null;
}

function get_next_talk() {
    room_name = get_room_name();

    if (!room_name) {
        return null;
    }

    time_start = new Date(Date.now()).getTime();

    for (talk_i in schedule['talks']) {
        talk = schedule['talks'][talk_i]

        if (schedule['rooms'].length > 1 && talk['room'] != room_name) {
            // not in this room
            continue;
        }

        talk_start = new Date(talk['start']).getTime();

        if (talk_start > time_start) {
            return talk;
        }
    }

    return null;
}

function get_room_name() {
    try {
        hash = decodeURIComponent(window.location.hash.substring(1));
    } catch (e) {
        console.error(e);
    }
    if (event_info && event_info["rooms"].hasOwnProperty(hash)) {
        return event_info["rooms"][hash];
    }
    // XXX remove fallback when releasing 3.0.0
    return hash;
}

function format_time_from_pretalx(from_pretalx) {
    d = new Date(from_pretalx);

    h = d.getHours();
    m = d.getMinutes();

    if (h < 10) {
        h = '0' + h;
    }

    if (m < 10) {
        m = '0' + m;
    }

    return h + ':' + m;
}

function xhr_get(url, callback_func) {
    req[url] = new XMLHttpRequest();
    req[url].timeout = 10000;
    req[url].onreadystatechange = () => {
        if (req[url].readyState === 4) {
            if (req[url].status != 200) {
                return;
            }

            callback_func(req[url].responseText);
        }
    };
    req[url].open('GET', url);
    req[url].setRequestHeader('Accept', 'application/json');
    req[url].setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req[url].send();
}

function update_schedule() {
    xhr_get('../event.json', function(text) {
        console.debug("events: " + text);
        event_info = JSON.parse(text);
    });
    xhr_get('../schedule.json', function(text) {
        console.debug("schedule: " + text);
        data = JSON.parse(text);
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
