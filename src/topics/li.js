export default {
  key: 'li',
  icon: 'wrench',
  label: 'Licenses & Inspections',
  dataSources: [
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
  identifyFeature: 'address-marker',
  parcels: 'pwd',
};
