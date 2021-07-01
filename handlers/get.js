const sendRequest = require('../helpers/sendRequest.js')
const bot = require('../helpers/bot')
const { MessageAttachment } = require("discord.js");

const { convertArrayToCSV } = require('convert-array-to-csv');

async function classExists (classID) {
    classID = 'id_' + classID

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM classroomInfo.classrooms WHERE channelID = '" + classID + "'"
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        logger.error(error)
    })

    return response.data
}

async function handleGetStudents(message) {
    const classID = 'id_' + message.channel.id

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM userInfo." + classID
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        console.log(error)
    })

    let csv

    try {
        const data = response.data

        if (data.length === 0) {
            message.author.send("No Student Data found for **" + message.channel.name + "**!")
            return ;
        }

        csv = convertArrayToCSV(data)
    }
    catch (err) {
        console.log(err)
        message.reply("Internal Server Error")
        return
    }

    attachment = new MessageAttachment(Buffer.from(csv, 'utf-8'), 'students.csv');

    await message.author.send('Student Data of **' + message.channel.name + "**", attachment);
}

async function handleGetAssignments(message) {
    const classID = 'id_' + message.channel.id

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM assignmentInfo." + classID
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        console.log(error)
    })

    let csv

    try {
        const data = response.data

        if (data.length === 0) {
            message.author.send("No Assignment Data found for **" + message.channel.name + "**!")
            return ;
        }

        csv = convertArrayToCSV(data)
    }
    catch (err) {
        console.log(err)
        message.reply("Internal Server Error")
        return
    }

    attachment = new MessageAttachment(Buffer.from(csv, 'utf-8'), 'assignments.csv');

    await message.author.send('Assignment Data of **' + message.channel.name + "**", attachment);
}

async function handleGetSubmissions(message) {
    const classID = 'id_' + message.channel.id

    const data = JSON.stringify({
        operation: 'sql',
        sql: "SELECT * FROM submissionInfo." + classID
    })

    const response = await sendRequest.sendRequest(data).catch((error) => {
        console.log(error)
    })

    let csv

    try {
        const data = response.data

        if (data.length === 0) {
            message.author.send("No Submission Data found for **" + message.channel.name + "**!")
            return ;
        }

        csv = convertArrayToCSV(data)
    }
    catch (err) {
        console.log(err)
        message.reply("Internal Server Error")
        return
    }

    attachment = new MessageAttachment(Buffer.from(csv, 'utf-8'), 'submissions.csv');

    await message.author.send('Submission Data of **' + message.channel.name + "**", attachment);
}

async function handleGet(message) {
    const allowedRole = message.member.roles.cache.some(role => role.name === 'Teacher')
    if (!allowedRole) {
        message.reply('Command Not Allowed!').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch({})

        message.delete({ timeout: 10000 })
        return
    }

    const classID = message.channel.id

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
    args.shift()

    switch (args[0]) {
        case 'students':
            await handleGetStudents(message)
            message.reply("Sent!")
            break
        case 'assignments':
            await handleGetAssignments(message)
            message.reply("Sent!")
            break
        case 'submissions':
            await handleGetSubmissions(message)
            message.reply("Sent!")
            break
        case 'all':
            await handleGetStudents(message)
            await handleGetAssignments(message)
            await handleGetSubmissions(message)
            message.reply("Sent!")
            break
        default:
            message.reply("Invalid Command Format")
    }
}

module.exports = { handleGet }