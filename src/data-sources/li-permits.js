export default {
  id: 'liPermits',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        let eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        let streetaddress = feature.properties.street_address;
        let opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
        let pwd_parcel_id = feature.properties.pwd_parcel_id;
        let addressId = feature.properties.li_address_key.replace(/\|/g, "', '");

        return `SELECT * FROM PERMITS WHERE ( address = '${streetaddress}' \
          OR addressobjectid IN ('${ addressId }') \
          OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
          ${ opaQuery } \
          AND systemofrecord IN ('HANSEN') \
          UNION SELECT * FROM PERMITS WHERE ( addressobjectid IN ('${ eclipse_location_id }') \
          OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
          ${ opaQuery } \
          AND systemofrecord IN ('ECLIPSE') \
          ORDER BY permittype`;
          
        // return `SELECT * FROM PERMITS WHERE address = '${ streetaddress }' or addressobjectid IN ('${ addressId }') \
        //   AND systemofrecord IN ('HANSEN') ${ opaQuery } \
        //   UNION SELECT * FROM PERMITS WHERE addressobjectid IN ('${ eclipse_location_id }') OR parcel_id_num IN ( '${ pwd_parcel_id }' ) \
        //   AND systemofrecord IN ('ECLIPSE')${ opaQuery }\
        //   ORDER BY permittype`;

      },
    },
  },
};
