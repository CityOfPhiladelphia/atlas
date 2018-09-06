export default {
  id: 'sanitationCenters',
  type: 'http-get-nearby',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'sanitation_convenience_centers',
    params: {},
    distances: 30000,
  }
}
