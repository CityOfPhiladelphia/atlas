export default {
  id: 'neighConservation',
  type: 'esri',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Zoning_Overlays/FeatureServer/0',
  options: {
    relationship: 'contains',
    where: "OVERLAY_NAME LIKE '%Neighborhood Conservation%'",
  },
}
