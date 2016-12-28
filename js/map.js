/* global app, L */
//localStorage.clear();
app.cyclomedia = {};
app.cyclomedia.wfsClient = new WFSClient(
	"https://atlas.cyclomedia.com/Recordings/wfs",
	"atlas:Recording",
	"EPSG:3857",
	""
);

L.Control.BaseToolTip = L.Control.extend({
	options: {
		position: 'bottomleft',
	},
	onAdd: function() {
		this._div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-load basetooltip');
		this._div.innerHTML = '<a href="#">i</a>';
		L.DomEvent.disableClickPropagation(this._div);
  	return this._div;
	},
	onMouseover: function(data) {
		$('.basetooltip').html('<div>'+data+'</div>');
		$('.basetooltip').attr('class', 'leaflet-bar leaflet-control leaflet-control-load basetooltip2')
	},
	onMouseout: function(data) {
		$('.basetooltip2').html('<a href="#">i</a>');
		$('.basetooltip2').attr('class', 'leaflet-bar leaflet-control leaflet-control-load basetooltip')
	}
});

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
			blueSvgIcon = L.divIcon.svgIcon({
					className: 'svg-icon-noClick',
					circleRatio: 0,
					fillOpacity: .5,
					iconSize: L.point(22,40),
			}),
			redSvgIcon = L.divIcon.svgIcon({
					className: 'svg-icon-noClick',
					color: 'rgb(255,30,100)',
					circleRatio: 0,
					fillColor: 'rgb(255,102,0)',
					fillOpacity: .5,
					iconSize: L.point(32,50),
			}),
			yellowSvgIcon = L.divIcon.svgIcon({
					className: 'svg-icon-noClick',
					color: 'rgb(100,255,100)',
					circleRatio: 0,
					fillColor: 'rgb(255,102,0)',
					fillOpacity: .5,
					iconSize: L.point(42,60),
			}),

      _baseLayerGroup = new L.LayerGroup(),
      _labelLayerGroup = new L.LayerGroup(),
      _overlayLayerGroup = new L.LayerGroup(),

      _nearbyActivityLayerGroup = new L.FeatureGroup(),
      // create an empty layer group for the parcel query layer
      _parcelLayerGroup = new L.LayerGroup(),
			_electionFeatureGroup = new L.FeatureGroup(),
      _cycloFeatureGroup = new L.FeatureGroup().on('click', function(){
        //console.log('clicked a member of the group');
      }),

      // create window level placeholder for _stViewHfovMarker
      _stViewMarkersLayerGroup = new L.LayerGroup(),
      _stViewHfovMarker,
      _stViewCameraMarker

  return {

		waterLegend : L.control({position: 'bottomleft'}),
		baseToolTip : new L.Control.BaseToolTip,

    //theObject: queryParcel,
		smallMarker: L.point(22,40),
		largeMarker: L.point(32,50),
		xLargeMarker: L.point(42,60),

    initMap : function () {
      app.state.map = {};
      app.state.map.clickedOnMap = false;
			localStorage.setItem('clickedOnMap', false);
      // the next 2 variables hold names for checking what is on the map
      app.state.map.nameBaseLayer;
      app.state.map.nameLabelsLayer;
			app.state.map.nameParcelLayer;
      app.state.map.namesOverLayers = [];
      // the next 2 objects hold the actual layers
      app.state.map.tileLayers = {};
      app.state.map.mapServices = {};
			app.state.map.shouldPan = true;

      //app.state.map.appealsLayerGroup = new L.LayerGroup();

      //app.state.moveMode = true
      var CITY_HALL = [39.952388, -75.163596];

      _map = L.map('map', {
         zoomControl: false,
         // measureControl: true,
      });
			// add routing fix
      _map.setView(CITY_HALL, 17);

			/*app.map.baseToolTip.onAdd = function () {
				var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-load basetooltip');
				div.innerHTML = 'i';
				//div.title = "enter tooltip here"
				return div;
			};*/
			app.map.baseToolTip.addTo(_map);
			app.state.map.waterDisclaimer = 'The property boundaries displayed on the map are for reference only and may not be used in place of recorded deeds or land surveys. Boundaries are generalized for ease of visualization. Source: Philadelphia Water'
			app.state.map.DORDisclaimer = 'The property boundaries displayed on the map are for reference only and may not be used in place of recorded deeds or land surveys. Dimension lengths are calculated using the GIS feature. Source: Department of Records.'

			$('.basetooltip').on('mouseover', function(){
				if (!app.state.activeTopic || app.state.activeTopic != 'deeds' && app.state.activeTopic != 'zoning'){
					app.map.baseToolTip.onMouseover(app.state.map.waterDisclaimer);
				} else {
					app.map.baseToolTip.onMouseover(app.state.map.DORDisclaimer);
				}
			});
			$('.basetooltip').on('mouseout', function(){
				app.map.baseToolTip.onMouseout();
			})
			/*app.map.baseToolTip.on('mouseover', function(){
				console.log('mouseover happening');
			});*/

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
        url: app.config.esri.baseMapLightUrl,
        maxZoom: 22,
        name: 'baseMapLight',
        type: 'base',
        zIndex: 1,
      });

			app.state.map.tileLayers.baseMapDORParcels = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapDORParcelsUrl,
        maxZoom: 22,
        name: 'baseMapDOR',
        type: 'base',
        zIndex: 1,
      });

      app.state.map.tileLayers.baseMapImagery2016 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery2016Url,
        maxZoom: 22,
        name: 'baseMapImagery2016',
        type: 'base',
        zIndex: 2,
      });

      app.state.map.tileLayers.baseMapImagery2015 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery2015Url,
        maxZoom: 22,
        name: 'baseMapImagery2015',
        type: 'base',
        zIndex: 3,
      });

      app.state.map.tileLayers.baseMapImagery2012 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery2012Url,
				maxZoom: 22,
        name: 'baseMapImagery2012',
        type: 'base',
        zIndex: 4,
      });

      app.state.map.tileLayers.baseMapImagery2010 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery2010Url,
        maxZoom: 22,
        name: 'baseMapImagery2010',
        type: 'base',
        zIndex: 5,
      });

      app.state.map.tileLayers.baseMapImagery2008 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery2008Url,
        maxZoom: 22,
        name: 'baseMapImagery2008',
        type: 'base',
        zIndex: 6,
      });

      app.state.map.tileLayers.baseMapImagery2004 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery2004Url,
        maxZoom: 22,
        name: 'baseMapImagery2004',
        type: 'base',
        zIndex: 7,
      });

      app.state.map.tileLayers.baseMapImagery1996 = L.esri.tiledMapLayer({
        url: app.config.esri.baseMapImagery1996Url,
        maxZoom: 22,
        name: 'baseMapImagery1996',
        type: 'base',
        zIndex: 8,
      });

      app.state.map.tileLayers.parcels = L.esri.tiledMapLayer({
        url: app.config.esri.parcelsUrl,
        maxZoom: 22,
        name: 'parcelOverlay',
        type: 'overlay',
        zIndex: 9,
      });

      // Overlays - Labels
      app.state.map.tileLayers.overlayBaseLabels = L.esri.tiledMapLayer({
        url: app.config.esri.overlayBaseLabelsUrl,
        maxZoom: 22,
        name: 'overlayBaseLabels',
        type: 'labels',
        zIndex: 100,
      });

			app.state.map.tileLayers.overlayBaseDORLabels = L.esri.tiledMapLayer({
        url: app.config.esri.overlayBaseDORLabelsUrl,
        maxZoom: 22,
        name: 'overlayBaseLabelsDOR',
        type: 'labels',
        zIndex: 100,
      });

      app.state.map.tileLayers.overlayImageryLabels = L.esri.tiledMapLayer({
        url: app.config.esri.overlayImageryLabelsUrl,
        maxZoom: 22,
        name: 'overlayImageryLabels',
        type: 'labels',
        zIndex: 101,
      })

      // Overlays - Other
      // right now this is not used
      app.state.map.tileLayers.overlayZoning = L.esri.tiledMapLayer({
        url: app.config.esri.overlayZoningUrl,
        maxZoom: 22,
        name: 'overlayZoning',
        type: 'overlay',
        zIndex: 10,
      });

      // right now this is used, and set to dynamicMapLayer instead of FeatureLayer
      app.state.map.mapServices.zoningMap = L.esri.dynamicMapLayer({
        url: app.config.esri.zoningMapUrl,
        maxZoom: 22,
        name: 'zoningMap',
        type: 'overlay',
        zIndex: 13,
      });

			app.state.map.mapServices.water = L.esri.dynamicMapLayer({
				url: app.config.esri.waterUrl,
				maxZoom: 22,
				name: 'water',
				type: 'overlay',
				zIndex: 14,
			});

			app.state.map.mapServices.politicalDivisions = L.esri.dynamicMapLayer({
				url: app.config.esri.politicalDivisionsUrl,
				maxZoom: 22,
				name: 'politicalDivisions',
				type: 'overlay',
				zIndex: 15,
			});

			app.state.map.zoningOpacitySlider = new L.Control.opacitySlider();
			//app.state.map.zoningOpacitySlider.setOpacityLayer(app.state.map.mapServices.zoningMap);
			//app.state.map.zoningOpacitySlider.setPosition('topleft');
			app.state.map.waterOpacitySlider = new L.Control.opacitySlider();
			//app.state.map.waterOpacitySlider.setOpacityLayer(app.state.map.mapServices.water);
			//app.state.map.waterOpacitySlider.setPosition('topleft');

			/*app.state.map.mapServices.waterParcels = L.esri.dynamicMapLayer({
				url: '//gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer/0',
				maxZoom: 22,
				name: 'waterParcels',
				type: 'overlay',
				zIndex: 14,
			});*/


      // Now add to map
      _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapLight);
      _baseLayerGroup.addTo(_map);
      _labelLayerGroup.addLayer(app.state.map.tileLayers.overlayBaseLabels);
      _labelLayerGroup.addTo(_map);

      // The next are not used initially
      _overlayLayerGroup.addTo(_map);
      _parcelLayerGroup.addTo(_map);
      _nearbyActivityLayerGroup.addTo(_map);
			_electionFeatureGroup.addTo(_map);
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
        if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDOR') {
          _baseLayerGroup.clearLayers();
          _labelLayerGroup.clearLayers();
          if (app.state.map.lastYearViewed) {
            _baseLayerGroup.addLayer(app.state.map.lastYearViewed);
            _baseLayerGroup.addLayer(app.state.map.tileLayers.parcels);
          } else {
            _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapImagery2016);
            _baseLayerGroup.addLayer(app.state.map.tileLayers.parcels);
          }
          _labelLayerGroup.addLayer(app.state.map.tileLayers.overlayImageryLabels);
          theEasyBar.addTo(_map);

        } else {
          _baseLayerGroup.clearLayers();
          _labelLayerGroup.clearLayers();
					if(app.state.activeTopic != 'deeds'){
	          _baseLayerGroup.addLayer(app.state.map.tileLayers.baseMapLight);
	          _labelLayerGroup.addLayer(app.state.map.tileLayers.overlayBaseLabels);
					} else {
						app.state.map.tileLayers.baseMapDORParcels.addTo(_baseLayerGroup);
						app.state.map.tileLayers.overlayBaseDORLabels.addTo(_labelLayerGroup);
					}
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
        _baseLayerGroup.addLayer(app.state.map.tileLayers.parcels);

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
						localStorage.setItem('circlesOn', false);
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
        } else if (layer.options.name && layer.options.type == 'parcel') {
					app.state.map.nameParcelLayer = layer.options.name;
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

    didSelectAddress: function () {
			console.log('did select address');

      if (app.state.dor) this.drawParcel();
			// if (app.state.activeTopic == 'elections') {
			// 	app.map.removeElectionInfo();
			// 	app.map.addElectionInfo();
			// }
    },

    didClickMap: function (e) {
      // set state
      app.state.map.clickedOnMap = true
			localStorage.setItem('clickedOnMap', true);
      app.state.map.shouldPan = false;

      // if this was a cyclomedia circle click, don't do anything
      if (app.state.map.clickedCircle) {
        // console.log('clicked a circle');
        app.state.map.clickedCircle = false;
				return;
      }

			// otherwise, it was a parcel click. get the parcel ID and query AIS.
      app.getParcelByLatLng(e.latlng, function () {
				// which parcels are being displayed?
				var activeTopic = app.state.activeTopic,
						DOR_TOPICS = ['deeds', 'zoning'],
						parcelLayer = DOR_TOPICS.indexOf(activeTopic) > -1 ? 'dor' : 'pwd',
						parcelId;

				switch (parcelLayer) {
					case 'dor':
						var parcel = app.state.dor.features[0];
						parcelId = parcel.properties.MAPREG;
						console.log('dor parcel, id:', parcelId);
						break;
					case 'pwd':
						var parcel = app.state.waterGIS.features[0];
						parcelId = parcel.properties.PARCELID;
						console.log('pwd parcel, id:', parcelId);
						break;
					default:
						console.log('unknown parcel layer:', parcelLayer)
						break;
				}

        // if this is the result of a map click, query ais for the address
        if (app.state.map.clickedOnMap) {
					// this is a little kludgy b/c technically we don't have an address,
					// but should work anyway.
          app.searchForAddress(parcelId);
          app.state.map.clickedOnMap = true; //andy changed this 11/29
        }
      });
    },

    drawParcel: function () {
			// console.log('draw parcel');

      // if there's no parcel in state, clear the map and don't render
      // TODO zoom to AIS xy
      var parcelDOR, geomDOR, center;
      try {
        parcelDOR = app.state.dor.features[0];
        if (!parcelDOR) throw 'no parcel';
        geomDOR = parcelDOR.geometry;
				//center = geom.getBounds().getCenter();
				//app.state.center = center;
      }
      catch(err) {
        console.log('draw parcel, but could not get parcel from state', err);
        // clear parcel
        _parcelLayerGroup.clearLayers();
        return;
      }

			var parcelWater = app.state.waterGIS.features[0]
			var geomWater = parcelWater.geometry;//.rings;

      var coordsDOR = app.util.flipCoords(geomDOR.coordinates),
					coordsWater = app.util.flipCoords(geomWater.coordinates),
          parcelPolyDOR = L.polygon([coordsDOR], {
            color: 'blue',
            weight: 2,
						name: 'parcelPolyDOR',
		        type: 'parcel',
          }),
					parcelPolyWater = L.polygon([coordsWater], {
						color: 'blue',
            weight: 2,
						name: 'parcelPolyWater',
		        type: 'parcel',
					}),
          parcelCentroid = parcelPolyDOR.getBounds().getCenter(),
					parcelMarker = new L.Marker.SVGMarker([parcelCentroid.lat, parcelCentroid.lng], {
						"iconOptions": {
							className: 'svg-icon-noClick',
							circleRatio: 0,
							color: 'rgb(255,30,30)',//'rgb(255,200,50)',
							fillColor: 'rgb(255,60,30)',//'rgb(255,200,50)',
							fillOpacity: 0.8,
							iconSize: app.map.largeMarker,
						},
						title: 'current parcel',
						name: 'parcelMarker',
		        type: 'parcel',
					});

			app.state.parcelPolyDOR = parcelPolyDOR;
			app.state.parcelPolyWater = parcelPolyWater;
      app.state.theParcelCentroid = parcelCentroid;
			app.state.parcelMarker = parcelMarker;
      // clear existing parcel
      _parcelLayerGroup.clearLayers();

      // pan map
      // true if search button was clicked or if page is loaded w address parameter, false if a parcel was clicked
      if (app.state.map.shouldPan) {
        // zoom to bounds of parcel poly plus some buffer
        var boundsPadded = parcelPolyDOR.getBounds().pad(1.15);
        // _map.fitBounds(bounds, {padding: ['20%', '20%']});
        _map.fitBounds(boundsPadded);
        // or need to use parcel centroid instead of center of map
        // set new state and localStorage
      };
			// calling LSinit will alert Pictometry and Cyclomedia to change
			app.map.LSinit();

      // add to map
			if (app.state.activeTopic == 'deeds') {
	      _parcelLayerGroup.addLayer(parcelPolyDOR);
			} else if (app.state.activeTopic == 'water') {
				_parcelLayerGroup.addLayer(parcelPolyWater);
			} else {
				// console.log('placing marker')
				_parcelLayerGroup.addLayer(parcelMarker);
			}
			app.map.domLayerList();

      // area method 2
      var areaRequestGeom = '[' + JSON.stringify(geomDOR).replace('"type":"Polygon","coordinates"', '"rings"') + ']';
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
			app.state.theCenter = _map.getCenter();
			app.state.leafletCenterX = app.state.theCenter.lng;
			app.state.leafletCenterY = app.state.theCenter.lat;
      if (app.state.map.clickedOnMap == true){
        app.state.leafletForCycloX = app.state.theParcelCentroid.lng;
        app.state.leafletForCycloY = app.state.theParcelCentroid.lat;
      } else {
				app.state.leafletForCycloX = app.state.theCenter.lng;
        app.state.leafletForCycloY = app.state.theCenter.lat;
      }
      app.state.theZoom = _map.getZoom();
      localStorage.setItem('theZoom', app.state.theZoom);
			localStorage.setItem('leafletCenterX', app.state.leafletCenterX);
      localStorage.setItem('leafletCenterY', app.state.leafletCenterY);
      localStorage.setItem('leafletForCycloX', app.state.leafletForCycloX);
      localStorage.setItem('leafletForCycloY', app.state.leafletForCycloY);
      localStorage.setItem('cycloCoords', [app.state.leafletForCycloX, app.state.leafletForCycloY]);
      localStorage.setItem('pictCoordsZoom', [app.state.leafletCenterX, app.state.leafletCenterY, app.state.theZoom]);
    },

    // while map is dragged, constantly reset center in localStorage
    // this will move Pictometry with it, but not Cyclomedia
    LSdrag: function() {
      app.state.theCenter = _map.getCenter();
      app.state.leafletCenterX = app.state.theCenter.lng;
      app.state.leafletCenterY = app.state.theCenter.lat;
      localStorage.setItem('leafletCenterX', app.state.leafletCenterX);
      localStorage.setItem('leafletCenterY', app.state.leafletCenterY);
      localStorage.setItem('pictCoordsZoom', [app.state.leafletCenterX, app.state.leafletCenterY, app.state.theZoom]);
    },

    // when map is finished being dragged, 1 more time reset
    // the center in localStorage
    // this will move Pictometry AND Cyclomedia
    LSdragend: function() {
      app.state.theCenter = _map.getCenter();
      app.state.leafletCenterX = app.state.theCenter.lng;
      app.state.leafletCenterY = app.state.theCenter.lat;
      localStorage.setItem('leafletCenterX', app.state.leafletCenterX);
      localStorage.setItem('leafletCenterY', app.state.leafletCenterY);
      localStorage.setItem('pictCoordsZoom', [app.state.leafletCenterX, app.state.leafletCenterY, app.state.theZoom]);
    },

    // when map is zoomed, reset zoom in localStorage
    // this will re-zoom Pictometry also
    LSzoomend: function() {
      app.state.theZoom = _map.getZoom();
      localStorage.setItem('theZoom', app.state.theZoom);
      localStorage.setItem('pictCoordsZoom', [app.state.leafletCenterX, app.state.leafletCenterY, app.state.theZoom]);
    },

    LSmoveend: function() {
      app.state.theCenter = _map.getCenter();
      app.state.leafletCenterX = app.state.theCenter.lng;
      app.state.leafletCenterY = app.state.theCenter.lat;
      localStorage.setItem('leafletCenterX', app.state.leafletCenterX);
      localStorage.setItem('leafletCenterY', app.state.leafletCenterY);
      localStorage.setItem('pictCoordsZoom', [app.state.leafletCenterX, app.state.leafletCenterY, app.state.theZoom]);
    },

    LSretrieve: function(){
      app.state.stViewX = localStorage.getItem('stViewX');
      app.state.stViewY = localStorage.getItem('stViewY');
      app.state.stViewYaw = localStorage.getItem('stViewYaw');
      app.state.stViewHfov = localStorage.getItem('stViewHfov');
      app.state.stViewConeCoords = app.map.calculateConeCoords();
    },

		LSclickedCircle: function(lat, lng){
			app.state.leafletForCycloX = lng;
			app.state.leafletForCycloY = lat;
			localStorage.setItem('leafletForCycloX', lng);
			localStorage.setItem('leafletForCycloY', lat);
			localStorage.setItem('cycloCoords', [lat, lng]);
		},

		LSdraggedMarker: function(lat, lng){
			app.state.leafletForCycloX = lng;
			app.state.leafletForCycloY = lat;
			localStorage.setItem('leafletForCycloX', lng);
			localStorage.setItem('leafletForCycloY', lat);
			localStorage.setItem('cycloCoords', [lat, lng]);
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
        rotationAngle: app.state.stViewYaw,
				draggable: true
      }).on('click', function(){
				console.log('clicked camera');
			}).on('dragend', function(data){
				app.state.dragdata = data;
				app.state.draggedX = data.target._latlng.lng;
				app.state.draggedY = data.target._latlng.lat;
				app.map.LSdraggedMarker(app.state.draggedY, app.state.draggedX);
			});
      _stViewCameraMarker.addTo(_stViewMarkersLayerGroup);
      _stViewHfovMarker.addTo(_stViewMarkersLayerGroup);
    },

    didChangeTopic: function (prevTopic, nextTopic) {
      // console.log('did change topic', prevTopic, '=>', nextTopic);

      if (prevTopic) {
        app.map.didDeactivateTopic(prevTopic);
      }

      if (nextTopic) {
        app.map.didActivateTopic(nextTopic);
      }

			localStorage.setItem('previousTopic', prevTopic);
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
					if (app.state.map.nameBaseLayer == 'baseMapLight') {
	          _baseLayerGroup.clearLayers();
						_labelLayerGroup.clearLayers();
						app.state.map.tileLayers.baseMapDORParcels.addTo(_baseLayerGroup);
						app.state.map.tileLayers.overlayBaseDORLabels.addTo(_labelLayerGroup);
					}
					app.map.domLayerList();
					app.map.toggleParcelMarker();
          break;
        case 'zoning':
					if (app.state.map.nameBaseLayer == 'baseMapLight') {
						_baseLayerGroup.clearLayers();
						_labelLayerGroup.clearLayers();
						app.state.map.tileLayers.baseMapDORParcels.addTo(_baseLayerGroup);
						app.state.map.tileLayers.overlayBaseDORLabels.addTo(_labelLayerGroup);
					}
          _overlayLayerGroup.addLayer(app.state.map.mapServices.zoningMap);
          // add name "zoningMap" to the DOM list
          app.map.domLayerList();
					app.map.toggleParcelMarker();
					app.map.addOpacitySlider('zoning', app.state.map.mapServices.zoningMap);
          break;
        case 'nearby':
					console.log('running addNearbyActivity from map.js')
          app.map.addNearbyActivity();
					app.map.toggleParcelMarker();
					break;
				case 'water':
					_overlayLayerGroup.addLayer(app.state.map.mapServices.water);
					app.map.domLayerList();
					app.map.toggleParcelMarker();
					app.map.addOpacitySlider('water', app.state.map.mapServices.water);
					app.map.waterLegend.onAdd = function () {
						var div = L.DomUtil.create('div', 'info legend'),
							grades = ['#FEFF7F', '#F2DCFF'],
							labels = ['Roof', 'Other Impervious Surface'];
						for (var i = 0; i < 2; i++) {
							div.innerHTML += '<i style="background:' + grades[i] + '"></i> ' + labels[i] + '<br>'
						}
						return div;
					};
					app.map.waterLegend.addTo(_map);
					break;
				case 'elections':
					app.map.addElectionInfo();
					app.map.toggleParcelMarker();
        default:
          // console.log('unhandled topic:', topic);
      }
			//app.map.toggleParcelMarker();
    },

    didDeactivateTopic: function (topic) {
      localStorage.setItem('activeTopic', null);
      // console.log('didDeactivateTopic', topic, localStorage);

      switch (topic) {
        case 'deeds':
					if (app.state.map.nameBaseLayer == 'baseMapDOR') {
						_baseLayerGroup.clearLayers();
						_labelLayerGroup.clearLayers();
						app.state.map.tileLayers.baseMapLight.addTo(_baseLayerGroup);
						app.state.map.tileLayers.overlayBaseLabels.addTo(_labelLayerGroup);
					}
					app.map.domLayerList();
					app.map.toggleParcelMarker();
          break;
        case 'zoning':
					if (app.state.map.nameBaseLayer == 'baseMapDOR') {
						_baseLayerGroup.clearLayers();
						_labelLayerGroup.clearLayers();
						app.state.map.tileLayers.baseMapLight.addTo(_baseLayerGroup);
						app.state.map.tileLayers.overlayBaseLabels.addTo(_labelLayerGroup);
					}
          if (app.state.map.namesOverLayers.includes('zoningMap')){
            _overlayLayerGroup.clearLayers();
            app.map.domLayerList();
						app.map.toggleParcelMarker();
						app.map.removeOpacitySlider('zoning');
          }
          break;
        case 'nearby':
          _nearbyActivityLayerGroup.clearLayers();
					break;
				case 'water':
					if (app.state.map.namesOverLayers.includes('water')){
						_overlayLayerGroup.clearLayers();
						app.map.domLayerList();
						app.map.toggleParcelMarker();
						app.map.removeOpacitySlider('water');
						app.map.waterLegend.remove();
					}
					break;
				case 'elections':
				_electionFeatureGroup.clearLayers();
				if (app.state.activeTopic != 'nearby') {
					var boundsPadded = app.state.parcelPolyDOR.getBounds().pad(1.15);
					_map.fitBounds(boundsPadded);
				}
				app.map.domLayerList();
				app.map.toggleParcelMarker();
					break;
        //default:
        //  console.log('unhandled topic:', topic);
      }
			//console.log('deactivated a topic - running toggleParcelMarker');
			//app.map.toggleParcelMarker();
    },

		toggleParcelMarker: function() {
			if (app.state.map.nameParcelLayer == 'parcelMarker') {
				if (app.state.activeTopic == 'deeds') {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.parcelPolyDOR);
				} else if (app.state.activeTopic == 'water') {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.parcelPolyWater);
				}
			}
			if (app.state.map.nameParcelLayer == 'parcelPolyDOR') {
				//console.log(app.state.activeTopic);
				//console.log(app.state.map.nameParcelLayer);
				if (app.state.activeTopic == 'water') {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.parcelPolyWater);
				} else if (app.state.activeTopic != 'deeds' || app.state.activeTopic === null) {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.parcelMarker);
				}
			}
			if (app.state.map.nameParcelLayer == 'parcelPolyWater') {
				//console.log(app.state.activeTopic);
				//console.log(app.state.map.nameParcelLayer);
				if (app.state.activeTopic == 'deeds') {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.parcelPolyDOR);
				} else if (app.state.activeTopic != 'water' || app.state.activeTopic === null) {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.parcelMarker);
				}
			}
		},

		removeElectionInfo: function () {
			_electionFeatureGroup.clearLayers();
			var boundsPadded = app.state.parcelPolyDOR.getBounds().pad(1.15);
			_map.fitBounds(boundsPadded);
			app.map.domLayerList();
		},

		removeNearbyActivity: function () {
			_nearbyActivityLayerGroup.clearLayers();
    },

    // addNearbyAppealsToMap: function (id) {
    //   for (i = 0; i < app.state.nearby.appeals.length; i++) {
    //     var lon = app.state.nearby.appeals[i].shape.coordinates[0];
    //     var lat = app.state.nearby.appeals[i].shape.coordinates[1];
    //     var newMarker = L.marker([lat, lon], {
    //       title: 'Zoning Appeal ' + app.state.nearby.appeals[i].appealkey,
    //       icon: blueMarker,
    //       name: app.state.nearby.appeals[i].appealkey,
    //       type: 'appealsMarker',
    //     });
    //     _nearbyActivityLayerGroup.addLayer(newMarker);
    //     // this might have been useless
    //     app.map.domLayerList();
    //   }
    // },

		addElectionInfo: function() {
			_electionFeatureGroup.clearLayers();

			console.log('addElectionInfo was called');

			var ward = app.state.elections.features[0].attributes.ward,
					division = app.state.elections.features[0].attributes.division;
			$.ajax({
        url: app.config.esri.divisionLayerUrl + '/query',
        data: {
          where: "DIVISION_NUM = '" + ward.concat(division)+"'",
          outSR: 4326,
          outFields: '*',
          f: 'json',
        },
        success: function (data) {
          // AGO returns json with plaintext headers, so parse

          data = JSON.parse(data);
					app.state.elections.geoCoords = data.features[0].geometry.rings;
					var coords = app.util.flipCoords(app.state.elections.geoCoords)
					//app.state.elections.coords = coords;
					var DivisionPoly = L.polygon(coords, {
						color: 'red',
						weight: 2,
						title: 'Ward ' + ward + ' Division ' + division,
					});
					_electionFeatureGroup.addLayer(DivisionPoly);
					var location = app.state.elections.features[0].attributes.location,
						lat = app.state.elections.features[0].attributes.lat,
						lon = app.state.elections.features[0].attributes.lng,
						newMarker = new L.Marker.SVGMarker([lat, lon], {
							"iconOptions": {
								className: 'svg-icon-noClick',
								circleRatio: 0,
								color: 'rgb(0,102,255)',
								fillColor: 'rgb(0,102,255)',
								fillOpacity: 0.5,
								iconSize: app.map.smallMarker,
							},
							title: location
						});
					_electionFeatureGroup.addLayer(newMarker);
					_map.fitBounds(_electionFeatureGroup.getBounds());
					app.map.domLayerList();
				}
			});
		},

		addNearbyActivity: function (rows) {
			// if no rows were passed in, get them from state
			if (!rows) {
					app.state.map.nearbyActivity = app.state.map.nearbyActivity || {};
					app.state.map.nearbyActivity.data = app.state.nearby.rowsSorted || {};
					rows = app.state.map.nearbyActivity.data;
			} else {
				app.state.map.nearbyActivity.data = rows;
			}

			// TODO clear existing
			this.removeNearbyActivity();

			_.forEach(rows, function (row) {
				var lon = row.shape.coordinates[0],
						lat = row.shape.coordinates[1],
						newMarker = new L.Marker.SVGMarker([lat, lon], {
							"iconOptions": {
								className: 'svg-icon-noClick',
								circleRatio: 0,
								color: 'rgb(0,102,255)',
								fillColor: 'rgb(0,102,255)',
								fillOpacity: 0.5,
								iconSize: app.map.smallMarker,
							},
							title: 'TODO',
							// custom attr to link with data rows
							rowId: row.id,
						}).on('click', 	function () {
							// console.log('clicked a marker');
						}).on('mouseover', function () {
							// this part is for scrolling to the row
							check(row.id);
							//var tp = $('#topic-panel');
							//var theRow = $('[data-id ='+row.id+']')
							//theRow.get(0).scrollIntoView();
							/*if (theRow.length){
								//tp.scrollTop(theRow.offset().top - (tp.height()/2));
								tp.scrollTop(theRow.offset().top - theRow.offset().top/5);
							}*/
							newMarker.setStyle({
								"iconOptions": {
									color: 'rgb(243, 198, 19)',//'rgb(255,30,100)',
									fillColor: 'rgb(243, 198, 19)',//'rgb(255,102,0)',
									iconSize: app.map.largeMarker,
									iconAnchor: [app.map.largeMarker.x/2, app.map.largeMarker.y],
				        }
							});
							// $('[data-id =' + row.id + ']').css('background', '#F3D661');
							$('[data-id =' + row.id + ']').trigger('mouseenter');
						}).on('mouseout', function(){
							newMarker.setStyle({
								"iconOptions": {
									color: 'rgb(0,102,255)',
									fillColor: 'rgb(0,102,255)',
									iconSize: app.map.smallMarker,
									iconAnchor: [app.map.smallMarker.x/2, app.map.smallMarker.y],
				        }
							})
							// $('[data-id ='+row.id+']').css('background', '');
							$('[data-id =' + row.id + ']').trigger('mouseout');
						});
				_nearbyActivityLayerGroup.addLayer(newMarker);
			});
			//app.state.map.bounds = _map.getBounds();
			//app.state.map.activitybounds = _nearbyActivityLayerGroup.getBounds();
			if (_map.getBounds().contains(_nearbyActivityLayerGroup.getBounds())) {
				console.log('map bounds contain nearby activity bounds');
			} else {
				console.log('map bounds do not contain activity bounds');
				_map.fitBounds(_nearbyActivityLayerGroup.getBounds());
				//_map.panInsideBounds(_nearbyActivityLayerGroup.getBounds());
			}
			app.map.domLayerList();
		},

    // didHoverOverNearbyAppeal: function (id) {
    //   _map.eachLayer(function(layer){
    //     if (id == layer.options.name) {
    //       layer.setIcon(bigRedMarker);
    //     }
    //   })
    // },

		// didHoverOverNearbyActivityRow: function (id) {
			// _map.eachLayer(function(layer){
			// 	if (id == layer.options.name) {
			// 		layer.setIcon(bigRedMarker);
			// 	}
			// })
		// },

		didMouseOverNearbyActivityRow: function (id) {
			var markerlatlng
			_nearbyActivityLayerGroup.eachLayer(function (layer) {
				// make sure it's a nearby marker
				var layerRowId = layer.options.rowId;
				if (!layerRowId) console.log('layerRowId not found');

				if (id == layerRowId) {
					markerlatlng = layer._latlng
					layer.setStyle({
						"iconOptions": {
							color: 'rgb(243, 198, 19)',
							fillColor: 'rgb(243, 198, 19)',
							iconSize: app.map.largeMarker,
							iconAnchor: [app.map.largeMarker.x/2, app.map.largeMarker.y],
		        }
					});
				}
			}) // end of loop
		},

		didMouseOffNearbyActivityRow: function (id) {
			var markerlatlng;
			_nearbyActivityLayerGroup.eachLayer(function (layer) {
				// make sure it's a nearby marker
				var layerRowId = layer.options.rowId;
				if (!layerRowId) console.log('layerRowId not found');

				if (id == layerRowId) {
					markerlatlng = layer._latlng
					layer.setStyle({
						"iconOptions": {
							color: 'rgb(0,102,255)',
							fillColor: 'rgb(0,102,255)',
							iconSize: app.map.smallMarker,
							iconAnchor: [app.map.smallMarker.x/2, app.map.smallMarker.y],
						}
					});
				}
      }) // end of loop
		},

    // didMoveOffNearbyAppeal: function (id) {
    //   _map.eachLayer(function(layer){
    //     if (id == layer.options.name) {
    //       layer.setIcon(blueMarker);
    //     }
    //   })
    // },

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
          }).on('click', function(coord){
            console.log('circle click happened ', coord.latlng.lat, ' ', coord.latlng.lng);
            app.state.map.clickedCircle = true;
						app.map.LSclickedCircle(coord.latlng.lat, coord.latlng.lng);
          });
          //blueCircle.on({click: console.log('clicked a circle')});
          blueCircle.addTo(_cycloFeatureGroup);
        }
        _cycloFeatureGroup.bringToFront();
      }
			// set "circles on" in localStorage
			localStorage.setItem('circlesOn', true);
    },

		addOpacitySlider: function(topic, opacityLayer) {
			//app.state.map.opacitySlider = new L.Control.opacitySlider();
			switch (topic) {
        case 'zoning':
					_map.addControl(app.state.map.zoningOpacitySlider);
					app.state.map.zoningOpacitySlider.setOpacityLayer(opacityLayer);
					app.state.map.zoningOpacity = opacityLayer.options.opacity;
					app.state.map.zoningOpacitySlider.setPosition('topleft');
					$('.ui-slider-range').attr('style', 'height: '+opacityLayer.options.opacity*100+'%');
					$('.ui-slider-handle').attr('style', 'bottom: '+opacityLayer.options.opacity*100+'%');
					break;
				case 'water':
					_map.addControl(app.state.map.waterOpacitySlider);
					app.state.map.waterOpacitySlider.setOpacityLayer(opacityLayer);
					app.state.map.waterOpacity = opacityLayer.options.opacity;
					app.state.map.waterOpacitySlider.setPosition('topleft');
					$('.ui-slider-range').attr('style', 'height: '+opacityLayer.options.opacity*100+'%');
					$('.ui-slider-handle').attr('style', 'bottom: '+opacityLayer.options.opacity*100+'%');
					break;
			};
			//opacityLayer.setOpacityLayer(1.0);
		},

		removeOpacitySlider: function(topic) {
			switch (topic) {
        case 'zoning':
					_map.removeControl(app.state.map.zoningOpacitySlider);
					break;
				case 'water':
					_map.removeControl(app.state.map.waterOpacitySlider);
					break;
			};
		},

		toggleBaseToolTip: function(topic) {
			console.log('toggleBaseToolTip is starting');
		}

  }; // end of return
})();

app.map.initMap();
