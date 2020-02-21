export default {
  id: 'streetType',
  type: 'http-get',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/CompleteStreetsTypesStndrds/FeatureServer/0/query',
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
