/*
   _____   __  .__
  /  _  \_/  |_|  | _____    ______
 /  /_\  \   __\  | \__  \  /  ___/
/    |    \  | |  |__/ __ \_\___ \
\____|__  /__| |____(____  /____  >
        \/               \/     \/
*/

// turn off console logging in production
// TODO come up with better way of doing this with webpack + env vars
// if (location.hostname !== 'localhost') {
//   console.log = console.info = console.debug = console.error = function () {};
// }

var BASE_CONFIG_URL = 'https://cdn.rawgit.com/ajrothwell/atlas_base_config/d95ed79d/config.js';
var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11';

var ZONING_CODE_MAP = {
  'RSD-1': 'Residential Single Family Detached-1',
  'RSD-2': 'Residential Single Family Detached-2',
  'RSD-3': 'Residential Single Family Detached-3',
  'RSA-1': 'Residential Single Family Attached-1',
  'RSA-2': 'Residential Single Family Attached-2',
  'RSA-3': 'Residential Single Family Attached-3',
  'RSA-4': 'Residential Single Family Attached-4',
  'RSA-5': 'Residential Single Family Attached-5',
  'RTA-1': 'Residential Two-Family Attached-1',
  'RM-1': 'Residential Multi-Family-1',
  'RM-2': 'Residential Multi-Family-2',
  'RM-3': 'Residential Multi-Family-3',
  'RM-4': 'Residential Multi-Family-4',
  'RMX-1': 'Residential Mixed-Use-1',
  'RMX-2': 'Residential Mixed-Use-2',
  'RMX-3': 'Residential (Center City) Mixed-Use-3',
  'CA-1': 'Auto-Oriented Commercial-1',
  'CA-2': 'Auto-Oriented Commercial-2',
  'CMX-1': 'Neighborhood Commercial Mixed-Use-1',
  'CMX-2': 'Neighborhood Commercial Mixed-Use-2',
  'CMX-2.5': 'Neighborhood Commercial Mixed-Use-2.5',
  'CMX-3': 'Community Commercial Mixed-Use',
  'CMX-4': 'Center City Commercial Mixed-Use',
  'CMX-5': 'Center City Core Commercial Mixed-Use',
  'I-1': 'Light Industrial',
  'I-2': 'Medium Industrial',
  'I-3': 'Heavy Industrial',
  'IP': 'Port Industrial',
  'ICMX': 'Industrial Commercial Mixed-Use',
  'IRMX': 'Industrial Residential Mixed-Use',
  'SPENT': 'Commercial Entertainment (Casinos)',
  'SPAIR': 'Airport',
  'SPINS': 'Institutional Development',
  'SPSTA': 'Stadium',
  'SPPOA': 'Recreation',
  'SP-PO-A': 'Recreation',
  'SPPOP': 'Recreation',
};

function cleanDorAttribute(attr) {
  // trim leading and trailing whitespace
  var cleanAttr = attr ? String(attr) : '';
  cleanAttr = cleanAttr.replace(/\s+/g, '');
  // return empty for zeros and null
  if ([null, '0'].indexOf(cleanAttr) > -1) {
    return '';
  }
  return cleanAttr;
}

// TODO put this in base config transforms
function concatDorAddress(parcel, includeUnit) {
  includeUnit = !!includeUnit;
  var STREET_FIELDS = ['STDIR', 'STNAM', 'STDES', 'STDESSUF'];
  var props = parcel.properties;

  // handle house num
  var addressLow = cleanDorAttribute(props.HOUSE);
  var addressHigh = cleanDorAttribute(props.STEX);
  // maybe should be props.SUF below (it said props.SUFFIX)
  var addressSuffix = cleanDorAttribute(props.SUF);
  var address = addressLow;
  address = address + (addressHigh ? '-' + addressHigh : '');
  address = address + (addressSuffix || '');

  // handle unit
  var unit = cleanDorAttribute(props.UNIT);
  if (unit) unit = '# ' + unit;

  // clean up attributes
  var comps = STREET_FIELDS.map(function(streetField) {
    return props[streetField];
  });
  comps = comps.map(cleanDorAttribute);

  // add address to front
  comps = [address].concat(comps);

  // add unit to end
  if (includeUnit) comps = comps.concat([unit]);

  // remove nulls and concat
  address = comps.filter(Boolean).join(' ');

  // console.log('concatDorAddress address result:', address);
  if (address === '') {
    address = 'Parcel has no address';
  }
  return address;
}

function getVacancyText(state) {
  var land = state.sources.vacantLand.data
  var building = state.sources.vacantBuilding.data
  if (land.length === 0 && building.length === 0) {
    return 'Not Likely Vacant'
  } else if (land.length > 0) {
    return 'Likely Vacant Land'
  } else if (building.length > 0) {
    return 'Likely Vacant Building'
  }
}

// configure accounting.js
accounting.settings.currency.precision = 0;

