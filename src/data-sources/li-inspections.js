export default {
  id: 'liInspections',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // return "select * from li_case_inspections where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'";
        // return "select * from case_investigations where opa_account_num = '" + feature.properties.opa_account_num + "'";
     
        let eclipseLocId = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let opaQuery = feature.properties.opa_account_num && feature.properties.opa_account_num != '' ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
        let streetaddress = feature.properties.street_address;
        let li_address_key = feature.properties.li_address_key.replace(/\|/g, "', '");
        return `SELECT * FROM case_investigations WHERE (address = '${streetaddress}' or addressobjectid IN ('${li_address_key}')) \
          AND systemofrecord IN ('HANSEN') `+ opaQuery +` UNION SELECT * FROM case_investigations WHERE \
          addressobjectid IN ('`+ eclipseLocId +`') AND systemofrecord IN ('ECLIPSE')`+ opaQuery;
      },
    },
  },
};
