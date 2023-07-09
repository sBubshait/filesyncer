const winston = require('winston');

// Define the timestamp format
const timestampFormat = () => (new Date()).toLocaleTimeString();

// Create logger
const logger = winston.createLogger({
    format: winston.format.printf((info) => {
        return `${timestampFormat()} ${info.level.toUpperCase()}: ${info.message}`;
    }),
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ filename: 'file.log' })
    ]
});

module.exports = logger;