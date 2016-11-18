/* global L, _, $, history */

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

      map: {},

      topicRecordLimit: 5,

      //parcelLayerUrl: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0',
      parcelLayerUrl: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Parcel/FeatureServer/0',

      pictometry: {
        pictometryUrl: 'http://192.168.104.182/philapictometry/ipa.php',
      },
      cyclomedia: {
        cyclomediaUrl: 'http://192.168.104.182/philacyclo/',
      },

      // socrataAppToken: 'bHXcnyGew4lczXrhTd7z7DKkc',
      // socrataAppToken: 'wEPcq2ctcmWapPW7v6nWp7gg4',
      socrata: {
        baseUrl: '//data.phila.gov/resource/',
      },

      nearby: {
        // in feet
        radius: 500,
      },
    },

    // global app state
    state: {
      // prevent topics from opening until we've completed a search
      shouldOpenTopics: false,
    },

    // start app
    init: function ()
    {
      DEBUG && $('#search-input').val(DEBUG_ADDRESS);

      // set up accounting
      accounting.settings.currency.precision = 0;

      // listen for clicks on topics
      $('.topic-link').click(function (e) {
        e.preventDefault();
        var $this = $(this),
            topicName = $this.attr('id').replace('topic-link-', '');
        app.toggleTopic(topicName);
      });

      // listen for sort events on nearby appeals
      $("input[name='nearby-appeals-sort-by'").click(function (e) {
        var sortBy = $(this).attr('value');
        app.sortNearbyAppealsBy(sortBy);
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
      $('#search-button').click(app.didClickSearch);
      $('#search-input').keypress(function (e) {
        if (e.which === 13) app.didClickSearch();
      });

      // make "Obilque Imagery" button open Pictometry window
      $('#pict-button').on('click', function (e){
        e.preventDefault();
        window.open(app.config.pictometry.pictometryUrl, app.config.pictometry.pictometryUrl);
        return false
      });

      // make "Street View" button open Cyclomedia window
      $('#cyclo-button').on('click', function (e){
        e.preventDefault();
        window.open(app.config.cyclomedia.cyclomediaUrl, app.config.cyclomedia.cyclomediaUrl);
        return false
      });

      // clear active topic in localStorage
      localStorage.removeItem('activeTopic');

      // listen for hash changes
      // $(window).on('hashchange', app.route);

      // listen for back button
      window.onpopstate = function () {
        console.log('popped state', location.href);
        app.route();
      };

      // route one time on load
      app.route();
    },

    route: function () {
      var hash = location.hash,
          params = app.util.getQueryParams(),
          comps = hash.split('/');

      // if there are query params
      var searchParam = params.search;
      if (searchParam) {
        console.log('route, we have a search', searchParam);
        app.searchForAddress(searchParam);
        // TODO fix url
        return;
      }

      // check for enough comps (just 2, since topic is optional)
      if (comps.length < 2) {
        console.log('route, but not enough comps', comps);
        return;
      }

      var address = comps[1],
          topic = comps.length > 2 ? comps[2] : null,
          state = history.state;

      // activate topic
      // topic && app.activateTopic(topic);
      app.state.activeTopic = topic;

      // if there's no ais in state, go get it
      if (!(state && state.ais)) {
        app.searchForAddress(address);
        return;
      }

      // rehydrate state
      var ais = state.ais;
      app.state.ais = ais;
      app.didGetAisResult();

      // get topics
      // app.getTopics();
    },

    didClickSearch: function () {
      app.state.clickedOnMap = false;
      app.state.map.shouldPan = true;

      var val = $('#search-input').val();

      // display loading
      $('#topic-panel-title').text('Loading...');

      // clean up UI from last search
      // TODO make this a function
      $('.li-see-more-link').remove();

      // clear out relevant state objects
      _.forEach(['ais', 'opa', 'li'], function (stateProp) {
        app.state[stateProp] = undefined;
      });

      // fire off ais
      app.searchForAddress(val);
    },

    // fires ais search
    searchForAddress: function (address) {
      var url = app.config.ais.url + encodeURIComponent(address),
          params = {
            gatekeeperKey: app.config.ais.gatekeeperKey,
            // include_units: '',
          };
      $.ajax({
        url: url,
        data: params,
        success: function (data) {
          // console.log('got ais', data);
          app.state.shouldOpenTopics = true;
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
          $('#no-results-modal').foundation('open');
        },
      });
    },

    showMultipleAisResultModal: function (callback) {
      // console.log('show multiple ais modal');
      var data = app.state.ais;

      $('#addressList').empty();

      // construct modal dom element
      for (var i = 0; i < data.features.length; i++) {
        $('#addressList').append('<li><a href="#" number=' + i + '><span class="tab">' + data.features[i].properties.street_address + '</span></a></li>');
      }
      $('#addressModal').foundation('open');

      // called after user selects address
      $('#addressModal a').click(function (e) {
        e.preventDefault();

        // $('#search-input').val($(this).text())
        $('#addressModal').foundation('close');
        $('#addressList').empty()

        // store selected address in state
        var selectedIndex = $(this).attr('number'),
            selectedAddressObj = data.features[selectedIndex],
            selectedAddress = selectedAddressObj.properties.street_address;
        app.state.selectedAddress = selectedAddress;
        app.didGetAisResult();
      });
    },

    // takes a topic (formerly "data row") name and activates the corresponding
    // section in the data panel
    activateTopic: function (targetTopicName) {
      // console.log('activate topic', targetTopicName);
      // prevent topics from opening until we have at least AIS (arbitrary , but should work)
      var ais = app.state.ais;
      // if (!ais) return;

      // update url, eg /#/1234 MARKET ST/property
      var address = app.state.ais.features[0].properties.street_address,
          hash = app.util.constructHash(address, targetTopicName),
          // pare down state to something serializable
          state = {ais: ais};
      history.replaceState(state, '', hash);

      app.state.activeTopic = targetTopicName;

      var $targetTopic = $('#topic-' + targetTopicName);

      // get the currently active topic
      var $activeTopic = $('.topic:visible');

      // only activate if it's not already active
      if ($targetTopic.is($activeTopic)) {
        console.log('activate topic, but its already active');
        return;
      }

      $activeTopic.slideUp(350);
      $targetTopic.slideDown(350);

      // tell map about it
      var prevTopic;
      if ($activeTopic.length > 0) {
        prevTopic = $activeTopic.attr('id').replace('topic-', '');
      } else {
        prevTopic = null;
      }
      app.map.didChangeTopic(prevTopic, targetTopicName);
    },

    toggleTopic: function (targetTopicName) {
      var $targetTopic = $('#topic-' + targetTopicName);

      // if it's already visible, hide it
      if ($targetTopic.is(':visible')){
        $targetTopic.slideUp(350);
        app.map.didChangeTopic(targetTopicName, null);
        // app.map.didDisactivateTopic(targetTopicName);

        // remove topic from url
        var hashNoTopic = location.hash.split('/').slice(0, 2).join('/');
        history.pushState(history.state, '', hashNoTopic);
      }

      // otherwise, activate
      else app.activateTopic(targetTopicName);
    },

    didGetAisResult: function () {
      // console.log('did get ais result');

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
      // var mailingAddress = streetAddress + '<br>PHILADELPHIA, PA ' + props.zip_code;
      // if (props.zip_4) mailingAddress += '-' + props.zip_4;
      var line2 = 'PHILADELPHIA, PA ' + props.zip_code;
      if (props.zip_4) line2 += '-' + props.zip_4;

      // hide greeting if it's there
      var $topicPanelHeaderGreeting = $('#topic-panel-header-greeting');
      if ($topicPanelHeaderGreeting.is(':visible')) {
        $topicPanelHeaderGreeting.fadeOut(175, function () {
          $('#topic-panel-header-address').fadeIn(175);
        });
      }

      // render ais data
      $('#topic-panel-title').text(streetAddress);
      // $('#address-info-mailing-address').html(mailingAddress);
      $('#topic-panel-header-address-line-1').html(streetAddress);
      $('#topic-panel-header-address-line-2').html(line2);

      $('#address-info-street-code').text(data.features[0].properties.street_code);
      // $('#zoning-code').text(props.zoning);

      // render map for this address
      if (selectedAddress) app.map.renderAisResult(obj);

      // get topics
      // app.getTopics(props);
      app.getTopics();

      // push state
      var nextState = {ais: app.state.ais},
          nextTopic = app.state.activeTopic || 'property',
          nextHash = app.util.constructHash(streetAddress, nextTopic);
      history.pushState(nextState, null, nextHash);

      // if no topic is active, activate property
      // if (!app.state.nextTopic) {}
      app.activateTopic(nextTopic);
    },

    showContentForTopic: function (topic) {
      // show "no content"
      var topicDivId = '#topic-' + topic,
          $topicContent = $(topicDivId + ' > .topic-content'),
          $topicNoContent = $(topicDivId + ' > .topic-content-not-found');
      $topicContent.show();
      $topicNoContent.hide();
    },

    hideContentForTopic: function (topic) {
      // show "no content"
      var topicDivId = '#topic-' + topic,
          $topicContent = $(topicDivId + ' > .topic-content'),
          $topicContentNotFound = $(topicDivId + ' > .topic-content-not-found');
      $topicContent.hide();
      $topicContentNotFound.show();
    },

    // initiates requests to topic APIs (OPA, L&I, etc.)
    getTopics: function () {
      // console.log('get topics');

      // show accordion
      // doing this in route now
      // $('#topic-list').show();

      var aisProps = app.state.ais.features[0].properties,
          aisAddress = aisProps.street_address;

      // opa
      var opaAccountNum = aisProps.opa_account_num;
      if (opaAccountNum) {
        $.get({
          url: '//data.phila.gov/resource/w7rb-qrn8.json?parcel_number=' + opaAccountNum,
          success: app.didGetOpaResult,
          error: function (err) {
            console.log('opa error', err);
          },
        });
      } else {
        app.hideContentForTopic('property');
      }

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
      // this is nice and elegant but the callback is firing before the
      // individual callbacks have completed. commenting out for now.
      // $.when(liDeferreds).then(app.didGetAllLiResults);

      // DOR
      // get parcel id and try to reuse a parcel from state (i.e. user clicked map)
      var aisParcelId = app.state.ais.features[0].properties.dor_parcel_id,
          stateParcel = app.state.dor && app.state.dor.features ? app.state.dor.features[0] : null;

      // clear els
      _.forEach(['id', 'address', 'status', 'air-rights', 'condo'], function (tag) {
        var $el = $('#deeds-' + tag);
        $el.empty();
      });

      // if we already have the parcel
      if (stateParcel && stateParcel.properties.MAPREG === aisParcelId) {
        app.renderParcelTopic();
      }
      // otherwise we don't have a parcel, so go get one (but only if we have a parcel id)
      else if (aisParcelId) {
        app.getParcelById(aisParcelId, function () {
          // console.log('got parcel by id', app.state.dor);
          app.renderParcelTopic();
          app.map.drawParcel();
        });
      }

      // get dor documents
      $.ajax({
        url: '//ase.phila.gov/arcgis/rest/services/RTT/MapServer/0/query',
        // url: '//192.168.103.143:6443/arcgis/rest/services/RTT/MapServer/0/query',
        data: {
          where: "ADDRESS = '" + aisAddress + "'",
          outFields: '*',
          f: 'json',
        },
        success: function (data) {
          app.state.dorDocuments = data;
          app.didGetDorDocuments();
        },
        error: function (err) {
          console.log('dor document error', err);
        },
      });

      // get zoning
      var aisGeom = app.state.ais.features[0].geometry;

      var zoningBaseQuery = L.esri.query({url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/'});
      zoningBaseQuery.contains(aisGeom);
      zoningBaseQuery.run(app.didGetZoningBaseResult);

      var zoningOverlayQuery = L.esri.query({url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/1'});
      zoningOverlayQuery.contains(aisGeom);
      zoningOverlayQuery.run(app.didGetZoningOverlayResult);

      /*
      NEARBY
      */

      // appeals
      var aisX = aisGeom.coordinates[0],
          aisY = aisGeom.coordinates[1],
          radiusMeters = app.config.nearby.radius * 0.3048,
          nearbyAppealsUrl = app.config.socrata.baseUrl + app.config.li.socrataIds.appeals + '.json',
          // nearbyAppealsQuery = 'DISTANCE_IN_METERS(location, POINT(' + aisX + ',' + aisY + ')) <= ' + radiusMeters;
          nearbyAppealsWhere = 'within_circle(' + ['shape', aisY, aisX, radiusMeters].join(', ') + ')',
          nearbyAppealsSelectComps = [
            'processeddate',
            'appealkey',
            'address',
            'appealgrounds',
            'decision',
            'shape',
            "DISTANCE_IN_METERS(shape, 'POINT(" + aisX + ' ' + aisY + ")') * 3.28084 AS distance",
          ],
          nearbyAppealsSelect = nearbyAppealsSelectComps.join(', ');
      // exclude appeals at the exact address
      if (liAddressKey) nearbyAppealsWhere += " AND addresskey != '" + liAddressKey + "'";

      $.ajax({
        url: nearbyAppealsUrl,
        data: {
          $where: nearbyAppealsWhere,
          $select: nearbyAppealsSelect,
        },
        success: function (data) {
          if (!app.state.nearby) app.state.nearby = {};
          app.state.nearby.appeals = data;
          app.didGetNearbyAppeals();
        },
        error: function (err) {
          console.log('nearby appeals error', err);
        },
      });

      // show topics
      $('#topic-list').show();

      // if no topic is active, show property
      // $('.topic:visible').length === 0 && app.activateTopic('property');
    },

    // TODO confirm these
    PARCEL_STATUS: {
      1:  'Active',
      2:  'Inactive',
      3:  'Trans',
    },

    // render deeds (assumes there's a parcel in the state)
    renderParcelTopic: function () {
      // console.log('render parcel topic');

      if (!app.state.dor.features[0]) {
        console.log('render parcel topic, but no parcel feature', app.state.dor);
        return;
      }

      var parcel = app.state.dor.features[0],
          props = parcel.properties,
          parcelId = props.MAPREG,
          address = app.util.concatDorAddress(parcel);

      $('#deeds-address').html(address);
      $('#deeds-id').html(parcelId);
      $('#deeds-status').html(app.PARCEL_STATUS[props.STATUS]);
      $('#deeds-air-rights').html(props.SUFFIX === 'A' ? 'Yes' : 'No');
      $('#deeds-condo').html(props.CONDOFLAG === 1 ? 'Yes' : 'No');
    },

    // takes an object of divId => text and renders
    renderDivs: function (valMap) {
      _.forEach(valMap, function (val, divId) {
        $('#' + divId).text(val);
      });
    },

    didGetOpaResult: function (data)
    {
      // console.log('did get opa result', data);

      // if no data, hide
      if (data.length < 1) {
        app.hideContentForTopic('property');
        return;
      }

      // this is a POC, so let's populate some divs by hand ¯\_(ツ)_/¯
      var props = data[0];

      // concat owners
      var owners = [props.owner_1 || 'None'];
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
        'property-account-num':         props.parcel_number || 'None',
        'property-sale-date':           props.sale_date || 'None',
        'property-sale-price':          props.sale_price || 'None',
        'property-value':               props.market_value || 'None',
        'property-owners':              ownersJoined || 'None',
        'property-land-area':           props.total_livable_area || 'None',
        'property-improvement-area':    props.total_area || 'None',
      };

      app.renderDivs(vals);

      // update prop search link
      var propertySearchUrl = 'http://property.phila.gov/?an=' + props.parcel_number;
      $('#property-search-link').attr('href', propertySearchUrl);

      // format fields
      app.util.formatTableFields($('#topic-property table'));

      // show content
      app.showContentForTopic('property');
    },

    didGetAllLiResults: function ()
    {
      var stateKeys = Object.keys(app.config.li.socrataIds),
          displayFields = app.config.li.displayFields,
          liState = app.state.li,
          fieldMap = app.config.li.fieldMap,
          recordLimit = app.config.topicRecordLimit;

      // clean up links
      $('.li-see-more-link').remove();

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
        // TEMP since we moved appeals to zoning
        var $liSectionTable;
        if (stateKey === 'appeals') {
         $liSectionTable = $('#zoning-appeals');
        }
        else {
          $liSectionTable = $('#li-table-' + stateKey);
        }
        $liSectionTable.find('tbody').html(rowsHtml);

        // update count
        var count = items.length,
            countText = ' (' + count + ')',
            $liCount = $('#li-section-' + stateKey + ' > .topic-subsection-title > .li-count');
        // TEMP for appeals
        if (stateKey === 'appeals') $liCount = $('#zoning-appeals-count');
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

        // format fields
        app.util.formatTableFields($liSectionTable);
      });
    },

    didGetZoningOverlayResult: function (error, featureCollection, response) {
      var features = featureCollection.features,
          $tbody = $('#zoning-overlays').find('tbody'),
          fields = ['OVERLAY_NAME', 'CODE_SECTION'],
          tbodyHtml = app.util.makeTableRowsFromGeoJson(features, fields);
      $tbody.html(tbodyHtml);

      var count = features.length;
      $('#zoning-overlays-count').html(' (' + count + ')');
    },

    // long code => description
    ZONING_CODE_MAP: {
      'RSD-1': 'Residential Single Family Detached-1',
      'RSD-2': 'Residential Single Family Detached-2',
      'RSD-3': 'Residential Single Family Detached-3',
      'RSA-1': 'Residential Single Family Attached-1',
      'RSA-2': 'Residential Single Family Attached-2',
      'RSA-3': 'Residential Single Family Attached-3',
      'RSA-4': 'Residential Single Family Attached-4',
      'RSA-5': 'Residential Single Family Attached-5',
      'RTA-1': 'Residential Two-Family Attached-1',
      'RM-1': 'Residential Multi-Family-1',
      'RM-2': 'Residential Multi-Family-2',
      'RM-3': 'Residential Multi-Family-3',
      'RM-4': 'Residential Multi-Family-4',
      'RMX-1': 'Residential Mixed-Use-1',
      'RMX-2': 'Residential Mixed-Use-2',
      'RMX-3': 'Residential (Center City) Mixed-Use-3',
      'CA-1': 'Auto-Oriented Commercial-1',
      'CA-2': 'Auto-Oriented Commercial-2',
      'CMX-1': 'Neighborhood Commercial Mixed-Use-1',
      'CMX-2': 'Neighborhood Commercial Mixed-Use-2',
      'CMX-2.5': 'Neighborhood Commercial Mixed-Use-2.5',
      'CMX-3': 'Community Commercial Mixed-Use',
      'CMX-4': 'Center City Commercial Mixed-Use',
      'CMX-5': 'Center City Core Commercial Mixed-Use',
      'I-1': 'Light Industrial',
      'I-2': 'Medium Industrial',
      'I-3': 'Heavy Industrial',
      'I-P': 'Port Industrial',
      'ICMX': 'Industrial Commercial Mixed-Use',
      'IRMX': 'Industrial Residential Mixed-Use',
      'SP-ENT': 'Commercial Entertainment (Casinos)',
      'SP-AIR': 'Airport',
      'SP-INS': 'Institutional Development',
      'SP-STA': 'Stadium',
      'SP-PO-A': 'Recreation',
      'SP-PO-P': 'Recreation',
    },

    didGetZoningBaseResult: function (error, featureCollection, response) {
      var feature = featureCollection.features[0];

      if (!feature) {
        console.log('could not get zoning base', error, featureCollection);
        return;
      }

      var props = feature.properties,
          longCode = props.LONG_CODE;
      $('#zoning-code').html(longCode);

      var desc = app.ZONING_CODE_MAP[longCode];
      if (desc) $('#zoning-description').html(desc);
    },

    // get a parcel by parcel id
    getParcelById: function (id, callback) {
      if (!id) {
        console.log('get parcel by id, but null');
        return;
      }
      // console.log('get parcel by id: ', id);

      // OLD METHOD
      // var parcelQuery = L.esri.query({url: app.config.map.parcelLayerUrl});
      // parcelQuery.where("MAPREG = '" + id + "'");
      // parcelQuery.run(app.didGetParcelQueryResult);

      // clear state
      // app.state.dor = undefined;

      $.ajax({
        url: app.config.parcelLayerUrl + '/query',
        data: {
          where: "MAPREG = '" + id + "' AND STATUS IN (1, 3)" ,
          outSR: 4326,
          outFields: '*',
          f: 'geojson',
        },
        success: function (data) {
          // AGO returns json with plaintext headers, so parse
          data = JSON.parse(data);

          // check data
          if (data.features.length === 0) {
            console.log('got parcel but 0 features', this.url);
          }

          app.state.dor = data;
          callback && callback();

          app.showContentForTopic('deeds');
        },
        error: function (err) {
          console.log('get parcel by id error', err);
          app.hideContentForTopic('deeds');
        },
      });
    },

    // get a parcel by a leaflet latlng
    getParcelByLatLng: function (latLng, callback) {
      // console.log('get parcel by latlng');

      // clear state
      // disabling this because if the new query doesn't return anything,
      // we don't want to flush out the current dor parcel
      // app.state.dor = undefined;

      var parcelQuery = L.esri.query({url: app.config.parcelLayerUrl});
      parcelQuery.contains(latLng);
      parcelQuery.where('STATUS IN (1, 3)')
      parcelQuery.run(function (error, featureCollection, response) {
        if (error || !featureCollection) {
          console.log('get parcel by latlng error', error);
          return;
        }

        // if empty response
        if (featureCollection.features.length === 0) {
          // show alert
          $('#no-results-modal').foundation('open');
          return;
        }

        // update state
        app.state.dor = featureCollection;

        // if there's a callback, call it
        callback && callback();
      });
    },

    didGetNearbyAppeals: function () {
      //console.log('function didGetNearbyAppeals is starting to run')
      var features = app.state.nearby.appeals,
          featuresSorted = _.orderBy(features, app.config.li.fieldMap.appeals.date, ['desc']),
          // sourceFields = _.map(app.config.li.displayFields, function (displayField) {
          //                   return app.config.li.fieldMap.appeals[displayField];
          //                 }),
          // adding address:
          sourceFields = ['processeddate', 'appealkey', 'address', 'appealgrounds', 'decision',],
          rowsHtml = app.util.makeTableRowsFromJson(featuresSorted, sourceFields),
          $table = $('#nearby-appeals'),
          $tbody = $table.find('tbody');
      $tbody.html(rowsHtml);
      $('#nearby-appeals-count').text(' (' + features.length + ')');

      // reset radio button
      var $dateButton = $('input[name="nearby-appeals-sort-by"][value="date"]');
      $dateButton.prop({checked: true});

      // TEMP attribute rows with appeal id and distance
      var sourceIdField = app.config.li.fieldMap.appeals.id;
      _.forEach($tbody.find('tr'), function (row, i) {
        var feature = featuresSorted[i];
        $(row).attr('data-appeal-id', feature[sourceIdField]);
        $(row).attr('data-appeal-distance', feature.distance);
        $(row).attr('data-appeal-date', feature.processeddate);
      });

      // format fields
      app.util.formatTableFields($table);

      // refresh them on map if topic accordion is open
      var $targetTopic = $('#topic-nearby');
      if ($targetTopic.is(':visible')){
      //if ($('#topic-nearby').attr('style') == 'display: block;') {
        //console.log($('#topic-nearby').attr('style'));
        //console.log('refreshing appeals layer');
        app.map.removeNearbyAppeals();
        app.map.addNearbyAppealsToMap();
      };

      // listen for hover
      $tbody.find('tr').hover(
        function () {
          var $this = $(this);
          $this.css('background', '#ffffff');
          // tell map to highlight pin
          var appealId = $this.attr('data-appeal-id');
          app.map.didHoverOverNearbyAppeal(appealId);
        },
        function () {
          var $this = $(this);
          $this.css('background', '');
          var appealId = $this.attr('data-appeal-id');
          app.map.didMoveOffNearbyAppeal(appealId);
        }
      );

      // TODO should sort?
    },

    sortNearbyAppealsBy: function (sortBy) {
      // get rows
      var rows = $('#nearby-appeals > tbody > tr'),
          rowsSorted = _.sortBy(rows, function (row) {
            return $(row).attr('data-appeal-' + sortBy);
          });

      // date should be desc
      if (sortBy === 'date') rowsSorted = _.reverse(rowsSorted);

      // clobber
      $('#nearby-appeals > tbody').empty();
      $('#nearby-appeals > tbody').append(rowsSorted);

      // listen for hover
      $('#nearby-appeals').find('tr').hover(
        function () {
          var $this = $(this);
          $this.css('background', '#ffffff');
          // tell map to highlight pin
          var appealId = $this.attr('data-appeal-id');
          app.map.didHoverOverNearbyAppeal(appealId);
        },
        function () {
          var $this = $(this);
          $this.css('background', '');
          var appealId = $this.attr('data-appeal-id');
          app.map.didMoveOffNearbyAppeal(appealId);
        }
      );
    },

    didGetDorDocuments: function () {
      // have to unpack these differently from geojson/socrata
      var features = _.map(JSON.parse(app.state.dorDocuments).features, function (feature) { return feature.attributes; }),
          recordLimit = app.config.topicRecordLimit,
          featuresLimited = features.slice(0, recordLimit),
          FIELDS = ['RECORDING_DATE', 'R_NUM', 'DOC_TYPE', 'GRANTOR', 'GRANTEE',],
          rowsHtml = app.util.makeTableRowsFromJson(featuresLimited, FIELDS),
          $table = $('#deeds-documents'),
          $tbody = $table.find('tbody');
      $tbody.html(rowsHtml);

      // make links
      var idFields = $tbody.find('tr').find('td:nth-child(2)');
      _.forEach(idFields, function (idField) {
        var $idField = $(idField),
            docId = $idField.text(),
            idFieldHtml = $('<a />', {
              href: 'http://170.115.71.250/picris/detail.jsp?did=' + docId,
              text: docId,
            });
        $idField.html(idFieldHtml);
      });

      // update count
      var count = features.length;
      $('#deeds-documents-count').text(' (' + count + ')');

      // add "see more" link, if there are rows not shown
      if (count > recordLimit) {
        // clear the old one
        $('#deeds-documents-see-more-link').remove();

        var remainingCount = count - recordLimit,
            plural = remainingCount > 1,
            resourceNoun = plural ? 'documents' : 'document',
            seeMoreText = ['See ', remainingCount, 'older', resourceNoun, 'at PhilaDox'].join(' '),
            seeMoreUrl = 'http://170.115.71.250/picris/documentSearch.jsp',
            $seeMoreLink = $('<a />', {
              class: 'external li-see-more-link',
              id: 'deeds-documents-see-more-link',
              href: seeMoreUrl,
              text: seeMoreText,
            });
        $('#deeds-documents').after($seeMoreLink);
      }

      // format date col
      app.util.formatTableFields($table);
    },
  };
})();

$(function () {
  app.init();
});

// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw
