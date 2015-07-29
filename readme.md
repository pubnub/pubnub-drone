# Control Your Drone with PubNub

# Overview

The purpose of this demo is to simulate the sitatuon in which a customer orders a product from an online retailer, and a drone is dispatched autonomously. 

![](http://www.takepart.com/sites/default/files/styles/landscape_main_image/public/tacocopter.jpg)

# Background

We'll be using the Parrot AR 2.0 drone. Normally the Parrot AR 2.0 is controlled over a WiFi connection from your phone. This is obviously limiting, as the drone can not fly out of WiFi range.

![](http://ecx.images-amazon.com/images/I/81RNYV29HCL._SL1500_.jpg)

You can load MavLink GPS waypoints onto the drone, though again, when it flys out of WiFi range you'll be unable to communicate with it. You'll need to wait until it returns to get data off the drone.

In this tutorial we'll connect a WiFi/LTE hotspot onto the drone itself, so that it can never go out of range! Instead of connecting to your phone, the drone connects to the WiFi hotspot which gives it an internet connection. Then, we use PubNub data streams to send messages to the drone.

This way, as long as the WiFi hotspot is within cellular range it'll never loose communication abilities. In addition, the drone can be controlled over the internet.

# How to

We'll be modifying the Linux configuration to connect to a WiFi hotspot instead of acting as one. We'll also install NodeJS on the drone, giving us the ability to connect to PubNub and fly autonomously.

Your drone needs to be connected to a hotspot rather than your computer. To do this, you need to Telnet into it and reconfigure the WiFi.

## Telnetting into the drone

Find the drone WiFi network using your computer. It should begin with the word "ardrone". Connect to this network.

Then, open up a terminal window and type the following:

```
telnet 192.168.1.1
```

This command opens a telnet session with your drone. If you see a prompt from "busybox", you're in! Now to start talking to the drone.

## Reconfigure the WiFi

Now we're going to tell the drone to connect to a hotspot network. To do this, you'll need to have a public hotspot network available. This could be a standalone WiFi hotspot, or one provided by your phone. 

It's very important that this Wifi network "open." It should not have a password and should not use any encryption methods like WPA2 or otherwise.

To have the drone connect to the hotspot, run this command in your telnet session:

```
killall udhcpd; iwconfig ath0 mode managed essid drone; /sbin/udhcpc -i ath0; sleep 5; route add default gw 192.168.1.1;
```

This will kill all the WiFi processes and reconfigure the WiFi drivers to connect to our "drone" hotspot rather than acting as an access point. It also adds your router as the default gateway (192.168.1.1). You may need to change this IP, but it's unlikely.

There's more on connecting to a hotspot [here](http://www.nodecopter.com/hack#connect-to-access-point). Also check out [this gist](https://gist.github.com/karlwestin/4051467) and [this issue](https://github.com/daraosn/ardrone-wpa2/issues/1).

## Finding your drone again

Ok, now that you told your done to connect to a new hotspot, your telnet session will become unresponsive. It makes sense, your drone just connected to another network which you're not currently on.

So connect to the network you told the drone to connect to. In my case, this network is called "drone."

![](http://i.imgur.com/anfk2sZ.png)

Now that we're on the same network as the drone, it's time to telnet back into it. There's one problem though, and that's that the drone has been automatically assigned an IP address. We now need to find out what that IP is.

To do this, I use a tool called [Angry IP Scanner](http://angryip.org/). This tool will scan a range of ports on your router and try to identify every device.

Run a full scan (it should only take a few seconds) and look for your drone. It's important to note here that if you can't find your drone, something probably went wrong when you ran the reconfig. 

If at any time you want to reset your drone's behaviour, you can disconnect it's power source and reconnect it. This will reset the drone's config and you'll see it appear as a hotspot again. If things go terribly wrong, you can hard reset the drone using the reset button found underneath the battery compartment.

![](http://i.imgur.com/q71H0eA.png)

When you find a device that look like your drone, try to telnet into it. If it lets you in and shows your the busybox prompt, you're in!

## Installing NodeJS on the Parrot AR 2.0

Configure ```drone.js``` to use the IP address you defined in:

```js
node drone.js
```

Then you can use the PubNub Console to send commands like "takeoff", "left", "rotate". Kill the ```drone.js``` process locally to land the drone.

## Future Plans	

Eventually we'll do this:

https://github.com/TooTallNate/ar-drone-socket.io-proxy
