var path = require('path');
var winston = require('winston');
var fsx = require('fs-extra');

//========================================================================================================
const LOGS_DIR = path.resolve(__dirname, '..', 'logs');
const MB256 = 268435456; // 256 MB in Bytes

//========================================================================================================
const CONSUMER_WARN_LOG_PATH = path.resolve(LOGS_DIR, 'consumer.warn.log');
const CONSUMER_ERROR_LOG_PATH = path.resolve(LOGS_DIR, 'consumer.error.log');
const CRON_WARN_LOG_PATH = path.resolve(LOGS_DIR, 'cron.warn.log');
const CRON_ERROR_LOG_PATH = path.resolve(LOGS_DIR, 'cron.error.log');

//========================================================================================================
fsx.ensureFileSync(CONSUMER_WARN_LOG_PATH);
fsx.ensureFileSync(CONSUMER_ERROR_LOG_PATH);
fsx.ensureFileSync(CRON_WARN_LOG_PATH);
fsx.ensureFileSync(CRON_ERROR_LOG_PATH);

//========================================================================================================
var consumerlogger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: 'info', colorize: true, prettyPrint: true }),
        new winston.transports.File({ 
            level: 'warn', 
            name: 'warn-file-logger', 
            filename: CONSUMER_WARN_LOG_PATH,
            colorize: true, 
            prettyPrint: true, 
            maxsize: MB256,
            maxFiles: 4,
            zippedArchive: true
        }),
        new winston.transports.File({ 
            level: 'error', 
            name: 'error-file-logger', 
            filename: CONSUMER_ERROR_LOG_PATH, 
            colorize: true, 
            prettyPrint: true, 
            maxsize: MB256,
            maxFiles: 4,
            zippedArchive: true
         })
    ]
});

//========================================================================================================
var cronLogger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: 'info', colorize: true, prettyPrint: true }),
        new winston.transports.File({ 
            level: 'warn', 
            name: 'warn-file-logger', 
            filename: CRON_WARN_LOG_PATH, 
            colorize: true, 
            prettyPrint: true,
            maxsize: MB256,
            maxFiles: 4,
            zippedArchive: true
        }),
        new winston.transports.File({ 
            level: 'error', 
            name: 'error-file-logger', 
            filename: CRON_ERROR_LOG_PATH, 
            colorize: true, 
            prettyPrint: true,
            maxsize: MB256,
            maxFiles: 4,
            zippedArchive: true
         })
    ]
});

//========================================================================================================
module.exports = {
    consumerLogger: consumerlogger,
    cronLogger: cronLogger
};