const express = require('express')

const router = express.Router()
const { authenticate } = require('../../JWT/authenticationMiddleware')
const taskRepository = require('./repository')
const sendResponse = require('../../util/responseFormat')
const { loggingEntryMiddleware } = require('../../util/logger')
const { logger } = require('../../util/logger')
// TODO: org and permission checks
// attempt to hit redis for org/permission check. if there's a miss,
// query the db and reload the cache. needs to be reusable for any endpoint
router
    .get('/task', [
        authenticate,
        loggingEntryMiddleware,
        (req, res, next) => {
            logger.info(`Retrieving tasks @user: ${req.userData.username}`)
            taskRepository
                .findAll(req.userData.username)
                .then((tasks) => {
                    sendResponse(res, 200, { tasks })
                })
                .catch((err) => next(err))
        },
    ])
    .post('/task/c', [
        authenticate,
        loggingEntryMiddleware,
        (req, res, next) => {
            taskRepository
                .add(
                    req.userData.username,
                    req.body.title,
                    req.body.description,
                    req.body.organization,
                )
                .then((task) => {
                    sendResponse(res, 200, task)
                })
                .catch(next)
        },
    ])
    .delete('/task/:id', [
        authenticate,
        loggingEntryMiddleware,
        (req, res) => {
            const { id } = req.params
            taskRepository.remove(id)
            sendResponse(res, 200, { message: `task_id:${id} deleted.` })
        },
    ])

module.exports = router
