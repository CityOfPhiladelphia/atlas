export default {
  // possibly should move to base config
  // type: 'leaflet',
  type: 'mapbox',
  // tiles: 'hosted',
  defaultBasemap: 'pwd',
  defaultIdentifyFeature: 'address-marker',
  imagery: {
    enabled: true,
  },
  initialImagery: 'imagery2023',
  // featureLayers: {
  //   pwdParcels: {
  //     url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS_TEST/FeatureServer/0',
  //   },
  // },
  overlaySources: {
    zoning: {
      layer: {
        id: 'zoning',
        type: 'raster',
        minzoom: 0,
        maxzoom: 22,
      },
      source: {
        tiles: [
          'https://citygeo-geoserver.databridge.phila.gov/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&layers=atlas_zoning_grouped&bbox={bbox-epsg-3857}&width=1024&height=1024&srs=EPSG%3A3857&format=image/png8&transparent=true',
        ],
        type: 'raster',
        tileSize: 1024,
      },
    },
  },
};
