export default {
  id: 'zoningDocs',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature) {
        // var stmt = "select * from zoning_documents_20170420 where address_std = '" + feature.properties.street_address + "'";

        // var stmt = "select * from li_zoning_docs where addressobjectid = ANY('{" + feature.properties.eclipse_location_id + "}')";
        var stmt = "select * from li_zoning_docs where CAST(addressobjectid as varchar) = ANY('{" + feature.properties.eclipse_location_id + "}'::text[])";
        console.log('in zoning-docs.js, stmt:', stmt);

        // var stmt = "select * from ais_zoning_documents where doc_id in '"
        // for (i = 0; i < feature.properties.zoning_document_ids.length; i++) {
        //   stmt += feature.properties.zoning_document_ids[i] + "', '"
        // }
        // stmt += "']";

        // var addressKey = feature.properties.li_address_key;
        // if (addressKey && addressKey.length > 0) {
        //   stmt += " or addrkey = " + feature.properties.li_address_key;
        // }
        return stmt;
      },
    },
  },
};
