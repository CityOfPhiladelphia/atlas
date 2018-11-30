import transforms from '../general/transforms';

const getNearest = function(state, field, distName) {
  if(state) {
    if(state.sources[field].data){
      let min = Math.min.apply(null, state.sources[field].data.map(function(item) {return item[distName];}));
      let result  = state.sources[field].data.filter(function(item){return item[distName] == min;} );
      let nearest = result? result[0] : null;
      return nearest
    }
  } else {return}
};


export default {
  key: 'trashDay',
  icon: 'trash',
  label: 'Trash & Recycling',

  components: [
    {
      type: 'badge',
      options: {
        titleBackground: '#58c04d',
      },
      slots: {
        title: 'Your Trash Day Is',
        value: function(state) {
          return transforms.dayofweek.transform(state.geocode.data.properties.rubbish_recycle_day);
        },
      },  // end slots
    }, // end of badge
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'Report missed trash collection, illegal dumping, or other issues.';
          },
          href: function(state) {
            return '//www.philadelphiastreets.com/helpful-links/request-a-service';
          }
        }
      },
      slots: {
        title: 'Trash and Recycling',
        fields: [
          {
            label: 'Nearest Sanitation Convenience Center',
            value: function(state) {
              return (`${getNearest(state, 'sanitationCenters', 'distance').name} <br>\
              ${getNearest(state, 'sanitationCenters', 'distance').address} <br>\
              ${getNearest(state, 'sanitationCenters', 'distance').phone} <br>
              All locations are open Mon. through Sat. \
              between 8 a.m. and 8 p.m. Except on \
              City holidays.<br>\
              <a href="//www.philadelphiastreets.com/binrequest/">Get a recycling bin. </a>\
              `);
            },
          },
          {
            label: 'Leaf Collection',
            value: function(state) {
              return state.geocode.data.properties.leaf_collection_area;
            },
          },
        ]
      }
    }, // end streets table
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
