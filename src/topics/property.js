export default {
  key: 'property',
  icon: 'home',
  label: 'Property Assessments',
  // REVIEW can these be calculated from vue deps?
  dataSources: [ 'opa' ],
  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.\
        ',
      },
    },
    {
      type: 'vertical-table',
      slots: {
        fields: [
          {
            label: 'OPA Account #',
            value: function(state) {
              return state.geocode.data.properties.opa_account_num;
            },
          },
          {
            label: 'OPA Address',
            value: function(state) {
              return state.geocode.data.properties.opa_address;
            },
          },
          {
            label: 'Owners',
            value: function(state) {
              var owners = state.geocode.data.properties.opa_owners;
              var ownersJoined = owners.join(', ');
              return ownersJoined;
            },
          },
          {
            label: 'Assessed Value',// + new Date().getFullYear(),
            value: function(state) {
              var data = state.sources.opa.data;
              // return data.market_value;
              var result;
              if (data) {
                result = data.market_value;
              } else {
                result = 'no data';
              }
              return result;
            },
            transforms: [
              'currency',
            ],
          },
          {
            label: 'Sale Date',
            value: function(state) {
              var data = state.sources.opa.data;
              // return data.sale_date;
              var result;
              if (data) {
                result = data.sale_date;
              } else {
                result = 'no data';
              }
              return result;
            },
            transforms: [
              'date',
            ],
          },
          {
            label: 'Sale Price',
            value: function(state) {
              var data = state.sources.opa.data;
              // return data.sale_price;
              var result;
              if (data) {
                result = data.sale_price;
              } else {
                result = 'no data';
              }
              return result;
            },
            transforms: [
              'currency',
            ],
          },
        ],
      },
      options: {
        id: 'opaData',
        // requiredSources: ['opa'],
        externalLink: {
          action: function(count) {
            return 'See more';
          },
          name: 'Property Search',
          href: function(state) {
            var id = state.geocode.data.properties.opa_account_num;
            return 'http://property.phila.gov/?p=' + id;
          },
        },
      },
    },

    //     ]
    //   }
    // }
  ],
  identifyFeature: 'address-marker',
  // we might not need this anymore, now that we have identifyFeature
  parcels: 'pwd',
  errorMessage: function (state) {
    var data = state.sources.condoList.data;
    // features = data.features;

    if (data) {
      var numCondos = data.total_size;

      if (numCondos > 0) {
        var shouldPluralize = numCondos > 1,
          isOrAre = shouldPluralize ? 'are' : 'is',
          unitOrUnits = shouldPluralize ? 'units' : 'unit',
          message = [
            '<h3>',
            'There ',
            isOrAre,
            // ' <strong>',
            ' ',
            numCondos,
            ' condominium ',
            unitOrUnits,
            // '</strong> at this address.</h3>',
            ' at this address.</h3>',
            // ' at this address. ',
            '<p>You can use the Condominiums tab below to see information for an individual unit.</p>',
            // 'Please select a unit from the Condominiums tab below.'
          ].join('');

        return message;
      }
    } else {
      return 'There is no property assessment record for this address.';
    }
  },
};
