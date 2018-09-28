import moment from 'moment';

export default {
  key: 'blockActivity',
  icon: 'map-signs',
  label: 'Block Activity',
  dataSources: ['fireStation', 'streetClosures'],

  components: [
    {
      type: 'badge-custom',
      options: {
        titleBackground: function(state) {
          const color = state.geocode.data.properties.clean_philly_block_captain == "No" ? '#ff0000' :
                        '#007F00';
          return color;
        },
        externalLink: {
          forceShow: true,
          action: function() {
            return 'How to become a block captain';
          },
          name: '',
          href: function() {
            return '//www.philadelphiastreets.com/pmbc/become-a-block-captain/';
          }
        },
        components: [
          {
            type: 'badge',
            options: {
              titleBackground: function(state) {
                const color = state.geocode.data.properties.clean_philly_block_captain == "No" ? '#ff0000' :
                              '#007F00';
                return color;
              },
            },
            slots: {
              value: function(state) {
                const captain = state.geocode.data.properties.clean_philly_block_captain == "No" ? 'No Block Captain' :
                              'Block Captain Present';
                return captain;
              },
            },
          }
        ],
      },
      slots: {
        title: 'Do you have a block captain?',
      }, // end slots
    }, // end of badge-custom
    {
      type: 'callout',
      slots: {
        text: '\
        <b><a href="//www.philadelphiastreets.com/highways/paving/" target="_blank">\
        PMBC Clean Block Officers</a></b> act as liasons between residents and City \
        government to provide departmental resource materials, information, \
        and services relating to block cleanliness and beautification. When \
        you\'ve got a question or problem that needs solving, turn to your \
        Clean Block Officer first.'
      },
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
      },
      slots: {
        fields: [
          {
            label: 'Clean Block Officer',
            value: function() {
              return ('First Name <br>\
                      (215) 685-3987');
            }
          },
          {
            label: 'PPA Permit Zone',
            value: function() {
              return 'Number';
            }
          },
          {
            label: 'Are trucks allowed down this street?',
            value: function() {
              return 'Placeholder';
            }
          },
          {
            label: 'In this year\'s paving plan?',
            value: function() {
              return '<a target="_blank" href="//www.philadelphiastreets.com/highways/paving/">\
              <b>Placeholder</a></b>';
            }
          },
        ]
      }
    }, // end police table


    {
      type: 'horizontal-table',
      options: {
        limit: 3,
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.distance;
          },
          // asc or desc
          order: 'asc',
        },
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View a map of all lane closures citywide';
          },
          name: '',
          href: function() {
            return '';
          }
        },
        fields: [
          {
            label: 'Date',
            value: function (state, item) {

              let endDate = function(){
                if(item.attributes.EXPIRATIONDATE != null &&item.attributes.EXPIRATIONDATE != "") {
                  return " to " + moment(item.attributes.EXPIRATIONDATE).format('l')
                } else {
                  const endDate = "<br>(No End Date Specified)";
                  return endDate
                };
              };
              return moment(item.attributes.EFFECTIVEDATE).format('l') + endDate() ;
            }
          },
          {
            label: 'Activity',
            value: function(state, item) {
              return item.attributes.OCCUPANCYTYPE;
            }
          },
          {
            label: 'Organization',
            value: function(state, item) {
              return item.attributes.PURPOSE;
            }
          },
        ],
      },
      slots: {
        title: 'Scheduled Street Cleaning, Closures, and Repairs (Current and Upcoming)',
        data: 'streetClosures',
        items: function(state) {
          return state.sources['streetClosures'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
           rows;
        },
      }, // end of slots
    },



    {
      type: 'horizontal-table',
      options: {
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
            label: 'Date',
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
            label: 'Activity',
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
            label: 'Organization',
            value: function(state, item) {
              return (item._distance/5280).toFixed(1) + ' miles';
            }
          },
          {
            label: 'Contact',
            value: function(state, item) {
              return (item._distance/5280).toFixed(1) + ' miles';
            }
          },
        ],
      },
      slots: {
        title: 'Temporary No Parking Permits (Current and Upcoming)\
                ---Placeholder Data',
        data: 'fireStation',
        items: function(state) {
          return state.sources['fireStation'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
           rows;
        },
      }, // end of slots
    },
  ], // end comps
  basemap: 'pwd',
  dynamicMapLayers: [
    //'zoning'
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
