import transforms from '../general/transforms';
const phone = transforms.phoneNumber.transform;


const titleCase = function(str) {
  str = str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  });
  return str.join(' ');
};

export default {
  key: 'voting',
  icon: 'gavel',
  label: 'Voting',
  dataSources: ['divisions', 'pollingPlaces', 'electedOfficials'],
  components: [
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'Learn about your voting options if you cannot vote in person on Election Day';
          },
          href: function(state) {
            return '//www.philadelphiavotes.com/en/voters/absentee-and-alternative-ballots';
          }
        }
      },
      slots: {
        title: 'Polling Place',
        fields: [
          {
            label: 'Location',
            value: function(state) {
              const pollingData = state.sources.pollingPlaces.data;
                   function nth(n){return n + ([,'st','nd','rd'][n%100>>3^1&&n%10]||'th')};
                   return "<b>"+ nth(state.geocode.data.properties.council_district_2016) + " Council District\
                   <br>Ward " + pollingData.WARD +
                   ", Division " + pollingData.DIVISION + "</b><br>" +
                   titleCase(pollingData.PLACENAME) + "<br>" +
                   titleCase(pollingData.STREET_ADDRESS) + "<br>\
                   All locations are open on Election Day <br>from 7am to 8pm.";
                  },
          },
          {
            label: 'Accessibility',
            value: function(state) {
              const pollingData = state.sources.pollingPlaces.data;
              const answer = pollingData.ACCESSIBILITY_CODE== "F" ? 'Building Fully Accessible' :
                             pollingData.ACCESSIBILITY_CODE== "B" ? 'Building Substantially Accessible' :
                             pollingData.ACCESSIBILITY_CODE== "M" ? 'Building Accessibility Modified' :
                             pollingData.ACCESSIBILITY_CODE== "R" ? 'Building Accessible With Ramp' :
                             pollingData.ACCESSIBILITY_CODE== "N" ? 'Building Not Accessible' :
                            'Information not available';
              return '<a href="//www.philadelphiavotes.com/en/voters/polling-place-accessibility"\
                      target="_blank">'+answer+'</a>';
            },
          },
          {
            label: 'Parking',
            value: function(state) {
              const pollingData = state.sources.pollingPlaces.data;
              const parking = pollingData.PARKING_CODE == "N" ? 'No Parking' :
                              pollingData.PARKING_CODE == "G" ? 'General Parking' :
                              pollingData.PARKING_CODE == "L" ? 'Loading Zone' :
                              'Information not available';
              return parking;
            },
          },
        ]
      },
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'See all citywide, state, and federal representatives';
          },
          href: function(state) {
            return '//www.philadelphiavotes.com/index.php?option=com_voterapp&tmpl=component#elected-officials';
          }
        }
      },

      slots: {
        title: 'Elected Representatives',
        fields: [
          {
            label: 'District Council Member',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {return item.office_label == "City Council";});
              return council[0].first_name +" " +council[0].last_name;
            },
          },
          {
            label: 'City Hall Office',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {return item.office_label == "City Council";});
              return council[0].main_contact_address_2 + '<br>' +
                     phone(council[0].main_contact_phone_1) + ", " + phone(council[0].main_contact_phone_2) + '<br>\
                      F: '+ phone(council[0].main_contact_fax) + ' <br>\
                      <b><a href=mailto:"' + council[0].email + '">' + council[0].email + '</a></b>';
            },
          },
          {
            label: 'Current Term',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {return item.office_label == "City Council";});
              return council[0].next_election - 4 + ' - ' + council[0].next_election
            },
          },
        ]
      },
    }, // end table
  ],
  zoomToShape: ['geojsonForTopic', 'markersForTopic'],
  geojsonForTopic: {
    data: function(state) {
      return state.sources.divisions.data
    },
    key: 'id',
    style: {
      fillColor: '#9e9ac8',
      color: '#9e9ac8',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    }
  },
  markersForTopic: {
    data: function(state) {
      return state.sources.pollingPlaces.data
    },
    lat: 'LAT',
    lng: 'LON',
    key: 'STREET_ADDRESS',
    color: '#54278f',
    icon: {
      prefix: 'fas',
      icon: 'landmark',
      shadow: false,
      size: 35,
    }
  },
  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd'
}
