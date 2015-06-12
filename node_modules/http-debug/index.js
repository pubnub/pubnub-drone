module.exports.http = httpDebug('http');
module.exports.https = httpDebug('https');

var util = require('util');
function httpDebug(proto) {
    var http = require(proto);

    // on states: true || 1 || 2
    // off states: false || 0
    if (typeof process.env.HTTP_DEBUG === 'undefined' || process.env.HTTP_DEBUG === 'false') {
        http.debug = 0;
    } else if (process.env.HTTP_DEBUG === 'true') {
        http.debug = 1;
    } else {
        http.debug = parseInt(process.env.HTTP_DEBUG, 10);
    }

    http.__request = http.request;

    http.request = function httpDebugRequest(options) {
        var request = http.__request.apply(http, arguments);

        if (!!(http.debug)) {
            // debug messaging for initial request
            console.error('%s REQUEST:', proto.toUpperCase());
            console.error(util.inspect(options));

            // handle debug messaging for request methods
            request.__write = request.write;
            request.write   = function httpDebugWrite(data) {
                console.error('%s REQUEST: WRITE CALLED', proto.toUpperCase());
                console.dir(data);
                return request.__write.apply(request, arguments);
            };

            request.__end = request.end;
            request.end   = function httpDebugEnd(data) {
                console.error('%s REQUEST: END CALLED', proto.toUpperCase());
                if (data) {
                    console.dir(data);
                }
                return request.__end.apply(request, arguments);
            };

            if (http.debug !== true && http.debug === 2) {
                // handle debug messaging for request events
                // on debug level 2
                request.on('socket',   httpDebugSocketEvent);
                request.on('error',    httpDebugErrorEvent);
            }
        }

        // event handler functions
        function httpDebugSocketEvent(data) {
            if (http.debug) {
                console.error('%s REQUEST: SOCKET EVENT', proto.toUpperCase());
                if (data) {
                    console.dir(data);
                }
            }
        }

        function httpDebugErrorEvent(err) {
            if (http.debug) {
                console.error('%s REQUEST: ERROR EVENT', proto.toUpperCase());
                console.trace(err);
            }
        }

        return request;

    };

    return http;
}

