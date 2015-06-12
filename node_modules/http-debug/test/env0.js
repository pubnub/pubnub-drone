process.env.HTTP_DEBUG=0;
var http = require('../index').http;
var tape = require('tape');
tape('http-debug: HTTP_DEBUG', function (test) {
    test.plan(1);
    test.equal(0, http.debug, 'http.debug should equal HTTP_DEBUG');
});
