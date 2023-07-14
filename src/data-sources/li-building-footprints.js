export default {
  id: 'li-building-footprints',
  type: 'http-get',
  dependent: 'none',
  resettable: true,
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/LI_BUILDING_FOOTPRINTS/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature, state) {
        let bin = feature.properties.bin.replace(/\|/g, "', '");
        console.log('li-building-footprints.js where function, feature.properties.bin:', feature.properties.bin, 'bin:', bin);
        let where = "BIN IN ('" + bin + "')";
        return where;
      },
      outFields: '*',
      outSR: 4326,
      f: 'pjson',
    },
  },
};
