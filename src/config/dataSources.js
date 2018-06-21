import helpers from '../util/helpers';

export default {
  // nearby: {
  //   type: 'http-get',
  //   url: 'https://phl.carto.com/api/v2/sql',
  //   options: {
  //     params: {
  //       q: function(feature) {
  //         var aisX = feature.geometry.coordinates[0];
  //         var aisY = feature.geometry.coordinates[1];
  //         var table = 'incidents_part1_part2';
  //         var distanceFn = "ST_Distance(the_geom_webmercator, ST_Transform(CDB_LatLng(" + aisY + ", " + aisX + "), 3857)) * 3.28084";
  //         var where = distanceFn + ' < 500';
  //         //fieldMap = activityType.fieldMap,
  //         var select = ['ST_X(the_geom) as x',
  //                         'ST_Y(the_geom) as y',
  //                         distanceFn + "AS distance",
  //                       ].join(', ');
  //         query = ['SELECT', select, 'FROM', table, 'WHERE', where].join(' ');
  //         return (query);
  //         }
  //     },
  //     success(data) {
  //       return data
  //     }
  //   }
  // },
  opa: {
    type: 'http-get',
    url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
    options: {
      params: {
        parcel_number: function(feature) { return feature.properties.opa_account_num; }
      },
      success: function(data) {
        return data[0];
      }
    }
  },
  // TODO elections and divisions
  elections: {
    url: 'https://api.phila.gov/pollingtest',
    type: 'http-get',
    options: {
      params: {
        option: 'com_pollingplaces',
        view: 'json',
        ward: function(feature) {
          if (feature.properties.election_precinct !== '') {
            return feature.properties.election_precinct.slice(0,2);
          } else {
            return feature.properties.political_division.slice(0,2);
          }
        },
        division: function(feature) {
          if (feature.properties.election_precinct !== '') {
            return feature.properties.election_precinct.slice(2,4);
          } else {
            return feature.properties.political_division.slice(2,4);
          }
        }
      },
      success(data) {
        return data;
      }
    }
  },
  divisions: {
    url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
    // type: 'http-get',
    type: 'esri',
    options: {
      relationship: 'contains',
    },
    success: function(data) {
      return data;
    }
  },
  // stormwater: {
  //   type: 'http-get',
  //   url: 'https://api.phila.gov/stormwater',
  //   options: {
  //     params: {
  //       search: function(feature){ return feature.properties.street_address; }
  //     },
  //     success: function(data) {
  //       return data[0];
  //     }
  //   }
  // },
  liPermits: {
    type: 'http-get',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(feature){ return "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
      }
    }
  },
  // liPermitsAdditional: {
  //   type: 'http-get',
  //   url: 'http://ase.phila.gov/arcgis/rest/services/GSG/GIS_LNI_LI_PERMITS_PLANNING/FeatureServer/0/query?',
  //   options: {
  //     params: {
  //       where: function(feature) {
  //         return "ADDRESS = '" + feature.properties.street_address + "' OR ADDRESSKEY = '" + feature.properties.li_address_key + "'"
  //       },
  //       outFields: '*',
  //       f: 'json'
  //     },
  //     success: function(data) {
  //       return data.features;
  //     },
  //   },
  // },
  liInspections: {
    type: 'http-get',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(feature){ return "select * from li_case_inspections where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
      }
    }
  },
  liViolations: {
    type: 'http-get',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(feature){ return "select * from li_violations where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
      }
    }
  },
  liBusinessLicenses: {
    type: 'http-get',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(feature){ return "select * from li_business_licenses where street_address = '" + feature.properties.street_address + "'"},// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
      }
    }
  },
  zoningAppeals: {
    type: 'http-get',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(feature) {
          var stmt = "select * from li_appeals where address = '" + feature.properties.street_address + "'";
          var addressKey = feature.properties.li_address_key;

          if (addressKey && addressKey.length > 0) {
            stmt += " or addresskey = '" + feature.properties.li_address_key.toString() + "'";
          }

          return stmt;
        }
      }
    }
  },
  zoningDocs: {
    type: 'http-get',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      params: {
        q: function(feature) {
          // var stmt = "select * from zoning_documents_20170420 where address_std = '" + feature.properties.street_address + "'";

          var stmt = "select * from ais_zoning_documents where doc_id = ANY('{" + feature.properties.zoning_document_ids + "}'::text[])";

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
        }
      }
    }
  },
  // // TODO take zoningBase out and use AIS for base zoning district
  zoningBase: {
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
        }
      }
    }
  },
  zoningOverlay: {
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
                ), \
              total AS \
                ( \
                  SELECT zp.*, st_area(St_intersection(zp.the_geom, parcel.the_geom)) / st_area(parcel.the_geom) AS overlap_area \
                  FROM   zp, parcel \
                ) \
              SELECT cartodb_id, \
                    code_section, \
                    code_section_link, \
                    objectid, \
                    overlap_area, \
                    overlay_name, \
                    overlay_symbol, \
                    pending, \
                    pendingbill, \
                    pendingbillurl, \
                    sunset_date, \
                    type \
              FROM total \
              WHERE overlap_area >= 0.01 \
            ";
          return stmt;
        }
      }
    }
  },
  rco: {
    type: 'esri',
    url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0',
    options: {
      relationship: 'contains',
    },
    // success(data) {
    //   // format phone numbers
    //   console.log('rco success', data);
    //
    //   var s2 = (""+s).replace(/\D/g, '');
    //   var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    //   return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    //
    //   return data;
    // }
  },
  dorCondoList: {
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
          return "select * from condominium where mapref = '" + state.parcels.dor.data[0].properties.MAPREG + "'"
        },
      }
    }
  },
  dorDocuments: {
    type: 'http-get',
    targets: {
      get: function(state) {
        return state.parcels.dor.data;
      },
      getTargetId: function(target) {
        return target.properties.OBJECTID;
      },
    },
    url: '//gis.phila.gov/arcgis/rest/services/DOR/rtt_service/MapServer/0/query',
    options: {
      params: {
        where: function(feature, state) {
          // METHOD 1: via address
          var parcelBaseAddress = helpers.concatDorAddress(feature);
          var geocode = state.geocode.data.properties;

          // REVIEW if the parcel has no address, we don't want to query
          // WHERE ADDRESS = 'null' (doesn't make sense), so use this for now
          if (!parcelBaseAddress || parcelBaseAddress === 'null'){
            var where = "MATCHED_REGMAP = '" + state.parcels.dor.data[0].properties.BASEREG + "'";
          } else {
            // TODO make these all camel case
            var props = state.geocode.data.properties,
                address_low = props.address_low,
                address_floor = Math.floor(address_low / 100, 1) * 100,
                address_remainder = address_low - address_floor,
                addressHigh = props.address_high,
                addressCeil = addressHigh || address_low;

            // form where clause
            var where = "(((ADDRESS_LOW >= " + address_low + " AND ADDRESS_LOW <= " + addressCeil + ")"
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

            // this is hardcoded right now to handle DOR address suffixes that are actually fractions
            if (geocode.address_low_frac === '1/2') {
              where += " AND ADDRESS_LOW_SUFFIX = '2'" //+ geocode.address_low_frac + "'";
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
          }

          return where;
        },
        outFields: "R_NUM, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
        returnDistinctValues: 'true',
        returnGeometry: 'false',
        f: 'json'
      },
      success: function(data) {
        return data.features;
        // return data.rows;
      }
    },
  },
  '311Carto': {
    type: 'http-get-nearby',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      table: 'public_cases_fc',
      dateMinNum: 1,
      dateMinType: 'year',
      dateField: 'requested_datetime',
      params: {},
    }
  },
  crimeIncidents: {
    type: 'http-get-nearby',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      table: 'incidents_part1_part2',
      dateMinNum: 1,
      dateMinType: 'year',
      dateField: 'dispatch_date',
      params: {},
    }
  },
  nearbyZoningAppeals: {
    type: 'http-get-nearby',
    url: 'https://phl.carto.com/api/v2/sql',
    options: {
      table: 'li_appeals',
      dateMinNum: 1,
      dateMinType: 'year',
      dateField: 'decisiondate',
      params: {}
    }
  },
  vacantIndicatorsPoints: {
    type: 'esri-nearby',
    url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Points/FeatureServer/0',
    options: {
      geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
      calculateDistance: true,
      distances: 500,
    },
  },
  // TODO call this opaCondoList or something to explain how it's different
  // from dorCondoList
  condoList: {
    type: 'http-get',
    url: '//api.phila.gov/ais/v1/search/',
    options: {
      params: {
        urlAddition: function (feature) {
          return feature.properties.street_address;
        },
        gatekeeperKey: helpers.GATEKEEPER_KEY,
        include_units: true,
        opa_only: true,
        page: 1,
      },
      success: function(data) {
        return data;
      }
    }
  },
  regmaps: {
    type: 'esri',
    url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/MASTERMAPINDEX/FeatureServer/0',
    // deps: ['dorParcels'],
    deps: ['parcels.dor'],
    options: {
      relationship: 'intersects',
      targetGeometry: function (state, Leaflet) {
        // get combined extent of dor parcels
        // var parcels = state.dorParcels.data;
        var parcels = state.parcels.dor.data;

        // build up sets of x and y values
        var xVals = [],
            yVals = [];

        // loop over parcels
        parcels.forEach(function (parcel) {
          var geom = parcel.geometry,
              parts = geom.coordinates;

          // loop over parts (whether it's simple or multipart)
          parts.forEach(function (coordPairs) {
            coordPairs.forEach(function (coordPair) {
              // if the polygon has a hole, it has another level of coord
              // pairs, presumably one for the outer coords and another for
              // inner. for simplicity, add them all.
              var hasHole = Array.isArray(coordPair[0]);

              if (hasHole) {
                // loop through inner pairs
                coordPair.forEach(function (innerCoordPair) {
                  var x = innerCoordPair[0],
                      y = innerCoordPair[1];

                  xVals.push(x);
                  yVals.push(y)
                });
              // for all other polys
              } else {
                var x = coordPair[0],
                    y = coordPair[1];

                xVals.push(x);
                yVals.push(y)
              }
            });
          });
        });

        // take max/min
        var xMin = Math.min.apply(null, xVals);
        var xMax = Math.max.apply(null, xVals);
        var yMin = Math.min.apply(null, yVals);
        var yMax = Math.max.apply(null, yVals);

        // make sure all coords are defined. no NaNs allowed.
        var coordsAreDefined = [xMin, xMax, yMin, yMax].every(
          function (coord) { return coord; }
        );

        // if they aren't
        if (!coordsAreDefined) {
          //  exit with null to avoid an error calling lat lng bounds
          // constructor
          return null;
        }

        // construct geometry
        var bounds = Leaflet.latLngBounds([
          [yMin, xMin],
          [yMax, xMax]
        ]);

        return bounds;
      }
    },
    success: function(data) {
      return data;
    }
  },
}
