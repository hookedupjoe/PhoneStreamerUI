(function (ActionAppCore, $) {

  /**
   * Code starting here is simple plumbing code used by the hosting environment
   * 
   * If you are reading this for the Websock / WebRTC details, 
   *  you can clip from here until the next like message.
   * 
   * Note: All the funky markup is to parse the code for the browser client designer.
   */
    var SiteMod = ActionAppCore.module("site");
  
    //~thisPageSpecs//~
    var thisPageSpecs = {
      "pageName": "Home",
      "pageTitle": "Home",
      "navOptions": {
        "topLink": false,
        "sideLink": false
      }
    }
    //~thisPageSpecs~//~
  
    var pageBaseURL = 'app/pages/' + thisPageSpecs.pageName + '/';
  
    //~layoutOptions//~
    thisPageSpecs.layoutOptions = {
      baseURL: pageBaseURL,
      north: false,
      east: false,
      west: false,
      center: { html: "center" },
      south: false
    }
    //~layoutOptions~//~
  
    //~layoutConfig//~
    thisPageSpecs.layoutConfig = {
      west__size: "500"
      , east__size: "250"
    }
    //~layoutConfig~//~
    //~required//~
    thisPageSpecs.required = {
  
    }
    //~required~//~
  
    var ThisPage = new SiteMod.SitePage(thisPageSpecs);
  
    var actions = ThisPage.pageActions;
  
    ThisPage._onPreInit = function (theApp) {
      //~_onPreInit//~
  
      //~_onPreInit~//~
    }
  
    ThisPage._onInit = function () {
      //~_onInit//~
  
      //~_onInit~//~
    }
  
  
    ThisPage._onFirstActivate = function (theApp) {
      //~_onFirstActivate//~
  
      //~_onFirstActivate~//~
      ThisPage.initOnFirstLoad().then(
        function () {
          //~_onFirstLoad//~
  
  /**
   * This is the code runs when the page (website in this case) first opens
   * 
   * Note: ThisPage is a global object (in this code bubble) with functionality for this "page" in the single page application
   *  
   */
  
          ThisPageNow = ThisPage;
          
          //--- Use default host name, not needed for hosting side, but used as name for profile
          updateHostName('Host');
  
          function setMeetingStatus(theStatus) {
            var tmpIsOpen = (theStatus == 'open');
          }
  
  
  /**
   * This page handles one peer to peer connection, either as the streamer streaming or the host receive the stream
   * 
   * The iceServers are needed to make the network level connections needed to enable the peer to peer connection.
   * Note: You can add turn servers to your implementation of this to handle cases where corporate firewalls block
   *   connections with external networks.   
   * 
   * This tool is primarily designed to send your phone or OBS stream from another device or computer on the same
   *   network, so there is no turn server needed for that use case.
   * 
   * If you want a turn server, you can get a 50 gig free account here, with details on how to setup and use it.
   *   https://www.metered.ca/tools/openrelay/  
   *   (no, I am not affiliated with them, but the link and STUN server got me over the hump)
   *  
   */
          ThisPage.activePeer = new RTCPeerConnection({
            iceServers: [
              {
                urls: "stun:stun.relay.metered.ca:80",
              }
            ],
          });
  
  /**
   * The below code creates an optional data channel which can be used on the console and it spits out the result
   *   on the console of the connected peer - just to show it works.
   */
          ThisPage.activePeer.addEventListener('datachannel', event => {
            ThisPage.activeDataChannel = event.channel;
            setMeetingStatus('open');
            ThisPage.activeDataChannel.onopen = handleSendChannelStatusChange;
            ThisPage.activeDataChannel.onclose = handleSendChannelStatusChange;
            ThisPage.activeDataChannel.onmessage = onChannelMessage
  
          })
  
          ThisPage.activeDataChannel = ThisPage.activePeer.createDataChannel("sendChannel");
          ThisPage.activeDataChannel.onopen = handleSendChannelStatusChange;
          ThisPage.activeDataChannel.onclose = handleSendChannelStatusChange;
          ThisPage.activeDataChannel.onmessage = onChannelMessage
  
  /**
   * The below code connects the remote streamed video to the proper video device
   *   on the console of the connected peer - just to show it works.
   */
            ThisPage.activePeer.ontrack = function ({ streams: [stream] }) {
            const remoteVideo = ThisPage.getAppUse('remote-video');
            if (remoteVideo) {
              remoteVideo.srcObject = stream;
            }
          };
  
          function handleSendChannelStatusChange(event) {
            if (event && event.type) {
              setMeetingStatus(event.type);
            } else {
              console.warn('unknown status change event from data channel', event)
            }
  
          }
  
          function onChannelMessage(event) {
            if (!event && event.data) return;
  
            console.log('We got event data:' + event.data)
  
          }
  
  /**
   * The below code checks to see if the unique ID of the list is passed and saves it
   */
          ThisPage.common.params = new URLSearchParams(document.location.search);
          ThisPage.common.targetHost = ThisPage.common.params.get('host') || '';          
          
          ThisPage.subscribe('NewMediaSources', refreshMediaSourceLists);
  
          ThisPage.localVideo = ThisPage.getAppUse('local-video');
          ThisPage.localVideo.addEventListener("canplay", onLocalVideoPlay);
          ThisPage.localVideo$ = $(ThisPage.localVideo)

          ThisPage.remoteVideo = ThisPage.getAppUse('remote-video');
          ThisPage.remoteVideo.addEventListener("canplay", onRemoteVideoPlay);

          ThisPage.showOnHost = ThisPage.getAppUse('startHost',true);
          ThisPage.showOnStream = ThisPage.getAppUse('startStream',true);
  
          initUI();
  
          initWebsock();
          //~_onFirstLoad~//~
          ThisPage._onActivate();
        }
      );
    }
  
  
    ThisPage._onActivate = function () {
      //~_onActivate//~
  
      //~_onActivate~//~
    }
  
    ThisPage._onResizeLayout = function (thePane, theElement, theState, theOptions, theName) {
      //~_onResizeLayout//~
  
      //~_onResizeLayout~//~
    }
  
    //------- --------  --------  --------  --------  --------  --------  -------- 
    //~YourPageCode//~
  
  /**
   * This is the general page code / functions / variables 
   * 
   * Note: No action should be taken in this area, that happens in the initial setup routine above
   *  
   */
    
    //=== UI CONTROL ==========================================================================
    
    //--- host or stream role in use?
    ThisPage.common.role = '';
  
    //--- a handey place for device media info
    ThisPage.mediaInfo = {};
  

  /**
   * The below code closes any active tracks to make the video in use close and stop showing as
   *   being in use by the browser and makes it available again.
   */
    ThisPage.closeVideo = function () {
      if (ThisPage.localVideo.srcObject) {
        var tmpTracks = ThisPage.localVideo.srcObject.getTracks();
        tmpTracks.forEach(track => track.stop());
      }
      ThisPage.common.activeDeviceId = '';
      gotoStage('streamstart');
      refreshUI()
    }
  
  
  
  /**
   * The below code get kicked off when the local video starts by the sreamer
   *   it changes the UI to show the video and provides option to stream it
   */
    function onLocalVideoPlay() {
      //--- We are streaming
      
      if( ThisPage.localVideo && ThisPage.localVideo.srcObject ){
        var tmpTracks = ThisPage.localVideo.srcObject.getTracks();
        var tmpW = 640;
        var tmpH = 480;
        for( var iPos in tmpTracks){
          var tmpTrack = tmpTracks[iPos];
          if(tmpTrack.kind == 'video'){
            var tmpCaps = tmpTrack.getCapabilities();
            if( tmpCaps && tmpCaps.width){
              tmpW = tmpCaps.width.max;
              tmpH = tmpCaps.height.max;
            }
          }
        }
        console.log('video track - tmpW,tmpH:',tmpW,tmpH);
        var tmpLV = $(ThisPage.localVideo);
        tmpLV.css('aspect-ratio',''+tmpW + '/' + tmpH + ' auto');
        tmpLV.css('width','100%');
        tmpLV.css('height','auto');
        ThisApp.refreshLayouts();
      }


      ThisPage.showSubPage({
        item: 'live', group: 'streamtabs'
      });
    }

    function onRemoteVideoPlay() {
      console.log('onRemoteVideoPlay')
      //--- We are hosting and have a stream
      ThisPage.showSubPage({
        item: 'live', group: 'hosttabs'
      });
    }
    
  
  
    actions.cancelHosting = cancelHosting;
    function cancelHosting() {
      gotoStage('start');
      setRole('');
    }
    actions.startHosting = startHosting;
    function startHosting() {
      console.log('startHosting');
      setRole('host');
      updateHostName('Host');
    }
  
   /**
   * The below code handles getting the name of the host or streaming device and sending it
   *   to the Winsocket server to let it know you exist
   */
  
    actions.setHostName = setHostName;
    function setHostName() {
      setRole('host');
      ThisApp.input('Enter your host name as it will be seen in the list (unique)', 'Host Display Name', 'Set Host Name', ThisPage.common.hostDispName || '').then(updateHostName);
    }
  
    actions.setDeviceName = setDeviceName;
    function setDeviceName() {
      setRole('stream');
      ThisApp.input('Enter your devices stream name as it will be seen in the list (unique)', 'Stream Display Name', 'Set Stream Name', ThisPage.common.streamDispName || '').then(updateDeviceName);
    }
  
    function updateHostName(theName) {
      if (!theName) {
        //--- there is no clearing allowed and a value is required, they hit escape when prompted
        return;
      }
      sessionStorage.setItem('hostdispname', theName);
      //ThisPage.common.displayName = theName;
      ThisPage.common.hostDispName = theName;
      ThisPage.connections.profile.name = theName;
      sendProfile();
      refreshUI();
    }
  
    function updateDeviceName(theName) {
      if (!theName) {
        return;
      }
      //ThisPage.common.displayName = theName;
      sessionStorage.setItem('devicedispname', theName);
      ThisPage.common.streamDispName = theName;
      ThisPage.connections.profile.name = theName;
  
      sendProfile();
      refreshUI();
    }
  
  
   /**
   * The below code is just UI stuff ... nothing to see here ...
   * Feel free to ignore from here to where you see more comments start again ...
   */
    function gotoStage(theStage) {
      var tmpStage = theStage || 'start';
      ThisPage.showSubPage({
        item: theStage, group: 'maintabs'
      });
    }
  
    function setRole(theRole) {
      ThisPage.common.role = theRole;
      ThisPage.connections.profile.role = theRole;
      sessionStorage.setItem('lastrole', theRole);
    }
  
    actions.restart = restart;
    function restart() {
      gotoStage('start');
      setRole('');
      refreshUI();
    }
  
    actions.streamPreviewCancel = streamPreviewCancel;
    function streamPreviewCancel() {
      gotoStage('streamstart');
      refreshUI();
    }
  
    actions.openStreamUI = openStreamUI;
    function openStreamUI() {
      setRole('stream');
      gotoStage('streamstart');
      refreshUI();
    }
  
    actions.openHostUI = openHostUI;
    function openHostUI() {
      setRole('host');
      gotoStage('hoststart');
      startHosting();
    }
  
    function initUI() {
      //--- Handle browser refresh
      var tmpHostname = sessionStorage.getItem('hostdispname') || '';
      var tmpDevicename = sessionStorage.getItem('devicedispname') || '';
      var tmpLastRole = sessionStorage.getItem('lastrole') || ThisPage.common.role;

      var tmpTargetHost = ThisPage.common.targetHost || '';


  
      if (tmpDevicename) {
        //ThisPage.loadSpot('streamname', tmpDevicename);
        updateDeviceName(tmpDevicename);
      } else if (tmpHostname) {
        //ThisPage.loadSpot('hostname', tmpHostname);
        updateHostName(tmpHostname);
      }
  
      if ((tmpLastRole)) {
        ThisPage.common.role = tmpLastRole;

        if (tmpLastRole == 'host' && (tmpHostname)) {
          //ThisPage.common.displayName = tmpHostname;
          gotoStage('hoststart');
        } else if (tmpLastRole == 'stream' && (tmpDevicename)) {
          //ThisPage.common.displayName = tmpDevicename;
          gotoStage('streamstart');
        }
  
      }
  
      
      if( tmpTargetHost ){
        //--- Looking for a target host, show button for streaming device
        ThisPage.showOnStream.removeClass('hidden');
        ThisPage.showOnHost.addClass('hidden');
        openStreamUI();
      } else {
        //--- Hosting, show get started button
        ThisPage.showOnStream.addClass('hidden');
        ThisPage.showOnHost.removeClass('hidden');

      }
     
      

      refreshUI();
    }
  
    function refreshUI() {
      var tmpIsActive = (ThisPage.common.role || '');
      var tmpIsHosting = ThisPage.common.role == 'host';
  
      var tmpHostStatus = '<div class="ui message compact">Looking for host ...</div>';
      if (ThisPage.common.targetHostFound) {
        tmpHostStatus = '<div class="ui message compact green pad8">Host Ready</div>';
      }
  
      ThisPage.loadSpot('host-status', tmpHostStatus);
  
      var tmpName = '';
  
      if (!tmpIsActive) {
        gotoStage('start');
      }
  
      if (tmpIsHosting) {
        tmpName = ThisPage.common.hostDispName || '';
        if (tmpIsActive) {
          //ThisPage.loadSpot('hostname', tmpName);
          if (tmpName) {
            if (ThisPage.connections.hostingActive) {
              ThisPage.showSubPage({
                item: 'hosting', group: 'hosttabs'
              });
            } else {
              ThisPage.showSubPage({
                item: 'ready', group: 'hosttabs'
              });
            }
          } else {
            ThisPage.showSubPage({
              item: 'start', group: 'hosttabs'
            });
          }
        } else {
          ThisPage.showSubPage({
            item: 'start', group: 'hosttabs'
          });
        }
      } else {
        tmpName = ThisPage.common.streamDispName || '';
        ThisPage.loadSpot('streamname', tmpName);
        if (tmpIsActive) {
          if (!(tmpName)) {
            ThisPage.showSubPage({
              item: 'start', group: 'hosttabs'
            });
          } else {
            if (ThisPage.common.deviceId) {
              ThisPage.showSubPage({
                item: 'ready', group: 'streamtabs'
              });
            } else {
              ThisPage.showSubPage({
                item: 'select', group: 'streamtabs'
              });
  
              if (!(ThisPage.common.initialPrompt)) {
                ThisPage.common.initialPrompt = true;
                promptForCamera();
                refreshMediaSourcesFromSystem();
              }
            }
          }
  
        } else {
          ThisPage.showSubPage({
            item: 'start', group: 'streamtabs'
          });
        }
      }
  
    }
  
  
  
  
   /**
   * OK - back again to interesting stuff ...
   */
  
    //=== MEDIA ==========================================================================
  
   /**
   * This code is used to prompt the user to give permission to use video or audio devices. 
   */
  
    function promptForCamera() {
      navigator.mediaDevices.getUserMedia({
        video: true, audio: true
      }).then(function (stream) {
        refreshUI();
      }, connectError);
    }
  
    function promptForMic() {
      navigator.mediaDevices.getUserMedia({
        video: false, audio: true
      }).then(function (stream) {
        refreshUI();
      }, connectError);
    }
  
  
    function connectError(theError) {
      if (theError && theError.message) {
        alert(theError.message, "Can not connect", "e")
      } else {
        console.error("Can't connect", arguments);
        alert('Device is most likely in use', "Can not connect", "e")
      }
    }
  
  /**
   * This code is used when an audio device is selected, there for future use.
   */
  
    actions.selectAudioSource = selectAudioSource;
    function selectAudioSource(theParams, theTarget) {
      var tmpParams = ThisApp.getActionParams(theParams, theTarget, ['deviceId', 'label']);
      ThisApp.currentAudioDeviceID = tmpParams.deviceId;
  
      var tmpConstraints = {
        video: false,
        audio: true,
        deviceId: {
          exact: [ThisApp.currentAudioDeviceID]
        }
      };
  
      navigator.mediaDevices.getUserMedia(tmpConstraints).then(
        function (stream) {
          const localSource = ThisPage.getAppUse('local-audio');
          if (localSource) {
            localSource.srcObject = stream;
          }
          stream.getTracks().forEach(function(track){
            ThisPage.activePeer.addTrack(track, stream)
          });
        },
        connectError);
    }
  
  /**
   * This code is used when a camera is selected
   * 
   * When selected, this uses the deviceId of the selected device to request 
   * specifically one video device (not the default) from the browser along
   * with the default audio for this device.
   * 
   * When the stream for the target device is returned, it does two things ...
   * 
   * 1) Connects to the local video source to see what is being streamed
   * 2) Connects the stream of the selected device to the peer, which in turn
   *      calls the onTrack of the remote peer, making your video show up on
   *      the hosting browser like magic.  I guess that is why they call it
   *      a STUN server, because you are stunned to see it work :) I was.
   */
  actions.selectVideoSource = selectVideoSource;
    function selectVideoSource(theParams, theTarget) {
      var tmpParams = ThisApp.getActionParams(theParams,theTarget,['deviceId','label']);
  
      ThisApp.currentVideoDeviceID = tmpParams.deviceId;
  
      var tmpConstraints = {
        video: {
          deviceId: {
            exact: [ThisApp.currentVideoDeviceID]
          }
        },
        audio: true
      };
  
      navigator.mediaDevices.getUserMedia(tmpConstraints).then(function (stream) {
        const localVideo = ThisPage.getAppUse('local-video');
        if (localVideo) {
          localVideo.srcObject = stream;
        }
        stream.getTracks().forEach(function(track){
          ThisPage.activePeer.addTrack(track, stream)
        });
      },
        connectError);
    }
  
  
  
  /**
   * This code is used to refresh and display audio / visual, subject to cleanup
   */  
    function refreshMediaSourcesFromSystem() {
      var self = ThisPage;
      navigator.mediaDevices.enumerateDevices().then(function (theDevices) {
        ThisPage.mediaInfo.devices = theDevices;
        ThisPage.publish('NewMediaSources')
      });
    }
  
    actions.refreshVideoSources = refreshVideoSources;
    function refreshVideoSources() {
      ThisPage.sourceSelection = 'video';
      promptForCamera();
      refreshMediaSourcesFromSystem()
    }
  
    actions.refreshAudioSources = refreshAudioSources;
    function refreshAudioSources() {
      ThisPage.sourceSelection = 'audio';
      promptForMic();
      refreshMediaSourcesFromSystem()
    }
  
    function refreshMediaSourceLists() {
      if (ThisPage.sourceSelection == 'audio') {
        refreshAudioMediaSources();
        ThisPage.loadSpot('video-sources', '');
      } else {
        refreshVideoMediaSources();
        ThisPage.loadSpot('audio-sources', '');
      }
  
    }
  
    function refreshAudioMediaSources() {
  
      var tmpDevices = ThisPage.mediaInfo.devices;
  
      var tmpHTML = ['<div class="ui vertical menu fluid">'];
  
      var tmpFoundOne = false;
  
      const tmpAudioDevices = tmpDevices.filter(device => device.kind == 'audioinput');
  
      tmpAudioDevices.map(theDevice => {
        var tmpLabel = theDevice.label || "(unknown)";
        if (!tmpFoundOne && theDevice.label) {
          tmpFoundOne = true;
        }
  
        //--- Add list item with pageaction to tell audio motion to use the selected the deviceId
        var tmpDeviceId = theDevice.deviceId;
        tmpHTML.push(`<div class="item active" pageaction="selectAudioSource" deviceId="${theDevice.deviceId}" label="${tmpLabel}">
        <div class="content">
        <div class="header" style="line-height: 25px;">
        <i class="icon microphone blue"></i> ${tmpLabel}
        </div>
        </div>
        </div>`);
      });
      tmpHTML.push('</div>');
  
  
      if (tmpFoundOne) {
        ThisPage.loadSpot('audio-sources', tmpHTML.join('\n'));
      } else {
        ThisPage.loadSpot('audio-sources', '<div class="mar5"></div><div class="ui message orange mar5">Once you have given permission, press the <b>Show Microphones</b> button again.</div>');
        ThisPage.promptForMic();
      }
  
    }
  
  
  
    function refreshVideoMediaSources() {
  
  
      var tmpDevices = ThisPage.mediaInfo.devices;
  
      var tmpHTML = ['<div class="ui vertical menu fluid"><div class="ui header blue medium">Select a camera to stream</div>'];
  
      var tmpFoundOne = false;
  
      const tmpAudioDevices = tmpDevices.filter(device => device.kind == 'videoinput');
  
  
      tmpAudioDevices.map(theDevice => {
        var tmpLabel = theDevice.label || "(unknown)";
        if (!tmpFoundOne && theDevice.label) {
          tmpFoundOne = true;
        }
  
        //--- Add list item with pageaction to tell audio motion to use the selected the deviceId
        var tmpDeviceId = theDevice.deviceId;
        tmpHTML.push(`<div class="item active" pageaction="selectVideoSource" deviceId="${theDevice.deviceId}" label="${tmpLabel}">
        <div class="content">
        <div class="header" style="line-height: 25px;">
        <i class="icon video blue"></i> ${tmpLabel}
        </div>
        </div>
        </div>`);
      });
      tmpHTML.push('</div>');
  
      if (tmpFoundOne) {
        ThisPage.loadSpot('video-sources', tmpHTML.join('\n'));
  
  
  
      } else {
        ThisPage.loadSpot('video-sources', '<div class="mar5"></div><div class="ui message orange mar5">Once you have given permission, press the <b>Refresh Available Cameras</b> button again.</div>');
        if (!(ThisPage.common.videoRetry)) {
          ThisPage.common.videoRetry = true;
          ThisApp.delay(5000).then(refreshVideoSources);
        }
      }
  
    }
  
  
  
  
    //=== WEBSOCKET and WEBRTC ==========================================================================
  /**
   * The below code does the work of connecting up with the websocket endpoint and making the peer to peer
   *    connections.
   */
  
  
  /**
   * A place on the page to store connection related stuff related to 
   *    winsock and peer to peer connections.
   */
  
    ThisPage.connections = {
      name: "PhoneStreamer",
      userid: sessionStorage.getItem('userid') || '',
      profile: {
        name: sessionStorage.getItem('displayname') || ''
      }
    }
    
   /**
   * Create a new standard WebSocket using the endpoint we magically attain
   *    then when we get a message, process it as JSON and send it along
   */
  
    function initWebsock() {
      var tmpURL = ActionAppCore.util.getWebsocketURL('actions', 'ws-main');
      ThisPage.wsclient = new WebSocket(tmpURL);
      ThisPage.wsclient.onmessage = function (event) {
        var tmpData = '';
        if (typeof (event.data == 'string')) {
          tmpData = event.data.trim();
          try {
            if (tmpData.startsWith('{')) {
              tmpData = JSON.parse(tmpData);
              processMessage(tmpData);
            }
          } catch (error) {
            console.error("unknown winsock message:",error)
          }
        }
      }
    }
  
   /**
   * Process the winsock message and route to the proper function
   */
  
    function processMessage(theMsg) {
      if (typeof (theMsg) == 'string' && theMsg.startsWith('{')) {
        theMsg = JSON.parse(theMsg);
      }

      if (typeof (theMsg) != 'object') {
        return;
      }
  
      var tmpAction = theMsg.action || theMsg.people;
      if (!(tmpAction)) {
        console.warn('no action to take', theMsg);
        return;
      }
  
      if (tmpAction == 'welcome' && theMsg.id) {
        ThisPage.connections.stageid = theMsg.id;
        if (!(ThisPage.connections.userid)) {
          ThisPage.connections.userid = theMsg.userid;
          sessionStorage.setItem('userid', ThisPage.connections.userid)
        } else {
          //--- We already have a profile, send userid we have
          if (ThisPage.connections.profile.name && ThisPage.connections.userid) {
            sendProfile();
          }
        }
  
      } else if (tmpAction == 'meetingrequest') {
        onMeetingRequst(theMsg);
      } else if (tmpAction == 'people') {
        onPeopleList(theMsg);
      } else if (tmpAction == 'meetingresponse') {
        onMeetingResponse(theMsg);
      } else {
        console.error('unknown message', theMsg);
      }
      if (theMsg.people) {
        refreshPeople(theMsg.people);
      }
  
    }
  
  
   /**
   * Kicked off when we get new people from the winsock server
   */
    function onPeopleList(theMsg) {
      if (theMsg && theMsg.people) {
        refreshPeople(theMsg.people);
      }
    }
  
  /**
   * Create the URL
   */
    function updateQRCode() {
      ThisPage.loadSpot('qr-code-host', '');
      var tmpEl = ThisPageNow.getSpot('qr-code-host').get(0);
      var tmpURL = location.href + '?host=' + ThisPage.connections.userid;
      new QRCode(tmpEl, tmpURL);
      ThisPage.addToSpot('qr-code-host', '<br /><a target="_blank" href="' + tmpURL + '">' + tmpURL + '</a>');
      ThisPage.addToSpot('qr-code-host', '<br /><input style="width:90%;" readonly="true" value="' + tmpURL + '" />');
    }
  

  /**
   * When we get the list of people from server, check to see if we are on the list and/or the desired host is on the list
   */
    actions.refreshPeople = refreshPeople;
    function refreshPeople(thePeople) {
      
      ThisPage.connections.people = thePeople;
  
      ThisPage.common.targetHostFound = (ThisPage.common.targetHost && ThisPage.connections.people[ThisPage.common.targetHost]);
  
      if (ThisPage.connections.people && ThisPage.connections.people[ThisPage.connections.userid]) {
        ThisPage.connections.hostingActive = true;
        ThisPage.showSubPage({
          item: 'hosting', group: 'hosttabs'
        });
        updateQRCode();
      } else {
        ThisPage.connections.hostingActive = false;
        ThisPage.showSubPage({
          item: 'ready', group: 'hosttabs'
        });
  
      }
  
      refreshUI();
    }
  
  
   /**
   * The Winsock server just told us there is a meeting request.  Prompt to connect then
   *    do the WebRTC process to create a response accordingly.
   * 
   * This is where the process of creating an answer to an offer is done
   */
    function onMeetingRequst(theMsg) {
  
      var tmpTitle = 'Steam Request from ' + theMsg.fromname
      var tmpMsg = 'Do you want to accept a stream from ' + theMsg.fromname + '?'
      var self = ThisPage;
  
      var tmpConfirm = true;
  
      if (!ThisPage.inMeetingRequest) {
        ThisPage.inMeetingRequest = true;
        tmpConfirm = ThisApp.confirm(tmpMsg, tmpTitle);
      }
      $.when(tmpConfirm).then(theReply => {
        var tmpReplyMsg = {
          from: theMsg.fromid,
          reply: theReply
        }
        if (theReply) {
          ThisPage.activePeer.setRemoteDescription(new RTCSessionDescription(theMsg.offer)).then(
            function () {
  
              ThisPage.activePeer.createAnswer().then(theAnswer => {
                self.activeAnswer = theAnswer;
  
                ThisPage.activePeer.setLocalDescription(new RTCSessionDescription(theAnswer)).then(
                  function () {
  
                    ThisPage.wsclient.send(JSON.stringify({
                      action: 'meetingresponse', answer: self.activeAnswer, message: tmpReplyMsg
                    }))
  
                  }
                )
              });
            }
          );
  
        } else {
          ThisPage.wsclient.send(JSON.stringify({
            action: 'meetingresponse', message: tmpReplyMsg
          }))
        }
  
  
      })
  
    }
  
   /**
   * The Winsock server just told us there is a reply to a meeting request.  
   * 
   * This is where the process of doing a reply meeting request back if needed is done
   */
    function onMeetingResponse(theMsg) {
      var self = ThisPage;
  
  
      if (theMsg && theMsg.message && theMsg.message.reply === true) {
  
  
        var tmpAnswer = theMsg.answer;
        ThisPage.activePeer.setRemoteDescription(
          new RTCSessionDescription(tmpAnswer)
        ).then(function () {
          //ToDo: Set this?
  
          if (!ThisPage.isAlreadyCalling) {
            //--- Socket ID check?
  
            actions.requestMeeting({
              userid: theMsg.fromid
            })
            ThisPage.isAlreadyCalling = true;
  
          } else {
            ThisPage.inMeetingRequest = false;
          }
        });
      } else {
        alert('' + theMsg.fromname + ' did not accept the requst', 'Request Not Accepted', 'e')
      }
  
  
    }
  
  
  /**
   * Tell the Winsock server we exist
   * 
   * If we have a saved initial userid and optional name saved, send that information
   */
    actions.sendProfile = sendProfile;
    function sendProfile() {
      if (!ThisPage.wsclient) return;
  
      ThisPage.wsclient.send(JSON.stringify({
        action: 'profile', profile: ThisPage.connections.profile, userid: ThisPage.connections.userid, id: ThisPage.connections.stageid
      }))
    }
  
   /**
   * Tell the Winsock server we are the streamer and we want to stream to the host by requesting a "meeting"
   * 
   * If the host is not longer availble - say so
   */
    actions.startStreaming = startStreaming;
    function startStreaming() {
      if (ThisPage.common.targetHost && ThisPage.common.targetHostFound) {
        requestMeeting({
          userid: ThisPage.common.targetHost
        })
      } else {
        alert('Host was not found, refresh on the host side and try again', "Host Not Found")
      }
  
    }
  
   /**
   * Tell the Winsock server we want to request a meeting (either initially or as a reply connection)
   * 
   * If the peer offer is created and send to the websocket server for action
   */
    actions.requestMeeting = requestMeeting;
    function requestMeeting(theParams, theTarget) {
      //ThisPage.isAlreadyCalling = true;
      
      var tmpParams = ThisApp.getActionParams(theParams, theTarget, ['userid']);
      if (!(tmpParams.userid)) {
        alert('No person selected', 'Select a person', 'e');
        return;
      }
  
  
      //--- Quick test for one peer to peer
      var self = ThisPage;
  
      ThisPage.activePeer.createOffer().then(theOffer => {
        self.activeOffer = theOffer;
        ThisPage.activePeer.setLocalDescription(new RTCSessionDescription(self.activeOffer)).then(
          function () {
            ThisPage.wsclient.send(JSON.stringify({
              offer: self.activeOffer,
              action: 'meeting', to: tmpParams.userid
            }))
          });
      });
  
  
  
  
    }
    //~YourPageCode~//~
  
  })(ActionAppCore, $);
  
  