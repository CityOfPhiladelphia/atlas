export default {
  id: 'nearbyZoningAppeals',
  type: 'http-get-nearby',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'li_appeals',
    dateMinNum: 1,
    dateMinType: 'year',
    dateField: 'decisiondate',
    params: {}
  }
}
