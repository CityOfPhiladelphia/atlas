import transforms from '../general/transforms';
import { format, parseISO } from 'date-fns';
const phone = transforms.phoneNumber.transform;
const titleCase = transforms.titleCase.transform;
const nth = transforms.nth.transform;

export default {
  key: 'voting',
  icon: 'gavel',
  label: 'Voting',
  dataSources: [ 'divisions', 'pollingPlaces', 'electedOfficials', 'nextElectionAPI' ],
  errorMessage: function() {
    return ' ';
  },
  components: [
    {
      type: 'exclamationCallout',
      slots: {
        text: '\
        <b>COVID19 ALERT</b>: There have been widespread changes to polling place locations due to the pandemic.\
        Many polling place locations have been changed since the last election and may be located farther from your home address.<br><br>\
        Mail in ballot applications must be received by your county election office no later than Tuesday, May 26th.<br><br>\
        Request a mail-in ballot at <a target="_blank" href="//apps.philadelphiavotes.com/">https://apps.philadelphiavotes.com</a>.<br><br>\
        If you are planning on voting in person, please confirm your polling place and make voting arrangements prior to the election.\
        ',
      },
    },
    {
      type: 'badge',
      options: {
        externalLink: {
          data: 'Preview ballot',
          // action: function(state){return 'Preview ballot'},
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            return 'https://files.philadelphiavotes.com/ballot_paper/' + state.sources.electedOfficials.data.rows[0].ballot_file_id + '.pdf';
          },
        },
      },
      slots: {
        title: 'Next Eligible Election Is',
        titleBackground: '#2176d2',
        value: function(state) {
          return format(parseISO(state.sources.nextElectionAPI.data.election_date), 'MMMM d, yyyy');
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
          registering to vote at <a target="_blank" \
          href="//www.philadelphiavotes.com/en/voters/registering-to-vote"> \
          www.philadelphiavotes.com</a>.\
        ',
        // Request a mail-in ballot at <a target="_blank" \
        // href="//www.votespa.com/Voting-in-PA/Pages/Mail-and-Absentee-Ballot.aspx"> \
        // www.votespa.com</a>.\
      },
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'Learn about your voting options if you cannot vote in person on Election Day';
          },
          href: function() {
            return 'https://www.philadelphiavotes.com/en/voters/mail-in-and-absentee-ballots';
          },
        },
      },
      slots: {
        title: 'Polling Place',
        fields: [
          {
            label: 'Location',
            value: function(state) {
              if (state.sources.pollingPlaces.data) {

                const pollingData = state.sources.pollingPlaces.data.rows[0];
                return "<b>Ward " + pollingData.ward +
                ", Division " + pollingData.division + "</b><br>" +
                titleCase(pollingData.placename) + "<br>" +
                titleCase(pollingData.street_address) + "<br>\
                All locations are open on Election Day <br>from 7am to 8pm.";
              }
            },
          },
          {
            label: 'Accessibility',
            value: function(state) {
              if (state.sources.pollingPlaces.data) {
                const pollingData = state.sources.pollingPlaces.data.rows[0];
                const answer = pollingData.accessibility_code== "F" ? 'Building Fully Accessible' :
                  pollingData.accessibility_code== "B" ? 'Building Substantially Accessible' :
                    pollingData.accessibility_code== "M" ? 'Building Accessibility Modified' :
                      pollingData.accessibility_code== "A" ? 'Alternate Entrance' :
                        pollingData.accessibility_code== "R" ? 'Building Accessible With Ramp' :
                          pollingData.accessibility_code== "N" ? 'Building Not Accessible' :
                            'Information not available';
                return '<a href="//www.philadelphiavotes.com/en/voters/polling-place-accessibility"\
                        target="_blank">'+answer+'</a>';
              }
            },
          },
          {
            label: 'Parking',
            value: function(state) {
              if (state.sources.pollingPlaces.data) {
                const pollingData = state.sources.pollingPlaces.data;
                const parking = pollingData.parking_code == "N" ? 'No Parking' :
                  pollingData.parking_code == "G" ? 'General Parking' :
                    pollingData.parking_code == "L" ? 'Loading Zone' :
                      'Information not available';
                return parking;
              }
            },
          },
        ],
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
            return '//www.philadelphiavotes.com/en/voters/elected-officials';
          },
        },
      },

      slots: {
        title: 'Elected Representatives',
        fields: [
          {
            label: 'District Council Member',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {
                return item.office_label == "City Council";
              });
              return '<a href="http://' + council[0].website + '" target="_blank">' +
                council[0].first_name +" " +council[0].last_name + " - " + nth(state.geocode.data.properties.council_district_2016) + " Council District </a>";
            },
          },
          {
            label: 'City Hall Office',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {
                return item.office_label == "City Council";
              });
              return council[0].main_contact_address_2 + '<br>' +
                     phone(council[0].main_contact_phone_1) + ", " + phone(council[0].main_contact_phone_2) + '<br>\
                      F: '+ phone(council[0].main_contact_fax) + ' <br>\
                      <b><a href=mailto:"' + council[0].email + '">' + council[0].email + '</a></b>';
            },
          },
          {
            label: 'Current Term',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {
                return item.office_label == "City Council";
              });
              return council[0].next_election - 4 + ' - ' + council[0].next_election;
            },
          },
        ],
      },
    }, // end table
  ],
  zoomToShape: [ 'geojsonForTopic', 'markersForTopic' ],
  geojsonForTopic: {
    data: function(state) {
      return state.sources.divisions.data;
    },
    key: 'id',
    style: {
      fillColor: '#9e9ac8',
      color: '#9e9ac8',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
    },
  },
  markersForTopic: {
    data: function(state) {
      if (state.sources.pollingPlaces.data) {
        return state.sources.pollingPlaces.data.rows[0];
      }
      return null;

    },
    lat: 'lat',
    lng: 'lng',
    key: 'STREET_ADDRESS',
    color: '#54278f',
    icon: {
      prefix: 'fas',
      icon: 'landmark',
      shadow: false,
      size: '2x',
    },
  },
  basemap: 'pwd',
  identifyFeature: 'address-marker',
  parcels: 'pwd',
};
