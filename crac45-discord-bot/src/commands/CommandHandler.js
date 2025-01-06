// src/commands/CommandHandler.js

class CommandHandler {
    constructor() {
        if(new.target === CommandHandler) {
            throw new Error('Cannot instantiate abstract class: CommandHandler')
        }
    }

    async handle(message) {
        throw new Error('handle method must be implemented')
    }
}

module.exports = CommandHandler;