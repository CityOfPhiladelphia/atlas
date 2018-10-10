import transforms from '../general/transforms';
import moment from 'moment';

const getNearest = function(state, field, distName) {

  let min = Math.min.apply(null, state.sources[field].data.map(function(item) {return item[distName];}));
  let result  = state.sources[field].data.filter(function(item){return item[distName] == min;} );
  let nearest = result? result[0] : null;
  return nearest
};

const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

export default {
  key: 'safety',
  icon: 'star',
  label: 'Public Safety',
  dataSources: ['childWelfare','policePSA', 'policeDistr', 'fireStation', 'streetClosures','crimeIncidents'],

  components: [
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
      },
      slots: {
        // title: 'Public Safety',
        fields: [
          {
            label: 'Police Jurisdiction',
            value: function(state) {
              let mail = 'police.co_'+state.geocode.data.properties.police_district+'@phila.gov'
              function nth(n){return n + ([,'st','nd','rd'][n%100>>3^1&&n%10]||'th')};
              return ('<a href="" target="_blank"><b>'
                      + nth(state.geocode.data.properties.police_district)
                      +' District </b></a><br>'
                      +'PSA '+ state.geocode.data.properties.police_service_area
                      + ", " + state.geocode.data.properties.police_division
                      + '<br>' + state.sources.policeDistr.data[0].properties.LOCATION
                      + '<br>(215) '+ state.sources.policeDistr.data[0].properties.PHONE
                      + '<br> <a href="mailto:'+mail+'">'+mail+'</a>');
            },
          },
        ]
      }
    }, // end police table
    {
      type: 'horizontal-table',
      options: {
        noCount: true,
        limit: 3,
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item._distance;
          },
          // asc or desc
          order: 'asc'
        },
        fields: [
          {
            label: 'Station',
            value: function (state, item) {
              if (item.properties.ENG){
                if(item.properties.LAD > 0) {
                  return 'Engine '+ item.properties.ENG
                         +' / Ladder '+ item.properties.LAD;
                } else {
                  return 'Engine '+ item.properties.ENG
                }
              } else {
                if (item.properties.LAD > 0) {
                  return 'Ladder '+ item.properties.LAD;
                }
              }
            }
          },
          {
            label: 'Location',
            value: function(state, item) {
              function titleCase(str) {
                str = str.toLowerCase().split(' ').map(function(word) {
                  return (word.charAt(0).toUpperCase() + word.slice(1));
                });
                return str.join(' ');
              }
              return titleCase(item.properties.LOCATION);
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return (item._distance/5280).toFixed(1) + ' miles';
            }
          },
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View all fire stations citywide';
          },
          name: '',
          href: function(state) {
            return '//www.phila.gov/services/safety-emergency-preparedness/fire-safety/find-a-fire-station/';
          }
        }
      },
      slots: {
        title: 'Nearby Fire Stations',
        data: 'fireStation',
        items: function(state) {
          var data = state.sources['fireStation'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      }, // end of slots
    }, // end fire table
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
            ]
          }
        ],
        filterByText: {
          label: 'Filter by',
          fields: [
            'text_general_code',
          ]
        },
        mapOverlay: {
          marker: 'circle',
          style: {
            radius: 6,
            fillColor: '#6674df',
            color: '#6674df',
            weight: 1,
            opacity: 1,
            fillOpacity: 1.0
          },
          hoverStyle: {
            radius: 6,
            fillColor: 'yellow',
            color: '#6674df',
            weight: 1,
            opacity: 1,
            fillOpacity: 1.0
          }
        },
        fields: [
          {
            label: 'Date',
            value: function(state, item) {
              return item.dispatch_date;
            },
            nullValue: 'no date available',
            transforms: [
              'date'
            ]
          },
          {
            label: 'Location',
            value: function(state, item) {
              return item.location_block;
            }
          },
          {
            label: 'Description',
            value: function(state, item) {
              return item.text_general_code;
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item.distance) + ' ft';
            }
          }
        ]
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
      } // end of slots
    }, // end of horizontal-table
  ], // end comps
  basemap: 'pwd',
  dynamicMapLayers: [
    //'zoning'
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
