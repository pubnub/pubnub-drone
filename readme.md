# Control Your Drone with PubNub

Take over the world!

![](http://ecx.images-amazon.com/images/I/81RNYV29HCL._SL1500_.jpg)

## Setup

Your drone needs to be connected to a hotspot rather than your computer. To do this, you need to Telnet into it and reconfigure the wifi.

More on how to do that [here](http://www.nodecopter.com/hack#connect-to-access-point). Also check out [this gist](https://gist.github.com/karlwestin/4051467).

## PubNub Controlled Drone

Configure ```drone.js``` to use the IP address you defined in:

```js
node drone.js
```

Then you can use the PubNub Console to send commands like "takeoff", "left", "rotate". Kill the ```drone.js``` process locally to land the drone.

## Future Plans	

Eventually we'll do this:

https://github.com/TooTallNate/ar-drone-socket.io-proxy