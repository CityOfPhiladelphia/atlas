export default {
  id: 'liInspections',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        let eclipseLocId = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let streetaddress = feature.properties.street_address;
        let li_address_key = feature.properties.li_address_key.replace(/\|/g, "', '");

        return `SELECT * FROM case_investigations WHERE parcel_id_num IN ( '${ feature.properties.pwd_parcel_id }' ) \
        UNION SELECT * FROM case_investigations WHERE opa_account_num IN ('${ feature.properties.opa_account_num}') \
        UNION SELECT * FROM case_investigations WHERE ( address = '${ streetaddress }' OR addressobjectid IN ( '${ li_address_key }' ) ) \
        AND systemofrecord IN ('HANSEN') \
        UNION SELECT * FROM case_investigations WHERE addressobjectid IN ( '${ eclipseLocId }' ) \
        AND systemofrecord IN ('ECLIPSE')`;
      },
    },
  },
};
