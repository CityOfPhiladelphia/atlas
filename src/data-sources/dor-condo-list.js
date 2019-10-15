export default {
  id: 'dorCondoList',
  type: 'http-get',
  targets: {
    get: function(state) {
      return state.parcels.dor.data;
    },
    getTargetId: function(target) {
      return target.properties.OBJECTID;
    },
  },
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature, state){
        return "select * from condominium where mapref = '" + state.parcels.dor.data[0].properties.MAPREG + "'\
                                          and status in (1,3)";
      },
    },
  },
};
