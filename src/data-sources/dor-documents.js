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
      q: function(feature){
        return "select * from rtt_summary WHERE (((ADDRESS_LOW >= 1234 AND ADDRESS_LOW <= 1234) OR (ADDRESS_LOW >= 1200 AND ADDRESS_LOW <= 1234 AND CAST (ADDRESS_HIGH AS numeric) >= 34)) AND STREET_NAME = 'MARKET' AND STREET_SUFFIX = 'ST' AND (MOD(ADDRESS_LOW,2) =MOD( 1234,2))) OR MATCHED_REGMAP = '001S070144' OR REG_MAP_ID = '001S070144'"
      }
    }
  },
}
