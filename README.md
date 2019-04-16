[![npm (tag)](https://img.shields.io/npm/v/winston-json-formatter/latest.svg)](https://www.npmjs.com/package/winston-json-formatter)
[![Known Vulnerabilities](https://snyk.io/test/npm/winston-json-formatter/badge.svg)](https://snyk.io/test/npm/winston-json-formatter)
[![dependencies Status](https://david-dm.org/amida-tech/winston-json-formatter/status.svg)](https://david-dm.org/amida-tech/winston-json-formatter)
[![devDependencies Status](https://david-dm.org/amida-tech/winston-json-formatter/dev-status.svg)](https://david-dm.org/amida-tech/winston-json-formatter?type=dev)
[![Jenkins CI](https://jenkins.amida.com/buildStatus/icon?job=Winston%20JSON%20Formatter%20Tests)](https://jenkins.amida.com/job/Winston%20JSON%20Formatter%20Tests/)

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

## Output

### Json logging
```javascript

> const err = new Error('error message');
> const err.code = 'SOME_CODE';
> // The colon and space here are recommended due to this bug in winston (https://github.com/winstonjs/winston/issues/1634)
> logger.info('log message: ', err);
{
  "service": "test-service",
  "logger": "Winston-JSON-Formatter",
  "hostname": "host",
  "level": "info",
  "msg": "log message: error message",
  "meta": {
    "service": {
      "version": "1.0.0",
      "node_env": ""
    },
    "logger": {
      "time": "2018-11-28T02:52:06.700Z"
    },
    "event": {
      "code": "SOME_CODE"
    }
  },
  "err": {
    // There should be a member `"name": "Error"` here if it were not for winston bug (https://github.com/winstonjs/winston/issues/1635)
    "stack": "THE_ERROR_STACK"
  }
}

> const err = new Error('error message');
> const err.code = 'SOME_CODE';
> logger.info(err, {foo: 'bar', baz: 'qux'});
{
  "service": "test-service",
  "logger": "Winston-JSON-Formatter",
  "hostname": "host",
  "level": "info",
  "msg": "message: error message",
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
      "baz": "qux",
      "code": "SOME_CODE"
    }
  },
  "err": {
    "name": "Error"
    "stack": "THE_ERROR_STACK"
  }
}
```

### Console logging
![console log style](docs/console-log-example.png)


```sh
# Generally, the format is:

# timestamp level message
# stack_if_one_exists
# {
#   other: 'members-if-they-exist'
# }

# > logger.info("log message") ------------------------------------------------------------------ 
2019-04-12T02:10:11.091Z info log message  
# ----


# > logger.info(new Error("error message")) ------------------------------------------------------------------ 
2019-04-12T02:10:11.094Z info error message 
Error: error message
    at Object.<anonymous> (/Users/houli/docs/gitrepos/amida-tech/winston-json-formatter/experiment.js:38:13)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3 
# ----


# > logger.info("message", new Error("error message")) ------------------------------------------------------------------ 
2019-04-12T02:10:11.095Z info log messageerror message 
Error: error message
    at Object.<anonymous> (/Users/houli/docs/gitrepos/amida-tech/winston-json-formatter/experiment.js:41:28)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3 
# ----


# > logger.info({a: "a", b: "b"}) ------------------------------------------------------------------ 
2019-04-12T02:10:11.095Z info 
{
  "a": "a",
  "b": "b"
}  
# ----


# > logger.info(new Error("error message"), { a: "a", b: "b" } ) ------------------------------------------------------------------ 
2019-04-12T02:10:11.096Z info error message 
Error: error message
    at Object.<anonymous> (/Users/houli/docs/gitrepos/amida-tech/winston-json-formatter/experiment.js:47:13)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3 
{
  "a": "a",
  "b": "b"
}
# ----


# Logging an object that is not an Error that does have a member named stack will confuse the logger. This is unavoidable.
# > logger.info({ name: "some name", stack: "some stack" }) ------------------------------------------------------------------ 
2019-04-12T02:10:11.096Z info 
{
  "name": "some name",
  "stack": "some stack"
} 
some stack 
# ----


# Logging an object that is not an Error that does have a member named stack will confuse the logger. This is unavoidable.
# > logger.info("message", { name: "some name", stack: "some stack" }) ------------------------------------------------------------------ 
2019-04-12T02:10:11.096Z info message 
some stack 
# ----


# > logger.info("message", { a: "a", b: "b" }) ------------------------------------------------------------------ 
2019-04-12T02:10:11.096Z info message  
{
  "a": "a",
  "b": "b"
}
# ----


# > const err = new Error("error message"); err.code = "SOME_CODE"; logger.info("message", new Error("error message")) ------------------------------------------------------------------ 
2019-04-12T02:10:11.097Z info messageError A 
Error: Error A
    at Object.<anonymous> (/Users/houli/docs/gitrepos/amida-tech/winston-json-formatter/experiment.js:58:14)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3 
{
  "code": "SOME_CODE"
}
# ----


# > const err = new Error("error message"); err.code = "SOME_CODE"; logger.info(new Error("error message")) ------------------------------------------------------------------ 
2019-04-12T02:10:11.097Z info Error A 
Error: Error A
    at Object.<anonymous> (/Users/houli/docs/gitrepos/amida-tech/winston-json-formatter/experiment.js:58:14)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3 
{
  "code": "SOME_CODE"
}
# ----


# > const err = new Error("error message"); err.code = "SOME_CODE"; logger.info(new Error("error message"), { a: "a", b: "b" } ) ------------------------------------------------------------------ 
2019-04-12T02:10:11.097Z info Error A 
Error: Error A
    at Object.<anonymous> (/Users/houli/docs/gitrepos/amida-tech/winston-json-formatter/experiment.js:58:14)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3 
{
  "a": "a",
  "b": "b",
  "code": "SOME_CODE"
}
```

## Miscellaneous Goodies

This repo also provides a function to check if a particular log level is greater than the currently configured log level.

Example useage:

```js
// In some service...

// config.js
module.exports = {
    logLevel: 'info',
}

// FancyCustomError.js
import { initLogLevelGte } from 'winston-json-formatter'
const config = require('../config/index.js')
const logLevelGte = initLogLevelGte(config.logLevel)

class FancyCustomError extends Error {
  constructor(rootErrorThatCouldHaveSecretStuffInIt, message, foo, bar) {
    super()

    this.message = message

    if (logLevelGte('debug')) {
        this.rootErrorThatCouldHaveSecretStuffInIt = rootErrorThatCouldHaveSecretStuffInIt
    }
  }
}

// someFile.js
logger.info(new FancyCustomError(err, 'Error creating user'))

// When the configured log level is 'info', you would see logged only 'Error creating user', but when the configured log level is 'debug', you would see all the guts and glory.
```
