export default {
  key: 'li',
  icon: 'wrench',
  label: 'Licenses & Inspections',
  dataSources: [
    'divisions',
    'liPermits',
    'liInspections',
    'liViolations',
    'liBusinessLicenses',
    'zoningDocs',
  ],
  components: [
    // {
    //   type: 'exclamationCallout',
    //   slots: {
    //     text: '\
    //       Daily updates of L&I data on Atlas have resumed.\
    //       A data transfer error affecting approximately 5,000 records should be resolved in early May 2020.\
    //     ',
    //   },
    // },
    {
      type: 'callout',
      slots: {
        text: '\
          Licenses, inspections, permits, property maintenance \
          violations, and zoning permit documents at your search address. \
          Source: Department of Licenses & Inspections\
        ',
      },
    },
    {
      type: 'collection-summary',
      options: {
        hide: function(item) {
          console.log('hide function, item:', item);
          let value = false;
          if (item.length == 0) {
            value = true;
          }
          return value;
        },
        descriptor: 'building',
        // this will include zero quantities
        // includeZeroes: true,
        getValue: function(item) {
          // return item.properties.STATUS;
          return 1;
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
            label: 'building',
          },
          // {
          //   value: 2,
          //   label: 'inactive parcel',
          // },
          // {
          //   value: 3,
          //   label: 'remainder parcel',
          // },
        ],
      },
      slots: {
        items: function(state) {
          // return state.parcels.dor.data;
          return state.sources.liBuildingCertSummary.data.rows;
        },
      },
    },
    {
      type: 'tab-group-buildings',
      options: {
        hide: function(item) {
          console.log('hide function, item:', item);
          let value = false;
          if (item.length == 0) {
            value = true;
          }
          return value;
        },
        map: function(state) {
          return state.map;
        },
        getKey: function(item) {
          // return item.properties.OBJECTID;
          // return item.structure_id;
          return item.attributes.BIN;
        },
        getTitle: function(item) {
          // return item.properties.MAPREG;
          // return item.structure_id;
          return item.attributes.BIN;
        },
        getAddress: function(item) {
          var address = helpers.concatDorAddress(item);
          return address;
        },
        activeItem: function(state) {
          return state.activeLiBuilding;
        },
        // components for the content pane. this essentially a topic body.
        components: [],
      }, // end parcel tab options
      slots: {
        items: function (state) {
          if (state.sources.liBuildingFootprints.data && state.sources.liBuildingCerts.data) {
            // console.log('li.js tab-group-buildings, state.sources.liBuildingFootprints.data:', state.sources.liBuildingFootprints.data);
            return state.sources.liBuildingFootprints.data.features.filter(function(item) {
              let buildingCerts = [];
              for (let cert of state.sources.liBuildingCertSummary.data.rows) {
                buildingCerts.push(cert.structure_id);
              }
              let test = buildingCerts.includes(item.attributes.BIN);
              return test;
            });
          }
          // console.log('li.js tab-group-buildings, value:', value);
          return value;
        },
      },
    }, // end tab group comp

    {
      type: 'horizontal-table',
      options: {
        id: 'liBuildingCerts',
        limit: 100,
        fields: [
          {
            label: 'Inspection Type',
            value: function(state, item){
              return item.buildingcerttype;
            },
            nullValue: 'no type available',
            // transforms: [
            //   'date',
            // ],
          },
          {
            label: 'Date Inspected',
            value: function(state, item){
              return item.inspectiondate;
            },
            nullValue: 'no date available',
            transforms: [
              'date',
            ],
          },
          {
            label: 'Inspection Result',
            value: function(state, item){
              return item.inspectionresult;
              // let address = item.address;
              // if (item.unit_num && item.unit_num != null) {
              //   address += ' Unit ' + item.unit_num;
              // }
              // // console.log('li.js adding items, item:', item, 'address:', address);
              // // return "<a target='_blank' href='http://li.phila.gov/#details?entity=permits&eid="+item.permitnumber+"&key="+item.addressobjectid+"&address="+encodeURIComponent(item.address)+"'>"+item.permitnumber+" <i class='fa fa-external-link-alt'></i></a>";
              // return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Permit-Detail?address="+encodeURIComponent(item.address)+"&Id="+item.permitnumber+"'>"+item.permitnumber+" <i class='fa fa-external-link-alt'></i></a>";
            },
          },
          {
            label: 'Expiration Date',
            value: function(state, item){
              return item.expirationdate;
            },
            nullValue: 'no date available',
            transforms: [
              'date',
            ],
          },
          // {
          //   label: 'Status',
          //   value: function(state, item){
          //     return item.status;
          //   },
          // },
        ],
        // sort: {
        //   // this should return the val to sort on
        //   getValue: function(item) {
        //     return item.permitissuedate;
        //   },
        //   // asc or desc
        //   order: 'desc',
        // },
        // externalLink: {
        //   action: function(count) {
        //     return 'See ' + count + ' older permits at L&I Property History';
        //   },
        //   name: 'L&I Property History',
        //   href: function(state) {
        //     var address = state.geocode.data.properties.street_address;
        //     var addressEncoded = encodeURIComponent(address);
        //     return 'https://li.phila.gov/Property-History/search?address=' + addressEncoded;
        //     // return 'http://li.phila.gov/#summary?address=' + addressEncoded;
        //   },
        // },
      },
      slots: {
        title: 'Building Certs',
        items: function(state) {
          var data = state.activeLiBuildingCert;
          // var rows = data.map(function(row){
          //   var itemRow = row;
          //   return itemRow;
          // });
          // return rows;
          return data;
        },
      },
    },
    
    // {
    //   type: 'vertical-table',
    //   slots: {
    //     fields: [
    //       {
    //         label: 'Building ID',
    //         value: function(state) {
    //           return state.activeLiBuilding.structure_id;
    //         },
    //       },
    //       {
    //         label: 'Parcel Address',
    //         value: function(state) {
    //           return state.geocode.data.properties.opa_address;
    //         },
    //       },
    //       {
    //         label: 'Fire Alarm Cert',
    //         value: function(state) {
    //           return state.activeLiBuilding.fire_alarm_status;
    //         },
    //       },
    //       {
    //         label: 'Facade Cert',
    //         value: function(state) {
    //           return state.activeLiBuilding.facade_status;
    //         },
    //       },
    //       {
    //         label: 'Fire Escape Report',
    //         value: function(state) {
    //           return state.activeLiBuilding.fire_escape_status;
    //         },
    //       },
    //       {
    //         label: 'Sprinkler Cert',
    //         value: function(state) {
    //           return state.activeLiBuilding.sprinkler_status;
    //         },
    //       },
    //     ],
    //     items: function (state) {
    //       if (state.sources.liBuildingFootprints.data && state.sources.liBuildingCerts.data) {
    //         // console.log('li.js tab-group-buildings, state.sources.liBuildingFootprints.data:', state.sources.liBuildingFootprints.data);
    //         return state.sources.liBuildingFootprints.data.features.filter(function(item) {
    //           let buildingCerts = [];
    //           for (let cert of state.sources.liBuildingCerts.data.rows) {
    //             buildingCerts.push(cert.structure_id);
    //           }
    //           let test = buildingCerts.includes(item.attributes.BIN);
    //           return test;
    //         });
    //       }
    //       // console.log('li.js tab-group-buildings, value:', value);
    //       return value;
    //     },
    //   },
    //   options: {
    //     id: 'buildingCertData',
    //     hide: function(item) {
    //       console.log('hide function, item:', item);
    //       let value = false;
    //       if (item.length == 0) {
    //         value = true;
    //       }
    //       return value;
    //     },
    //     // requiredSources: ['opa'],
    //     // externalLink: {
    //     //   action: function(count) {
    //     //     return 'See more';
    //     //   },
    //     //   name: 'Property Search',
    //     //   href: function(state) {
    //     //     var id = state.geocode.data.properties.opa_account_num;
    //     //     return 'http://property.phila.gov/?p=' + id;
    //     //   },
    //     // },
    //   },
    // },

    {
      type: 'horizontal-table',
      options: {
        id: 'liPermits',
        limit: 5,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              return item.permitissuedate;
            },
            nullValue: 'no date available',
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
              // console.log('li.js adding items, item:', item, 'address:', address);
              // return "<a target='_blank' href='http://li.phila.gov/#details?entity=permits&eid="+item.permitnumber+"&key="+item.addressobjectid+"&address="+encodeURIComponent(item.address)+"'>"+item.permitnumber+" <i class='fa fa-external-link-alt'></i></a>";
              return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Permit-Detail?address="+encodeURIComponent(item.address)+"&Id="+item.permitnumber+"'>"+item.permitnumber+" <i class='fa fa-external-link-alt'></i></a>";
            },
          },
          {
            label: 'Description',
            value: function(state, item){
              return item.permitdescription;
            },
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.status;
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.permitissuedate;
          },
          // asc or desc
          order: 'desc',
        },
        externalLink: {
          action: function(count) {
            return 'See ' + count + ' older permits at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'https://li.phila.gov/Property-History/search?address=' + addressEncoded;
            // return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          },
        },
      },
      slots: {
        title: 'Permits',
        items: function(state) {
          var data = state.sources['liPermits'].data.rows;
          var rows = data.map(function(row){
            var itemRow = row;
            return itemRow;
          });
          return rows;
        },
      },
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'zoning',
        id: 'zoningDocs',
        // limit: 100,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              let date;
              if (item.scan_date) {
                date = item.scan_date;
              } else if (item.issue_date) {
                date = item.issue_date;
              }
              return date;
            },
            nullValue: 'no date available',
            transforms: [
              'date',
            ],
          },
          {
            label: 'Permit Number',
            value: function(state, item){
              // let permitNumber;
              // if (item.permit_number) {
              //   permitNumber = item.permit_number;
              // } else if (item.permitnumber) {
              //   permitNumber = item.permitnumber;
              // }
              let permitNumber = item.permit_number;
              return permitNumber;
            },
          },
          {
            label: '# Pages',
            value: function(state, item){
              let pages;
              if (item.num_pages) {
                pages = item.num_pages;
              } else if (item.pages_scanned) {
                pages = item.pages_scanned;
              }
              return pages;
            },
          },
          {
            label: 'ID',
            value: function (state, item) {
              // console.log('zoning doc', item);
              let appId;

              if (item.app_id) {
                appId = item.app_id;

                if (appId.length < 3) {
                  appId = '0' + appId;
                }
              }

              let docId, url;
              if (item.doc_id) {
                docId = item.doc_id;
                url = '//s3.amazonaws.com/lni-zoning-pdfs/';
              // } else if (item.externalfilenum ) {
              //   docId = item.externalfilenum ;
              } else if (item.permit_number ) {
                docId = item.permit_number ;
                url = 'http://s3.amazonaws.com/eclipse-docs-pdfs/zoning/';
              }

              return '<a target="_blank" href="' //s3.amazonaws.com/lni-zoning-pdfs/'
                      + url
                      + docId
                      // + item.doc_id
                      + '.pdf">'
                      + docId
                      // + item.doc_id
                      + ' <i class="fa fa-external-link-alt"></i></a>'
                      + '</a>';
              // return item.appid + '-' + item.docid
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            let date;
            if (item.scan_date) {
              date = item.scan_date;
            } else if (item.issue_date) {
              date = item.issue_date;
            }
            return date;
          },
          // asc or desc
          order: 'desc',
        },
      },
      slots: {
        title: 'Zoning Permit Documents',
        subtitle: 'formerly "Zoning Archive"',
        items: function(state) {
          let combinedRows = [];
          let data, rows, itemRow;
          if (state.sources['zoningDocs'].data) {
            if (state.sources['zoningDocs'].data.rows) {
              data = state.sources['zoningDocs'].data.rows;
              rows = data.map(function(row){
                itemRow = row;
                return itemRow;
              });
              for (let singleRow of rows) {
                combinedRows.push(singleRow);
              }
            }
          }
          if (state.sources['zoningDocsEclipse'].data) {
            if (state.sources['zoningDocsEclipse'].data.rows) {
              data = state.sources['zoningDocsEclipse'].data.rows;
              rows = data.map(function(row){
                itemRow = row;
                return itemRow;
              });
              for (let singleRow of rows) {
                combinedRows.push(singleRow);
              }
            }
          }
          return combinedRows;
        },
      },
    },
    {
      type: 'horizontal-table',
      options: {
        topicKey: 'permits',
        id: 'liInspections',
        limit: 5,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              return item.investigationcompleted;
            },
            nullValue: 'no date available',
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
              // console.log('li.js adding items, item:', item, 'address:', address);
              var eclipseLocId = state.geocode.data.properties.eclipse_location_id.split('|');
              var li_address_key = state.geocode.data.properties.li_address_key.split('|');
              var j;
              var str = '';
              for (j = 0; j < li_address_key.length; j++) {
                str += li_address_key[j];
                str += ",";
              }
              var i;
              for (i = 0; i < eclipseLocId.length; i++) {
                str += eclipseLocId[i];
                str += ",";
              }
              str = str.slice(0, str.length - 1);
              // console.log('str:', str);
              // return "<a target='_blank' href='http://li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+str+"&address="+encodeURIComponent(item.address)+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
              return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
            },
          },
          {
            label: 'Description',
            value: function(state, item){
              // return item.inspectiondescription;
              return item.investigationtype;
            },
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.investigationstatus;
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.investigationcompleted;
          },
          // asc or desc
          order: 'desc',
        },
        externalLink: {
          action: function(count) {
            // return `See ${count} older inspections at L&I Property History`;
            return 'See ' + count + ' older inspections at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'https://li.phila.gov/Property-History/search?address=' + addressEncoded;
            // return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          },
        },
      },
      slots: {
        title: 'Inspections',
        items: function(state) {
          var data = state.sources['liInspections'].data.rows;
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            //itemRow.DISTANCE = 'TODO';
            return itemRow;
          });
          // console.log('rows', rows);
          return rows;
        },
      },
    },
    {
      type: 'horizontal-table',
      options: {
        id: 'liViolations',
        limit: 5,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              return item.casecreateddate;
            },
            nullValue: 'no date available',
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
              // console.log('li.js adding items, item:', item, 'address:', address);
              return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
              // return "<a target='_blank' href='http://li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addressobjectid+"&address="+encodeURIComponent(item.address)+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
            },
          },
          {
            label: 'Description',
            value: function(state, item){
              return item.violationcodetitle;
            },
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.violationstatus;
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.casecreateddate;
          },
          // asc or desc
          order: 'desc',
        },
        externalLink: {
          action: function(count) {
            return 'See ' + count + ' older violations at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'https://li.phila.gov/Property-History/search?address=' + addressEncoded;
            // return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          },
        },
      },
      slots: {
        title: 'Violations',
        items: function(state) {
          var data = state.sources['liViolations'].data.rows;
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            //itemRow.DISTANCE = 'TODO';
            return itemRow;
          });
          // console.log('rows', rows);
          return rows;
        },
      },
    },
    {
      type: 'horizontal-table',
      options: {
        id: 'liBusinessLicenses',
        limit: 5,
        fields: [
          {
            label: 'Issue Date',
            value: function(state, item){
              return item.initialissuedate;
            },
            transforms: [
              'date',
            ],
          },
          {
            label: 'License Number',
            value: function(state, item){
              let address = item.address;
              if (item.unit_num && item.unit_num != null) {
                address += ' Unit ' + item.unit_num;
              }
              return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Business-License-Detail?address="+encodeURIComponent(address)+"&Id="+item.licensenum+"'>"+item.licensenum+" <i class='fa fa-external-link-alt'></i></a>";
              // return "<a target='_blank' href='http://li.phila.gov/#details?entity=licenses&eid="+item.licensenum+"&key="+encodeURIComponent(item.street_address)+"&address="+encodeURIComponent(item.street_address)+"'>"+item.licensenum+" <i class='fa fa-external-link-alt'></i></a>";
              // return item.licensenum;
            },
          },
          {
            label: 'Name',
            value: function(state, item){
              return item.business_name;
            },
          },
          {
            label: 'Type',
            value: function(state, item){
              return item.licensetype;
            },
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.licensestatus;
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.initialissuedate;
          },
          // asc or desc
          order: 'desc',
        },
        externalLink: {
          action: function(count) {
            return 'See ' + count + ' older business licenses at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'https://li.phila.gov/Property-History/search?address=' + addressEncoded;
            // return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          },
        },
      },
      slots: {
        title: 'Business Licenses',
        items: function(state) {
          var data = state.sources['liBusinessLicenses'].data.rows;
          var rows = data.map(function(row){
            var itemRow = row;
            // var itemRow = Object.assign({}, row);
            //itemRow.DISTANCE = 'TODO';
            return itemRow;
          });
          // console.log('rows', rows);
          return rows;
        },
      },
    },
  ],
  dynamicMapLayers: [
    //'zoning'
  ],
  // zoomToShape: [ 'geojson' ],
  geojsonForTopic: {
    collection: true,
    activatable: true,
    data: function(state) {
      let value = [];
      if (state.sources.liBuildingFootprints.data && state.sources.liBuildingCertSummary.data) {
        // console.log('li.js geojsonForTopic, state.sources.liBuildingFootprints.data:', state.sources.liBuildingFootprints.data);
        return state.sources.liBuildingFootprints.data.features.filter(function(item) {
          // let firstTest = item.attributes.BIN !== state.activeGeojsonForTopic;
          let buildingCerts = [];
          for (let cert of state.sources.liBuildingCertSummary.data.rows) {
            buildingCerts.push(cert.structure_id);
          }
          let secondTest = buildingCerts.includes(item.attributes.BIN);
          // return firstTest && secondTest;
          return secondTest;
        });
      }
      // console.log('li.js geojsonForTopic, value:', value);
      return value;
    },
    key: 'id',
    style: {
      fillColor: '#bdbadb',
      color: '#bdbadb',
      // fillColor: '#9e9ac8',
      // color: '#9e9ac8',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
    },
  },
  identifyFeature: 'address-marker',
  parcels: 'pwd',
};
