// src/commands/LogCommandHandler.js
const CommandHandler = require('./CommandHandler');
const { query } = require('../database/db')

class LogCommandHandler extends CommandHandler {
    async handle(message) {
        const userId = message.author.id
        const task = message.content.split(' ').slice(1).join(' ')
        const queryStr = 'INSERT INTO tasks (user_id, task_name, timestamp) VALUES ($1, $2, NOW());'
        const result = await query(queryStr, [userId, task])

        if(result) {
            console.log(`Successfully logged task for user: ${userId}`)
            message.reply(`Successfully logged your task: ${task}`)
        }
        else {
            message.reply(`Error: Could not log your task at the moment. Try again later.`)
        }
    }
}

module.exports = LogCommandHandler;