const luxon = require('luxon');
const DATE_FORMAT = 'yyyy-MM-dd';
const TIME_FORMAT = 'hh:mm';
const sendRequest = require('../helpers/sendRequest.js');

function dateTimeToDateString(dateTime) {
    return dateTime.toFormat(DATE_FORMAT);
}

function dateTimeToTimeString(dateTime) {
    return dateTime.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
}

function millisToDateTimeStrings(dateMillis) {
    const dateTime = luxon.DateTime.fromMillis(dateMillis);

    return dateTimeToDateString(dateTime) + " " + dateTimeToTimeString(dateTime);
}

async function getAssignments(classID) {
    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM assignmentInfo." + classID + " WHERE assNo != 0",
    });

    var response = await sendRequest.sendRequest(data).catch(e => console.log(e));

    return response.data;
}
async function handleView(message) {

    var classID = message.channel.id;

    var assignments = await getAssignments(classID);

    assignments.sort((a, b) => a.assNo - b.assNo);

    var title = "";
    var deadline = "";

    for (var i = 0; i < assignments.length; i++) {
        title = title + assignments[i].assNo;
        title = title + ". [" + assignments[i].title + "](" + assignments[i].url + ")";
        title = title + "\n";

        deadline = deadline + millisToDateTimeStrings(parseInt(assignments[i].deadline.slice(5), 10));
        deadline = deadline + "\n";
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: "Assignments",
            fields: [
                { name: "Title", value: title, inline: true },
                { name: "Deadline", value: deadline, inline: true }
            ]
        }
    });
}

module.exports = { handleView };