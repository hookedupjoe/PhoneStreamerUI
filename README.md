# PhoneStreamer - UI Side
* Author - W Joseph Francis
* (c) hookedup, inc. 2023
* Project License: MIT
* Designed to be used in the Mongino environment.
* [mongino repo](https://github.com/hookedupjoe/mongino)

## A super simple app to stream your phone, another computer or streamer to a browser.

This is a generic example of using browser media devices, winsockets and WebRTC to create a peer to peer connection to stream video and data.

* mediaDevices is used to read and feed the video and audio
* Websockets used to setup up the WebRTC connections only
* WebRTC used to create the peer to peer connection to stream video and/or audio

### Quick Links To The Code
* [HTML Page with the UI](https://github.com/hookedupjoe/PhoneStreamerUI/blob/main/app/pages/Home/html/center.html)
* [Code that has the logic](https://github.com/hookedupjoe/PhoneStreamerUI/blob/main/app/pages/Home/index.js)

### Notes
Note: This does not use a TURN server as this is to stream from a phone to a computer on the same network.  That said, the 80% of the users, this should also allow streaming over the internet unless the firewalls are limited.  In that case this example wouldn't work, but it is a few additional configuration items in the JSON and a service away from working that way if so desire.  I just can't pay for someone to use this system TURNed on, hence it only supporting the 80% or so it works with, without needing that implemented. 

This is the UI side of the project.  The server side is in another repo and both should be used with Mongino.

* [Server Side Repo](https://github.com/hookedupjoe/PhoneStreamerServer)
* [mongino repo](https://github.com/hookedupjoe/mongino)

### Usage
This is designed to be used with the Mongino server development, hosting and deployment environment.  

In order for browser video to work, this MUST be over a SSL enabled connection.  To run on a local network only, create a self signed certificate.  To host, deploy Mongino to a hosting provider and add SSL using Lets Encrypt or your SSL provider.

* Download and install mongino, run it.  You do not need Mongo DB and Security setup to run local demos (browser to browser on same machine) but to deploy to a AWS server, installing Mongo DB and security is easy and advised.
* Clone the repos into the ~mongino/ui-apps/PhoneStreamer and ~mongino/ui-servers/PhoneStreamer (create directory and clone to .)
* No need to do any npm install, mongino is the server environment used.
* This can easily run on a low cost Ubuntu server at a hosting provider.  I use AWS and it costs about 10 bucks a month at most for a test server running all the time with dedicated IP. 