export default {
  key: 'li',
  icon: 'wrench',
  label: 'Licenses & Inspections',
  dataSources: [
    'liPermits',
    'liInspections',
    'liViolations',
    'liBusinessLicenses',
    'zoningDocs'
  ],
  components: [
    {
      type: 'callout',
      slots: {
        text: '\
          Licenses, inspections, permits, property maintenance \
          violations, and zoning permit documents at your search address. \
          Source: Department of Licenses & Inspections\
        '
      }
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
              return item.permitissuedate
            },
            nullValue: 'no date available',
            transforms: [
              'date'
            ]
          },
          {
            label: 'ID',
            value: function(state, item){
              return "<a target='_blank' href='http://li.phila.gov/#details?entity=permits&eid="+item.permitnumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.permitnumber+" <i class='fa fa-external-link'></i></a>"
            }
          },
          {
            label: 'Description',
            value: function(state, item){
              return item.permitdescription
            }
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.status
            }
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.permitissuedate;
          },
          // asc or desc
          order: 'desc'
        },
        externalLink: {
          action: function(count) {
            return 'See ' + count + ' older permits at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          }
        }
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
              return item.scan_date
            },
            nullValue: 'no date available',
            transforms: [
              'date'
            ]
          },
          {
            label: 'Permit Number',
            value: function(state, item){
              return item.permit_number
            }
          },
          // {
          //   label: 'Type',
          //   value: function(state, item){
          //     return item.doc_type
          //   }
          // },
          {
            label: '# Pages',
            value: function(state, item){
              return item.num_pages
            }
          },
          {
            label: 'ID',
            value: function (state, item) {
              // console.log('zoning doc', item);

              var appId = item.app_id;

              if (appId.length < 3) {
                appId = '0' + appId;
              }

              return '<a target="_blank" class="external" href="//s3.amazonaws.com/lni-zoning-pdfs/'
                      + item.doc_id
                      + '.pdf">'
                      + item.doc_id
                      // + '<i class='fa fa-external-link'></i></a>'
                      + '</a>'
              // return item.appid + '-' + item.docid
            }
          },
          // {
          //   label: 'Link',
          //   value: function(state, item){
          //     // return "<a href='//www.washingtonpost.com/'>View Scan</a>"
          //     return "<a target='_blank' href='//www.phila.gov/zoningarchive/Preview.aspx?address=" + item.address + "&&docType=" + item.doctype + "&numofPages=" + item.page_numbers + "&docID=" + item.docid + "&app=" + item.appid +"'>View Scan <i class='fa fa-external-link'></i></a>"
          //   }
          // },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.scan_date;
          },
          // asc or desc
          order: 'desc'
        },
      },
      slots: {
        title: 'Zoning Permit Documents',
        subtitle: 'formerly "Zoning Archive"',
        items: function(state) {
          if (state.sources['zoningDocs'].data) {
            if (state.sources['zoningDocs'].data.rows) {
              var data = state.sources['zoningDocs'].data.rows;
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
      type: 'horizontal-table',
      options: {
        topicKey: 'permits',
        id: 'liInspections',
        limit: 5,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              return item.inspectioncompleted
            },
            nullValue: 'no date available',
            transforms: [
              'date'
            ]
          },
          {
            label: 'ID',
            value: function(state, item){
              return "<a target='_blank' href='http://li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
              // return item.casenumber
            }
          },
          {
            label: 'Description',
            value: function(state, item){
              return item.inspectiondescription
            }
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.inspectionstatus
            }
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.inspectioncompleted;
          },
          // asc or desc
          order: 'desc'
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
            return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          }
        }
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
              return item.caseaddeddate
            },
            nullValue: 'no date available',
            transforms: [
              'date'
            ]
          },
          {
            label: 'ID',
            value: function(state, item){
              return "<a target='_blank' href='http://li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
              // return item.casenumber
            }
          },
          {
            label: 'Description',
            value: function(state, item){
              return item.violationdescription
            }
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.status
            }
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.caseaddeddate;
          },
          // asc or desc
          order: 'desc'
        },
        externalLink: {
          action: function(count) {
            return 'See ' + count + ' older violations at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          }
        }
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
              return item.initialissuedate
            },
            transforms: [
              'date'
            ]
          },
          {
            label: 'License Number',
            value: function(state, item){
              return "<a target='_blank' href='http://li.phila.gov/#details?entity=licenses&eid="+item.licensenum+"&key="+item.street_address+"&address="+item.street_address+"'>"+item.licensenum+" <i class='fa fa-external-link'></i></a>"
              return item.licensenum
            }
          },
          {
            label: 'Name',
            value: function(state, item){
              return item.business_name
            }
          },
          {
            label: 'Type',
            value: function(state, item){
              return item.licensetype
            }
          },
          {
            label: 'Status',
            value: function(state, item){
              return item.licensestatus
            }
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.caseaddeddate;
          },
          // asc or desc
          order: 'desc'
        },
        externalLink: {
          action: function(count) {
            return 'See ' + count + ' older business licenses at L&I Property History';
          },
          name: 'L&I Property History',
          href: function(state) {
            var address = state.geocode.data.properties.street_address;
            var addressEncoded = encodeURIComponent(address);
            return 'http://li.phila.gov/#summary?address=' + addressEncoded;
          }
        }
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
  parcels: 'pwd'
}
