export default {
  id: 'liBuildingCerts',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  deps: [ 'sources.liBuildingFootprints' ],
  options: {
    params: {
      // q: function(feature){
      q: function(feature, state) {
        let bin;
        if (feature.properties.bin) {
          bin = feature.properties.bin.replace(/\|/g, "', '");
        } else {
          bin = state.sources.liBuildingFootprints.data.features[0].attributes.BIN;//.replace(/\|/g, "', '");
        }
        // let bin = feature.properties.bin.replace(/\|/g, "', '");
        return `SELECT * FROM building_certs WHERE bin IN ('${bin}')`;
      },
    },
  },
};
