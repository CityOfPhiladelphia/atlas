var app = (function ()
{
  var DEBUG = true,
      map;
  
  return {
    // global app state
    state: {},
    
    // start app
    init: function ()
    {
      if (DEBUG) {
        $('#search-input').val('1234 market st');
      }
      
      var CITY_HALL = [39.952388, -75.163596];
      map = L.map('map', {
         zoomControl: false,
      //   measureControl: true,
      });
      map.setView(CITY_HALL, 16);
      
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
      
      var baseLayers = {
        'Light':    baseMapLight,
        'Dark':     baseMapDark,
        'Imagery 2015': baseMapImagery2015,
      };
      var overlays = {
        'Zoning':     overlayZoning,
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
        e.preventDefault();
        $dataRow = $(this).next();
        $('.data-row:visible').slideUp(350);
        if (!$dataRow.is(':visible')) $(this).next().slideDown(350);
      });
      
      // Make ext links open in new window
      $('a').each(function() {
         var a = new RegExp('/' + window.location.host + '/');
         if (!a.test(this.href)) {
           $(this).click(function (event) {
             event.preventDefault();
             event.stopPropagation();
             window.open(this.href, '_blank');
           });
         }
      });
      
      // listen for search
      $('#search-button').click(app.search);
      $('#search-input').keypress(function (e) {
        if (e.which === 13) app.search();
      });
    },
    
    search: function () {
      var val = $('#search-input').val(),
          url = '//api.phila.gov/ais/v1/addresses/' + encodeURIComponent(val);
      
      // display loading
      $('#data-panel-title').text('Loading...');
      
      // TODO close active tab, clear out displayed vals
      
      
      $.ajax({
        url: url,
        success: app.didGetAisResult,
        error: function (err) {
          console.log('ais error', err);
        },
      });
    },
    
    // takes a topic (formerly "data row") name and activates the corresponding
    // section in the data panel
    activateTopic: function (topic) {
      e.preventDefault();
      $dataRow = $(this).next();
      $('.data-row:visible').slideUp(350);
      if (!$dataRow.is(':visible')) $(this).next().slideDown(350);
    },
    
    didGetAisResult: function (data) {
      // set app state
      app.state.ais = data;
      
      // get values
      var obj = data.features[0],
          props = obj.properties,
          streetAddress = props.street_address;
      
      // make mailing address
      var mailingAddress = streetAddress + '<br>PHILADELPHIA, PA ' + props.zip_code;
      if (props.zip_4) mailingAddress += '-' + props.zip_4;
      
      // render ais data
      $('#data-panel-title').text(streetAddress);
      $('#basic-info-mailing-address').html(mailingAddress);
      $('#basic-info-street-code').text(data.features[0].properties.street_code);
      
      // show basic info
      $('#data-row-link-basic-info').click();
      
      // get topics
      app.getTopics(props);
    },
    
    // initiates requests to topic APIs (OPA, L&I, etc.)
    getTopics: function (aisProps) {
      // opa
      var opaAccountNum = aisProps.opa_account_num;
      $.get({
        url: '//data.phila.gov/resource/w7rb-qrn8.json?parcel_number=' + opaAccountNum,
        success: app.didGetOpaResult,
        error: function (err) {
          console.log('opa error', err);
        },
      });
      
      // l&i
    },
    
    // takes an object of divId => text and renders
    renderDivs: function (valMap) {
      _.forEach(valMap, function (val, divId) {
        $('#' + divId).text(val);
      });
    },
    
    didGetOpaResult: function (data)
    {
      // this is a POC, so let's populate some divs by hand ¯\_(ツ)_/¯
      console.log('got opa', data);
      
      var props = data[0];
      
      // concat owners
      var owners = [props.owner_1];
      if (props.owner_2) owners.push(props.owner_2);
      var ownersJoined = owners.join(', ');
      
      // OLD METHOD: map div ids to prop keys
      
      // // div id => prop key
      // var fieldMap = {
      //   'property-account-num':   'parcel_number',
      //   'property-sale-date':     'sale_date',
      //   'property-sale-price':    'sale_price',
      //   'property-value':         'market_value',
      // };
      
      // // make dict of vals to render
      // var vals = _.mapValues(fieldMap, function (propKey) {
      //   return props[propKey]
      // });
      
      // NEW METHOD: do this manually, because some vals have to be handled manually
      var vals = {
        'property-account-num':         props.parcel_number,
        'property-sale-date':           props.sale_date,
        'property-sale-price':          props.sale_price,
        'property-value':               props.market_value,
        'property-owners':              ownersJoined,
        'property-land-area':           props.total_livable_area,
        'property-improvement-area':    props.total_area,
      };
      
      app.renderDivs(vals);
      
      // TODO update prop search link
    },
    
  };
})();

$(function () {
  app.init();
});


// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw