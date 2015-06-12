# http-debug

[![Build Status](https://travis-ci.org/jmervine/node-http-debug.png?branch=master)](https://travis-ci.org/jmervine/node-http-debug) &nbsp; [![Dependancy Status](https://david-dm.org/jmervine/node-http-debug.png)](https://david-dm.org/jmervine/node-http-debug) &nbsp; [![NPM Version](https://badge.fury.io/js/http-debug.png)](https://badge.fury.io/js/http-debug)


``` sh
npm install http-debug
```

Usage:

``` javascript
var http = require('http-debug').http;
// var https = require('http-debug').https;

http.debug = 2;

/****
 * debug states
 * - 0     : off     (default state)
 * - 1     : on      (show request, write, end)
 * - 2     : verbose (on + error and socket event reporting)
 *
 * Also support `process.env.HTTP_DEBUG` at load time, which
 * will overide default state, however, anything passed via
 * `http.debug` at run time will cancel out
 * `process.env.HTTP_DEBUG`.
 ****/

// Make http requests as usual.
http.get('http://mervine.net/', function (err, res) {
   if (err) console.trace(err);
   console.log(res.statusCode);
});

```

Sample Output:
``` sh
# on stderr

HTTP REQUEST:
{ ... http request data ... }
HTTP REQUEST: END CALLED
{ ... request end data if any ... }
HTTP REQUEST: SOCKET EVENT
{ ... request socket event data ... }

```

# Development

Please contribute. I built this quickly for my own needs.

``` sh
git clone https://github.com/jmervine/node-http-debug.git
cd node-http-debug
npm install
npm test
```

No pull requests will be accepted unless tests are (added if need be and) passing.

# Change Log

### 0.1.1

* Support for `process.env.HTTP_DEBUG`.
* `https` test.

### 0.1.0

* Initial release.
