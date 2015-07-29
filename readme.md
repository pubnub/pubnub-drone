# Control Your Drone with PubNub

Ever wonder how a taco copter would actually work? How would it fly autonomously? Who would give it commands? 

Well if you really are curious, build your own! In this tutorial we'll hack a drone, give it internet access, and then control it remotely from any computer in the world. The secret sauce is PubNub, a realtime data stream network that allows for super fast bi-directional communication between devices.

Controlling the drone over the internet offers several advantages. First, the drone is no longer limited by WiFi range! Normally this kind of drone needs a WiFi connection or even a radio signal to function, but if we attach a hotspot on top of it, it can fly anywhere there's cell service. Take that FAA!

Next, it allows us to get instant feedback from the drone on a dashboard. We can log anything we want, from the acceleration to the process memory usage. Is the drone flying? Is it on the way to it's delivery? Has it delivered the package? Did it hit a tree? Answer all these questions and more!

And finally (and most scary) is the ability to control swarms of drones! As PubNub supports many to many communication, we can issue one command to many drones at the same time. Take over the world!

![](http://www.takepart.com/sites/default/files/styles/landscape_main_image/public/tacocopter.jpg)

# Overview

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

When you find a device that look like your drone, try to telnet into it. If it lets you in and shows your the busybox prompt, you're in! Otherwise, reset your drone and try again.

## Installing NodeJS on the Parrot AR 2.0

Now it's time to install NodeJS on your drone. This is a little different than installing NodeJS on a regular machine. But what did you expect? This is a freakin flying linux box.

There is a special NodeJS binary within this repository under ```/drone/bin/node```. It's special because it's been compiled especially for the drone's hardware specs. This binary is version 0.8.

Also included within this repo is a directory called ```node_modules``` which you may be familiar with. This folder includes all the dependencies required to run drone.js, the process that will allow us to interact with the drone over the internet.

There's one edit we need to make to ```drone.js```, and that's adding our own drone's IP address to the script.

Around line 20 you'll see the following code:

```js
var client  = arDrone.createClient({
  ip: '192.168.1.87'
});
```

Replace ```192.168.1.87``` with the IP address from the previous step.

Now, Using your favorite FTP client (I like [FileZilla](https://filezilla-project.org/)), create an FTP connection to your drone.

Once you've FTP'd in, navigate to the ```/data/video``` directory. Then, copy the contents of ```/drone``` into this directory.

Then, in your telnet session, run the following commands:

```
cd /data/video
./bin/node -v
```

You should see an output like:

```
v0.8.x
```

Congrats! NodeJS is running on your drone.

## Controlling your drone over the internet

Let's run the NodeJS script. In your telnet session, run the following command:

```js
./bin/node --expose_gc drone.js
```

You should see the text:

```
Garbage collection enabled
[...]
[...]
```

The ```--expose_gc``` enables garbage collection within the NodeJs process. This is essential because with NodeJS running, the AR Drone only has about 3% memory left!

Now, on your computer, load ```index.html``` from inside the dashboard.

You should see some basic output in the graphs like the battery level and free memory percentage.

![](http://i.imgur.com/GvElVyR.gif)
http://i.imgur.com/GvElVyR.gif

## Controlling the Drone via the EON Interface

The interface is built off of EON, PubNub's open source realtie charting library. This is how we're publishing the information from the drone, over the internet, and into our graph.

You may still be on the same network as your drone, but since we're using PubNub, you don't nessesarily need to be. Your drone can be controlled from anywher in the world. Even better, if you attach a hotspot on top of the drone, you'll be able to control it as long as it has cell service!

You can use the dropdown on the right side to select commands to build a mission for the drone. All the commands are relatie of the drone's camera; so foward means it will go in the direction of the camera. The "tricks" dropdown is where most of the fun is :)

When your mission is ready to go, click "send commands" and the command will be sent to the drone. If the drone recieves the commands, they will appear on the queue below. When the command is in progress, it will turn blue. When the command is complete, it will turn green. 

![](http://i.imgur.com/BqXdvzX.gif)
http://i.imgur.com/BqXdvzX.gif

Enjoy playing around with your drone! This project was inspired by [TooTallNate's Socket.io Drone Proxy](https://github.com/TooTallNate/ar-drone-socket.io-proxy) and uses [ardrone-autonomy](https://github.com/eschnou/ardrone-autonomy) to create missions.
