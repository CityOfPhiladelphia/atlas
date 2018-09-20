import moment from 'moment';

const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

export default {
  key: 'historic',
  icon: 'leanpub',
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
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'Learn more about owning a property on the historic register.';
          },
          href: function(state) {
            return '//www.phila.gov/historical/designation/Pages/FAQ.aspx';
          }
        }
      },
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
    {
      type: 'callout',
      slots: {
        text: 'Know a spot that seems historically important that isn\'t listed? Learn about the \
        <a href="//www.phila.gov/historical/designation/Pages/criteria.aspx" target="_blank">criteria\
        </a> for designating properties as historic and how to \
        <a href="//www.phila.gov/historical/designation/Pages/process.aspx" target="_blank">nominated\
        </a> a property for historic designation. The federal <a href="//www.nps.gov/nr/" target="_blank">\
        National Registry</a> designates historic places worth of preservation independently from the \
        Philadelphia Register and each confers diffferent protections. Finally, you can learn more \
        about the Mayor\'s Historic Preservation\
        <a href="http://phl.maps.arcgis.com/apps/Cascade/index.html?appid=925708a09f264efd94932dd9300921bd" \
        target="_blank">Task Force</a> created in May 2017.'
      }
    },
  ],

  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
