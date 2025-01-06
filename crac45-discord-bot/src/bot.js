// src/bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    if(msg.author.bot) return;
    console.log(`Message from ${msg.author.username}: ${msg.content}`);
})


client.login(process.env.DISCORD_TOKEN);


module.exports = { client };