const sendRequest = require('../helpers/sendRequest.js')
const bot = require('../helpers/bot')
const dateTime = require('../helpers/dateTime')

async function uploadAssignment (assNo, classID, teacherID, link, title, dateTime) {
    classID = 'id_' + classID
    teacherID = 'id_' + teacherID
    dateTime = 'time_' + dateTime

    const data = JSON.stringify({
        operation: 'insert',
        schema: 'assignmentInfo',
        table: classID,
        records: [
            {
                assNo: assNo,
                teacherID: teacherID,
                url: link,
                title: title,
                deadline: dateTime
            }
        ]
    })

    await sendRequest.sendRequest(data)
}

async function updateAssignment (AssignID, link, assDec, dateTime, classID) {
    classID = 'id_' + classID
    dateTime = 'time_' + dateTime

    const data = JSON.stringify({
        operation: 'update',
        schema: 'assignmentInfo',
        table: classID,
        records: [
            {
                id: AssignID,
                title: assDec,
                url: link,
                deadline: dateTime
            }
        ]
    })

    await sendRequest.sendRequest(data)
}

async function isAssigned (classID, assNo) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM assignmentInfo.' + classID + ' WHERE assNo = ' + assNo
    })

    const response = await sendRequest.sendRequest(data).catch()

    if (response.data.length === 0) {
        return null
    }
    return (response.data)[0].id
}

async function handleCreate (message) {
    
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    const Attachments = (message.attachments).array()
    if (Attachments.length === 0) {
        message.reply('Please Upload the Assignment File!')
        return
    }
    const link = Attachments[0].url

    const commandBody = message.content.slice(bot.prefix.length)
    let args = commandBody.split('"')

    const assNo = (args[0].split(' '))[1]
    args.shift()
    const assDec = args[0]

    args = args[1].split(' ')
    const date = args[1]
    const time = args[2]

    const MilliTime = dateTime.dateTimeStringsToMillis(date, time)

    if (!MilliTime) {
        message.reply('Incorrect Command Format!')
        return
    }

    const classID = message.channel.id
    const AssignID = await isAssigned(classID, assNo)

    if (AssignID != null) {
        await updateAssignment(AssignID, link, assDec, MilliTime, classID)
        message.reply('Updated the assignment!')
    } else {
        await uploadAssignment(assNo, classID, message.author.id, link, assDec, MilliTime)
        message.reply('Created the assignment!')
    }
}

module.exports = { handleCreate }
