[![npm (tag)](https://img.shields.io/npm/v/winston-json-formatter/latest.svg)](https://www.npmjs.com/package/winston-json-formatter)
[![Known Vulnerabilities](https://snyk.io/test/npm/winston-json-formatter/badge.svg)](https://snyk.io/test/npm/winston-json-formatter)
[![dependencies Status](https://david-dm.org/amida-tech/winston-json-formatter/status.svg)](https://david-dm.org/amida-tech/winston-json-formatter)
[![devDependencies Status](https://david-dm.org/amida-tech/winston-json-formatter/dev-status.svg)](https://david-dm.org/amida-tech/winston-json-formatter?type=dev)

# Winston JSON Formatter
A json and console formatter for [winston@3](https://github.com/winstonjs/winston).

## Quickstart:

```javascript
const { createLogger, transports } = require('winston');
const { configuredFormatter } = require('winston-json-formatter');

// Create Logger and configure options.

const logger = createLogger({ 
    level: 'silly',
    transports: [
        new (transports.Console)(),
    ],
});
const options = { 
    service: 'test-service', 
    logger: 'Winston-JSON-Formatter',
    version: '1.0.0', 
    typeFormat: 'json'
};

// set winston logger format and print logs.
logger.format = configuredFormatter(options);

// Availale log levels
logger.error('message');
logger.warn('message');
logger.info('message');
logger.verbose('message');
logger.debug('message');
logger.silly('message');

// Error Objects can be logged directly
err = new Error('Heroic BSoD')
logger.error(err)
```

## Output

### Json logging
```javascript
> logger.info('message', {foo: 'bar', baz: 'qux'});
{
  "service": "test-service",
  "logger": "Winston-JSON-Formatter",
  "hostname": "host",
  "level": "info",
  "msg": "message",
  "meta": {
    "service": {
      "version": "1.0.0",
      "node_env": ""
    },
    "logger": {
      "time": "2018-11-28T02:52:06.700Z"
    },
    "event": {
      "foo": "bar",
      "baz": "qux"
    }
  },
  "err": {}
}
```

### Console logging
![console log style](docs/console-log-example.png)

## Configuration
ENV
- `NODE_ENV=dev` || `NODE_ENV=development` => `options.typeFormat=console`
- Otherwise, `options.typeFormat=json` (default)

| Option               | Default                       | Type                    |
| -------------------- | ----------------------------- | ----------------------- |
| `options.typeFormat` | Default: 'json'               | Enum: 'console', 'json' |
| `options.hostname`   | Default: `os.hostname()`      | String                  |
| `options.logger`     | Default: 'application-logger' | String                  |
| `options.node_env`   | Default: `ENV NODE_ENV`       | String                  |
| `options.service`    |                               | String                  |
| `options.version`    |                               | String                  |

## Test
```bash
yarn install
yarn test
yarn test:coverage
```
