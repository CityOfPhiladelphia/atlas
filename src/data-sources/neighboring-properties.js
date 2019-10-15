export default {
  id: 'neighboringProperties',
  type: 'esri-nearby',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0',
  options: {
    geometryServerUrl: '//gis-utils.databridge.phila.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 320,
  },
};
