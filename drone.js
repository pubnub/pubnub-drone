// scp -r pubnub-drone anonymous@192.168.1.3     
// telnet 192.168.1.3
// network name is dronefi
// ./bin/node drone.js
// ./bin/node --expose_gc drone.js #better
// killall udhcpd; iwconfig ath0 mode managed essid dronefi; ifconfig ath0 192.168.1.3 netmask 255.255.255.0 up; route add default gw 192.168.1.1; sleep 5; /sbin/udhcpc -i ath0;

// router must auto assign ip using dhpc
// /sbin/udhcpc -i ath0

// ```route``` command must have router in there as default
// route add default gw 192.168.1.1 ath0

// follow this
// https://github.com/daraosn/ardrone-wpa2/issues/1

// http://www.msh-tools.com/ardrone/ARDrone_Developer_Guide.pdf
 
var PUBNUB = require('pubnub');
var arDrone = require('ar-drone');

var client  = arDrone.createClient({
  ip: '192.168.1.78'
});

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

var canCall = true;
var publishData = function(data) {

  if (!canCall) return;

  setTimeout(function() {
    canCall = true;
  }, 1000);

  pubnub.publish({                                  
    channel: "pubnub_drone_stream",
    message: data
  });
   
};

client.on('navdata', publishData);

pubnub.subscribe({
  channel: 'pubnub_drone_control',
  connect: pub,
  message: function(message) {

    // console.log('got message')
    // console.log(message)
    
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

  // the AR.Drone keeps getting a "Killed" message when getting the TCP video
  // stream... Attempt to forcefully free memory once per second...

  var os = require('os');
  setInterval(function () {
    console.log('running gc()...');
    gc();

    var mem = process.memoryUsage();
    mem.freemem = os.freemem();
    mem.totalmem = os.totalmem();
    mem.freePercent = mem.freemem / mem.totalmem * 100;
    console.log('memory usage:', mem);
  }, 500);
}