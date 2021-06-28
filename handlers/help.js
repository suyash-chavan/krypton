const Discord = require('discord.js')

function handleHelp (message) {
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Krypton - A Classroom Manager')
        .setThumbnail('https://raw.githubusercontent.com/suyash-chavan/krypton/main/logo.png')
        .addField('Commands', '‎', true)
        .addFields(
            { name: '$init', value: '└ Initialise the classroom in current channel' },
            {
                name: '$create',
                value: '├ Create the Assignment \n' +
                                        '├ Upload Assignment file and mention deadline date and time\n' +
                                        '└ **$create 1 "title" yyyy-mm-dd hh:mm**'
            },
            {
                name: '$view',
                value: '├ View assignment reports and enrolled students. \n' +
                                    '├ **$view** - View Assignments \n' +
                                    '├ **$view enrolled** - View Enrolled Students\n' +
                                    '├ **$view 1 report** - View Report of Assignment 1\n' +
                                    '└ **$view !1 report** - View Students who didn\'t submit Assignment 1'
            },
            { name: '$submit', value: '├ Submit the assignment with attachment. \n└ **$submit {assignment no.}**' },
            {
                name: '$remove',
                value: '└ Delete Enrollments/Assignments/Submissions. \n' +
                                    '├ **$remove enrolled @{student\'s handle} @{student\'s handle} ...**\n'+'  └ Remove enrolled students \n' +
                                    '├ **$remove assignments {assignment_no} {assignment_no}...**\n'+'  └ Delete mentioned assignments\n' +
                                    '├ **$remove submissions {assignment_no} {assignment_no}...**\n'+'  └ Delete all submissions of assignments\n'
            },
            { name: '$enroll', value: '├ Enroll students in classroom. \n└ **$enroll @{student\'s handle} @{student\'s handle} ...**' },
            { name: '$help', value: '└ View this message' },
            { name: '‎', value: '----------------------------------------------------‎' }
        )
        .addField('Countribute Us', 'https://github.com/suyash-chavan/krypton', false)

    message.channel.send(exampleEmbed)
}

module.exports = { handleHelp }
