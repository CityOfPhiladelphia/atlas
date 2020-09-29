import bboxPolygon from '@turf/bbox-polygon';

export default {
  id: 'regmaps',
  type: 'esri',
  url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/MASTERMAPINDEX/FeatureServer/0',
  // deps: ['dorParcels'],
  deps: [ 'parcels.dor' ],
  options: {
    relationship: 'intersects',
    targetGeometry: function (state) {
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
                yVals.push(y);
              });
            // for all other polys
            } else {
              var x = coordPair[0],
                y = coordPair[1];

              xVals.push(x);
              yVals.push(y);
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
      var coordsAreDefined = [ xMin, xMax, yMin, yMax ].every(
        function (coord) {
          return coord;
        },
      );

      // if they aren't
      if (!coordsAreDefined) {
        //  exit with null to avoid an error calling lat lng bounds
        // constructor
        return null;
      }

      // construct geometry
      var bbox = [ xMin, yMin, xMax, yMax ];
      var bounds = bboxPolygon(bbox).geometry;

      // var bounds = Leaflet.latLngBounds([
      //   [ yMin, xMin ],
      //   [ yMax, xMax ],
      // ]);

      // console.log('ending regmaps.js, bounds:', bounds);
      return bounds;
    },
  },
  success: function(data) {
    console.log('regmaps.js data:', data);
    // return data;
  },
  error: function(err) {
    console.log('regmaps error:', err);
  },
};
