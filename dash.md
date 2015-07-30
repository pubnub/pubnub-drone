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

## Overview

* show publish code from drone side
* add full page map background
* show chart subscribe code on dashboard side
* put dashboard into bootstrap layout
* show other publishes, other charts
* show bootstrap dropdowns and explain flow
* show status updaing
