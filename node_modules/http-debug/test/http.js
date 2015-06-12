var http = require('../index').http;
var util = require('util');

var port = 13370;

var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello world\n');
}).listen(port, 'localhost', function () {

    // don't start testing until the server is ready

    var tape = require('tape');

    // every time console.error is passed, record.

    tape('http-debug: http', function (test) {

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

        test.messageNotLogged = function (str, message) {
            var found = false;
            consoleMessage.forEach(function (msg) {
                if (msg.match(new RegExp(str))) {
                    found = true;
                }
            });
            test.notOk(found, message);
        };

        // actual tests
        http.debug = true;
        test.ok(http.debug, 'http.debug sets true');

        http.debug = false;
        test.notOk(http.debug, 'http.debug sets false');

        test.ok(typeof http.__request === 'function',
                    'http has backup of original request method');

        test.notEqual(http.request, http.__request,
                     'http.request and backup are not the equal');

        http.debug = true;
        http.get('http://localhost:'+port, function (res) {
            test.messageLogged('^HTTP REQUEST:$', 'http debug logs request debug');
            test.messageLogged('^HTTP REQUEST: END CALLED$', 'http debug logs request.end debug');
            test.messageNotLogged('^HTTP REQUEST: SOCKET EVENT$', 'http.debug level 1 does not log socket event debug');

            // reset and try with http.debug level 2
            http.debug = 2;
            consoleMessage = [];
            http.get('http://localhost:'+port, function (res) {
                test.messageLogged('^HTTP REQUEST:$', 'http.debug level 2 logs request debug');
                test.messageLogged('^HTTP REQUEST: END CALLED$', 'http debug level 2 logs request.end debug');
                test.messageLogged('^HTTP REQUEST: SOCKET EVENT$', 'http.debug level 2 logs socket event debug');

                // reset and try with http.debug off
                http.debug = false;
                consoleMessage = [];
                http.get('http://localhost:'+port, function (res) {
                    test.ok(consoleMessage.length === 0, 'http.debug off does not log debug messaging');

                    finished(test);
                });
            });

        });

    });
});

function finished(test) {
    test.end();
    server.close();
    process.exit();
}
