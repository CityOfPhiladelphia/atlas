var app = app || {};

// when tab opens, set localStorage variable 'stViewClosed' to false
/*$(window).on('load', function(){
  localStorage.setItem('stViewOpen', true);
});*/

// when tab closes, set localStorage variable 'stViewClosed' to true
/*$(window).on('beforeunload', function(){
  localStorage.setItem('stViewOpen', false);
});*/

//app.state.cyclo.resolveNewLocation = $.Deferred();
app.default = {};
// Set default location coordinates
app.default.leafletForCycloY = 39.952388;
app.default.leafletForCycloX = -75.163596;
//app.default.cycloDiv = $('#cyclo-viewer')[0];

app.cyclo = ( function () {
  var cycloDiv,
    viewer;

  return {
    //resolveNewLocation = $.Deferred(),

    init: function (containerDiv) {
      cycloDiv = $('<div>').addClass('panoramaViewerWindow').attr('id', 'cyclo-viewer')[0];
      $(containerDiv).html(cycloDiv);
      StreetSmartApi.init({
        username: app.config.cyclo.username,
        password: app.config.cyclo.password,
        apiKey: app.config.cyclo.apiKey,
        srs: "EPSG:4326",
        locale: 'nl',
        addressSettings: {
          locale: "nl",
          database: "CMDatabase"
        }
      }).then (
        app.cyclo.didInitCyclo,
        function(err) {
          console.log('Api: init: failed. Error: ', err);
          alert('Api Init Failed!');
        }
      );

      $(window).bind('storage', function (e) {
        console.warn('LOCAL STORAGE CHANGE **(&(*&(*&(*&(*&(*))))))')
				console.warn(e);
      });
    },
    didInitCyclo: function () {
      // set up PanoramaViewer
      console.log('setting up addPanoramaViewer')
      viewer = StreetSmartApi.addPanoramaViewer(cycloDiv, {recordingsVisible: true, timeTravelVisible: true});
      // set initial location
      console.log('running setInitLocation');
      app.cyclo.setInitLocation() // this ends up changing a lot of things, but it doesn't change LS automatically
      // watch localStorage for changes in X or Y
      $(window).bind('storage', function(e){
        // by looking at key cycloCoords, this only fires when atlas instructs changes for cyclo
        if (e.originalEvent.key == 'cycloCoords') {
          //console.log('reacting to changes in local storage');
          app.cyclo.setNewLocation();
          // this is happening before the function before it
          $.when(app.cyclo.resolveNewLocation).done(app.cyclo.map.LSsetImageProps());
        };
      });
      viewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, app.cyclo.didChangeView);
      viewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_LOAD_END, app.cyclo.didLoadView);
    },

    // function setInitLocation - set initial state location from localStorage or default
    setInitLocation: function () {
      //console.log('running setInitLocation - got things from localStorage');
      if(localStorage.getItem('leafletForCycloX')) {
        console.log('found leafletForCycloX');
        app.state.leafletForCycloX = localStorage.getItem('leafletForCycloX');
      } else {
        console.log('used default X')
        app.state.leafletForCycloX = app.default.leafletForCycloX;
      }
      if(localStorage.getItem('leafletForCycloY')) {
        app.state.leafletForCycloY = localStorage.getItem('leafletForCycloY');
      } else {
        app.state.leafletForCycloY = app.default.leafletForCycloY;
      }
      console.log('still running setInitLocation - about to run openByCoordinate');
      viewer.openByCoordinate([parseFloat(app.state.leafletForCycloX), parseFloat(app.state.leafletForCycloY)]);
      console.log('still running setInitLocation - ran openByCoordinate');
    },

    didChangeView: function () {
      console.log('VIEW_CHANGE occurred');
      //console.log('stViewYaw was ' + app.state.stViewYaw);
      //console.log('stViewHfov was ' + app.state.stViewHfov);
      app.state.stViewYaw = viewer.props.orientation.yaw * (180/3.14159265359);
      //console.log('stViewYaw now is ' + app.state.stViewYaw);
      app.state.stViewHfov = viewer.props.orientation.hFov * (180/3.14159265359);
      //console.log('stViewHfov now is ' + app.state.stViewHfov);
      app.cyclo.LSsetImageProps();
    },

    didLoadView: function () {
      //console.log('VIEW_LOAD_END event fired');
      var propsLoc = [viewer.props.orientation.xyz[0], viewer.props.orientation.xyz[1]];
      var savedLoc = [app.state.stViewX, app.state.stViewY];
      //console.log(propsLoc);
      //console.log(savedLoc);
      if (viewer.props.orientation.xyz[0] == app.state.stViewX && viewer.props.orientation.xyz[1] == app.state.stViewY) {
        //console.log('location already saved - VIEW_LOAD_END event did not trigger reload');
      } else {
        //console.log('saving new location to state');
        app.state.stViewX = viewer.props.orientation.xyz[0]
        app.state.stViewY = viewer.props.orientation.xyz[1]
        //console.log('saving new location to localStorage');
        app.cyclo.LSsetImageProps();
      }
    },

    setNewLocation: function () {
      console.log('running setNewLocation');
      app.cyclo.resolveNewLocation = $.Deferred();
      //app.state.clickedOnMap = localStorage.getItem('clickedOnMap');
      //if (app.state.clickedOnMap == 'false'){
        //console.log('using top cause app.state.clickedOnMap is ', app.state.clickedOnMap);
        //console.log(localStorage.getItem('leafletForCycloX'), ' ', localStorage.getItem('leafletForCycloY'));
        app.state.leafletForCycloX = localStorage.getItem('leafletForCycloX');
        app.state.leafletForCycloY = localStorage.getItem('leafletForCycloY');
      //} else {
        //console.log('using bottom cause app.state.clickedOnMap is ', app.state.clickedOnMap);
        //app.state.leafletForCycloX = localStorage.getItem('circleX');
        //app.state.leafletForCycloY = localStorage.getItem('circleY');
        viewer.openByCoordinate([parseFloat(app.state.leafletForCycloX), parseFloat(app.state.leafletForCycloY)]);
      //console.log('finished setNewLocation (ran viewer.openByCoordinate)');
    },

    LSsetImageProps: function () {
      console.log('running LSsetImageProps');
      localStorage.setItem('stViewX', app.state.stViewX);
      localStorage.setItem('stViewY', app.state.stViewY);
      localStorage.setItem('stViewCoords', [app.state.stViewX, app.state.stViewY]);
      localStorage.setItem('stViewYaw', app.state.stViewYaw);
      localStorage.setItem('stViewHfov', app.state.stViewHfov);
    }

  };
})();
