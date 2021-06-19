function handleInvalidCommand(message)
{
    message.reply('Invalid command').then(msg => {
        msg.delete({ timeout: 10000 });
    }).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);

    message.delete({ timeout: 10000 });
}

module.exports = {handleInvalidCommand};