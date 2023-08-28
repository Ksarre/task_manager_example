function sendResponse(res, code, body) {
    res.status(code).send(body)
}

module.exports = sendResponse
