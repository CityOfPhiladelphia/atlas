const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

const getNearest = function(state, field, distName) {

  let min = Math.min.apply(null, state.sources[field].data.map(function(item) {return item[distName];}));
  let result  = state.sources[field].data.filter(function(item){return item[distName] == min;} );
  let nearest = result? result[0] : null;
  return nearest
};

export default {
  key: 'assistance',
  icon: 'handshake',
  label: 'assistance',
  dataSources: ['sanitationCenters'],
  components: [
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'View a map of all Benephilly locations';
          },
          href: function(state) {
            return '//www.sharedprosperityphila.org/our-initiatives/benephilly/';
          }
        }
      },
      slots: {
        title: 'BenePhilly',
        fields: [
          {
            label: 'Nearest Location',
            value: function(state) {
              // REVIEW getNearest function is called before property is ready, giving a null error
              return (`<a target="_blank"><b>${getNearest(state, 'sanitationCenters', 'distance').name}</b></a> <br>
              ${getNearest(state, 'sanitationCenters', 'distance').address} <br>
              ${getNearest(state, 'sanitationCenters', 'distance').phone} <br>
              ${(getNearest(state, 'sanitationCenters', 'distance').distance/5280).toFixed(1)} miles
              `);
            },
          },
          {
            label: 'Description',
            value: function() {
              return ('Call <b>(844) 848-4376</b> or visit a BenePhilly Center to get\
              free, one-on-one professional support to enroll in more than 20\
              public benefits and services.')
            },
          },
        ]
      },
    }, // end table
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'View a map of all Financial Empowerment Centers';
          },
          href: function(state) {
            return '//www.phila.gov/fe/Aboutus/Pages/map.aspx';
          }
        }
      },
      slots: {
        title: 'Financial Empowerment Centers',
        fields: [
          {
            label: 'Nearest Location',
            value: function(state) {
              // REVIEW getNearest function is called before property is ready, giving a null error
              return (`<a target="_blank"><b>${getNearest(state, 'sanitationCenters', 'distance').name}</b> </a><br>
              ${getNearest(state, 'sanitationCenters', 'distance').address} <br>
              ${getNearest(state, 'sanitationCenters', 'distance').phone} <br>
              ${(getNearest(state, 'sanitationCenters', 'distance').distance/5280).toFixed(1)} miles
              `);
            },
          },
          {
            label: 'Description',
            value: function() {
              return ('Free one-oneone financial counseling including credit\
                      repair, safe, affordable checking and savings accounts,\
                      home-ownership preparation, and retirement saving. To \
                      schedule an appointment, call <b>(844) 848-4376</b>.')
            },
          },
        ]
      },
    }, // end table
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'View a map of Philadelphia-area Neighborhood Energy Centers';
          },
          href: function(state) {
            return '//www.ecasavesenergy.org/resources/neighborhood-energy-centers';
          }
        }
      },
      slots: {
        title: 'Neighborhood Energy Centers',
        fields: [
          {
            label: 'Nearest Location',
            value: function(state) {
              // REVIEW getNearest function is called before property is ready, giving a null error
              return (`<a><b>${getNearest(state, 'sanitationCenters', 'distance').name} </a></b><br>
              ${getNearest(state, 'sanitationCenters', 'distance').address} <br>
              ${getNearest(state, 'sanitationCenters', 'distance').phone} <br>
              ${(getNearest(state, 'sanitationCenters', 'distance').distance/5280).toFixed(1)} miles
              `);
            },
          },
          {
            label: 'Description',
            value: function() {
              return ('A "one-stop shop" for energy affordability. Trained\
                      counselors help with energy conservation, home repair,\
                      and paying utility bills.')
            },
          },
        ]
      },
    }, // end table
    {
      type: 'horizontal-table',
      options: {
        noCount: true,
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Find food resources including soup kitchens, food pantries,\
                    and low-cost groceries.';
          },
          name: 'Free Meals',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//philadelphiaofficeofhomelessservices.org/shared-public-spaces/free-meals/';
          }
        },
      },
      slots: {
        title: 'Free Meals',
      }
    }, // end table
    {
      type: 'horizontal-table',
      options: {
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Download a printable list of free meals.';
          },
          name: 'Free Meals',
          href: function(state) {
            return '//philadelphiaofficeofhomelessservices.org/shared-public-spaces/free-meals/';
          }
        }
      },
      slots: {
      }
    }, // end table
    {
      type: 'horizontal-table',
      options: {
        noCount: true,
        fields: [],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'Find information about many other city services available to residents \
                    of Philadelphia including tax and bill relief, assistance with property \
                    and housing, and many more.';
          },
          name: 'Free Meals',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.phila.gov/services/';
          }
        }
      },
      slots: {
        title: 'Additional Services',
      }
    }, // end table
    {
      type: 'callout',
      slots: {
        text: '\
        Looking for community organizations operating in your area? \
        Registered Community Organizations can be found under <b>Zoning</b>.\
        '
      }
    },
  ],
  zoomToShape: ['geojson', 'marker'],
  geojson: {
    path: ['divisions', 'data'],
    key: 'id',
    style: {
      fillColor: '#42f459',
      color: '#42f459',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    }
  },
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
