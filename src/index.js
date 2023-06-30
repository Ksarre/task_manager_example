const express = require('express');
const ApiErrorMiddleware = require('./error/error_middleware');
const taskRoute = require('./resource/task/route');
const loginRoute = require('./resource/auth/route');
const registerRoute = require('./resource/user/route');
const organizationRoute = require('./resource/organization/route');
const defaultAssociations = require('./models/associations');
const { logger } = require('./util/logger');

const app = express();
const PORT = process.env.API_PORT;

// For some reason if I don't define associations here
// model definitions will be broken later on
// TODO: want to figure out how to solve this at the repo level
defaultAssociations();

app.get('/', (req, res) => {
  res.send('Welcome to the task manager app. Hot reload is awesome');
});

app.use('/api', [express.json(), taskRoute, loginRoute, registerRoute, organizationRoute]);

// TODO: add request validation middleware
app.use('*', [
  ApiErrorMiddleware,
  (req, res) => {
    if (!res.headersSent) res.status(404).send('404 URL NOT FOUND');
  },
]);

// TODO: networking requests always require a DNS lookup and node doesn't have an internal
// DNS cache. adding one is a good idea for node servers.
app.listen(PORT, (error) => {
  if (!error) {
    logger.info(`Task Service is Successfully Running, and is listening on port ${PORT}`);
  } else logger.error("Error occurred, Task Service can't start", error);
});
