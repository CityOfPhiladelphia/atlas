export default {
  id: 'recCenters',
  type: 'esri-nearby',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/City_Facilities_pub/FeatureServer/0',
  options: {
    where: "Site_Name LIKE '%Recreation Center%'",
    geometryServerUrl: '//gis.phila.gov/arcgis/rest/services/Geometry/GeometryServer/',
    calculateDistance: true,
    distances: 2640,
  },
}
