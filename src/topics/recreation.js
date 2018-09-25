const getNearest = function(state, field) {

  let min = Math.min.apply(null, state.sources[field].data.map(function(item) {return item._distance;}));
  let result  = state.sources[field].data.filter(function(item){return item._distance == min;} );
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

  key: 'recreation',
  icon: 'dribbble',
  label: 'Recreation',
  dataSources: ['libraries', 'recCenters', 'bikeshare'],

  components: [
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
      },
      slots: {
        fields: [
          {
            label: 'Nearest Library',
            //REVIEW: add a fetch nearest function to http-client.js for reusability and separation instead of implementing the logic here
            value: function(state) {
              return getNearest(state, 'libraries').properties.Branch + " Branch"
                     + '<br>' + getNearest(state, 'libraries').properties.Street_Address
                     + '<br> (215) 555-5555'
                     + '<br> Distance: ' + (getNearest(state, 'libraries')._distance/5280).toFixed(1) + ' miles'
                     + '<br> <a href="https://know.freelibrary.org/MyResearch/register">Get a library card</a>';
            },
          },
        ]
      }
    }, // end streets table
    {
      type: 'callout',
      slots: {
        text: '\
          <a href="https://www.rideindego.com/faq/" target="_blank">Indego</a> is Philly\'s public bikeshare. \
          There are now hundreds of self-service bikes and more than 100 stations. The city offers \
          <a href="https://www.rideindego.com/how-it-works/education-classes/" target="_blank">free bike safety \
           classes</a> for adults and teens 14 and older.\
        '
      }
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'bikeshare',
        id: 'bikeshare',
        // limit: 100,
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.distance;
          },
          // asc or desc
          order: 'asc'
        },
        fields: [
          {
            label: 'Station',
            value: function (state, item) {
              return item.properties.Name
            }
          },
          {
            label: '# of Docks',
            value: function (state, item) {
              return item.properties.Docks
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item._distance) + ' ft';
            }
          }
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View a map of all Indego stations with current availability.';
          },
          name: '',
          href: function(state) {
            return '//www.rideindego.com/stations/';
          }
        }
      },
      slots: {
        title: 'Nearby Indigo Stations',
        data: 'bikeshare',
        items: function(state) {
          var data = state.sources['bikeshare'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      }, // end of slots
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'bikeshare',
        id: 'bikeshare',
        // limit: 100,
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Find more parks and recreation facilities citywide';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.phila.gov/parks-rec-finder/#/locations';
          }
        },
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
            label: 'Facility Name',
            value: function (state, item) {
              return item.properties.SITE_NAME;
            }
          },
          {
            label: 'Location',
            value: function (state, item) {
              return titleCase(item.properties.ASSET_ADDR);
            }
          },
          {
            label: 'Type',
            value: function(state, item) {
              return item.properties.ASSET_SUBT1_DESC;
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item._distance) + ' ft';
            }
          }
        ],
      },
      slots: {
        title: 'Nearby Recreation Facilities',
        data: 'recCenters',
        items: function(state) {
          var data = state.sources['recCenters'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      }, // end of slots
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'bikeshare',
        id: 'bikeshare',
        // limit: 100,
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.distance;
          },
          // asc or desc
          order: 'asc'
        },
        fields: [
          {
            label: 'Trail',
            value: function (state, item) {
              return item.properties.Name
            }
          },
          {
            label: 'Entrance',
            value: function (state, item) {
              return item.properties.Name
            }
          },
          {
            label: 'Type',
            value: function (state, item) {
              return item.properties.Docks
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item._distance) + ' ft';
            }
          }
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View a map of all major walking and biking trails.';
          },
          name: '',
          href: function(state) {
            return '//phl.maps.arcgis.com/apps/webappviewer/index.html?id=2e70012008fc409e9f34810f18102f01';
          }
        }
      },
      slots: {
        title: 'Nearby Trail Access (Placeholder Data)',
        data: 'bikeshare',
        items: function(state) {
          var data = state.sources['bikeshare'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      }, // end of slots
    }
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd'
};
