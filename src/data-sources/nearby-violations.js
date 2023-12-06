export default {
  id: 'nearbyViolations',
  type: 'http-get-nearby',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'violations',
    dateMinNum: 1,
    dateMinType: 'year',
    dateField: 'casecreateddate',
    groupby: 'casenumber, casecreateddate, caseprioritydesc, casestatus, address',
  },
};
