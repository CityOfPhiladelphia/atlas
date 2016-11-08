/* global app, L */

app.map = (function ()
{
  // the leaflet map object
  var _map,

      yellowArrow = L.icon({
        iconUrl: 'css/images/yellowArrow.png',
        //iconSize: [38,95],
        //iconAnchor: [22.94]
      }),
      viewcone = L.icon({
        iconUrl: 'css/images/viewcone.png',
        iconSize: [40,40],
        iconAnchor: [20, 30],
      }),
      camera = L.icon({
        iconUrl: 'css/images/camera_04.png',
        iconSize: [30, 20],
        iconAnchor: [15,  10],
      }),

      _baseLayerGroup = new L.LayerGroup(),
      _overlayLayerGroup = new L.LayerGroup(),
      // create an empty layer group for the parcel query layer
      _parcelLayerGroup = new L.LayerGroup(),
      // overlayHS = L.esri.featureLayer({
      //   url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
      // })

      // create window level placeholder for _stViewMarker
      _stViewMarker
  return {
    //theObject: queryParcel,
    initMap : function () {
      app.state.map = {}
      app.state.map.clickedOnMap = false
      //app.state.moveMode = true
      var CITY_HALL = [39.952388, -75.163596];

      _map = L.map('map', {
         zoomControl: false,
         //measureControl: true,
      });
      _map.setView(CITY_HALL, 17);

      /*
      Using multiple tiled Layers in esri-leaflet is not well documented.
      The structure of the html rendered looks like this:
      <div id="map" class="leaflet-container leaflet-fade-anim leaflet-grab leaflet-touch-drag" style="position: relative;" tabindex="0">
        <div class="leaflet-pane leaflet-map-pane" style="transform: translate3d(0px, 29px, 0px);">
          <div class="leaflet-pane leaflet-tile-pane">
          <div class="leaflet-pane leaflet-shadow-pane"></div>
          <div class="leaflet-pane leaflet-overlay-pane"></div>
          <div class="leaflet-pane leaflet-marker-pane">
          <div class="leaflet-pane leaflet-tooltip-pane"></div>
          <div class="leaflet-pane leaflet-popup-pane"></div>
          <div class="leaflet-proxy leaflet-zoom-animated" style="transform: translate3d(9771460px, 1.27088e+7px, 0px) scale(65536);"></div>

      all of the tiled maps will have low z values, and be grouped in the <div class="leaflet-pane leaflet-tile-pane">:
      <div class="leaflet-pane leaflet-tile-pane">
        <div class="leaflet-layer " style="z-index: 1; opacity: 1;">
        <div class="leaflet-layer " style="z-index: 3; opacity: 1;">
        <div class="leaflet-layer " style="z-index: 4; opacity: 1;">

      It is difficult to get the layer that you want to have the z value you want.
      The order in lists below, and setting up the L.control.layers is important for getting z values right.

      */
      // Basemaps
      var baseMapLight = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer",
        maxZoom: 22
      });

      var baseMapImagery2016 = L.esri.tiledMapLayer({
        url: "http://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer",
        maxZoom: 22
      });

      /*var baseMapImagery2015 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer",
        maxZoom: 22
      });*/

      /*var baseMapDark = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer",
        maxZoom: 22
      });*/

      _baseLayerGroup.addLayer(baseMapLight, baseMapImagery2016);
      _baseLayerGroup.addTo(_map);
      //baseMapLight.addTo(_map);

      // Overlays
      var overlayZoning = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer',
      });

      var overlayBaseLabels = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
      });

      var overlayImageryLabels = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer',
      })

      // YOU SHOULD NOT USE AN OVERLAY GROUP IF NOT USING THE L.Control.Layers
      // IT WILL ONLY TURN ON THE FIRST LAYER IN THE GROUP, AND BE HARDER TO REFERENCE LAYERS TO TURN ON AND OFF
      //_overlayLayerGroup.addLayer(overlayZoning, overlayBaseLabels);
      //_overlayLayerGroup.addTo(_map);
      //overlayZoning.addTo(_map);
      overlayBaseLabels.addTo(_map);

      /*
      var overlayHS = L.esri.featureLayer({
        url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
      });
      var overlayES = L.esri.featureLayer({
        url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_ES/FeatureServer/0'
      });
      var overlayMS = L.esri.featureLayer({
        url: 'services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_MS/FeatureServer/0'
      });
      */

      var baseLayers = {
        'Light': baseMapLight,
        'Imagery 2016': baseMapImagery2016,
        //'Dark':     baseMapDark,
      };

      // THE ORDER HERE MATTERS.  THE LOWER ON THIS LIST, THE HIGHER THE Z VALUE THE LAYER WILL GET
      var overlays = {
        'Zoning': overlayZoning,
        'Street Labels': overlayBaseLabels,
        'Imagery Street Labels': overlayImageryLabels,
        //'PWD Parcels':  overlayPwdParcels,
        // 'Land Use': landUse,
      };


      // Controls
      //L.control.layers(baseLayers, '', {position: 'topright'}).addTo(_map);
      //L.control.layers(baseLayers, overlays, {position: 'topright'}).addTo(_map);
      L.control.layers(baseLayers, overlays).addTo(_map);
      //var measureControl = new L.Control.Measure({position: 'topright'});
      //measureControl.addTo(map);
      new L.Control.Zoom({position: 'topright'}).addTo(_map);

      $('#test-toggle-button').on('click', function(){
        console.log('clicked test toggle button');
        //baseMapLight.redraw();
        //baseMapLight.bringToFront();
        baseMapLight.remove();
        overlayBaseLabels.remove();
        baseMapImagery2016.addTo(_map);
        console.log('added baseMapImagery2016 to map');
        overlayImageryLabels.addTo(_map);
        console.log('added overlayImageryLabels to map');

      })



      _parcelLayerGroup.addTo(_map);

      // one of 2 ways to call AIS
      _map.on('click', app.map.didClickMap);

      // set map state and localStorage on init, drag, dragend, and zoom
      app.map.LSinit();

      _map.on('drag', function(){
        app.map.LSdrag();
      });

      _map.on('dragend', function(){
        app.map.LSdragend();
      });

      _map.on('zoomend', function(){
        app.map.LSzoomend();
      })

      // when map refreshes, if there is already a cyclomedia tab open, place the marker
      if(localStorage.stViewOpen == 'true') {
        console.log('stView marker should be at ' + localStorage.stViewCoords + 'and stViewYaw should be ' + app.state.stViewYaw);
        app.state.stViewX = localStorage.getItem('stViewX');
        app.state.stViewY = localStorage.getItem('stViewY');
        app.state.stViewYaw = localStorage.getItem('stViewYaw');
        _stViewMarker = L.marker([app.state.stViewY, app.state.stViewX], {
          icon: viewcone,
          rotationAngle: app.state.stViewYaw
        });
        _stViewMarker.addTo(_map);
      }

      // watch localStorage for changes to:
      //1. stViewOpen, 2. stViewCoords, 3. stViewYaw
      $(window).bind('storage', function (e) {
        // if Cyclomedia window closes, remove marker
        if (e.originalEvent.key == 'stViewOpen' && e.originalEvent.newValue == 'false') {
          if (_stViewMarker) {
            _stViewMarker.remove();
          };
        };
        if (e.originalEvent.key == 'stViewCoords'){
          //console.log('move stView marker to ' + e.originalEvent.newValue);
          app.state.stViewX = localStorage.getItem('stViewX');
          app.state.stViewY = localStorage.getItem('stViewY');
          if (_stViewMarker) {
            _stViewMarker.remove();
          };
          _stViewMarker = L.marker([app.state.stViewY, app.state.stViewX], {
            icon: viewcone,
            rotationAngle: app.state.stViewYaw
          });
          //_stViewMarker.setLatLng([app.state.stViewY, app.state.stViewX]);
          _stViewMarker.addTo(_map);
          console.log('it should be on map');
        };
        if (e.originalEvent.key == 'stViewYaw'){
          console.log('stViewYaw changed to ' +  e.originalEvent.newValue);
          app.state.stViewYaw = localStorage.getItem('stViewYaw');
          if (_stViewMarker) {
            _stViewMarker.remove();
          };
          _stViewMarker = L.marker([app.state.stViewY, app.state.stViewX], {
            icon: viewcone,
            rotationAngle: app.state.stViewYaw
          });
          _stViewMarker.addTo(_map);
          console.log('stViewYaw should have just caused icon to rotate');
        };
      });

    }, // end of initMap

    renderAisResult: function (obj) {
      // get parcel
      var pwdParcelId = obj.properties.pwd_parcel_id;
      app.map.getParcelById(pwdParcelId);
    },

    getParcelById: function (id) {
      var parcelQuery = L.esri.query({url: app.config.map.parcelLayerUrl});
      parcelQuery.where('PARCELID = ' + id);
      parcelQuery.run(app.map.didGetParcelQueryResult);
    },

    didClickMap: function (e) {
      // set state
      app.state.map.clickedOnMap = true
      //app.state.map.didClickMap = true;
      app.state.map.shouldPan = false;

      // query parcel layer
      var parcelQuery = L.esri.query({url: app.config.map.parcelLayerUrl});
      parcelQuery.contains(e.latlng)
      parcelQuery.run(app.map.didGetParcelQueryResult);
    },

    // called after parcel query finishes
    // this is a slow process - only want to do it once
    didGetParcelQueryResult: function (error, featureCollection, response) {
      var parcel = featureCollection.features[0],
          parcelAddress = parcel.properties.ADDRESS;

      // update state
      app.state.map.parcel = parcel;

      // if this is the result of a map click, query ais for the address
      if (app.state.map.clickedOnMap) {
        app.getAis(parcelAddress);
        app.state.map.clickedOnMap = false;
      }

      // render parcel
      app.map.drawParcel();
    },

    drawParcel: function () {
      var parcel = app.state.map.parcel,
          // flip these because leaflet uses lat/lon and esri is x/y
          coords = app.util.flipCoords(parcel.geometry.coordinates),
          parcelPoly = L.polygon([coords], {
            color: 'blue',
            weight: 2
          }),
          parcelCentroid = parcelPoly.getBounds().getCenter();

      app.state.theParcelCentroid = parcelCentroid;
      // clear existing parcel
      _parcelLayerGroup.clearLayers();

      // pan map
      // true if search button was clicked or if page is loaded w address parameter, false if a parcel was clicked
      // if (app.state.map.shouldPan) {
        // latlon = new L.LatLng(thelatlon[0], thelatlon[1]);
      _map.setView(parcelCentroid, 20);
      // need to wait until map sets view
      // or need to use parcel centroid instead of center of map
      // set new state and localStorage
      app.map.LSinit();
      // }

      // add to map
      _parcelLayerGroup.addLayer(parcelPoly);
    }, // end of drawPolygon

    getGeomFromLatLon : function(latlon){
      //console.log('it did getGeom')
      queryParcel.contains(latlon)
      queryParcel.run(function (error, featureCollection, response) {
        app.state.map.curFeatGeo = featureCollection.features[0].geometry
        // app.gis.flipCoords(app.data.gis.curFeatGeo)
        // var coordsFlipped =
      });
    },

    // LocalStorage functions
    // on init, put center and zoom in LocalStorage, in case
    // Pictometry or Cyclomedia are used
    LSinit: function() {
      console.log('running LSinit');
      console.log('clickedOnMap is ' + app.state.map.clickedOnMap);
      if (app.state.map.clickedOnMap == true){
        console.log('setting app.state.theX and theY from parcelCentroid');
        app.state.theX = app.state.theParcelCentroid.lng;
        app.state.theY = app.state.theParcelCentroid.lat;
      } else {
        console.log('setting app.state.theX and theY from map center');
        app.state.theCenter = _map.getCenter();
        app.state.theX = app.state.theCenter.lng;
        app.state.theY = app.state.theCenter.lat;
      }
      console.log('setting the rest of the variables')
      app.state.theZoom = _map.getZoom();
      localStorage.setItem('theZoom', app.state.theZoom);
      localStorage.setItem('theX', app.state.theX);
      localStorage.setItem('theY', app.state.theY);
      localStorage.setItem('cycloCoords', [app.state.theX, app.state.theY]);
      localStorage.setItem('pictCoordsZoom', [app.state.theX, app.state.theY, app.state.theZoom]);
    },

    // while map is dragged, constantly reset center in localStorage
    // this will move Pictometry with it, but not Cyclomedia
    LSdrag: function() {
      app.state.theCenter = _map.getCenter();
      app.state.theX = app.state.theCenter.lng;
      app.state.theY = app.state.theCenter.lat;
      localStorage.setItem('theX', app.state.theX);
      localStorage.setItem('theY', app.state.theY);
      localStorage.setItem('pictCoordsZoom', [app.state.theX, app.state.theY, app.state.theZoom]);
    },

    // when map is finished being dragged, 1 more time reset
    // the center in localStorage
    // this will move Pictometry AND Cyclomedia
    LSdragend: function() {
      app.state.theCenter = _map.getCenter();
      app.state.theX = app.state.theCenter.lng;
      app.state.theY = app.state.theCenter.lat;
      localStorage.setItem('theX', app.state.theX);
      localStorage.setItem('theY', app.state.theY);
      localStorage.setItem('cycloCoords', [app.state.theX, app.state.theY]);
      localStorage.setItem('pictCoordsZoom', [app.state.theX, app.state.theY, app.state.theZoom]);
    },

    // when map is zoomed, reset zoom in localStorage
    // this will re-zoom Pictometry also
    LSzoomend: function() {
      app.state.theZoom = _map.getZoom();
      localStorage.setItem('theZoom', app.state.theZoom);
      localStorage.setItem('pictCoordsZoom', [app.state.theX, app.state.theY, app.state.theZoom]);
    },

  }; // end of return
})();

app.map.initMap();
