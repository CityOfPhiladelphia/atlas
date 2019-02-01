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
        text: 'Results indicate likely status of historic designation for this property. \
               Please contact the Historical Commission to verify this result before taking \
               actions on alterations or other property issues.<br> \
               Phone: (215) 686-7660 <br> Mon-Fri, 8:30 a.m. to 4:00 p.m.'
      }
    },
    {
      type: 'callout',
      slots: {
        text: 'The Philadelphia Historical Commission identifies and designates historic resources, listing them on \
               the Philadelphia Register of Historic Places, and inventory that currently includes more than 22,000\
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
                      if( state.sources.histDesignated.data[0].properties.DDESIGDATE != null ) {
                        return "Designated: " + state.sources.histDesignated.data[0].properties.DDESIGDATE
                      } else if (state.sources.histDesignated.data[0].properties.IDESIGDATE1 != null) {
                        return "Designated: " + state.sources.histDesignated.data[0].properties.IDESIGDATE1
                      } else if (state.sources.histDesignated.data[0].properties.IDESIGDATE2 != null) {
                        return "Designated: " + state.sources.histDesignated.data[0].properties.IDESIGDATE2
                      } else {
                        return "Not date available"
                      }
                } else {
                return "Not designated as historic."
                }
              } else {
                return "Not designated as historic."
              }
            }
          },
          {
            label: 'Building Age',
            value: function(state) {
              var estimated;
              var date;
              if (state.sources.opa.data) {
                if (state.sources.opa.data.year_built_estimate === "Y") {
                  estimated = " (estimated)"
                } else {
                  estimated = ""
                };
                if (state.sources.opa.data.year_built_estimate === "0000") {
                  date = "No date available.";
                 return date
               } else {
                 date = state.sources.opa.data.year_built;
                 return date
               }
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
                return "No description available."
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
                        View a complete inventory of historic districts. <i class='fa fa-external-link'>\
                        </i></a></b>";
                  } else {
                  return "This property is not within a historic district.\
                  <br><b><a href='https://www.phila.gov/historical/register/Pages/districts.aspx' target='_blank'>\
                  View a complete inventory of historic districts. <i class='fa fa-external-link'></i></a></b>"
                }
              } else {
                return "This property is not within a historic district.\
                <br><b><a href='https://www.phila.gov/historical/register/Pages/districts.aspx' target='_blank'>\
                View a complete inventory of historic districts. <i class='fa fa-external-link'></i></a></b>"
              }
            }
          },
          {
            label: 'Conservation District',
            value: function(state) {
              if (state.sources.neighConservation.data) {
                if (state.sources.neighConservation.data.length > 0) {
                  return ('<a href='+state.sources.neighConservation.data[0].properties.CODE_SECTION_LINK +' target="_blank">Yes - Click for more Info <i class="fa fa-external-link"></i></a>'); } else {
                  return "<a href='https://www.phila.gov/CityPlanning/resources/Publications/Conservation%20districts%20fact%20sheet.pdf' target='_blank'>This property is not within a conservation district. <i class='fa fa-external-link'></i></a>"
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
      type: 'callout',
      slots: {
        text: 'Historic streets identify older streets with historical value and include information \
               such as construction materials used. Legal cards are a collection of cards containing \
               the official record of the legal description and drawings of city streets.\
               <br>Source: Streets Department.'
      }
    },
    {
      type: 'vertical-table',
      slots: {
        title: 'Historic Street Details',
        fields: [
          {
            label: 'Historic Street',
            value: function(state) {
              if (state.sources.historicStreets.data) {
                return (titleCase(state.sources.historicStreets.data.ON_STREET)
                + " - " + titleCase(state.sources.historicStreets.data.PRIMARYROA))
              } else {
                return "Street not designated as historic."
              }
            }
          },
          {
            label: 'Legal Card of City Street',
            value: function(state) {
              if (state.sources.histLegalCards.data) {
                return "<a href='"+state.sources.histLegalCards.data.LINK + "' target='_blank'>\
                View Image of legal card <i class='fa fa-external-link'></i></a>" } else {
                return "Legal card not available."
              }
            }
          },
        ]
      }
    },
    {
      type: 'horizontal-table',
      options: {
        // mapOverlay: {
        //   marker: 'circle',
        //   style: {
        //     radius: 6,
        //     fillColor: '#ff3f3f',
        //     color: '#ff0000',
        //     weight: 1,
        //     opacity: 1,
        //     fillOpacity: 1.0
        //   },
        //   hoverStyle: {
        //     radius: 6,
        //     fillColor: 'yellow',
        //     color: '#ff0000',
        //     weight: 1,
        //     opacity: 1,
        //     fillOpacity: 1.0
        //   }
        // },
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
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item._distance;
          },
          // asc or desc
          order: 'asc',
        },
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
        },
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
        text: 'For more information about historic buildings and the nomination process \
               please visit <a href="https://www.phila.gov/historical/pages/default.aspx" \
               target="_blank">The Philadelphia Historical Commission.<i class="fa fa-external-link"></i></a>'
      }
    },
  ],

  basemap: 'pwd',
  imagery: 'historic1910',
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
