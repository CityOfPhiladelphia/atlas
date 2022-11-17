export default {
  id: 'liPermits',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        console.log('li-permits.js query, feature:', feature);
        // return "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'";
        // return "select * from permits where opa_account_num = '" + feature.properties.opa_account_num + "'";

        let eclipseLocId = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let opaQuery = feature.properties.opa_account_num && feature.properties.opa_account_num != '' ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
        let streetaddress = feature.properties.street_address;
        let li_address_key = feature.properties.li_address_key.replace(/\|/g, "', '");
        // return `SELECT * FROM PERMITS WHERE address = '${streetaddress}' or addressobjectid IN ('${li_address_key}') \
        //         AND systemofrecord IN ('HANSEN') `+ opaQuery +` UNION SELECT * FROM PERMITS WHERE \
        //         addressobjectid IN ('`+ eclipseLocId +`') AND systemofrecord IN ('ECLIPSE')`+ opaQuery+`\
        //         ORDER BY permittype`;
        return `SELECT * FROM PERMITS WHERE parcel_id_num IN ( '${ feature.properties.pwd_parcel_id }' ) \
        UNION SELECT * FROM PERMITS WHERE opa_account_num IN ('${ feature.properties.opa_account_num}') \
        UNION SELECT * FROM PERMITS WHERE ( address = '${ streetaddress }' OR addressobjectid IN ( '${ li_address_key }' ) ) \
        AND systemofrecord IN ('HANSEN') \
        UNION SELECT * FROM PERMITS WHERE addressobjectid IN ( '${ eclipseLocId }' ) \
        AND systemofrecord IN ('ECLIPSE')`;

      },
    },
  },
};
