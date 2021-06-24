function handleInvalidCommand (message) {
    message.reply('Invalid command').then(msg => {
        msg.delete({ timeout: 10000 })
    }).catch()

    message.delete({ timeout: 10000 }).catch()
}

module.exports = { handleInvalidCommand }
