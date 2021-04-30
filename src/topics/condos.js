export default {
  key: 'condos',
  icon: 'building',
  label: 'Condominiums',
  dataSources: [ 'condoList' ],
  // showTopicBasedOnOtherData takes precedence over showTopicOnlyIfDataExists
  showTopicBasedOnOtherData: {
    'otherData': {
      'opa': {
        data: undefined,
      },
    },
    'requiredData': {
      'condoList': {
        pathToDataArray: [ 'features' ],
        minDataLength: 1,
      },
    },
  },
  // showTopicOnlyIfDataExists can be overruled by showTopicBasedOnOtherData
  showTopicOnlyIfDataExists: {
    'condoList': {
      pathToDataArray: [ 'features' ],
      minDataLength: 2,
    },
  },
  components: [
    {
      type: 'callout',
      slots: {
        text: 'Condominium units at your search address, as recorded for property assessment purposes. Click one of the addresses below to see information for that unit.  Use the back button to return to this list. Source: Office of Property Assessment',
      },
    },
    {
      type: 'horizontal-table',
      options: {
        id: 'condoList',
        useApiCount: true,
        defaultIncrement: 25,
        fields: [
          {
            label: 'Address',
            value: function (state, item) {
              var address = item.properties.street_address;
              console.log('address:', address);
              return '<a href="/' + encodeURIComponent(address) + '/property">' + address + '</a>';
            },
          },
          {
            label: 'OPA Account #',
            value: function (state, item) {
              return item.properties.opa_account_num;
            },
          },
        ], // end fields
        // sort: {
        //   // this should return the val to sort on
        //   getValue: function(item) {
        //     // return item.attributes.RECORDING_DATE;
        //     return item.attributes.DOCUMENT_DATE;
        //   },
        //   // asc or desc
        //   order: 'desc'
        // }
      },
      slots: {
        title: 'Condominiums',
        highestPageRetrieved: function(state) {
          return state.sources['condoList'].data.page;
        },
        pageCount: function(state) {
          return state.sources['condoList'].data.page_count;
        },
        totalSize: function(state) {
          return state.sources['condoList'].data.total_size;
        },
        items: function(state) {
          var data = state.sources['condoList'].data.features;
          var rows = data.map(function(row){
            var itemRow = row;
            return itemRow;
          });
          return rows;
        },
      }, // end slots
    },
  ],
  identifyFeature: 'address-marker',
  // we might not need this anymore, now that we have identifyFeature
  parcels: 'pwd',
};
