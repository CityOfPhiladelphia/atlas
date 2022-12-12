export default {
  id: 'liViolations',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        var eclipseLocId = feature.properties.eclipse_location_id.split('|');
        var li_address_key = feature.properties.li_address_key.split('|');
        let streetaddress = feature.properties.street_address;

        return `SELECT * FROM VIOLATIONS WHERE parcel_id_num IN ( '${ feature.properties.pwd_parcel_id }' ) \
        UNION SELECT * FROM VIOLATIONS WHERE opa_account_num IN ('${ feature.properties.opa_account_num}') \
        UNION SELECT * FROM VIOLATIONS WHERE ( address = '${ streetaddress }' OR addressobjectid IN ( '${ li_address_key }' ) ) \
        AND systemofrecord IN ('HANSEN') \
        UNION SELECT * FROM VIOLATIONS WHERE addressobjectid IN ( '${ eclipseLocId }' ) \
        AND systemofrecord IN ('ECLIPSE')`;
      },
    },
  },
};
