export default {
  id: 'airQuality',
  type: 'esri-nearby',
  url: 'https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Air_Now_Monitor_Data_Public/FeatureServer/0',
  options: {
    geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 20000,
  },
}
