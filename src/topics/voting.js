const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

export default {
  key: 'voting',
  icon: 'gavel',
  label: 'Voting',
  dataSources: ['divisions', 'elections'],
  components: [
    {
      type: 'badge',
      options: {
        titleBackground: '#C8C6C6',
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Preview ballot';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.philadelphiavotes.com/index.php?option=com_voterapp&tmpl=component#ballots';
          }
        },
      },
      slots: {
        title: 'Next Eligible Election Is',
        value: function(state) {
          return 'Month 6, 2018';
        },
      }, // end slots
    }, // end of badge
    {
      type: 'callout',
      slots: {
        text: '\
          The deadline to register for the next election \
          is <b>${Add date here}</b>, 30 days prior to the election. \
          You can confirm your registration and learn about \
          registering to vote<a target="_blank" \
          href="https://www.philadelphiavotes.com/en/voters/polling-place-accessibility"> \
          here</a>.\
        ',
      }
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'Learn about your voting options if you cannot vote in person on Election Day';
          },
          href: function(state) {
            return '//www.philadelphiavotes.com/en/voters/absentee-and-alternative-ballots';
          }
        }
      },

      slots: {
        title: 'Polling Place',
        fields: [
          {
            label: 'Location',
            value: function(state) {
              return "<b>Ward " + state.sources.elections.data.features[0].attributes.ward +
                    ", Division " + state.sources.elections.data.features[0].attributes.division + "</b><br>" +
                    titleCase(state.sources.elections.data.features[0].attributes.location) + "<br>" +
                    titleCase(state.sources.elections.data.features[0].attributes.display_address) + "<br>\
                    All locations are open on Election Day <br>from 7am to 8pm."
                    ;
            },
          },
          {
            label: 'Accessibility',
            value: function(state) {
              const answer = state.sources.elections.data.features[0].attributes.building == "F" ? 'Building Fully Accessible' :
                             state.sources.elections.data.features[0].attributes.building == "B" ? 'Building Substantially Accessible' :
                             state.sources.elections.data.features[0].attributes.building == "M" ? 'Building Accessibilty Modified' :
                             state.sources.elections.data.features[0].attributes.building == "R" ? 'Building Accessible With Ramp' :
                             state.sources.elections.data.features[0].attributes.building == "N" ? 'Building Not Accessible' :
                            'Information not available';
              return '<a href="//www.philadelphiavotes.com/en/voters/polling-place-accessibility"\
                      target="_blank">'+answer+'</a>';
            },
          },
          {
            label: 'Parking',
            value: function(state) {
              const parking = state.sources.elections.data.features[0].attributes.parking == "N" ? 'No Parking' :
                              state.sources.elections.data.features[0].attributes.parking == "G" ? 'General Parking' :
                              state.sources.elections.data.features[0].attributes.parking == "L" ? 'Lo' :
                              'Information not available';
              return parking;
            },
          },
        ]
      },

    }, // end police table
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'See all citywide, state, and federal representatives';
          },
          href: function(state) {
            return '//www.philadelphiavotes.com/index.php?option=com_voterapp&tmpl=component#elected-officials';
          }
        }
      },

      slots: {
        title: 'Elected Representatives',
        fields: [
          {
            label: 'District Council Member',
            value: function(state) {
              return '<a>City Council Name (P) - District # </a>';
            },
          },
          {
            label: 'City Hall Office',
            value: function(state) {
              return 'City Hall Room Needed<br>\
                      (215)555-5555, (215)555-5555 <br>\
                      F: (215)555-5555 <br>\
                      <b><a>council.person@phila.gov</a></b>';
            },
          },
          {
            label: 'Current Term',
            value: function(state) {
              return "2018 - 2018";
            },
          },
        ]
      },
    }, // end police table
    {
      type: 'callout',
      slots: {
        text: '\
        The City of Philadelphia is divided into 66 wards, each further broken down \
        into divisions. This determines where you vote. Philadelphia\'s local political \
        parties also organized along these boundaries. Each division is capable of \
        electing two party representatives: the committeepeople. The committeepeople \
        in every ward then elect their ward leader and the ward leaders elect the Chairs \
        of their respective City Committees. <a href="//www.citycommittee.org"\
        target="_blank">The Democratic City Committee</a> and <a href="//phillygop.com"\
        target="_blank">Republican City Committee </a> are the local political party \
        organizations and the work with the state-and national-level organizations \
        (the DNC and RNC). Committeepeople and ward leaders encourage neighbors to \
        vote, endorse candidates, and serve as resources for their neighborhood.\
        '
      }
    },
    {
      type: 'vertical-table',
      slots: {
        title: 'Ward Leadership',
        fields: [
          {
            label: 'Ward and Division',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return 'Ward ' + state.sources.elections.data.features[0].attributes.ward +
                        ', Division ' + state.sources.elections.data.features[0].attributes.division;
              }
              // return state.geocode.data.properties.political_ward;
            }
          },
          {
            label: 'Total Divisions',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return "Total Divisions in Ward";
              }
              // return state.geocode.data.properties.political_division;
            }
          },
          {
            label: 'Democratic Ward Leader',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return "Democratic Ward Leader <br>\
                        123 Address St., ZipCode <br>\
                        (215) 555-5555<br>\
                        <a>emailaddress@email.com</a>";
              }
            }
          },
          {
            label: 'Republic Ward Leader',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return "Republican Ward Leader <br>\
                        123 Address St., ZipCode <br>\
                        (215) 555-5555<br>\
                        <a>emailaddress@email.com</a>";
              }
            }
          },
          {
            label: 'Current Term',
            value: function(state) {
              return "2018 - 2018";
            },
          },
        ]
      }
    },
    {
      type: 'vertical-table',
      slots: {
        title: 'Ward Leadership',
        fields: [
          {
            label: 'Ward and Division',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return 'Ward ' + state.sources.elections.data.features[0].attributes.ward +
                        ', Division ' + state.sources.elections.data.features[0].attributes.division;
              }
              // return state.geocode.data.properties.political_ward;
            }
          },
          {
            label: 'Total Divisions',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return "Total Divisions in Ward";
              }
              // return state.geocode.data.properties.political_division;
            }
          },
          {
            label: 'Democratic Ward Leader',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return "Democratic Ward Leader <br>\
                        123 Address St., ZipCode <br>\
                        (215) 555-5555<br>\
                        <a>emailaddress@email.com</a>";
              }
            }
          },
          {
            label: 'Republic Ward Leader',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return "Republican Ward Leader <br>\
                        123 Address St., ZipCode <br>\
                        (215) 555-5555<br>\
                        <a>emailaddress@email.com</a>";
              }
            }
          },
          {
            label: 'Current Term',
            value: function(state) {
              return "2018 - 2018";
            },
          },

        ]
      }
    }, //end table
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'committeepeople',
        id: 'committeepeople',
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
            label: 'Party',
            value: function (state, item) {
              return item.properties.Name
            }
          },
          {
            label: 'Committeeperson',
            value: function (state, item) {
              return item.properties.Docks
            }
          },
          {
            label: 'Address',
            value: function(state, item) {
              return parseInt(item._distance) + ' ft';
            }
          },
          {
            label: 'Elected',
            value: function(state, item) {
              return parseInt(item._distance) + ' ft';
            }
          }
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View a complete map of ward leaders and committeepeople';
          },
          name: '',
          href: function(state) {
            return '//www.seventy.org/publications/ward-leaders-committeepeople';
          }
        }
      },
      slots: {
        title: 'Division Committeepeople',
        data: 'friendsGroup',
        items: function(state) {
          var data = state.sources['bikeshare'].data || [];
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            return itemRow;
          });
          return rows;
        },
      },
    },
  ],
  zoomToShape: ['geojson', 'marker'],
  geojson: {
    path: ['divisions', 'data'],
    key: 'id',
    style: {
      fillColor: '#42f459',
      color: '#42f459',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    }
  },
  marker: {
    path: ['elections', 'data', 'features', '0', 'attributes'],
    lat: 'lat',
    lng: 'lng',
    key: 'display_address',
    color: '#42f459'
  },
  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
