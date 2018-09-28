export default {
  key: 'business',
  icon: 'briefcase',
  label: 'Business',
  dataSources: ['businessArea', 'redevelopmentArea', 'tobacco','noVendingArea',  'specialVendingArea',],

  components: [

    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'Learn more about services and requirements for businesses';
          },
          href: function(state) {
            return '//www.phila.gov/services/business-self-employment/';
          }
        }
      },
      slots: {
        title: 'Business Services',
        fields: [
          {
            label: 'Business Improvement District',
            value: function() {
              return ("<a><b>Sample Business District</b></a> <br> \
              1234 Market Street, 19404 <br> \
              (215) 555-0555 <br> \
              sample@phila.gov")
            }
          },
          {
            label: 'Market Area Representative',
            value: function(state) {
              return ('<a href="https://www.phila.gov/commerce/pages/default.aspx" target="_blank"><b> ' + state.sources.businessArea.data[0].properties.MANAGER + '</b></a> <br> \
              Senior Somthing Something<br> \
              (215) 555-0555 <br>')
            }
          },
          {
            label: 'Keystone Opportunity Zone',
            value: function(state) {
              if (state.sources.keystoneZone.data) {
                if (state.sources.keystoneZone.data.length > 0) {
                  return "Eligible" } else {
                  return "Not Eligible"
                }
              } else {
                return "Not Eligible"
              }
            }
          },
          {
            label: 'Redevelopment Certified Area',
            value: function(state) {
              if(state.sources.redevelopmentArea.data){
                if(state.sources.redevelopmentArea.data.length > 0) {
                  var date;
                  if(state.sources.redevelopmentArea.data[0].properties.RECERT4 != null) {
                    date = state.sources.redevelopmentArea.data[0].properties.RECERT4 } else
                  if(state.sources.redevelopmentArea.data[0].properties.RECERT3 != null) {
                    date = state.sources.redevelopmentArea.data[0].properties.RECERT3 } else
                  if(state.sources.redevelopmentArea.data[0].properties.RECERT2 != null) {
                    date = state.sources.redevelopmentArea.data[0].properties.RECERT2 } else
                  if(state.sources.redevelopmentArea.data[0].properties.RECERT1 != null) {
                    date = state.sources.redevelopmentArea.data[0].properties.RECERT1 } else
                  if(state.sources.redevelopmentArea.data[0].properties.YEAR) {
                    date = state.sources.redevelopmentArea.data[0].properties.YEAR } else {
                    date = "Not Applicable"
                  };
                  return ( state.sources.redevelopmentArea.data[0].properties.NAME +"<br>" +
                          date )
                } else {
                  return "Not Applicable"
                }
              } else {
                return "Not Applicable"
              }
            }
          },
          {
            label: 'Tobacco Restrictions',
            value: function(state) {
              if(state.sources.tobacco.data != null) {
                if(state.sources.tobacco.data.length > 0) {
                  return 'Tobacco-Free School Zone' } else {
                  return 'Eligible - Apply for a permit <a href="//business.phila.gov/tobacco-retailer-permit/"\
                          target="_blank">here</a>'
                }
              } else {
                return "Eligible - Apply for a permit <a>here</a>"
              }
            }
          },
          {
            label: 'Street Vending',
            value: function(state) {
              if(state.sources.noVendingArea.data != null) {
                if(state.sources.noVendingArea.data.length > 0) {
                  return "Vending Prohibited Area"
                } else {
                  if(state.sources.specialVendingArea.data != null) {
                    if(state.sources.specialVendingArea.data.length > 0) {
                      return 'Special District - <a href="//business.phila.gov/neighborhood-vending-district-license/" \
                              target="_blank">Click</a> for more info'
                    }else {
                      return 'Eligible - Apply for a permit <a href="//business.phila.gov/vendor-licenses/" \
                              target="_blank">here</a>'
                    }
                  }
                }
              }
            }
          },
        ]
      }
    }
  ],

  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
