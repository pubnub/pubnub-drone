// telnet 192.168.1.1
// network name is dronefi

// WIP
// killall udhcpd; iwconfig ath0 mode managed key s:A1B2C essid dronefi2; /sbin/udhcpc -i ath0; sleep 5; route add default gw 192.168.1.1;

// killall udhcpd; iwconfig ath0 mode managed essid dronefi; /sbin/udhcpc -i ath0; sleep 5; route add default gw 192.168.1.1;
// ./bin/node --expose_gc drone.js

// follow this
// https://github.com/daraosn/ardrone-wpa2/issues/1
// http://www.msh-tools.com/ardrone/ARDrone_Developer_Guide.pdf

function navdata_option_mask(c) {
  return 1 << c;
}
var PUBNUB = require('pubnub');
var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');
var arDroneConstants = require('ar-drone/lib/constants')
var os = require('os');

var client  = arDrone.createClient({
  // ip: '192.168.1.78',
  // imageSize: 1000 * 30
});

// From the SDK.
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO)
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI
  | 777060865)
);

// Connect and configure the drone
client.config('general:navdata_demo', true);
client.config('general:navdata_options', navdata_options);
client.config('video:video_channel', 1);
client.config('detect:detect_type', 12);

process.on("SIGINT", function() {                                                                    
  client.land();                                                                                      
  setTimeout(function() {                                                                            
    process.kill(process.pid);                                                                       
  }, 1000);                                                                                          
});

var ctrl    = new autonomy.Controller(client, {debug: false});

var quene = [
  {
    name: "takeoff",
    value: "1",
    uuid: "89b9ad42-3032-42b0-8063-8ca6670bbd4d"
  },
  {
    name: "ccw",
    value: "90",
    uuid: "d37cc58b-228a-49e1-bb85-9e2e6fbd4e79"
  },
  {
    name: "land",
    value: "1",
    uuid: "d37cc58b-228a-49e1-bb85-9e2e6fbd4e79"
  }
];

var inProgress = false;
var activeStep;

setInterval(function() {

  if(!inProgress && quene.length) {

    var done = function(err){
      if(err) {
        client.land();
        console.log(err);
      } else {
        inProgress = false;
        quene.shift();
      }
    };

    inProgress = true;
    activeStep = quene[0];

    console.log('performing step:');
    console.log(activeStep);

    if(activeStep.name == "takeoff") {
      client.takeoff(function(){
        ctrl.zero();
        done();
      });
    }

    if(activeStep.name == "land") {
      client.land(function(){
        done();
      });
    }

    if(activeStep.name == "hover") {
      ctrl.hover();
      setTimeout(function(){
        done();
      }, activeStep.value);
    }

    if(activeStep.name == "wait") {
      setTimeout(function(){
        done();
      }, activeStep.value);
    }

    if(activeStep.name == "go") {
      ctrl.go(JSON.parse(activeStep.value), done);
    }

    if(activeStep.name == "forward") {
      ctrl.forward(activeStep.value, done);
    }

    if(activeStep.name == "backward") {
      ctrl.backward(activeStep.value, done);
    }

    if(activeStep.name == "left") {
      ctrl.left(activeStep.value, done);
    }

    if(activeStep.name == "right") {
      ctrl.right(activeStep.value, done);
    }

    if(activeStep.name == "up") {
      ctrl.up(activeStep.value, done);
    }

    if(activeStep.name == "down") {
      ctrl.down(activeStep.value, done);
    }

    if(activeStep.name == "cw") {
      ctrl.cw(activeStep.value, done);
    }

    if(activeStep.name == "ccw") {
      ctrl.ccw(activeStep.value, done);
    }

    if(activeStep.name == "altitude") {
      ctrl.altitude(activeStep.value, done);
    }

    if(activeStep.name == "yaw") {
      ctrl.yaw(activeStep.value, done);
    }

  } else {
  }

}, 250);

/*
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
*/