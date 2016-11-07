/* global app, L */

app.map = (function ()
{
  // the leaflet map object
  var _map,

    yellowArrow = L.icon({
      iconUrl: '../css/images/yellowArrow.png',
      iconSize: [38,95],
      iconAnchor: [22.94]
    }),

  // create an empty layer group
      _layerGroup = new L.LayerGroup(),
      // overlayHS = L.esri.featureLayer({
      //   url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
      // })
      _stViewMarker = new L.marker({icon: yellowArrow});
      //marker1 = new L.marker()

  return {
    //theObject: queryParcel,
    initMap : function () {
      app.state.map = {}
      app.state.clickedOnMap = false
      //app.state.moveMode = true
      var CITY_HALL = [39.952388, -75.163596];

      _map = L.map('map', {
         zoomControl: false,
         //measureControl: true,
      });
      _map.setView(CITY_HALL, 18);

      //marker1.setLatLng(CITY_HALL);
      //marker1.addTo(_map);

      // Basemaps
      var baseMapLight = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer",
        maxZoom: 22
      });
      var baseMapDark = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer",
        maxZoom: 22
      });
      var baseMapImagery2015 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer",
        maxZoom: 22
      });
      baseMapLight.addTo(_map);

      // Overlays
      var overlayZoning = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer'
      });
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
        'Light':    baseMapLight,
        'Dark':     baseMapDark,
        'Imagery 2015': baseMapImagery2015,
      };
      /*
      var overlays = {
        'Zoning':     overlayZoning,
        'PWD Parcels':  overlayPwdParcels,
        // 'Land Use': landUse,
      };
      */

      // Controls
      L.control.layers(baseLayers, '', {position: 'topright'}).addTo(_map);
      //L.control.layers(baseLayers, overlays, {position: 'topright'}).addTo(map);
      //var measureControl = new L.Control.Measure({position: 'topright'});
      //measureControl.addTo(map);
      new L.Control.Zoom({position: 'topright'}).addTo(_map);
      _layerGroup.addTo(_map);

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

      if(localStorage.stViewCoords) {
        console.log('stView marker should be at ' + localStorage.stViewCoords)
        app.state.stViewX = localStorage.getItem('stViewX');
        app.state.stViewY = localStorage.getItem('stViewY');
        _stViewMarker.setLatLng([app.state.stViewY, app.state.stViewX]);
        _stViewMarker.addTo(_map);
      }

      $(window).bind('storage', function (e) {
        if (e.originalEvent.key == 'stViewCoords'){
          console.log('move stView marker to ' + e.originalEvent.newValue);
          app.state.stViewX = localStorage.getItem('stViewX');
          app.state.stViewY = localStorage.getItem('stViewY');
          _stViewMarker.setLatLng([app.state.stViewY, app.state.stViewX], {icon: yellowArrow});
          _stViewMarker.addTo(_map);
          console.log('it should be on map')
        }
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
      app.state.clickedOnMap = true
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
        app.state.map.didClickMap = false;
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
      _layerGroup.clearLayers();

      // pan map
      // true if search button was clicked or if page is loaded w address parameter, false if a parcel was clicked
      // if (app.state.map.shouldPan) {
        // latlon = new L.LatLng(thelatlon[0], thelatlon[1]);
      _map.setView(parcelCentroid, 18);
      // need to wait until map sets view
      // or need to use parcel centroid instead of center of map
      // set new state and localStorage
      app.map.LSinit();
      // }

      // add to map
      _layerGroup.addLayer(parcelPoly);
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
      console.log('clickedOnMap is ' + app.state.clickedOnMap);
      if (app.state.clickedOnMap == true){
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
