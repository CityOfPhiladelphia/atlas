export default {
  key: 'schools',
  icon: 'graduation-cap',
  label: 'Schools',
  dataSources: ['charterSchools'],

  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          School Catchment Areas, Political Divisions and Districts, Public Safety, Planning Districts, \
          Census Geographies,  Streets and Sanitation information at your search address. \
          Sources: \
        '
      }
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
      },
      slots: {
        title: 'Neighborhood Schools',
        fields: [
          {
            label: 'Elementary & Middle School',
            value: function(state) {
              return state.geocode.data.properties.elementary_school;
            },
          },
          {
            label: 'Middle School',
            value: function(state) {
              return state.geocode.data.properties.middle_school;
            },
          },
          {
            label: 'High School',
            value: function(state) {
              return state.geocode.data.properties.high_school;
            },
          },
        ]
      }
    }, // end schgools table

    {
      type: 'horizontal-table',
      options: {
        topicKey: 'schoolinfo',
        id: 'charterSchools',
        // limit: 100,
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
            label: 'School Name',
            value: function (state, item) {
              return item.properties.FACILNAME_LABEL
            }
          },
          {
            label: 'Address',
            value: function (state, item) {
              return item.properties.FACIL_ADDRESS
            }
          },
          {
            label: 'Grades',
            value: function (state, item) {
              return item.properties.GRADE_ORG
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
        title: 'Nearby Citywide, Special Admission & Charter Schools',
        data: 'charterSchools',
        items: function(state) {
          var data = state.sources['charterSchools'].data || [];
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
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'See a complete list from the Philadelphia School District';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.philasd.org/directory/school-directory/';
          }
        }
      },
      slots: {
      }
    }, // end table
    {
      type: 'callout',
      slots: {
        text: '\
          <a href="https://www.phila.gov/historical/designation/Pages/criteria.aspx" target="_blank">Community schools</a> \
          are public schools where a full-time coordinator \
          works with the entire school community to identify the community\'s \
          most pressing needs.\
        '
      }
    },
    {
      type: 'horizontal-table',
      options: {
        noCount: true,
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Check if you are eligible for childcare or pre-K funding through PHL Pre-K';
          },

          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.phlprek.org/eligibility/';
          }
        },
      },
      slots: {
        title: 'Pre-K and Childcare'
      }
    }, // end table
    {
      type: 'horizontal-table',
      options: {
        noCount: true,
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Find after-school programs from Pre-K to high school.';
          },

          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.phillyasap.org/index.php/more/directorylisting';
          }
        },
      },
      slots: {
        title: 'After-School Programs'
      }
    }, // end table
    {
      type: 'horizontal-table',
      options: {
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View a map of all Keyspot locations citywide';
          },

          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.phillykeyspots.org/keyspot-finder/';
          }
        },
      },
      slots: {
      }
    }, // end table
  ], // end comps

  basemap: 'pwd',
  dynamicMapLayers: [
    //'zoning'
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
