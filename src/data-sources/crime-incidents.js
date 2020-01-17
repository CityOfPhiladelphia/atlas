export default {
  id: 'crimeIncidents',
  type: 'http-get-nearby',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'incidents_part1_part2',
    dateMinNum: 1,
    dateMinType: 'year',
    dateField: 'dispatch_date',
  },
};
