// telnet 192.168.1.1

// killall udhcpd; iwconfig ath0 mode managed essid drone; /sbin/udhcpc -i ath0; sleep 5; route add default gw 192.168.1.1;
// ./bin/node --expose_gc auto.js

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
  ip: '192.168.1.87'
  // imageSize: 1000 * 30
});

// From the SDK.
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO)
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI)
);

// Connect and configure the drone
client.config('general:navdata_demo', true);
client.config('general:navdata_options', navdata_options);
client.config('general:navdata_options', 777060865);
client.config('video:video_channel', 1);
client.config('detect:detect_type', 12);

process.on("SIGINT", function() {                                                                    
  client.land();                                                                                      
  setTimeout(function() {                                                                            
    process.kill(process.pid);                                                                       
  }, 1000);                                                                                          
});

pubnub = PUBNUB.init({     
  origin: '54.236.3.173',
  publish_key   : 'demo',
  subscribe_key : 'demo'
});

var ctrl = new autonomy.Controller(client, {debug: false});

var inProgress = false;
var activeStep;
var queue = [];

var publishStep = function(step) {

  pubnub.publish({                                     
    channel: "pubnub_drone_queue",
    message: step,
    callback: function(m){ 
      console.log('message published');
      console.log(m);
    }
  });

}

pubnub.subscribe({                                  
  channel: "pubnub_drone_mission",
  message: function(message) {
    
    for(var i in message) {
      
      console.log('got commands')
      console.log(message[i]);

      publishStep(message[i]);
      queue.push(message[i]);

    }

  },
  error: function(err) {
    console.log(err);
  }
});    

var firstRun = true;
var tricks = ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight'];

setInterval(function() {

  if(!inProgress && queue.length) {

    var done = function(err){

      if(err) {
        client.land();
        console.log('!EERRROR')
        console.log(err);
      } else {
        
        inProgress = false;
        activeStep.inProgress = false;

        activeStep.complete = true;
        publishStep(activeStep);

        queue.shift();

      }
    };

    inProgress = true;
    activeStep = queue[0];

    console.log('performing step:');
    console.log(activeStep);

    activeStep.inProgress = true;

    publishStep(activeStep);

    console.log(activeStep.name)

    if(activeStep.name == "takeoff") {

      console.log('taking off')

      client.takeoff(function(){

        if(firstRun) {
          ctrl.zero();
          // firstRun = false;
        }      
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
      }, parseInt(activeStep.value));
    }

    if(activeStep.name == "wait") {
      setTimeout(function(){
        done();
      }, parseInt(activeStep.value));
    }

    if(activeStep.name == "go") {
      ctrl.go(JSON.parse(activeStep.value), done);
    }

    if(activeStep.name == "forward") {
      ctrl.forward(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "backward") {
      ctrl.backward(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "left") {
      ctrl.left(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "right") {
      ctrl.right(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "up") {
      ctrl.up(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "down") {
      ctrl.down(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "cw") {
      ctrl.cw(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "ccw") {
      ctrl.ccw(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "altitude") {
      ctrl.altitude(parseInt(activeStep.value), done);
    }

    if(activeStep.name == "yaw") {
      ctrl.yaw(parseInt(activeStep.value), done);
    }

    if(tricks.indexOf(activeStep.name) > -1) {
      
      client.animate(activeStep.name, activeStep.value);
      setTimeout(function(){
        done();
      }, activeStep.value);

    }

  } else {
  }

}, 250);

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

    // console.log('!!!!! publishing')

    pubnub.publish({                                  
      channel: "pubnub_drone_stream",
      message: {
        process: mem,
        drone: droneData
      },
      callback: function(){
        client.animateLeds('blinkGreen', 5, 1)
      },
      error: function(err) {
        
        console.log('p error')
        console.log(err);

        client.animateLeds('blinkRed', 5, 1)
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