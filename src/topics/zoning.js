import helpers from '../util/helpers';

export default {
  key: 'zoning',
  icon: 'university',
  label: 'Zoning',
  dataSources: [
    'zoningOverlay',
    'zoningBase',
    // 'zoningAppeals',
    // 'rco',
  ],
  components: [
    {
      type: 'callout',
      slots: {
        text: 'Base district zoning maps, associated zoning overlays, and Registered Community Organizations applicable to your search address. Source: Department of Planning and Development',
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
            type: 'badge-custom',
            options: {
              titleBackground: '#58c04d',
              components: [
                {
                  type: 'horizontal-table',
                  options: {
                    topicKey: 'zoning',
                    shouldShowFilters: false,
                    shouldShowHeaders: false,
                    id: 'baseZoning',
                    // defaultIncrement: 10,
                    // showAllRowsOnFirstClick: true,
                    // showOnlyIfData: true,
                    fields: [
                      {
                        label: 'Code',
                        value: function (state, item) {
                          return item.code;
                        },
                        transforms: [
                          'nowrap',
                          'bold',
                        ],
                      },
                      {
                        label: 'Description',
                        value: function (state, item) {
                          return helpers.ZONING_CODE_MAP[item.code];
                        },
                      },
                    ], // end fields
                  },
                  slots: {
                    // title: 'Base Zoning',
                    items(state, item) {
                      // console.log('state.sources:', state.sources['zoningBase'].data.rows);
                      const id = item.properties.OBJECTID;
                      const target = state.sources.zoningBase.targets[id] || {};
                      const { data={}} = target;
                      const { rows=[]} = data;

                      // get unique zoning codes
                      const longCodes = rows.map(row => row.long_code);
                      const longCodesUniqueSet = new Set(longCodes);
                      let longCodesUnique = [];
                      // const longCodesUnique = Array.from(longCodesUniqueSet);
                      for (let code of longCodesUniqueSet) {
                        longCodesUnique.push(
                          { 'code': code },
                        );
                      }
                      return longCodesUnique;
                    },
                  }, // end slots
                }, // end table
              ],
            },
            slots: {
              title: 'Base District',
            },
          }, // end of badge-custom
          {
            type: 'horizontal-table',
            options: {
              topicKey: 'zoning',
              // shouldShowFilters: false,
              id: 'baseZoning',
              // defaultIncrement: 10,
              // showAllRowsOnFirstClick: true,
              // showOnlyIfData: true,
              fields: [
                {
                  label: 'Bill Type',
                  value: function (state, item) {
                    return item.billType;
                  },
                },
                {
                  label: 'Current Zoning',
                  value: function(state, item) {
                    return item.currentZoning;
                  },
                },
                {
                  label: 'Pending Bill',
                  value: function (state, item) {
                    return `<a target="_blank" href="${item.pendingbillurl}">${item.pendingbill} <i class="fa fa-external-link-alt"></i></a>`;
                  },
                },
              ], // end fields
            },
            slots: {
              title: 'Pending Bills',
              items: function(state, item) {
                // console.log('in Pending Bills, state:', state, 'item:', item);
                // console.log('state.sources:', state.sources['zoningBase'].data.rows);
                var id = item.properties.OBJECTID,
                  target = state.sources.zoningBase.targets[id] || {},
                  data = target.data || {};

                // include only rows where pending is true
                const { rows=[]} = data;
                const rowsFiltered = rows.filter(row => row.pending === 'Yes');

                // give each pending zoning bill a type of "zoning"
                const rowsFilteredWithType = rowsFiltered.map((row) => {
                  row.billType = 'Base District';
                  row.currentZoning = row.long_code;
                  return row;
                });

                let overlayRowsFilteredWithType = [];

                // append pending overlays
                if (state.sources.zoningOverlay.targets[id]) {
                  const overlayRows = state.sources.zoningOverlay.targets[id].data.rows;
                  const overlayRowsFiltered = overlayRows.filter(row => row.pending === 'Yes');
                  overlayRowsFilteredWithType = overlayRowsFiltered.map((row) => {
                    row.billType = 'Overlay';
                    row.currentZoning = row.overlay_name;
                    return row;
                  });
                } else {
                  overlayRowsFilteredWithType = [];
                }

                // combine pending zoning and overlays
                const zoningAndOverlays = rowsFilteredWithType.concat(overlayRowsFilteredWithType);

                return zoningAndOverlays;
              },
            }, // end slots
          }, // end table
          {
            type: 'horizontal-table',
            options: {
              topicKey: 'zoning',
              id: 'zoningOverlay',
              fields: [
                {
                  label: 'Name',
                  value: function (state, item) {
                    return item.overlay_name;
                  },
                },
                {
                  label: 'Code Section',
                  value: function (state, item) {
                    return "<a target='_blank' href='"+item.code_section_link+"'>"+item.code_section+" <i class='fa fa-external-link-alt'></i></a>";
                  },
                },
              ],
            },
            slots: {
              title: 'Overlays',
              items: function(state, item) {
                var id = item.properties.OBJECTID,
                  target = state.sources.zoningOverlay.targets[id] || {},
                  data = target.data || {};
                // console.log('zoningbase target:', target);
                return data.rows || [];
              },
            },
          },
        ], // end of tab-group components
      },
      slots: {
        items: function (state) {
          // return state.dorParcels.data;
          return state.parcels.dor.data;
        },
      },
    },
    {
      type: 'horizontal-table',
      options: {
        id: 'zoningAppeals',
        fields: [
          {
            label: 'Processed Date',
            value: function(state, item) {
              return item.createddate;
            },
            transforms: [
              'date',
            ],
          },
          {
            label: 'ID',
            value: function(state, item){
              let address = item.address;
              if (item.unit_num && item.unit_num != null) {
                address += ' Unit ' + item.unit_num;
              }
              // console.log('zoning.js adding items, item:', item, 'address:', address);

              //return item.appeal_key
              // return "<a target='_blank' href='//li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>"
              // return "<a target='_blank' href='http://li.phila.gov/#details?entity=appeals&eid="+item.internaljobid+"&key="+item.addressobjectid+"&address="+encodeURIComponent(item.address)+"'>"+item.appealnumber+"<i class='fa fa-external-link-alt'></i></a>";
              return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Appeal-Detail?address="+encodeURIComponent(address)+"&Id="+item.appealnumber+"'>"+item.appealnumber+"<i class='fa fa-external-link-alt'></i></a>";

            },
          },
          {
            label: 'Description',
            value: function(state, item){
              return item.appealgrounds;
            },
          },
          {
            label: 'Scheduled Date',
            value: function(state, item) {
              return item.scheduleddate;
            },
            transforms: [
              'date',
            ],
          },
          {
            label: 'Status',
            value: function(state, item){
              // return item.properties.CODE_SECTION
              return item.decision;
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.scheduleddate;
          },
          // asc or desc
          order: 'desc',
        },
      },
      slots: {
        title : 'Appeals',
        items: function(state) {
          if (state.sources['zoningAppeals'].data) {
            if (state.sources['zoningAppeals'].data.rows) {
              var data = state.sources['zoningAppeals'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              return rows;
            }
          }
        },
      },
    },
    {
      type: 'callout',
      slots: {
        text: 'Looking for zoning documents? They are now located in the Licenses & Inspections tab under "Zoning Permit Documents".',
      },
    },
    {
      type: 'horizontal-table',
      options: {
        id: 'rco',
        fields: [
          {
            label: 'RCO',
            value: function(state, item) {
              return '<b>' + item.properties.ORGANIZATION_NAME + '</b><br>'
              + item.properties.ORGANIZATION_ADDRESS;
            },
          },
          {
            label: 'Meeting Address',
            value: function(state, item) {
              return item.properties.MEETING_LOCATION_ADDRESS;
            },
          },
          {
            label: 'Primary Contact',
            value: function(state, item) {
              // return item.properties.PRIMARY_PHONE
              return item.properties.PRIMARY_NAME + '<br>'
              + item.properties.PRIMARY_PHONE + '<br>'
              // + `<b><a :href="'mailto:' + item.properties.PRIMARY_EMAIL">`
              + item.properties.PRIMARY_EMAIL;// + '</a></b>'
            },
            transforms: [
              'rcoPrimaryContact',
            ],
          },
          {
            label: 'Preferred Method',
            value: function(state, item){
              return item.properties.PREFFERED_CONTACT_METHOD;
            },
          },
        ],
        externalLink: {
          forceShow: true,
          action: function() {
            return 'See a list of all RCOs in the city [PDF]';
          },
          name: '',
          href: function(state) {
            // var address = state.geocode.data.properties.street_address;
            // var addressEncoded = encodeURIComponent(address);
            // return '//www.phila.gov/CityPlanning/projectreviews/RCO%20Related/List_of_RCOs.pdf';
            return '//www.phila.gov/documents/registered-community-organization-rco-materials/';
          },
        },
      },
      slots: {
        title: 'Registered Community Organizations',
        items: function(state) {
          if (state.sources['rco'].data) {
            var data = state.sources['rco'].data;
            var rows = data.map(function(row){
              var itemRow = row;
              // var itemRow = Object.assign({}, row);
              return itemRow;
            });
            return rows;
          }
        },
      },
    },
  ],
  dynamicMapLayers: [
    'zoning',
  ],
  identifyFeature: 'dor-parcel',
  parcels: 'dor',
};
