# Create a realtime drone dashboard with bootstrap and PubNub EON

Ever wanted to create a dashboard for your server statistics, car, or drone? Wouldn't it be cool to log information from any device with an internet connection onto a webpage? Well now you can.

With [PubNub's Project EON](pubnub.com/developers/eon) we built a library to do just that. EON is a realtime chart and map library that helps developers create awesome dashboards featuring live data.

This tutorial will walk through creating a full featured dashboard using Twitter Bootstrap as the layout engine, EON for maps and charts, and PubNub to handle the bidirectional communication. Communication with what you might ask?

A DRONE of course!

![](http://ardrone2.parrot.com/static-ar2elite/images/theme/old-intro/drone_snow.png)

## Background

This is an advanced tutorial that combines the knowledge of two previous posts into one super awesome project. Here are the other posts for reference:

* [Getting Started with EON](https://github.com/pubnub/pubnub-evangelist-blog-posts/blob/master/Ian-EON.md)
* How I connected a drone to PubNub

## Graphing Drone Data

### Publish from the Drone

First things first. Our AR Drone is running NodeJS which makes it extremely easy to get our hack on. We'll be using the PubNub Javascript library to connect to the PubNub data stream network. This lets us communicate with our HTML dashboard.

Since this is just NodeJS, we can use ```process.memoryUsage()``` to monitor the status of our NodeJS process on the drone. NodeJS takes up almost all the drone's memory, so usually we'll only see about 3% memory usage remaining!

In addition, the ```node-ardrone``` library exposes a huge JSON object chock full of information about the drone. It has awesome status updates like acceleration, rotation, battery, and even elevation and GPS location (if you have the flight recorder add on).

Then, we'll publish that information over the PubNub network to a channel called 'pubnub_drone_stream'. If you're unfamiliar with how PubNub works, take a look at our getting started guide.

```js
var handleData = function(droneData) {

  //...

  var mem = process.memoryUsage();
  mem.freemem = os.freemem();
  mem.totalmem = os.totalmem();
  mem.freePercent = mem.freemem / mem.totalmem * 100;

  if(droneData) {

    pubnub.publish({                                  
      channel: "pubnub_drone_stream",
      message: {
        process: mem,
        drone: droneData
      }
    });    

  };

  canCall = false;

};

client.on('navdata', handleData);  
```

### Create a dashboard

Next, we'll create an HTML page to embed the charts into. Include the normal bootstrap CSS and JS, and then build a small layout for the charts to live in.

```html
<div class="container container-fluid">
  <div class="row">
    <div class="col-md-4">

      <div id="meters">

        <div class="well">
          <div id="velocity" class="chart"></div>
        </div>
        <div class="well">
          <div id="elevation" class="chart"></div>
        </div>
        <div class="well">
          <div id="memory" class="chart"></div>
        </div>
        <div class="well">
          <div id="battery" class="chart gauge"></div>
        </div>
      </div>

    </div>
  </div>
</div>
```

These divs are just placeholders for the EON realtime charts that we'll talk about in the next section.

### Hook up the realtime charts

Now that we've created a realtime stream for the drone, we'll use PubNub's Project EON to graph the realtime data! You'll need to include the EON Library files in the header of your dashboard file. You can find those tags and more information about the EON framework on the [EON landing page](http://pubnub.com/developers/eon).

In the following code examples, we call ```eon.chart``` four times; one for each measurement. We'll be making heavy use of the ```transform``` function, which allows us to select specific data from the realtime stream to display in a chart. 

```js
eon.chart({
  channel: "pubnub_drone_stream",
  generate: {
    bindto: '#velocity',
  },
  flow: true,
  limit: 500,
  transform: function(data) {
    
      return {
        columns: [
          ['X', data.drone.demo.velocity.x],
          ['Y', data.drone.demo.velocity.y],
          ['Z', data.drone.demo.velocity.z]
        ]
      }

  }
});

eon.chart({
  channel: "pubnub_drone_stream",
  generate: {
    bindto: '#elevation',
  },
  flow: true,
  limit: 500,
  transform: function(data) {
    
    return {
      columns: [
        ['Elevation (m)', data.drone.gps.elevation]
      ]
    }

  }
});


eon.chart({
  channel: "pubnub_drone_stream",
  generate: {
    bindto: '#memory',
  },
  flow: true,
  limit: 500,
  transform: function(data) {
    
    return {
      columns: [
        ['Free Memory (%)', data.process.freePercent]
      ]
    }

  }
});


eon.chart({
  channel: "pubnub_drone_stream",
  generate: {
    bindto: '#battery',
    data: {
      type: 'gauge'
    },
    gauge: {
      units: 'Battery Left'
    }
  },
  transform: function(data) {
    
    return {

      columns: [
        ['Battery (%)', data.drone.demo.batteryPercentage]
      ]

    }

  }
});
```

Now when you turn on your drone and run the ```drone.js``` file found in this repository, you'll see the drone's data logged to the graph. Cool right!?

### Controlling the drone

The drone has quite a few commands it can accept. We're going to build a dashboard that lets us build a "mission," a list of commands. Then we send the commands over, and the drone executes them in order.

We're going to start with an object called ```command``` which will allow us to store all possible drone commands and their parameters in a hierarchal structure. Notice the ```defaul``` and ```parameter``` values.

Also check out the awesome list of tricks!

```js

var commands = {};

commands['home'] = {
  functions: ['takeoff', 'land'],
  defaul: true,
  parameter: 'action'
};

commands['direction'] = {
  functions: ['forward', 'backward', 'left', 'right', 'up', 'down'],
  defaul: 1,
  parameter: 'meters'
};

commands['rotation'] = {
  functions: ['cw', 'ccw', 'yaw'],
  defaul: 90,
  parameter: 'degrees'
};

commands['altitude'] = {
  functions: ['altitude'],
  defaul: 1,
  parameter: 'meters'
};

commands['go'] = {
  functions: ['go'],
  defaul: '{x: 1, y: 1}',
  parameter: 'JSON'
};

commands['tricks'] = {
  functions: ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight'],
  defaul: '1000',
  parameter: 'ms'
}
```

So now that we have a huge list of buttons, we'll go through the hierarchy, creating a dropdown for each category, and then a button for each function. We'll use an object oriented style to create the dropdown menus.

```js

var button = function($container, command, funct) {
  
  var self = this;
  
  self.$e = $('<li class="' + funct + '"><a href="#">' + funct + '</a></li>');
  
  self.$e.click(function(){
    new instruction(command, funct);
    return false;
  });

  $container.find('.dropdown-menu').append(self.$e);

  return self;

};

for(var command in commands) {

  var commando = commands[command];
  var $container = $('<span class="dropdown">' +
    '<button class="btn btn-default dropdown-toggle" type="button" id="' + command +'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' + command +
      ' <span class="caret"></span>' +
    '</button>' +
    '<ul class="dropdown-menu" aria-labelledby="' + command + '">' +
    '</ul>' +
  '</span>');

  for(var funct in commando.functions) {

    var functo = commando.functions[funct];

    var abutton = new button($container, command, functo);

  };

  $('#buttons').append($container);

};
```

All of these objects will be rendered in a mission command column.

```html
<div class="col-md-8">
            
  <div id="buttons">
  </div>

  <div id="controller" class="well">

    <form id="mission">
      <div id="instructions">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Command</th>
              <th>Type</th>
              <th>Value</th>
              <th>Units</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody id="i-list">
          </tbody>
        </table>
      </div>
      <input type="submit" value="Send Commands" class="btn btn-primary">
    </form>

  </div>

  <div class="well">

    <div id="queue">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody id="q-list">
        </tbody>
      </table>
    </div>

  </div>

</div>
```

Now whenever you click a value in the button dropdown, it creates a new "instruction." This is just storage for the type of command we want to send to the drone *before* we send it. It will show up in the top table, and we can edit it's parameter or remove it before sending the whole mission.

An instruction looks like this:

```js

var instruction = function(command, funct) {

  var self = this;

  self.html = '' +
    '<tr class="instruction">' +
      '<td>' + command + '</td>' +
      '<td>' + funct + '</td>';

    self.html +=             '<td><input type="text" name="' + funct + '" value="' + commands[command].defaul + '"/></td>';

      self.html += '<td><span class="unit">' + commands[command].parameter + '</span></td>'+
      '<td><a class="fa fa-trash" href="#"></a></td>' +
    '</tr>';

  self.$e = $(self.html)

  self.$e.find('.fa-trash').click(function(){
    self.$e.remove();
    return false;
  });

  $('#i-list').append(self.$e);

  return self;

};
```

### Sending the mission to the drone

Now once the list of instructions has been built, we can press the "submit" button and send the commands to the drone. These commands will be sent over the PubNub channel "pubnub_drone_mission" and you'll notice the publish command looks similar to the command sending the dashboard data from the drone.

This is the code that handles the submit function. It will serialize the form data, add a few extra properties, and send it to the drone.

```js


$("#mission").submit(function(event) {

  var array = $(this).serializeArray();

  for(var i in array) {
    array[i].uuid = pubnub.uuid();
    array[i].complete = false;
    array[i].inProgress = false;
  }

  console.log(array);
  pubnub.publish({
    channel: 'pubnub_drone_mission',
    message: array
  });

  $('#i-list').empty();

  event.preventDefault();

});
```

### Queue commands on the drone

Meanwhile, the drone is listening on "pubnub_drone_queue" for commands. When it receives a command, it publishes *back* to the dashboard, and the interface renders the mission item below the mission interface.

Doing it this way allows us to confirm the drone actually got the command we sent it, and makes it collaborative. So if Stephen controls the drone from California, I can see his queue show up here in Texas.

In addition, the droen adds the commands to an array stored internally called ```queue```. This way the drone can keep track of what commands to execute. Then, every 250 milliseconds, the drone looks for the next queue item to execute. 

If there is one, it runs through a list of actions to perform and applies the custom parameters supplied with the task. 

```js
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

    activeStep.inProgress = true;

    publishStep(activeStep);

    if(activeStep.name == "takeoff") {

      client.takeoff(function(){

        if(firstRun) {
          ctrl.zero();
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
```

These tasks are defined and powered by the AWESOMe [ardrone-autonomy](https://github.com/eschnou/ardrone-autonomy) library. There are all sorts of cool functions in there that help estimate rotation, distance, etc. Who knew PID was so hard!?

### Rendering the Queue on the front end

Like I mentioned, the queue is updated on the front end when the drone receives the command. However, I didn't mention that the drone also updates it's progress on the queue as it happens in real time as well! Notice that if the ```command``` value is ```complete``` or ```inProgress``` the dashboard will change the color of the queue instead.

```js

var queue = function(command) {

  var self = this;

  if(command.complete) {
    $('#' + command.uuid).removeClass('info').addClass('success');
  } else if(command.inProgress) { 
    $('#' + command.uuid).addClass('info');
  } else {

    self.$e = $('' +
      '<tr class="instruction" id="' + command.uuid + '">' +
        '<td>' + command.name + '</td>' +
        '<td>' + command.value + '</td>' +
      '</tr>');

    $('#q-list').append(self.$e);

  }

  return self;

};

pubnub.subscribe({
  channel: 'pubnub_drone_queue',
  message: function(message) {
    console.log(message);
    queue(message);
  }
});
```

And that's how you build an autonomous drone! Easy right? It's just a but of HTML, CSS, and Javascript. Thanks to all the hard work done in libraries (EON, Bootstrap, ardrone-autonomy) it's quite easy to mash them all together and make something cool.

Be sure to check out the first part of this series where I cover how to get NodeJS running on the drone in the first place, and all of our other tutorials about making realtime charts, as well as awesome real time apps with PubNub.