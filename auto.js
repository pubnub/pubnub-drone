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
var autonomy = require('ardrone-autonomy');
var os = require('os');

var client  = arDrone.createClient({
  ip: '192.168.1.78',
  imageSize: 1000 * 30
});

client.config('general:navdata_demo', 'FALSE');
client.config('general:navdata_options', 777060865);

client.takeoff();
var ctrl = new autonomy.Controller(client, {debug: true});

setTimeout(function(){

  ctrl.zero();
  console.log('zeroed')

  setTimeout(function(){
  ctrl.altitude(2);

    setTimeout(function(){

      console.log('x y 1')
      ctrl.go({x: 1, y:1});

      setTimeout(function(){
        
        client.land();

      }, 10000);

    }, 2000);

  }, 2000);

}, 10000);

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
  });
}

var canCall = true;
lastData = null;

var lastGPSlng = null;
var lastGPSlat = null;

var handleData = function(droneData) {

  if(droneData.gps) {
    var lastGPSlat = droneData.gps.latitude;
    var lastGPSlng = droneData.gps.longitude;
  }

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
        client.animateLeds('blinkRed', 5, 1)
      },
      error: function(err) {
        console.log(err);
      }
    });    

  };

  canCall = false;

};

client.on('navdata', handleData);

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