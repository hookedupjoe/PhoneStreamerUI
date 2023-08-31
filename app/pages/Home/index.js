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
ThisPage.localVideo.addEventListener("canplay",onLocalVideoPlay);

// navigator.mediaDevices.ondevicechange = function(){
//   console.log('we got devices');
//   refreshUI();
// };

initUI();
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

ThisPage.closeVideo = function(){
  console.log('closevid',typeof(ThisPage.localVideo.srcObject))
  if( ThisPage.localVideo.srcObject ){
    var tmpTracks = ThisPage.localVideo.srcObject.getTracks();
    tmpTracks.forEach(track => track.stop());
  }
  ThisPage.common.activeDeviceId = '';
  gotoStage('streamstart');
  refreshUI()
}


function onLocalVideoPlay(){
  //--- We are streaming
  console.log('onLocalVideoPlay');
  ThisPage.showSubPage({
      item: 'live', group: 'streamtabs'
    });
}

actions.setHostName = setHostName;
function setHostName() {
  console.log( 'setHostName');
  
  setRole('host');
  ThisApp.input('Enter your host name as it will be seen in the list (unique)', 'Host Display Name','Set Host Name', ThisPage.common.hostDispName || '').then(updateHostName)
}

actions.setDeviceName = setDeviceName;
function setDeviceName() {
  setRole('stream');
  ThisApp.input('Enter your devices stream name as it will be seen in the list (unique)', 'Stream Display Name', 'Set Stream Name', ThisPage.common.streamDispName || '').then(updateDeviceName)
}

function updateHostName(theName) {
  if(!theName){
    //--- there is no clearing allowed and a value is required, they hit escape when prompted
    return;
  }
  sessionStorage.setItem('hostdispname', theName);
  //ThisPage.common.displayName = theName;
  ThisPage.common.hostDispName = theName;
  refreshUI();
}

function updateDeviceName(theName) {
  if(!theName){
    return;
  }
  //ThisPage.common.displayName = theName;
  sessionStorage.setItem('devicedispname', theName);
  ThisPage.common.streamDispName = theName;
  refreshUI();
}



function gotoStage(theStage) {
  var tmpStage = theStage || 'start';
  ThisPage.showSubPage({
    item: theStage, group: 'maintabs'
  });
}

function setRole(theRole){
  ThisPage.common.role = theRole;
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
  console.log( 'openStreamUI' );
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
  var tmpHostname = sessionStorage.getItem('hostdispname');
  var tmpDevicename = sessionStorage.getItem('devicedispname');
  var tmpLastRole = sessionStorage.getItem('lastrole') || ThisPage.common.role;
  
  if( tmpDevicename ){
    //ThisPage.loadSpot('streamname', tmpDevicename);
    updateDeviceName(tmpDevicename)
  }
  if( tmpHostname ){
    //ThisPage.loadSpot('hostname', tmpHostname);
    updateHostName(tmpHostname)
  }
  console.log('tmpHostname',tmpHostname);
  console.log('tmpDevicename',tmpDevicename);
  console.log('tmpLastRole',tmpLastRole);
  
  if( (tmpLastRole) ){
    ThisPage.common.role = tmpLastRole;
    if( tmpLastRole == 'host' && (tmpHostname)){
      //ThisPage.common.displayName = tmpHostname;
      gotoStage('hoststart')
    } else if( tmpLastRole == 'stream' && (tmpDevicename)){
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
  console.log('tmpIsHosting', tmpIsHosting);
  console.log('tmpIsActive', tmpIsActive);
  var tmpName = '';

  if(!tmpIsActive){
    gotoStage('start');
  }
  

  if (tmpIsHosting) {
    tmpName = ThisPage.common.hostDispName || '';
    if (tmpIsActive) {
      ThisPage.loadSpot('hostname', tmpName);
      if(tmpName){
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
        
        if(!(ThisPage.common.initialPrompt)){
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
    ThisPage.loadSpot('video-sources', '<div class="mar5"></div><div class="ui message orange mar5">Once you have given permission, press the <b>Refresh Available Cameras</b> button again.</div>');
    if( !(ThisPage.common.videoRetry) ){
      ThisPage.common.videoRetry = true;
      ThisApp.delay(5000).then(refreshVideoSources);
    }
  }

}



//=== WEBSOCKET ==========================================================================



//=== WEBRTC ==========================================================================
//~YourPageCode~//~

})(ActionAppCore, $);
