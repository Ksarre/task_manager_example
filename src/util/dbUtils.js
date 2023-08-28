const convertRaw = async (result) => {
    if (Array.isArray(result)) {
        return result.map((e) => e.get({ plain: true }))
    }
    return result.get({ plain: true })
}

function withRetry(asyncAction, retries) {
    if (retries <= 0) {
        return Promise.resolve().then(asyncAction)
    }
    return Promise.resolve()
        .then(asyncAction)
        .catch(() => withRetry(asyncAction, retries - 1))
}

module.exports = { convertRaw, withRetry }
