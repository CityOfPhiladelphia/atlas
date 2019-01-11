export default {
  id: 'opa',
  type: 'http-get',
  url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
  options: {
    params: {
      parcel_number: function(feature) {
        if(feature.properties.opa_account_num) {
          return feature.properties.opa_account_num
        } else {
          return feature.properties.BRT_ID;
        }
      }
    },
    success: function(data) {
      return data[0];
    }
  }
}
