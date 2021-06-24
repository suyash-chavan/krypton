const sendRequest = require('../helpers/sendRequest.js')
const axios = require('axios')
const log4js = require('../helpers/logger')

const logger = log4js.log4js.getLogger("init");

async function classExists(classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'"
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error);
    })

    if (response === null || response.data === null) {
        throw 'Response Data Error while checking existence of class!';
    }

    return response.data
}

async function createClass(classID, className, teacherID) {
    classID = 'id_' + classID
    teacherID = 'id_' + teacherID

    const data = JSON.stringify({
        operation: 'insert',
        schema: 'classroomInfo',
        table: 'classrooms',
        records: [
            {
                channelID: classID,
                name: className,
                teacherID: teacherID
            }
        ]
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error);
    })

    if (response === null || response.data === null) {
        throw 'Response Data Error while creating class!';
    }

    return response.data
}

async function createUserTable(classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'create_table',
        schema: 'userInfo',
        table: classID,
        hash_attribute: 'id'
    })

    await sendRequest.sendRequest(data)

    const attributes = ['userID', 'teacherID']

    await axios.all(attributes.map(function (attribute) {
        const data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'userInfo',
            table: classID,
            attribute: attribute
        })

        return sendRequest.sendRequest(data)
    })).catch((error) => {
        logger.error(error);
    })
}

async function createAssignmentTable(classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'create_table',
        schema: 'assignmentInfo',
        table: classID,
        hash_attribute: 'id'
    })

    await sendRequest.sendRequest(data)

    const attributes = ['assNo', 'teacherID', 'url', 'title', 'deadline']

    await axios.all(attributes.map(function (attribute) {
        const data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'assignmentInfo',
            table: classID,
            attribute: attribute
        })

        return sendRequest.sendRequest(data)
    })).catch((error) => {
        logger.error(error);
    })
}

async function createSubmissionTable(classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'create_table',
        schema: 'submissionInfo',
        table: classID,
        hash_attribute: 'id'
    })

    await sendRequest.sendRequest(data)

    const attributes = ['userID', 'url', 'comment', 'assNo']

    await axios.all(attributes.map(function (attribute) {
        const data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'submissionInfo',
            table: classID,
            attribute: attribute
        })

        return sendRequest.sendRequest(data)
    })).catch((error) => {
        logger.error(error);
    })
}

async function handleInit(message) {
    // Check if author is Teacher
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    logger.error("Something");

    const className = message.channel.name
    const classID = message.channel.id
    const teacherID = message.author.id

    // All the responses will be stored here
    let response

    try {
        response = await classExists(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    // Classroom already created
    if (response.length !== 0) {
        message.reply('Class already Initiated')
        return
    }

    try {
        createClass(classID, className, teacherID)
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    try {
        await createUserTable(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    try {
        await createAssignmentTable(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    try {
        await createSubmissionTable(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    message.reply('**' + className + '** created successfully!')
}

module.exports = { handleInit }
