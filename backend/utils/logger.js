const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');

// Configuración para el registro de solicitudes
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'request.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// Configuración para el registro de errores
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

module.exports = {
  requestLogger,
  errorLogger,
};
