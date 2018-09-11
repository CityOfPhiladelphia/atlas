export default {
  id: 'permitParking',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'residential_parking_permit_blocks',
    params: {},
  }
}
