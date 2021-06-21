const sendRequest = require('../helpers/sendRequest.js');
const discordClient = require('../discordClient.js');
const prefix = "$";

async function classExists(classID) {

    classID = "id_" + classID;

    var data = JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'",
    });

    var response = await sendRequest.sendRequest(data);
    return response;
}

function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return discordClient.client.users.cache.get(mention);
    }
}

async function enrollUser(user, classID, teacherID) {
    classID = "id_" + classID;
    teacherID = "id_" + teacherID;

    var userID = "id_" + user.id;

    var data = JSON.stringify({
        "operation": "insert",
        "schema": "userInfo",
        "table": classID,
        "records": [
            {
                "userID": userID,
                "teacherID": teacherID
            }
        ]
    });

    var response = await sendRequest.sendRequest(data);
    return response;
}


async function handleEnroll(message) {

    var allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher');
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 });
        }).catch({});

        message.delete({ timeout: 10000 });
        return;
    }

    var classID = message.channel.id;
    var teacherID = message.author.id;

    // Check if it is initiated classroom
    var response = await classExists(classID);

    if (response.status === 200) {
        if (response.data.length === 0) {
            message.reply("Please Initiate the Class!");
            return;
        }
    } else {
        message.reply("Internal Server Error");
        return;
    }

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');

    if (args.length === 1) {
        message.reply("Please mention Users to add them in class");
        return;
    }

    console.log(args);

    for (var i = 1; i < args.length; i++) {
        var user = getUserFromMention(args[i]);

        if (user != null) {
            await enrollUser(user, classID, teacherID);
        }
    }

    message.reply("Added users to the class!");
}

module.exports = { handleEnroll };