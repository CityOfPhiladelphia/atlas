/* global L, _, $, history */

/*$(window).bind('storage', function (e) {
     console.log(e.originalEvent.key, e.originalEvent.newValue);
});*/

$(window).resize(function(){
  app.placeVacancyMarker();
})

var app = _.extend(app || {},
{
  // initial app state
  state: {
    ais: {},
    // prevent topics from opening until we've completed a search
    shouldOpenTopics: false,
    nearby: {
      activeType: undefined,
    },
    didFinishDorRequest: false,
    didFinishPwdRequest: false,
    vacancy: {
      selected: 'vacantLand',
    },
  },

  // start app
  init: function ()
  {
    // debug stuff
    // var DEBUG = false,
    var DEBUG_HOSTS = app.config.debugHosts,
        HOST = window.location.hostname,
        DEBUG = _.some(_.map(DEBUG_HOSTS, function (debugHost) {
          return HOST.indexOf(debugHost) >= 0;
        })),
        DEBUG_ADDRESS = '1234 market st',
        // DEBUG_ADDRESS = '1849 blair st',
        // DEBUG_ADDRESS = 'n 3rd st & market st',
      // dynamically form a url based on the current hostname
        constructLocalUrl = function (host, path) {
          return '//' + host + path;
        };

    // disable console if not debugging
    if (!DEBUG) {
      _.forEach(['log', 'debug', 'info', 'warn', 'error'], function (method) {
        console[method] = function () {};
      });
    }

    DEBUG && console.log('debug mode on');
    DEBUG && $('#search-input').val(DEBUG_ADDRESS);

    // set pictometry and cyclomedia urls based on host
    app.config.pictometry.url = constructLocalUrl(HOST, '/pictometry');
    app.config.cyclo.url = constructLocalUrl(HOST, '/cyclomedia');

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
    // $('a').each(function() {
    //    var a = new RegExp('/' + window.location.host + '/');
    //    if (!a.test(this.href)) {
    //      $(this).click(function (event) {
    //        event.preventDefault();
    //        event.stopPropagation();
    //        window.open(this.href, '_blank');
    //      });
    //    }
    // });

    // listen for clicks on current and future <a> elements
    $(document).on('click', 'a', app.didClickLink);

    // listen for search
    $('#search-button').click(app.didClickSearch);
    $('#search-input').keypress(function (e) {
      if (e.which === 13) app.didClickSearch();
    });

    // make "Obilque Imagery" button open Pictometry window
    $('#pict-button').on('click', function (e) {
      e.preventDefault();
      window.open(app.config.pictometry.url, app.config.pictometry.url);
      return false
    });

    // init cyclomedia
    var cycloPanel = document.getElementById('cyclo-panel');
    //app.cyclo.init(cycloPanel);

    // make "Street View" button open Cyclomedia window
    $('#cyclo-button').on('click', function (e) {
      e.preventDefault();
      window.open(app.config.cyclo.url, app.config.cyclo.url);
      app.showCyclo();
      return false
    });

    // clear active topic in localStorage
    localStorage.removeItem('activeTopic');


    /*
    Vacancy
    */

    $('.vacancy-button').click(function (e) {
      e.preventDefault();
      var buttonClass = this.getAttribute('class');
      if (buttonClass.includes('hollow')) {
        //var container = $('#vacancy-button-container');
        //var buttons =
        _.forEach($('.vacancy-button'), function (tag) {
          tag.setAttribute('class', 'button hollow vacancy-button');
        })
        this.setAttribute('class', 'button vacancy-button');
        app.state.vacancy.selected = this.id
        app.placeVacancyMarker();
        app.map.didClickVacancyRadioButton(this.id);
      } else {
        console.log('button already selected');
      }
    });


    // populate dropdown
    // only do first 3
    // for (i=0; i<2; i++) {
    //   var $option = $('<option>'),
    //   label = app.config.nearby.activityTypes[i].label,
    //   slug = app.util.slugify(label);
    //   $option.attr({value: slug});
    //   $option.text(label);
    //   $('#vacancy-nearby-activity-type').append($option);
    // };

    // listen for changes to nearby activity dropdown selection
    // $('#vacancy-nearby-activity-type').change(app.getNearbyActivity);
    // // $('#nearby-activity-timeframe').change(app.filterNearbyActivityByTimeframe);
    // $('#vacancy-nearby-activity-timeframe').change(app.didGetNearbyActivity);
    // // $('#nearby-activity-sort').change(app.sortNearbyActivity);
    // $('#vacancy-nearby-activity-sort').change(app.didGetNearbyActivity);

    /*
    NEARBY
    */
    // populate dropdown
    _.forEach(app.config.nearby.activityTypes, function (activityType) {
      var $option = $('<option>'),
          label = activityType.label,
          slug = app.util.slugify(label);

      $option.attr({value: slug});
      $option.text(label);
      $('#nearby-activity-type').append($option);

      console.warn('%%%%%%%% ', label)
      console.warn($('#nearby-activity-type').children().length)

      // don't add appeals to vacancy nearby selector
      if (['311 Requests', 'Crime Incidents'].indexOf(label) > -1) {
        $('#vacancy-nearby-activity-type').append($option.clone());
      }
    });

    // listen for changes to nearby activity dropdown selection
    $('[id$=nearby-activity-type]').change(app.getNearbyActivity);
    // $('#nearby-activity-timeframe').change(app.filterNearbyActivityByTimeframe);
    $('[id$=nearby-activity-timeframe]').change(app.didGetNearbyActivity);
    // $('#nearby-activity-sort').change(app.sortNearbyActivity);
    $('[id$=nearby-activity-sort]').change(app.didGetNearbyActivity);

    /*
    ROUTING
    */

    // listen for back button
    window.onpopstate = function () {
      // console.log('popped state', location.href);
      app.route();
    };

    // route one time on load
    app.route();
  },

  showCyclo: function () {
    app.state.map.stViewOpen = true;
    localStorage.setItem('stViewOpen', true);
    //$('#map-panel').css('height', '50%');
  },

  route: function () {
    // console.log('route');
    var hash = location.hash,
        params = app.util.getQueryParams(),
        comps = hash.split('/');

    // if there are query params
    var searchParam = params.search;
    if (searchParam) {
      app.searchForAddress(searchParam);
      // TODO fix url
      return;
    }

    // check for enough comps (just 2, since topic is optional)
    if (comps.length < 2) {
      // console.log('route, but not enough comps', comps);
      return;
    }

    var address = decodeURIComponent(comps[1]),
        topic = comps.length > 2 ? decodeURIComponent(comps[2]) : null,
        state = history.state,
        aisState = state ? state.ais : null;

    // activate topic
    // topic && app.activateTopic(topic);
    app.state.activeTopic = topic;
    //var $activeTopic = $('#topic-' + topic);
    //$activeTopic.attr('class', 'topic:visible');
    // = $('.topic:visible');

    // if there's no ais in state, go get it
    if (!aisState) {
      app.searchForAddress(address);
      return;
    }

    // otherwise rehydrate state
    console.log('rehydrate state', aisState);
    app.state.ais = aisState;

    app.didGetAisResult();

    // get topics
    // app.getTopics();
  },

  didClickLink: function (e) {
    $this = $(this);
    // console.log('did click link', $this);

    // if the link has the class `external`, open in a new window/tab
    if ($this.hasClass('external')) {
      // console.log('external link, opening in new window');

      var href = $this.attr('href');
      window.open(href);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  },

  didClickSearch: function () {
    app.state.map.clickedOnMap = false;
    localStorage.setItem('clickedOnMap', false);
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
    console.log('search for address', address);
    var url = app.config.ais.url + encodeURIComponent(address),
        params = {};

    // set gatekeeper key based on hostnme
    if (window.location.hostname == 'atlas.phila.gov') {
    //if (HOST == 'atlas.phila.gov') {
      params.gatekeeperKey = app.config.ais.gatekeeperKey;
    } else {
      params.gatekeeperKey = app.config.ais.betsyKey;
    }

    params.include_units = true;

    $.ajax({
      url: url,
      data: params,
      success: function (data) {
        console.log('got ais');

        var features = data.features;

        // this shouldn't happen, but just in case
        if (features.length === 0) {
          console.error('got ais, but no features');
          $('#no-results-modal').foundation('open');
          return;
        }

        var feature = features[0],
            // slice off first feature and reject range children
            // relatedFeatures = _.reject(features.slice(1),
            //                           {match_type: 'range_child'});
            // workaround until we have a range_child match type
            relatedFeatures = _.reject(features.slice(1),
              function (relatedFeature) {
                // if the main feature is a range, reject anything that isn't also a range
                if (!!feature.properties.address_high) {
                  // console.warn('base addr is a range')
                  return !relatedFeature.properties.address_high;
                }
                return false;
              });

        // make sure it has geometry
        if (!feature.geometry.geocode_type) {
          console.log('got ais, but address did not have an xy');
          $('#no-results-modal').foundation('open');
          return;
        }

        // if it's an intersection, create a dummy `street_address` prop
        // to make this easier to work with
        if (feature.ais_feature_type === 'intersection') {
          feature.properties.street_address = data.normalized;
        }

        // set state
        app.state.ais = {
          feature: feature,
          related: relatedFeatures
        };

        app.didGetAisResult();
      },
      error: function (err) {
        console.log('ais error', err);
        $('#no-results-modal').foundation('open');
      },
    });
  },

  showMultipleAisResultModal: function (data) {
    // console.log('show multiple ais modal');
    // var data = app.state.ais;

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

      // store ais feature in state
      var selectedIndex = $(this).attr('number'),
          aisFeature = data.features[selectedIndex];
          // selectedAddress = selectedAddressObj.properties.street_address;
      // app.state.selectedAddress = selectedAddress;

      // if it's an intersection, create a dummy `street_address` prop
      // to make this easier to work with
      if (aisFeature.ais_feature_type === 'intersection') {
        aisFeature.properties.street_address = data.normalized[0];
      }

      app.state.ais.feature = aisFeature;

      app.didGetAisResult();
    });
  },

  // takes a topic (formerly "data row") name and activates the corresponding
  // section in the data panel
  activateTopic: function (targetTopicName) {
    console.log('activate topic:', targetTopicName);

    // prevent topics from opening until we have at least AIS (arbitrary , but should work)
    // var ais = app.state.ais;
    // if (!ais) return;

    // update url, eg /#/1234 MARKET ST/property
    // var address = app.state.ais.features[0].properties.street_address,
    var aisFeature = app.state.ais.feature,
        address = aisFeature.properties.street_address,
        hash = app.util.constructHash(address, targetTopicName),
        // pare down state to something serializable
        state = {aisFeature: aisFeature};
    history.replaceState(state, '', hash);

    app.state.activeTopic = targetTopicName;

    var $targetTopic = $('#topic-' + targetTopicName);

    // get the currently active topic
    var $activeTopic = $('.topic:visible');

    // only activate if it's not already active
    if ($targetTopic.is($activeTopic)) {
      console.info('activate topic, but its already active');
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

    console.log('activate topic finished');
  },

  toggleTopic: function (targetTopicName) {
    var $targetTopic = $('#topic-' + targetTopicName);

    // if it's already visible, hide it
    if ($targetTopic.is(':visible')){
      app.state.activeTopic = null
      $targetTopic.slideUp(350);
      console.log('toggleTopic is calling didChangeTopic');
      app.map.didChangeTopic(targetTopicName, null);
      // app.map.didDeactivateTopic(targetTopicName);

      // remove topic from url
      var hashNoTopic = location.hash.split('/').slice(0, 2).join('/');
      history.pushState(history.state, '', hashNoTopic);

      //app.state.activeTopic = null;
    }

    // otherwise, activate
    else {
      console.log('toggleTopic is calling activateTopic with ' + targetTopicName);
      app.activateTopic(targetTopicName);
    }
  },

  // this gets called after ais state has been set (either by making an AJAX
  // call or rehydrating state)
  didGetAisResult: function () {
    // open topic
    app.state.shouldOpenTopics = true;
    app.activateTopic(app.state.activeTopic || 'property');

    var aisState = app.state.ais,
        aisFeature = aisState.feature;
        // selectedAddress = app.state.selectedAddress,
        // obj;

    // if (selectedAddress) {
    //   obj = _.filter(data.features, {properties: {street_address: selectedAddress}})[0];
    // }
    // else obj = data.features[0];
    var props = aisFeature.properties,
        aisFeatureType = aisFeature.ais_feature_type,
        streetAddress = props.street_address;

    // check for a "good" result. for now let's say this is any address with
    // an XY in AIS. in the future we may want to handle addresses that can't
    // be geocoded but have some amount of related data.
    // actually we should do this in the callback for the API call. turning
    // off here for now.
    // if (!aisFeature.geometry.geocode_type) {
    //     // show error and bail out
    //     $('#no-results-modal').foundation('open');
    //     return;
    // }

    // make mailing address
    // var mailingAddress = streetAddress + '<br>PHILADELPHIA, PA ' + props.zip_code;
    // if (props.zip_4) mailingAddress += '-' + props.zip_4;

    var line2 = 'PHILADELPHIA, PA ' + props.zip_code;
    if (props.zip_4) line2 += '-' + props.zip_4;
    if (aisFeature.ais_feature_type == 'intersection') line2 = 'PHILADELPHIA, PA';

    // the full mailing address is useful for other things (like elections),
    // so keep it in state
    app.state.mailingAddress = streetAddress + ', ' + line2;

    // hide greeting if it's there
    var $topicPanelHeaderGreeting = $('#topic-panel-header-greeting');
    if ($topicPanelHeaderGreeting.is(':visible')) {
      $topicPanelHeaderGreeting.fadeOut(175, function () {
        $('#topic-panel-header-address').fadeIn(175);
      });
    }

    // show estimated warning if the addrses is estimated
    var matchType = aisFeature.match_type,
        $estimatedWarning = $('#estimated-warning');
    if (['estimated', 'unmatched'].indexOf(matchType) > -1) {
      $estimatedWarning.slideDown();
    } else if ($estimatedWarning.is(':visible')) {
      $estimatedWarning.slideUp();
    }

    // render ais data
    $('#topic-panel-title').text(streetAddress);
    // $('#address-info-mailing-address').html(mailingAddress);
    $('#topic-panel-header-address-line-1').html(streetAddress);
    $('#topic-panel-header-address-line-2').html(line2);

    $('#address-info-street-code').text(props.street_code);
    // $('#zoning-code').text(props.zoning);

    // render map for this address
    // if (selectedAddress) app.map.renderAisResult(obj);
    // app.map.didSelectAddress();

    // clear out data in topic views
    app.resetTopicViews();

    // get topics
    app.getTopics();

    // push to history
    console.log('pushing to history', aisState);
    var nextState = {
          ais: aisState,
        },
        nextTopic = app.state.activeTopic || 'property',
        nextHash = app.util.constructHash(streetAddress, nextTopic);
    history.pushState(nextState, null, nextHash);

    // if no topic is active, activate property
    // if (!app.state.nextTopic) {}
    // console.log('didGetAisResult is calling activateTopic');
    // app.activateTopic(nextTopic);

    /*
    PARCELS
    */

    // the problem is: if the last search yielded a good parcel and the
    // current one did not, the parcel isn't getting cleared out if clickedOnMap === false.

    // var stateParcelDor = app.state.dor && app.state.dor.features ? app.state.dor.features[0] : null,
    //     dorParcelId = props.dor_parcel_id;
    //
    // // if the user searched via the search bar and we have
    // if (stateParcelDor && stateParcelDor.properties.MAPREG !== dorParcelId) {
    //   // console.log('**************** state parcel doesnt match current AIS parcel id, clearing out')
    //   app.state.dor = null;
    // }
    //
    // // check pwd
    // var stateParcelPwd = app.state.pwd && app.state.pwd.features ? app.state.pwd.features[0] : null,
    //     pwdParcelId = props.pwd_parcel_id;
    //
    // // if the user searched via the search bar and we have
    // if (stateParcelPwd && stateParcelPwd.properties.PARCELID !== pwdParcelId) {
    //   // console.log('**************** PWD state parcel doesnt match current AIS parcel id, clearing out')
    //   app.state.pwd = null;
    // }
    //
    // if (!app.state.map.clickedOnMap) {
    //   // get rid of old dadress markers
    //   // app.state.map.addressMarkers = {};
    // }

    // go get both parcels
    // console.log('didGetAisResult is calling getParcels');
    // app.getParcels();
    app.state.dor = app.state.pwd = null;
    app.state.regmaps
    app.state.didFinishPwdRequest = app.state.didFinishDorRequest = null;
    app.getDorParcel();
    app.getPwdParcel();

    // tell map we got an ais result
    app.map.didGetAisResult();

    // render related topic
    app.renderRelated();

    // clear out elections
    app.state.elections = {};
  },

  renderRelated: function () {
    var features = app.state.ais.related,
        $relatedList = $('#related-list');

        // console.log('render related addresses', features);

    // clear out old addresses
    $relatedList.empty();

    // if no related, hide
    if (features.length === 0) {
      app.hideContentForTopic('related');
      return;
    }

    app.showContentForTopic('related');

    // make links and append to related list
    _.forEach(features, function (feature) {
      var address = feature.properties.street_address,
          href = '#/' + encodeURIComponent(address),
          $link = $('<a>')
                    .attr({href: href})
                    .html(address),
          $el = $('<li>').html($link);

      $relatedList.append($el);
    });
  },

  getDorParcel: function () {
    console.log('get dor parcel');

    var aisFeature = app.state.ais.feature,
        parcelId = aisFeature.properties.dor_parcel_id;

    if (!parcelId) {
      console.warn('get dor parcel, but no parcel id');

      app.state.didFinishDorRequest = true;

      // show no content message
      app.hideContentForTopic('deeds');

      return;
    }

    var parcelQuery = L.esri.query({url: app.config.esri.otherLayers.parcelLayerDOR.url});
    //parcelQuery.contains(latLng);
    parcelQuery.where("MAPREG = '" + parcelId + "' AND STATUS IN (1, 3)")
    parcelQuery.run(app.didGetDorParcel);
  },

  didGetDorParcel: function (error, featureCollection, response) {
    console.log('did get dor parcel');

    app.state.didFinishDorRequest = true;

    if (error || !featureCollection) {
      console.log('get dor parcel, but error', error);
      return;
    }

    // if empty response
    if (featureCollection.features.length === 0) {
      console.log('get dor parcel, but no results');
      // show alert
      // $('#no-results-modal').foundation('open');
      app.state.dor = null;

      // show no content message
      app.hideContentForTopic('deeds');

      return;
    }

    app.showContentForTopic('deeds');

    // sort by status
    var features = featureCollection.features,
    featuresSorted = _.sortBy(features, function (feature) {
      return feature.properties.STATUS;
    });
    featureCollection.features = featuresSorted;

    // update state
    app.state.dor = featureCollection;

    // tell map we got a dor parcel
    app.map.didGetDorParcel();

    // calculate perimeter and area
    var geomDOR = featuresSorted[0].geometry,
        areaRequestGeom = '[' + JSON.stringify(geomDOR).replace('"type":"Polygon","coordinates"', '"rings"') + ']';

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

    app.renderParcelTopic();

    // get intersecting regmaps
    var regmapQuery = new L.esri.Query({url: app.config.esri.dynamicLayers.regmap.url})
                        .intersects(geomDOR);
    regmapQuery.run(app.didGetRegmaps);
  },

  didGetRegmaps: function (error, featureCollection, response) {
    console.log('did get regmaps', featureCollection);

    // set state
    app.state.regmaps = featureCollection;

    var features = featureCollection.features,
        $list = $('#deeds-regmaps');

    // clear everything out
    $list.empty();

    _.forEach(features, function (feature) {
      var props = feature.properties,
          id = props.RECMAP,
          $link = $('<a>')
                    .attr({href: '#'})
                    .addClass('button hollow')
                    .html(id)
                    .on('click', app.didSelectRegmap);
          // $el = $('<li>')
          //         .html($link);
      $list.append($link);
    });

    $('#deeds-regmaps-count').html(' (' + features.length + ')')
  },

  didSelectRegmap: function (e) {
    var $this = $(this),
        selected = $this.html(),
        prev = app.state.selectedRegmap,
        // if we selected the same one again, it's really an unselect
        next = (prev !== selected ? selected : null);

    console.log('did select regmap', prev, '=>', next);

    // set state
    app.state.selectedRegmap = next;

    // unhighlight last selected
    $('#deeds-regmaps a:not(.hollow)').addClass('hollow');

    // tell map
    app.map.didChangeRegmap(prev, next);

    // highlight selected
    if (next) {
      $this.removeClass('hollow');
    }

    e.preventDefault();
    e.stopPropagation();
  },

  getPwdParcel: function () {
    var aisFeature = app.state.ais.feature,
        parcelId = aisFeature.properties.pwd_parcel_id,
        parcelQuery = L.esri.query({url: app.config.esri.otherLayers.parcelLayerWater.url});

    if (!parcelId) {
      console.warn('get pwd parcel, but no id');
      app.state.didFinishPwdRequest = true;
      return;
    }

    parcelQuery.where('PARCELID = ' + parcelId);
    parcelQuery.run(app.didGetPwdParcel);
  },

  didGetPwdParcel: function (error, featureCollection, response) {
    console.log('did get pwd parcel');

    app.state.didFinishPwdRequest = true;

    if (error || !featureCollection) {
      console.log('get pwd parcel by id error:', error);
      return;
    }

    // if empty response
    if (featureCollection.features.length === 0) {
      console.log('get pwd parcel, but no results');

      // show alert
      // $('#no-results-modal').foundation('open');

      app.state.pwd = null;

      return;
    }

    // update state
    // TODO put this in a specific parcel object
    app.state.pwd = featureCollection;

    // tell map we got a pwd parcel
    app.map.didGetPwdParcel();
  },

  // this gets pwd and dor parcels and then runs a callback. kind of overlaps
  // with getParcelById function. they should probably be merged eventually.
  // getParcels: function () {
  //   console.log('get parcels');
  //
  //   // get parcel id and try to reuse a parcel from state (i.e. user clicked map)
  //   var aisFeature = app.state.ais.feature,
  //       dorParcelId = aisFeature.properties.dor_parcel_id,
  //       pwdParcelId = aisFeature.properties.pwd_parcel_id;
  //
  //   // clear els
  //   _.forEach(['id', 'address', 'status', 'air-rights', 'condo'], function (tag) {
  //     var $el = $('#deeds-' + tag);
  //     $el.empty();
  //   });
  //
  //   // if we already have the parcel
  //   var stateParcel = app.state.dor && app.state.dor.features ? app.state.dor.features[0] : null;
  //   // if the user searched via the search bar and we have
  //   if (stateParcel && stateParcel.properties.MAPREG === dorParcelId) {
  //     console.log('i have a state parcel and its the right one')
  //     app.renderParcelTopic();
  //     app.map.didGetParcels();
  //   // otherwise we don't have a parcel, so go get one (but only if we have a parcel id)
  //   } else if (dorParcelId) {
  //     // the function we're about to call is kind of the same thing as the
  //     // current function and should probably be merged at some point
  //     app.getParcelsWithIds(dorParcelId, pwdParcelId, function () {
  //       console.log('got parcels by id')
  //       //console.log('got parcel by id', app.state.dor);
  //       app.renderParcelTopic();
  //       // console.log('getparcelById callback is calling createAddressMarkers');
  //
  //       // tell map we finished getting parcels and it's ok to do stuff
  //       // that depends on them
  //       // app.map.createAddressMarkers();
  //       // app.map.didActivateTopic(app.state.activeTopic);
  //       console.log('calling getParcels callback')
  //       app.map.didGetParcels();
  //     });
  //   } else {
  //     console.log('get parcels but no dor parcel id, calling map.didGetParcels')
  //     app.map.didGetParcels();
  //     app.hideContentForTopic('deeds');
  //   }
  //   // app.map.didGetParcels();
  // },

  showContentForTopic: function (topic) {
    console.log('show content for topic', topic);

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

  // clears out data rendered in topics
  resetTopicViews: function () {
    // console.log('reset topic views');

    var topicCells = $('.topic td');
    topicCells.empty();
  },

  // initiates requests to topic APIs (OPA, L&I, etc.)
  getTopics: function () {
    // console.log('get topics');

    // show accordion
    // doing this in route now
    // $('#topic-list').show();

    var aisFeature = app.state.ais.feature,
        aisProps = aisFeature.properties,
        aisAddress = aisProps.street_address,
        aisGeom = aisFeature.geometry;

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
              var liStateKeys = _.keys(app.config.li.socrataIds),
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
    // var aisFeature = app.state.ais.feature,
    //     aisParcelId = aisFeature.properties.dor_parcel_id,
    //     waterParcelId = aisFeature.properties.pwd_parcel_id,
    //     stateParcel = app.state.dor && app.state.dor.features ? app.state.dor.features[0] : null;
    //
    // // clear els
    // _.forEach(['id', 'address', 'status', 'air-rights', 'condo'], function (tag) {
    //   var $el = $('#deeds-' + tag);
    //   $el.empty();
    // });

    // if we already have the parcel
    // if (stateParcel && stateParcel.properties.MAPREG === aisParcelId) {
    //   app.renderParcelTopic();
    // }
    // // otherwise we don't have a parcel, so go get one (but only if we have a parcel id)
    // else if (aisParcelId) {
    //   app.getParcelsWithIds(aisParcelId, waterParcelId, function () {
    //     //console.log('got parcel by id', app.state.dor);
    //     app.renderParcelTopic();
    //     console.log('getTopics is calling createAddressMarkers');
    //     app.map.createAddressMarkers();
    //   });
    // }

    // get dor documents
    $.ajax({
      url: app.config.dor.documents.documentIdQueryUrl,
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

    /*
    ZONING
    */
    var zoningBaseQuery = L.esri.query({url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/'});
    zoningBaseQuery.contains(aisGeom);
    zoningBaseQuery.run(app.didGetZoningBaseResult);

    var zoningOverlayQuery = L.esri.query({url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/1'});
    zoningOverlayQuery.contains(aisGeom);
    zoningOverlayQuery.run(app.didGetZoningOverlayResult);

    // get scanned documents ("zoning archive")
    $.ajax({
      url: '//data.phila.gov/resource/spcr-thsm.json',
      data: {
        address: aisAddress,
      },
      success: function (data) {
        // console.log('got zoning docs', data);
        app.state.zoningDocuments = data;
        app.didGetZoningDocuments();
      },
      error: function (err) {
        console.log('zoning docs error:', err);
      },
    });

    /*
    VACANCY
    */
    app.runVacancyQueries(aisGeom);

    /*
    NEARBY
    */

    // appeals
    // var aisX = aisGeom.coordinates[0],
    //     aisY = aisGeom.coordinates[1],
    //     radiusMeters = app.config.nearby.radius * 0.3048,
    //     nearbyAppealsUrl = app.config.socrata.baseUrl + app.config.li.socrataIds.appeals + '.json',
    //     // nearbyAppealsQuery = 'DISTANCE_IN_METERS(location, POINT(' + aisX + ',' + aisY + ')) <= ' + radiusMeters;
    //     nearbyAppealsWhere = 'within_circle(' + ['shape', aisY, aisX, radiusMeters].join(', ') + ')',
    //     nearbyAppealsSelectComps = [
    //       'processeddate',
    //       'appealkey',
    //       'address',
    //       'appealgrounds',
    //       'decision',
    //       'shape',
    //       "DISTANCE_IN_METERS(shape, 'POINT(" + aisX + ' ' + aisY + ")') * 3.28084 AS distance",
    //     ],
    //     nearbyAppealsSelect = nearbyAppealsSelectComps.join(', ');
    // // exclude appeals at the exact address
    // if (liAddressKey) nearbyAppealsWhere += " AND addresskey != '" + liAddressKey + "'";
    //
    // $.ajax({
    //   url: nearbyAppealsUrl,
    //   data: {
    //     $where: nearbyAppealsWhere,
    //     $select: nearbyAppealsSelect,
    //   },
    //   success: function (data) {
    //     if (!app.state.nearby) app.state.nearby = {};
    //     app.state.nearby.appeals = data;
    //     app.didGetNearbyAppeals();
    //   },
    //   error: function (err) {
    //     console.log('nearby appeals error', err);
    //   },
    // });

    app.getNearbyActivity();

    /*
    WATER
    */
    var waterUrl = '//api.phila.gov/stormwater';
    $.ajax({
      url: waterUrl,
      data: {
        search: aisAddress,
      },
      success: function (data) {
        app.state.stormwater = JSON.parse(data);
        app.didGetWater();
      },
      error: function (err) {
        console.log('water error', err);
      },
    });

    /*
    ELECTIONS
    */
    if (aisProps.political_ward && aisProps.political_division) {
      var electionsUrl = '//api.phila.gov/elections',
      electionsWard = aisProps.political_ward,
      // TODO divisions in AIS are prefixed with the ward num; slice it out
      // apparently this is called the `division_id` in the elections API
      electionsDivision = aisProps.political_division.substring(2);

      $.ajax({
        url: electionsUrl,
        data: {
          option: 'com_pollingplaces',
          view: 'json',
          ward: electionsWard,
          division: electionsDivision,
        },
        success: function (jsonString) {
          // no json headers set on this
          var data = JSON.parse(jsonString);

          if (!data.features || data.features.length < 1) {
            // does this work?
            console.log('elections no features, trying to call error callback');
            this.error();
          }

          //console.log('elections', data);
          app.state.elections = data;
          app.didGetElections();

          $('#topic-election .topic-content').show();
          $('#topic-election .topic-content-not-found').hide();
        },
        error: function (err) {
          console.log('elections error', err);
          app.state.elections = null;

          $('#topic-election .topic-content').hide();
          $('#topic-election .topic-content-not-found').show();
        },
      });
    }
    else {
      // TODO clean up elections content
    }

    /*
    PUBLIC SAFETY
    */

    // Get nearest evacuation route
    // var evacQuery = L.esri.query({url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/EvacuationRoute/FeatureServer/0'});

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
    console.log('render parcel topic');

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

    app.showContentForTopic('deeds');
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
      'property-address':             props.location || 'None',
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
    var stateKeys = _.keys(app.config.li.socrataIds),
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

    // make code section links
    var rows = $tbody.find('tr');
    _.forEach(rows, function (row, i) {
      var $row = $(row),
          feature = features[i],
          url = feature.properties.CODE_SECTION_LINK;
      // get the code section field
      $codeSectionField = $row.children().last();
      var text = $codeSectionField.text(),
          newHtml = '<a class="external" href="' + url + '">' + text + '</a>';
      $codeSectionField.html(newHtml);
    });

    var count = features.length;
    $('#zoning-overlays-count').html(' (' + count + ')');
  },

  runVacancyQueries: function (aisGeom) {
    var vacantLandQuery = L.esri.query({url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0'});
    vacantLandQuery.contains(aisGeom);
    vacantLandQuery.run(app.didGetVacantLandResult);

    var vacantBuildingsQuery = L.esri.query({url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Bldg/FeatureServer/0'});
    vacantBuildingsQuery.contains(aisGeom);
    vacantBuildingsQuery.run(app.didGetVacantBuildingResult);

    var vacantBlockPercentQuery = L.esri.query({url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/VacancyBlockPercentage/FeatureServer/2'});
    vacantBlockPercentQuery.contains(aisGeom);
    vacantBlockPercentQuery.run(app.didGetVacantBlockPercentResult);
  },


  didGetVacantLandResult: function (error, featureCollection, response) {
    var features = featureCollection.features;
    if (features.length) {
      app.state.vacancy.vacantLand = features[0].properties['LAND_RANK'];
    } else {
      app.state.vacancy.vacantLand = 0;
    }
    if(app.state.activeTopic == 'vacancy') {
      app.placeVacancyMarker();
    };
  },

  didGetVacantBuildingResult: function (error, featureCollection, response) {
    var features = featureCollection.features;
    if (features.length) {
      app.state.vacancy.vacantBuildings = features[0].properties['BUILD_RANK'];
    } else {
      app.state.vacancy.vacantBuildings = 0;
    }
    if(app.state.activeTopic == 'vacancy') {
      app.placeVacancyMarker();
    };
  },

  didGetVacantBlockPercentResult: function (error, featureCollection, response) {
    //console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    var features = featureCollection.features;
    //console.log(features);
    if (features.length) {
      app.state.vacancy.vacancyPercent = features[0].properties['PercentVacant'];
      //app.state.vacancy.percentVacantBuilding = features[0].properties['PercentVacantBuilding'];
      //app.state.vacancy.percentVacantLand = features[0].properties['PercentVacantLand'];
    } else {
      app.state.vacancy.vacancyPercent = 0;
    }
    if(app.state.activeTopic == 'vacancy') {
      app.placeVacancyMarker();
    };
  },

  placeVacancyMarker: function() {
    var selectedVacancyButton = app.state.vacancy.selected;
    var currentWidth = $('#vacancy-marker-line').width();
    var currentMarkerPosition = app.state.vacancy[selectedVacancyButton] * currentWidth
    $('#vacancy-marker-line').css('padding-left', currentMarkerPosition);
    $('#vacancy-scale').css('padding-left', currentMarkerPosition+5);
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

  getParcelsWithIds: function (dorParcelId, pwdParcelId, callback) {
    console.log('getParcelsWithIds');

    // use this to fire the callback after both requests have finished
    // (not sure if esri leaflet returns promises)
    var didFinishDorRequest = false,
        didFinishPwdRequest = false;

    /*
    DOR
    */

    // only query for dor parcel if we have an id
    if(dorParcelId){
      var parcelQuery = L.esri.query({url: app.config.esri.otherLayers.parcelLayerDOR.url});
      //parcelQuery.contains(latLng);
      parcelQuery.where("MAPREG = '" + dorParcelId + "' AND STATUS IN (1, 3)")
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

        // sort by status
        console.log('before', featureCollection);
        var features = featureCollection.features,
            featuresSorted = _.sortBy(features, function (feature) {
              return feature.properties.STATUS;
            });
        featureCollection.features = featuresSorted;
        console.log('after', featureCollection);

        // update state
        app.state.dor = featureCollection;

        // if there's a callback, call it
        callback && callback();
      })
    }
    /*if (dorParcelId) {
      $.ajax({
        url: app.config.esri.parcelLayerDORUrl + '/query',
        data: {
          where: "MAPREG = '" + dorParcelId + "' AND STATUS IN (1, 3)" ,
          outSR: 4326,
          outFields: '*',
          f: 'geojson',
        },
        success: function (data) {
          // AGO returns json with plaintext headers, so parse
          data = JSON.parse(data);
          console.log('got DOR data ', data);

          // check data
          if (data.features.length === 0) {
            console.log('got parcel but 0 features', this.url);
          }

          app.state.dor = data;

          // call callback if we already finished the pwd request
          if (didFinishPwdRequest) {
            console.log('get parcels: pwd finished then dor, calling callback')
            callback();
          }
          else {
            didFinishDorRequest = true;
          }

          app.showContentForTopic('deeds');
        },
        error: function (err) {
          console.log('get parcel by id error', err);
          app.hideContentForTopic('deeds');
          didFinishDorRequest = true;
        },
      });

    // no DOR parcel id, so don't query
  }*/ else {
      console.log('no dor parcel id specified');
    }

    /*
    PWD
    */

    // only query if we have a pwd parcel id
    if (pwdParcelId) {
      var parcelQuery = L.esri.query({url: app.config.esri.otherLayers.parcelLayerWater.url});
      parcelQuery.where('PARCELID = ' + pwdParcelId)
      parcelQuery.run(function (error, featureCollection, response) {
        if (error || !featureCollection) {
          console.log('get pwd parcel by id error:', error);
          didFinishPwdRequest = true;
          return;
        }

        // if empty response
        if (featureCollection.features.length === 0) {
          console.log('get pwd parcel no features');

          // show alert
          $('#no-results-modal').foundation('open');

          didFinishPwdRequest = true;
          return;
        }

        // update state
        // TODO put this in a specific parcel object
        console.log('****************setting state pwd', featureCollection)
        app.state.pwd = featureCollection;

        // call callback if we're all done
        if (didFinishDorRequest) {
          console.log('get parcels: dor finished then pwd, calling callback')
          callback();
        } else {
          didFinishPwdRequest = true;
        }
      });

    // no pwd parcel id, don't do anything
    } else {
      console.log('no pwd parcel id specified');
      console.log('ais', app.state.ais.feature)
    }

    /*$.ajax({
      url: app.config.esri.parcelLayerWaterUrl + '/query',
      data: {
        where: "PARCELID = '" + waterId + "'",
        outSR: 4326,
        outFields: '*',
        f: 'json',
      },
      success: function (data) {
        // AGO returns json with plaintext headers, so parse
        data = JSON.parse(data);
        console.log('got water data ' + data);

        // check data
        if (data.features.length === 0) {
          console.log('got water parcel but 0 features', this.url);
        }

        app.state.pwd = data;
        //callback && callback();

        //app.showContentForTopic('deeds');
      },
      error: function (err) {
        console.log('get water parcel by id error', err);
        //app.hideContentForTopic('deeds');
      },
    });*/
  },

  // get a parcel by a leaflet latlng
  getParcelByLatLng: function (latLng, callback) {
    console.log('get parcel by latlng');

    // clear state
    // disabling this because if the new query doesn't return anything,
    // we don't want to flush out the current dor parcel
    // app.state.dor = undefined;
    if (app.state.activeTopic == 'deeds' || app.state.activeTopic == 'zoning') {
      var parcelQuery = L.esri.query({url: app.config.esri.otherLayers.parcelLayerDOR.url});
      parcelQuery.contains(latLng);
      // parcelQuery.where('STATUS IN (1, 3)')
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

        // sort by status
        console.log('**before', featureCollection);
        var features = featureCollection.features,
            featuresSorted = _.sortBy(features, function (feature) {
              return feature.properties.STATUS;
            });
        featureCollection.features = featuresSorted;
        console.log('**after', featureCollection);

        // update state
        app.state.dor = featureCollection;
        console.log('saved it to state', app.state.dor)

        // if there's a callback, call it
        callback && callback();
      })
    } else {
        var parcelQuery = L.esri.query({url: app.config.esri.otherLayers.parcelLayerWater.url});
        parcelQuery.contains(latLng);
        //parcelQuery.where('STATUS IN (1, 3)')
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
          app.state.pwd = featureCollection;
          // if there's a callback, call it
          callback && callback();
      })
    }
  },

  // replaced by didGetNearbyActivity
  // didGetNearbyAppeals: function () {
  //   //console.log('function didGetNearbyAppeals is starting to run')
  //   var features = app.state.nearby.appeals,
  //       featuresSorted = _.orderBy(features, app.config.li.fieldMap.appeals.date, ['desc']),
  //       // sourceFields = _.map(app.config.li.displayFields, function (displayField) {
  //       //                   return app.config.li.fieldMap.appeals[displayField];
  //       //                 }),
  //       // adding address:
  //       sourceFields = ['processeddate', 'appealkey', 'address', 'appealgrounds', 'decision',],
  //       rowsHtml = app.util.makeTableRowsFromJson(featuresSorted, sourceFields),
  //       $table = $('#nearby-appeals'),
  //       $tbody = $table.find('tbody');
  //   $tbody.html(rowsHtml);
  //   $('#nearby-appeals-count').text(' (' + features.length + ')');
  //
  //   // reset radio button
  //   var $dateButton = $('input[name="nearby-appeals-sort-by"][value="date"]');
  //   $dateButton.prop({checked: true});
  //
  //   // TEMP attribute rows with appeal id and distance
  //   var sourceIdField = app.config.li.fieldMap.appeals.id;
  //   _.forEach($tbody.find('tr'), function (row, i) {
  //     var feature = featuresSorted[i];
  //     $(row).attr('data-appeal-id', feature[sourceIdField]);
  //     $(row).attr('data-appeal-distance', feature.distance);
  //     $(row).attr('data-appeal-date', feature.processeddate);
  //   });
  //
  //   // format fields
  //   app.util.formatTableFields($table);
  //
    // // refresh them on map if topic accordion is open
    // var $targetTopic = $('#topic-nearby');
    // if ($targetTopic.is(':visible')){
    // //if ($('#topic-nearby').attr('style') == 'display: block;') {
    //   //console.log($('#topic-nearby').attr('style'));
    //   //console.log('refreshing appeals layer');
    //   app.map.removeNearbyAppeals();
    //   app.map.addNearbyAppealsToMap();
    // };
    //
    // // listen for hover
    // $tbody.find('tr').hover(
    //   function () {
    //     var $this = $(this);
    //     $this.css('background', '#ffffff');
    //     // tell map to highlight pin
    //     var appealId = $this.attr('data-appeal-id');
    //     app.map.didHoverOverNearbyAppeal(appealId);
    //   },
    //   function () {
    //     var $this = $(this);
    //     $this.css('background', '');
    //     var appealId = $this.attr('data-appeal-id');
    //     app.map.didMoveOffNearbyAppeal(appealId);
    //   }
    // );
  //
  //   // TODO should sort?
  // },
  //
  // sortNearbyAppealsBy: function (sortBy) {
  //   // get rows
  //   var rows = $('#nearby-appeals > tbody > tr'),
  //       rowsSorted = _.sortBy(rows, function (row) {
  //         return $(row).attr('data-appeal-' + sortBy);
  //       });
  //
  //   // date should be desc
  //   if (sortBy === 'date') rowsSorted = _.reverse(rowsSorted);
  //
  //   // clobber
  //   $('#nearby-appeals > tbody').empty();
  //   $('#nearby-appeals > tbody').append(rowsSorted);
  //
  //   // listen for hover
  //   $('#nearby-appeals').find('tr').hover(
  //     function () {
  //       var $this = $(this);
  //       $this.css('background', '#ffffff');
  //       // tell map to highlight pin
  //       var appealId = $this.attr('data-appeal-id');
  //       app.map.didHoverOverNearbyAppeal(appealId);
  //     },
  //     function () {
  //       var $this = $(this);
  //       $this.css('background', '');
  //       var appealId = $this.attr('data-appeal-id');
  //       app.map.didMoveOffNearbyAppeal(appealId);
  //     }
  //   );
  // },

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
            href: app.config.dor.documents.url + docId,
            text: docId,
            class: 'external',
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
          seeMoreUrl = app.config.dor.documents.seeMoreUrl,
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

  didGetZoningDocuments: function () {
    var features = app.state.zoningDocuments,
        // TODO sort by date
        idConstructor = function (row) {
          var id = row.app_id + '-' + row.document_id;
          return id;
        },
        linkConstructor = function (row) {
          var address = row.address,
              appId = row.app_id.length === 2 ? '0' + String(row.app_id) : row.app_id,
              docType = row.document_type,
              docId = row.document_id,
              numPages = row.num_pages,
              url = '//www.phila.gov/zoningarchive/Preview.aspx?address=' + address + '&&docType=' + docType + '&numofPages=' + numPages + '&docID=' + docId + '&app=' + appId;
          return url;
        },
        FIELDS = ['scan_date', idConstructor, 'document_type', 'num_pages', linkConstructor],
        rowsHtml = app.util.makeTableRowsFromJson(features, FIELDS),
        $table = $('#zoning-documents'),
        $tbody = $table.find('tbody');
    $tbody.html(rowsHtml);

    // update count
    var count = features.length;
    $('#zoning-documents-count').text(' (' + count + ')');

    // format fields
    app.util.formatTableFields($table);
  },

  getNearbyActivity: function () {
    var activeTopic = app.state.activeTopic,
        prefix = activeTopic === 'nearby' ? 'nearby' : 'vacancy-nearby',
        $nearbyActivityType = $('#'+prefix+'-activity-type'),
        $selected = $nearbyActivityType.find(':selected'),
        label = $('#'+prefix+'-activity-type :selected').text();

    console.log('get activity for: ', label);

    // make sure we have an XY first
    // TODO clear out 'nearby' content if no XY.
    var aisGeom = app.state.ais.feature.geometry;
    if (!aisGeom.geocode_type) return;

    var aisX = aisGeom.coordinates[0],
        aisY = aisGeom.coordinates[1],
        radiusMeters = app.config.nearby.radius * 0.3048,
        activityTypes = app.config.nearby.activityTypes,
        activityType = _.filter(activityTypes, {label: label})[0],
        socrataId = activityType.socrataId,
        url = app.config.socrata.baseUrl + socrataId + '.json',

        // form query
        where = 'within_circle(' + ['shape', aisY, aisX, radiusMeters].join(', ') + ')',
        fieldMap = activityType.fieldMap,
        distanceFn = "DISTANCE_IN_METERS(shape, 'POINT(" + aisX + ' ' + aisY + ")') * 3.28084",
        selectComps = _.values(fieldMap).concat([
                        'shape',
                        distanceFn + "AS distance",
                      ]);
        select = selectComps.join(', ');

    // TODO exclude recordss at the exact address
    // if (liAddressKey) nearbyAppealsWhere += " AND addresskey != '" + liAddressKey + "'";

    // TODO date range

    $.ajax({
      url: url,
      data: {
        $where: where,
        $select: select,
        $order: distanceFn,
      },
      success: function (data) {
        // TODO set app.state.nearby.activeType to whatever's selected

        // rows need to have unique ids for coordination with map
        var dataWithIds = app.util.addIdsToRows(data);

        // if (!app.state.nearby.data) app.state.nearby.data = {};
        app.state.nearby.data = dataWithIds;

        app.didGetNearbyActivity();
      },
      error: function (err) {
        console.log('nearby error', err);
      },
    });
  },

  didGetNearbyActivity: function () {
    //console.info('did get nearby activity', app.state.nearby.data);

    var activeTopic = app.state.activeTopic,
        prefix = activeTopic === 'nearby' ? 'nearby' : 'vacancy-nearby';

    // munge, filter, sort, make html
    var rows = app.state.nearby.data,
        tableId = prefix + '-activity',
        daysBack = $('#' + tableId + '-timeframe').val(),
        label = $('#' + tableId + '-type :selected').text(),
        activityTypes = app.config.nearby.activityTypes,
        activityTypeDef = _.filter(activityTypes, {label: label})[0],
        fieldMap = activityTypeDef.fieldMap,
        dateField = fieldMap.date,
        rowsFiltered = app.util.filterJsonByTimeframe(rows, dateField, daysBack),
        sortMethod = $('#' + tableId + '-sort').val(),
        sortField = sortMethod === 'date' ? dateField : 'distance',
        sortDirection = sortMethod === 'date'? 'desc' : 'asc',
        rowsSorted = _.orderBy(rowsFiltered, sortField, [sortDirection]),
        fields = _.values(fieldMap).concat(['distance']),
        tbodyHtml = app.util.makeTableRowsFromJson(rowsSorted, fields),
        $tbody = $('#' + tableId + ' > tbody');

    app.state.nearby.rowsSorted = rowsSorted;

    // populate table
    $tbody.html(tbodyHtml);

    // update table header
    $('#' + tableId + '-table-title').text(label);

    // update counter
    $('#' + tableId + '-count').text(' (' + rowsFiltered.length + ')');

    // apply transforms
    app.util.formatTableFields($('#' + tableId));

    // TEMP attribute rows with appeal id and distance
    _.forEach($tbody.find('tr'), function (row, i) {
      var dataRow = rowsSorted[i],
      id = dataRow.id,
      $tableRow = $(row);
      $tableRow.attr('data-id', dataRow.id);
    });

    // render on map
    // app.map.renderNearbyActivity(rowsFiltered);

    // refresh them on map if topic accordion is open
    var $targetTopic = prefix === 'nearby' ? $('#topic-nearby') : $('#topic-vacancy');
    if ($targetTopic.is(':visible')){
      //if ($('#topic-nearby').attr('style') == 'display: block;') {
      //console.log($('#topic-nearby').attr('style'));
      //console.log('refreshing appeals layer');
      // app.map.removeNearbyActivity();
      //console.log('rowsSorted is ', rowsSorted);
      app.map.addNearbyActivity(rowsSorted);
    };

    // listen for hover
    $tbody.find('tr').hover(
      function () {
        var $this = $(this);
        // $this.css('background', '#ffffff');
        $this.css('background', '#F3D661');
        // tell map to highlight pin
        var id = $this.attr('data-id');
        app.map.didMouseOverNearbyActivityRow(id);
      },
      function () {
        var $this = $(this);
        $this.css('background', '');
        var id = $this.attr('data-id');
        app.map.didMouseOffNearbyActivityRow(id);
      }
    );
  },

  didGetWater: function () {
    // the stormwater api seems to return a list of opa matches
    // however, there seems to (generally) be just one item
    var data = app.state.stormwater,  // this is actually a list of matches
        item = data[0],
        parcel = item.Parcel,
        parcelId = parcel.ParcelID,
        accounts = item.Accounts;

    // parcel-level stuff
    // $('#water-impervious-area').text(app.util.numberWithCommas(parcel.ImpervArea));
    // $('#water-gross-area').text(app.util.numberWithCommas(parcel.GrossArea));
    $('#water-parcel-id').text(parcelId);
    $('#water-parcel-address').text(parcel.Address);
    $('#water-parcel-building-type').text(parcel.BldgType);
    $('#water-parcel-impervious-area').text(parcel.ImpervArea + ' sq ft');
    $('#water-parcel-gross-area').text(parcel.GrossArea + ' sq ft');
    $('#water-parcel-cap-eligible').text(parcel.CAPEligible ? 'Yes' : 'No');

    // populate accounts
    $('#water-accounts-count').text(' (' + accounts.length + ')');
    var meterSizeGetter = function (row) {
          var rawMeterSize = row.MeterSize,
              meterSizeMatch = rawMeterSize.match(/\d(\/\d)?"/),
              meterSize = meterSizeMatch && meterSizeMatch.length > 0 ? meterSizeMatch[0] : '';
          return meterSize;
        },
        FIELDS = ['AccountNumber', 'CustomerName', 'AcctStatus', 'ServiceTypeLabel', meterSizeGetter, 'StormwaterStatus'],
        rowsHtml = app.util.makeTableRowsFromJson(accounts, FIELDS);
    $('#water-accounts > tbody').html(rowsHtml);

    // update see more link
    var stormwaterUrl = '//www.phila.gov/water/swmap/Parcel.aspx?parcel_id=' + parcelId;
    $('#water-link').attr({href: stormwaterUrl});

    // app.showContentForTopic('water');
  },

  didGetElections: function () {
    // console.log('did get elections');

    var data = app.state.elections,
        attrs = data.features[0].attributes,
        name = attrs.location,
        address = attrs.display_address.toUpperCase() + ', ' + attrs.zip_code,
        accessibility = attrs.building,  // TODO decode
        parking = attrs.parking,
        ward = attrs.ward,
        division = attrs.division;

    $('#elections-location-name').text(name);
    $('#elections-location-address').text(address);
    $('#elections-location-accessibility').text(accessibility);
    $('#elections-location-parking').text(parking);
    $('#elections-ward').text(ward);
    $('#elections-division').text(division);

    var aisAddress = app.state.mailingAddress,
        seeMoreUrl = 'http://www.philadelphiavotes.com/index.php?option=com_voterapp&tmpl=component&address=' + encodeURIComponent(aisAddress);
    $('#elections-link').attr({href: seeMoreUrl});

    if (app.state.activeTopic == 'elections') app.map.addElectionInfo();

    // tell map
    app.map.didGetElections();
  },
});

$(function () {
  app.init();
});
