export default {
  id: 'historicNearby',
  type: 'esri-nearby',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Historic_sites_PhilReg/FeatureServer/0',
  options: {
    geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 660,
    limit: 10
  },
}
