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

const consoleFormat = printf((info) => {
    let message;
    if (info.message instanceof Error) {
        // eslint-disable-next-line prefer-destructuring
        message = info.message.message;
    } else if (typeof info.message === 'string') {
        // eslint-disable-next-line prefer-destructuring
        message = info.message;
    } else {
        message = `\n${JSON.stringify(info.message, null, 2)}`;
    }

    const stack = info.stack || info.message.stack;

    let event;
    let eventString;
    if (info.message instanceof Error) {
        event = parseInfo(info);

        // Unfortunately, in this case...
        // ```
        // const err = new Error('error message');
        // err.code = 'SOME_CODE'
        // logger.info(err, { a: 'a', b: 'b' })
        // ```
        // ...the configured logger members (such as timestamp, service, node_env, etc.)
        // are members of info (expected) but also get added as members of info.message
        // (completely unexpected), so we have to parseInfo() those out.
        const errorAdditionalMembers = parseInfo(info.message);
        // eslint-disable-next-line no-restricted-syntax
        for (const property of Object.keys(errorAdditionalMembers)) {
            event[property] = errorAdditionalMembers[property];
        }

        eventString = JSON.stringify(event, null, 2);
    } else if (!_.isEmpty(parseInfo(info))) {
        event = parseInfo(info);
        eventString = JSON.stringify(event, null, 2);
    } else {
        eventString = '';
    }

    return util.format(
        '%s %s %s %s %s',
        info.timestamp,
        info.level,
        message,
        (stack) ? `\n${stack}` : '',
        eventString ? `\n${eventString}` : ''
    );
});

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

    if (info.message instanceof Error) {
        // Unfortunately, in this case...
        // ```
        // const err = new Error('error message');
        // err.code = 'SOME_CODE'
        // logger.info(err, { a: 'a', b: 'b' })
        // ```
        // ...the configured logger members (such as timestamp, service, node_env, etc.)
        // are members of info (expected) but also get added as members of info.message
        // (completely unexpected), so we have to parseInfo() those out.
        const errorAdditionalMembers = parseInfo(info.message);
        // eslint-disable-next-line no-restricted-syntax
        for (const property of Object.keys(errorAdditionalMembers)) {
            logObject.meta.event[property] = errorAdditionalMembers[property];
        }

        logObject.msg = info.message.message;

        logObject.err = {
            name: info.message.name,
            stack: info.message.stack
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
