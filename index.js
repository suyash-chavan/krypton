const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "$";

client.on("message", function(message) { 
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    if(message.guild === null){
        // Need to handle DMs
        return ;
    }

    const commandBody = message.content.slice(prefix.length);

    if(commandBody === "init"){
        console.log("Init Received!");
    }
    else{
        
        message.reply('Invalid command').then(msg => {
            msg.delete({ timeout: 10000 })
        }).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);

        message.delete({ timeout: 10000 });
    }
    
}); 

client.login(config.BOT_TOKEN);

