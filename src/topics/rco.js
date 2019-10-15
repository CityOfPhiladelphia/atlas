export default {
  key: 'rco',
  icon: 'map-marker',
  label: 'RCO Notification',
  dataSources: [ 'neighboringProperties' ],
  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          These are your neighbors that you have to inform\
          if you are going to try to change your zoning...\
        ',
      },
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'rco',
        id: 'neighboringProperties',
        downloadButton: true,
        downloadFile: 'neighboring-properties',
        // sort: {
        //   select: true,
        //   sortFields: [
        //     'date',
        //     'distance'
        //   ],
        //   getValue: function(item, sortField) {
        //     var val;
        //     if (sortField === 'date' || !sortField) {
        //       val = item.requested_datetime;
        //     } else if (sortField === 'distance') {
        //       val = item.distance;
        //     }
        //     return val;
        //   },
        //   order: function(sortField) {
        //     var val;
        //     if (sortField === 'date') {
        //       val = 'desc';
        //     } else {
        //       val = 'asc';
        //     }
        //     return val;
        //   }
        // },
        // filters: [
        //   {
        //     type: 'time',
        //     getValue: function(item) {
        //       return item.requested_datetime;
        //     },
        //     label: 'From the last',
        //     values: [
        //       {
        //         label: '30 days',
        //         value: '30',
        //         unit: 'days',
        //         direction: 'subtract',
        //       },
        //       {
        //         label: '90 days',
        //         value: '90',
        //         unit: 'days',
        //         direction: 'subtract',
        //       },
        //       {
        //         label: 'year',
        //         value: '1',
        //         unit: 'years',
        //         direction: 'subtract',
        //       }
        //     ]
        //   }
        // ],
        // filterByText: {
        //   label: 'Filter by text',
        //   fields: [
        //     'service_name',
        //     'address'
        //   ]
        // },
        mapOverlay: {
          marker: 'geojson',
          style: {
            // radius: 6,
            fillColor: 'red',
            // fillColor: '#ff3f3f',
            color: 'red',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.3,
          },
          hoverStyle: {
            // radius: 6,
            fillColor: 'yellow',
            color: '#ff0000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.3,
          },
        },
        fields: [
          {
            label: 'Address',
            value: function(state, item) {
              return item.properties.ADDRESS;
            },
          },
          // {
          //   label: 'Description',
          //   value: function(state, item) {
          //     return item.properties.BLDG_DESC;
          //   }
          // },
          {
            label: 'Distance',
            value: function(state, item) {
              return parseInt(item._distance) + ' ft';
            },
          },
        ],
      },
      slots: {
        title: 'Neighboring Properties',
        data: 'neighboringProperties',
        items: function(state) {
          var data = state.sources['neighboringProperties'].data || [];
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
  // geojson: {
  //   path: ['neighboringProperties', 'data'],
  //   color: 'red',
  //   key: 'id'
  // },
  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd',
};
