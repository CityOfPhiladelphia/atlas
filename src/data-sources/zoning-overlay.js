export default {
  id: 'zoningOverlay',
  type: 'http-get',
  dependent: 'parcel',
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
      q: function(feature, state) {
        // var stmt = "with all_zoning as (select * from zoning_overlays),"
        //          + "parcel as (select * from dor_parcel where dor_parcel.mapreg = '" + feature.properties.dor_parcel_id + "'),"
        //          // + "parcel as (select * from dor_parcel where dor_parcel.mapreg = '" + feature.properties.MAPREG + "'),"
        //          // + "parcel as (select * from dor_parcel where dor_parcel.mapreg = '" + state.parcels.dor.data[0].properties.MAPREG + "'),"
        //          + "zp as (select all_zoning.* from all_zoning, parcel where st_intersects(parcel.the_geom, all_zoning.the_geom)),"
        //          + "total as (select zp.*, st_area(st_intersection(zp.the_geom, parcel.the_geom)) / st_area(parcel.the_geom) as overlap_area from zp, parcel)"
        //          + "select * from total where overlap_area >= 0.01"
        var mapreg = feature.properties.MAPREG,
          stmt = "\
            WITH all_zoning AS \
              ( \
                SELECT * \
                FROM   phl.zoning_overlays \
              ), \
            parcel AS \
              ( \
                SELECT * \
                FROM   phl.dor_parcel \
                WHERE  dor_parcel.mapreg = '" + mapreg + "' \
              ), \
            zp AS \
              ( \
                SELECT all_zoning.* \
                FROM all_zoning, parcel \
                WHERE st_intersects(parcel.the_geom, all_zoning.the_geom) \
              ) \
            SELECT code_section, \
                  code_section_link, \
                  objectid, \
                  overlay_name, \
                  overlay_symbol, \
                  pending, \
                  pendingbill, \
                  pendingbillurl, \
                  sunset_date, \
                  type \
            FROM zp \
          ";
        return stmt;
      },
    },
  },
};
