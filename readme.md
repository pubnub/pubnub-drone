# Overview

* Write the drone mission on the right in a text field
* Show the drone on the left in a map
* Send it updates as you go
* Attache the hotspot onto it

# Control Your Drone with PubNub

Take over the world!

![](http://ecx.images-amazon.com/images/I/81RNYV29HCL._SL1500_.jpg)

# Overview

The purpose of this demo is to simulate the sitatuon in which a customer orders a product from an online retailer, and a drone is dispatched autonomously. 

# Background

We'll be using the Parrot AR 2.0 drone. Normally the Parrot AR 2.0 is controlled over a WiFi connection from your phone. This is obviously limiting, as the drone can not fly out of WiFi range.

You can load MavLink GPS waypoints onto the drone, though again, when it flys out of WiFi range you'll be unable to communicate with it.

In this tutorial we'll connect a WiFi/LTE hotspot onto the drone itself, so that it can never go out of range! Instead of connecting to your phone, the drone connects to the WiFi hostspot which gives it an internet connection. Then, we use PubNub data streams to send messages to the drone.

This way, as long as the WiFi hotspot is within cellular range it'll never loose communication abilities. In addition, the drone can be controlled over the internet.

# How to

but we'll be modifying the linux configuration to use a wireless hotspot instead. 

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