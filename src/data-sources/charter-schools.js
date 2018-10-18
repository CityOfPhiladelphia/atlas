export default {
  id: 'charterSchools',
  type: 'esri-nearby',
  url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/CharterSchools_AN/FeatureServer/1',
  options: {
    geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 500,
  },
  success: function(data) {
    return data;
  }
}
