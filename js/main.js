
var app = {};

window.app = app;

app.util = {}
app.util.ais_api = 'http://ec2-54-175-56-73.compute-1.amazonaws.com/addresses/'
app.util.li_api = 'http://api.phila.gov/li/v1/'
app.util.opa_api = 'https://api.phila.gov/opa/v1.1/account/'
app.util.firstProjection = '+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs';
app.util.secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
app.util.AISFeatKeys = []
app.util.moveMode = false
app.util.opaRetrieved = false
//app.util.resolveAddress = $.Deferred()

app.ais = {}
//app.ais.curAIS = {}
//app.ais.curAIS.geometry = {}
//app.ais.curAIS.geometry.coordinates = {}

app.gis = {}
app.gis.curFeatGeo = {}
app.gis.curFeatCoord_del
app.gis.curFeatFlipCoord_del = []
app.gis.curPolygon

app.opa = {}
app.opa.curOPA

app.li = {}
//app.li.liArray = []
app.li.liDataCheck = {'basic': '', 'license': '', 'permit': ''}
app.li.curLI_basic = {}
app.li.curLI_permits = {}
app.li.curLI_licenses = {}

var LILicenses = []


// Set up pointers to useful elements
app.hooks = {};

$('[data-hook]').each(function (i, el) {
  var dataHook = $(el).data('hook'),
      // Get _all_ elements for a data-hook value, not just the single element
      // in the current iteration. Supports multiple elements with the same
      // data-hook value.
      $el = $('[data-hook="' + dataHook + '"]');
  // Convert hyphen-names to camelCase in hooks
  var hook = dataHook.replace(/-([a-z])/g, function (m) {
    return m[1].toUpperCase();
  });
  app.hooks[hook] = $el;
});


// Pull a human-readable sales date from what the OPA API gives us
app.util.formatSalesDate = function (salesDate) {
  var d, m;
  if (m = /(-?\d+)-/.exec(salesDate)) {
    d = new Date(+m[1]);
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
  } else return '';
};


APP = (function () {
    var map;
    
    return {
        init: function () {
            var CITY_HALL = [39.952388, -75.163596];
            map = L.map('map', {
               zoomControl: false,
            //   measureControl: true,
            });
            map.setView(CITY_HALL, 16);


            // Current Address Marker
            //currentAddress = L.marker(CITY_HALL)
            
            // Basemaps
            var baseMapLight = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer"
                // url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer"
            });
            var baseMapDark = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer"
            });
            var baseMapImagery2015 = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer"
            });
            baseMapLight.addTo(map);
            
            // Overlays
            var overlayZoning = L.esri.tiledMapLayer({
                url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer'
            });
            var overlayPwdParcels = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0'
            });

            // This is the layer that allow querying of parcels by clicking on them
            var queryParcel = L.esri.query({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0'
            })

