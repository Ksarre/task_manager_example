// eslint-disable-next-line import/no-extraneous-dependencies
const { createLogger, transports, format } = require('winston');

const timeStampPrettyPrint = format.combine(format.timestamp(), format.prettyPrint());

const logger = createLogger({
  format: format.combine(format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console({
      level: 'debug',
      format: timeStampPrettyPrint,
    }),
  ],
});

const loggingEntryMiddleware = (req, res, next) => {
  logger.log('info', {
    ip: req.ip,
    url: req.originalUrl,
    username: req.userData?.user?.username,
  });
  next();
};

exports.logger = logger;
exports.loggingEntryMiddleware = loggingEntryMiddleware;
