export default {
  version: 8,
  sources: {
    pwd: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    cityBasemapLabels: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
  },
  // glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  glyphs: 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'pwd',
      type: 'raster',
      source: 'pwd',
    },
    {
      id: 'cityBasemapLabels',
      type: 'raster',
      source: 'cityBasemapLabels',
    },
  ],
};
