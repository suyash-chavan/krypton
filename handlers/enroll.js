const sendRequest = require('../helpers/sendRequest.js')
const discordClient = require('../discordClient.js')
const bot = require('../helpers/bot')

async function classExists (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'"
    })

    const response = await sendRequest.sendRequest(data)
    return response.data
}

function getUserFromMention (mention) {
    if (!mention) return

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1)

        if (mention.startsWith('!')) {
            mention = mention.slice(1)
        }

        return discordClient.client.users.cache.get(mention)
    }
}

async function isEnrolled (user, classID) {
    classID = 'id_' + classID

    const userID = 'id_' + user.id

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM userInfo.' + classID + " WHERE userID = '" + userID + "'"
    })

    const response = await sendRequest.sendRequest(data).catch()

    if (response.data.length === 0) {
        return
    }
    return (response.data)[0].id
}

async function enrollUser (user, classID, teacherID) {
    classID = 'id_' + classID
    teacherID = 'id_' + teacherID

    const userID = 'id_' + user.id

    const data = JSON.stringify({
        operation: 'insert',
        schema: 'userInfo',
        table: classID,
        records: [
            {
                userID: userID,
                teacherID: teacherID
            }
        ]
    })

    await sendRequest.sendRequest(data)
}

async function handleEnroll (message) {
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    const classID = message.channel.id
    const teacherID = message.author.id

    // Check if it is initiated classroom
    let response

    try {
        response = await classExists(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
        return
    }

    if (response.length === 0) {
        message.reply('Please Initiate the Class!')
        return
    }

    const commandBody = message.content.slice(bot.prefix.length)
    const args = commandBody.split(' ')

    if (args.length === 1) {
        message.reply('Please mention Users to add them in class')
        return
    }

    try {
        
        for (let i = 1; i < args.length; i++) {
            const user = getUserFromMention(args[i])

            if (user != null) {
                if (await isEnrolled(user, classID)) {
                    continue
                }

                enrollUser(user, classID, teacherID)
            }
        }
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
        return
    }

    message.reply('Added users to the class!')
}

module.exports = { handleEnroll }
