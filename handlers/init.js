const sendRequest = require('../helpers/sendRequest.js')
const axios = require('axios')

const log4js = require('../helpers/logger')
const logger = log4js.init.getLogger('init')

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

    return response.data
}

function createClass (classID, className, teacherID) {
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

    return sendRequest.syncRequest(data).catch((error) => {
        logger.error(error)
    })
}

function createUserTable (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'create_table',
        schema: 'userInfo',
        table: classID,
        hash_attribute: 'id'
    })

    return sendRequest.syncRequest(data)
}

function createUserAttributes (classID) {
    classID = 'id_' + classID

    const attributes = ['userID', 'teacherID']

    return axios.all(attributes.map(function (attribute) {
        const data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'userInfo',
            table: classID,
            attribute: attribute
        })

        return sendRequest.syncRequest(data)
    })).catch((error) => {
        logger.error(error)
    })
}

function createAssignmentTable (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'create_table',
        schema: 'assignmentInfo',
        table: classID,
        hash_attribute: 'id'
    })

    return sendRequest.syncRequest(data)
}

function createAssignmentAttributes (classID) {
    classID = 'id_' + classID

    const attributes = ['assNo', 'teacherID', 'url', 'title', 'deadline']

    return axios.all(attributes.map(function (attribute) {
        const data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'assignmentInfo',
            table: classID,
            attribute: attribute
        })

        return sendRequest.syncRequest(data)
    })).catch((error) => {
        logger.error(error)
    })
}

function createSubmissionTable (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'create_table',
        schema: 'submissionInfo',
        table: classID,
        hash_attribute: 'id'
    })

    return sendRequest.syncRequest(data)
}

function createSubmissionAttributes (classID) {
    classID = 'id_' + classID

    const attributes = ['userID', 'url', 'comment', 'assNo']

    return axios.all(attributes.map(function (attribute) {
        const data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'submissionInfo',
            table: classID,
            attribute: attribute
        })

        return sendRequest.syncRequest(data)
    })).catch((error) => {
        logger.error(error)
    })
}

async function handleInit (message) {
    // Only Teachers are allowed to use this command
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    const className = message.channel.name
    const classID = message.channel.id
    const teacherID = message.author.id

    let response

    try {
        response = await classExists(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    if (response.length !== 0) {
        message.reply('Class already Initiated')
        return
    }

    try {
        await axios.all([
            createClass(classID, className, teacherID),
            createUserTable(classID),
            createAssignmentTable(classID),
            createSubmissionTable(classID)
        ])

        await axios.all([
            createUserAttributes(classID),
            createAssignmentAttributes(classID),
            createSubmissionAttributes(classID)
        ])
    } catch (err) {
        message.reply('Internal Server Error')
        logger.error(err)
        return
    }

    message.reply('**' + className + '** created successfully!')
}

module.exports = { handleInit }
