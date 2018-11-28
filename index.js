import winston from 'winston';
import _ from 'lodash';
import os from 'os';

const { format } = winston;
const {
    printf, timestamp, combine, colorize
} = format;

const addMetaFormat = format((info, opts) => {
    const options = _.defaults(
        opts,
        {
            name: 'application-logger',
            hostname: os.hostname(),
            node_env: process.env.NODE_ENV,
            service: '',
            version: ''
        }
    );
    return _.defaults(info, options);
});

const consoleFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

const jsonFormat = printf((info) => {
    function parseInfo(infoObj) {
        return _.omit(infoObj, [
            'err',
            'hostname',
            'level',
            'logger',
            'message',
            'meta',
            'name',
            'node_env',
            'service',
            'stack',
            'timestamp',
            'typeFormat',
            'version'
        ]);
    }

    return JSON.stringify({
        service: info.service || '',
        logger: info.name || 'application-logger',
        hostname: info.hostname || '',
        level: info.level,
        msg: info.message,
        meta: {
            service: {
                version: info.version || '',
                node_env: info.node_env || ''
            },
            logger: {
                time: info.timestamp || '',
            },
            event: parseInfo(info),
        },
        err: {
            err: info.err,
            message: info.message,
            name: info.name,
            stack: info.stack
        }
    });
});

/**
 * Configured formatter to check for env and key words (console and json)
 * @param {Object} options
 * @return {string} format
 */
function configuredFormatter(options) {
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
            addMetaFormat(options),
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

module.exports = {
    addMetaFormat,
    configuredFormatter,
    consoleFormat,
    jsonFormat
};
