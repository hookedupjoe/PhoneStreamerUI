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
ThisPage.subscribe('NewMediaSources', refreshMediaSourceLists);


ThisPage.localVideo = ThisPage.getAppUse('local-video');
ThisPage.localVideo.addEventListener("play",onLocalVideoPlay);
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

function onLocalVideoPlay(){
  //--- We are streaming
  console.log('onLocalVideoPlay',onLocalVideoPlay);
}

actions.setHostName = setHostName;
function setHostName() {
  ThisApp.input('Enter your host name', 'Host Name').then(updateHostName)
}

actions.setDeviceName = setDeviceName;
function setDeviceName() {
  ThisApp.input('Enter your host name', 'Host Name').then(updateDeviceName)
}

function updateHostName(theName) {
  if(!theName){
    //--- there is no clearing allowed and a value is required, they hit escape when prompted
    return;
  }
  ThisPage.common.displayName = theName;
  sessionStorage.setItem('hostdispname', theName);
  ThisPage.common.role = 'host';
  refreshUI();
}

function updateDeviceName(theName) {
  if(!theName){
    return;
  }
  ThisPage.common.displayName = theName;
  sessionStorage.setItem('devicedispname', theName);
  ThisPage.common.role = 'stream';
  refreshUI();
}

function gotoStage(theStage) {
  var tmpStage = theStage || 'start';
  ThisPage.showSubPage({
    item: theStage, group: 'maintabs'
  });
}

actions.restart = restart;
function restart() {
  ThisPage.common.role = '';
  refreshUI();
}

function initUI() {
  //--- Handle browser refresh
  var tmpHostname = sessionStorage.setItem('hostdispname', theName);
  var tmpDevicename = sessionStorage.setItem('devicedispname', theName);

}

function refreshUI() {
  var tmpName = ThisPage.common.displayName || '';
  var tmpIsActive = (ThisPage.common.role || '');
  var tmpIsHosting = ThisPage.common.role == 'host';
  console.log('tmpName', tmpName);
  console.log('tmpIsHosting', tmpIsHosting);
  console.log('tmpIsActive', tmpIsActive);

  if(!tmpIsActive){
    gotoStage('start');
  }

  if (tmpIsHosting) {
    if (tmpIsActive) {
      ThisPage.loadSpot('hostname', tmpName);
      ThisPage.showSubPage({
        item: 'ready', group: 'hosttabs'
      });
    } else {
      ThisPage.showSubPage({
        item: 'start', group: 'hosttabs'
      });
    }
  } else {
    if (tmpIsActive) {
      ThisPage.loadSpot('streamname', tmpName);
      if (ThisPage.common.deviceId) {
        ThisPage.showSubPage({
          item: 'ready', group: 'streamtabs'
        });

      } else {
        
        ThisPage.showSubPage({
          item: 'select', group: 'streamtabs'
        });
        
        if(!(ThisPage.common.initialPrompt)){
          ThisPage.common.initialPrompt = true;
          //promptForCamera();
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

ThisPage.getAppUse = function(theUse){
  return ThisPage.getByAttr$({appuse: theUse}).get(0);
}

function promptForCamera() {
  navigator.mediaDevices.getUserMedia({
    video: true, audio: true
  }).then(function(stream) {
    refreshUI();
  },connectError);
}

function promptForMic() {
  navigator.mediaDevices.getUserMedia({
    video: false, audio: true
  }).then(function(stream) {
    refreshUI();
  },connectError);
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
    },connectError);
}

actions.selectVideoSource = selectVideoSource;
function selectVideoSource(theParams, theTarget) {
  var tmpParams = ThisApp.getActionParams(theParams, theTarget, ['deviceId', 'label']);


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

  },connectError);

  //ThisPage.parts.am.setActiveDeviceId(tmpParams.deviceId);
}




function refreshMediaSourcesFromSystem() {
  var self = this;
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
    ThisPage.loadSpot('video-sources', '<div class="mar5"></div><div class="ui message orange mar5">Once you have given permission, press the <b>Show Available Cameras</b> button again.</div>');
    promptForCamera();
  }

}



//=== WEBSOCKET ==========================================================================



//=== WEBRTC ==========================================================================
//~YourPageCode~//~

})(ActionAppCore, $);
