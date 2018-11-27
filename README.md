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
logger.format = configuredFormatter({}, options);

logger.error('message');
logger.warn('message');
logger.info('message');
logger.verbose('message');
logger.debug('message');
logger.silly('message');
```

## Output: 

###Json logging
`{"service":"","logger":"winston-json-configuredFormatter","hostname":"","level":"error","msg":"message","meta":{"service":{"version":""},"logger":{"time":"2018-11-27T13:44:28.023Z"},"event":{}},"err":{}}`

###Console logging
![console log style](console-log-example.png)
