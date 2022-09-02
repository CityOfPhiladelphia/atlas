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
  dataSources: [ 'divisions', 'pollingPlaces', 'electedOfficials', 'nextElectionAPI' ],
  errorMessage: function() {
    return 'No voting assignment found for this address.';
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
              // value = 'https://files.philadelphiavotes.com/ballot_paper/' + state.sources.electedOfficials.data.rows[0].ballot_file_id + '.pdf';
              value = state.sources.electedOfficials.data.rows[0].ballot_file_id;
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
            return '//vote.phila.gov/voting/vote-by-mail/';
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
            link: 'https://vote.phila.gov/voting/voting-at-the-polls/polling-place-accessibility/',
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
            return '//vote.phila.gov/voting/current-elected-officials/';
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
                council[0].first_name +" " +council[0].last_name + " - " + nth(council[0].district) + " Council District </a>";
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
    {
      type: 'vertical-table',
      options: {
        subtitle: 'voting.topic.redistrictingSubtitle',
        // subtitle: 'Some addresses will be represented by a new city council district starting in 2024. Residents will vote in the new district in the 2023 primary and general elections.',
        nullValue: 'None',
        externalLink: {
          action: function() {
            // return 'Read more about the redistricting process ';
            return 'voting.topic.redistrictingProcess';
          },
          href: function(state) {
            return '//seventy.org/issues-index/council-redistricting';
            // return '//www.philadelphiavotes.com/en/voters/elected-officials';
          },
        },
      },

      slots: {
        title: 'voting.topic.cityCouncilRedistricting',
        fields: [
          {
            label: 'voting.topic.oldCityCouncilDistrict',
            value: function(state) {
              const council = state.sources.electedOfficials.data.rows.filter( function(item) {
                return item.office_label == "City Council";
              });
              return '<a href="http://' + council[0].website + '" target="_blank">' +
                nth(council[0].district) + " Council District </a>";
            },
          },
          {
            label: 'voting.topic.newCityCouncilDistrict',
            value: function(state) {
              const council = state.sources.electedOfficialsFuture.data.rows.filter( function(item) {
                return item.office_label == "City Council";
              });
              return '<a href="http://' + council[0].website + '" target="_blank">' +
                nth(council[0].district) + " Council District </a>";
            },
          },
          // {
          //   label: 'voting.topic.currentTerm',
          //   value: function(state) {
          //     const council = state.sources.electedOfficials.data.rows.filter( function(item) {
          //       return item.office_label == "City Council";
          //     });
          //     return council[0].next_election - 4 + ' - ' + council[0].next_election;
          //   },
          // },
        ],
      },
    }, // end table
    // {
    //   type: 'vertical-table',
    //   options: {
    //     condition: function(state) {
    //       console.log('state:', state);
    //       let og = state.sources.electedOfficials.data.rows.filter( function(item) {
    //         return item.office_label == "City Council";
    //       });
    //       let newVal = state.sources.electedOfficialsFuture.data.rows.filter( function(item) {
    //         return item.office_label == "City Council";
    //       });
    //       console.log('condition test, og:', og, 'newVal:', newVal);
    //
    //       let val = false;
    //       if (og[0].district !== newVal[0].district) {
    //         val = true;
    //       }
    //       return val;
    //     },
    //     nullValue: 'None',
    //     externalLink: {
    //       action: function() {
    //         return 'voting.topic.verticalTable2.link';
    //       },
    //       href: function(state) {
    //         return '//www.philadelphiavotes.com/en/voters/elected-officials';
    //       },
    //     },
    //   },
    //
    //   slots: {
    //     title: 'voting.topic.electedRepFuture',
    //     fields: [
    //       {
    //         label: 'voting.topic.districtCouncilMember',
    //         value: function(state) {
    //           const council = state.sources.electedOfficialsFuture.data.rows.filter( function(item) {
    //             return item.office_label == "City Council";
    //           });
    //           return '<a href="http://' + council[0].website + '" target="_blank">' +
    //             council[0].first_name +" " +council[0].last_name + " - " + nth(council[0].district) + " Council District </a>";
    //         },
    //       },
    //       {
    //         label: 'voting.topic.cityHallOffice',
    //         value: function(state) {
    //           const council = state.sources.electedOfficialsFuture.data.rows.filter( function(item) {
    //             return item.office_label == "City Council";
    //           });
    //           return council[0].main_contact_address_2 + '<br>' +
    //                  phone(council[0].main_contact_phone_1) + ", " + phone(council[0].main_contact_phone_2) + '<br>\
    //                   F: '+ phone(council[0].main_contact_fax) + ' <br>\
    //                   <b><a href=mailto:"' + council[0].email + '">' + council[0].email + '</a></b>';
    //         },
    //       },
    //       {
    //         label: 'voting.topic.term',
    //         value: function(state) {
    //           const council = state.sources.electedOfficialsFuture.data.rows.filter( function(item) {
    //             return item.office_label == "City Council";
    //           });
    //           return council[0].next_election - 4 + ' - ' + council[0].next_election;
    //         },
    //       },
    //     ],
    //   },
    // }, // end table
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
