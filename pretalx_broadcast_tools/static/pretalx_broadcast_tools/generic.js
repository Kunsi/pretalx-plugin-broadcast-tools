schedule = null;
event_info = null;
req = {};

function get_current_talk(max_offset) {
    let room_name = get_room_name();

    if (!room_name) {
        return null;
    }

    let now = Date.now();

    for (let offset = 0; offset <= max_offset; offset++) {
        let time_start = now + offset * 60000;
        let time_end = now - offset * 60000;

        for (const talk of schedule['talks']) {
            if (schedule['rooms'].length > 1 && talk['room'] != room_name) {
                // not in this room
                continue;
            }

            let talk_start = new Date(talk['start']).getTime();
            let talk_end = new Date(talk['end']).getTime();

            if (talk_start < time_start && talk_end > time_end) {
                return talk;
            }
        }
    }

    return null;
}

function get_next_talk() {
    let room_name = get_room_name();

    if (!room_name) {
        return null;
    }

    let time_start = Date.now();

    for (const talk of schedule['talks']) {
        if (schedule['rooms'].length > 1 && talk['room'] != room_name) {
            // not in this room
            continue;
        }

        if (new Date(talk['start']).getTime() > time_start) {
            return talk;
        }
    }

    return null;
}

function get_room_name() {
    let hash;
    try {
        hash = decodeURIComponent(window.location.hash.substring(1));
    } catch (e) {
        console.error(e);
    }
    if (event_info && event_info["rooms"].hasOwnProperty(hash)) {
        return event_info["rooms"][hash];
    }
    return null;
}

function format_time_from_pretalx(from_pretalx) {
    let d = new Date(from_pretalx);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
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
        let data = JSON.parse(text);
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
