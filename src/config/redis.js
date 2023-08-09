const { createClient } = require('redis')

const { logger } = require('../util/logger')

const client = createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
})

client.on('connect', (err) => logger.info('Redis client connected.', err))
client.on('error', (err) => logger.warn('Redis client error.', err))
client.on('ready', (err) => logger.info('Redis client ready to use.', err))
client.on('end', (err) => logger.info('Redis client disconnected.', err))

module.exports = client
