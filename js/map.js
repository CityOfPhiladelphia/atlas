/* global app, L */

app.cyclomedia = {};
app.cyclomedia.wfsClient = new WFSClient(
	"https://atlas.cyclomedia.com/Recordings/wfs",
	"atlas:Recording",
	"EPSG:3857",
	""
);

app.map = (function ()
{
  // the leaflet map object
  var _map,

      /*yellowArrow = L.icon({
        iconUrl: 'css/images/yellowArrow.png',
        //iconSize: [38,95],
        //iconAnchor: [22.94]
      }),
      viewcone = L.icon({
        iconUrl: 'css/images/viewcone.png',
        iconSize: [40,40],
        iconAnchor: [20, 30],
      }),*/
      camera = L.icon({
        iconUrl: 'css/images/camera_04.png',
        iconSize: [26, 16],
        iconAnchor: [11,  8],
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
      _cycloFeatureGroup = new L.FeatureGroup().on('click', function(){
        console.log('clicked a member of the group');
      }),

      // create window level placeholder for _stViewHfovMarker
      _stViewMarkersLayerGroup = new L.LayerGroup(),
      _stViewHfovMarker,
      _stViewCameraMarker
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

      //app.state.map.appealsLayerGroup = new L.LayerGroup();

      //app.state.moveMode = true
      var CITY_HALL = [39.952388, -75.163596];

      _map = L.map('map', {
         zoomControl: false,
         // measureControl: true,
      });
      _map.setView(CITY_HALL, 17);

      // make measure control
      var measureControl = new L.Control.Measure({
        primaryLengthUnit: 'feet',
        // secondaryLengthUnit: 'miles',
        primaryAreaUnit: 'sqfeet',
        // secondaryAreaUnit: 'sqmiles',
      });
      measureControl.addTo(_map);

      // Basemaps
      app.state.map.tileLayers.baseMapLight = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer",
        maxZoom: 22,
        name: 'baseMapLight',
        type: 'base',
        zIndex: 1,
      });

      app.state.map.tileLayers.baseMapImagery2016 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer",
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
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2004_6in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery2004',
        type: 'base',
        zIndex: 7,
      });

      app.state.map.tileLayers.baseMapImagery1996 = L.esri.tiledMapLayer({
        url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_1996_6in/MapServer",
        maxZoom: 22,
        name: 'baseMapImagery1996',
        type: 'base',
        zIndex: 8,
      });

      app.state.map.tileLayers.Parcels = L.esri.tiledMapLayer({
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ParcleTile/MapServer',
        maxZoom: 22,
        name: 'parcelOverlay',
        type: 'overlay',
        zIndex: 9,
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

      // The next 4 are not used initially
      _overlayLayerGroup.addTo(_map);
      _parcelLayerGroup.addTo(_map);
      _appealsLayerGroup.addTo(_map);
      _cycloFeatureGroup.addTo(_map);
      _stViewMarkersLayerGroup.addTo(_map);

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
            }
          }, {
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">2016</strong>',
            title: 'Show 2016 Imagery',
            onClick: function(control) {
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
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2015);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2015;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2015</strong>',
            title: 'Show 2015 Imagery',
            onClick: function(control) {
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
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2012);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2012;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2012</strong>',
            title: 'Show 2012 Imagery',
            onClick: function(control) {
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
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2010);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2010;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2010</strong>',
            title: 'Show 2010 Imagery',
            onClick: function(control) {
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
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2008);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2008;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2008</strong>',
            title: 'Show 2008 Imagery',
            onClick: function(control) {
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
              toggleYear(control, app.state.map.tileLayers.baseMapImagery2004);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery2004;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">2004</strong>',
            title: 'Show 2004 Imagery',
            onClick: function(control) {
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
              toggleYear(control, app.state.map.tileLayers.baseMapImagery1996);
              app.state.map.lastYearViewed = app.state.map.tileLayers.baseMapImagery1996;
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong class="aDate">1996</strong>',
            title: 'Show 1996 Imagery',
            onClick: function(control) {
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
            _baseLayerGroup.addLayer(app.state.map.tileLayers.Parcels);
          } else {
            _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapImagery2016);
            _baseLayerGroup.addLayer(app.state.map.tileLayers.Parcels);
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
        _baseLayerGroup.addLayer(requestedLayer);
        _baseLayerGroup.addLayer(app.state.map.tileLayers.Parcels);

        // highlight current button
        control.state('dateSelected');
        app.map.domLayerList();

      };

      // set map state and localStorage on init, drag, dragend, and zoom
      app.map.LSinit();

      // listen for map events
      _map.on('click', app.map.didClickMap);
      _map.on('drag', app.map.LSdrag);
      _map.on('dragend', app.map.LSdragend);
      _map.on('zoomend', app.map.LSzoomend);
      _map.on('moveend', function(){
        app.map.LSmoveend();
        if (localStorage.stViewOpen == 'true') {
          app.map.prepareCycloBbox();
        };
      });

      // when map refreshes, if there is already a cyclomedia tab open, place the marker
      if (localStorage.stViewOpen == 'true') {
        app.map.LSretrieve();
        console.log('map refreshing triggered drawStViewMarkers');
        app.map.drawStViewMarkers();
        app.map.prepareCycloBbox();
      }

      // watch localStorage for changes to:
      //1. stViewOpen, 2. stViewCoords, 3. stViewYaw 4. stViewHfov
      // there is a problem, in that when it reopens all of these things trigger it to redraw
      $(window).bind('storage', function (e) {
        // if Cyclomedia window closes, remove marker
        if (e.originalEvent.key == 'stViewOpen' && e.originalEvent.newValue == 'false') {
            _stViewMarkersLayerGroup.clearLayers();
            _cycloFeatureGroup.clearLayers();
        };
        if (e.originalEvent.key == 'stViewOpen' && e.originalEvent.newValue == 'true') {
          app.map.LSretrieve();
          console.log('change to stViewOpen triggered drawStViewMarkers');
          // this happens too quickly, or shouldn't happen if it already has been open, because you get
          // a marker right away that is wrong, and then it slowly moves to the right place.
          // need to set some kind of deferred...
          app.map.drawStViewMarkers();
          app.map.prepareCycloBbox();
        };
        if (e.originalEvent.key == 'stViewCoords'){
          app.state.stViewX = localStorage.getItem('stViewX');
          app.state.stViewY = localStorage.getItem('stViewY');
          _stViewMarkersLayerGroup.clearLayers();
          console.log('change to stViewCoords triggered drawStViewMarkers');
          app.map.drawStViewMarkers();
        };
        if (e.originalEvent.key == 'stViewYaw'){
          app.state.stViewYaw = localStorage.getItem('stViewYaw');
            _stViewMarkersLayerGroup.clearLayers();
          console.log('change to stViewYaw triggered drawStViewMarkers');
          app.map.drawStViewMarkers();
        };
        if (e.originalEvent.key == 'stViewHfov'){
          app.state.stViewHfov = localStorage.getItem('stViewHfov');
            _stViewMarkersLayerGroup.clearLayers();
          app.state.stViewConeCoords = app.map.calculateConeCoords();
          console.log('change to stViewHfov triggered drawStViewMarkers');
          app.map.drawStViewMarkers();
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
      if (app.state.dor) this.drawParcel();
    },

    didClickMap: function (e) {
      // set state
      app.state.map.clickedOnMap = true
      app.state.map.shouldPan = false;

      // query parcel layer
      // var parcelQuery = L.esri.query({url: app.config.parcelLayerUrl});
      // parcelQuery.contains(e.latlng)
      // parcelQuery.run(app.didGetParcelQueryResult);
      if (app.state.map.clickedCircle){
        console.log('clicked a circle');
        app.state.map.clickedCircle = false;
      } else {

      app.getParcelByLatLng(e.latlng, function () {
        var parcel = app.state.dor.features[0],
            parcelAddress = app.util.concatDorAddress(parcel);

        // if the parcel address is null or falsy, don't proceed
        var parcelHouseNumber = app.util.cleanDorAttribute(parcel.properties.HOUSE);
        if (!parcelAddress || parcelAddress.length === 0 || !parcelHouseNumber) {
          console.log('no parcel address', parcel);
          // show error
          $noParcelAddressModal = $('#no-parcel-address-modal');
          $noParcelAddressModal.find('#parcel-id').text(parcelAddress || '<empty>');
          $noParcelAddressModal.foundation('open');
          return;
        }

        // if this is the result of a map click, query ais for the address
        if (app.state.map.clickedOnMap) {
          app.searchForAddress(parcelAddress);
          app.state.map.clickedOnMap = false;
        }

        // render parcel
        // disabling this so we only draw the parcel after we get an ais result
        // app.map.drawParcel();
      });
    }
    },

    drawParcel: function () {
      // if there's no parcel in state, clear the map and don't render
      // TODO zoom to AIS xy
      var parcel, geom;
      try {
        parcel = app.state.dor.features[0];
        if (!parcel) throw 'no parcel';
        geom = parcel.geometry;
      }
      catch(err) {
        console.log('draw parcel, but could not get parcel from state', err);
        // clear parcel
        _parcelLayerGroup.clearLayers();
        return;
      }

      var coords = app.util.flipCoords(geom.coordinates),
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
      if (app.state.map.shouldPan) {
        // zoom to bounds of parcel poly plus some buffer
        var boundsPadded = parcelPoly.getBounds().pad(1.15);
        // _map.fitBounds(bounds, {padding: ['20%', '20%']});
        _map.fitBounds(boundsPadded);
        // or need to use parcel centroid instead of center of map
        // set new state and localStorage
        app.map.LSinit();
      };
      // add to map
      _parcelLayerGroup.addLayer(parcelPoly);

      // area method 2
      var areaRequestGeom = '[' + JSON.stringify(geom).replace('"type":"Polygon","coordinates"', '"rings"') + ']';
      $.ajax({
        url: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/areasAndLengths',
        data: {
          polygons: areaRequestGeom,
          sr: 4326,
          calculationType: 'geodesic',
          f: 'json',
          areaUnit: '{"areaUnit" : "esriSquareFeet"}',
          lengthUnit: 9002,
        },
        success: function (dataString) {
          // console.log('got polygon with area', dataString, this.url);
          var data = JSON.parse(dataString),
              area = Math.round(data.areas[0]),
              perimeter = Math.round(data.lengths[0]);
          $('#deeds-area').text(area + ' sq ft');
          $('#deeds-perimeter').text(perimeter + ' ft');
        },
        error: function (err) {
          console.log('polygon area error', err);
        },
      });
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

    LSmoveend: function() {
      app.state.theCenter = _map.getCenter();
      app.state.theX = app.state.theCenter.lng;
      app.state.theY = app.state.theCenter.lat;
      localStorage.setItem('theX', app.state.theX);
      localStorage.setItem('theY', app.state.theY);
      localStorage.setItem('pictCoordsZoom', [app.state.theX, app.state.theY, app.state.theZoom]);
    },

    LSretrieve: function(){
      app.state.stViewX = localStorage.getItem('stViewX');
      app.state.stViewY = localStorage.getItem('stViewY');
      app.state.stViewYaw = localStorage.getItem('stViewYaw');
      app.state.stViewHfov = localStorage.getItem('stViewHfov');
      app.state.stViewConeCoords = app.map.calculateConeCoords();
    },

    drawStViewMarkers: function(){
      //console.log('about to create _stViewHfovMarker');
      _stViewHfovMarker = L.marker([app.state.stViewY, app.state.stViewX], {
        icon: new L.divIcon.svgIcon.triangleIcon({
          iconSize: L.point(app.state.stViewConeCoords[0], app.state.stViewConeCoords[1]),
          iconAnchor: [app.state.stViewConeCoords[0]/2, app.state.stViewConeCoords[1]],
        }),
        rotationAngle: app.state.stViewYaw,
      }).on('click', 	function(){
				console.log('clicked triangle marker');
			});
      //console.log('about to create _stViewCameraMarker');
      _stViewCameraMarker = L.marker([app.state.stViewY, app.state.stViewX], {
        icon: camera,
        rotationAngle: app.state.stViewYaw
      }).on('click', function(){
				console.log('clicked camera');
			});
      _stViewCameraMarker.addTo(_stViewMarkersLayerGroup);
      _stViewHfovMarker.addTo(_stViewMarkersLayerGroup);
    },

    didChangeTopic: function (prevTopic, nextTopic) {
      // console.log('did change topic', prevTopic, '=>', nextTopic);

      if (prevTopic) {
        app.map.didDisactivateTopic(prevTopic);
      }

      if (nextTopic) {
        app.map.didActivateTopic(nextTopic);
      }

      localStorage.setItem('activeTopic', nextTopic);
    },

    // called when the active topic in the topic panel changes
    didActivateTopic: function (topic) {
      // console.log('did activate topic', topic);

      // save to localstorage for pictometry viewer
      // localStorage.setItem('activeTopic', topic);

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
					app.map.addOpacitySlider(app.state.map.mapServices.ZoningMap);
          break;
        case 'nearby':
          console.log('didActivateTopic for case "nearby"')
          app.map.addNearbyAppealsToMap();
        default:
          // console.log('unhandled topic:', topic);
      }
    },

    didDisactivateTopic: function (topic) {
      localStorage.setItem('activeTopic', null);
      // console.log('didDisactivateTopic', topic, localStorage);

      switch (topic) {
        case 'deeds':
          // code here
          break;
        case 'zoning':
          console.log('didDisactivateTopic ran for case "zoning"')
          if (app.state.map.namesOverLayers.includes('zoningMap')){
            _overlayLayerGroup.clearLayers();
            app.map.domLayerList();
						app.map.removeOpacitySlider();
          }
          break;
        case 'nearby':
          console.log('didDisactivateTopic ran for case "nearby"')
          _appealsLayerGroup.clearLayers();
        //default:
        //  console.log('unhandled topic:', topic);
      }
    },

    removeNearbyAppeals: function () {
      _appealsLayerGroup.clearLayers();
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

    calculateConeCoords: function(options) {
      var hFov = app.state.stViewHfov;
      var scale = 50//options.scale;
      var angle = hFov / 2.0;
      var width = Math.sin(angle*Math.PI/180);
      var length = Math.sqrt(1.0 - width * width);
      return [width*scale, length*scale];
    },

    prepareCycloBbox: function(evt){
      var view = _map.getBounds();
      var zoomLevel = _map.getZoom();
      if (zoomLevel < 19) {
        _cycloFeatureGroup.clearLayers();
      };
      if (zoomLevel > 18) {
        var newSWCoord = proj4('EPSG:3857', [view._southWest.lng, view._southWest.lat]);
        var newNECoord = proj4('EPSG:3857', [view._northEast.lng, view._northEast.lat]);
        app.cyclomedia.wfsClient.loadBbox(newSWCoord[0], newSWCoord[1], newNECoord[0], newNECoord[1], app.map.addCycloCircles, app.config.cyclomedia.username, app.config.cyclomedia.password);
      }
    },

    addCycloCircles: function() {
      _cycloFeatureGroup.clearLayers();
      app.cyclomedia.recordings = app.cyclomedia.wfsClient.recordingList;
      if (app.cyclomedia.recordings.length > 0) {
        var b = [];
        for (i=0; i < app.cyclomedia.recordings.length; i++) {
          var rec = app.cyclomedia.recordings[i];
          var coordRaw = [rec.lon, rec.lat];
          var coordNotFlipped = proj4('EPSG:3857', 'EPSG:4326', coordRaw);
          var coord = [coordNotFlipped[1], coordNotFlipped[0]];
          var blueCircle = new L.circle(coord, 1.2, {
            color: '#3388ff',
            weight: 1,
          }).on('click', function(){
            console.log('circle click happened')
            app.state.map.clickedCircle = true;
          });
          //blueCircle.on({click: console.log('clicked a circle')});
          blueCircle.addTo(_cycloFeatureGroup);
        }
        _cycloFeatureGroup.bringToFront();
      }
    },

		addOpacitySlider: function(opacityLayer) {
			app.state.map.opacitySlider = new L.Control.opacitySlider();
			_map.addControl(app.state.map.opacitySlider);
			app.state.map.opacitySlider.setOpacityLayer(opacityLayer);
			app.state.map.opacitySlider.setPosition('topleft');
			//opacityLayer.setOpacityLayer(1.0);
		},

		removeOpacitySlider: function() {
			_map.removeControl(app.state.map.opacitySlider);
		}

  }; // end of return
})();

app.map.initMap();
