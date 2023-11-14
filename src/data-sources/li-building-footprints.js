export default {
  id: 'li-building-footprints',
  type: 'http-get',
  segments: true,
  splitField: 'bin',
  dependent: 'none',
  resettable: true,
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/LI_BUILDING_FOOTPRINTS/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature, state) {
        let data;
        let where;
        let bin = "";
        if (feature.length) {
          for (let i=0;i<feature.length;i++) {
            bin += feature[i];
            if (i < feature.length-1) {
              bin += "', '";
            }
          }
          where = "BIN IN ('" + bin + "')";
          // console.log('after loop, bin:', bin);

        } else {
          data = feature.properties.li_parcel_id;
          where = "PARCEL_ID_NUM = '" + data + "'";
        }
        // console.log('li-building-footprints.js where function, feature.properties.bin:', feature.properties.bin, 'feature.properties.li_parcel_id:', feature.properties.li_parcel_id, 'where:', where);
        return where;
      },
      outFields: '*',
      outSR: 4326,
      f: 'pjson',
    },
    success: function(data) {
      return data;
    },
  },
};