mapboard.default({
  baseConfig: BASE_CONFIG_URL,
  rootStyle: {
    position: 'absolute',
    bottom: 0,
    top: '118px',
    left: 0,
    right: 0,
  },
  gatekeeperKey: GATEKEEPER_KEY,
  router: {
    enabled: true
  },
  geolocation: {
    enabled: false
  },
  panels: [
    'topics',
    'map'
  ],
  components: [
    {
      type: 'topic-set',
      options: {
        defaultTopic: 'property'
      }
    },
  ],
  map: {
    defaultBasemap: 'pwd',
    defaultIdentifyFeature: 'address-marker',
    imagery: {
      enabled: true
    },
    historicBasemaps: {
      enabled: true
    },
  },
  addressInput: {
    width: 415,
    position: 'right',
    autocompleteEnabled: true,
    autocompleteMax: 15,
    placeholder: 'Search the map',
  },
  parcels: {
    pwd: {
      multipleAllowed: false,
      geocodeFailAttemptParcel: null,
      clearStateOnError: false,
      wipeOutOtherParcelsOnReverseGeocodeOnly: true,
      geocodeField: 'PARCELID',
      parcelIdInGeocoder: 'pwd_parcel_id',
      getByLatLngIfIdFails: false
    },
    dor: {
      multipleAllowed: true,
      geocodeFailAttemptParcel: 'pwd',
      clearStateOnError: true,
      wipeOutOtherParcelsOnReverseGeocodeOnly: false,
      geocodeField: 'MAPREG',
      parcelIdInGeocoder: 'dor_parcel_id',
      getByLatLngIfIdFails: true
    }
  },
  imageOverlayGroups: {
    regmaps: {
      items: function(state) {
        // console.log('main.js imageOverlayGroups', state)
        return state.sources.regmaps.data;
      }
    }
  },
  legendControls: {
    water: {
      options: {
        topics: ['water'],
        showWithBaseMapOnly: false
      },
      // TODO give these an id instead of using the label as a key
      data: {
        'Roof': {
          'background-color': '#FEFF7F',
        },
        'Other Impervious Surface': {
          'background-color': '#F2DCFF',
        }
      }
    },
    deeds: {
      options: {
        topics: ['deeds', 'zoning'],
        showWithBaseMapOnly: true
      },
      data: {
        // TODO give these an id instead of using the label as a key
        'Easements': {
          'border-color': 'rgb(255, 0, 197)',
          'border-style': 'solid',
          'border-weight': '1px',
          'width': '12px',
          'height': '12px',
          'font-size': '10px',
        },
        'Trans Parcels': {
          'border-color': 'rgb(0, 168, 132)',
          'border-style': 'solid',
          'border-weight': '1px',
          'width': '12px',
          'height': '12px',
          'font-size': '10px',
        },
        'Rights of Way': {
          'border-color': 'rgb(249, 147, 0)',
          'border-style': 'solid',
          'border-weight': '1px',
          'width': '12px',
          'height': '12px',
          'font-size': '10px',
        }
      }
    }
  },
  cyclomedia: {
    enabled: false,
    measurementAllowed: false,
    popoutAble: true,
  },
  pictometry: {
    enabled: false,
  },
  greeting: {
    initialMessage: '\
      <h2>Atlas is your front door to the City of Philadelphia.</h2>\
      <p>Here are some things you can do with Atlas:</p>\
      <div class="callout">\
        <ul>\
          <li>Get the history of permits, licenses, and inspections at any address</li>\
          <li>Research real estate information including property values, zoning, and document archives</li>\
          <li>Get easy access to a variety of hard-to-find City resources</li>\
          <li>View recent activity around your address, such as crimes, 311 service requests, and more</li>\
          <li>Explore historical imagery and maps</li>\
        </ul>\
      </div>\
      <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>\
    ',
  },


  // reusable transforms for topic data. see `topics` section for usage.
  transforms: {
    currency: {
      // a list of global objects this transform depends on
      globals: ['accounting'],
      // this is the function that gets called to perform the transform
      transform: function (value, globals) {
        // var accounting = globals.accounting;
        // console.log('gonna format some money!!', accounting);
        return accounting.formatMoney(value);
      }
    },
    date: {
      globals: ['moment'],
      transform: function (value, globals) {
        // var moment = globals.moment;
        return moment(value).format('MM/DD/YYYY');
      },
    },
    phoneNumber: {
      transform: function (value) {
        var s2 = (""+value).replace(/\D/g, '');
        var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
        return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
      }
    },
    rcoPrimaryContact: {
      transform: function (value) {
        var PHONE_NUMBER_PAT = /\(?(\d{3})\)?( |-)?(\d{3})(-| )?(\d{4})/g;
        var m = PHONE_NUMBER_PAT.exec(value);

        // check for non-match
        if (!m) {
          return value;
        }

        // standardize phone number
        var std = ['(', m[1], ') ', m[3], '-', m[5]].join('');
        var orig = m[0]
        var valueStd = value.replace(orig, std);

        return valueStd;
      }
    },
    booleanToYesNo: {
      transform: function(value) {
        return value ? 'Yes' : 'No';
      }
    },
    integer: {
      transform: function (value) {
        return !isNaN(value) && parseInt(value);
      },
    },
    prettyNumber: {
      transform: function (value) {
        return !isNaN(value) && value.toLocaleString();
      },
    },
    feet: {
      transform: function (value) {
        return value && value + ' ft';
      },
    },
    squareFeet: {
      transform: function (value) {
        return value && value + ' sq ft';
      },
    },
    nowrap: {
      transform: function (value) {
        return '<span style="white-space: nowrap;">' + value + '</span>';
      },
    },
    bold: {
      transform: function (value) {
        return '<strong>' + value + '</strong>';
      },
    },
  },




  dataSources: {
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
    liPermits: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature){ return "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
        }
      }
    },
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
            var stmt = "select * from ais_zoning_documents where doc_id = ANY('{" + feature.properties.zoning_document_ids + "}'::text[])";
            return stmt;
          }
        }
      }
    },
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
                      St_area(St_intersection(zp.the_geom, parcel.the_geom)) / St_area(parcel.the_geom) AS overlap_area \
                      FROM zp, parcel \
                    ), \
                  total AS \
                    ( \
                      SELECT long_code, sum(overlap_area) as sum_overlap_area \
                      FROM combine \
                      GROUP BY long_code \
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
            var parcelBaseAddress = concatDorAddress(feature);
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
              if (geocode.address_low_frac = '1/2') {
                where += " AND ADDRESS_LOW_SUFFIX = '2'" //+ geocode.address_low_frac + "'";
              }

              if (geocode.street_postdir != '') {
                where += " AND STREET_POSTDIR = '" + geocode.street_postdir + "'";
              }

              // check for unit num
              var unitNum = cleanDorAttribute(feature.properties.UNIT),
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
      url: '//api.phila.gov/ais_dev/v1/search/',
      options: {
        params: {
          urlAddition: function (feature) {
            return feature.properties.street_address;
          },
          gatekeeperKey: GATEKEEPER_KEY,
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
  },




  topics: [
    {
      key: 'property',
      icon: 'home',
      label: 'Property Assessments',
      dataSources: ['opa'],
      components: [
        {
          type: 'callout',
          slots: {
            text: '\
              Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.\
            '
          }
        },
        {
          type: 'vertical-table',
          slots: {
            fields: [
              {
                label: 'OPA Account #',
                value: function(state) {
                  console.log('state:', state);
                  return state.geocode.data.properties.opa_account_num;
                }
              },
              {
                label: 'OPA Address',
                value: function(state) {
                  return state.geocode.data.properties.opa_address;
                }
              },
              {
                label: 'Owners',
                value: function(state) {
                  var owners = state.geocode.data.properties.opa_owners;
                  var ownersJoined = owners.join(', ');
                  return ownersJoined;
                }
              },
              {
                label: 'Assessed Value',
                value: function(state) {
                  var data = state.sources.opa.data;
                  var result;
                  if (data) {
                    result = data.market_value;
                  } else {
                    result = 'no data';
                  }
                  return result;
                },
                transforms: [
                  'currency'
                ]
              },
              {
                label: 'Sale Date',
                value: function(state) {
                  var data = state.sources.opa.data;
                  var result;
                  if (data) {
                    result = data.sale_date;
                  } else {
                    result = 'no data';
                  }
                  return result;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Sale Price',
                value: function(state) {
                  var data = state.sources.opa.data;
                  var result;
                  if (data) {
                    result = data.sale_price;
                  } else {
                    result = 'no data';
                  }
                  return result;
                },
                transforms: [
                  'currency'
                ]
              },
            ],
          },
          options: {
            id: 'opaData',
            externalLink: {
              action: function(count) {
                return 'See more';
              },
              name: 'Property Search',
              href: function(state) {
                var id = state.geocode.data.properties.opa_account_num;
                return 'http://property.phila.gov/?p=' + id;
              }
            }
          }
        }
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'pwd',
      errorMessage: function (state) {
        var data = state.sources.condoList.data;
            // features = data.features;

        if (data) {
          var numCondos = data.total_size;

          if (numCondos > 0) {
            var shouldPluralize = numCondos > 1,
                isOrAre = shouldPluralize ? 'are' : 'is',
                unitOrUnits = shouldPluralize ? 'units' : 'unit',
                message = [
                  '<h3>',
                  'There ',
                  isOrAre,
                  // ' <strong>',
                  ' ',
                  numCondos,
                  ' condominium ',
                  unitOrUnits,
                  // '</strong> at this address.</h3>',
                  ' at this address.</h3>',
                  // ' at this address. ',
                  '<p>You can use the Condominiums tab below to see information for an individual unit.</p>'
                  // 'Please select a unit from the Condominiums tab below.'
                ].join('');

            return message;
          }
        } else {
          return 'There is no property assessment record for this address.';
        }
      },
    },
    {
      key: 'condos',
      icon: 'building',
      label: 'Condominiums',
      dataSources: ['condoList'],
      onlyShowTopicIfDataExists: {
        'condoList': {
          pathToDataArray: ['features'],
          minDataLength: 2,
        }
      },
      components: [
        {
          type: 'callout',
          slots: {
            text: 'Condominium units at your search address, as recorded for property assessment purposes. Click one of the addresses below to see information for that unit.  Use the back button to return to this list. Source: Office of Property Assessment'
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'condominiums',
            id: 'condoList',
            useApiCount: true,
            defaultIncrement: 25,
            fields: [
              {
                label: 'Address',
                value: function (state, item) {
                  var address = item.properties.street_address;
                  return '<a href="#/' + address + '/property">' + address + '</a>';
                },
              },
              {
                label: 'OPA Account #',
                value: function (state, item) {
                  return item.properties.opa_account_num;
                },
              },
            ], // end fields
          },
          slots: {
            title: 'Condominiums',
            highestPageRetrieved: function(state) { return state.sources['condoList'].data.page },
            pageCount: function(state) { return state.sources['condoList'].data.page_count },
            totalSize: function(state) { return state.sources['condoList'].data.total_size },
            items: function(state) {
              var data = state.sources['condoList'].data.features;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          } // end slots
        },
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'pwd'
    },
    {
      key: 'deeds',
      icon: 'book',
      label: 'Deeds',
      // TODO uncommenting this causes the no-content view to show up.
      // dataSources: ['dorDocuments'],
      components: [
        {
          type: 'callout',
          slots: {
            text: '\
              Deed information and document transactions for this address.\
              The map faithfully reflects property boundaries as described in \
              recorded deeds including multiple types of easements.\
              The property boundaries displayed on the map are for reference \
              only and should not be used in place of the recorded deeds or \
              land surveys. Source: Department of Records\
            ',
          }
        },
        {
          type: 'collection-summary',
          options: {
            descriptor: 'parcel',
            // this will include zero quantities
            // includeZeroes: true,
            getValue: function(item) {
              return item.properties.STATUS;
            },
            context: {
              singular: function(list){ return 'There is ' + list + ' at this address.'},
              plural: function(list){ return 'There are ' + list + ' at this address.'}
            },
            types: [
              {
                value: 1,
                label: 'active parcel'
              },
              {
                value: 2,
                label: 'inactive parcel'
              },
              {
                value: 3,
                label: 'remainder parcel'
              }
            ]
          },
          slots: {
            items: function(state) {
              // return state.dorParcels.data;
              return state.parcels.dor.data;
            }
          }
        },
        {
          type: 'tab-group',
          options: {
            getKey: function(item) {
              return item.properties.OBJECTID;
            },
            getTitle: function(item) {
              return item.properties.MAPREG;
            },
            getAddress: function(item) {
              var address = concatDorAddress(item);
              return address;
            },
            // components for the content pane. this essentially a topic body.
            components: [
              {
                type: 'vertical-table',
                options: {
                  nullValue: 'None',
                  // id: 'dorData',
                },
                slots: {
                  title: 'Parcel Details',
                  fields: [
                    {
                      label: 'Map Registry #',
                      value: function(state, item) {
                        return item.properties.MAPREG;
                      },
                    },
                    {
                      label: 'Parcel Address',
                      value: function(state, item) {
                        return concatDorAddress(item);
                      },
                    },
                    {
                      label: 'Status',
                      value: function(state, item) {
                        var status = item.properties.STATUS;
                        var desc;
                        switch(status) {
                          case 1:
                            desc = 'Active';
                            break;
                          case 2:
                            desc = 'Inactive';
                            break;
                          case 3:
                            desc = 'Remainder';
                            break;
                          default:
                            break;
                        }
                        return desc;
                      },
                    },
                    {
                      label: 'Origination Date',
                      value: function(state, item) {
                        return item.properties.ORIG_DATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Inactive Date',
                      value: function(state, item) {
                        return item.properties.INACTDATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Has Air Rights',
                      value: function(state, item) {
                        var suffix = item.properties.SUFFIX;
                        return suffix === 'A' ? 'Yes' : 'No';
                      },
                    },
                    {
                      label: 'Is Condo',
                      value: function(state, item) {
                        if (!item.properties.CONDOFLAG) {
                          return 'No';
                        } else {
                          return 'Yes';
                        }
                      },
                    },
                    {
                      label: 'Perimeter',
                      value: function (state, item) {
                        return (item.properties || {})['TURF_PERIMETER'];
                      },
                      transforms: [
                        'integer',
                        'prettyNumber',
                        'feet',
                      ]
                    },
                    {
                      label: 'Area',
                      value: function(state, item) {
                        return (item.properties || {})['TURF_AREA'];
                      },
                      transforms: [
                        'integer',
                        'prettyNumber',
                        'squareFeet',
                      ]
                    },
                  ]
                }  // end slots
              },  // end vertical table
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'deeds',
                  id: 'dorCondoList',
                  defaultIncrement: 10,
                  showAllRowsOnFirstClick: true,
                  showOnlyIfData: true,
                  fields: [
                    {
                      label: 'Condo Parcel',
                      value: function(state, item) {
                        return item.recmap + '-' + item.condoparcel;
                      },
                    },
                    {
                      label: 'Condo Name',
                      value: function(state, item) {
                        // return item.attributes.RECORDING_DATE;
                        return item.condo_name;
                      },
                    },
                    {
                      label: 'Unit #',
                      value: function(state, item) {
                        return 'Unit #' + item.condounit;
                      },
                    },
                  ], // end fields
                  sort: {
                    // this should return the val to sort on
                    getValue: function(item) {
                      // return item.attributes.RECORDING_DATE;
                      return item.condounit;
                    },
                    // asc or desc
                    order: 'asc'
                  }
                },
                slots: {
                  title: 'Deeded Condominiums',
                  items: function (state, item) {
                    var id = item.properties.OBJECTID;

                    if (state.sources.dorCondoList.targets[id]) {
                      if (state.sources.dorCondoList.targets[id].data) {
                        return state.sources.dorCondoList.targets[id].data.rows;
                      }
                    } else {
                      return [];
                    }
                  },
                } // end slots
              }, // end condos table

              {
                type: 'callout',
                slots: {
                  text: 'The list of documents \
                    shown below may not be a complete history of title to this \
                    parcel. The list is based solely on documents recorded from\
                    1974 forward where those documents contained street addresses\
                    in the original recorded document.\
                  '
                },
              },

              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'deeds',
                  id: 'dorDocuments',
                  defaultIncrement: 25,
                  fields: [
                    {
                      label: 'ID',
                      value: function (state, item) {
                        return item.attributes.R_NUM;
                      },
                    },
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.attributes.DISPLAY_DATE;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Type',
                      value: function(state, item) {
                        return item.attributes.DOCUMENT_TYPE;
                      },
                    },
                    {
                      label: 'Grantor',
                      value: function(state, item) {
                        return item.attributes.GRANTORS;
                      },
                    },
                    {
                      label: 'Grantee',
                      value: function(state, item) {
                        return item.attributes.GRANTEES;
                      },
                    },
                  ], // end fields
                  sort: {
                    // this should return the val to sort on
                    getValue: function(item) {
                      return item.attributes.DISPLAY_DATE;
                    },
                    // asc or desc
                    order: 'desc'
                  }
                },
                slots: {
                  title: 'Documents',
                  // defaultIncrement: 25,
                  items: function(state, item) {
                    var id = item.properties.OBJECTID;
                    if (state.sources.dorDocuments.targets[id]) {
                      return state.sources.dorDocuments.targets[id].data;
                    } else {
                      return [];
                    }
                  },
                } // end slots
              }, // end docs table
            ] // end parcel tab content comps
          }, // end parcel tab options
          slots: {
            items: function (state) {
              return state.parcels.dor.data;
            }
          },
        }, // end dor parcel tab group comp
        {
          type: 'callout',
          slots: {
            text: '\
              Use the buttons below to view images of hard-copy deed maps, some\
              of which have handwritten information that may be useful for\
              historical deed research.\
            ',
          },
        },
        {
          type: 'overlay-toggle-group',
          options: {
            getKey: function(item) {
              return item.properties.RECMAP;
            },
          },
          slots: {
            title: 'Registry Maps',
            items: function(state) {
              return state.sources.regmaps.data;
            }
          }
        },
      ], // end deeds comps
      basemap: 'dor',
      identifyFeature: 'dor-parcel',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'dor',
      imageOverlayGroup: 'regmaps',
    },
    {
      key: 'li',
      icon: 'wrench',
      label: 'Licenses & Inspections',
      dataSources: [
        'liPermits',
        'liInspections',
        'liViolations',
        'liBusinessLicenses',
        'zoningDocs'
      ],
      components: [
        {
          type: 'callout',
          slots: {
            text: '\
              Licenses, inspections, permits, property maintenance \
              violations, and zoning permit documents at your search address. \
              Source: Department of Licenses & Inspections\
            '
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liPermits',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.permitissuedate
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='http://li.phila.gov/#details?entity=permits&eid="+item.permitnumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.permitnumber+" <i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.permitdescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.permitissuedate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older permits at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return 'http://li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Permits',
            items: function(state) {
              var data = state.sources['liPermits'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningDocs',
            // limit: 100,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.scan_date
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Permit Number',
                value: function(state, item){
                  return item.permit_number
                }
              },
              {
                label: '# Pages',
                value: function(state, item){
                  return item.num_pages
                }
              },
              {
                label: 'ID',
                value: function (state, item) {
                  console.log('zoning doc', item);

                  var appId = item.app_id;

                  if (appId.length < 3) {
                    appId = '0' + appId;
                  }

                  return '<a target="_blank" class="external" href="//s3.amazonaws.com/lni-zoning-pdfs/'
                          + item.doc_id
                          + '.pdf">'
                          + item.doc_id
                          + '</a>'
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.scandate;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title: 'Zoning Permit Documents',
            subtitle: 'formerly "Zoning Archive"',
            items: function(state) {
              if (state.sources['zoningDocs'].data) {
                if (state.sources['zoningDocs'].data.rows) {
                  var data = state.sources['zoningDocs'].data.rows;
                  var rows = data.map(function(row){
                    var itemRow = row;
                    return itemRow;
                  });
                  return rows;
                }
              }
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liInspections',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.inspectioncompleted
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='http://li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.inspectiondescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.inspectionstatus
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.inspectioncompleted;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older inspections at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return 'http://li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Inspections',
            items: function(state) {
              var data = state.sources['liInspections'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liViolations',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.caseaddeddate
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='http://li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
                  // return item.casenumber
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.violationdescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.caseaddeddate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older violations at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return 'http://li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Violations',
            items: function(state) {
              var data = state.sources['liViolations'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liBusinessLicenses',
            limit: 5,
            fields: [
              {
                label: 'Issue Date',
                value: function(state, item){
                  return item.initialissuedate
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'License Number',
                value: function(state, item){
                  return "<a target='_blank' href='http://li.phila.gov/#details?entity=licenses&eid="+item.licensenum+"&key="+item.street_address+"&address="+item.street_address+"'>"+item.licensenum+" <i class='fa fa-external-link'></i></a>"
                  return item.licensenum
                }
              },
              {
                label: 'Name',
                value: function(state, item){
                  return item.business_name
                }
              },
              {
                label: 'Type',
                value: function(state, item){
                  return item.licensetype
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.licensestatus
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.caseaddeddate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older business licenses at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return 'http://li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Business Licenses',
            items: function(state) {
              var data = state.sources['liBusinessLicenses'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          },
        },
      ],
      basemap: 'pwd',
      dynamicMapLayers: [
        //'zoning'
      ],
      identifyFeature: 'address-marker',
      parcels: 'pwd'
    },
    {
      key: 'zoning',
      icon: 'university',
      label: 'Zoning',
      dataSources: [
        'zoningOverlay',
        'zoningBase',
      ],
      components: [
        {
          type: 'callout',
          slots: {
            text: 'Base district zoning maps, associated zoning overlays, and Registered Community Organizations applicable to your search address. Source: Department of Planning and Development'
          }
        },
        {
          type: 'collection-summary',
          options: {
            descriptor: 'parcel',
            // this will include zero quantities
            // includeZeroes: true,
            getValue: function(item) {
              return item.properties.STATUS;
            },
            context: {
              singular: function(list){ return 'There is ' + list + ' at this address.'},
              plural: function(list){ return 'There are ' + list + ' at this address.'}
            },
            types: [
              {
                value: 1,
                label: 'active parcel'
              },
              {
                value: 2,
                label: 'inactive parcel'
              },
              {
                value: 3,
                label: 'remainder parcel'
              }
            ]
          },
          slots: {
            items: function(state) {
              return state.parcels.dor.data;
            }
          }
        },
        {
          type: 'tab-group',
          options: {
            getKey: function(item) {
              return item.properties.OBJECTID;
            },
            getTitle: function(item) {
              return item.properties.MAPREG;
            },
            getAddress: function(item) {
              var address = concatDorAddress(item);
              return address;
            },
            // components for the content pane. this essentially a topic body.
            components: [
              {
                type: 'badge-custom',
                options: {
                  titleBackground: '#58c04d',
                  components: [
                    {
                      type: 'horizontal-table',
                      options: {
                        topicKey: 'zoning',
                        shouldShowFilters: false,
                        shouldShowHeaders: false,
                        id: 'baseZoning',
                        // defaultIncrement: 10,
                        // showAllRowsOnFirstClick: true,
                        // showOnlyIfData: true,
                        fields: [
                          {
                            label: 'Code',
                            value: function (state, item) {
                              return item;
                            },
                            transforms: [
                              'nowrap',
                              'bold'
                            ]
                          },
                          {
                            label: 'Description',
                            value: function (state, item) {
                              return ZONING_CODE_MAP[item];
                            },
                          },
                        ], // end fields
                      },
                      slots: {
                        // title: 'Base Zoning',
                        items(state, item) {
                          const id = item.properties.OBJECTID;
                          const target = state.sources.zoningBase.targets[id] || {};
                          const { data={} } = target;
                          const { rows=[] } = data;

                          // get unique zoning codes
                          const longCodes = rows.map(row => row.long_code);
                          const longCodesUniqueSet = new Set(longCodes);
                          const longCodesUnique = Array.from(longCodesUniqueSet);

                          return longCodesUnique;
                        },
                      }, // end slots
                    }, // end table
                  ],
                },
                slots: {
                  title: 'Base District',
                },
              }, // end of badge-custom
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'zoning',
                  id: 'zoningOverlay',
                  // limit: 100,
                  fields: [
                    {
                      label: 'Name',
                      value: function(state, item){
                        return item.overlay_name
                      }
                    },
                    {
                      label: 'Code Section',
                      value: function(state, item){
                        return "<a target='_blank' href='"+item.code_section_link+"'>"+item.code_section+" <i class='fa fa-external-link'></i></a>"
                      }
                    },
                  ],
                },
                slots: {
                  title: 'Overlays',
                  items: function(state, item) {
                    var id = item.properties.OBJECTID,
                        target = state.sources.zoningOverlay.targets[id] || {},
                        data = target.data || {};
                    return data.rows || [];
                  },
                },
              },
            ], // end of tab-group components
          },
          slots: {
            items: function (state) {
              return state.parcels.dor.data;
            }
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningAppeals',
            // limit: 100,
            fields: [
              {
                label: 'Processed Date',
                value: function(state, item) {
                  return item.processeddate;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='http://li.phila.gov/#details?entity=appeals&eid="+item.appeal_key+"&key="+item.addresskey+"&address="+item.address+"'>"+item.appealno+"<i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.appealgrounds;
                }
              },
              {
                label: 'Scheduled Date',
                value: function(state, item) {
                  return item.date_scheduled;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.decision
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.date_scheduled;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title : 'Appeals',
            items: function(state) {
              if (state.sources['zoningAppeals'].data) {
                if (state.sources['zoningAppeals'].data.rows) {
                  var data = state.sources['zoningAppeals'].data.rows;
                  var rows = data.map(function(row){
                    var itemRow = row;
                    return itemRow;
                  });
                  return rows;
                }
              }
            },
          },
        },
        {
          type: 'callout',
          slots: {
            text: 'Looking for zoning documents? They are now located in the Licenses & Inspections tab under "Zoning Permit Documents".',
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'rco',
            // limit: 100,
            fields: [
              {
                label: 'RCO',
                value: function(state, item) {
                  return '<b>' + item.properties.ORGANIZATION_NAME + '</b><br>'
                  + item.properties.ORGANIZATION_ADDRESS
                },
              },
              {
                label: 'Meeting Address',
                value: function(state, item) {
                  return item.properties.MEETING_LOCATION_ADDRESS
                }
              },
              {
                label: 'Primary Contact',
                value: function(state, item) {
                  return item.properties.PRIMARY_NAME + '<br>'
                  + item.properties.PRIMARY_PHONE + '<br>'
                  + item.properties.PRIMARY_EMAIL
                },
                transforms: [
                  'rcoPrimaryContact'
                ]
              },
              {
                label: 'Preferred Method',
                value: function(state, item){
                  return item.properties.PREFFERED_CONTACT_METHOD
                }
              },
            ],
            externalLink: {
              forceShow: true,
              action: function() {
                return 'See a list of all RCOs in the city [PDF]';
              },
              name: '',
              href: function(state) {
                return '//www.phila.gov/CityPlanning/projectreviews/RCO%20Related/List_of_RCOs.pdf';
              }
            }
          },
          slots: {
            title: 'Registered Community Organizations',
            items: function(state) {
              if (state.sources['rco'].data) {
                var data = state.sources['rco'].data;
                var rows = data.map(function(row){
                  var itemRow = row;
                  return itemRow;
                });
                return rows;
              }
            },
          },
        },
      ],
      basemap: 'dor',
      dynamicMapLayers: [
        'zoning'
      ],
      identifyFeature: 'dor-parcel',
      parcels: 'dor'
    },
    {
      key: 'nearby',
      icon: 'map-marker',
      label: 'Nearby',
      dataSources: ['311Carto', 'crimeIncidents', 'nearbyZoningAppeals'],
      // dataSources: ['311Carto', 'crimeIncidents', 'nearbyZoningAppeals', 'vacantIndicatorsPoints'],
      // dataSources: ['vacantLand', 'vacantBuilding', '311Carto', 'crimeIncidents', 'nearbyZoningAppeals'],
      basemap: 'pwd',
      // featureLayers: [
      //   'vacantLand',
      //   'vacantBuilding'
      // ],
      identifyFeature: 'address-marker',
      parcels: 'pwd',
      // TODO implement this
      // computed: {
      //   label(state) {
      //     var land = state.sources.vacantLand.data
      //     var building = state.sources.vacantBuilding.data
      //     if (land.length === 0 && building.length === 0) {
      //       return 'Not Likely Vacant';
      //     } else if (land.length > 0) {
      //       return 'Likely Vacant Land';
      //     } else if (building.length > 0) {
      //       return 'Likely Vacant Building';
      //     }
      //   }
      // },
      components: [
        {
          type: 'callout',
          slots: {
            text: '\
              See recent activity near your search address including 311 \
              service requests, crimes, zoning appeals, and more. Hover over a\
              record below to highlight it on the map.\
            '
          }
        },
        // {
        //   type: 'badge',
        //   options: {
        //     titleBackground: function(state) {
        //       var text = getVacancyText(state);
        //       if (text.includes('Land')) {
        //         return 'orange';
        //       } else if (text.includes('Building')) {
        //         return 'purple';
        //       } else {
        //         return '#58c04d';
        //       }
        //     }
        //   },
        //   slots: {
        //     title: 'Vacancy',
        //     value: function(state) {
        //       return getVacancyText(state);
        //     },
        //     // description: function(state) {
        //     //   var code = state.geocode.data.properties.zoning;
        //     //   return ZONING_CODE_MAP[code];
        //     // },
        //   }
        // },
        {
          type: 'horizontal-table-group',
          options: {
            filters: [
              {
                type: 'data',
                getValue: function(item) {
                  return item;
                },
                label: 'What nearby activity would you like to see?',
                values: [
                  {
                    label: '311 Requests',
                    value: '311',
                  },
                  {
                    label: 'Crime Incidents',
                    value: 'crimeIncidents',
                  },
                  {
                    label: 'Zoning Appeals',
                    value: 'nearbyZoningAppeals',
                  },
                  {
                    label: 'Vacant Properties',
                    value: 'vacantIndicatorsPoints',
                  }
                ]
              },
            ],
            // components for the content pane.
            tables: [
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'nearby',
                  id: '311',
                  sort: {
                    select: true,
                    sortFields: [
                      'distance',
                      'date',
                    ],
                    getValue: function(item, sortField) {
                      var val;
                      if (sortField === 'date' || !sortField) {
                        val = item.requested_datetime;
                      } else if (sortField === 'distance') {
                        val = item.distance;
                      }
                      return val;
                    },
                    order: function(sortField) {
                      var val;
                      if (sortField === 'date') {
                        val = 'desc';
                      } else {
                        val = 'asc';
                      }
                      return val;
                    }
                  },
                  filters: [
                    {
                      type: 'time',
                      getValue: function(item) {
                        return item.requested_datetime;
                      },
                      label: 'From the last',
                      values: [
                        {
                          label: '30 days',
                          value: '30',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: '90 days',
                          value: '90',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: 'year',
                          value: '1',
                          unit: 'years',
                          direction: 'subtract',
                        }
                      ]
                    }
                  ],
                  filterByText: {
                    label: 'Filter by text',
                    fields: [
                      'service_name',
                      'address'
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#ff3f3f',
                    	color: '#ff0000',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#ff0000',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.requested_datetime;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Address',
                      value: function(state, item) {
                        return item.address;
                      }
                    },
                    {
                      label: 'Subject',
                      value: function(state, item) {
                        if (item.media_url) {
                          return '<a target="_blank" href='+item.media_url+'>'+item.service_name+'</a>';
                        } else {
                          return item.service_name;
                        }
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Nearby Service Requests',
                  data: '311',
                  items: function(state) {
                    var data = state.sources['311Carto'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                }
              },
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'nearby',
                  id: 'crimeIncidents',
                  sort: {
                    select: true,
                    sortFields: [
                      'distance',
                      'date',
                    ],
                    getValue: function(item, sortField) {
                      var val;
                      if (sortField === 'date' || !sortField) {
                        val = item.dispatch_date;
                      } else if (sortField === 'distance') {
                        val = item.distance;
                      }
                      return val;
                    },
                    order: function(sortField) {
                      var val;
                      if (sortField === 'date') {
                        val = 'desc';
                      } else {
                        val = 'asc';
                      }
                      return val;
                    },
                  },
                  filters: [
                    {
                      type: 'time',
                      getValue: function(item) {
                        return item.dispatch_date;
                      },
                      label: 'From the last',
                      values: [
                        {
                          label: '30 days',
                          value: '30',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: '90 days',
                          value: '90',
                          unit: 'days',
                          direction: 'subtract',
                        },
                      ]
                    }
                  ],
                  filterByText: {
                    label: 'Filter by',
                    fields: [
                      'text_general_code',
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#6674df',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.dispatch_date;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Location',
                      value: function(state, item) {
                        return item.location_block;
                      }
                    },
                    {
                      label: 'Description',
                      value: function(state, item) {
                        return item.text_general_code;
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Crime Incidents',
                  data: 'crimeIncidents',
                  items: function(state) {
                    var data = state.sources['crimeIncidents'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'nearby',
                  id: 'nearbyZoningAppeals',
                  sort: {
                    select: true,
                    sortFields: [
                      'distance',
                      'date',
                    ],
                    getValue: function(item, sortField) {
                      var val;
                      if (sortField === 'date' || !sortField) {
                        val = item.decisiondate;
                      } else if (sortField === 'distance') {
                        val = item.distance;
                      }
                      return val;
                    },
                    order: function(sortField) {
                      var val;
                      if (sortField === 'date') {
                        val = 'desc';
                      } else {
                        val = 'asc';
                      }
                      return val;
                    },
                  },
                  filterByText: {
                    label: 'Filter by',
                    fields: [
                      'appealgrounds'
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#009900',
                    	color: '#009900',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#009900',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.decisiondate;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Location',
                      value: function(state, item) {
                        return item.address;
                      }
                    },
                    {
                      label: 'Description',
                      value: function(state, item) {
                        return item.appealgrounds;
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Zoning Appeals',
                  data: 'nearbyZoningAppeals',
                  items: function(state) {
                    var data = state.sources['nearbyZoningAppeals'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'nearby',
                  id: 'vacantIndicatorsPoints',
                  sort: {
                    select: true,
                    sortFields: [
                      'type',
                      'distance'
                    ],
                    getValue: function(item, sortField) {
                      var val;
                      if (sortField === 'type' || !sortField) {
                        val = item.properties.VACANT_FLAG;
                      } else if (sortField === 'distance') {
                        val = item._distance;
                      }
                      return val;
                    }
                  },
                  filterByText: {
                    label: 'Filter by',
                    fields: [
                      'ADDRESS',
                      'VACANT_FLAG'
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#9400c6',
                    	color: '#9400c6',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#009900',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Address',
                      value: function(state, item) {
                        return item.properties.ADDRESS;
                      }
                    },
                    {
                      label: 'Property Type',
                      value: function(state, item) {
                        return item.properties.VACANT_FLAG;
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return item._distance + ' ft';
                      }
                    },
                  ],
                  externalLink: {
                    forceShow: true,
                    action: function(count) {
                      return 'See more at Vacancy Property Viewer';
                    },
                    name: 'Vacancy Property Viewer',
                    href: function(state) {
                      // var address = state.geocode.data.properties.street_address;
                      // var addressEncoded = encodeURIComponent(address);
                      return '//phl.maps.arcgis.com/apps/webappviewer/index.html?id=64ac160773d04952bc17ad895cc00680';
                    }
                  }
                },
                slots: {
                  title: 'Likely Vacant Properties',
                  data: 'vacantIndicatorsPoints',
                  items: function(state) {
                    var data = state.sources['vacantIndicatorsPoints'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
            ], // end comps
          }, // end options
          slots: {
            // REVIEW should this go in options? maybe not, since it should be
            // reactive.
            items: function(state) {
              // return state.pwdParcel;
              return state.parcel.pwd
            }
          },
        }
      ]
    },
  ], // end topics
});
