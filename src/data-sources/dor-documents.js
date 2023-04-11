import helpers from '../util/helpers';

export default {
  id: 'dorDocuments',
  type: 'http-get',
  targets: {
    get: function(state) {
      return state.parcels.dor.data;
    },
    getTargetId: function(target) {
      return target.properties.OBJECTID;
    },
  },
  // url: '//gis.phila.gov/arcgis/rest/services/DOR/rtt_service/MapServer/0/query',
  url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/RTT_SUMMARY/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature, state) {
        // METHOD 1: via address
        var parcelBaseAddress = helpers.concatDorAddress(feature);
        var geocode = state.geocode.data.properties;
        var where;

        // REVIEW if the parcel has no address, we don't want to query
        // WHERE ADDRESS = 'null' (doesn't make sense), so use this for now
        if (!parcelBaseAddress || parcelBaseAddress === 'null'){
          where = "MATCHED_REGMAP = '" + state.parcels.dor.data[0].properties.BASEREG + "'";
        } else {
          // TODO make these all camel case
          var props = state.geocode.data.properties,
            address_low = props.address_low,
            address_floor = Math.floor(address_low / 100, 1) * 100,
            address_remainder = address_low - address_floor,
            addressHigh = props.address_high,
            addressCeil = addressHigh || address_low;

          // form where clause
          where = "(((ADDRESS_LOW >= " + address_low + " AND ADDRESS_LOW <= " + addressCeil + ")"
                    + " OR (ADDRESS_LOW >= " + address_floor + " AND ADDRESS_LOW <= " + addressCeil + " AND ADDRESS_HIGH >= " + address_remainder + " ))"
                    + " AND STREET_NAME = '" + geocode.street_name
                    + "' AND STREET_SUFFIX = '" + geocode.street_suffix
                    + "' AND (MOD(ADDRESS_LOW,2) = MOD( " + address_low + ",2))";



          if (geocode.street_predir != '') {
            where += " AND STREET_PREDIR = '" + geocode.street_predir + "'";
          }

          if (geocode.address_low_suffix != '') {
            where += " AND ADDRESS_LOW_SUFFIX = '" + geocode.address_low_suffix + "'";
          }

          if (geocode.address_low_suffix == '') {
            where += " AND ADDRESS_LOW_SUFFIX = ''";
          }

          // this is hardcoded right now to handle DOR address suffixes that are actually fractions
          if (geocode.address_low_frac === '1/2') {
            where += " AND ADDRESS_LOW_SUFFIX = '2'"; //+ geocode.address_low_frac + "'";
          }

          if (geocode.street_postdir != '') {
            where += " AND STREET_POSTDIR = '" + geocode.street_postdir + "'";
          }

          // check for unit num
          var unitNum = helpers.cleanDorAttribute(feature.properties.UNIT),
            unitNum2 = geocode.unit_num;

          if (unitNum) {
            where += " AND UNIT_NUM = '" + unitNum + "'";
          } else if (unitNum2 !== '') {
            where += " AND UNIT_NUM = '" + unitNum2 + "'";
          }

          where += ") or MATCHED_REGMAP = '" + state.parcels.dor.data[0].properties.BASEREG + "'";
          // where += ") or MATCHED_REGMAP like '%" + state.parcels.dor.data[0].properties.BASEREG + "%'";
          where += " or REG_MAP_ID = '" + state.parcels.dor.data[0].properties.BASEREG + "'";
        }

        return where;
      },
      outFields: "DOCUMENT_ID, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
      // outFields: "R_NUM, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
      returnDistinctValues: 'true',
      returnGeometry: 'false',
      f: 'json',
      sqlFormat: 'standard',
    },
    success: function(data) {
      return data.features;
      // return data.rows;
    },
  },
};
