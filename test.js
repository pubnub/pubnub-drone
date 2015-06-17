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

var PUBNUB = require('pubnub');

console.log('starting pubnub')

var pubnub = PUBNUB.init({ 
  publish_key   : 'demo',
  subscribe_key : 'demo'
});

pubnub.publish({
  channel: 'pubnub_drone2',
  message: {text: 'hello'}
});
pubnub.subscribe({
  channel: 'pubnub_drone2',
  message: function (a, b, c) {
    console.log(a, b, c)
  }
});