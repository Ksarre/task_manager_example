// TODO: need organization checks and role checks
const express = require('express')
const { authenticate } = require('../../JWT/authenticationMiddleware')

const router = express.Router()

const sendResponse = require('../../util/responseFormat')
const { loggingEntryMiddleware } = require('../../util/logger')
const { add, remove } = require('./repository')
const { logger } = require('../../util/logger')

router
    .post(
        '/organization/c',
        authenticate,
        loggingEntryMiddleware,
        (req, res, next) => {
            add(req.body.orgName, req.userData.username)
                .then((result) => sendResponse(res, 200, result))
                .catch((err) => next(err))
        },
    )
    .delete(
        '/organization/:id',
        authenticate,
        loggingEntryMiddleware,
        (req, res, next) => {},
        // a 'soft' delete; marks organization inactive
        // organization data cannot be read by non admins
        // no further writes on organization resources should be allowed
        // store org data in redis after first db query to avoid accessing for every resource request
    )

module.exports = router
