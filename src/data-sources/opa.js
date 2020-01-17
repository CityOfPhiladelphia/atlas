export default {
  id: 'opa',
  type: 'http-get',
  url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
  options: {
    params: {
      parcel_number: function(feature) {
        return feature.properties.opa_account_num; 
      },
    },
    success: function(data) {
      return data[0];
    },
  },
};
