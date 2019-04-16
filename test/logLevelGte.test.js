/* eslint-env jest */

import { initLogLevelGte } from '../src'; // eslint-disable-line import/named

const logLevelGte = initLogLevelGte();

describe.only('#logLevelGte()', () => {
    it('Throws error if called with invalid log level', () => {
        expect(() => logLevelGte('not_a_real_log_level')).toThrow();
    });

    it('Works when initialized with initLogLevelGte("error")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('error');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(false);
        expect(logLevelGte('info')).toEqual(false);
        expect(logLevelGte('http')).toEqual(false);
        expect(logLevelGte('verbose')).toEqual(false);
        expect(logLevelGte('debug')).toEqual(false);
        expect(logLevelGte('silly')).toEqual(false);
    });

    it('Works when initialized with initLogLevelGte("warn")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('warn');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(true);
        expect(logLevelGte('info')).toEqual(false);
        expect(logLevelGte('http')).toEqual(false);
        expect(logLevelGte('verbose')).toEqual(false);
        expect(logLevelGte('debug')).toEqual(false);
        expect(logLevelGte('silly')).toEqual(false);
    });

    it('Works when initialized with initLogLevelGte("info")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('info');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(true);
        expect(logLevelGte('info')).toEqual(true);
        expect(logLevelGte('http')).toEqual(false);
        expect(logLevelGte('verbose')).toEqual(false);
        expect(logLevelGte('debug')).toEqual(false);
        expect(logLevelGte('silly')).toEqual(false);
    });

    it('Works when initialized with initLogLevelGte("http")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('http');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(true);
        expect(logLevelGte('info')).toEqual(true);
        expect(logLevelGte('http')).toEqual(true);
        expect(logLevelGte('verbose')).toEqual(false);
        expect(logLevelGte('debug')).toEqual(false);
        expect(logLevelGte('silly')).toEqual(false);
    });

    it('Works when initialized with initLogLevelGte("verbose")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('verbose');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(true);
        expect(logLevelGte('info')).toEqual(true);
        expect(logLevelGte('http')).toEqual(true);
        expect(logLevelGte('verbose')).toEqual(true);
        expect(logLevelGte('debug')).toEqual(false);
        expect(logLevelGte('silly')).toEqual(false);
    });

    it('Works when initialized with initLogLevelGte("debug")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('debug');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(true);
        expect(logLevelGte('info')).toEqual(true);
        expect(logLevelGte('http')).toEqual(true);
        expect(logLevelGte('verbose')).toEqual(true);
        expect(logLevelGte('debug')).toEqual(true);
        expect(logLevelGte('silly')).toEqual(false);
    });

    it('Works when initialized with initLogLevelGte("silly")', () => {
        // eslint-disable-next-line no-shadow
        const logLevelGte = initLogLevelGte('silly');
        expect(logLevelGte('error')).toEqual(true);
        expect(logLevelGte('warn')).toEqual(true);
        expect(logLevelGte('info')).toEqual(true);
        expect(logLevelGte('http')).toEqual(true);
        expect(logLevelGte('verbose')).toEqual(true);
        expect(logLevelGte('debug')).toEqual(true);
        expect(logLevelGte('silly')).toEqual(true);
    });
});
