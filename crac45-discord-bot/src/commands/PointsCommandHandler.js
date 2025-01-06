// src/commands/PointsCommandHandler.js
const CommandHandler = require('./CommandHandler');
const { query } = require('../database/db')
const { parseError } = require('../utils/helper')


class PointsCommandHandler extends CommandHandler {
    async handle(message) {
        try {
            const userId = message.author.id
            const queryStr = 'SELECT points FROM users WHERE id=$1'
            const result = await query(queryStr, [userId])
            if(result && result.rows.length > 0) {
                const points = result.rows[0].points
                message.reply(`Your current points are: ${points}`)
            }
            else {
               message.reply(`Could not find any points for your account. Please use \`!log <task>\` to start your logging and gain points.`)
            }
            }
            catch(e) {
               console.error('An error occurred while showing points:', parseError(e))
               message.reply(`Error: Could not get your point information at the moment. Try again later.`)
            }
        }
}

module.exports = PointsCommandHandler;