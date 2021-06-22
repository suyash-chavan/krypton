const luxon = require('luxon');
const DATE_FORMAT = 'yyyy-MM-dd';
const prefix = "$";
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

async function handleAssignments(message) {
    var classID = message.channel.id;

    var assignments = await getAssignments(classID);

    assignments.sort((a, b) => a.assNo - b.assNo);

    if(assignments.length === 0)
    {
        message.reply("No Assignments Found!");
        return ;
    }

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

async function getReport(assNo, classID) {
    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM submissionInfo." + classID + " WHERE assNo = " + assNo,
    });

    var response = await sendRequest.sendRequest(data).catch(e => console.log(e));

    return response.data;
}

async function getDeadline(classID, assNo) {
    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM assignmentInfo." + classID + " WHERE assNo = " + assNo,
    });

    var response = await sendRequest.sendRequest(data).catch(e => console.log(e));

    return parseInt((response.data)[0].deadline.slice(5));
}

async function getStudents(classID) {
    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT userID FROM userInfo." + classID + " WHERE userID != 'id_'",
    });

    var response = await sendRequest.sendRequest(data).catch(e => console.log(e));

    return response;
}

async function handleReport(message, assNo) {
    var classID = message.channel.id;

    var submissions = await getReport(assNo, classID);
    submissions.sort((a, b) => a.__updatedtime__ - b.__updatedtime__);

    var user = "";
    var submission = "";
    var status = "";

    var deadline = await getDeadline(classID, assNo);

    for (var i = 0; i < submissions.length; i++) {
        user = user + "<@" + submissions[i].userID.slice(3) + ">\n";

        submission = submission + "[Link](" + submissions[i].url + ")\n";

        var submissionTime = submissions[i].__updatedtime__;

        if (submissionTime > deadline) {
            status = status + "OK\n";
        }
        else {
            status = status + "LATE\n";
        }
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: "Report of Assignment No. " + assNo,
            fields: [
                { name: "User", value: user, inline: true },
                { name: "URL", value: submission, inline: true },
                { name: "Status", value: status, inline: true }
            ]
        }
    });
}

async function handleNotReport(message, assNo) {

    var classID = message.channel.id;

    var response = await getReport(assNo, classID);

    var submitted = {};

    for (var i = 0; i < response.length; i++) {
        submitted[response[i].userID] = true;
    }

    var students = await getStudents(classID);

    students = students.data;

    var absent = "";

    for (var i = 0; i < students.length; i++) {
        if (submitted[students[i].userID] === undefined) {
            absent = "<@" + students[i].userID.slice(3) + ">\n";
        }
    }

    if (absent === "") {
        message.reply("Everyone has submitted the Assignment :slight_smile:");
        return;
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: "Not Submitted Assignment No. " + assNo,
            fields: [
                { name: "User", value: absent, inline: true }
            ]
        }
    });
}

async function handleEnrolled(message){

    var classID = message.channel.id;
    var students = await getStudents(classID);
    students = students.data;

    var user = "";

    for (var i = 0; i < students.length; i++) {
        user = user + "<@" + students[i].userID.slice(3) + ">\n";
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: "Enrolled students...!!!",
            fields: [
                { name: "User", value: user, inline: true }
            ]
        }
    });
}

async function handleView(message) {

    var commandBody = message.content.slice(prefix.length);
    var args = commandBody.split(' ');
    args.shift();

    if (args.length === 0) {
        await handleAssignments(message);
        return;
    }

    if (args.length === 1) {
        if (args[0] === "enrolled") {
            await handleEnrolled(message);
        }
        else {
            message.reply("Incorrect Command Format");
        }

        return;
    }

    if (args.length != 2) {
        message.reply("Incorrect Command Format");
        return;
    }

    if (args[1] != "report") {
        message.reply("Incorrect Command Format");
        return;
    }

    var assNo;
    var flip = false;

    if (args[0][0] === '!') {
        flip = true;
        args[0] = args[0].slice(1);
    }

    try {
        assNo = parseInt(args[0], 10);
    }
    catch (err) {
        message.reply("Incorrect Command Format");
        return;
    }

    if (assNo < 1) {
        message.reply("Invalid Assignment Number");
        return;
    }

    if (flip) {
        await handleNotReport(message, assNo);
    } else {
        await handleReport(message, assNo);
    }
}

module.exports = { handleView };