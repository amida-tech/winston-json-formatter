# CHANGELOG

## [Unreleased]


## [0.10.0] -- 2019-04-16
### Added
- `function: initLogLevelGte`. Returns a boolean (true/false) e.g.:
  * warn >= info: true
  * warn >= info: true
  * debug >= info: false

### Fixed
- Console and JSON logging of error objects


## [0.9.2] -- 2018-12-11
### Changed
- Renamed `options.name` --> `options.logger`
- `err` includes `err.name` and `err.stack`


## [0.9.1] -- 2018-12-10
- Added repo badging (npm, snyk, david-dm)


## [0.9.0] -- 2018-12-05
JSON formater for winston with metadata (e.g. service. hostname, version etc.).

Output format:
```json
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
