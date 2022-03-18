export default {
  key: 'nearby',
  icon: 'map-marker-alt',
  label: 'Nearby',
  dataSources: [ 'threeOneOneCarto', 'crimeIncidents', 'nearbyZoningAppeals' ],
  // dataSources: ['311Carto', 'crimeIncidents', 'nearbyZoningAppeals', 'vacantIndicatorsPoints'],
  // dataSources: ['vacantLand', 'vacantBuilding', '311Carto', 'crimeIncidents', 'nearbyZoningAppeals'],
  // featureLayers: [
  //   'vacantLand',
  //   'vacantBuilding'
  // ],
  identifyFeature: 'address-marker',
  parcels: 'pwd',
  // TODO implement this
  // computed: {
  //   label(state) {
  //     var land = state.sources.vacantLand.data
  //     var building = state.sources.vacantBuilding.data
  //     if (land.length === 0 && building.length === 0) {
  //       return 'Not Likely Vacant';
  //     } else if (land.length > 0) {
  //       return 'Likely Vacant Land';
  //     } else if (building.length > 0) {
  //       return 'Likely Vacant Building';
  //     }
  //   }
  // },
  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          See recent activity near your search address including 311 \
          service requests, crimes, zoning appeals, and more. Hover over a\
          record below to highlight it on the map.\
        ',
      },
    },
    // {
    //   type: 'badge',
    //   options: {
    //     titleBackground: function(state) {
    //       var text = getVacancyText(state);
    //       if (text.includes('Land')) {
    //         return 'orange';
    //       } else if (text.includes('Building')) {
    //         return 'purple';
    //       } else {
    //         return '#58c04d';
    //       }
    //     }
    //   },
    //   slots: {
    //     title: 'Vacancy',
    //     value: function(state) {
    //       return getVacancyText(state);
    //     },
    //     // description: function(state) {
    //     //   var code = state.geocode.data.properties.zoning;
    //     //   return ZONING_CODE_MAP[code];
    //     // },
    //   }
    // },
    {
      type: 'horizontal-table-group',
      options: {
        filters: [
          {
            type: 'data',
            getValue: function(item) {
              return item;
            },
            label: 'What nearby activity would you like to see?',
            values: [
              {
                label: '311 Requests',
                value: '311',
              },
              {
                label: 'Crime Incidents',
                value: 'crimeIncidents',
              },
              {
                label: 'Zoning Appeals',
                value: 'nearbyZoningAppeals',
              },
              {
                label: 'Vacant Properties',
                value: 'vacantIndicatorsPoints',
              },
            ],
          },
        ],
        // components for the content pane.
        tables: [
          {
            type: 'horizontal-table',
            options: {
              id: '311',
              sort: {
                select: true,
                sortFields: [
                  'distance',
                  'date',
                ],
                getValue: function(item, sortField) {
                  var val;
                  if (sortField === 'date' || !sortField) {
                    val = item.requested_datetime;
                  } else if (sortField === 'distance') {
                    val = item.distance;
                  }
                  return val;
                },
                order: function(sortField) {
                  var val;
                  if (sortField === 'date') {
                    val = 'desc';
                  } else {
                    val = 'asc';
                  }
                  return val;
                },
              },
              filters: [
                {
                  type: 'time',
                  getValue: function(item) {
                    return item.requested_datetime;
                  },
                  label: 'From the last',
                  values: [
                    {
                      label: '30 days',
                      value: '30',
                      unit: 'days',
                      direction: 'subtract',
                    },
                    {
                      label: '90 days',
                      value: '90',
                      unit: 'days',
                      direction: 'subtract',
                    },
                    {
                      label: 'year',
                      value: '1',
                      unit: 'years',
                      direction: 'subtract',
                    },
                  ],
                },
              ],
              filterByText: {
                label: 'Filter by text',
                fields: [
                  'service_name',
                  'address',
                ],
              },
              mapOverlay: {
                marker: 'circle',
                style: {
                  radius: 6,
                  fillColor: '#ff3f3f',
                  color: '#ff0000',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 1,
                },
                hoverStyle: {
                  radius: 6,
                  fillColor: 'yellow',
                  color: '#ff0000',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 2,
                },
              },
              fields: [
                {
                  label: 'Date',
                  value: function(state, item) {
                    return item.requested_datetime;
                  },
                  nullValue: 'no date available',
                  transforms: [
                    'date',
                  ],
                },
                {
                  label: 'Address',
                  value: function(state, item) {
                    return item.address;
                  },
                },
                {
                  label: 'Subject',
                  value: function(state, item) {
                    if (item.media_url) {
                      return '<a target="_blank" href='+item.media_url+'>'+item.service_name+'</a>';
                    }
                    return item.service_name;

                  },
                },
                {
                  label: 'Distance',
                  value: function(state, item) {
                    return parseInt(item.distance) + ' ft';
                  },
                },
              ],
            },
            slots: {
              title: 'Nearby Service Requests',
              data: 'threeOneOneCarto',
              items: function(state) {
                var data = state.sources['threeOneOneCarto'].data || [];
                var rows = data.map(function(row){
                  var itemRow = row;
                  // var itemRow = Object.assign({}, row);
                  return itemRow;
                });
                return rows;
              },
            },
          },
          {
            type: 'horizontal-table',
            options: {
              id: 'crimeIncidents',
              sort: {
                select: true,
                sortFields: [
                  'distance',
                  'date',
                ],
                getValue: function(item, sortField) {
                  var val;
                  if (sortField === 'date' || !sortField) {
                    val = item.dispatch_date;
                  } else if (sortField === 'distance') {
                    val = item.distance;
                  }
                  return val;
                },
                order: function(sortField) {
                  var val;
                  if (sortField === 'date') {
                    val = 'desc';
                  } else {
                    val = 'asc';
                  }
                  return val;
                },
              },
              filters: [
                {
                  type: 'time',
                  getValue: function(item) {
                    return item.dispatch_date;
                  },
                  label: 'From the last',
                  values: [
                    {
                      label: '30 days',
                      value: '30',
                      unit: 'days',
                      direction: 'subtract',
                    },
                    {
                      label: '90 days',
                      value: '90',
                      unit: 'days',
                      direction: 'subtract',
                    },
                  ],
                },
              ],
              filterByText: {
                label: 'Filter by',
                fields: [
                  'text_general_code',
                ],
              },
              mapOverlay: {
                marker: 'circle',
                style: {
                  radius: 6,
                  fillColor: '#6674df',
                  color: '#6674df',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 1,
                },
                hoverStyle: {
                  radius: 6,
                  fillColor: 'yellow',
                  color: '#6674df',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 2,
                },
              },
              fields: [
                {
                  label: 'Date',
                  value: function(state, item) {
                    return item.dispatch_date;
                  },
                  nullValue: 'no date available',
                  transforms: [
                    'date',
                  ],
                },
                {
                  label: 'Location',
                  value: function(state, item) {
                    return item.location_block;
                  },
                },
                {
                  label: 'Description',
                  value: function(state, item) {
                    return item.text_general_code;
                  },
                },
                {
                  label: 'Distance',
                  value: function(state, item) {
                    return parseInt(item.distance) + ' ft';
                  },
                },
              ],
            },
            slots: {
              title: 'Crime Incidents',
              data: 'crimeIncidents',
              items: function(state) {
                var data = state.sources['crimeIncidents'].data || [];
                var rows = data.map(function(row){
                  var itemRow = row;
                  // var itemRow = Object.assign({}, row);
                  return itemRow;
                });
                return rows;
              },
            }, // end of slots
          }, // end of horizontal-table
          {
            type: 'horizontal-table',
            options: {
              id: 'nearbyZoningAppeals',
              sort: {
                select: true,
                sortFields: [
                  'distance',
                  'date',
                ],
                getValue: function(item, sortField) {
                  var val;
                  if (sortField === 'date' || !sortField) {
                    val = item.decisiondate;
                  } else if (sortField === 'distance') {
                    val = item.distance;
                  }
                  return val;
                },
                order: function(sortField) {
                  var val;
                  if (sortField === 'date') {
                    val = 'desc';
                  } else {
                    val = 'asc';
                  }
                  return val;
                },
              },
              filterByText: {
                label: 'Filter by',
                fields: [
                  'appealgrounds',
                ],
              },
              mapOverlay: {
                marker: 'circle',
                style: {
                  radius: 6,
                  fillColor: '#009900',
                  color: '#009900',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 1,
                },
                hoverStyle: {
                  radius: 6,
                  fillColor: 'yellow',
                  color: '#009900',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 2,
                },
              },
              fields: [
                {
                  label: 'Date',
                  value: function(state, item) {
                    return item.scheduleddate;
                  },
                  nullValue: 'no date available',
                  transforms: [
                    'date',
                  ],
                },
                {
                  label: 'Location',
                  value: function(state, item) {
                    return item.address;
                  },
                },
                {
                  label: 'Description',
                  value: function(state, item) {
                    return item.appealgrounds;
                  },
                },
                {
                  label: 'Distance',
                  value: function(state, item) {
                    return parseInt(item.distance) + ' ft';
                  },
                },
              ],
            },
            slots: {
              title: 'Zoning Appeals',
              data: 'nearbyZoningAppeals',
              items: function(state) {
                var data = state.sources['nearbyZoningAppeals'].data || [];
                var rows = data.map(function(row){
                  var itemRow = row;
                  // var itemRow = Object.assign({}, row);
                  return itemRow;
                });
                return rows;
              },
            }, // end of slots
          }, // end of horizontal-table
          {
            type: 'horizontal-table',
            options: {
              id: 'vacantIndicatorsPoints',
              sort: {
                select: true,
                sortFields: [
                  'distance',
                  'type',
                ],
                getValue: function(item, sortField) {
                  var val;
                  if (sortField === 'type' || !sortField) {
                    val = item.properties.VACANT_FLAG;
                  } else if (sortField === 'distance') {
                    val = item._distance;
                  }
                  return val;
                },
              },
              filterByText: {
                label: 'Filter by',
                fields: [
                  'ADDRESS',
                  'VACANT_FLAG',
                ],
              },
              mapOverlay: {
                marker: 'circle',
                style: {
                  radius: 6,
                  fillColor: '#9400c6',
                  color: '#9400c6',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 1,
                },
                hoverStyle: {
                  radius: 6,
                  fillColor: 'yellow',
                  color: '#009900',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1.0,
                  'z-index': 2,
                },
              },
              fields: [
                {
                  label: 'Address',
                  value: function(state, item) {
                    return item.properties.ADDRESS;
                  },
                },
                {
                  label: 'Property Type',
                  value: function(state, item) {
                    return item.properties.VACANT_FLAG;
                  },
                },
                {
                  label: 'Distance',
                  value: function(state, item) {
                    return item._distance + ' ft';
                  },
                },
              ],
              externalLink: {
                forceShow: true,
                action: function(count) {
                  return 'See more at Vacancy Property Viewer';
                },
                name: 'Vacancy Property Viewer',
                href: function(state) {
                  // var address = state.geocode.data.properties.street_address;
                  // var addressEncoded = encodeURIComponent(address);
                  return '//phl.maps.arcgis.com/apps/webappviewer/index.html?id=64ac160773d04952bc17ad895cc00680';
                },
              },
            },
            slots: {
              title: 'Likely Vacant Properties',
              data: 'vacantIndicatorsPoints',
              items: function(state) {
                var data = state.sources['vacantIndicatorsPoints'].data || [];
                var rows = data.map(function(row){
                  var itemRow = row;
                  // var itemRow = Object.assign({}, row);
                  return itemRow;
                });
                return rows;
              },
            }, // end of slots
          }, // end of horizontal-table
        ], // end comps
      }, // end options
      slots: {
        // REVIEW should this go in options? maybe not, since it should be
        // reactive.
        items: function(state) {
          // return state.pwdParcel;
          return state.parcel.pwd;
        },
      },
    },
  ],
};
