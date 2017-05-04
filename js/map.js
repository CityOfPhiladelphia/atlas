// set variable to add blue cyclo circles to map
app.cyclo.wfsClient = new WFSClient(
	"https://atlas.cyclomedia.com/Recordings/wfs",
	"atlas:Recording",
	"EPSG:3857",
	""
);

// create custom information widget for telling user which parcel layer shows
L.Control.BaseToolTip = L.Control.extend({
	options: {
		position: 'bottomalmostleft',
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

// create app.map object for containing map-related objects
app.map = (function ()
{
  var _map,
      _baseLayerGroup = new L.LayerGroup(),
      _labelLayerGroup = new L.LayerGroup(),
      _overlayLayerGroup = new L.LayerGroup(),
      _parcelLayerGroup = new L.LayerGroup(),
			_stViewMarkersLayerGroup = new L.LayerGroup(),
			_nearbyActivityLayerGroup = new L.FeatureGroup(),
			_electionFeatureGroup = new L.FeatureGroup(),
      _cycloFeatureGroup = new L.FeatureGroup(),
      _stViewHfovMarker,
      _stViewCameraMarker,
			camera = L.icon({
        iconUrl: 'css/images/camera.png',
        iconSize: [26, 16],
        iconAnchor: [11, 8],
      })

  return {
		stViewMarkersLayerGroup : _stViewMarkersLayerGroup,
		waterLegend : L.control({position: 'bottomleft'}),
		baseToolTip : new L.Control.BaseToolTip,
		smallMarker: L.point(22,40),
		largeMarker: L.point(32,50),
		//xLargeMarker: L.point(42,60),

    initMap : function () {

      app.state.map = {
				addressMarkers: {},
			};

			app.state.map.clickedOnMap = false;
			localStorage.setItem('clickedOnMap', false);
			app.state.map.shouldPan = true;
			app.state.map.stViewInit = 'false';
			//TODO - figure out what to do about a popped out cyclomedia on re-load
			if (localStorage.stViewOpen) {
				app.state.map.stViewOpen = localStorage.stViewOpen
			} else {
				localStorage.setItem('stViewOpen', 'false');
				app.state.map.stViewOpen = 'false';
			}
			if (localStorage.pictometryOpen) {
				app.state.map.pictometryOpen = localStorage.pictometryOpen
			} else {
				localStorage.setItem('pictometryOpen', 'false');
				app.state.map.pictometryOpen = 'false';
			};

      // variables that hold names of layers on the map
      app.state.map.nameBaseLayer;
      app.state.map.nameLabelsLayer;
			app.state.map.nameParcelLayer;
      app.state.map.namesOverLayers = [];

      // objects that hold the actual layers
			app.state.map.featureServices = {};
      app.state.map.tiledLayers = {};
      app.state.map.mapServices = {};
      //app.state.map.appealsLayerGroup = new L.LayerGroup();

      var CITY_HALL = [39.952388, -75.163596];

      _map = L.map('map', {
         zoomControl: false,
      });
			// add routing fix
      _map.setView(CITY_HALL, 17);

			app.map.addControlPlaceholders(_map);

			// make measure control
			var measureControl = new L.Control.Measure({
				position: 'bottomleft',
				primaryLengthUnit: 'feet',
				primaryAreaUnit: 'sqfeet',
			});
			measureControl.addTo(_map);

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

      // Non-Imagery Basemaps and all Labels
			_.forEach(app.config.esri.tiledLayers, function(layer, i) {
				app.state.map.tiledLayers[i] = L.esri.tiledMapLayer({
	        url: layer.url,
	        maxZoom: 22,
	        name: i,
	        type: layer.type,
	        zIndex: layer.zIndex,
	      });
			});

			// Imagery Basemapes
			_.forEach(app.config.esri.imageryLayers, function(layer, i) {
				app.state.map.tiledLayers[i] = L.esri.tiledMapLayer({
	        url: layer.url,
	        maxZoom: 22,
	        name: i,
	        type: layer.type,
	        zIndex: layer.zIndex,
	      });
			});

			// Feature services
			_.forEach(app.config.esri.featureServices, function(options, layerName) {
				app.state.map.featureServices[layerName] = L.esri.featureLayer(options);
			});

			// Overlays
			_.forEach(app.config.esri.dynamicLayers, function(layer, i) {
				if (i != 'regmap'){
					app.state.map.mapServices[i] = L.esri.dynamicMapLayer({
						url: layer.url,
						maxZoom: 22,
						name: i,
						type: layer.type,
						zIndex: layer.zIndex,
					});
				}
			});

			// make opacity sliders
			app.state.map.opacitySliders = {};
			var opacitySliders = _.forEach(app.config.map.opacitySliders, function (options, layerName) {
				// add the layer name to options
				options.layerName = layerName;
				var slider = new L.Control.opacitySlider(options);
				app.state.map.opacitySliders[layerName] = slider;
			});

      // add initial map layers to _map
      _baseLayerGroup.addLayer(app.state.map.tiledLayers.baseMapLight);
      _baseLayerGroup.addTo(_map);
      _labelLayerGroup.addLayer(app.state.map.tiledLayers.overlayBaseLabels);
      _labelLayerGroup.addTo(_map);

      // add groups that contain no layers yet to _map
      _overlayLayerGroup.addTo(_map);
      _parcelLayerGroup.addTo(_map);
      _nearbyActivityLayerGroup.addTo(_map);
			_electionFeatureGroup.addTo(_map);
      _cycloFeatureGroup.addTo(_map);
      _stViewMarkersLayerGroup.addTo(_map);

      // add names of layers on the map to the DOM
      app.map.domLayerList();
			// set map state and localStorage on mapInit
			app.map.LSinit();

			// listen for map events
			_map.on('click', app.map.didClickMap);
			_map.on('drag', app.map.LSdrag);
			_map.on('dragend', app.map.LSdragend);
			_map.on('zoomend', app.map.LSzoomend);
			_map.on('moveend', function(){
				app.map.LSmoveend();
				if (app.state.map.stViewOpen && localStorage.stViewOpen == 'true') {
					app.map.prepareCycloBbox();
				};
			});

      // Controls
      new L.Control.Zoom({position: 'bottomright'}).addTo(_map);

			var basemapToggleButton = L.easyButton({
        id: 'baseToggleButton',
        position: 'topright',
        states: [{
          stateName: 'toggleToImagery',
          icon:      '<img src="css/images/imagery_small.png">',
          title:     'Toggle To Imagery',
          onClick: function(control) {
            app.map.toggleBasemap();
						if (app.state.map.nameBaseLayer != 'baseMapLight' && app.state.map.nameBaseLayer != 'baseMapDORParcels') {
							// console.log('toggling button to basemap');
	            control.state('toggletoBasemap');
	          }
					}
        }, {
          stateName: 'toggletoBasemap',
          icon:      '<img src="css/images/basemap_small.png">',
          title:     'Toggle To Basemap',
          onClick: function(control) {
            app.map.toggleBasemap();
						if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
							// console.log('toggling button to imagery');
							control.state('toggleToImagery');
						}
          }
        }]
      });
      basemapToggleButton.addTo(_map);

      app.state.map.historicalImageryButtons = []
			_.forEach(app.config.esri.imageryLayers, function(layer, i) {
				app.state.map.historicalImageryButtons.push(
					L.easyButton({
						id: layer.year+'ToggleButton',
						states:[{
							stateName: 'dateNotSelected',
							icon: '<strong class="aDate">'+layer.year+'</strong>',
							title: 'Show '+layer.year+' Imagery',
							onClick: function(control) {
								app.map.toggleYear(control, app.state.map.tiledLayers[i]);
								app.state.map.lastYearViewed = app.state.map.tiledLayers[i];
							}
						}, {
							stateName: 'dateSelected',
							icon: '<strong class="aDate">'+layer.year+'</strong>',
							title: 'Show '+layer.year+' Imagery',
						}]
					})
				);
			});
			app.state.map.historicalImageryButtons[0].state('dateSelected');

      // build a toolbar with them
      theEasyBar = L.easyBar(app.state.map.historicalImageryButtons, {
        position: 'topalmostright'
      })

			app.map.stViewToggleButton = L.easyButton({
        id: 'stViewToggleButton',
        position: 'topright',
        states: [{
          stateName: 'toggleOnWidget',
          //icon:      'fa-road fa widget-icon',
					icon: '<img src="css/images/cyclo.png">',
          title:     'Toggle On Street View',
          onClick: function(control) {
						app.map.toggleStView();
						control.state('toggleOffWidget');
					}
        }, {
          stateName: 'toggleOffWidget',
          //icon:      'fa-road fa widget-icon',
					icon: '<img src="css/images/cyclo.png">',
          title:     'Toggle Off Street View',
          onClick: function(control) {
						app.map.toggleStView();
						control.state('toggleOnWidget');
          }
        }, {
					stateName: 'stViewOutside',
          //icon:      'fa-road fa widget-icon',
					icon: '<img src="css/images/cyclo.png">',
          title:     'Street View Already Open in Separate Tab',
          //onClick: function(control) {}
				}]
      });
      app.map.stViewToggleButton.addTo(_map);
			if (app.state.map.stViewOpen == 'true'){
				app.map.stViewToggleButton.state('toggleOffWidget');
			};

			app.map.pictometryOpenButton = L.easyButton({
				id: 'pictometryOpenButton',
				position: 'topright',
				states: [{
          stateName: 'toggleOnWidget',
          //icon:      'fa-plane fa-1x widget-icon',
					icon: '<img src="css/images/pictometry.png">',
          title:     'Open Pictometry',
          onClick: function(control) {
						window.open(app.config.pictometry.url, app.config.pictometry.url);
						localStorage.setItem('pictometryOpen', 'true');
						control.state('toggleOffWidget');
					}
				}, {
          stateName: 'toggleOffWidget',
          //icon:      'fa-plane fa-1x widget-icon',
					icon: '<img src="css/images/pictometry.png">',
          title:     'Pictometry Already Open in Separate Tab',
          onClick: function(control) {
          }
				}]
			});
			app.map.pictometryOpenButton.addTo(_map);
			if (app.state.map.pictometryOpen == 'true') {
				app.map.pictometryOpenButton.state('toggleOffWidget');
			};

      // if cyclo is in outside tab, when map refreshes, if there is already a cyclo tab open, place the marker
      if (app.state.map.stViewOpen && localStorage.stViewOpen == 'true') {
        app.map.LSretrieve();
        // console.log('map refreshing triggered drawStViewMarkers');
        app.map.drawStViewMarkers();
        app.map.prepareCycloBbox();
      }

      // watch localStorage for changes to:
      //pictometryOpen, stViewOpen, stViewCoords, stViewYaw, stViewHfov
      $(window).bind('storage', function (e) {
				// console.warn(e);
				// if pictometry window closes, change widget icon color
				if (e.originalEvent.key == 'pictometryOpen') {
					if (e.originalEvent.newValue == 'false') {
          	app.map.pictometryOpenButton.state('toggleOnWidget');
					}
					if (e.originalEvent.newValue == 'true') {
          	app.map.pictometryOpenButton.state('toggleOffWidget');
					}
        };
        // if cyclo window closes, remove marker and change icon color
        if (e.originalEvent.key == 'stViewOpen') {
					if (e.originalEvent.newValue == 'false') {
						// console.log('stView closed');
          	_stViewMarkersLayerGroup.clearLayers();
          	_cycloFeatureGroup.clearLayers();
						localStorage.setItem('circlesOn', 'false');
						app.state.map.stViewOpen = 'false';
						app.map.stViewToggleButton.state('toggleOnWidget');
        	} else if (e.originalEvent.newValue == 'true') {
						app.map.stViewToggleButton.state('stViewOutside');
						app.map.prepareCycloBbox();
					}
        };
        if (e.originalEvent.key == 'stViewCoords'){
          app.state.stViewX = localStorage.getItem('stViewX');
          app.state.stViewY = localStorage.getItem('stViewY');
          _stViewMarkersLayerGroup.clearLayers();
          // console.log('change to stViewCoords triggered drawStViewMarkers');
          app.map.drawStViewMarkers();
        };
        if (e.originalEvent.key == 'stViewYaw'){
          app.state.stViewYaw = localStorage.getItem('stViewYaw');
          _stViewMarkersLayerGroup.clearLayers();
          // console.log('change to stViewYaw triggered drawStViewMarkers');
          app.map.drawStViewMarkers();
        };
        if (e.originalEvent.key == 'stViewHfov'){
          app.state.stViewHfov = localStorage.getItem('stViewHfov');
          _stViewMarkersLayerGroup.clearLayers();
          app.state.stViewConeCoords = app.map.calculateConeCoords();
          // console.log('change to stViewHfov triggered drawStViewMarkers');
          app.map.drawStViewMarkers();
        };
      });
    }, // end of initMap

		// Add map widget holders outside of corners - called in InitMap
		addControlPlaceholders: function(map) {
			// console.log('addControlPlaceholders is running');
	    var corners = map._controlCorners,
	        l = 'leaflet-',
	        container = map._controlContainer;
	    function createCorner(vSide, hSide) {
	        var className = l + vSide + ' ' + l + hSide;
	        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
	    }
	    createCorner('bottom', 'almostleft');
			createCorner('top', 'almostright');
		},

		// adds and removes baseLayer and overlay
		toggleBasemap: function() {
			if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
				_baseLayerGroup.clearLayers();
				_labelLayerGroup.clearLayers();
				if (app.state.map.lastYearViewed) {
					_baseLayerGroup.addLayer(app.state.map.lastYearViewed);
					_baseLayerGroup.addLayer(app.state.map.tiledLayers.parcels);
				} else {
					_baseLayerGroup.addLayer(app.state.map.tiledLayers.baseMapImagery2016);
					_baseLayerGroup.addLayer(app.state.map.tiledLayers.parcels);
				}
				_labelLayerGroup.addLayer(app.state.map.tiledLayers.overlayImageryLabels);
				theEasyBar.addTo(_map);

			} else {
				_baseLayerGroup.clearLayers();
				_labelLayerGroup.clearLayers();
				if(app.state.activeTopic != 'deeds'){
					_baseLayerGroup.addLayer(app.state.map.tiledLayers.baseMapLight);
					_labelLayerGroup.addLayer(app.state.map.tiledLayers.overlayBaseLabels);
				} else {
					app.state.map.tiledLayers.baseMapDORParcels.addTo(_baseLayerGroup);
					app.state.map.tiledLayers.overlayBaseDORLabels.addTo(_labelLayerGroup);
				}
				theEasyBar.remove();
			}
			app.map.domLayerList();
		},

		toggleYear: function(control, requestedLayer) {
			// gray all buttons
			for (i = 0; i < app.state.map.historicalImageryButtons.length; i++) {
				//// console.log(app.state.map.historicalImageryButtons[i].options.id);
				app.state.map.historicalImageryButtons[i].state('dateNotSelected');
			};
			_baseLayerGroup.clearLayers();
			_baseLayerGroup.addLayer(requestedLayer);
			_baseLayerGroup.addLayer(app.state.map.tiledLayers.parcels);

			// highlight current button
			control.state('dateSelected');
			app.map.domLayerList();
		},

		// switch stView to outside
		popoutStView: function() {
			// console.log('popoutStView starting');
			var cycloPanel = document.getElementById('cyclo-panel');
			$('#map-panel').css('height', '100%');
			$('#map-panel').animate({
				height: '100%'
			}, 350, function(){
				_map.invalidateSize();
			});
			$('#cyclo-panel').hide('slide', {direction: 'down'}, 350);
		},

		// toggle stView
		toggleStView: function() {
			// console.log('toggleStView starting');
			var cycloPanel = document.getElementById('cyclo-panel');
			//var $cycloPanel = $('#cyclo-panel');
			if (app.state.map.stViewOpen == 'false') {
				// console.log('app.state.map.stViewOpen is false');
				app.state.map.stViewOpen = 'true';
				localStorage.setItem('stViewOpen', 'true');
				//// console.log(app.state.map.stViewOpen);
				$('#map-panel').animate({
					height: '50%'
				}, 350, function(){
					_map.invalidateSize()
				});
				$('#cyclo-panel').show('slide', {direction: 'down'}, 350);
				if (app.state.map.stViewInit == 'false') {
					app.cyclo.init(cycloPanel);
					app.state.map.stViewInit = 'true';
				} else {

					app.state.stViewConeCoords = app.map.calculateConeCoords();
					app.map.drawStViewMarkers();
					app.cyclo.LSsetImageProps();
				}
				localStorage.setItem('circlesOn', 'true');

			} else {
				// console.log('app.state.map.stViewOpen is true');
				app.state.map.stViewOpen = 'false';
				localStorage.setItem('stViewOpen', 'false');
				//// console.log(app.state.map.stViewOpen);
				$('#map-panel').css('height', '100%');
				$('#map-panel').animate({
					height: '100%'
				}, 350, function(){
					_map.invalidateSize();
				});
				$('#cyclo-panel').hide('slide', {direction: 'down'}, 350);
				_stViewMarkersLayerGroup.clearLayers();
				_cycloFeatureGroup.clearLayers();
				localStorage.setItem('circlesOn', 'false');
			}
		},

		// didClickVacancyRadioButton: function(buttonId) {
		// 	// console.log('didClickVacancyRadioButton ran with ', buttonId);
		// 	_overlayLayerGroup.clearLayers();
		// 	var newOverlay = app.state.map.featureServices[buttonId];
		// 	newOverlay.addTo(_overlayLayerGroup);
		// 	app.map.domLayerList();
		// },

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

		didCreateAddressMarker: function (markerType) {
			// // console.log('did create address marker', markerType);
			var targetMarkerType = this.addressMarkerTypeForTopic(app.state.activeTopic);
			if (markerType === targetMarkerType) {
				// // console.log('this is the marker we want to show')
				this.showAddressMarker(markerType);
			}
			// else if (app.state.map.addressMarkers.aisMarker) {
			// 	this.showAddressMarker('aisMarker');
			// }
		},

		didGetAisResult: function () {
			// console.log('MAP: did get ais result');

			// clear out old address markers
			app.state.map.addressMarkers = {};

			var aisGeom = app.state.ais.feature.geometry;
			if (aisGeom) {
				// console.log('we have ais geom gonna make the marker')
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

			//// console.log('didGetAisResult is running LSinit');
			app.map.LSinit();
			if (app.state.map.stViewOpen == 'true'){
				app.cyclo.setNewLocation();
			}

			// if there's a regmap, remove it
			var prevRegmap = app.state.map.mapServices.regmap;
			if (prevRegmap) {
				// console.warn('didGetAisResult is calling removeRegmap');
				this.removeRegmap();
			}
		},

		didGetDorParcels: function () {
			// console.log('MAP: did get dor parcels');

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
				// console.log('draw parcel, but could not get parcel from state', err);
				// clear parcel
				// _parcelLayerGroup.clearLayers();
				// return;
			}

			app.state.map.addressMarkers.parcelPolyDOR = parcelPolyDOR;

			this.didCreateAddressMarker('parcelPolyDOR');

			this.didGetParcel('dor');
		},

		didGetPwdParcel: function () {
			// console.log('MAP: did get pwd parcel');

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
			// // console.log('MAP: did get parcel', parcelLayer);

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
			//app.state.dor = app.state.pwd = null;

      // set state
      app.state.map.clickedOnMap = true
			localStorage.setItem('clickedOnMap', true);
      app.state.map.shouldPan = false;

      // if this was a cyclo circle click, don't do anything
      if (app.state.map.clickedCircle) {
        // // console.log('clicked a circle');
        app.state.map.clickedCircle = false;
				return;
      }

			// otherwise, it was a parcel click. get the parcel ID and query AIS.
      app.getParcelsByLatLng(e.latlng, function () {
				// which parcels are being displayed?
				var activeTopic = app.state.activeTopic,
						DOR_TOPICS = ['deeds', 'zoning'],
						parcelLayer = DOR_TOPICS.indexOf(activeTopic) > -1 ? 'dor' : 'pwd',
						parcelId;

				switch (parcelLayer) {
					case 'dor':
						var parcel = app.state.dor.features[0];
						parcelId = parcel.properties.MAPREG;
						// console.log('dor parcel, id:', parcelId);
						break;
					case 'pwd':
						var parcel = app.state.pwd.features[0];
						parcelId = parcel.properties.PARCELID;
						// console.log('pwd parcel, id:', parcelId);
						break;
					default:
						// console.log('unknown parcel layer:', parcelLayer)
						break;
				}

        // if this is the result of a map click, query ais
        if (app.state.map.clickedOnMap) {
          app.searchAis(parcelId);
          app.state.map.clickedOnMap = true;
        }
      });
    },


    LSinit: function() {
			// console.log('LSinit is running');
			app.state.theCenter = _map.getCenter();
			app.state.leafletCenterX = app.state.theCenter.lng;
			app.state.leafletCenterY = app.state.theCenter.lat;
      //if (app.state.map.clickedOnMap == 'true'){
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

			var e = $.Event('storage');
			e.originalEvent = {
				key: 'leafletCenterX',
				newValue: app.state.leafletCenterX
			};
			$(window).trigger(e);
    },

    // while map is dragged, constantly reset center in localStorage
    // this will move Pictometry with it, but not cyclo
    LSdrag: function() {
      app.state.theCenter = _map.getCenter();
      app.state.leafletCenterX = app.state.theCenter.lng;
      app.state.leafletCenterY = app.state.theCenter.lat;
      localStorage.setItem('leafletCenterX', app.state.leafletCenterX);
      localStorage.setItem('leafletCenterY', app.state.leafletCenterY);
      localStorage.setItem('pictCoordsZoom', [app.state.leafletCenterX, app.state.leafletCenterY, app.state.theZoom]);
    },

    // when map is finished being dragged, 1 more time reset the center in localStorage
    // this will move Pictometry AND cyclo
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
      //// console.log('drawStViewMarkers is called - about to create _stViewHfovMarker');
			// this can be called while street view is opening, causing errors
			if (app.state.stViewY) {
	      _stViewHfovMarker = L.marker([app.state.stViewY, app.state.stViewX], {
	        icon: new L.divIcon.svgIcon.triangleIcon({
	          iconSize: L.point(app.state.stViewConeCoords[0], app.state.stViewConeCoords[1]),
	          iconAnchor: [app.state.stViewConeCoords[0]/2, app.state.stViewConeCoords[1]],
	        }),
	        rotationAngle: app.state.stViewYaw,
	      }).on('click', 	function(){
					// console.log('clicked triangle marker');
				});
	      //// console.log('about to create _stViewCameraMarker');
	      _stViewCameraMarker = L.marker([app.state.stViewY, app.state.stViewX], {
	        icon: camera,
	        rotationAngle: app.state.stViewYaw,
					draggable: true
	      }).on('click', function(){
					// console.log('clicked camera');
				}).on('dragend', function(data){
					app.state.dragdata = data;
					app.state.draggedX = data.target._latlng.lng;
					app.state.draggedY = data.target._latlng.lat;
					app.map.LSdraggedMarker(app.state.draggedY, app.state.draggedX);
				});
	      _stViewCameraMarker.addTo(_stViewMarkersLayerGroup);
	      _stViewHfovMarker.addTo(_stViewMarkersLayerGroup);
			}
    },

		showAddressMarker: function (markerType) {
			// // console.log('show address marker', markerType);

			// if (!app.state.map.addressMarkers) {
			// 	// console.log('show address marker, but we havent created them yet');
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
				// // console.log('show address marker, but we dont have a marker of type', markerType);
				return;
			}

			marker.addTo(_parcelLayerGroup);
			app.map.domLayerList();

			// don't pan map if we shouldn't
      // 'true' if search button was clicked or if page is loaded w address parameter, 'false' if a parcel was clicked
      if (!app.state.map.shouldPan) {
				// // console.log('shouldnt pan so going to return now')
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
					// console.log('show address marker: unhandled type')
					break;
			}
		},

		// this is called when we change topics
    didChangeTopic: function (prevTopic, nextTopic) {
			// console.log('did change topic', prevTopic, '=>', nextTopic);

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
					// console.warn('did change topic, but no next marker')
				}
			}

			// handle basemap (if imagery is not showing)
			if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
				var prevBasemapName = this.basemapForTopic(prevTopic),
						nextBasemapName = this.basemapForTopic(nextTopic);
				if (prevBasemapName !== nextBasemapName) {
					// replace the basemap
					_baseLayerGroup.clearLayers();
					app.state.map.tiledLayers[nextBasemapName].addTo(_baseLayerGroup);
					// update state
					app.state.nameBaseLayer = nextBasemapName;
				}
			}

			// handle overlays
			// console.warn('didChangeTopic is clearing _overlayLayerGroup');
			_overlayLayerGroup.clearLayers();
			// console.warn('calling overlaysForTopic to get nextOverlays with nextTopic ', nextTopic);
			var nextOverlays = this.overlaysForTopic(nextTopic);
			// console.log('nextOverlays', nextOverlays);
			_.forEach(nextOverlays, function (nextOverlay) {
				//// console.log('nextOverlay is ', nextOverlay);
				if (nextOverlay) {
					nextOverlay.addTo(_overlayLayerGroup);
					// nextOverlay.setOpacity
				}
			});

			// handle regmaps - unhighlight last selected
			/*// console.log('unhighlighting last selected');
      $('#deeds-regmaps a:not(.hollow)').addClass('hollow');*/

			// handle labels
			var prevLabelLayer = this.labelsForTopicAndBasemap(prevTopic, prevBasemapName),
					nextLabelLayer = this.labelsForTopicAndBasemap(nextTopic, nextBasemapName);
			// // console.log('prevTopic is ' +  prevTopic);
			// // console.log('prevBasemapName is ' + prevBasemapName);
			// // console.log('prevLabelLayer is ' + prevLabelLayer);
			// // console.log('nextTopic is ' +  nextTopic);
			// // console.log('nextBasemapName is ' + nextBasemapName);
			// // console.log('nextLabelLayer is ' + nextLabelLayer);
			if (prevLabelLayer !== nextLabelLayer) {
				// replace labels
				_labelLayerGroup.clearLayers();
				app.state.map.tiledLayers[nextLabelLayer].addTo(_labelLayerGroup);
			}

      // // console.log('did change topic', prevTopic, '=>', nextTopic);

			// handle opacity sliders
			// console.log('######## calling overlaysForTopic to get prevTopic');
			var opacitySliders = app.state.map.opacitySliders,
					prevOverlays = this.overlaysForTopic(prevTopic);

			// remove existing sliders
			if (prevOverlays !== undefined && prevOverlays[0] !== undefined && prevOverlays[0] !== null) {
				// console.log('prevOverlays', prevOverlays)
				_.forEach(prevOverlays, function (prevOverlay) {
					// console.log('$$$$$$$$$$$$$$$ prevOverlay ', prevOverlay)
					var name = prevOverlay.options.name;
					if (_.keys(opacitySliders).indexOf(name) > -1) {
						var opacitySlider = opacitySliders[name];
						// remove opacity slider
						opacitySlider.remove();
					}
				});
			}
			// add next slider
			// console.log('^^^^^^^^^^^^^^ nextOverlays is ', nextOverlays);
			_.forEach(nextOverlays, function (nextOverlay) {
				// console.log('@@@@@@@@@@@ forEach with nextOverlay', nextOverlay)
				if(nextOverlay){
					var name = nextOverlay.options.name;
					// console.log('name is ', name);
					if (_.keys(opacitySliders).indexOf(name) > -1) {
						var opacitySlider = opacitySliders[name];
						opacitySlider.addTo(_map);
					}
				}
			});

			// handle water
			if (nextTopic === 'water') {
				// console.warn('adding water overlay');
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

			// handle vacancy
			if (nextTopic === 'vacancy') {
				_overlayLayerGroup.clearLayers();
				var landOverlay = app.state.map.featureServices.vacantLand;
				var buildingOverlay = app.state.map.featureServices.vacantBuildings;
				landOverlay.addTo(_overlayLayerGroup);
				buildingOverlay.addTo(_overlayLayerGroup);
				app.map.domLayerList();
				this.addNearbyActivity();
			}
			else if (prevTopic === 'vacancy') {
				app.map.removeNearbyActivity();
			}

			// handle nearby activity
			if (nextTopic === 'nearby') {
				this.addNearbyActivity();
			}
			else if (prevTopic === 'nearby') {
				this.removeNearbyActivity();
			}


			// handle nearby activity
			if (nextTopic === '311') {
				this.addNearbyActivity(app.state.nearby311.rowsSortedGeom);
			}
			else if (prevTopic === '311') {
				this.removeNearbyActivity();
			}


			// local storage stuff
			localStorage.setItem('previousTopic', prevTopic);
			localStorage.setItem('activeTopic', nextTopic);
			// console.log('got to end of didChangeTopic');
    },

		basemapForTopic: function (topic) {
			// // console.log('running basemapForTopic with topic ' + topic);
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
			// // console.log('basemapName is ' + basemapName);
			return basemapName;
		},

		overlaysForTopic: function (topic) {
			// console.log('running overlaysForTopic with topic ', topic);
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
					// console.log('overlays for topic DEEDS');
					overlays = [
						app.state.map.mapServices.regmap,
					];
					// console.log('inside overlays for topic function ', overlays);
					break;
				/*case 'vacancy':
					// console.log('overlays for topic VACANCY');
					overlays = [
						//app.state.map.featureServices.vacancyPercent,
						//app.state.map.featureServices.vacantBuildings,
						app.state.map.featureServices.vacantLand,
					]
					// console.log('overlays is ', overlays);*/
				default:
					overlays = [];
					return;
			}

			return overlays;
		},

		// labels depend on both the topic and the basemap being shown
		labelsForTopicAndBasemap: function (topic, basemap) {
			// always show imagery labels for imagery basemap
			// // console.log('basemap is ' + basemap);
			if (basemap.indexOf('Imagery') > -1) {
				return 'overlayImageryLabels';
			}

			if (topic === 'deeds') {
				return 'overlayBaseDORLabels';
			}

			return 'overlayBaseLabels';
		},

		addressMarkerTypeForTopic: function (topic) {
			// // console.log('running addressMarkerTypeForTopic with topic ' + topic);

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
			// console.log('running addressMarkerForTopic with topic ' + topic);
			var addressMarkers = app.state.map.addressMarkers;

			// check for markers
			if (!addressMarkers || addressMarkers.length === 0) {
				// console.warn('called addressMarkerForTopic but there are no address markers')
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

		didGetElections: function () {
			if (app.state.activeTopic === 'elections') {
				this.addElectionInfo();
			}
		},

		addElectionInfo: function () {
			_electionFeatureGroup.clearLayers();

			// console.log('addElectionInfo was called');

			var elections = app.state.elections;

			if (!elections) {
				// console.warn('add election info, but no elections yet');
				return;
			}

			var feature = elections.features[0],
					attrs = feature.attributes,
					ward = attrs.ward,
					division = attrs.division;

			// get division poly
			$.ajax({
        url: app.config.esri.otherLayers.divisionLayerUrl + '/query',
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
			console.debug('add nearby activity', rows);

			app.state.map.nearbyActivity = app.state.map.nearbyActivity || {};

			// if no rows were passed in, get them from state
			if (!rows) {
					app.state.map.nearbyActivity.data = app.state.nearby.rowsSorted || {};
					rows = app.state.map.nearbyActivity.data;
			} else {
				app.state.map.nearbyActivity.data = rows;
			}

			// if we still don't have rows, then the app was probably just opened to
			// the /nearby route. return and wait for the api call to finish.
			if (_.isEmpty(rows)) {
				return;
			}

			// TODO clear existing
			this.removeNearbyActivity();

			_.forEach(rows, function (row) {
				var lon = row.x,
						lat = row.y,
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
							// // console.log('clicked a marker');
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

			var mapBounds = _map.getBounds(),
					layerBounds = _nearbyActivityLayerGroup.getBounds();

			if (mapBounds.contains(layerBounds)) {
				// // console.log('map bounds contain nearby activity bounds');
			} else {
				// // console.log('map bounds do not contain activity bounds');
				_map.fitBounds(layerBounds);
				//_map.panInsideBounds(_nearbyActivityLayerGroup.getBounds());
			}
			app.map.domLayerList();
		},

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
        app.cyclo.wfsClient.loadBbox(newSWCoord[0], newSWCoord[1], newNECoord[0], newNECoord[1], app.map.addCycloCircles, app.config.cyclo.username, app.config.cyclo.password);
      }
    },

    addCycloCircles: function() {
			// console.log('addCycloCircles is running');
      _cycloFeatureGroup.clearLayers();
      app.cyclo.recordings = app.cyclo.wfsClient.recordingList;
      if (app.cyclo.recordings.length > 0) {
        var b = [];
        for (i=0; i < app.cyclo.recordings.length; i++) {
          var rec = app.cyclo.recordings[i];
          var coordRaw = [rec.lon, rec.lat];
          var coordNotFlipped = proj4('EPSG:3857', 'EPSG:4326', coordRaw);
          var coord = [coordNotFlipped[1], coordNotFlipped[0]];
          var blueCircle = new L.circle(coord, 1.2, {
            color: '#3388ff',
            weight: 1,
          }).on('click', function(coord){
            app.state.map.clickedCircle = 'true';

						// SET LOCAL STORAGE
						app.map.LSclickedCircle(coord.latlng.lat, coord.latlng.lng);

						// DIRECTLY CHANGE CYCLO-WINDOW
						app.cyclo.setNewLocation();

          });
          //blueCircle.on({click: // console.log('clicked a circle')});
          blueCircle.addTo(_cycloFeatureGroup);
        }
        _cycloFeatureGroup.bringToFront();
      }
			// set "circles on" in localStorage
			localStorage.setItem('circlesOn', 'true');
    },

		removeRegmap: function () {
			// console.log('remove regmap');
			var regmapLayer = app.state.map.mapServices.regmap,
					opacitySlider = app.state.map.opacitySliders.regmap;

			if (!regmapLayer) {
				return;
			}

			if (app.state.activeTopic == 'deeds') {
				// console.warn('removeRegmap is clearing _overlayLayerGroup');
				_overlayLayerGroup.clearLayers();
			}

			opacitySlider.remove();

			app.state.map.mapServices.regmap = null;
		},

		didSelectRegmap: function (nextRegmap) {
			console.log('MAP: did change regmap =>', nextRegmap);

			var prevRegmap = app.state.map.mapServices.regmap;

			if (prevRegmap) {
				app.map.removeRegmap();
			}

			// if there isn't a regmap to show, don't do anything
			if (!nextRegmap) {
				return;
			}

			var url = 'http://gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/',
					nextRegmap = new L.esri.dynamicMapLayer({
					  url: url,
						layers: [29],
						layerDefs: "29:NAME='g" + nextRegmap.toLowerCase() + ".tif'",
						transparent: 'true',
						name: 'regmap',
						zIndex: 4,
					});

			nextRegmap.addTo(_overlayLayerGroup);

			// set state
			app.state.map.mapServices.regmap = nextRegmap;

			// slight kludge: update layer reference in opacity slider
			app.state.map.opacitySliders.regmap._layer = nextRegmap;

			// esri leaflet complains if we try to add the opacity slider before
			// the tiles hvae loaded.
			var firstLoadEvent = 'true';
			nextRegmap.on('load', function (map) {
				// only do this when we first load the regmap. we couldn't find an
				// event that fires only when the layer first loads.
				if (firstLoadEvent) {
					var opacitySlider = app.state.map.opacitySliders.regmap;
					opacitySlider.addTo(_map);
					nextRegmap.setOpacity(opacitySlider.options.opacity);

					firstLoadEvent = 'false';
				}
			});

		},

		didActivateParcel: function () {
			// if there's no parcel in state, clear the map and don't render
			// TODO zoom to AIS xy
			var parcelDOR, geomDOR;

			var activeParcelId = app.views.parcelTabs.activeParcel,
					activeParcel = _.filter(app.state.dor.features, function (feature) {
						return feature.properties.MAPREG == activeParcelId;
					})[0];

			try {
				if (!activeParcel) {
					throw 'no parcel'
				};

				geomDOR = activeParcel.geometry;

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
				// console.log('draw parcel, but could not get parcel from state', err);
				// clear parcel
				// _parcelLayerGroup.clearLayers();
				// return;
			}

			app.state.map.addressMarkers.parcelPolyDOR = parcelPolyDOR;

			app.map.didCreateAddressMarker('parcelPolyDOR');

			app.map.didGetParcel('dor');
		},

		drawBuffer(data){
	    //console.log('running drawBuffer', data['geometries'][0]['rings'][0]);
	    var buffer = L.polygon(data['geometries'][0]['rings'][0], {color: 'green'});
	    buffer.addTo(_overlayLayerGroup);
	  },
  }; // end of return
})();

app.map.initMap();
