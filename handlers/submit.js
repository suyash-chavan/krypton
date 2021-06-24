const sendRequest = require('../helpers/sendRequest.js')
const bot = require('../helpers/bot')

const log4js = require('../helpers/logger')
const logger = log4js.submit.getLogger('submit')

async function isEnrolled (userID, classID) {
    classID = 'id_' + classID
    userID = 'id_' + userID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM userInfo.' + classID + " WHERE userID = '" + userID + "'"
    })

    const response = await sendRequest.sendRequest(data).catch()

    if (response.data.length === 0) {
        return false
    }
    return true
}

async function assignmentExists (assNo, classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM assignmentInfo.' + classID + ' WHERE assNo = ' + assNo
    })

    const response = await sendRequest.sendRequest(data).catch(e => console.log(e))

    if (response.data.length === 0) {
        return false
    }
    return true
}

async function isSubmitted (assNo, userID, classID) {
    classID = 'id_' + classID
    userID = 'id_' + userID

    const data = JSON.stringify({
        operation: 'sql',
        sql: 'SELECT * FROM submissionInfo.' + classID + " WHERE userID = '" + userID + "' AND assNo = " + assNo
    })

    const response = await sendRequest.sendRequest(data)

    if (response.data.length === 0) {
        return
    }
    return (response.data)[0].id
}

async function updateSubmission (submitID, comment, link, classID) {
    classID = 'id_' + classID
    const data = JSON.stringify({
        operation: 'update',
        schema: 'submissionInfo',
        table: classID,
        records: [
            {
                id: submitID,
                comment: comment,
                url: link
            }
        ]
    })

    const response = await sendRequest.sendRequest(data)
    return response
}

async function createSubmission (assNo, comment, userID, classID, link) {
    classID = 'id_' + classID
    userID = 'id_' + userID

    const data = JSON.stringify({
        operation: 'insert',
        schema: 'submissionInfo',
        table: classID,
        records: [
            {
                assNo: assNo,
                comment: comment,
                userID: userID,
                url: link
            }
        ]
    })

    const response = await sendRequest.sendRequest(data)
    return response
}

async function handleSubmit (message) {
    if (!await isEnrolled(message.author.id, message.channel.id)) {
        message.reply('You are not enrolled in this class')
        return
    }

    const commandBody = message.content.slice(bot.prefix.length + 7)
    const args = commandBody.split(' ')

    const assNo = args[0]
    const comment = commandBody.slice(args[0].length + 1)

    if (!await assignmentExists(assNo, message.channel.id)) {
        message.reply('Assignment Does Not Exist')
        return
    }

    const Attachments = (message.attachments).array()
    if (Attachments.length === 0) {
        message.reply('Please Upload the Assignment File!')
        return
    }
    const link = Attachments[0].url

    const submitID = await isSubmitted(assNo, message.author.id, message.channel.id)
    if (submitID) {
        await updateSubmission(submitID, comment, link, message.channel.id)
        message.reply('Updated')
    } else {
        await createSubmission(assNo, comment, message.author.id, message.channel.id, link)
        message.reply('Submitted')
    }
}

module.exports = { handleSubmit }
