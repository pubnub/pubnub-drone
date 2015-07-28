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

![](http://www.takepart.com/sites/default/files/styles/landscape_main_image/public/tacocopter.jpg)

# Background

We'll be using the Parrot AR 2.0 drone. Normally the Parrot AR 2.0 is controlled over a WiFi connection from your phone. This is obviously limiting, as the drone can not fly out of WiFi range.

You can load MavLink GPS waypoints onto the drone, though again, when it flys out of WiFi range you'll be unable to communicate with it. You'll need to wait until it returns to get data off the drone.

In this tutorial we'll connect a WiFi/LTE hotspot onto the drone itself, so that it can never go out of range! Instead of connecting to your phone, the drone connects to the WiFi hostspot which gives it an internet connection. Then, we use PubNub data streams to send messages to the drone.

This way, as long as the WiFi hotspot is within cellular range it'll never loose communication abilities. In addition, the drone can be controlled over the internet.

# How to

We'll be modifying the linux configuration to connect to a WiFi hotspot instead of acting as one. We'll also install NodeJS on the drone, giving us the ability to connect to PubNub and fly autonomously.

Your drone needs to be connected to a hotspot rather than your computer. To do this, you need to Telnet into it and reconfigure the wifi.

## Telnetting into the drone

Find the drone WiFi network using your computer. It should begin with the word "ardrone". Connect to this network.

Then, open up a terminal window and type the following:

```
telnet 192.168.1.1
```

This command opens a telnet session with your drone. If you see a prompt from "busybox", you're in! Now to start talking to the drone.

## Reconfigure the wifi

Now we're going to tell the drone to connect to a hotspot network. To do this, you'll need to have a public hotspot network available. This could be a standalone WiFi hotspot, or one provided by your phone. 

It's very important that this Wifi network "open." It should not have a password and should not use any encryption methods like WPA2 or otherwise.

https://github.com/daraosn/ardrone-wpa2/issues/1

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

