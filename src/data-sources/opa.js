export default {
  id: 'opa',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature) {
        return "select * from opa_properties_public where parcel_number = '" + feature.properties.opa_account_num + "'";
      },
    },
    success: function(data) {
      return data.rows[0];
    },
  },
};
