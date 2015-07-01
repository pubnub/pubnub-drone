L.RotatedMarker = L.Marker.extend({
  options: { angle: 0 },
  _setPos: function(pos) {
    L.Marker.prototype._setPos.call(this, pos);
    if (L.DomUtil.TRANSFORM) {
      // use the CSS transform rule if available
      this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
    } else if (L.Browser.ie) {
      // fallback for IE6, IE7, IE8
      var rad = this.options.angle * L.LatLng.DEG_TO_RAD,
      costheta = Math.cos(rad),
      sintheta = Math.sin(rad);
      this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
        costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
    }
  }
});

var channel = 'pubnub_drone_stream';

var mapbox = eon.map({
  id: 'map',
  mb_token: 'pk.eyJ1IjoiaWFuamVubmluZ3MiLCJhIjoiZExwb0p5WSJ9.XLi48h-NOyJOCJuu1-h-Jg',
  mb_id: 'ianjennings.mfoamn2k',
  channel: 'pubnub_drone_stream',
  rotate: true,
  marker: function (latlng) {

    var marker = new L.RotatedMarker(latlng, {
      icon: L.icon({
        iconUrl: 'https://d30y9cdsu7xlg0.cloudfront.net/png/65910-200.png',
        iconSize: [24, 24]
      })
    });

    mapbox.setView({lat: latlng[0], lng: latlng[1]}, 20);

    return marker;

  },
  connect: function(){
  },
  transform: function(data) {

      return [
        { latlng: [data.drone.gps.latitude, data.drone.gps.longitude] }
      ];

  }
});

mapbox.on('click', function(e) {

  PUBNUB.publish({
    channel: 'pubnub_drone_waypoint',
    message: {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    }
  });

});

// velocity chart
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


var pubnub = PUBNUB.init({
  subscribe_key: 'demo',
  publish_key: 'demo'
});

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
