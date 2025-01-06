// src/utils/helper.js
require('dotenv').config()

module.exports.getEnvConfig = () => {
  return {
    discordToken: process.env.DISCORD_TOKEN,
    dbUser: process.env.DB_USER,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT,
  }
}

module.exports.parseError = (e) => {
  console.error(e)
  return e instanceof Error ? e.message : JSON.stringify(e)
}