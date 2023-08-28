const ServiceUser = require('../../models/serviceUser')
const Task = require('../../models/task')

// TODO: Find single task. Find all tasks user is an author of. Find all tasks for user's org.
async function findAll(authorName) {
    // TODO: check that user has read privileges
    // could store this in the JWT or in redis? that way we don't have to make an extra db trip
    return Task.findAll({
        include: [
            {
                model: ServiceUser,
                as: 'task_author',
                attributes: ['username'],
                where: {
                    username: authorName,
                },
            },
        ],
    })
}

async function add(name, title, description, organization, severity) {
    // TODO: check that user has create priviledges + belongs to org specified
    return Task.create({
        author: name,
        task_title: title,
        task_descr: description,
        organization,
        severity,
    })
}

async function remove(taskId) {
    // TODO: check that user has remove priviledges + belongs to org specified
    return Task.destroy({
        where: { task_id: taskId },
    })
}

module.exports = { findAll, add, remove }
