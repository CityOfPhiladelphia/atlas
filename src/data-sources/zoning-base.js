export default {
  id: 'zoningBase',
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
        // console.log('feature:', feature, 'state.parcels.dor:', state.parcels.dor, 'state.parcels.dor.data[0]', state.parcels.dor.data[0]);
        // var stmt = "with all_zoning as (select * from zoning_basedistricts),"
        //          + "parcel as (select * from dor_parcel where dor_parcel.mapreg = '" + feature.properties.MAPREG + "'),"
        //          // + "parcel as (select * from dor_parcel where dor_parcel.mapreg = '" + state.parcels.dor.data[0].properties.MAPREG + "'),"
        //          + "zp as (select all_zoning.* from all_zoning, parcel where st_intersects(parcel.the_geom, all_zoning.the_geom)),"
        //          // + "select zp.source_object_id, zp.value, st_area(st_intersection(zp.the_geom, parcel.the_geom)) / st_area(parcel.the_geom) as geom from zp, parcel";
        //          + "total as (select zp.objectid, zp.long_code, st_area(st_intersection(zp.the_geom, parcel.the_geom)) / st_area(parcel.the_geom) as overlap_area from zp, parcel)"
        //          + "select * from total where overlap_area >= 0.01"
        //          // + "select * from zp";
        var mapreg = feature.properties.MAPREG,
          stmt = "\
              WITH all_zoning AS \
                ( \
                  SELECT * \
                  FROM   phl.zoning_basedistricts \
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
                  FROM   all_zoning, parcel \
                  WHERE  St_intersects(parcel.the_geom, all_zoning.the_geom) \
                ), \
              combine AS \
                ( \
                  SELECT zp.objectid, \
                  zp.long_code, \
                  zp.pending, \
                  zp.pendingbill, \
                  zp.pendingbillurl, \
                  St_area(St_intersection(zp.the_geom, parcel.the_geom)) / St_area(parcel.the_geom) AS overlap_area \
                  FROM zp, parcel \
                ), \
              total AS \
                ( \
                  SELECT long_code, pending, pendingbill, pendingbillurl, sum(overlap_area) as sum_overlap_area \
                  FROM combine \
                  GROUP BY long_code, pending, pendingbill, pendingbillurl \
                ) \
              SELECT * \
              FROM total \
              WHERE sum_overlap_area >= 0.01 \
            ";
        return stmt;
      },
    },
  },
};
