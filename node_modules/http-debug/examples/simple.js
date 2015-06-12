#!/usr/bin/env node
// usage: HTTP_DEBUG=2 simple.js
//        HTTP_DEBUG=1 simple.js
//        HTTP_DEBUG=0 simple.js
//        HTTP_DEBUG=true simple.js
//        HTTP_DEBUG=false simple.js
//
var https = require('../').https;
var request = require('request-lite');

request.get('https://github.com/jmervine/node-http-debug', function (err, res, body) {
    console.log('Status Code: %s', res.statusCode);
});

