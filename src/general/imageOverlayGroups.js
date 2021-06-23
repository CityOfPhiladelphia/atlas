export default {
  regmaps: {
    items: function(state) {
      // console.log('main.js imageOverlayGroups, state:', state);
      let data = [];
      if (state.sources.regmaps.data) {
        for (let item of state.sources.regmaps.data) {
          // console.log('in loop, item:', item);
          if (item.properties.RECMAP) {

            let dataItem = {
              data: item,
              source: {
                layer: {
                  id: item.properties.RECMAP,
                  type: 'raster',
                  minzoom: 0,
                  maxzoom: 22,
                },
                source: {
                  tiles: [ '\
https://gis-svc.databridge.phila.gov/arcgis/rest/services/Atlas/RegMaps/MapServer/export?dpi=96\
&layerDefs=0:NAME=\'g' + item.properties.RECMAP.toLowerCase() + '.tif\'\
&transparent=true\
&format=png24\
&bbox={bbox-epsg-3857}\
&bboxSR=3857\
&imageSR=3857\
&size=700,700\
&f=image\
&layers=show%3A0\
                  ' ],
                },
              },
            };
            data.push(dataItem);
          } // end of if
        } // end of loop
      } // end of if
      return data;
    },
  },
};
