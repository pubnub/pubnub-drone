// scp -r pubnub-drone anonymous@192.168.1.3     
// telnet 192.168.1.3
// network name is dronefi
// ./bin/node drone.js
// killall udhcpd; iwconfig ath0 mode managed essid dronefi; ifconfig ath0 192.168.1.3 netmask 255.255.255.0 up; route add default gw 192.168.1.1; sleep 5;
// var http = require('http-debug').http;
// var https = require('http-debug').https; 

// router must auto assign ip using dhpc
// /sbin/udhcpc -i ath0

// ```route``` command must have router in there as default
// route add default gw 192.168.1.1 ath0

// follow this
// https://github.com/daraosn/ardrone-wpa2/issues/1

// http://www.msh-tools.com/ardrone/ARDrone_Developer_Guide.pdf
 
// http.debug = 2;
/*
var exec = require('child_process').exec;
exec("killall udhcpd; iwconfig ath0 mode managed essid dronefi;" + 
     "ifconfig ath0 192.168.1.3 netmask 255.255.255.0 up;" + 
     "route add default gw 192.168.1.1;" +
     "sleep 5;", function (error, stdout, stderr) {
  console.log('done')
  console.log(stderr)
  console.log(stdout);

  console.log('trying pubnub');
});

console.log ('config wifi');
*/

var PUBNUB = require('pubnub');

console.log('starting pubnub')

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

var arDrone = require('ar-drone');

var client  = arDrone.createClient({
  ip: '192.168.1.78'
});

pubnub.subscribe({
  channel: 'pubnub_drone',
  message: function(message) {

    console.log('got message')
    console.log(message)
    
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