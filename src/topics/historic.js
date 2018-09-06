import moment from 'moment';

const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

export default {
  key: 'historic',
  icon: 'archway',
  label: 'Historic',
  dataSources: ['histDesignated', 'crimeIncidents', 'histDistrict'],

  components: [
    {
      type: 'callout',
      slots: {
        text: 'Condominium units at your search address, as recorded for property assessment purposes. Click one of the addresses below to see information for that unit.  Use the back button to return to this list. Source: Office of Property Assessment'
      }
    },
    {
      type: 'vertical-table',
      slots: {
        fields: [
          {
            label: 'Historic Deisgnation',
            value: function(state) {
              if (state.sources.histDesignated.data) {
                if (state.sources.histDesignated.data.length > 0) {
                  return state.sources.histDesignated.data[0].properties.DDESIGDATE; } else {
                  return "No date available."
                }
              } else {
                return "No date available."
              }
            }
          },
          {
            label: 'Historic Street',
            value: function() {
              return ("Type of Street or No")
            }
          },
          {
            label: 'Building Age',
            value: function(state) {
              var estimated;
              if (state.sources.opa.data) {
                if (state.sources.opa.data.year_built_estimate === "Y") {estimated = " (estimated)"} else {estimated = ""};
                return state.sources.opa.data.year_built + estimated;
              } else {
                return "No date available.";
              }
            }
          },
          {
            label: 'Building Description',
            value: function(state) {
              if (state.sources.opa.data) {
                return  titleCase(state.sources.opa.data.building_code_description);
              } else {
                return "No date available."
              }
            }
          },
          {
            label: 'Historic District',
            value: function(state) {
              if (state.sources.histDistrict.data ) {
                if (state.sources.histDistrict.data.length > 0) {
                  return state.sources.histDistrict.data[0].properties.NAME
                        +"<br>Designated - <b><a> " + moment(state.sources.histDistrict.data[0].properties.DESIGNATED1).format("MMM Do, YYYY") + "</a></b>"
                        +"<br><b><a>View complete inventory</a></b>";
                  } else {
                  return "No"
                }
              } else {
                return "No"
              }
            }
          },
          {
            label: 'Conservation District',
            value: function(state) {
              if (state.sources.neighConservation.data) {
                if (state.sources.neighConservation.data.length > 0) {
                  return ('<a href='+state.sources.neighConservation.data[0].properties.CODE_SECTION_LINK +' target="_blank">Yes - Click for more Info</a>'); } else {
                  return "No";
                }
              } else {
                return "No";
              }
            }
          },
        ]
      }
    },
  ],

  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
