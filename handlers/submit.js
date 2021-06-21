const sendRequest = require('../helpers/sendRequest.js');
const prefix = "$";

async function isSubmitted(assNo, userID, classID) {
    classID = "id_" + classID;
    userID = "id_" + userID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM submissionInfo." + classID + " WHERE userID = '" + userID + "' AND assNo = " + assNo,
    });

    var response = await sendRequest.sendRequest(data);

    if (response.data.length === 0) {
        return;
    }
    return (response.data)[0].id;
}

async function updateSubmission(submitID, comment, link, classID) {

    classID = "id_" + classID;
    var data = JSON.stringify({
        "operation": "update",
        "schema": "submissionInfo",
        "table": classID,
        "records": [
            {
                "id": submitID,
                "comment": comment,
                "url": link
            }
        ]
    });

    var response = await sendRequest.sendRequest(data);
    return response;
}

async function createSubmission(assNo, comment, userID, classID, link) {
    classID = "id_" + classID;
    userID = "id_" + userID;

    var data = JSON.stringify({
        "operation": "insert",
        "schema": "submissionInfo",
        "table": classID,
        "records": [
            {
                "assNo": assNo,
                "comment": comment,
                "userID": userID,
                "url": link,
            }
        ]
    });

    var response = await sendRequest.sendRequest(data);
    return response;
}

async function handleSubmit(message) {

    const commandBody = message.content.slice(prefix.length + 7);
    var args = commandBody.split(' ');

    var Attachments = (message.attachments).array();
    if (Attachments.length === 0) {
        message.reply("Please Upload the Assignment File!");
        return;
    }

    var link = Attachments[0].url;
    var assNo = args[0];
    var comment = commandBody.slice(args[0].length + 1);

    var submitID = await isSubmitted(assNo, message.author.id, message.channel.id);
    if (submitID) {
        await updateSubmission(submitID, comment, link, message.channel.id);
        message.reply('Updated');
    }
    else {
        await createSubmission(assNo, comment, message.author.id, message.channel.id, link);
        message.reply('Submitted');
    }
}

module.exports = { handleSubmit };