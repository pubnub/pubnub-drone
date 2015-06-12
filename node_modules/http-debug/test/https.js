var util = require('util');
var https = require('../index').https;

var tape = require('tape');

// keeping is simple for https, http.js tests everything.
tape('http-debug: https', function (test) {
    test.plan(1);

    // create harness for console.error testing
    var consoleMessage = [];
    console.error = function () {
        consoleMessage.push(util.format.apply(util, arguments));
    };

    // create harness for console.dir testing
    console.dir = function () {
        consoleMessage.push(util.inspect.apply(util, arguments));
    };

    // custom assertion to check console.error action
    test.messageLogged = function (str, message) {
        var found = false;
        consoleMessage.forEach(function (msg) {
            if (msg.match(new RegExp(str))) {
                found = true;
            }
        });
        test.ok(found, message);
    };

    https.debug = true;
    var request = https.get('https://github.com/jmervine', function (res) {
        test.messageLogged('^HTTPS REQUEST:$', 'http debug logs request debug');
        test.end();
        process.exit();// not sure why this is needed, TODO: figure it out.
    });
});

