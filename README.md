# Winston JSON Formatter
A json and console formatter for [winston@3](https://github.com/winstonjs/winston).

## Quickstart:

```javascript
import winston from 'winston';
import { configuredFormatter } from 'winston-json-formatter';

const { createLogger, transports } = winston;

// Create Logger and configure options.

const logger = createLogger({ 
    transports: [
        new (transports.Console)(),
    ],
});
const options = { 
    service: 'test-service', 
    name: 'Winston-JSON-Formatter', 
    version: '1.0.0', 
    typeFormat: 'json'
};

// set winston logger format and print logs.
logger.format = configuredFormatter(options);

logger.error('message');
logger.warn('message');
logger.info('message');
logger.verbose('message');
logger.debug('message');
logger.silly('message');
```

## Output: 

###Json logging
```javascript
> logger.info('message', {foo: 'bar', baz: 'qux'});
{"service":"test-service","logger":"Winston-JSON-Formatter","hostname":"host","level":"info","msg":"message","meta":{"service":{"version":"1.0.0","node_env":""},"logger":{"time":"2018-11-28T02:52:06.700Z"},"event":{"foo":"bar","baz":"qux"}},"err":{}}
```

###Console logging
![console log style](docs/console-log-example.png)

## Test
```bash
yarn install
yarn test
```
