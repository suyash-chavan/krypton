const sendRequest = require('../helpers/sendRequest.js')
const bot = require('../helpers/bot')
const dateTime = require('../helpers/dateTime')

async function getAssignments (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM assignmentInfo.' + classID + ' WHERE assNo != 0'
    })

    const response = await sendRequest.sendRequest(data)

    return response.data
}

async function handleAssignments (message) {
    const classID = message.channel.id

    const assignments = await getAssignments(classID)

    if (assignments.length === 0) {
        message.reply('No Assignments Found!')
        return
    }

    assignments.sort((a, b) => a.assNo - b.assNo)

    let title = ''
    let deadline = ''

    for (let i = 0; i < assignments.length; i++) {
        title = title + assignments[i].assNo
        title = title + '. [' + assignments[i].title + '](' + assignments[i].url + ')'
        title = title + '\n'

        deadline = deadline + dateTime.millisToDateTimeStrings(parseInt(assignments[i].deadline.slice(5), 10))
        deadline = deadline + '\n'
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: 'Assignments',
            fields: [
                { name: 'Title', value: title, inline: true },
                { name: 'Deadline', value: deadline, inline: true }
            ]
        }
    })
}

async function getReport (assNo, classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM submissionInfo.' + classID + ' WHERE assNo = ' + assNo
    })

    const response = await sendRequest.sendRequest(data)

    return response.data
}

async function getDeadline (classID, assNo) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM assignmentInfo.' + classID + ' WHERE assNo = ' + assNo
    })

    const response = await sendRequest.sendRequest(data)

    return parseInt((response.data)[0].deadline.slice(5))
}

async function getStudents (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT userID FROM userInfo.' + classID + " WHERE userID != 'id_'"
    })

    const response = await sendRequest.sendRequest(data)

    return response.data
}

async function handleReport (message, assNo) {
    const classID = message.channel.id

    const submissions = await getReport(assNo, classID)
    submissions.sort((a, b) => a.__updatedtime__ - b.__updatedtime__)

    let user = ''
    let submission = ''
    let status = ''

    const deadline = await getDeadline(classID, assNo)

    for (let i = 0; i < submissions.length; i++) {
        user = user + '<@' + submissions[i].userID.slice(3) + '>\n'

        submission = submission + '[Link](' + submissions[i].url + ')\n'

        const submissionTime = submissions[i].__updatedtime__

        if (submissionTime > deadline) {
            status = status + 'OK\n'
        } else {
            status = status + 'LATE\n'
        }
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: 'Report of Assignment No. ' + assNo,
            fields: [
                { name: 'User', value: user, inline: true },
                { name: 'URL', value: submission, inline: true },
                { name: 'Status', value: status, inline: true }
            ]
        }
    })
}

async function handleNotReport (message, assNo) {
    const classID = message.channel.id

    const response = await getReport(assNo, classID)

    const submitted = {}

    for (const index in response) {
        submitted[response[index].userID] = true
    }

    let students = await getStudents(classID)

    students = students.data

    let absent = ''

    for (const index in students) {
        if (submitted[students[index].userID] === undefined) {
            absent = '<@' + students[index].userID.slice(3) + '>\n'
        }
    }

    if (absent === '') {
        message.reply('Everyone has submitted the Assignment :slight_smile:')
        return
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: 'Not Submitted Assignment No. ' + assNo,
            fields: [
                { name: 'User', value: absent, inline: true }
            ]
        }
    })
}

async function handleEnrolled (message) {
    const classID = message.channel.id
    const students = await getStudents(classID)

    let user = ''

    for (let i = 0; i < students.length; i++) {
        user = user + '<@' + students[i].userID.slice(3) + '>\n'
    }

    message.channel.send({
        embed: {
            color: 3447003,
            title: 'Enrolled students...!!!',
            fields: [
                { name: 'User', value: user, inline: true }
            ]
        }
    })
}

async function handleView (message) {
    const commandBody = message.content.slice(bot.prefix.length)
    const args = commandBody.split(' ')
    args.shift()

    if (args.length === 0) {
        await handleAssignments(message)
        return
    }

    if (args.length === 1) {
        if (args[0] === 'enrolled') {
            await handleEnrolled(message)
        } else {
            message.reply('Incorrect Command Format')
        }

        return
    }

    if (args.length !== 2) {
        message.reply('Incorrect Command Format')
        return
    }

    if (args[1] !== 'report') {
        message.reply('Incorrect Command Format')
        return
    }

    let assNo
    let flip = false

    if (args[0][0] === '!') {
        flip = true
        args[0] = args[0].slice(1)
    }

    try {
        assNo = parseInt(args[0], 10)
    } catch (err) {
        message.reply('Incorrect Command Format')
        return
    }

    if (assNo < 1) {
        message.reply('Invalid Assignment Number')
        return
    }

    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    if (flip) {
        await handleNotReport(message, assNo)
    } else {
        await handleReport(message, assNo)
    }
}

module.exports = { handleView }
