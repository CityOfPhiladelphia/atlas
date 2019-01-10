import moment from 'moment';

const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

export default {
  key: 'historic',
  icon: 'scroll-old',
  label: 'Historic',
  dataSources: ['histDesignated', 'crimeIncidents', 'histDistrict', 'historicNearby'],

  components: [
    {
      type: 'callout',
      slots: {
        text: 'The Philadelphia Historical Commission identifies and designates historic resources, listing them on \
                the Philadelphia Register of Historic Places, an inventory that currently includes more than 22,000\
                properties and 15 historic districts. <br> \
                Source: Philadelphia Historical Commission, Department of Planning, Streets Department.'
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
            label: 'Historic Designation',
            value: function(state) {
              if (state.sources.histDesignated.data) {
                if (state.sources.histDesignated.data.length > 0) {
                  return "Designated: " + state.sources.histDesignated.data[0].properties.DDESIGDATE; } else {
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
                        +"<br>Designated - " + moment(state.sources.histDistrict.data[0].properties.DESIGNATED1).format("MMM Do, YYYY")
                        +"<br><b><a href='https://www.phila.gov/historical/register/Pages/districts.aspx' target='_blank'>\
                        View a complete inventory of historic districts.</a></b>";
                  } else {
                  return "This property is not within a historic district.\
                  <br><b><a href='https://www.phila.gov/historical/register/Pages/districts.aspx' target='_blank'>\
                  View a complete inventory of historic districts.</a></b>"
                }
              } else {
                return "This property is not within a historic district.\
                <br><b><a href='https://www.phila.gov/historical/register/Pages/districts.aspx' target='_blank'>\
                View a complete inventory of historic districts.</a></b>"
              }
            }
          },
          {
            label: 'Conservation District',
            value: function(state) {
              if (state.sources.neighConservation.data) {
                if (state.sources.neighConservation.data.length > 0) {
                  return ('<a href='+state.sources.neighConservation.data[0].properties.CODE_SECTION_LINK +' target="_blank">Yes - Click for more Info</a>'); } else {
                  return "<a href='https://www.phila.gov/CityPlanning/resources/Publications/Conservation%20districts%20fact%20sheet.pdf' target='_blank'>This property is not within a conservation district.</a>"
                }
              } else {
                return "This property is not within a conservation district."
              }
            }
          },
        ]
      }
    },
    {
      type: 'horizontal-table',
      options: {
        fields: [
          {
            label: 'Designated',
            value: function (state, item) {
              if(item.properties.DDESIGDATE != null){
                return item.properties.DDESIGDATE
              } else if(item.properties.IDESIGDATE1 != null){
                return item.properties.IDESIGDATE1
              } else if(item.properties.IDESIGDATE2 != null){
                return item.properties.IDESIGDATE2
              } else {
                return "Not Available"
              }
            }
          },
          {
            label: 'Address',
            value: function (state, item) {
              return item.properties.LOC
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
            return 'See a full map of all properties and districts from the Philadelphia Register of Historic Places.';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//phl.maps.arcgis.com/apps/View/index.html?appid=0a0b23447b6b4f7097d59c580b9045fe';
          }
        }
      },
      slots: {
        title: 'Nearby Historic Places',
        data: 'historicNearby',
        items: function(state) {
          var data = state.sources['historicNearby'].data || [];
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
        text: 'Know a spot that seems historically important that isn\'t listed? Learn about the \
        <a href="//www.phila.gov/historical/designation/Pages/criteria.aspx" target="_blank">criteria\
        </a> for designating properties as historic and how to \
        <a href="//www.phila.gov/historical/designation/Pages/process.aspx" target="_blank">nominated\
        </a> a property for historic designation. The federal <a href="//www.nps.gov/nr/" target="_blank">\
        National Registry</a> designates historic places worth of preservation independently from the \
        Philadelphia Register and each confers different protections. Finally, you can learn more \
        about the Mayor\'s Historic Preservation\
        <a href="http://phl.maps.arcgis.com/apps/Cascade/index.html?appid=925708a09f264efd94932dd9300921bd" \
        target="_blank">Task Force</a> created in May 2017.'
      }
    },
  ],

  basemap: 'pwd',
  imagery: 'historic1910',
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
