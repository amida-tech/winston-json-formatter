# CHANGELOG

## [Unreleased]
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