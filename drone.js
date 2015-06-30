// telnet 192.168.1.1
// network name is dronefi

// WIP
// killall udhcpd; iwconfig ath0 mode managed key s:A1B2C essid dronefi2; /sbin/udhcpc -i ath0; sleep 5; route add default gw 192.168.1.1;

// killall udhcpd; iwconfig ath0 mode managed essid dronefi; /sbin/udhcpc -i ath0; sleep 5; route add default gw 192.168.1.1;
// ./bin/node --expose_gc drone.js


// follow this
// https://github.com/daraosn/ardrone-wpa2/issues/1
// http://www.msh-tools.com/ardrone/ARDrone_Developer_Guide.pdf
var PUBNUB = require('pubnub');
var arDrone = require('ar-drone');
var vincenty = require('node-vincenty');
var os = require('os');

var client  = arDrone.createClient({
  // ip: '192.168.1.78',
  imageSize: 1000 * 30
});

client.config('general:navdata_demo', 'FALSE');
client.config('general:navdata_options', 777060865);

pubnub = PUBNUB.init({     
  origin: '54.236.3.173',
  publish_key   : 'demo',
  subscribe_key : 'demo'
});

function pub() {
  console.log('connected')
  pubnub.publish({                                     
    channel : "pubnub_drone",
    message : "hello, I am a drone running pubnub over a hotspot",
    callback: function(m){ 
      console.log('message published');
      console.log(m);

     }
  })
}

function within(x, min, max) {
  if (x < min) {
      return min;
  } else if (x > max) {
      return max;
  } else {
      return x;
  }
}

var target = {
  lat: 30.353353939192427,
  lng: -97.67154425382614
};

var canCall = true;
lastData = null;

var lastGPSlng = null;
var lastGPSlat = null;

var handleData = function(droneData) {

  if(droneData.gps) {
    var lastGPSlat = droneData.gps.latitude;
    var lastGPSlng = droneData.gps.longitude;
  }

  /*
  if(droneData.demo && droneData.gps) {
    
    // navigate
    vincenty.distVincenty(
      lastGPSlat, 
      lastGPSlng, 
      target.lat, 
      target.lng, function (distance, initialBearing, finalBearing) {
      
      currentYaw = droneData.demo.rotation.yaw;

      if(distance > 1){

        currentDistance = distance
        console.log('distance', distance)
        console.log('bearing:', initialBearing)
        targetYaw = initialBearing;

        console.log('currentYaw:', currentYaw);
        var eyaw = targetYaw - currentYaw;
        console.log('eyaw:', eyaw);

        var uyaw = yawPID.getCommand(eyaw);
        console.log('uyaw:', uyaw);

        var cyaw = within(uyaw, -1, 1);
        console.log('cyaw:', cyaw);

        client.clockwise(cyaw / 10)

        if(within(eyaw, -1, 1)){
          client.front(0.2);
        }

      } else {
        targetYaw = null
        console.log('!!!!!!!!!!!!!!!!!! Reached ', target.lat, target.lng)
        client.land();
      }

    });
  }
  */

  // publish to pn
  if (!canCall) { return };

  if(typeof droneData.demo !== "undefined") {
    // console.log(droneData.demo.rotation.clockwise); 
    lastData = droneData;
  } else {
    droneData = lastData;
  }

  setTimeout(function() {
    canCall = true;
  }, 1000);

  var mem = process.memoryUsage();
  mem.freemem = os.freemem();
  mem.totalmem = os.totalmem();
  mem.freePercent = mem.freemem / mem.totalmem * 100;

  if(droneData) {

    console.log('!!!!! publishing')

    pubnub.publish({                                  
      channel: "pubnub_drone_stream",
      message: {
        process: mem,
        drone: droneData
      },
      callback: function(){
        // console.log('published');
        client.animateLeds('blinkRed', 5, 1)

      },
      error: function(err) {
        console.log(err);
      }
    });    

  };

  canCall = false;

};

// client.takeoff();
client.on('navdata', handleData);

pubnub.subscribe({
  channel: 'pubnub_drone_control',
  connect: pub,
  message: function(message) {

    // console.log('got message')
    // console.log(message)

    client.animateLeds('blinkGreen', 5, 1)
    
    if(message == "takeoff") {
      client.takeoff();
    }

    if(message == "land") {
      client.land();
    }

    if(message == "clockwise") {
      client.clockwise(.2);
    }

    if(message == "counterclockwise") {
      client.counterClockwise(.2);
    }

    if(message == "left") {
      client.left(.2);
    }

    if(message == "right") {
      client.right(.2);
    }

    if(message == "front") {
      client.front(.2);
    }

    if(message == "back") {
      client.back(.2);
    }

    if(message == "up") {
      client.up(.2);
    }

    if(message == "down") {
      client.down(.2);
    }

    if(message == "stop") {
      client.stop();
    }

  }

});

process.on("SIGINT", function() {                                                                    
  client.land();                                                                                      
  setTimeout(function() {                                                                            
    process.kill(process.pid);                                                                       
  }, 1000);                                                                                          
});

// https://github.com/TooTallNate/ar-drone-socket.io-proxy/blob/master/receiver.js
// DEBUG - run with `--expose_gc`
if ('function' == typeof gc) {

  console.log('Garbage Collection Enabled')
  // the AR.Drone keeps getting a "Killed" message
  // stream... Attempt to forcefully free memory once per second...
  setInterval(function () {
    gc();
  }, 500);

}