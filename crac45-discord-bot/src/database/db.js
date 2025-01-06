// src/database/db.js
const { Client } = require('pg')
const { getEnvConfig } = require('../utils/helper')

const { dbUser, dbHost, dbName, dbPassword, dbPort } = getEnvConfig()

const client = new Client({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: dbPort,
})

const connect = async () => {
    try {
      await client.connect()
      console.log('Successfully connected to database.')
    }
    catch (err) {
      console.error('Error during database connection:', err)
    }
  }

  const end = async () => {
    try {
      await client.end()
      console.log('Successfully disconnected from database.')
    }
    catch (err) {
      console.error('Error during database disconnection', err)
    }
  }

  const query = async (text, params) => {
    try {
        const result = await client.query(text, params)
        return result
    }
    catch (err) {
        console.error('Error during query to database:', err)
        return null
    }
  }

module.exports = {
    connect,
    end,
    query
}