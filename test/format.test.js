/* eslint-env jest */

import _ from 'lodash';
import SpyTransport from '@chrisalderson/winston-spy'; // eslint-disable-line no-unused-vars
import util from 'util';
import winston from 'winston';
import { configuredFormatter, parseInfo } from '../src'; // eslint-disable-line import/named

const { createLogger } = winston;

let options;
let logger;
let spy;

function testLoggerInfo(testOptions, testSpy, ...loggerArgs) {
    logger.format = configuredFormatter(testOptions);
    logger.info(...loggerArgs);
    expect(testSpy).toHaveBeenCalled();
}

beforeEach(() => {
    logger = createLogger({
        level: 'silly',
        transports: [
            new winston.transports.Console({ silent: true })
        ]
    });

    options = {
        service: 'test-service',
        logger: 'test-logger',
        version: 'test-version',
    };
});

describe('configuredFormatter testing', () => {
    describe('console output', () => {
        beforeEach(() => {
            spy = jest.fn((info) => {
                const sym = Symbol.for('message');
                const testMsg = info[sym];

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

                const expectedMessage = util.format(
                    '%s %s %s %s %s',
                    info.timestamp,
                    info.level,
                    message,
                    (stack) ? `\n${stack}` : '',
                    eventString ? `\n${eventString}` : ''
                );

                expect(testMsg).toEqual(expectedMessage);
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });

        test('it supports signature logger.info("message")', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, 'message');
            done();
        });

        test('it supports signature logger.info(new Error("error message"))', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, new Error('error message'));
            done();
        });

        test('it supports signature logger.info("message", new Error("error message"))', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, 'message', new Error('error message'));
            done();
        });

        test('it supports signature logger.info({ a: "a", b: "b" })', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, { a: 'a', b: 'b' });
            done();
        });

        test('it supports signature logger.info({ name: "some name", stack: "some stack" })', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, { name: 'some name', stack: 'some stack' });
            done();
        });

        test('it supports signature logger.info("message", { a: "a", b: "b" })', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, 'message', { a: 'a', b: 'b' });
            done();
        });

        test('it supports signature logger.info("message", { name: "some name", stack: "some stack" })', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, 'message', { name: 'some name', stack: 'some stack' });
            done();
        });

        test('it supports signature logger.info(new Error("error message"), { a: "a", b: "b" })', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, new Error('error message'), { a: 'a', b: 'b' });
            done();
        });

        const errWithCode = new Error('error message');
        errWithCode.code = 'SOME_ERROR_CODE';

        test('it supports signature logger.info(someError), where someError has additional members', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, errWithCode);
            done();
        });

        test('it supports signature logger.info("message", someError), where someError has additional members', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, 'message', errWithCode);
            done();
        });

        test('it supports signature logger.info(someError, { a: "a", b: "b" }), where someError has additional members', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy, errWithCode, { a: 'a', b: 'b' });
            done();
        });

        test('it checks NODE_ENV for development and sets to console', (done) => {
            process.env.NODE_ENV = 'dev';
            testLoggerInfo(options, spy, 'message', { foo: 'bar' });
            done();
        });
    });

    describe('json output', () => {
        beforeEach(() => {
            spy = jest.fn((info) => {
                const sym = Symbol.for('message');
                const testMsg = info[sym];
                const parsedTestMsg = JSON.parse(testMsg);

                const expectedMessage = {
                    service: options.service,
                    logger: options.logger,
                    hostname: info.hostname,
                    level: 'info',
                    msg: info.message,
                    meta: {
                        service: {
                            version: options.version,
                            node_env: info.node_env
                        },
                        logger: {
                            time: info.timestamp
                        },
                        // The spy adds extra symbols to 'info' that a normal winston transport does
                        // not. They must be stripped in order to get the same result as the real
                        // formatter gets when it does `parseInfo(info)`.
                        event: parseInfo(stripSymbols(info))
                    }
                };

                if (info.stack) {
                    expectedMessage.err = {
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
                        expectedMessage.meta.event[property] = errorAdditionalMembers[property];
                    }

                    expectedMessage.msg = info.message.message;

                    expectedMessage.err = {
                        name: info.message.name,
                        stack: info.message.stack
                    };
                }

                expect(parsedTestMsg).toEqual(expectedMessage);
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });

        test('it supports signature logger.info("message")', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, 'message');
            done();
        });

        test('it supports signature logger.info(new Error("error message"))', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, new Error('error message'));
            done();
        });

        test('it supports signature logger.info("message", new Error("error message"))', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, 'message', new Error('error message'));
            done();
        });

        test('it supports signature logger.info({ a: "a", b: "b" })', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, { a: 'a', b: 'b' });
            done();
        });

        test('it supports signature logger.info(new Error("error message"), { a: "a", b: "b" })', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, new Error('error message'), { a: 'a', b: 'b' });
            done();
        });

        test('it supports signature logger.info({ name: "some name", stack: "some stack" })', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, { name: 'some name', stack: 'some stack' });
            done();
        });

        test('it supports signature logger.info("message", { a: "a", b: "b" })', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, 'message', { a: 'a', b: 'b' });
            done();
        });

        test('it supports signature logger.info("message", { name: "some name", stack: "some stack" })', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, 'message', { name: 'some name', stack: 'some stack' });
            done();
        });

        test('it supports signature logger.info(new Error("error message"), { a: "a", b: "b" })', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, new Error('error message'), { a: 'a', b: 'b' });
            done();
        });

        const errWithCode = new Error('error message');
        errWithCode.code = 'SOME_ERROR_CODE';

        test('it supports signature logger.info(someError), where someError has additional members', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, errWithCode);
            done();
        });

        test('it supports signature logger.info("message", someError), where someError has additional members', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, 'message', errWithCode);
            done();
        });

        test('it supports signature logger.info(someError, { a: "a", b: "b" }), where someError has additional members', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy, errWithCode, { a: 'a', b: 'b' });
            done();
        });

        test('it checks NODE_ENV for other', (done) => {
            process.env.NODE_ENV = 'test';
            testLoggerInfo(options, spy, 'message', { foo: 'bar' });
            done();
        });

        test('it errors when typeFormat is incorrect', (done) => {
            try {
                options.typeFormat = 'test';
                testLoggerInfo(options, spy, 'message', { foo: 'bar' });
            } catch (e) {
                expect(e.message).toBe('test is not json or console.');
                done();
            }
        });
    });
});

function stripSymbols(obj) {
    const objWithoutSymbols = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const property of Object.keys(obj)) {
        objWithoutSymbols[property] = obj[property];
    }
    return objWithoutSymbols;
}
