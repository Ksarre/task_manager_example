const { createClient } = require('redis')

const { logger } = require('../util/logger')

const client = createClient({
    url: 'redis://redis:6379',
    // doesn't seem to work on redisv4
    // TODO: Need to find a solution to stop the client from
    // retrying forever when there's a connection problem
    retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // If redis refuses the connection or is not able to connect
            logger.info('Inside options.error')
            return new Error('The server refused the connection')
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            logger.info('Inside options.total_retry_time')
            // End reconnection after the specified time limit
            return new Error('Retry time exhausted')
        }
        if (options.attempt > 10) {
            logger.info('Inside options.attempt')
            // End reconnecting after attempt limit
            return undefined
        }
        // reconnect retry with increasing delay
        logger.info('Inside default timeout')
        return Math.min(options.attempt * 100, 3000)
    },
})

client
    .connect()
    .then(logger.info('Connected to Redis'))
    .catch((err) => {
        logger.error(err)
    })

client.on('connect', (err) => logger.info('Redis client connected.', err))
client.on('error', (err) => {
    logger.warn('Redis client error.', err)
})
client.on('ready', (err) => logger.info('Redis client ready to use.', err))
client.on('end', (err) => logger.info('Redis client disconnected.', err))

module.exports = { client }
