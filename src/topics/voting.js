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
                   function nth(n){return n + ([,'st','nd','rd'][n%100>>3^1&&n%10]||'th')};
                   return "<b>"+ nth(state.geocode.data.properties.council_district_2016) + " Council District\
                   <br>Ward " + state.sources.elections.data.features[0].attributes.ward +
                   ", Division " + state.sources.elections.data.features[0].attributes.division + "</b><br>" +
                   titleCase(state.sources.elections.data.features[0].attributes.location) + "<br>" +
                   titleCase(state.sources.elections.data.features[0].attributes.display_address) + "<br>\
                   All locations are open on Election Day <br>from 7am to 8pm.";
                  },
          },
          {
            label: 'Accessibility',
            value: function(state) {
              return '<a href="//www.philadelphiavotes.com/en/voters/polling-place-accessibility">\
                    Handicap accessibility data needed</a>';
            },
          },
          {
            label: 'Parking',
            value: function(state) {
              return state.geocode.data.properties.parking;
            },
          },
        ]
      },
    }, // end table
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
