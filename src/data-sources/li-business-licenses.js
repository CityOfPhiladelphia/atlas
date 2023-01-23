export default {
  id: 'liBusinessLicenses',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        let eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let streetaddress = feature.properties.street_address;
        let opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
        let pwd_parcel_id = feature.properties.pwd_parcel_id;
        // let addressId = feature.properties.li_address_key.replace(/\|/g, "', '");

        let value;
        if (eclipse_location_id) {
          value = `SELECT * FROM BUSINESS_LICENSES WHERE ( addressobjectid IN ('`+ eclipse_location_id +`') \
          OR address = '${streetaddress}' \
          OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
          ${opaQuery } \
          ORDER BY licensetype`;
        } else {
          value = `SELECT * FROM BUSINESS_LICENSES WHERE ( address = '${streetaddress}' \
          OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
          ${opaQuery } \
          ORDER BY licensetype`;
        }
        // if (eclipse_location_id) {
        //   value = `SELECT * FROM BUSINESS_LICENSES WHERE (addressobjectid IN ('`+ eclipse_location_id +`') \
        //   OR parcel_id_num IN ( '${ pwd_parcel_id }' ) \
        //   OR address = '${streetaddress}') ${ opaQuery } \
        //   ORDER BY licensetype`;
        // } else {
        //   value = `SELECT * FROM BUSINESS_LICENSES WHERE (address = '${streetaddress}') ${ opaQuery } \
        //     OR addressobjectid IN ('${addressId}')) ${ opaQuery } \
        //     ORDER BY licensetype`;
        // }
        return value;
      },
    },
  },
};
