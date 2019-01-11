export default {
id: 'historicStreets',
 type: 'http-get',
 url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Historic_Streets/FeatureServer/0/query',
 options: {
   params: {
     where: function(feature) {
       return "SEG_ID = '" + feature.properties.seg_id + "'";
     },
     outFields: "PRIMARYROA, RESPONSIBL, SEG_ID, ON_STREET, CLASS",
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
