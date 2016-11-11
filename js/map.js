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
      bigRedMarker = L.icon({
        iconUrl: 'css/images/marker-red-icon.png',
        iconSize: [37, 61],
        iconAnchor: [18, 63],
      }),
      blueMarker = L.icon({
        iconUrl: 'css/images/marker-blue-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),

      _baseLayerGroup = new L.LayerGroup(),
      _labelLayerGroup = new L.LayerGroup(),
      _overlayLayerGroup = new L.LayerGroup(),

      _appealsLayerGroup = new L.LayerGroup(),
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
      app.state.map = {};
      app.state.map.clickedOnMap = false;
      // the next 2 variables hold names for checking what is on the map
      app.state.map.nameBaseLayer;
      app.state.map.nameLabelsLayer;
      app.state.map.namesOverLayers = [];
      // the next 2 objects hold the actual layers
      app.state.map.tileLayers = {};
      app.state.map.mapServices = {};



      //app.state.moveMode = true
      var CITY_HALL = [39.952388, -75.163596];

      _map = L.map('map', {
         zoomControl: false,
         //measureControl: true,
      });
      _map.setView(CITY_HALL, 17);

      // Basemaps
      app.state.map.tileLayers.baseMapLight = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer",
        maxZoom: 22,
        name: 'baseMapLight',
        type: 'base',
        zIndex: 1,
      });

      app.state.map.tileLayers.baseMapImagery2016 = L.esri.tiledMapLayer({
        url: "http://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2016',
        type: 'base',
        zIndex: 2,
      });

      app.state.map.tileLayers.baseMapImagery2015 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2015',
        type: 'base',
        zIndex: 3,
      });

      app.state.map.tileLayers.baseMapImagery2012 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2012_3in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2012',
        type: 'base',
        zIndex: 4,
      });

      app.state.map.tileLayers.baseMapImagery2010 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2010_3in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2010',
        type: 'base',
        zIndex: 5,
      });

      app.state.map.tileLayers.baseMapImagery2008 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2008_3in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2008',
        type: 'base',
        zIndex: 6,
      });

      app.state.map.tileLayers.baseMapImagery2004 = L.esri.tiledMapLayer({
        url: "http://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2004_6in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2004',
        type: 'base',
        zIndex: 7,
      });

      app.state.map.tileLayers.baseMapImagery1996 = L.esri.tiledMapLayer({
        url: "http://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_1996_6in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery1996',
        type: 'base',
        zIndex: 8,
      });



      /*var baseMapDark = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer",
        maxZoom: 22
      });*/

      // Overlays - Labels
      app.state.map.tileLayers.overlayBaseLabels = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
        maxZoom: 22,
        name: 'overlayBaseLabels',
        type: 'labels',
        zIndex: 100,
      });

      app.state.map.tileLayers.overlayImageryLabels = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer',
        maxZoom: 22,
        name: 'overlayImageryLabels',
        type: 'labels',
        zIndex: 101,
      })

      // Overlays - Other
      // right now this is not used
      app.state.map.tileLayers.overlayZoning = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer',
        maxZoom: 22,
        name: 'overlayZoning',
        type: 'overlay',
        zIndex: 10,
      });

      // right now this is used, and set to dynamicMapLayer instead of FeatureLayer
      app.state.map.mapServices.ZoningMap = L.esri.dynamicMapLayer({
        url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer',
        maxZoom: 22,
        name: 'zoningMap',
        type: 'overlay',
        zIndex: 13,
      });


      // Now add to map
      _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapLight);
      _baseLayerGroup.addTo(_map);
      _labelLayerGroup.addLayer(app.state.map.tileLayers.overlayBaseLabels);
      _labelLayerGroup.addTo(_map);

      // The next 3 are not used initially
      _overlayLayerGroup.addTo(_map);
      _parcelLayerGroup.addTo(_map);
      _appealsLayerGroup.addTo(_map);

      // add names of layers on the map to the DOM
      app.map.domLayerList();

      // Controls
      new L.Control.Zoom({position: 'topright'}).addTo(_map);

      var basemapToggleButton = L.easyButton({
        id: 'baseToggleButton',
        position: 'topright',
        states: [{
          stateName: 'toggleToImagery',
          icon:      '<img src="css/images/imagery_small.png">',
          title:     'Toggle To Imagery',
          onClick: function(control) {
            toggleBasemap();
            control.state('toggletoBasemap');
          }
        }, {
          stateName: 'toggletoBasemap',
          icon:      '<img src="css/images/basemap_small.png">',
          title:     'Toggle To Basemap',
          onClick: function(control) {
            toggleBasemap();
            control.state('toggleToImagery');
          }
        }]
      });
      basemapToggleButton.addTo(_map);

      app.state.map.historicalImageryButtons = [
        L.easyButton({
          id: '2016ToggleButton',
          states:[{
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2016</strong>',
            title: 'Show 2016 Imagery',
            onClick: function(control) {
              console.log('clicked 2016 - it was already active');
            }
          }, {
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2016</strong>',
            title: 'Show 2016 Imagery',
            onClick: function(control) {
              console.log('clicked 2016');
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2016);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2016;
            }
          }]
        }),
        L.easyButton({
          id: '2015ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2015</strong>',
            title: 'Show 2015 Imagery',
            onClick: function(control) {
              console.log('clicked 2015')
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2015);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2015;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2015</strong>',
            title: 'Show 2015 Imagery',
            onClick: function(control) {
              console.log('clicked 2015 - it was already active')
            }
          }]
        }),
        L.easyButton({
          id: '2012ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2012</strong>',
            title: 'Show 2012 Imagery',
            onClick: function(control) {
              console.log('clicked 2012')
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2012);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2012;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2012</strong>',
            title: 'Show 2012 Imagery',
            onClick: function(control) {
              console.log('clicked 2012 - it was already active')
            }
          }]
        }),
        L.easyButton({
          id: '2010ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2010</strong>',
            title: 'Show 2010 Imagery',
            onClick: function(control) {
              console.log('clicked 2010')
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2010);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2010;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2010</strong>',
            title: 'Show 2010 Imagery',
            onClick: function(control) {
              console.log('clicked 2010 - it was already active')
            }
          }]
        }),
        L.easyButton({
          id: '2008ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2008</strong>',
            title: 'Show 2008 Imagery',
            onClick: function(control) {
              console.log('clicked 2008')
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2008);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2008;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2008</strong>',
            title: 'Show 2008 Imagery',
            onClick: function(control) {
              console.log('clicked 2008 - it was already active')
            }
          }]
        }),
        L.easyButton({
          id: '2004ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2004</strong>',
            title: 'Show 2004 Imagery',
            onClick: function(control) {
              console.log('clicked 2004')
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2004);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2004;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2004</strong>',
            title: 'Show 2004 Imagery',
            onClick: function(control) {
              console.log('clicked 2004 - it was already active')
            }
          }]
        }),
        L.easyButton({
          id: '1996ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">1996</strong>',
            title: 'Show 1996 Imagery',
            onClick: function(control) {
              console.log('clicked 1996')
              toggleYear(control, app.state.map.tileLayers.baseMapImagery1996);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery1996;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">1996</strong>',
            title: 'Show 1996 Imagery',
            onClick: function(control) {
              console.log('clicked 2008 - it was already active')
            }
          }]
        })
      ];

      // build a toolbar with them
      theEasyBar = L.easyBar(app.state.map.historicalImageryButtons, {
        position: 'topright'
      })

      // adds and removes baseLayer and overlay
      function toggleBasemap() {
        if (app.state.map.nameBaseLayer == 'baseMapLight') {
          _baseLayerGroup.clearLayers();
          //app.state.map.tileLayers.overlayBaseLabels.remove();
          _labelLayerGroup.clearLayers();
          // This has to change, it is loading 2016 every time
          if (app.state.map.lastYearViewed) {
            _baseLayerGroup.addLayer(app.state.map.lastYearViewed);
          } else {
            _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapImagery2016);
          }
          //app.state.map.tileLayers.overlayImageryLabels.addTo(_map);
          _labelLayerGroup.addLayer(app.state.map.tileLayers.overlayImageryLabels);
          theEasyBar.addTo(_map);

        } else {
          _baseLayerGroup.clearLayers();
          //app.state.map.tileLayers.overlayImageryLabels.remove();
          _labelLayerGroup.clearLayers();
          _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapLight);
          //app.state.map.tileLayers.overlayBaseLabels.addTo(_map);
          _labelLayerGroup.addLayer(app.state.map.tileLayers.overlayBaseLabels);
          theEasyBar.remove();
        }
        app.map.domLayerList();
      };


      function toggleYear(control, requestedLayer) {
        // gray all buttons
        for (i = 0; i < app.state.map.historicalImageryButtons.length; i++) {
          //console.log(app.state.map.historicalImageryButtons[i].options.id);
          app.state.map.historicalImageryButtons[i].state('dateNotSelected');
        };
        _baseLayerGroup.clearLayers();
        _baseLayerGroup.addLayer(requestedLayer)

        // highlight current button
        control.state('dateSelected');
        app.map.domLayerList();

      };


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
        //console.log('stView marker should be at ' + localStorage.stViewCoords + 'and stViewYaw should be ' + app.state.stViewYaw);
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
          //console.log('it should be on map');
        };
        if (e.originalEvent.key == 'stViewYaw'){
          //console.log('stViewYaw changed to ' +  e.originalEvent.newValue);
          app.state.stViewYaw = localStorage.getItem('stViewYaw');
          if (_stViewMarker) {
            _stViewMarker.remove();
          };
          _stViewMarker = L.marker([app.state.stViewY, app.state.stViewX], {
            icon: viewcone,
            rotationAngle: app.state.stViewYaw
          });
          _stViewMarker.addTo(_map);
          //console.log('stViewYaw should have just caused icon to rotate');
        };
      });

    }, // end of initMap

    // add names of layers on the map to the DOM
    domLayerList: function() {
      _map.eachLayer(function(layer){
        if (layer.options.name && layer.options.type == 'base') {
          app.state.map.nameBaseLayer = layer.options.name;
        } else if (layer.options.name && layer.options.type == 'labels') {
          app.state.map.nameLabelsLayer = layer.options.name;
        }
      });
      app.state.map.namesOverLayers = [];
      _map.eachLayer(function(layer){
        if (layer.options.name && layer.options.type == 'overlay') {
          app.state.map.namesOverLayers.push(layer.options.name);
        };
      });
      app.state.map.namesAppealsMarkers = [];
      _map.eachLayer(function(layer){
        if (layer.options.name && layer.options.type == 'appealsMarker') {
          app.state.map.namesAppealsMarkers.push(layer.options.name);
        }
      })
    },

    renderAisResult: function (obj) {
      // get parcel
      var parcelId = obj.properties.dor_parcel_id;
      // app.getParcelById(parcelId);
      this.drawParcel();
    },

    didClickMap: function (e) {
      console.log('did click map');

      // set state
      app.state.map.clickedOnMap = true
      //app.state.map.didClickMap = true;
      app.state.map.shouldPan = false;

      // query parcel layer
      // var parcelQuery = L.esri.query({url: app.config.parcelLayerUrl});
      // parcelQuery.contains(e.latlng)
      // parcelQuery.run(app.didGetParcelQueryResult);

      app.getParcelByLatLng(e.latlng, function () {
        var parcel = app.state.dor.features[0],
            parcelAddress = app.util.concatDorAddress(parcel);

        // if this is the result of a map click, query ais for the address
        if (app.state.map.clickedOnMap) {
          app.getAis(parcelAddress);
          app.state.map.clickedOnMap = false;
        }

        // render parcel
        app.map.drawParcel();
      });
    },

    drawParcel: function () {
      // console.log('draw parcel', app.state.dor);

      // if there's no parcel, return
      if (!app.state.dor) return;

      var parcel = app.state.dor.features[0],
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
      //console.log('running LSinit');
      //console.log('clickedOnMap is ' + app.state.map.clickedOnMap);
      if (app.state.map.clickedOnMap == true){
        //console.log('setting app.state.theX and theY from parcelCentroid');
        app.state.theX = app.state.theParcelCentroid.lng;
        app.state.theY = app.state.theParcelCentroid.lat;
      } else {
        //console.log('setting app.state.theX and theY from map center');
        app.state.theCenter = _map.getCenter();
        app.state.theX = app.state.theCenter.lng;
        app.state.theY = app.state.theCenter.lat;
      }
      //console.log('setting the rest of the variables')
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

    // called when the active topic in the topic panel changes
    didActivateTopic: function (topic) {
      console.log('did activate topic:', topic);
      _overlayLayerGroup.clearLayers();
      app.map.domLayerList();

      switch (topic) {
        case 'deeds':
          // code here
          break;
        case 'zoning':
          _overlayLayerGroup.addLayer(app.state.map.mapServices.ZoningMap);
          // add name "zoningMap" to the DOM list
          app.map.domLayerList();
          break;
        case 'nearby':
          app.map.addNearbyAppealsToMap();
        default:
          console.log('unhandled topic:', topic);
      }
    },

    didDisactivateTopic: function (topic) {
      console.log('did disactivate topic:', topic);
      switch (topic) {
        case 'deeds':
          // code here
          break;
        case 'zoning':
          if (app.state.map.namesOverLayers.includes('zoningMap')){
            _overlayLayerGroup.clearLayers();
            app.map.domLayerList();
          }
          break;
        case 'nearby':
          _appealsLayerGroup.clearLayers();
        //default:
        //  console.log('unhandled topic:', topic);
      }
    },

    addNearbyAppealsToMap: function (id) {
      for (i = 0; i < app.state.nearby.appeals.length; i++) {
        var lon = app.state.nearby.appeals[i].shape.coordinates[0];
        var lat = app.state.nearby.appeals[i].shape.coordinates[1];
        var newMarker = L.marker([lat, lon], {
          title: 'Zoning Appeal ' + app.state.nearby.appeals[i].appealkey,
          icon: blueMarker,
          name: app.state.nearby.appeals[i].appealkey,
          type: 'appealsMarker',
        });
        _appealsLayerGroup.addLayer(newMarker);
        // this might have been useless
        app.map.domLayerList();
      }
    },

    didHoverOverNearbyAppeal: function (id) {
      _map.eachLayer(function(layer){
        if (id == layer.options.name) {
          layer.setIcon(bigRedMarker);
        }
      })
    },

    didMoveOffNearbyAppeal: function (id) {
      _map.eachLayer(function(layer){
        if (id == layer.options.name) {
          layer.setIcon(blueMarker);
        }
      })
    },
  }; // end of return
})();

app.map.initMap();
