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

function testLog(testOptions, testSpy) {
    logger.format = configuredFormatter({}, testOptions);
    logger.error('message');
    expect(testSpy).toHaveBeenCalled();
}

beforeEach(() => {
    logger = createLogger({
        level: 'silly'
    });
});

describe('configuredFormatter testing', () => {
    describe('console output', () => {
        beforeEach(() => {
            // spy to check output
            spy = jest.fn((info) => {
                const sym = Symbol.for('message');
                const testMess = info[sym];
                expect(testMess).toEqual(`${info.timestamp} ${info.level}: ${info.message}`);
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });
        test('it passes console format check', (done) => {
            options.typeFormat = 'console';
            testLog(options, spy);
            done();
        });
        test('it checks NODE_ENV for development and sets to console', (done) => {
            process.env.NODE_ENV = 'dev';
            testLog(options, spy);
            done();
        });
    });
    describe('json output', () => {
        beforeEach(() => {
            // spy to check output
            spy = jest.fn((info) => {
                const sym = Symbol.for('message');
                const testMess = info[sym];
                const parsedTestMess = JSON.parse(testMess);
                expect(parsedTestMess.msg).toEqual('message');
                // expect(parsedTestMess.service).toEqual(options.service);
                // expect(parsedTestMess.logger).toEqual(options.name);
                expect(parsedTestMess.level).toEqual('error');
            });
            logger.add(new winston.transports.SpyTransport({ spy }));
        });
        test('it passes json format check', (done) => {
            options.typeFormat = 'json';
            testLog(options, spy);
            done();
        });
        test('it checks NODE_ENV for other', (done) => {
            process.env.NODE_ENV = 'test';
            testLog(options, spy);
            done();
        });
    });
    test('error should appear in message', (done) => {
        const error = new Error('err');
        spy = jest.fn((info) => {
            const sym = Symbol.for('message');
            const testMess = info[sym];
            const parsedTestMess = JSON.parse(testMess);
            expect(parsedTestMess.err.stack).toEqual(error.stack);
        });
        logger.add(new winston.transports.SpyTransport({ spy }));
        logger.format = configuredFormatter({}, options);
        logger.error(error);
        expect(spy).toHaveBeenCalled();
        done();
    });
    test('it errors when typeFormat is incorrect', (done) => {
        try {
            options.typeFormat = 'test';
            testLog(options, spy);
        } catch (e) {
            expect(e.message).toBe('test is not json or console.');
            done();
        }
    });
});
