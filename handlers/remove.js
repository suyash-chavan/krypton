const bot = require('../helpers/bot')
const axios = require('axios')
const discordClient = require('../discordClient.js')
const sendRequest = require('../helpers/sendRequest.js')

const log4js = require('../helpers/logger')
const logger = log4js.remove.getLogger('remove')

async function classExists (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'"
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error)
    })

    if (response === null || response.data === null) {
        throw new Error('Response Data Error while checking existence of class!')
    }

    if (response.data.length === 0) {
        return false
    }

    return true
}

async function isEnrolled (user, classID) {
    classID = 'id_' + classID

    const userID = 'id_' + user.id

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM userInfo.' + classID + " WHERE userID = '" + userID + "'"
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error)
    })

    if (response.data.length === 0) {
        return
    }
    return (response.data)[0].id
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

async function removeUser (user, classID) {
    const userID = 'id_' + user.id
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'DELETE FROM userInfo.' + classID + " WHERE userID = '" + userID + "'"
    })

    await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error)
    })
}

async function handleEnrolled (message, args) {
    const classID = message.channel.id
    args.shift()

    await axios.all(args.map(async function (userID) {
        const user = getUserFromMention(userID)

        if (user != null) {
            if (await isEnrolled(user, classID)) {
                return removeUser(user, classID)
            }
        }
    })).catch((error) => {
        logger.error(error)
    })

    message.reply('Mentioned students are unenrolled!')
}

async function removeAssignment (assNo, classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'DELETE FROM assignmentInfo.' + classID + ' WHERE assNo = ' + assNo
    })

    await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error)
    })
}

async function handleAssignment (message, args) {
    const classID = message.channel.id
    args.shift()

    await axios.all(args.map(async function (assignment) {
        const assNo = parseInt(assignment)

        return removeAssignment(assNo, classID)
    })).catch((error) => {
        logger.error(error)
    })

    message.reply('Mentioned assignments are deleted!')
}

async function removeSubmissions (assNo, classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'DELETE FROM submissionInfo.' + classID + ' WHERE assNo = ' + assNo
    })

    await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error)
    })
}

async function handleSubmission (message, args) {
    args.shift()

    const classID = message.channel.id

    await axios.all(args.map(async function (assignment) {
        const assNo = parseInt(assignment)

        return removeSubmissions(assNo, classID)
    })).catch((error) => {
        logger.error(error)
    })

    message.reply('Submissions of mentioned assignments are deleted!')
}

async function handleRemove (message) {
    // Only Teachers are allowed to use this command
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    try {
        if (!await classExists(classID)) {
            message.reply('You have not initialised the class')
            return
        }
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
        return
    }

    const commandBody = message.content.slice(bot.prefix.length)
    const args = commandBody.split(' ')
    args.shift()

    switch (args[0]) {
        case 'enrolled':
            handleEnrolled(message, args)
            break
        case 'assignment':
            handleAssignment(message, args)
            break
        case 'submission':
            handleSubmission(message, args)
            break
        default:
            message.reply('Invalid command format!')
    }
}

module.exports = { handleRemove }
