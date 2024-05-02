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
      // https://gis-svc.databridge.phila.gov/arcgis/rest/services/Atlas/ZoningMap/MapServer/export?dpi=110\
      source: {
        tiles: [
          'https://citygeo-geoserver.databridge.phila.gov/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=atlas_zoning_grouped&bbox={bbox-epsg-3857}&width=1024&height=1024&srs=EPSG%3A3857&styles=&format=image/png&transparent=true',
          // 'https://citygeo-geocoder-pub.databridge.phila.gov/arcgis/rest/services/Atlas/ZoningMap/MapServer/export?dpi=120\
          //   &transparent=true\
          //   &format=png32\
          //   &bbox={bbox-epsg-3857}\
          //   &bboxSR=3857\
          //   &imageSR=3857\
          //   &size=512,512\
          //   &f=image\
          // ',
        ],
        type: 'raster',
        tileSize: 1024,
      },
    },
  },
};
