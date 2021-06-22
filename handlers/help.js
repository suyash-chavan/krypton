const Discord = require('discord.js');

function handleHelp(message) {
    
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Krypton - A Classroom Manager')
        .setDescription('Some description here')
        .setThumbnail('https://github.com/suyash-chavan/krypton/logo.png')
        .addFields(
            { name: 'Regular field title', value: 'Some value here' },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addField('Inline field title', 'Some value here', true)
        .setImage('../logo.png')
        .setTimestamp()
        .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

    message.channel.send(exampleEmbed);
}

module.exports = { handleHelp }