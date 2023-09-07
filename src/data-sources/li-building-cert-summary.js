export default {
  id: 'liBuildingCertSummary',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        let bin = feature.properties.bin.replace(/\|/g, "', '");
        return `SELECT * FROM building_cert_summary WHERE structure_id IN ('${bin}')`;
      },
    },
  },
};
