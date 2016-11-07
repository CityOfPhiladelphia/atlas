/* global L, _, $ */

/*
NOTE: this is just a demo - lots of jQuery soup ahead :)
*/

/*$(window).bind('storage', function (e) {
     console.log(e.originalEvent.key, e.originalEvent.newValue);
});*/

var app = (function ()
{
  // debug stuff
  var DEBUG = true,
      DEBUG_ADDRESS = '1234 market st';

  var map;

  return {
    config: {
      ais: {
        url: '//api.phila.gov/ais/v1/addresses/',
        gatekeeperKey: '35ae5b7bf8f0ff2613134935ce6b4c1e',
      },
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
      map: {
        parcelLayerUrl: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0',
      },
      pictometry: {
        pictometryUrl: 'http://192.168.104.182/philapictometry/ipa.php',
      },
      cyclomedia: {
        cyclomediaUrl: 'http://192.168.104.182/philacyclo/',
      }
    },

    // global app state
    state: {},

    // start app
    init: function ()
    {
      DEBUG && $('#search-input').val(DEBUG_ADDRESS);

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

      // make "Obilque Imagery" button open Pictometry window
      $('#pict-button').on('click', function(e){
        e.preventDefault();
        window.open(app.config.pictometry.pictometryUrl, app.config.pictometry.pictometryUrl);
        return false
      });

      // make "Street View" button open Cyclomedia window
      $('#cyclo-button').on('click', function(e){
        e.preventDefault();
        window.open(app.config.cyclomedia.cyclomediaUrl, app.config.cyclomedia.cyclomediaUrl);
        return false
      });
    },

    search: function () {
      app.state.clickedOnMap = false;
      app.state.map.shouldPan = true;
      var val = $('#search-input').val();

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
      app.getAis(val);
    },

    getAis: function (address) {
      var url = app.config.ais.url + encodeURIComponent(address),
          params = {gatekeeperKey: app.config.ais.gatekeeperKey};
      $.ajax({
        url: url,
        data: params,
        success: function (data) {
          app.state.ais = data;
          // if more than one address result, show a modal
          if (data.features.length > 1) app.showMultipleAisResultModal();
          else {
            app.state.selectedAddress = data.features[0].properties.street_address;
            app.didGetAisResult();
          }
        },
        error: function (err) {
          console.log('ais error', err);
        },
      });
    },

    showMultipleAisResultModal: function (callback) {
      var data = app.state.ais;

      // construct modal dom element
      for (i = 0; i < data.features.length; i++) {
        $('#addressList').append('<li><a href="#" number='+i+'><span class="tab">'+data.features[i].properties.street_address+'</span></a></li>')
      }
      $('#addressModal').foundation('open');

      // called after user selects address
      $('#addressModal a').click(function () {
        $('#search-input').val($(this).text())
        $('#addressModal').foundation('close');
        $('#addressList').empty()

        // store selected address in state
        var selectedIndex = $(this).attr('number');
            selectedAddressObj = data.features[selectedIndex],
            selectedAddress = selectedAddressObj.properties.street_address;
        app.state.selectedAddress = selectedAddress;
        app.didGetAisResult();
        // app.map.didSelectAddress();

        // write to history
        // var params = {'address': selectedAddress}
        // var queryStringParams = app.util.serializeQueryStringParams(params)
        // history.replaceState(null, null, '?' + queryStringParams)


        // if (!app.state.map.clickedOnMap) {
        //     //console.log('it routed to clickedonmap false')
        //     app.map.getGeomFromLatLon(latlon);
        // } else {
        //     //console.log('it routed to straight to flipCoords')
        //     app.map.flipCoords(app.state.map.curFeatGeo);
        // }

        // TODO render topics

        // TODO update history
        // app.util.history()

        // finish

        // draw polygon
        // app.map.drawPolygon(app.state.map.curFeatGeo)
        // app.map.drawParcel();

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

    didGetAisResult: function () {
      // set app state
      // app.state.ais = data;
      var data = app.state.ais;

      // get values
      var selectedAddress = app.state.selectedAddress,
          obj;
      if (selectedAddress) {
        obj = _.filter(data.features, {properties: {street_address: selectedAddress}})[0];
      }
      else obj = data.features[0]
      var props = obj.properties,
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

      // render map for this address
      if (selectedAddress) app.map.renderAisResult(obj);

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
      
      // get dor parcel
      // TEST 001S070144
      var dorParcelId = app.state.ais.features[0].properties.dor_parcel_id;
      console.log('parcel', dorParcelId);
      app.state.dor = undefined;
      // $.ajax({
      //   url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Parcel/FeatureServer/0/query?where=MAPREG%3D',
      //   data: {
      //     where: encodeURIComponent("MAPREG='" + dorParcelId + '"'),
      //     outFields: '*',
      //     f: 'geojson',
      //   },
      //   success: function (data) {
      //     app.state.dor = data;
      //     app.didGetDorResult();
      //   },
      //   error: function (err) {
      //     console.log('get dor error', err);
      //   },
      // });
      var dorParcelQuery = L.esri.query({url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Parcel/FeatureServer/0'});
      dorParcelQuery.where("MAPREG = '" + dorParcelId + "'");
      dorParcelQuery.run(app.didGetDorResult);
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


        // set table content
        var $liSectionTable = $('#li-table-' + stateKey);
        $liSectionTable.find('tbody').html(rowsHtml);

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
              // TODO form real url
              seeMoreUrl = 'http://li.phila.gov/#summary?address=1234+market+st',
              seeMoreHtml = '<a class="external li-see-more-link" href="' + seeMoreUrl + '">' + seeMoreText + '</a>',
              $seeMoreLink = $(seeMoreHtml);
          $liSectionTable.after($seeMoreLink);
        }
      });
    },
    
    didGetDorResult: function (error, featureCollection, response) {
      // TODO handle error
      if (error || !featureCollection || featureCollection.features.length === 0) {
        console.log('dor error', error);
        return;
      }
      
      // set state
      app.state.dor = featureCollection;
      
      // TODO for right now, we're just taking the first parcel if there's more than one
      var parcel = featureCollection.features[0],
          props = parcel.properties;
          parcelId = props.MAPREG;
      
      // clean up attributes
      var ADDRESS_FIELDS = ['HOUSE', 'SUFFIX', 'STDIR', 'STNAM', 'STDES', 'STDESSUF'],
          comps = _.map(_.pick(props, ADDRESS_FIELDS), app.util.cleanDorAttribute),
          // TODO handle individual address comps (like mapping stex=2 => 1/2)
          // addressLow = comps.HOUSE,
          // addressHigh = comps.STEX,
          // streetPredir = comps.STDIR,
          // streetName = comps.STNAM,
          // streetSuffix = comps.STDES,
          // streetPostdir = comps.STDESSUF,
          
          // remove nulls and concat
          address = _.compact(comps).join(' ');

      // render
      $('#land-records-parcel-id').html(parcelId);
      $('#land-records-parcel-address').html(address);
    },
  };
})();

$(function () {
  app.init();
});


// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw
