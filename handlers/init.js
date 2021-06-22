const sendRequest = require('../helpers/sendRequest.js');

async function classExists(classID) {

    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'",
    });

    var response = await sendRequest.sendRequest(data);
    return response;
}

async function createClass(classID, className, teacherID) {

    classID = "id_" + classID;
    teacherID = "id_" + teacherID;

    var data = JSON.stringify({
        "operation": "insert",
        "schema": "classroomInfo",
        "table": "classrooms",
        "records": [
            {
                "channelID": classID,
                "name": className,
                "teacherID": teacherID
            }
        ]
    });

    var response = await sendRequest.sendRequest(data);
    return response;
}

async function createTable(classID) {

    // Create Table

    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "create_table",
        "schema": "userInfo",
        "table": classID,
        "hash_attribute": "id"
    });

    var response = await sendRequest.sendRequest(data);

    data = JSON.stringify({
        "operation": "insert",
        "schema": "userInfo",
        "table": classID,
        "records": [
            {
                "userID": "id_",
                "teacherID": "id_",
            }
        ]
    });

    response = await sendRequest.sendRequest(data);

    return response;
}

async function createAssignmentTable(classID) {

    // Create Table

    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "create_table",
        "schema": "assignmentInfo",
        "table": classID,
        "hash_attribute": "id"
    });

    var response = await sendRequest.sendRequest(data);

    data = JSON.stringify({
        "operation": "insert",
        "schema": "assignmentInfo",
        "table": classID,
        "records": [
            {
                "assNo": 0,
                "teacherID": "id_",
                "url": "",
                "title": "",
                "deadline": ""
            }
        ]
    });

    response = await sendRequest.sendRequest(data);

    return response;
}

async function createSubmissionTable(classID) {

    // Create Table

    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "create_table",
        "schema": "submissionInfo",
        "table": classID,
        "hash_attribute": "id"
    });

    var response = await sendRequest.sendRequest(data);

    data = JSON.stringify({
        "operation": "insert",
        "schema": "submissionInfo",
        "table": classID,
        "records": [
            {
                "userID": "id_",
                "url": "",
                "comment": "",
                "assNo": ""
            }
        ]
    });

    response = await sendRequest.sendRequest(data);

    return response;
}

async function handleInit(message) {

    var allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher');
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 });
        }).catch({});

        message.delete({ timeout: 10000 });
        return;
    }

    var className = message.channel.name;
    var classID = message.channel.id;
    var teacherID = message.author.id;

    var response = await classExists(classID);
    if (response.status === 200) {
        if (response.data.length !== 0) {
            message.reply("Class already Initiated");
            return;
        }
    } else {
        message.reply("Internal Server Error");
        return;
    }

    response = await createClass(classID, className, teacherID);

    if (response.status != 200) {
        message.reply("Internal Server Error");
        return;
    }

    response = await createTable(classID);

    response = await createAssignmentTable(classID);

    response = await createSubmissionTable(classID);

    message.reply(className + " created Successfully!");
}

module.exports = { handleInit };