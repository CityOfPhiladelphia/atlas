export default {
  // possibly should move to base config
  defaultBasemap: 'pwd',
  defaultIdentifyFeature: 'address-marker',
  imagery: {
    enabled: true
  },
  historicBasemaps: {
    enabled: false
  },
  featureLayers: {
    streetTrees: {
      url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/Philadelphia_Street_Trees/FeatureServer/0',
      markerType: 'circleMarker',
      color: 'green',
      fillColor: 'green',
      fillOpacity: 0.5,
      weight: 1,
      radius: 6,
      minZoom: 19,
    },
  },
}
