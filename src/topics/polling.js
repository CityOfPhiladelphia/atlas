export default {
  key: 'polling',
  icon: 'book',
  label: 'Polling',
  dataSources: [ 'divisions', 'elections' ],
  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          Polling information for this address.\
          The map faithfully reflects polling as described in \
          recorded polling information.\
          The polling boundaries displayed on the map are for polling \
          Source: Department of Polling\
        ',
      },
    },
    {
      type: 'vertical-table',
      slots: {
        fields: [
          {
            label: 'Ward',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return state.sources.elections.data.features[0].attributes.ward;
              }
              // return state.geocode.data.properties.political_ward;
            },
          },
          {
            label: 'Division',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return state.sources.elections.data.features[0].attributes.division;
              }
              // return state.geocode.data.properties.political_division;
            },
          },
          {
            label: 'Polling Location',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return state.sources.elections.data.features[0].attributes.location;
              }
            },
          },
          {
            label: 'Polling Address',
            value: function(state) {
              if (state.sources.elections.data.features[0]) {
                return state.sources.elections.data.features[0].attributes.display_address;
              }
            },
          },
        ],
      },
    },
  ],
  zoomToShape: [ 'geojson', 'marker' ],
  geojson: {
    path: [ 'divisions', 'data' ],
    key: 'id',
    style: {
      fillColor: '#42f459',
      color: '#42f459',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
    },
  },
  marker: {
    path: [ 'elections', 'data', 'features', '0', 'attributes' ],
    lat: 'lat',
    lng: 'lng',
    key: 'display_address',
    color: '#42f459',
  },
  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd',
};
