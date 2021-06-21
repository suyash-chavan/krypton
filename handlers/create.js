const sendRequest = require('../helpers/sendRequest.js');
const luxon = require('luxon');
const prefix = "$";
const DATE_FORMAT = 'yyyy-MM-dd';
const TIME_FORMAT = 'hh:mm';

function dateTimeStringsToMillis(dateString, timeString) {
    return luxon.DateTime.fromFormat(
        `${dateString} ${timeString}`,
        `${DATE_FORMAT} ${TIME_FORMAT}`
    ).toMillis();
}

async function uploadAssignment(assNo, classID, teacherID, link, title, dateTime) {
    classID = "id_" + classID;
    teacherID = "id_" + teacherID;
    dateTime = "time_" + dateTime;

    var data = JSON.stringify({
        "operation": "insert",
        "schema": "assignmentInfo",
        "table": classID,
        "records": [
            {
                "assNo": assNo,
                "teacherID": teacherID,
                "url": link,
                "title": title,
                "deadline": dateTime
            }
        ]
    });

    var response = await sendRequest.sendRequest(data).catch();
    return response;
}

async function updateAssignment(AssignID, link, assDec, dateTime, classID) {
    classID = "id_" + classID;
    dateTime = "time_" + dateTime;

    var data = JSON.stringify({
        "operation": "update",
        "schema": "assignmentInfo",
        "table": classID,
        "records": [
            {
                "id": AssignID,
                "title": assDec,
                "url": link,
                "deadline": dateTime
            }
        ]
    });

    var response = await sendRequest.sendRequest(data).catch();
    return response;
}

async function isAssigned(classID, assNo) {
    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM assignmentInfo." + classID + " WHERE assNo = " + assNo,
    });

    var response = await sendRequest.sendRequest(data).catch();

    if (response.data.length === 0) {
        return null;
    }
    return (response.data)[0].id;
}

async function handleCreate(message) {

    var allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher');
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 });
        }).catch({});

        message.delete({ timeout: 10000 });
        return;
    }

    var Attachments = (message.attachments).array();
    if (Attachments.length === 0) {
        message.reply("Please Upload the Assignment File!");
        return;
    }
    var link = Attachments[0].url;

    const commandBody = message.content.slice(prefix.length);
    var args = commandBody.split('"');

    var assNo = (args[0].split(' '))[1];
    args.shift();
    var assDec = args[0];

    args = args[1].split(" ");
    var date = args[1];
    var time = args[2];

    var MilliTime = dateTimeStringsToMillis(date, time);

    if (!MilliTime) {
        message.reply("Incorrect Command Format!");
        return;
    }

    var classID = message.channel.id;
    var AssignID = await isAssigned(classID, assNo);

    if (AssignID != null) {
        await updateAssignment(AssignID, link, assDec, MilliTime, classID);
        message.reply('Updated');
    }
    else {
        await uploadAssignment(assNo, classID, message.author.id, link, assDec, MilliTime);
        message.reply('Created');
    }
}

module.exports = { handleCreate };