import helpers from '../util/helpers';

export default {
  id: 'condoList',
  type: 'http-get',
  url: '//api.phila.gov/ais/v1/search/',
  options: {
    params: {
      urlAddition: function (feature) {
        return feature.properties.street_address;
      },
      gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
      include_units: true,
      opa_only: true,
      page: 1,
    },
    success: function(data, state) {
      let dataFeatures = [];
      // console.log('in condo-list, data:', data, 'state:', state);
      for (let feature of data.features) {
        // console.log('low frac:', feature.properties.address_low_frac);
        if (feature.properties.address_low_frac !== state.geocode.data.properties.address_low_frac || feature.properties.street_address === state.geocode.data.properties.street_address) {
          // return;
          data.total_size = data.total_size - 1;
        } else {
          dataFeatures.push(feature);
        }
      }
      if (!dataFeatures.length) {
        // return;
      } else {
        data.features = dataFeatures;
        return data;
      }
      // if (data.features)
    },
  },
};
