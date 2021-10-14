import transforms from '../general/transforms';
import { format, parseISO } from 'date-fns';
const phone = transforms.phoneNumber.transform;
const titleCase = transforms.titleCase.transform;
const nth = transforms.nth.transform;
let $t;

export default {
  key: 'voting',
  icon: 'gavel',
  label: 'Voting',
  dataSources: [ 'divisions', 'pollingPlaces', 'nextElectionAPI' ],
  // dataSources: [ 'divisions', 'pollingPlaces', 'electedOfficials', 'nextElectionAPI' ],
  errorMessage: function() {
    return ' ';
  },
  components: [
    // {
    //   type: 'exclamationCallout',
    //   options: {
    //     components: [
    //       {
    //         type: 'exclamationContentTopic',
    //       },
    //     ],
    //   },
    // },
    {
      type: 'badge',
      options: {
        externalLink: {
          data: 'voting.topic.previewBallot',
          href: function(state) {
            let value;
            if (state.sources.electedOfficials.data) {
              value = 'https://files.philadelphiavotes.com/ballot_paper/' + state.sources.electedOfficials.data.rows[0].ballot_file_id + '.pdf';
            }
            return value;
          },
        },
      },
      slots: {
        title: 'voting.topic.badge1.header',
        titleBackground: '#2176d2',
        value: function(state) {
          // return 'voting.topic.badge1.content';
          return format(parseISO(state.sources.nextElectionAPI.data.election_date), 'MMMM d, yyyy');
        },
      }, // end slots
    }, // end of badge
    {
      type: 'callout',
      slots: {
        text: 'voting.topic.callout1.text',
      },
    },
    {
      type: 'vertical-table',
      options: {
        nullValue: 'None',
        externalLink: {
          action: function() {
            return 'voting.topic.verticalTable1.link';
          },
          href: function() {
            return 'https://www.philadelphiavotes.com/en/voters/mail-in-and-absentee-ballots';
          },
        },
      },
      slots: {
        title: 'voting.topic.pollingPlace',
        fields: [
          {
            label: 'voting.topic.location',
            value: function(state) {
              if (state.sources.pollingPlaces.data && state.sources.pollingPlaces.data.rows.length) {
                const pollingData = state.sources.pollingPlaces.data.rows[0];
                // console.log('state.sources.pollingPlaces.data.rows', state.sources.pollingPlaces.data.rows, 'pollingData:', pollingData);
                return "<b>Ward " + pollingData.ward +
                ", Division " + pollingData.division + "</b><br>" +
                titleCase(pollingData.placename) + "<br>" +
                titleCase(pollingData.street_address) + "<br>\
                ";
              }
            },
          },
          {
            label: 'voting.topic.hours',
            value: 'voting.introPage.p4',
          },
          {
            label: 'voting.topic.accessibility',
            value: function(state) {
              if (state.sources.pollingPlaces.data && state.sources.pollingPlaces.data.rows.length) {
                const pollingData = state.sources.pollingPlaces.data.rows[0];
                const answer = pollingData.accessibility_code== "F" ? 'voting.topic.accessibilityCodes.buildingFullyAccessible' :
                  pollingData.accessibility_code== "B" ? 'voting.topic.accessibilityCodes.buildingSubstantiallyAccessible' :
                    pollingData.accessibility_code== "M" ? 'voting.topic.accessibilityCodes.buildingAccessibilityModified' :
                      pollingData.accessibility_code== "A" ? 'voting.topic.accessibilityCodes.alternateEntrance' :
                        pollingData.accessibility_code== "R" ? 'voting.topic.accessibilityCodes.buildingAccessibleWithRamp' :
                          pollingData.accessibility_code== "N" ? 'voting.topic.accessibilityCodes.buildingNotAccessible' :
                            'voting.topic.accessibilityCodes.informationNotAvailable';
                return answer;
                // return '<a href="//www.philadelphiavotes.com/en/voters/polling-place-accessibility"\
                //         target="_blank">'+answer+'</a>';
              }
            },
            link: '//www.philadelphiavotes.com/en/voters/polling-place-accessibility',
          },
          {
            label: 'voting.topic.parking',
            value: function(state) {
              if (state.sources.pollingPlaces.data) {
                const pollingData = state.sources.pollingPlaces.data;
                const parking = pollingData.parking_code == "N" ? 'voting.topic.parkingCodes.noParking' :
                  pollingData.parking_code == "G" ? 'voting.topic.parkingCodes.generalParking' :
                    pollingData.parking_code == "L" ? 'voting.topic.parkingCodes.loadingZone' :
                      'voting.topic.accessibilityCodes.informationNotAvailable';
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
            return 'voting.topic.verticalTable2.link';
          },
          href: function(state) {
            return '//www.philadelphiavotes.com/en/voters/elected-officials';
          },
        },
      },

      slots: {
        title: 'voting.topic.electedRep',
        fields: [
          {
            label: 'voting.topic.districtCouncilMember',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {
                return item.office_label == "City Council";
              });
              return '<a href="http://' + council[0].website + '" target="_blank">' +
                council[0].first_name +" " +council[0].last_name + " - " + nth(state.geocode.data.properties.council_district_2016) + " Council District </a>";
            },
          },
          {
            label: 'voting.topic.cityHallOffice',
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
            label: 'voting.topic.currentTerm',
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
