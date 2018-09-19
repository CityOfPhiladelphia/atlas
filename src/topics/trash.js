import transforms from '../general/transforms';

const getNearest = function(state, field, distName) {

  let min = Math.min.apply(null, state.sources[field].data.map(function(item) {return item[distName];}));
  let result  = state.sources[field].data.filter(function(item){return item[distName] == min;} );
  let nearest = result? result[0] : null;
  return nearest
};


export default {
  key: 'trashDay',
  icon: 'trash-o',
  label: 'Trash & Recycling',

  components: [
    {
      type: 'badge-custom',
      options: {
        titleBackground: '#58c04d',
        components: [
          {
            type: 'badge',
            options: {
              titleBackground: '#58c04d',
            },
            slots: {
              value: function(state) {
                return transforms.dayofweek.transform(state.geocode.data.properties.rubbish_recycle_day);
              },
            },
          }
        ],
      },
      slots: {
        title: 'Your Trash Day Is',
      }, // end slots
    }, // end of badge-custom
    {
      type: 'callout',
      slots: {
        text: '\
          School Catchment Areas, Political Divisions and Districts, Public Safety, Planning Districts, \
          Census Geographies,  Streets and Sanitation information at your search address. \
          Sources: \
        '
      }
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
      },
      slots: {
        title: 'Trash and Recycling',
        fields: [
          {
            label: 'Nearest Sanitation Convenience Center',
            value: function(state) {
              // REVIEW getNearest function is called before property is ready, giving a null error
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
          {
            label: 'Nearest Leaf Drop-off Location',
            value: function(state) {
              return '1234 Sample Address <br>\
              All locations open Saturdays 9am-3pm\
              during Collection season.<br>\
              Collection season for 2017 is <b>over</b>.<br>\
              <a href="//www.philadelphiastreets.com/leaves/">\
              More details available from Streets Dept</a>';
            },
          },
          {
            label: 'Nearest Household Hazardous Waste Event',
            value: function(state) {
              return '<b>Someday, Date 20th, 2018 9am-3pm</b><br>\
                1234 Sample Address <br>\
                1234 Sample Address Line 2<br>\
                <a href="//www.philadelphiastreets.com/events/household-hazardous-waste-events">\
                More details available from Streets Dept</a>';
            },
          },
        ]
      }
    }, // end streets table
  ],
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
