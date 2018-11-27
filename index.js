import winston from 'winston';
import _ from 'lodash';
import os from 'os';

const { format } = winston;
const {
    printf, timestamp, combine, colorize
} = format;

const consoleFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

const jsonFormat = printf((info, opts) => {
    const options = _.defaults(
        {
            name: 'application-logger',
            service: '',
            version: ''
        },
        opts
    );

    function parseInfo(infoObj) {
        return _.omit(infoObj, [
            'err',
            'hostname',
            'level',
            'logger',
            'message',
            'meta',
            'service',
            'stack',
            'timestamp',
        ]);
    }
    return JSON.stringify({
        service: options.service,
        logger: options.name,
        hostname: os.hostname(),
        level: info.level,
        msg: info.message,
        meta: {
            service: {
                version: options.version,
            },
            logger: {
                time: info.timestamp,
            },
            event: parseInfo(info),
        },
        err: {
            err: info.err,
            stack: info.stack,
        },
    });
});

/**
 * Configured formatter to check for env and key words (console and json)
 * @param {Object} info
 * @param {Object} options
 * @return {string} format
 */
function configuredFormatter(info, options) {
    let { typeFormat } = options;
    if (typeFormat === undefined) {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
            typeFormat = 'console';
        } else {
            typeFormat = 'json';
        }
    }
    if (typeFormat === 'json') {
        return combine(
            timestamp(),
            jsonFormat
        );
    }
    if (typeFormat === 'console') {
        return combine(
            timestamp(),
            colorize(),
            consoleFormat
        );
    }
    throw new Error(`${typeFormat} is not json or console.`);
}

module.exports = { configuredFormatter, jsonFormat, consoleFormat };
