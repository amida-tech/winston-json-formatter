import winston from 'winston';
import _ from 'lodash';
import os from 'os';
import util from 'util';

const { format } = winston;
const {
    printf, timestamp, combine, colorize
} = format;

const addMetaFormat = format((info, opts) => {
    const options = _.defaults(
        opts,
        {
            hostname: os.hostname(),
            logger: 'application-logger',
            node_env: process.env.NODE_ENV,
            service: '',
            version: ''
        }
    );
    return _.defaults(info, options);
});

const consoleFormat = printf(info => util.format(
    '%s %s %s %s %s',
    info.timestamp,
    info.level,
    (typeof info.message === 'string') ? info.message : `\n${JSON.stringify(info.message, null, 2)}`,
    (info.stack) ? `\n${info.stack}` : '',
    (!_.isEmpty(parseInfo(info))) ? `\n${JSON.stringify(parseInfo(info), null, 2)}` : ''
));

const jsonFormat = printf((info) => {
    const logObject = {
        service: info.service || '',
        logger: info.logger || 'application-logger',
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
        }
    };

    if (info.stack) {
        logObject.err = {
            name: info.name,
            stack: info.stack
        };
    }

    return JSON.stringify(logObject);
});

/**
 * Configured formatter to check for env and key words (console and json)
 * @param {Object} options
 * @return {string} format
 */
function configuredFormatter(options = {}) {
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

module.exports = {
    addMetaFormat,
    configuredFormatter,
    consoleFormat,
    jsonFormat,
    parseInfo
};
