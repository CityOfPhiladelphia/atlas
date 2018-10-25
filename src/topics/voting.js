import transforms from '../general/transforms';
import moment from 'moment';
const phone = transforms.phoneNumber.transform;
const titleCase = transforms.titleCase.transform;
const nth = transforms.nth.transform;

export default {
  key: 'voting',
  icon: 'gavel',
  label: 'Voting',
  dataSources: ['divisions', 'pollingPlaces', 'electedOfficials', 'nextElectionAPI'],
  components: [
    {
      type: 'badge',
      options: {
        titleBackground: '#C8C6C6',
        externalLink: {
          data: 'Preview ballot',
          // action: function(state){return 'Preview ballot'},
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return '//www.philadelphiavotes.com/index.php?option=com_voterapp&tmpl=component#ballots';
          },
        },
      },
      slots: {
        title: 'Next Eligible Election Is',
        value: function(state) {
          return moment(state.sources.nextElectionAPI.data.election_date).format('dddd, LL');
        },
      }, // end slots
    }, // end of badge
    {
      type: 'callout',
      slots: {
        text: '\
          The deadline to register for the next election \
          is 30 days prior to the election. \
          You can confirm your registration and learn about \
          registering to vote<a target="_blank" \
          href="//www.philadelphiavotes.com/en/voters/registering-to-vote"> \
          here</a>.\
        ',
      }
    },
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
                   return "<b>Ward " + pollingData.WARD +
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
                             pollingData.ACCESSIBILITY_CODE== "A" ? 'Alternate Entrance' :
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
              return '<a href="' + council[0].website + '" target="_blank">' +
                council[0].first_name +" " +council[0].last_name + " - " + nth(state.geocode.data.properties.council_district_2016) + " Council District </a>";
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
