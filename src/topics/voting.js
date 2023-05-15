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
              // value = state.sources.electedOfficials.data.features[0].ballot_file_id;
              value = 'https://vote.phila.gov/files/SampleBallot/2023_Primary/c530030c-0ceb-4aa9-b8b8-b3ba20d5468e.pdf';
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
              if (state.sources.pollingPlaces.data && state.sources.pollingPlaces.data.attributes) {
                const pollingData = state.sources.pollingPlaces.data.attributes;
                // console.log('state.sources.pollingPlaces.data.rows', state.sources.pollingPlaces.data.rows, 'pollingData:', pollingData);
                return "<b>Ward " + pollingData.WARD +
                ", Division " + pollingData.DIVISION + "</b><br>" +
                titleCase(pollingData.PLACENAME) + "<br>" +
                titleCase(pollingData.STREET_ADDRESS) + "<br>\
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
              if (state.sources.pollingPlaces.data && state.sources.pollingPlaces.data.attributes) {
                const pollingData = state.sources.pollingPlaces.data.attributes;
                const answer = pollingData.ACCESSIBILITY_CODE== "F" ? 'voting.topic.accessibilityCodes.buildingFullyAccessible' :
                  pollingData.ACCESSIBILITY_CODE== "B" ? 'voting.topic.accessibilityCodes.buildingSubstantiallyAccessible' :
                    pollingData.ACCESSIBILITY_CODE== "M" ? 'voting.topic.accessibilityCodes.buildingAccessibilityModified' :
                      pollingData.ACCESSIBILITY_CODE== "A" ? 'voting.topic.accessibilityCodes.alternateEntrance' :
                        pollingData.ACCESSIBILITY_CODE== "R" ? 'voting.topic.accessibilityCodes.buildingAccessibleWithRamp' :
                          pollingData.ACCESSIBILITY_CODE== "N" ? 'voting.topic.accessibilityCodes.buildingNotAccessible' :
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
              const split = state.sources.splits.data.attributes;
              console.log('split:', split);
              const council = state.sources.electedOfficials.data.features.filter( function(item) {
                console.log('item:', item, 'split:', split);
                return item.attributes.OFFICE_LABEL == "City Council" && item.attributes.DISTRICT == split.CITY_DISTRICT;
              });
              console.log('council:', council);
              return '<a href="http://' + council[0].attributes.WEBSITE + '" target="_blank">' +
                council[0].attributes.FIRST_NAME +" " +council[0].attributes.LAST_NAME + " - " + nth(council[0].attributes.DISTRICT) + " Council District </a>";
            },
          },
          {
            label: 'voting.topic.cityHallOffice',
            value: function(state) {
              const split = state.sources.splits.data.attributes;
              const council = state.sources.electedOfficials.data.features.filter( function(item) {
                // return item.office_label == "City Council";
                return item.attributes.OFFICE_LABEL == "City Council" && item.attributes.DISTRICT == split.CITY_DISTRICT;
              });
              return council[0].attributes.MAIN_CONTACT_ADDRESS_2 + '<br>' +
                     phone(council[0].attributes.MAIN_CONTACT_PHONE_1) + ", " + phone(council[0].attributes.MAIN_CONTACT_PHONE_2) + '<br>\
                      F: '+ phone(council[0].attributes.MAIN_CONTACT_FAX) + ' <br>\
                      <b><a href=mailto:"' + council[0].attributes.EMAIL + '">' + council[0].attributes.EMAIL + '</a></b>';
            },
          },
          {
            label: 'voting.topic.currentTerm',
            value: function(state) {
              const split = state.sources.splits.data.attributes;
              const council = state.sources.electedOfficials.data.features.filter( function(item) {
                // return item.office_label == "City Council";
                return item.attributes.OFFICE_LABEL == "City Council" && item.attributes.DISTRICT == split.CITY_DISTRICT;

              });
              return council[0].attributes.NEXT_ELECTION - 4 + ' - ' + council[0].attributes.NEXT_ELECTION;
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
              const split = state.sources.splits.data.attributes;
              const council = state.sources.electedOfficials.data.features.filter( function(item) {
                // return item.office_label == "City Council";
                return item.attributes.OFFICE_LABEL == "City Council" && item.attributes.DISTRICT == split.CITY_DISTRICT;
              });
              return '<a href="http://' + council[0].attributes.WEBSITE + '" target="_blank">' +
                nth(council[0].attributes.DISTRICT) + " Council District </a>";
            },
          },
          {
            label: 'voting.topic.newCityCouncilDistrict',
            value: function(state) {
              const split = state.sources.splits.data.attributes;
              const council = state.sources.electedOfficials.data.features.filter( function(item) {
                // return item.office_label == "City Council";
                return item.attributes.OFFICE_LABEL == "City Council" && item.attributes.DISTRICT == split.CITY_DISTRICT_NEW;
              });
              return '<a href="http://' + council[0].attributes.WEBSITE + '" target="_blank">' +
                nth(council[0].attributes.DISTRICT) + " Council District </a>";
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
        return state.sources.pollingPlaces.data.geometry;
      }
      return null;

    },
    lat: 'y',
    lng: 'x',
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
