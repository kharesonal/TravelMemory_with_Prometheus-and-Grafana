// logger.js
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Set logging level (e.g., 'info', 'debug', 'error')
  format: format.combine(
    format.timestamp(), // Add timestamp to logs
    format.json() // Format logs as JSON
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/combined.log' })
  ],
});

module.exports = logger;
