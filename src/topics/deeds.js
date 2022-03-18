import helpers from '../util/helpers';

export default {
  key: 'deeds',
  icon: 'book',
  label: 'Deeds',
  // TODO uncommenting this causes the no-content view to show up.
  // dataSources: ['dorDocuments'],
  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          Deed information and document transactions for this address.\
          The map faithfully reflects property boundaries as described in \
          recorded deeds including multiple types of easements.\
          The property boundaries displayed on the map are for reference \
          only and should not be used in place of the recorded deeds or \
          land surveys. Source: Department of Records\
        ',
      },
    },
    {
      type: 'collection-summary',
      options: {
        descriptor: 'parcel',
        // this will include zero quantities
        // includeZeroes: true,
        getValue: function(item) {
          return item.properties.STATUS;
        },
        context: {
          singular: function(list){
            return 'There is ' + list + ' at this address.';
          },
          plural: function(list){
            return 'There are ' + list + ' at this address.';
          },
        },
        types: [
          {
            value: 1,
            label: 'active parcel',
          },
          {
            value: 2,
            label: 'inactive parcel',
          },
          {
            value: 3,
            label: 'remainder parcel',
          },
        ],
      },
      slots: {
        items: function(state) {
          return state.parcels.dor.data;
        },
      },
    },
    {
      type: 'tab-group',
      options: {
        map: function(state) {
          return state.map;
        },
        getKey: function(item) {
          return item.properties.OBJECTID;
        },
        getTitle: function(item) {
          return item.properties.MAPREG;
        },
        getAddress: function(item) {
          var address = helpers.concatDorAddress(item);
          return address;
        },
        activeItem: function(state) {
          return state.parcels.dor.activeParcel;
        },
        // components for the content pane. this essentially a topic body.
        components: [
          {
            type: 'vertical-table',
            options: {
              nullValue: 'None',
              // id: 'dorData',
            },
            slots: {
              title: 'Parcel Details',
              fields: [
                {
                  label: 'Map Registry #',
                  value: function(state, item) {
                    return item.properties.MAPREG;
                  },
                },
                {
                  label: 'Parcel Address',
                  value: function(state, item) {
                    return helpers.concatDorAddress(item);
                  },
                },
                {
                  label: 'Status',
                  value: function(state, item) {
                    var status = item.properties.STATUS;
                    var desc;
                    switch(status) {
                    case 1:
                      desc = 'Active';
                      break;
                    case 2:
                      desc = 'Inactive';
                      break;
                    case 3:
                      desc = 'Remainder';
                      break;
                    default:
                      break;
                    }
                    return desc;
                  },
                },
                {
                  label: 'Origination Date',
                  value: function(state, item) {
                    return item.properties.ORIG_DATE;
                  },
                  transforms: [
                    'date',
                  ],
                },
                {
                  label: 'Inactive Date',
                  value: function(state, item) {
                    return item.properties.INACTDATE;
                  },
                  transforms: [
                    'date',
                  ],
                },
                {
                  label: 'Has Air Rights',
                  value: function(state, item) {
                    var suffix = item.properties.SUFFIX;
                    return suffix === 'A' ? 'Yes' : 'No';
                  },
                },
                {
                  label: 'Is Condo',
                  value: function(state, item) {
                    if (!item.properties.CONDOFLAG) {
                      return 'No';
                    }
                    return 'Yes';

                    // return item.properties.CONDOFLAG ? 'Yes' : 'No';
                  },
                  // fieldFunction: function(state, item) {
                  //   console.log('state', state);
                  // }
                },
                {
                  label: 'Perimeter',
                  value: function (state, item) {
                    return (item.properties || {})['TURF_PERIMETER'];
                  },
                  transforms: [
                    'integer',
                    'prettyNumber',
                    'feet',
                  ],
                },
                {
                  label: 'Area',
                  value: function(state, item) {
                    return (item.properties || {})['TURF_AREA'];
                  },
                  transforms: [
                    'integer',
                    'prettyNumber',
                    'squareFeet',
                  ],
                },
              ],
            },  // end slots
          },  // end vertical table
          {
            type: 'horizontal-table',
            options: {
              id: 'dorCondoList',
              defaultIncrement: 10,
              showAllRowsOnFirstClick: true,
              showOnlyIfData: true,
              fields: [
                {
                  label: 'Condo Parcel',
                  value: function(state, item) {
                    return item.recmap + '-' + item.condoparcel;
                  },
                },
                {
                  label: 'Condo Name',
                  value: function(state, item) {
                    // return item.attributes.RECORDING_DATE;
                    return item.condo_name;
                  },
                },
                {
                  label: 'Unit #',
                  value: function(state, item) {
                    return 'Unit #' + item.condounit;
                  },
                },
                // {
                //   label: 'Grantor',
                //   value: function(state, item) {
                //     return item.attributes.GRANTORS;
                //   },
                // },
                // {
                //   label: 'Grantee',
                //   value: function(state, item) {
                //     return item.attributes.GRANTEES;
                //   },
                // },
              ], // end fields
              sort: {
                // this should return the val to sort on
                getValue: function(item) {
                  // return item.attributes.RECORDING_DATE;
                  return item.condounit;
                },
                // asc or desc
                order: 'asc',
              },
            },
            slots: {
              title: 'Deeded Condominiums',
              items: function (state, item) {
                var id = item.properties.OBJECTID;

                if (state.sources.dorCondoList.targets[id]) {
                  if (state.sources.dorCondoList.targets[id].data) {
                    return state.sources.dorCondoList.targets[id].data.rows;
                  }
                } else {
                  return [];
                }
              },
            }, // end slots
          }, // end condos table

          {
            type: 'callout',
            slots: {
              // text: 'You can access digital copies of the deeds \
              //   below by purchasing a subscription to \
              //   <a target="_blank" href="http://epay.phila-records.com/phillyepay/web/">PhilaDox <i class="fa fa-external-link-alt"></i></a></a>.\
              //   Please note that the following list\
              //   shows documents recorded from\
              //   December 1999 forward, and may not be a complete history\
              //   of title for the parcel.\
              // ',
              text: 'You can access a view-only, watermarked unofficial copy \
              of the deeds below at no cost by clicking on the deeds below. \
              In order to view and print non-watermarked copies of the deeds below, \
              you must purchase a subscription to \
              <a target="_blank" href="http://epay.phila-records.com/phillyepay/web/">PhilaDox <i class="fa fa-external-link-alt"></i></a></a>.\
              Please note that the following list \
              shows documents recorded from December 1999 forward, and may not \
              be a complete history of title for the parcel.\
              ',
            },
          },

          {
            type: 'horizontal-table',
            options: {
              id: 'dorDocuments',
              defaultIncrement: 25,
              fields: [
                {
                  label: 'ID',
                  value: function (state, item) {
                    // return "<a target='_blank' href='//pdx-app01/recorder/eagleweb/viewDoc.jsp?node=DOCC"+item.attributes.R_NUM+"'>"+item.attributes.R_NUM+"<i class='fa fa-external-link-alt'></i></a>"
                    // return item.document_id;
                    // return item.attributes.DOCUMENT_ID;

                    // return "<a target='_blank' href='http://epay.phila-records.com/phillyepay/web/integration/document/?AllDocuments=True&Guest=true&DocumentNumberID="+item.attributes.DOCUMENT_ID+"'>"+item.attributes.DOCUMENT_ID+"<i class='fa fa-external-link-alt'></i></a>";
                    return "<a target='_blank' href='http://epay.phila-records.com/phillyepay/web/integration/document/InstrumentID="+item.attributes.DOCUMENT_ID+"&Guest=true'>"+item.attributes.DOCUMENT_ID+"<i class='fa fa-external-link-alt'></i></a>";
                  },
                },
                {
                  label: 'Date',
                  value: function(state, item) {
                    // return item.attributes.RECORDING_DATE;
                    // return item.display_date;
                    return item.attributes.DISPLAY_DATE;
                  },
                  nullValue: 'no date available',
                  transforms: [
                    'date',
                  ],
                },
                {
                  label: 'Type',
                  value: function(state, item) {
                    // return item.document_type;
                    return item.attributes.DOCUMENT_TYPE;
                  },
                },
                {
                  label: 'Grantor',
                  value: function(state, item) {
                    // return item.grantors;
                    return item.attributes.GRANTORS;
                  },
                },
                {
                  label: 'Grantee',
                  value: function(state, item) {
                    // return item.grantees;
                    return item.attributes.GRANTEES;
                  },
                },
              ], // end fields
              sort: {
                // this should return the val to sort on
                getValue: function(item) {
                  // return item.attributes.RECORDING_DATE;
                  // console.log('dor docs sort function running, display_date:', Date.parse(item.display_date));
                  return item.attributes.DISPLAY_DATE;
                  // return Date.parse(item.display_date);
                },
                // asc or desc
                order: 'desc',
              },
            },
            slots: {
              title: 'Documents',
              // defaultIncrement: 25,
              items: function(state, item) {
                var id = item.properties.OBJECTID;
                if (state.sources.dorDocuments.targets[id]) {
                  return state.sources.dorDocuments.targets[id].data;
                }
                return [];

              },
            }, // end slots

          }, // end docs table
        ], // end parcel tab content comps
      }, // end parcel tab options
      slots: {
        items: function (state) {
          return state.parcels.dor.data;
        },
      },
    }, // end dor parcel tab group comp
    {
      type: 'callout',
      slots: {
        text: '\
          Use the buttons below to view images of hard-copy deed maps, some\
          of which have handwritten information that may be useful for\
          historical deed research.\
        ',
      },
    },
    // {
    //   type: 'exclamationCallout',
    //   slots: {
    //     text: 'Due to a technical issue, regmaps are currently unavailable.  We are working to resolve the issue.',
    //   },
    // },
    {
      type: 'overlay-toggle-group',
      options: {
        getKey: function(item) {
          return item.properties.RECMAP;
        },
      },
      slots: {
        title: 'Registry Maps',
        items: function(state) {
          return state.sources.regmaps.data;
        },
      },
    },
    // {
    //   type: 'callout',
    //   slots: {
    //     text: 'The property boundaries displayed on the map are for reference only and may not be used in place of recorded deeds or land surveys. Source: Department of Records.'
    //   }
    // }
  ], // end deeds comps
  identifyFeature: 'dor-parcel',
  parcels: 'dor',
  imageOverlayGroup: 'regmaps',
};
