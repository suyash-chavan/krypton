const axios = require('axios')
const sendRequest = require('../helpers/sendRequest')

const log4js = require('../helpers/logger')
const logger = log4js.destroy.getLogger('destroy')

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

function destroyAssignments (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'drop_table',
        schema: 'assignmentInfo',
        table: classID
    })

    return sendRequest.syncRequest(data).catch((error) => {
        logger.error(error)
    })
}
async function destroySubmissions (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'drop_table',
        schema: 'submissionInfo',
        table: classID
    })

    return sendRequest.syncRequest(data).catch((error) => {
        logger.error(error)
    })
}
function destroyUsers (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'drop_table',
        schema: 'userInfo',
        table: classID
    })

    return sendRequest.syncRequest(data).catch((error) => {
        logger.error(error)
    })
}
function destroyClass (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: "DELETE FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'"
    })

    return sendRequest.syncRequest(data).catch((error) => {
        logger.error(error)
    })
}

async function handleDestroy (message) {
    // Only Teachers are allowed to use this command
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    const classID = message.channel.id

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

    try {
        await axios.all([
            destroyAssignments(classID),
            destroySubmissions(classID),
            destroyUsers(classID),
            destroyClass(classID)
        ]).catch((error) => {
            logger.error(error)
        })
    } catch (err) {
        message.reply('Internal Server Error')
        return
    }

    message.reply('Classroom successfully DESTROYED!')
}

module.exports = { handleDestroy }