/*
            gj = overlayPwdParcels
            nearest = leafletKnn(gj).nearest(L.LatLng(39.952388, -75.163596), 1)
*/
            var baseLayers = {
                'Light':        baseMapLight,
                'Dark':         baseMapDark,
                'Imagery 2015': baseMapImagery2015,
            };
            var overlays = {
                'Zoning':       overlayZoning,
                'PWD Parcels':  overlayPwdParcels,
                // 'Land Use': landUse,
            };
            
            // Controls
            L.control.layers(baseLayers, overlays, {position: 'topright'}).addTo(map);
            var measureControl = new L.Control.Measure({position: 'topright'});
            measureControl.addTo(map);
            new L.Control.Zoom({position: 'topright'}).addTo(map);
            
            // TEMP: just for mockup. Listen for clicks on data row link.
            $('.data-row-link').click(function (e) {
                e.preventDefault()
                $dataRow = $(this).next();
                $('.data-row:visible').slideUp(350)
                if (!$dataRow.is(':visible')) $(this).next().slideDown(350)
            });
            
            // Make ext links open in new window
            $('a').each(function() {
               var a = new RegExp('/' + window.location.host + '/');
               if(!a.test(this.href)) {
                   $(this).click(function(event) {
                       event.preventDefault();
                       event.stopPropagation();
                       window.open(this.href, '_blank');
                   });
               }
            });

            // one of 2 ways to call findAddress()
            $('#search-button').click(function(){
                app.util.moveMode = true
                var address = $('#search-input').val()
                var aisUrl = app.util.ais_api + address
                // AIS ajax
                $.ajax({
                    url: aisUrl,
                    data: {
                        format: 'json'
                    },
                    //error: function() {
                    //    alert('error')
                    //},
                    success: function(data) {
                        findAddress(data);
                    },
                    type: 'GET'
                })
            })

            // one of 2 ways to call findAddress()
            map.on('click', function(e) {
                app.util.moveMode = false
                // GIS query
                queryParcel.contains(e.latlng)
                queryParcel.run(function(error, featureCollection, response){  // this is a slow process - only want to do it once
                    var address = featureCollection.features[0].properties.ADDRESS
                    app.gis.curFeatGeo = featureCollection.features[0].geometry
                    drawPolygon(app.gis.curFeatGeo)
                    // AIS ajax
                    var aisUrl = app.util.ais_api + address
                    $.ajax({
                        url: aisUrl,
                        data: {
                            format: 'json'
                        },
                        success: function(data) {
                            findAddress(data);
                        },
                        type: 'GET'
                    });
                });
            });

            // This main function allows you to distinguish your address, and adds basic data to the UI
            function findAddress(data) {
                //set resolveAddress to .$Deferred()
                app.util.resolveAddress = $.Deferred();
                //reset opa variable
                app.util.opaNum = null
                app.util.opaRetrieved = false
                // empty the previous list of addresses left in modal
                $('#addressList').empty()

                // set the "curAIS" - might require selecting from modal
                if (data.features.length > 1) {
                    for (i = 0; i < data.features.length; i++){
                        $('#addressList').append('<li><a href="#" number='+i+'><span class="tab">'+data.features[i].properties.street_address+'</span></a></li>')
                    }
                    $('#addressModal').foundation('open');
                    $('#addressModal a').click(function(){
                        $('#search-input').val($(this).text())
                        $('#addressModal').foundation('close');
                        $('#addressList').empty()
                        app.ais.curAIS = data.features[$(this).attr('number')]
                        app.util.resolveAddress.resolve();
                    })

                } else {
                    app.ais.curAIS = data.features[0]
                    app.util.resolveAddress.resolve();
                }


                $.when(app.util.resolveAddress).done(function(){
                    // translate the coordinates from stateplane to latlon
                    var trans = proj4(app.util.firstProjection, app.util.secondProjection, app.ais.curAIS.geometry.coordinates)
                    var lon = trans[0]
                    var lat = trans[1]
                    latlon = new L.LatLng(lat,lon)
                    if (app.util.moveMode == true){  // this will be true if the search button was clicked, false if a parcel was clicked
                        map.setView(latlon, 18)
                        queryParcels(latlon) // the parcel query only needs to happen if the search button was clicked - if parcel was clicked it is already done
                    }

                    // add AIS data to UI
                    addAISDataToUI(app.ais.curAIS)
                    app.util.opaNum = app.ais.curAIS.properties.opa_account_num

                    // if it found an L&I address key, hit L&I API (set this so it only happens when you click the accordian)
                    if (app.ais.curAIS.properties.li_address_key != ''){
                        getLIData(app.ais.curAIS.properties.li_address_key)
                    }

                    // if OPA data row is open
                    //app.util.theattr = $('#opaDataRow').attr('style')
                    //console.log(app.util.theattr)
                    if ($('#opaDataRow').attr('style')=='display: block;'){
                        getOPAData(app.ais.curAIS.properties.opa_account_num)
                        //console.log('it is displayed')
                    //} else {
                    //    console.log('it is not displayed')
                    }

                }) // end of when

            }

            function addAISDataToUI(anAISFeature){
                for (key in anAISFeature.properties){
                    app.util.AISFeatKeys.push(key)
                }
                for (i = 0; i < app.util.AISFeatKeys.length; i++){
                    if (app.hooks[app.util.AISFeatKeys[i]]){
                        app.hooks[app.util.AISFeatKeys[i]].text(anAISFeature.properties[[app.util.AISFeatKeys[i]]]);
                    }
                }
            }

            // GIS
            // this is time-consuming - makes a call to //services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0
            // also, maybe should be renamed "getGeometry"
            function queryParcels(latlon){
                queryParcel.contains(latlon)
                queryParcel.run(function(error, featureCollection, response){  // you shouldn't do this again if you already have
                    app.gis.curFeatGeo = featureCollection.features[0].geometry
                    drawPolygon(app.gis.curFeatGeo)
                });
            }

            function drawPolygon(someGeometry){
                if (map.hasLayer(app.gis.curPolygon)){
                    map.removeLayer(app.gis.curPolygon)
                }
                app.gis.curFeatCoord_del = app.gis.curFeatGeo.coordinates[0]
                app.gis.curFeatFlipCoord_del = []
                for (i = 0; i < app.gis.curFeatCoord_del.length; i++){
                    app.gis.curFeatFlipCoord_del[i] = []
                    app.gis.curFeatFlipCoord_del[i][0] = app.gis.curFeatCoord_del[i][1]
                    app.gis.curFeatFlipCoord_del[i][1] = app.gis.curFeatCoord_del[i][0]
                }
                app.gis.curPolygon = L.polygon([app.gis.curFeatFlipCoord_del], {
                    color: 'blue',
                    weight: 2
                })
                map.addLayer(app.gis.curPolygon)
            }


            // OPA
            $('#opaTrig').click(function(){
                //if(app.ais.curAIS.properties.opa_account_num){
                if(app.util.opaNum && app.util.opaRetrieved == false){
                    getOPAData(app.ais.curAIS.properties.opa_account_num)
                }
            });

            function getOPAData(anAccount){
                var opaUrl = app.util.opa_api + anAccount //+ "?format=json"
                $.ajax({
                    url: opaUrl,
                    data: {
                        format: 'json'
                    },
                    success: function(data) {
                        app.opa.curOPA = data
                        addOPADataToUI()
                        app.util.opaRetrieved = true
                    },
                    type: 'GET'
                })
            }

            function addOPADataToUI(){
                //console.log('starting render')
                // Render owners

                app.hooks.propertyOwners.empty();
                app.opa.curOPA.data.property.ownership.owners.forEach(function(owner) {
                //state.opa.ownership.owners.forEach(function (owner) {
                    app.hooks.propertyOwners.append($('<div>').text(owner));
                });

                // Render improvement stuff
                //app.hooks.improvementDescription.text(app.opa.curOPA.data.property.characteristics.description);
                app.hooks.landArea.text(accounting.formatNumber(app.opa.curOPA.data.property.characteristics.land_area));
                app.hooks.improvementArea.text(accounting.formatNumber(app.opa.curOPA.data.property.characteristics.improvement_area));

                // Empty zoning in prep for details
                //app.hooks.zoning.empty();

                // Render sales details
                app.hooks.salesPrice.text(accounting.formatMoney(app.opa.curOPA.data.property.sales_information.sales_price));
                app.hooks.salesDate.text(app.util.formatSalesDate(app.opa.curOPA.data.property.sales_information.sales_date));

                app.hooks.assessedValue2017.text(accounting.formatMoney(app.opa.curOPA.data.property.valuation_history[0].market_value))



            }


            // L&I
            function getLIData(anID){
                //app.li.liDataCheck = {'basic': '', 'license': '', 'permit': ''}
                var basicUrl = app.util.li_api + "locations(" + anID + ")?$format=json"
                var licenseUrl = app.util.li_api + "locations(" + anID + ")/licenses?$format=json"
                var permitUrl = app.util.li_api + "locations(" + anID + ")/permits?$format=json"

                $.when(
                    $.ajax({
                        url: basicUrl,
                        data: {
                            format: 'json'
                        },
                        success: function(data) {
                            app.li.curLI_basic = data
                            //app.li.liDataCheck['basic'] = 1
                        },
                        type: 'GET'
                    }),
                    $.ajax({
                        url: licenseUrl,
                        data: {
                            format: 'json'
                        },
                        success: function(data) {
                            app.li.curLI_licenses = data
                            //app.li.liDataCheck['license'] = 1
                        },
                        type: 'GET'
                    }),
                    $.ajax({
                        url: permitUrl,
                        data: {
                            format: 'json'
                        },
                        success: function(data) {
                            app.li.curLI_permits = data
                            //app.li.liDataCheck['permit'] = 1
                        },
                        type: 'GET'
                    })
                ).done(function(){
                    //console.log(app.li.liDataCheck['basic'])
                    //console.log(app.li.liDataCheck['license'])
                    //console.log(app.li.liDataCheck['permit'])
                    addLIDataToUI();
                })
            }

            function addLIDataToUI(){
                if (app.li.curLI_licenses.d.results.length){
                    for (i = 0; i < app.li.curLI_licenses.d.results.length; i++){
                        LILicenses[i] = app.li.curLI_licenses.d.results[i].license_number
                    }
                }
            }


        }, // end of init
    }; // end of return
})();

$(function () {
    APP.init();
});


// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw