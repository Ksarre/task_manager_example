const express = require('express')
const fs = require('fs')
const https = require('https')
const ApiErrorMiddleware = require('./error/error_middleware')
const taskRoute = require('./resource/task/route')
const loginRoute = require('./resource/auth/route')
const registerRoute = require('./resource/user/route')
const organizationRoute = require('./resource/organization/route')
const defaultAssociations = require('./models/associations')
const { setMetadata } = require('./util/APIUtils')
const { logger } = require('./util/logger')

const app = express()
const { HTTP_PORT } = process.env
const { HTTPS_PORT } = process.env
const HOST = 'https://localhost'

defaultAssociations()

app.get('/', express.json(), (req, res) => {
    res.send('Task service is online.')
})

app.use('*', express.json(), (req, res, next) => {
    logger.info(`Route is secure: ${req.secure}`)
    return req.secure
        ? next()
        : res.redirect(307, `${HOST}:${HTTPS_PORT}${req.originalUrl}`)
})

app.use('/api', [
    express.json(),
    setMetadata,
    taskRoute,
    loginRoute,
    registerRoute,
    organizationRoute,
])

// TODO: add request validation middleware
app.use('*', [
    express.json(),
    ApiErrorMiddleware,
    (req, res) => {
        if (!res.headersSent)
            res.status(404).send({ message: '404 URL NOT FOUND' })
    },
])

try {
    const privateKey = fs.readFileSync('./etc/ssl/certs/key.pem', 'utf8')
    const certificate = fs.readFileSync(
        './etc/ssl/certs/certificate.pem',
        'utf8',
    )
    const ca = fs.existsSync('/etc/ssl/certs/ca.pem')
        ? fs.readFileSync('/etc/ssl/certs/ca.pem', 'utf8')
        : null
    const credentials = ca
        ? { key: privateKey, cert: certificate, ca }
        : { key: privateKey, cert: certificate }

    https.createServer(credentials, app).listen(HTTPS_PORT, (error) => {
        if (!error) {
            logger.info(
                `Task Service is listening over https on port ${HTTPS_PORT}`,
            )
        } else
            logger.crit(
                `Error occurred, Task Service is not listening on port ${HTTPS_PORT}`,
                error,
            )
    })

    app.listen(HTTP_PORT, (error) => {
        if (!error) {
            logger.info(
                `Task Service is Successfully Running, and is listening on port ${HTTP_PORT}`,
            )
        } else
            logger.error(
                `Error occurred, Task Service is not listening on port ${HTTP_PORT}`,
                error,
            )
    })
} catch (err) {
    logger.alert(err)
}
