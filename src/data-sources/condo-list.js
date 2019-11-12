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
      gatekeeperKey: helpers.GATEKEEPER_KEY,
      include_units: true,
      opa_only: true,
      page: 1,
    },
    success: function(data, state) {
      let dataFeatures = [];
      for (let feature of data.features) {
        if (feature.properties.address_low_frac !== state.geocode.data.properties.address_low_frac || feature.properties.street_address === state.geocode.data.properties.street_address) {
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
    },
  },
};
