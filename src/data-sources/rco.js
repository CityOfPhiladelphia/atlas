export default {
  id: 'rco',
  type: 'esri',
  url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0',
  options: {
    relationship: 'contains',
  },
  // success(data) {
  //   // format phone numbers
  //   console.log('rco success', data);
  //
  //   var s2 = (""+s).replace(/\D/g, '');
  //   var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
  //   return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
  //
  //   return data;
  // }
};
