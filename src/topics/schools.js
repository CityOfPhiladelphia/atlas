export default {
  key: 'schools',
  icon: 'graduation-cap',
  label: 'Schools',
  dataSources: ['charterSchools'],

  components: [

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
