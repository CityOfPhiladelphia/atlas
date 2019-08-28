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
  url: '//phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature, state){
        var parcelBaseAddress = helpers.concatDorAddress(feature);
        var geocode = state.geocode.data.properties;
        // if (!parcelBaseAddress || parcelBaseAddress === 'null'){
        //   var where = "MATCHED_REGMAP = '" + state.parcels.dor.data[0].properties.BASEREG + "'";
        // } else {
          // TODO make these all camel case
        var props = state.geocode.data.properties,
            address_low = props.address_low,
            address_floor = Math.floor(address_low / 100, 1) * 100,
            address_remainder = address_low - address_floor,
            addressHigh = props.address_high,
            addressCeil = addressHigh || address_low;
        return "select * from rtt_summary WHERE (((ADDRESS_LOW >= " + address_low + " AND ADDRESS_LOW <= " + address_low + ") OR (ADDRESS_LOW >= " + address_floor + " AND ADDRESS_LOW <= " + address_low + " AND CAST (ADDRESS_HIGH AS numeric) >= " + address_remainder + ")) AND STREET_NAME = '" + geocode.street_name + "' AND STREET_SUFFIX = '" + geocode.street_suffix + "' AND (MOD(ADDRESS_LOW,2) =MOD( " + address_low + ",2))) OR MATCHED_REGMAP = '" + state.parcels.dor.data[0].properties.BASEREG + "' OR REG_MAP_ID = '" + state.parcels.dor.data[0].properties.BASEREG + "'"
      }
    }
  },
}
