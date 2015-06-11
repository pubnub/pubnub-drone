// scp -r pubnub-drone anonymous@192.168.1.3     
// telnet 192.168.1.3
// network name is dronefi
// ./bin/node drone.js
// killall udhcpd; iwconfig ath0 mode managed essid dronefi; ifconfig ath0 192.168.1.3 netmask 255.255.255.0 up; route add default gw 192.168.1.1; sleep 5;

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
*/
console.log ('config wifi');
var PUBNUB = require('pubnub');

var start = function(){

  console.log('starting pubnub')

  pubnub = PUBNUB.init({                                  
    publish_key   : 'demo',
    subscribe_key : 'demo'
  });

  function pub() {
    console.log('connected')
    pubnub.publish({                                     
      channel : "pubnub-drone",
      message : "hello, I am a drone running pubnub over a hotspot",
      callback: function(m){ 
        console.log('message published');
        console.log(m);
       }
    })
  }

  pubnub.subscribe({                                      
    channel : "pubnub-drone",
    message : function(message,env,channel){
      console.log('message recieved')
      console.log(message);
    },
    connect: pub,
    error: function (error) {
      // Handle error here
      console.log('an error has occured')
      console.log(error)
      console.log(JSON.stringify(error));
    }
  });

  /*
  var arDrone = require('ar-drone');

  var client  = arDrone.createClient({
    ip: '192.168.1.20'
  });

  pubnub.subscribe({
    channel: 'pn-drone',
    message: function(message) {
      
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
  */

}
start();