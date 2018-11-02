export default {
  id: 'liBusinessLicenses',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      // q: function(feature){ return "select * from li_business_licenses where street_address = '" + feature.properties.street_address + "'"},// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
      q: function(feature){ return "select * from li_business_licenses where eclipse_addressobjectid = '" + feature.properties.eclipse_location_id + "'"},// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
    }
  }
}
