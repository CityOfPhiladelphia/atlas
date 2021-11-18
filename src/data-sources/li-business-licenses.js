export default {
  id: 'liBusinessLicenses',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        var eclipseLocId = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let opaQuery = feature.properties.opa_account_num && feature.properties.opa_account_num != '' ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
        let streetaddress = feature.properties.street_address;


        return `SELECT * FROM BUSINESS_LICENSES WHERE (addressobjectid IN ('`+ eclipseLocId +`') OR address = '${streetaddress}')`+ opaQuery+`\
                ORDER BY licensetype`;
      },
    },
  },
};
