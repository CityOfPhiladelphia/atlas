export default {
  id: 'streetCenterline',
  type: 'http-get',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Street_Centerline/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature){
        return 'SEG_ID=' + feature.properties.seg_id;
      },
      f: 'pjson',
      outFields: '*',
    },
  },
};
