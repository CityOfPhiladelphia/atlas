export default {
  id: 'liBusinessLicenses',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        var eclipseLocId = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        var li_address_key = feature.properties.li_address_key.split('|');
        let streetaddress = feature.properties.street_address;

        let value;
        if (eclipseLocId) {
          value = `SELECT * FROM BUSINESS_LICENSES WHERE ( address = '${streetaddress}') OR addressobjectid IN ('`+ eclipseLocId +`')\
          UNION SELECT * FROM BUSINESS_LICENSES WHERE opa_account_num IN ('${ feature.properties.opa_account_num}')\
          UNION SELECT * FROM BUSINESS_LICENSES WHERE parcel_id_num IN ( '${ feature.properties.pwd_parcel_id }' )\
          ORDER BY licensetype`;
        } else {
          value = `SELECT * FROM BUSINESS_LICENSES WHERE (address = '${streetaddress}')\
          UNION SELECT * FROM BUSINESS_LICENSES WHERE opa_account_num IN ('${ feature.properties.opa_account_num}')\
          UNION SELECT * FROM BUSINESS_LICENSES WHERE parcel_id_num IN ( '${ feature.properties.pwd_parcel_id }' )\
          ORDER BY licensetype`;
        }
        return value;
      },
    },
  },
};
