export default {
  id: 'divisions',
  url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
  // type: 'http-get',
  type: 'esri',
  options: {
    relationship: 'contains',
  },
  success(data) {
    return data;
  },
};
