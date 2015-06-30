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
  marker: function (latlng, data) {

    var marker = new L.RotatedMarker(latlng);

    return marker;

  },
  connect: function(){
    console.log('woop woop')
  },
  transform: function(data) {

    console.log('map cb')
    console.log(data);

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