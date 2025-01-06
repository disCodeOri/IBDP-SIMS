// src/index.js
const bot = require('./bot'); // Import the bot instance
const { client } = bot; // Destructure the client object

client.on('ready', () => {
  console.log('Bot is ready!');
})