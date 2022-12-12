export default {
  id: 'zoningAppeals',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature) {
        let eclipseLocId = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let streetaddress = feature.properties.street_address;
        let li_address_key = feature.properties.li_address_key.replace(/\|/g, "', '");
        
        return `SELECT * FROM APPEALS WHERE parcel_id_num IN ( '${ feature.properties.pwd_parcel_id }' ) AND ( appealtype like 'ZBA%' or APPLICATIONTYPE = 'RB_ZBA') \
        UNION SELECT * FROM APPEALS WHERE opa_account_num IN ('${ feature.properties.opa_account_num}') AND ( appealtype like 'ZBA%' or APPLICATIONTYPE = 'RB_ZBA') \
        UNION SELECT * FROM APPEALS WHERE ( address = '${ streetaddress }' OR addressobjectid IN ( '${ li_address_key }' ) ) \
        AND systemofrecord IN ('HANSEN') AND ( appealtype like 'ZBA%' or APPLICATIONTYPE = 'RB_ZBA') \
        UNION SELECT * FROM APPEALS WHERE addressobjectid IN ( '${ eclipseLocId }' ) \
        AND systemofrecord IN ('ECLIPSE') AND ( appealtype like 'ZBA%' or APPLICATIONTYPE = 'RB_ZBA')`;
      },
    },
  },
};
