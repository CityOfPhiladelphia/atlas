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
			//_markerLayerGroup = new L.LayerGroup(),

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
      app.state.map = {
				addressMarkers: {},
			};
			// app.state.map.opacity = {
			// 	zoning: 1.0,
			// 	water: 1.0,
			// 	regmap: 0.5
			// };
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
        name: 'baseMapDORParcels',
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
      // app.state.map.tileLayers.overlayZoning = L.esri.tiledMapLayer({
      //   url: app.config.esri.overlayZoningUrl,
      //   maxZoom: 22,
      //   name: 'overlayZoning',
      //   type: 'overlay',
      //   zIndex: 10,
      // });

      // right now this is used, and set to dynamicMapLayer instead of FeatureLayer
      app.state.map.mapServices.zoning = L.esri.dynamicMapLayer({
        url: app.config.esri.zoningMapUrl,
        maxZoom: 22,
        name: 'zoning',
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

			// make opacity sliders
			app.state.map.opacitySliders = {};
			var opacitySliders = _.forEach(app.config.map.opacitySliders, function (options, layerName) {
				// add the layer name to options
				options.layerName = layerName;

				var slider = new L.Control.opacitySlider(options);

				app.state.map.opacitySliders[layerName] = slider;
			});

			//app.state.map.zoningOpacitySlider.setOpacityLayer(app.state.map.mapServices.zoningMap);
			//app.state.map.zoningOpacitySlider.setPosition('topleft');

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
			//_markerLayerGroup.addTo(_map);
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
						if (app.state.map.nameBaseLayer != 'baseMapLight' && app.state.map.nameBaseLayer != 'baseMapDORParcels') {
							console.log('toggling button to basemap');
	            control.state('toggletoBasemap');
	          }
					}
        }, {
          stateName: 'toggletoBasemap',
          icon:      '<img src="css/images/basemap_small.png">',
          title:     'Toggle To Basemap',
          onClick: function(control) {
            toggleBasemap();
						if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
							console.log('toggling button to imagery');
							control.state('toggleToImagery');
						}
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
        if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
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
			//console.log('initMap is calling LSinit');
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

    // didSelectAddress: function () {
		// 	console.log('did select address is calling createAddressMarkers');
		// 	this.createAddressMarkers();
		//
    //   //if (app.state.dor) this.drawParcel();
		// 	// if (app.state.activeTopic == 'elections') {
		// 	// 	app.map.removeElectionInfo();
		// 	// 	app.map.addElectionInfo();
		// 	// }
    // },

		didCreateAddressMarker: function (markerType) {
			// console.log('did create address marker', markerType);

			var targetMarkerType = this.addressMarkerTypeForTopic(app.state.activeTopic);
			if (markerType === targetMarkerType) {
				// console.log('this is the marker we want to show')
				this.showAddressMarker(markerType);
			}
			// else if (app.state.map.addressMarkers.aisMarker) {
			// 	this.showAddressMarker('aisMarker');
			// }
		},

		didGetAisResult: function () {
			console.log('MAP: did get ais result');

			// clear out old address markers
			app.state.map.addressMarkers = {};

			var aisGeom = app.state.ais.feature.geometry;
			if (aisGeom) {
				console.log('we have ais geom gonna make the marker')
				aisMarker = new L.Marker.SVGMarker([aisGeom.coordinates[1], aisGeom.coordinates[0]], {
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
			}

			app.state.map.addressMarkers.aisMarker = aisMarker;

			this.didCreateAddressMarker('aisMarker');

			//console.log('didGetAisResult is running LSinit');
			app.map.LSinit();

			// if there's a regmap, remove it
			this.removeRegmap();
		},

		didGetDorParcel: function () {
			console.log('MAP: did get dor parcel');

			// if there's no parcel in state, clear the map and don't render
			// TODO zoom to AIS xy
			var parcelDOR, geomDOR;

			try {
				parcelDOR = app.state.dor.features[0];
				if (!parcelDOR) throw 'no parcel';
				geomDOR = parcelDOR.geometry;
				//center = geom.getBounds().getCenter();
				//app.state.center = center;

				var coordsDOR = app.util.flipCoords(geomDOR.coordinates);
				parcelPolyDOR = L.polygon([coordsDOR], {
					color: 'blue',
					weight: 2,
					name: 'parcelPolyDOR',
					type: 'parcel',
				});
				parcelCentroid = parcelPolyDOR.getBounds().getCenter();
			}
			catch(err) {
				console.log('draw parcel, but could not get parcel from state', err);
				// clear parcel
				// _parcelLayerGroup.clearLayers();
				// return;
			}

			app.state.map.addressMarkers.parcelPolyDOR = parcelPolyDOR;

			this.didCreateAddressMarker('parcelPolyDOR');

			this.didGetParcel('dor');
		},

		didGetPwdParcel: function () {
			console.log('MAP: did get pwd parcel');

			var parcelWater = app.state.pwd.features[0],
					geomWater = parcelWater.geometry,
					coordsWater = app.util.flipCoords(geomWater.coordinates),
					parcelPolyWater = L.polygon([coordsWater], {
						color: 'blue',
						weight: 2,
						name: 'parcelPolyWater',
						type: 'parcel',
					});

			app.state.map.addressMarkers.parcelPolyWater = parcelPolyWater;

			this.didCreateAddressMarker('parcelPolyWater');

			this.didGetParcel('pwd');
		},

		didGetParcel: function (parcelLayer) {
			// console.log('MAP: did get parcel', parcelLayer);

			var didGetResult = !!app.state[parcelLayer],
					otherRequest = parcelLayer === 'pwd' ? 'didFinishDorRequest' : 'didFinishPwdRequest',
					otherRequestFinished = app.state[otherRequest];

			if (otherRequestFinished && !didGetResult) {
				this.showAddressMarker('aisMarker');
			}
		},

		// this is called after user has searched and we got both
		// dor and pwd parcels
		// didGetParcels: function () {
		// 	// make markers
		// 	this.createAddressMarkers();
		//
		// 	// call activate topic, which will call showAddressMarker
		// 	this.didActivateTopic(app.state.activeTopic);
		// },

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
						var parcel = app.state.pwd.features[0];
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

		/*createAddressMarkers: function () {
			console.log('create address markers');

			// make sure we have both dor and pwd in state. otherwise, return.
			// if (!(app.state.dor && app.state.pwd)) {
			// 	console.log('create address markers, but we dont have parcels yet')
			// 	return;
			// }

			var parcelPolyDOR, parcelPolyWater, aisMarker, parcelCentroid;

			if (app.state.dor) {
				// if there's no parcel in state, clear the map and don't render
				// TODO zoom to AIS xy
				var parcelDOR, geomDOR;

				try {
					parcelDOR = app.state.dor.features[0];
					if (!parcelDOR) throw 'no parcel';
					geomDOR = parcelDOR.geometry;
					//center = geom.getBounds().getCenter();
					//app.state.center = center;

					var coordsDOR = app.util.flipCoords(geomDOR.coordinates);
					parcelPolyDOR = L.polygon([coordsDOR], {
						color: 'blue',
						weight: 2,
						name: 'parcelPolyDOR',
						type: 'parcel',
					});
					parcelCentroid = parcelPolyDOR.getBounds().getCenter();
				}
				catch(err) {
					console.log('draw parcel, but could not get parcel from state', err);
					// clear parcel
					// _parcelLayerGroup.clearLayers();
					// return;
				}
			}

			if (app.state.pwd) {
				var parcelWater = app.state.pwd.features[0],
						geomWater = parcelWater.geometry,
						coordsWater = app.util.flipCoords(geomWater.coordinates);
				parcelPolyWater = L.polygon([coordsWater], {
					color: 'blue',
					weight: 2,
					name: 'parcelPolyWater',
					type: 'parcel',
				});
			}

			var aisGeom = app.state.ais.feature.geometry;
			console.log('create marker is about to check ais geom', app.state);
			if (aisGeom) {
				console.log('we have ais geom gonna make the marker')
				aisMarker = new L.Marker.SVGMarker([aisGeom.coordinates[1], aisGeom.coordinates[0]], {
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
			}

			// app.state.theParcelCentroid = parcelCentroid;
			app.state.map.addressMarkers = {};

			app.state.map.addressMarkers.parcelPolyDOR = parcelPolyDOR;
			app.state.map.addressMarkers.parcelPolyWater = parcelPolyWater;
			app.state.map.addressMarkers.aisMarker = aisMarker;

			console.log('created address markers', app.state.map.addressMarkers);

			// calling LSinit will alert Pictometry and Cyclomedia to change
			app.map.LSinit();
		},*/

    /*drawParcel: function () {
			console.log('running drawParcel');

      // clear existing parcel
      _parcelLayerGroup.clearLayers();

      // pan map
      // true if search button was clicked or if page is loaded w address parameter, false if a parcel was clicked
      if (app.state.map.shouldPan) {
        // zoom to bounds of parcel poly plus some buffer
				if (app.state.map.addressMarkers.parcelPolyDOR) {
	        var boundsPadded = app.state.map.addressMarkers.parcelPolyDOR.getBounds().pad(1.15);
	        // _map.fitBounds(bounds, {padding: ['20%', '20%']});
	        _map.fitBounds(boundsPadded);
	        // or need to use parcel centroid instead of center of map
	        // set new state and localStorage
				};
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
    }, // end of drawPolygon*/

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
			console.log('LSinit is running');
			app.state.theCenter = _map.getCenter();
			app.state.leafletCenterX = app.state.theCenter.lng;
			app.state.leafletCenterY = app.state.theCenter.lat;
      //if (app.state.map.clickedOnMap == true){
			if (app.state.ais.feature){
        app.state.leafletForCycloX = app.state.ais.feature.geometry.coordinates[0];
        app.state.leafletForCycloY = app.state.ais.feature.geometry.coordinates[1];
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

		showAddressMarker: function (markerType) {
			// console.log('show address marker', markerType);

			// if (!app.state.map.addressMarkers) {
			// 	console.log('show address marker, but we havent created them yet');
			// 	return;
			// }

			_parcelLayerGroup.clearLayers();

			var marker = app.state.map.addressMarkers[markerType];

			// if we tried to get something other than the ais marker and couldn't,
			// try falling back to ais marker
			if (!marker && markerType !== 'aisMarker') {
				marker = app.state.map.addressMarkers['aisMarker'];
			}

			// if there's no corresponding marker, don't do anything
			if (!marker) {
				// console.log('show address marker, but we dont have a marker of type', markerType);
				return;
			}

			marker.addTo(_parcelLayerGroup);
			app.map.domLayerList();

			// don't pan map if we shouldn't
      // true if search button was clicked or if page is loaded w address parameter, false if a parcel was clicked
      if (!app.state.map.shouldPan) {
				// console.log('shouldnt pan so going to return now')
				return;
			}

			switch(markerType) {
				case 'parcelPolyDOR':
					// zoom to bounds of parcel poly plus some buffer
					if (app.state.map.addressMarkers.parcelPolyDOR) {
						var boundsPadded = app.state.map.addressMarkers.parcelPolyDOR
																.getBounds()
																.pad(1.15);
						_map.fitBounds(boundsPadded);
					};
					break;

				case 'parcelPolyWater':
					var boundsPadded = app.state.map.addressMarkers.parcelPolyWater
															.getBounds()
															.pad(1.15);
					_map.fitBounds(boundsPadded);
					break;

				case 'aisMarker':
					_map.setView(marker.getLatLng(), 18);
					break;

				default:
					console.log('show address marker: unhandled type')
					break;
			}
		},

		// this is called when we change topics
    didChangeTopic: function (prevTopic, nextTopic) {
			console.log('did change topic', prevTopic, '=>', nextTopic);

			// if we don't have both parcels, don't do anything
			// if (!(app.state.dor && app.state.pwd)) {
			// 	console.warn('did change topic, but we dont have parcels yet, returning')
				// return;
			// }

			// handle address marker
			var prevMarkerType = this.addressMarkerTypeForTopic(prevTopic),
					nextMarkerType = this.addressMarkerTypeForTopic(nextTopic);
			if (prevMarkerType !== nextMarkerType) {
				// clear the marker
				_parcelLayerGroup.clearLayers();
				// add the new one
				nextMarker = this.addressMarkerForTopic(nextTopic);
				if (nextMarker) {
					nextMarker.addTo(_parcelLayerGroup);
				}
				else {
					console.warn('did change topic, but no next marker')
				}
			}

			// handle basemap (if imagery is not showing)
			if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
				var prevBasemapName = this.basemapForTopic(prevTopic),
						nextBasemapName = this.basemapForTopic(nextTopic);
				if (prevBasemapName !== nextBasemapName) {
					// replace the basemap
					_baseLayerGroup.clearLayers();
					app.state.map.tileLayers[nextBasemapName].addTo(_baseLayerGroup);
					// update state
					app.state.nameBaseLayer = nextBasemapName;
				}
			}

			// handle overlays
			_overlayLayerGroup.clearLayers();
			var nextOverlays = this.overlaysForTopic(nextTopic);
			_.forEach(nextOverlays, function (nextOverlay) {
				//console.log('nextOverlay is ', nextOverlay);
				if (nextOverlay) {
					nextOverlay.addTo(_overlayLayerGroup);
					// nextOverlay.setOpacity
				}
			});

			// handle regmaps - unhighlight last selected
			/*console.log('unhighlighting last selected');
      $('#deeds-regmaps a:not(.hollow)').addClass('hollow');*/

			// handle labels
			var prevLabelLayer = this.labelsForTopicAndBasemap(prevTopic, prevBasemapName),
					nextLabelLayer = this.labelsForTopicAndBasemap(nextTopic, nextBasemapName);
			// console.log('prevTopic is ' +  prevTopic);
			// console.log('prevBasemapName is ' + prevBasemapName);
			// console.log('prevLabelLayer is ' + prevLabelLayer);
			// console.log('nextTopic is ' +  nextTopic);
			// console.log('nextBasemapName is ' + nextBasemapName);
			// console.log('nextLabelLayer is ' + nextLabelLayer);
			if (prevLabelLayer !== nextLabelLayer) {
				// replace labels
				_labelLayerGroup.clearLayers();
				app.state.map.tileLayers[nextLabelLayer].addTo(_labelLayerGroup);
			}

      // console.log('did change topic', prevTopic, '=>', nextTopic);

			// handle opacity sliders
			var opacitySliders = app.state.map.opacitySliders,
					prevOverlays = this.overlaysForTopic(prevTopic);

			// remove existing sliders
			_.forEach(prevOverlays, function (prevOverlay) {
				var name = prevOverlay.options.name;
				if (_.keys(opacitySliders).indexOf(name) > -1) {
					var opacitySlider = opacitySliders[name];
					// remove opacity slider
					opacitySlider.remove();
				}
			});
			// add next slider
			_.forEach(nextOverlays, function (nextOverlay) {
				if(nextOverlay){
					var name = nextOverlay.options.name;
					if (_.keys(opacitySliders).indexOf(name) > -1) {
						var opacitySlider = opacitySliders[name];
						opacitySlider.addTo(_map);
					}
				}
			});

			// handle water
			if (nextTopic === 'water') {
				_overlayLayerGroup.addLayer(app.state.map.mapServices.water);
				app.map.domLayerList();
				// app.map.addOpacitySlider(app.state.map.mapServices.water, app.state.map.opacity.water);
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
			}
			else if (prevTopic === 'water') {
				app.map.waterLegend.remove();
			}

			// handle elections
			if (nextTopic === 'elections') {
				this.addElectionInfo();
			}
			else if (prevTopic === 'elections') {
				this.removeElectionInfo();
			}

			// handle nearby activity
			if (nextTopic === 'nearby') {
				this.addNearbyActivity();
			}
			else if (prevTopic === 'nearby') {
				this.removeNearbyActivity();
			}

			localStorage.setItem('previousTopic', prevTopic);
			localStorage.setItem('activeTopic', nextTopic);
			console.log('got to end of didChangeTopic');
    },

		basemapForTopic: function (topic) {
			// console.log('running basemapForTopic with topic ' + topic);
			var basemapName;
			switch (topic) {
				case 'deeds':
					basemapName = 'baseMapDORParcels';
					break;
				case 'zoning':
					basemapName = 'baseMapDORParcels';
					break;
				default:
					basemapName = 'baseMapLight';
					break;
			};
			// console.log('basemapName is ' + basemapName);
			return basemapName;
		},

		overlaysForTopic: function (topic) {
			var overlays;

			switch (topic) {
				case 'zoning':
					overlays = [
						app.state.map.mapServices.zoning,
					];
					break;
				case 'water':
					overlays = [
						app.state.map.mapServices.water,
					];
					break;
				case 'deeds':
					overlays = [
						app.state.map.mapServices.regmap,
					];
					break;
				default:
					overlays = [];
					return;
			}

			return overlays;
		},

		// labels depend on both the topic and the basemap being shown
		labelsForTopicAndBasemap: function (topic, basemap) {
			// always show imagery labels for imagery basemap
			// console.log('basemap is ' + basemap);
			if (basemap.indexOf('Imagery') > -1) {
				return 'overlayImageryLabels';
			}

			if (topic === 'deeds') {
				return 'overlayBaseDORLabels';
			}

			return 'overlayBaseLabels';
		},

		parcelLayerForTopic: function (topic) {
			var parcelLayer;

			if (topic === 'deeds') {
				parcelLayer = 'dor';
			} else {
				parcelLayer = 'pwd';
			}

			return parcelLayer;
		},



		toggleParcelMarker: function() {
			console.warn('starting toggleParcelMarker')
			if (app.state.map.nameParcelLayer == 'parcelMarker') {
				console.warn('using parcelMarker code');
				if (app.state.activeTopic == 'deeds') {
					if (app.state.map.addressMarkers.parcelPolyDOR) {
						_parcelLayerGroup.clearLayers();
						_parcelLayerGroup.addLayer(app.state.map.addressMarkers.parcelPolyDOR);
					};
				} else if (app.state.activeTopic == 'water') {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.map.addressMarkers.parcelPolyWater);
				}
			}
			if (app.state.map.nameParcelLayer == 'parcelPolyDOR') {
				//console.log(app.state.activeTopic);
				console.log('in toggleParcleMarker, app.state.map.nameParcelLayer is ' + app.state.map.nameParcelLayer);
				if (app.state.activeTopic == 'water') {
					console.log('activeTopic is water');
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.map.addressMarkers.parcelPolyWater);
				} else if (app.state.activeTopic != 'deeds' || app.state.activeTopic === null) {
					console.log('activeTopic is otherwise');
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.map.addressMarkers.aisMarker);
				}
			}
			if (app.state.map.nameParcelLayer == 'parcelPolyWater') {
				//console.log(app.state.activeTopic);
				//console.log(app.state.map.nameParcelLayer);
				console.warn('using parcelPolyWater');
				if (app.state.activeTopic == 'deeds') {
					if (app.state.map.addressMarkers.parcelPolyDOR) {
						console.warn('activeTopic is deeds')
						_parcelLayerGroup.clearLayers();
						console.warn('adding parcelPolyDOR ' + app.state.map.addressMarkers.parcelPolyDOR)
						_parcelLayerGroup.addLayer(app.state.map.addressMarkers.parcelPolyDOR);
					};
				} else if (app.state.activeTopic != 'water' || app.state.activeTopic === null) {
					_parcelLayerGroup.clearLayers();
					_parcelLayerGroup.addLayer(app.state.map.addressMarkers.aisMarker);
				}
			}
		},

		addressMarkerTypeForTopic: function (topic) {
			// console.log('running addressMarkerTypeForTopic with topic ' + topic);

			var markerType;
			if (topic === 'deeds') {
				markerType = 'parcelPolyDOR';
			} else if (topic === 'water') {
				markerType = 'parcelPolyWater';
			} else {
				markerType = 'aisMarker';
			}
			return markerType;
		},

		addressMarkerForTopic: function (topic) {
			console.log('running addressMarkerForTopic with topic ' + topic);
			var addressMarkers = app.state.map.addressMarkers;

			// check for markers
			if (!addressMarkers || addressMarkers.length === 0) {
				console.warn('called addressMarkerForTopic but there are no address markers')
				return;
			}

			var markerType = this.addressMarkerTypeForTopic(topic);
			return addressMarkers[markerType];
		},

		removeElectionInfo: function () {
			_electionFeatureGroup.clearLayers();
			//var boundsPadded = app.state.parcelPolyDOR.getBounds().pad(1.15);
			var boundsPadded = app.state.map.addressMarkers.parcelPolyDOR.getBounds().pad(1.15);
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

		didGetElections: function () {
			if (app.state.activeTopic === 'elections') {
				this.addElectionInfo();
			}
		},

		addElectionInfo: function () {
			_electionFeatureGroup.clearLayers();

			console.log('addElectionInfo was called');

			var elections = app.state.elections;

			if (!elections) {
				console.warn('add election info, but no elections yet');
				return;
			}

			var feature = elections.features[0],
					attrs = feature.attributes,
					ward = attrs.ward,
					division = attrs.division;

			// get division poly
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

					var divFeatures = data.features;

					// TODO check for no features

					var divFeature = data.features[0],
							divGeom = divFeature.geometry,
							divCoords = app.util.flipCoords(divGeom.rings),
							divPoly = L.polygon(divCoords, {
								color: 'red',
								weight: 2,
								title: 'Ward ' + ward + ' Division ' + division,
							});

					// add div poly to map
					_electionFeatureGroup.addLayer(divPoly);

					// make polling place marker
					var pollingLocation = attrs.location,
							pollingLat = attrs.lat,
							pollingLng = attrs.lng,
							pollingMarker = new L.Marker.SVGMarker(
								[pollingLat, pollingLng],
								{
									iconOptions: {
										className: 'svg-icon-noClick',
										circleRatio: 0,
										color: 'rgb(0,102,255)',
										fillColor: 'rgb(0,102,255)',
										fillOpacity: 0.5,
										iconSize: app.map.smallMarker,
								},
								title: location
							});

					// zoom to all election features
					// TODO this doesn't seem to be accounting for the polling marker?
					_electionFeatureGroup.addLayer(pollingMarker);
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

		toggleBaseToolTip: function(topic) {
			console.log('toggleBaseToolTip is starting');
		},

		removeRegmap: function () {
			console.log('remove regmap');
			var regmapLayer = app.state.map.mapServices.regmap,
					opacitySlider = app.state.map.opacitySliders.regmap;

			if (!regmapLayer) {
				return;
			}

			_overlayLayerGroup.clearLayers();

			opacitySlider.remove();

			app.state.map.mapServices.regmap = null;
		},

		didChangeRegmap: function (prev, next) {
			console.log('MAP: did change regmap', prev, '=>', next);

			var prevRegmap = app.state.map.mapServices.regmap;

			if (prevRegmap) {
				this.removeRegmap();
			}

			// if there no `next`, this is really a deselect.
			if (!next) {
				return;
			}

			var url = 'http://gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/',
					nextRegmap = new L.esri.dynamicMapLayer({
					  url: url,
						layers: [29],
						layerDefs: "29:NAME='g" + next.toLowerCase() + ".tif'",
						transparent: true,
						name: 'regmap',
					});

			nextRegmap.addTo(_overlayLayerGroup);

			// set state
			app.state.map.mapServices.regmap = nextRegmap;

			// slight kludge: update layer reference in opacity slider
			app.state.map.opacitySliders.regmap._layer = nextRegmap;

			// esri leaflet complains if we try to add the opacity slider before
			// the tiles hvae loaded.
			var firstLoadEvent = true;
			nextRegmap.on('load', function (map) {
				// only do this when we first load the regmap. we couldn't find an
				// event that fires only when the layer first loads.
				if (firstLoadEvent) {
					var opacitySlider = app.state.map.opacitySliders.regmap;
					opacitySlider.addTo(_map);
					nextRegmap.setOpacity(opacitySlider.options.opacity);

					firstLoadEvent = false;
				}
			});

		},
  }; // end of return
})();

app.map.initMap();
