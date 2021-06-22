const config = require('./config.json')
const discordClient = require('./discordClient.js')
const prefix = '$'

const handler = require('./handlers.js')

discordClient.client.on('ready', () => {
    discordClient.client.user.setActivity('Classrooms', { type: 'WATCHING' })
})

discordClient.client.on('message', function (message) {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return

    if (message.guild === null) {
        // Need to handle DMs
        return
    }

    const commandBody = message.content.slice(prefix.length)
    const args = commandBody.split(' ')
    const command = args.shift().toLowerCase()

    switch (command) {
        case 'init':
            handler.handleInit(message)
            break
        case 'enroll':
            handler.handleEnroll(message)
            break
        case 'submit':
            handler.handleSubmit(message)
            break
        case 'view':
            handler.handleView(message)
            break
        case 'create':
            handler.handleCreate(message)
            break
        case 'create':
            handler.handleCreate(message)
            break
        case 'help':
            handler.handleHelp(message)
            break
        default:
            handler.handleInvalidCommand(message)
    }
})

discordClient.client.login(config.BOT_TOKEN)
