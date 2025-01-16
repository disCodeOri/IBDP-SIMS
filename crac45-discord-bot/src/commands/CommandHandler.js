// src/commands/CommandHandler.js

class CommandHandler {
    constructor() {
        if (new.target === CommandHandler) {
            throw new TypeError("Cannot construct Abstract instances directly");
          }
    }
    async handle(msg, args) {
        throw new Error("Method handle must be implemented in derived classes");
    }
}

module.exports = CommandHandler;