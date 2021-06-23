const sendRequest = require('../helpers/sendRequest.js')

/*
    This function should be modified a bit. NoSQL operations for creating attributes
    should be optimised using sync functions.

*/

async function classExists (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'"
    })

    const response = await sendRequest.sendRequest(data)

    return response.data
}

async function createClass (classID, className, teacherID) {
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

    const response = await sendRequest.sendRequest(data)
    return response.data
}

async function createUserTable (classID) {
    classID = 'id_' + classID

    let data

    data = JSON.stringify({
        operation: 'create_table',
        schema: 'userInfo',
        table: classID,
        hash_attribute: 'id'
    })

    await sendRequest.sendRequest(data)

    const attributes = ['userID', 'teacherID']

    for (const index in attributes) {
        data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'userInfo',
            table: classID,
            attribute: attributes[index]
        })

        await sendRequest.sendRequest(data)
    }
}

async function createAssignmentTable (classID) {
    classID = 'id_' + classID

    let data

    data = JSON.stringify({
        operation: 'create_table',
        schema: 'assignmentInfo',
        table: classID,
        hash_attribute: 'id'
    })

    await sendRequest.sendRequest(data)

    const attributes = ['assNo', 'teacherID', 'url', 'title', 'deadline']

    for (const index in attributes) {
        data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'assignmentInfo',
            table: classID,
            attribute: attributes[index]
        })

        await sendRequest.sendRequest(data)
    }
}

async function createSubmissionTable (classID) {
    classID = 'id_' + classID

    let data

    data = JSON.stringify({
        operation: 'create_table',
        schema: 'submissionInfo',
        table: classID,
        hash_attribute: 'id'
    })

    await sendRequest.sendRequest(data)

    const attributes = ['userID', 'url', 'comment', 'assNo']

    for (const index in attributes) {
        data = JSON.stringify({
            operation: 'create_attribute',
            schema: 'submissionInfo',
            table: classID,
            attribute: attributes[index]
        })

        await sendRequest.sendRequest(data)
    }
}

async function handleInit (message) {
    // Check if author is Teacher
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

    // All the responses will be stored here
    let response

    try {
        response = await classExists(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
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
        console.log(err)
        return
    }

    try {
        await createUserTable(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
        return
    }

    try {
        await createAssignmentTable(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
        return
    }

    try {
        await createSubmissionTable(classID)
    } catch (err) {
        message.reply('Internal Server Error')
        console.log(err)
        return
    }

    message.reply('**' + className + '** created successfully!')
}

module.exports = { handleInit }
