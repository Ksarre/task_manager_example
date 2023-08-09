const { v4: uuidv4 } = require('uuid')
const { logger } = require('./logger')

const getIP = (req) =>
    req.header('x-forwarded-for') || req.socket?.remoteAddress

// initializes a uuid and populates logger metadata
const setMetadata = (req, res, next) => {
    req.correlationId = uuidv4()
    logger.defaultMeta.correlationId = req.correlationId
    logger.defaultMeta.ip = getIP(req)

    next()
}

module.exports = { getIP, setMetadata }
