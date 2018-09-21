export default {
  key: 'environment',
  icon: 'leaf',
  label: 'Environment',
  dataSources: ['watersheds', 'friendsGroup'],

  components: [
    {
      type: 'badge-custom',
      options: {
        titleBackground: '#58c04d',
        externalLink: {
          action: function() {
            return 'Last updated 9/9/1999 at 11:11:00 AM';
          },
          href: function(state) {
            return '//www.phila.gov';
          }
        },
        components: [
          {
            type: 'badge',
            options: {
              titleBackground: '#58c04d',
              nullValue: 'None',
            },
            slots: {
              value: function() {
                return "Good";
              },
            },
          }
        ],
      },
      slots: {
        title: 'Current Air Quality',
      }, // end slots
    }, // end of badge-custom
    {
      type: 'vertical-table',

      slots: {
        title: 'Environmental Hazards and Resources',
        fields: [
          {
            label: 'Water at this address drains into:',
            value: function(state) {
              return '<a href="http://www.phillywatersheds.org/your_watershed/find_your_watershed" \
              target ="_blank">'+ state.sources.watersheds.data[0].properties.WATERSHED_NAME +'</a>'
            }
          },
          {
            label: 'Lot Impervious Cover',
            value: function() {
              return "85%"
            }
          },
          {
            label: 'Flood Risk',
            value: function(state) {
              if (state.sources.floodplain.data.length > 0) {
                return "Within 100-year floodplain."
              } else {
              return "Not in 100-year floodplain.";
              }
            }
          },
        ]
      },
    },
    {
      type: 'callout',
      slots: {
        text: "\
        Park Friends groups are volunteer-run community groups dedicated to the care of their\
        park. They organize clean-ups, hold nature walks, festivals, and other events. Contact\
        your park's friends group for more information, to report a concern, or to get involved.\
        "
      }
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'environment',
        id: 'friendsGroup',
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
            label: 'Friends Group',
            value: function (state, item) {
              return item.friendsnam
            }
          },
          {
            label: 'Park Address',
            value: function (state, item) {
              return item.parkaddres
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item.distance) + ' ft';
            }
          }
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'See a full list of Friends of Parks groups and how to start one at a local park.';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//loveyourpark.org/park-friends-network/';
          }
        }
      },
      slots: {
        title: 'Befriend a Nearby Park',
        data: 'friendsGroup',
        items: function(state) {
          var data = state.sources['friendsGroup'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      } // end of slots
    },
    {
      type: 'horizontal-table',
      options: {
        fields: [
          {
            label: 'Location',
            value: function (state, item) {
              return item.friendsnam
            }
          },
          {
            label: 'Project Type',
            value: function (state, item) {
              return item.friendsnam
            }
          },
          {
            label: 'Contact',
            value: function (state, item) {
              return item.parkaddres
            }
          },
          {
            label: 'Year Completed',
            value: function(state, item) {
              return parseInt(item.distance);
            }
          },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item.distance) + ' ft';
            }
          }
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'See a full map of all green infrastructure projects citywide.';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//phl-water.maps.arcgis.com/apps/webappviewer/index.html?id=c5d43ba5291441dabbee5573a3f981d2';
          }
        }
      },
      slots: {
        title: 'Green Stewardship Projects Nearby (Placeholder Data)',
        data: 'friendsGroup',
        items: function(state) {
          var data = state.sources['friendsGroup'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      } // end of slots
    }, // end table
    {
      type: 'callout',
      slots: {
        text: '\
        The historic erasing of Philadelphia\'s surface creeks and streams by converting them into sewers \
        has <a href="http://www.phillywatersheds.org/your_watershed/history" target="_blank">transformed</a>\
        hydrological conditions over time. Of the 283 linear miles of streams that once existed in Philadelphia \
        to carry runoff to the Schuylkill and Delaware Rivers, only 118 miles remain today. These streams can \
        also sometimes cause localized water damage. Historic streams are drawn on the map based on their \
        previous course. Source: Office of Watersheds.\
        '
      }
    },
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd',
  featureLayers: [
    'streetTrees'
  ],
};
