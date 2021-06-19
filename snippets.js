// Extract server_id and channel_id
const server_id = message.guild.id;
const channel_id = message.channel.id;

// Extract command components
const commandBody = message.content.slice(prefix.length);
const args = commandBody.split(' ');
const command = args.shift().toLowerCase();