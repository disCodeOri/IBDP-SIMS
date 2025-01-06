// src/commands/StreakCommandHandler.js
const CommandHandler = require('./CommandHandler');
const { query } = require('../database/db')
const { parseError } = require('../utils/helper')


class StreakCommandHandler extends CommandHandler {
    async handle(message) {
        try {
            const userId = message.author.id
            const queryStr = 'SELECT streak FROM users WHERE id=$1'
            const result = await query(queryStr, [userId])
            if(result && result.rows.length > 0) {
                const streak = result.rows[0].streak
                message.reply(`Your current streak is: ${streak}`)
            }
            else {
               message.reply(`Could not find any streaks for your account. Please use \`!log <task>\` to start your streak.`)
            }
            }
            catch(e) {
               console.error('An error occurred while showing the streak:', parseError(e))
               message.reply(`Error: Could not get your streak information at the moment. Try again later.`)
            }
        }
}

module.exports = StreakCommandHandler;