export default {
id: 'histLegalCards',
 type: 'http-get',
 url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Legal_Cards/FeatureServer/0/query',
 options: {
   params: {
     where: function(feature) {
       return "SEG_ID = '" + feature.properties.seg_id + "'";
     },
     outFields: "OBJECTID, LINK, ST_NAME, IMAGE_, MODDATE, STATUS, SEG_ID",
     returnDistinctValues: 'true',
     returnGeometry: 'false',
     f: 'json'
   },
   success: function(data) {
     // console.log('polling-places.js success, data:', data);
     if (data.features[0]) {
       return data.features[0].attributes;
     } else {
       return null;
     }
   },
 }
}
