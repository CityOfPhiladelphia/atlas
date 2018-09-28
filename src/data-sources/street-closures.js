export default {
 id: 'streetClosures',
 type: 'http-get',
 url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/LaneClosure_Master/FeatureServer/0/query',
 options: {
   params: {
     where: function(feature, state) {
       console.log('seg.js feature:', feature, 'state:', state);
       let where = "SEG_ID = " + feature.properties.seg_id
       return where;
     },
     outFields: "PERMITTYPE, OCCUPANCYTYPE, PERMITNUMBER, EFFECTIVEDATE,\
                 EXPIRATIONDATE, RAINDATE, PURPOSE, STATUS, SEG_ID, TYPE,\
                 ADDRESS",
     returnDistinctValues: 'true',
     returnGeometry: 'false',
     f: 'json'
   },

   success: function(data) {
     console.log('seg.js success, data:', data);
     return data.features;
   }
 }
}




// export default {
//   id: 'street-closures',
//   type: 'esri-nearby',
//   url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/LaneClosure_Master/FeatureServer/0/query',
//   options: {
//     geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
//     calculateDistance: true,
//     distances: 1320,
//   },
// }
