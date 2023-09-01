(function (ActionAppCore, $) {

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
ThisPageNow = ThisPage;



function setMeetingStatus(theStatus){
  var tmpIsOpen = ( theStatus == 'open');
  console.log( 'tmpIsOpen',tmpIsOpen );
  
  // if( tmpIsOpen ){
  //   ThisPage.liveIndicator.removeClass('hidden')
  // } else {
  //   ThisPage.liveIndicator.addClass('hidden')
  // }
  
}


ThisPage.activePeer = new RTCPeerConnection({
  iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      }
  ],
});

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

ThisPage.remoteCanvas = ThisPage.getAppUse('remote-canvas');
ThisPage.ctxRemote = ThisPage.remoteCanvas.getContext("2d",{willReadFrequently: true});

ThisPage.activePeer.ontrack = function({ streams: [stream] }) {
  const remoteVideo = ThisPage.getByAttr$({appuse: 'remote-video'}).get(0);
  if (remoteVideo) {
    console.log('remoteVideo set', stream.getTracks());
    remoteVideo.srcObject = stream;
  }
};

function handleSendChannelStatusChange(event) {
  if( event && event.type ){
    setMeetingStatus(event.type);
  } else {
    console.log('unknown status change event from data channel',event)
  }
  
  // if (sendChannel) {
  //   var state = sendChannel.readyState;
  //   console.log('handleSendChannelStatusChange state',state);
  // }
}

function onChannelMessage(event) {
  if(!event && event.data) return;
  
  console.log(''+event.data)
 
}








ThisPage.common.params = new URLSearchParams(document.location.search);
ThisPage.common.targetHost = ThisPage.common.params.get('host') || '';

console.log( 'Looking for: ',ThisPage.common.targetHost );


ThisPage.subscribe('NewMediaSources', refreshMediaSourceLists);


ThisPage.localVideo = ThisPage.getAppUse('local-video');
ThisPage.localVideo.addEventListener("canplay",onLocalVideoPlay);





// navigator.mediaDevices.ondevicechange = function(){
//   console.log('we got devices');
//   refreshUI();
// };

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
//=== UI CONTROL ==========================================================================
ThisPage.common.role = '';
ThisPage.mediaInfo = {};

ThisPage.closeVideo = function() {
  console.log('closevid', typeof(ThisPage.localVideo.srcObject))
  if (ThisPage.localVideo.srcObject) {
    var tmpTracks = ThisPage.localVideo.srcObject.getTracks();
    tmpTracks.forEach(track => track.stop());
  }
  ThisPage.common.activeDeviceId = '';
  gotoStage('streamstart');
  refreshUI()
}



function onLocalVideoPlay() {
  //--- We are streaming
  console.log('onLocalVideoPlay');
  ThisPage.showSubPage({
    item: 'live', group: 'streamtabs'
  });
}


actions.startHosting = startHosting;
function startHosting() {
  console.log('startHosting');
  sendProfile();
}

actions.setHostName = setHostName;
function setHostName() {
  console.log('setHostName');

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
  ThisPage.stage.profile.name = theName;
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
  ThisPage.stage.profile.name = theName;
  console.log( 'sendProfile device', theName);
  
  sendProfile();
  refreshUI();
}



function gotoStage(theStage) {
  var tmpStage = theStage || 'start';
  ThisPage.showSubPage({
    item: theStage, group: 'maintabs'
  });
}

function setRole(theRole) {
  ThisPage.common.role = theRole;
  ThisPage.stage.profile.role = theRole;
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
  console.log('openStreamUI');
  setRole('stream');
  gotoStage('streamstart');
  refreshUI();
}

actions.openHostUI = openHostUI;
function openHostUI() {
  setRole('host');
  gotoStage('hoststart');
  refreshUI();
}

function initUI() {
  //--- Handle browser refresh
  var tmpHostname = sessionStorage.getItem('hostdispname') || '';
  var tmpDevicename = sessionStorage.getItem('devicedispname') || '';
  var tmpLastRole = sessionStorage.getItem('lastrole') || ThisPage.common.role;

  if (tmpDevicename) {
    //ThisPage.loadSpot('streamname', tmpDevicename);
    updateDeviceName(tmpDevicename);
  }
  if (tmpHostname) {
    //ThisPage.loadSpot('hostname', tmpHostname);
    updateHostName(tmpHostname);
  }
  console.log('tmpHostname', tmpHostname);
  console.log('tmpDevicename', tmpDevicename);
  console.log('tmpLastRole', tmpLastRole);

  if ((tmpLastRole)) {
    ThisPage.common.role = tmpLastRole;
    if (tmpLastRole == 'host' && (tmpHostname)) {
      //ThisPage.common.displayName = tmpHostname;
      gotoStage('hoststart');
    } else if (tmpLastRole == 'stream' && (tmpDevicename)) {
      //ThisPage.common.displayName = tmpDevicename;
      gotoStage('streamstart');
    }
    //    console.log( 'ThisPage.common.displayName', ThisPage.common.displayName);

  }

  refreshUI();
}

