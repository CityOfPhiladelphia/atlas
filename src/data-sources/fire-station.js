export default {
  id: 'fireStation',
  type: 'esri-nearby',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Fire_Stations_custom/FeatureServer/0',
  options: {
    geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 20000,
    where: "FIRESTA_ > 0",
  },
}
