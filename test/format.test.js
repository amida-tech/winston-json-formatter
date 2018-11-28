/* eslint-env jest */

import winston from 'winston';
import SpyTransport from '@chrisalderson/winston-spy'; // eslint-disable-line no-unused-vars
import { configuredFormatter } from '../index'; // eslint-disable-line import/named

const { createLogger } = winston;

const options = {
    service: 'test-service',
    name: 'test-name',
    version: 'test-version',
};
let logger;
let spy;

function testLoggerInfo(testOptions, testSpy) {
    logger.format = configuredFormatter(testOptions);
    logger.info('message', { foo: 'bar' });
    expect(testSpy).toHaveBeenCalled();
}

beforeEach(() => {
    logger = createLogger({
        level: 'silly',
        transports: [
            new winston.transports.Console({ silent: true })
        ]
    });
});

describe('configuredFormatter testing', () => {
    describe('console output', () => {
        beforeEach(() => {
            spy = jest.fn((info) => {
                const sym = Symbol.for('message');
                const testMsg = info[sym];
                expect(testMsg).toEqual(`${info.timestamp} ${info.level}: ${info.message}`);
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });
        test('it passes console format check', (done) => {
            options.typeFormat = 'console';
            testLoggerInfo(options, spy);
            done();
        });
        test('it checks NODE_ENV for development and sets to console', (done) => {
            process.env.NODE_ENV = 'dev';
            testLoggerInfo(options, spy);
            done();
        });
    });

    describe('json output (info)', () => {
        beforeEach(() => {
            spy = jest.fn((info) => {
                expect(spy).toHaveBeenCalled();

                const sym = Symbol.for('message');
                const testMsg = info[sym];
                const parsedTestMsg = JSON.parse(testMsg);

                expect(parsedTestMsg.level).toEqual('info');
                expect(parsedTestMsg.msg).toEqual('message');
                expect(parsedTestMsg.service).toEqual(options.service);
                expect(parsedTestMsg.logger).toEqual(options.name);
                expect(parsedTestMsg.meta.service.version).toEqual(options.version);
                expect(parsedTestMsg.meta.event.foo).toEqual('bar');
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });
        test('it passes json format check', (done) => {
            options.typeFormat = 'json';
            testLoggerInfo(options, spy);
            done();
        });
        test('it checks NODE_ENV for other', (done) => {
            process.env.NODE_ENV = 'test';
            testLoggerInfo(options, spy);
            done();
        });
        test('it errors when typeFormat is incorrect', (done) => {
            try {
                options.typeFormat = 'test';
                testLoggerInfo(options, spy);
            } catch (e) {
                expect(e.message).toBe('test is not json or console.');
                done();
            }
        });
    });

    describe('json output (error)', () => {
        beforeEach(() => {
            spy = jest.fn((info) => {
                const sym = Symbol.for('message');
                const testMsg = info[sym];
                const parsedTestMess = JSON.parse(testMsg);
                expect(parsedTestMess.err.stack).toEqual(expect.stringMatching('Error: '));
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });
        test('error should appear in message', (done) => {
            options.typeFormat = 'json';
            logger.format = configuredFormatter(options);

            const error = new Error('err');
            logger.error(error);
            expect(spy).toHaveBeenCalled();
            done();
        });
    });
});
