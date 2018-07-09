export default {
  id: 'divisions',
  url: 'http://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Political_Divisions/FeatureServer/0',
  type: 'esri',
  options: {
    relationship: 'contains',
  },
  success(data) {
    return data;
  },
};
