var arDrone = require('ar-drone');
var PUBNUB = require('pubnub');

var client  = arDrone.createClient({
  ip: '192.168.1.20'
});

pubnub = PUBNUB.init({                                  
  publish_key   : 'demo',
  subscribe_key : 'demo'
});

pubnub.publish({                                     
  channel: "pn-drone",
  message: "Double Networks!!",
  callback: function(m){ console.log(m) }
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