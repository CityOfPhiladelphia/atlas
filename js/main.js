/* global L, _, $ */

var app = (function ()
{
  // debug stuff
  var DEBUG = true,
      DEBUG_ADDRESS = '1234 market st';
  
  var map;
  
  return {
    config: {
      // l&i config, denormalized by section for convenience
      li: {
        socrataIds: {
          'permits':          'uukf-7jf3',
          'appeals':          '3tq7-6fj4',
          'inspections':      'fypy-ek77',
          'violations':       'cctq-fx48',
        },
        // maps internal names to socrata fields. conveniently, these all have
        // (essentially) the same set of fields so the names can be consistent.
        // (id, date, description, status)
        fieldMap: {
          'permits': {
            'id':                 'permitnumber',
            'date':               'permitissuedate',
            'description':        'permitdescription',
            'status':             'status',
          },
          'appeals': {
            'id':                 'appealkey',
            'date':               'processeddate',
            'description':        'appealgrounds',
            'status':             'decision',
          },
          'inspections': {
            'id':                 'apinspkey',
            'date':               'inspectioncompleted',
            'description':        'inspectiondescription',
            'status':             'inspectionstatus',
          },
          'violations': {
            'id':                 'apfailkey',
            'date':               'violationdate',
            'description':        'violationdescription',
            'status':             'status',
          },
        },
        // for sorting l&i records
        // dateFields: {
        //   'permits':          'permitissuedate',
        //   'appeals':          'processeddate',
        //   'inspections':      'inspectioncompleted',
        //   'violations':       'violationdate',
        // },
        recordLimit: 5,
        // these are the columns to show in each l&i section (using mapped
        // field names)
        // displayFields: {
        //   'permits':          ['issuedDate', 'id', 'description', 'status'],
        //   'appeals':          ['processedDate', 'id', 'grounds', 'decision'],
        //   'inspections':      ['completedDate', 'id', 'description', 'status'],
        //   'violations':       ['recordedDate', 'id', 'description', 'status'],
        // },
        displayFields:        ['date', 'id', 'description', 'status',],
      },
    },
    
    // global app state
    state: {},
    
    // start app
    init: function ()
    {
      DEBUG && $('#search-input').val(DEBUG_ADDRESS);
      
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
        var $dataRow = $(this).next();
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
      
      // clean up UI from last search
      // TODO make this a function
      $('.li-see-more-link').remove();
      
      // clear out relevant state objects
      _.forEach(['ais', 'opa', 'li'], function (stateProp) {
        app.state[stateProp] = undefined;
      });
      
      // fire off ais
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
      // e.preventDefault();
      var $dataRow = $(this).next();
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
      app.state.li = {};
      var liAddressKey = aisProps.li_address_key,
          liDeferreds;
      // create an array of Deferred objects for each l&i request
      liDeferreds =_.map(app.config.li.socrataIds, function (liSocrataId, liStateKey) {
            var url = '//data.phila.gov/resource/' + liSocrataId + '.json',
                params = {addresskey: liAddressKey};
            return $.ajax({
              url: url,
              data: params,
              success: function (data) {
                app.state.li[liStateKey] = data;
                
                // check for complete results
                var liStateKeys = Object.keys(app.config.li.socrataIds),
                    shouldContinue = _.every(_.map(liStateKeys, function (liStateKey) {
                      return app.state.li[liStateKey];
                    }));
                if (shouldContinue) app.didGetAllLiResults();
              },
              error: function (err) {
                console.log('li error', err);
              },
            });
          });
      // fire deferreds
      // this is nice and  elegant but the callback is firing before the 
      // individual callbacks have completed. commenting out for now.
      // $.when(liDeferreds).then(app.didGetAllLiResults);
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
    
    didGetAllLiResults: function ()
    {
      var stateKeys = Object.keys(app.config.li.socrataIds),
          displayFields = app.config.li.displayFields,
          liState = app.state.li,
          fieldMap = app.config.li.fieldMap,
          recordLimit = app.config.li.recordLimit;
      
      // loop over sections ("state keys")
      _.forEach(stateKeys, function (stateKey) {
        console.log('state key', stateKey);
        var items = liState[stateKey],
            dateField = app.config.li.fieldMap[stateKey].date,
            rowsHtml = '';
        
        // sort by date
        var itemsSorted = _.orderBy(items, dateField, ['desc']);
        
        // limit
        var itemsLimited = itemsSorted.slice(0, recordLimit);
        
        // loop over rows
        _.forEach(itemsLimited, function (item) {
          var rowHtml = '';
          
          // loop over columns
          _.forEach(displayFields, function (displayField) {
            // de-map field
            var sourceField = fieldMap[stateKey][displayField],
            // get value
                val = item[sourceField] || '';
            // add column
            rowHtml += '<td>' + val + '</td>';
          });
          
          // add row
          rowHtml = '<tr>' + rowHtml + '</tr>';
          rowsHtml += rowHtml;
        });
      
        console.log('rows for ' + stateKey, rowsHtml);
        
        // set table content
        var $liSectionTable = $('#li-table-' + stateKey);
        console.log('sectiontable', $liSectionTable);
        $liSectionTable.find('tbody').html(rowsHtml);
        console.log('tbody', $liSectionTable.find('tbody'));
        
        // update count
        var count = items.length,
            countText = ' (' + count + ')',
            $liCount = $('#li-section-' + stateKey + ' > .topic-subsection-title > .li-count');
        $liCount.text(countText);
        
        // add "see more" link, if there are rows not shown
        if (count > recordLimit) {
          var remainingCount = count - recordLimit,
              plural = remainingCount > 1,
              resourceNoun = plural ? stateKey : stateKey.slice(0, -1),
              seeMoreText = 'See ' + remainingCount + ' older ' + resourceNoun,
              seeMoreUrl = 'http://li.phila.gov/#summary?address=1234+market+st',
              seeMoreHtml = '<a class="external li-see-more-link" href="' + seeMoreUrl + '">' + seeMoreText + '</a>',
              $seeMoreLink = $(seeMoreHtml);
          $liSectionTable.after($seeMoreLink);
        }
      });
    },
  };
})();

$(function () {
  app.init();
});


// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw