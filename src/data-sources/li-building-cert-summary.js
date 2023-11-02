export default {
  id: 'liBuildingCertSummary',
  type: 'http-get',
  segments: true,
  splitField: 'bin',
  url: 'https://phl.carto.com/api/v2/sql',
  deps: [ 'sources.liBuildingFootprints' ],
  options: {
    params: {
      q: function(feature, state){
        let bin = "";
        // console.log('li-building-cert-summary, feature:', feature);
        if (feature.length) {
          for (let i=0;i<feature.length;i++) {
            bin += feature[i];
            if (i < feature.length-1) {
              bin += "', '";
            }
          }
          // console.log('after loop, bin:', bin);
        } else if (state.sources.liBuildingFootprints.data.features.length) {
          bin = state.sources.liBuildingFootprints.data.features[0].attributes.BIN;//.replace(/\|/g, "', '");
        } else {
          bin = '';
        }
        // console.log('li-building-cert-summary.js q function, bin:', bin, 'feature:', feature, 'state.sources.liBuildingFootprints.data.features:', state.sources.liBuildingFootprints.data.features);
        return `SELECT * FROM building_cert_summary WHERE structure_id IN ('${bin}')`;
      },
    },
    success: function(data) {
      return data;
    },
  },
};
