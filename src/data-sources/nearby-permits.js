export default {
  id: 'nearbyPermits',
  type: 'http-get-nearby',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'permits',
    dateMinNum: 1,
    dateMinType: 'year',
    dateField: 'permitissuedate',
  },
};
