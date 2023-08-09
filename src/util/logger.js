// eslint-disable-next-line import/no-extraneous-dependencies
const { createLogger, format, transports } = require('winston')

const { combine, timestamp } = format

// const timeStampPrettyPrint = format.combine(
//     format.timestamp(),
//     format.prettyPrint(),
// )

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        format.errors({ stack: true }),
        format.json(),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        format.prettyPrint(),
    ),
    defaultMeta: { service: 'task-manager' },
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logfile.log' }),
    ],
})

const loggingEntryMiddleware = (req, res, next) => {
    logger.log('info', {
        url: req.originalUrl,
        username: req.userData?.user?.username,
    })
    next()
}

exports.logger = logger
exports.loggingEntryMiddleware = loggingEntryMiddleware
