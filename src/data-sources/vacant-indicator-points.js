export default {
  id: 'vacantIndicatorsPoints',
  type: 'esri-nearby',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Points/FeatureServer/0',
  options: {
    geometryServerUrl: 'https://citygeo-geocoder-pub.databridge.phila.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 500,
  },
};