function refreshUI() {
  var tmpIsActive = (ThisPage.common.role || '');
  var tmpIsHosting = ThisPage.common.role == 'host';
  
  var tmpHostStatus = '';
  if( ThisPage.common.targetHostFound ){
    console.log('ThisPage.common.targetHostFound',ThisPage.common.targetHostFound);
    tmpHostStatus = `<div class="pad5 mar5" style="border:dashed 1px red;">
          Host Ready
        </div>`
  }

  ThisPage.loadSpot('host-status',tmpHostStatus);

  // console.log('tmpIsHosting', tmpIsHosting);
  // console.log('tmpIsActive', tmpIsActive);
  var tmpName = '';

  if (!tmpIsActive) {
    gotoStage('start');
  }


  if (tmpIsHosting) {
    tmpName = ThisPage.common.hostDispName || '';
    if (tmpIsActive) {
      ThisPage.loadSpot('hostname', tmpName);
      if (tmpName) {
        if (ThisPage.stage.hostingActive) {
          ThisPage.showSubPage({
            item: 'hosting', group: 'hosttabs'
          });

        } else {
          ThisPage.showSubPage({
            item: 'ready', group: 'hosttabs'
          });

        }
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
    } else {
      ThisPage.showSubPage({
        item: 'start', group: 'streamtabs'
      });
    }
  }

}





//=== MEDIA ==========================================================================

ThisPage.getAppUse = function(theUse, theJQueryFlag) {
  var tmpEl = ThisPage.getByAttr$({
    appuse: theUse
  });
  if(!(tmpEl && tmpEl.length > 0)){
    return false;
  }
  if(theJQueryFlag){
    return tmpEl
  }
  return tmpEl.get(0);
}

function promptForCamera() {
  navigator.mediaDevices.getUserMedia({
    video: true, audio: true
  }).then(function(stream) {
    refreshUI();
  }, connectError);
}

function promptForMic() {
  navigator.mediaDevices.getUserMedia({
    video: false, audio: true
  }).then(function(stream) {
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

actions.selectAudioSource = selectAudioSource;
function selectAudioSource(theParams, theTarget) {
  var tmpParams = ThisApp.getActionParams(theParams, theTarget, ['deviceId', 'label']);
  ThisApp.currentAudioDeviceID = tmpParams.deviceId;

  var tmpConstraints = {
    video: false,
    audio: true,
    deviceId: {
      exact: [ThisApp.currentAudioDeviceID]
    }};



  navigator.mediaDevices.getUserMedia(tmpConstraints).then(
    function(stream) {
      const localSource = ThisPage.getAppUse('local-audio');
      if (localSource) {
        localSource.srcObject = stream;
      }
      stream.getTracks().forEach(track => ThisPage.activePeer.addTrack(track, stream));
    },
    connectError);
}

actions.selectVideoSource = selectVideoSource;
function selectVideoSource(theParams, theTarget) {
  var tmpParams = ThisApp.getActionParams(theParams,
    theTarget,
    ['deviceId',
      'label']);


  ThisApp.currentVideoDeviceID = tmpParams.deviceId;

  var tmpConstraints = {
    video: {
      deviceId: {
        exact: [ThisApp.currentVideoDeviceID]
      }
    },
    audio: true
  };



  navigator.mediaDevices.getUserMedia(tmpConstraints).then(function(stream) {

    const localVideo = ThisPage.getAppUse('local-video');
    console.log('got video stream', typeof(stream))

    if (localVideo) {
      localVideo.srcObject = stream;
    }
    //ThisPage.gotoStage('live')
    // var tmpFPS = 30;
    // processor.doLoad(localVideo, {
    //   frameDelayMS: 1000 / tmpFPS
    // });

    //---> DO BELOW to send stream, but no audio
    //ToDo: Send canvas but audio from selected device???

    // var tmpCanvasSteam = processor.c2.captureStream();
    // tmpCanvasSteam.getTracks().forEach(
    //   track => {
    //     ThisPage.activePeer.addTrack(
    //       track,
    //       tmpCanvasSteam
    //     );
    //   }
    // );



    //console.log("Adding tracks to remote peer", stream.getTracks())
    //stream.getTracks().forEach(track => ThisPage.activePeer.addTrack(track, stream));

  },
    connectError);

  //ThisPage.parts.am.setActiveDeviceId(tmpParams.deviceId);
}




function refreshMediaSourcesFromSystem() {
  var self = ThisPage;
  navigator.mediaDevices.enumerateDevices().then(function(theDevices) {
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
  console.log('ThisPage.mediaInfo.devices', ThisPage.mediaInfo.devices);

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



//=== WEBSOCKET ==========================================================================


ThisPage.stage = {
  name: "MeetingCenter",
  userid: sessionStorage.getItem('userid') || '',
  profile: {
    name: sessionStorage.getItem('displayname') || ''
  }
}
ThisApp.stage = ThisPage.stage;


function initWebsock() {
  var tmpURL = ActionAppCore.util.getWebsocketURL('actions', 'ws-main');
  ThisPage.wsclient = new WebSocket(tmpURL);
  ThisPage.wsclient.onmessage = function (event) {
    var tmpData = '';
    if (typeof (event.data == 'string')) {
      tmpData = event.data.trim();
      if (tmpData.startsWith('{')) {
        tmpData = JSON.parse(tmpData);
        processMessage(tmpData);
      }
    }

  }
}


function processMessage(theMsg) {
  if (typeof(theMsg) == 'string' && theMsg.startsWith('{')) {
    theMsg = JSON.parse(theMsg);
  }
  if (typeof(theMsg) != 'object') {
    return;
  }

  var tmpAction = theMsg.action || theMsg.people;
  if (!(tmpAction)) {
    console.warn('no action to take', theMsg);
    return;
  }

  if (tmpAction == 'welcome' && theMsg.id) {
    ThisPage.stage.stageid = theMsg.id;
    if (!(ThisPage.stage.userid)) {
      ThisPage.stage.userid = theMsg.userid;
      sessionStorage.setItem('userid', ThisPage.stage.userid)
    } else {
      //--- We already have a profile, send userid we have
      if (ThisPage.stage.profile.name && ThisPage.stage.userid) {
        sendProfile();
      }
      //ThisPage.wsclient.send({action:'profile',})
    }

  } else if (tmpAction == 'chat') {
    ThisPage.parts.welcome.gotChat(theMsg);
  } else if (tmpAction == 'meetingrequest') {
    onMeetingRequst(theMsg);
  } else if (tmpAction == 'people') {
    onPeopleList(theMsg);
  } else if (tmpAction == 'meetingresponse') {
    onMeetingResponse(theMsg);
  } else {
    console.log('unknown message', theMsg);
  }
  if (theMsg.people) {
    refreshPeople(theMsg.people);
  }

}



function onPeopleList(theMsg) {
  if (theMsg && theMsg.people) {
    refreshPeople(theMsg.people);
  }

}

actions.refreshPeople = refreshPeople;
function refreshPeople(thePeople) {
  ThisPage.stage.people = thePeople;

  ThisPage.common.targetHostFound = (ThisPage.common.targetHost && ThisPage.stage.people[ThisPage.common.targetHost]);

  if (ThisPage.stage.people && ThisPage.stage.people[ThisPage.stage.userid]) {
    console.log('refreshPeople', ThisPage.stage.people, ThisPage.stage.people[ThisPage.stage.userid]);
    ThisPage.stage.hostingActive = true;
    ThisPage.showSubPage({
      item: 'hosting', group: 'hosttabs'
    });
  } else {
    ThisPage.stage.hostingActive = false;
    ThisPage.showSubPage({
      item: 'ready', group: 'hosttabs'
    });

  }

  console.log('ThisPage.stage.people', ThisPage.stage.people);
  refreshUI();
}


function onMeetingRequst(theMsg) {

  var tmpTitle = 'Meeting Request from ' + theMsg.fromname
  var tmpMsg = 'Do you want to join a meeting with ' + theMsg.fromname + '?'
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


function DELETE____onMeetingRequst(theMsg) {
console.log( 'onMeetingRequst', theMsg);

  var tmpTitle = 'Meeting Request from ' + theMsg.fromname
  var tmpMsg = 'Do you want to join a meeting with ' + theMsg.fromname + '?'
  var self = ThisPage;

  theReply = confirm(tmpMsg);


//--- ToDo: Getting prompted twice
//tmpConfirm = ThisApp.confirm(tmpMsg, tmpTitle);
  // if (!ThisPage.inMeetingRequest) {
  //   ThisPage.inMeetingRequest = true;
  //   tmpConfirm = ThisApp.confirm(tmpMsg, tmpTitle);
  // } else {
  //   console.log('in request, no confirm needed')
  // }
  
  
  //$.when(tmpConfirm).then(theReply => {
  //  console.log('confirm:',theReply);
    var tmpReplyMsg = {
      from: theMsg.fromid,
      reply: theReply
    }
    
    
    if (theReply) {
      ThisPage.activePeer.setRemoteDescription(new RTCSessionDescription(theMsg.offer)).then(
        function () {

          ThisPage.activePeer.createAnswer().then(theAnswer => {
            self.activeAnswer = theAnswer;
console.log( 'setLocalDescription theAnswer', theAnswer);

            ThisPage.activePeer.setLocalDescription(new RTCSessionDescription(theAnswer)).then(
              function () {
                console.log('sending meetingresponse post confirm')
                ThisPage.wsclient.send(JSON.stringify({
                  action: 'meetingresponse', answer: self.activeAnswer, message: tmpReplyMsg
                }))
              }
            )
          });
        }
      );
    } else {
      console.log('no response reply')
      ThisPage.wsclient.send(JSON.stringify({
        action: 'meetingresponse', message: tmpReplyMsg
      }))
    }
  //})
}

function ORIGINAL_____________________onMeetingRequst(theMsg) {
console.log( 'onMeetingRequst', theMsg);

  var tmpTitle = 'Meeting Request from ' + theMsg.fromname
  var tmpMsg = 'Do you want to join a meeting with ' + theMsg.fromname + '?'
  var self = ThisPage;

  var tmpConfirm = true;

//--- ToDo: Getting prompted twice
//tmpConfirm = ThisApp.confirm(tmpMsg, tmpTitle);
  if (!ThisPage.inMeetingRequest) {
    ThisPage.inMeetingRequest = true;
    tmpConfirm = ThisApp.confirm(tmpMsg, tmpTitle);
  } else {
    console.log('in request, no confirm needed')
  }
  
  
  $.when(tmpConfirm).then(theReply => {
    console.log('confirm:',theReply);
    var tmpReplyMsg = {
      from: theMsg.fromid,
      reply: theReply
    }
    
    
    if (theReply) {
      ThisPage.activePeer.setRemoteDescription(new RTCSessionDescription(theMsg.offer)).then(
        function () {

          ThisPage.activePeer.createAnswer().then(theAnswer => {
            self.activeAnswer = theAnswer;
console.log( 'setLocalDescription theAnswer', theAnswer);

            ThisPage.activePeer.setLocalDescription(new RTCSessionDescription(theAnswer)).then(
              function () {
                console.log('sending meetingresponse post confirm')
                ThisPage.wsclient.send(JSON.stringify({
                  action: 'meetingresponse', answer: self.activeAnswer, message: tmpReplyMsg
                }))
              }
            )
          });
        }
      );
    } else {
      console.log('no response reply')
      ThisPage.wsclient.send(JSON.stringify({
        action: 'meetingresponse', message: tmpReplyMsg
      }))
    }
  })
}




function onMeetingResponse(theMsg) {
  var self = ThisPage;


  if (theMsg && theMsg.message && theMsg.message.reply === true) {


    var tmpAnswer = theMsg.answer;
    ThisPage.activePeer.setRemoteDescription(
      new RTCSessionDescription(tmpAnswer)
    ).then(function() {
        //ToDo: Set this?

        if (!ThisPage.isAlreadyCalling) {
          //--- Socket ID?

          actions.requestMeeting({
            userid: theMsg.fromid
          })
          ThisPage.isAlreadyCalling = true;
          console.log('Calling back', typeof(ThisPage.activePeer));

        } else {
          console.log('we have connection', typeof(ThisPage.activePeer));
          ThisPage.inMeetingRequest = false;

        

          

        }
      });



  } else {
    alert('' + theMsg.fromname + ' did not accept the requst', 'Request Not Accepted', 'e')
  }
  // var tmpTitle = 'Meeting Request from ' + theMsg.fromname
  // var tmpMsg = 'Do you want to join a meeting with ' + theMsg.fromname + '?'
  // ThisApp.confirm(tmpMsg, tmpTitle).then(theReply => {
  //   var tmpReplyMsg = {
  //     from: theMsg.fromid,
  //     reply: theReply
  //   }
  //   ThisPage.wsclient.send(JSON.stringify({
  //     action: 'meetingresponse', message: tmpReplyMsg
  //   }))

  // })

}



actions.sendProfile = sendProfile;
function sendProfile() {
  if(!ThisPage.wsclient) return;
  
  ThisPage.wsclient.send(JSON.stringify({
    action: 'profile', profile: ThisPage.stage.profile, userid: ThisPage.stage.userid, id: ThisPage.stage.stageid
  }))
}

actions.startStreaming = startStreaming;
function startStreaming(){
  console.log( 'startStreaming',ThisPage.common.targetHost );
  if( ThisPage.common.targetHost && ThisPage.common.targetHostFound){
    console.log('req2');
    requestMeeting({userid:ThisPage.common.targetHost})
  } else {
    alert('we can not do that Dave', "Sad Face")
  }
  
}

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
    ThisPage.activePeer.setLocalDescription(new RTCSessionDescription(self.activeOffer)).then();

    ThisPage.wsclient.send(JSON.stringify({
      offer: self.activeOffer,
      action: 'meeting', to: tmpParams.userid
    }))


  });




}




//=== WEBRTC ==========================================================================
//~YourPageCode~//~

})(ActionAppCore, $);
