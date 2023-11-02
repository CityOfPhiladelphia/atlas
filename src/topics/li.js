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
    'liBuildingFootprints',
    'liBuildingCertSummary',
    'liBuildingCerts',
  ],
  components: [
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
          // console.log('hide function, item:', item);
          // let value = false;
          // if (!item || item && item.length == 0) {
          //   value = true;
          // }
          // return value;
        },
        descriptor: 'building',
        // this will include zero quantities
        getValue: function(item) {
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
        ],
      },
      slots: {
        items: function(state) {
          let value;
          if (state.sources.liBuildingFootprints.data) {
            value = state.sources.liBuildingFootprints.data;
          }
          // let value = [];
          // let data = state.sources.liBuildingFootprints.data;
          // // console.log('Array.isArray(data):', Array.isArray(data));
          // if (data && Array.isArray(data)) {
          //   value = data[0].features;
          //   for (let i=1;i<data.length;i++) {
          //     // console.log('collectionSummary slots value:', value, 'data.length:', data.length, 'data[i]', data[i]);
          //     value = value.concat(data[i].features);
          //   }
          // } else if (data && data.features) {
          //   value = data.features;
          // }
          // // console.log('li.js collectionSummary slots, value:', value);
          return value;
        },
      },
    },
    {
      type: 'tab-group-buildings',
      options: {
        hide: function(item) {
          // console.log('hide function, item:', item);
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
          return item.attributes.BIN;
        },
        getTitle: function(item) {
          return item.attributes.BIN;
        },
        activeItem: function(state) {
          // console.log('activeItem function, state:', state, 'state.activeLiBuildingFootprint.attributes:', state.activeLiBuildingFootprint.attributes);
          return state.activeGeojsonForTopic;
        },
        // components for the content pane. this essentially a topic body.
        components: [
          {
            type: 'vertical-table',
            slots: {
              fields: [
                {
                  label: 'Building ID',
                  value: function(state) {
                    // return state.activeLiBuildingFootprint.attributes.BIN;
                    let value;
                    if (state.activeLiBuildingFootprint.attributes) {
                      value = state.activeLiBuildingFootprint.attributes.BIN || 'N/A';
                    } else {
                      value = 'N/A';
                    }
                    return value;
                  },
                },
                {
                  label: 'Building Name',
                  value: function(state) {
                    // return state.activeLiBuildingFootprint.attributes.BUILDING_NAME || 'N/A';
                    // if (state.activeLiBuildingFootprint.attributes) {
                    //   return state.activeLiBuildingFootprint.attributes.BUILDING_NAME || 'N/A';
                    // }
                    let value;
                    if (state.activeLiBuildingFootprint.attributes) {
                      value = state.activeLiBuildingFootprint.attributes.BUILDING_NAME || 'N/A';
                    } else {
                      value = 'N/A';
                    }
                    return value;
                  },
                },
                {
                  label: 'Parcel Address',
                  value: function(state) {
                    return state.geocode.data.properties.opa_address;
                    //use building footprint address if no AIS opa_address
                  },
                },
                {
                  label: 'Building Height (approx)',
                  value: function(state) {
                    // return state.activeLiBuildingFootprint.attributes.APPROX_HGT + ' ft';
                    // return state.activeLiBuildingFootprint.attributes.APPROX_HGT + ' ft';
                    let value;
                    if (state.activeLiBuildingFootprint.attributes && state.activeLiBuildingFootprint.attributes.APPROX_HGT) {
                      value = state.activeLiBuildingFootprint.attributes.APPROX_HGT + ' ft' || 'N/A';
                    } else {
                      value = 'N/A';
                    }
                    return value;
                  },
                },
                {
                  label: 'Building Footprint (approx)',
                  value: function(state) {
                    // return Math.round(state.activeLiBuildingFootprint.attributes.Shape__Area * 6.3225) + ' sq ft';
                    let value;
                    if (state.activeLiBuildingFootprint.attributes) {
                      value = Math.round(state.activeLiBuildingFootprint.attributes.Shape__Area * 6.3225) + ' sq ft' || 'N/A';
                    } else {
                      value = 'N/A';
                    }
                    return value;
                  },
                },
              ],
            },
            options: {
              id: 'buildingCertData',
            },
          },
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
              ],
              sort: {
                // this should return the val to sort on
                getValue: function(item) {
                  return item.buildingcerttype;
                },
                // asc or desc
                order: 'asc',
                compare: function(a, b) {
                  // console.log('compare function, a:', a, 'b:', b);
                  let result;
                  let typeA = a.buildingcerttype;
                  let typeB = b.buildingcerttype;
                  let dateA = a.inspectiondate;
                  let dateB = b.inspectiondate;

                  if (typeA < typeB) {
                    result = -1;
                  } else if (typeB < typeA) {
                    result = 1;
                  } else {
                    // result = 0;
                    if (dateA < dateB) {
                      result = 1;
                    } else if (dateB < dateA) {
                      result = -1;
                    } else {
                      result = 0;
                    }
                  }
                  return result;
                },
              },
              externalLink: {
                action: function(count, data) {
                  // console.log('building certs count:', count, 'data:', data);
                  return 'See all ' + data + ' building certifications for this property at L&I Property History';
                },
                data: function(state) {
                  // console.log('external link data state.sources.liBuildingCerts.data.length:', state.sources.liBuildingCerts.data.length);
                  return state.sources.liBuildingCerts.data.length;
                },
                forceShow: true,
                name: 'L&I Property History',
                href: function(state) {
                  var address = state.geocode.data.properties.street_address;
                  var addressEncoded = encodeURIComponent(address);
                  return 'https://li.phila.gov/Property-History/search?address=' + addressEncoded;
                },
              },
            },
            slots: {
              title: 'Building Certifications',
              items: function(state) {
                var data = state.activeLiBuildingCert;
                return data;
              },
            },
          },
        ],
      }, // end parcel tab options
      slots: {
        items: function (state) {
          let value = [];
          if (state.sources.liBuildingFootprints.data) {
            value = state.sources.liBuildingFootprints.data;
          }
          return value;
        },
      },
    }, // end tab group comp

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
      if (state.sources.liBuildingFootprints.data) {
        value = state.sources.liBuildingFootprints.data;
      }
      // let data = state.sources.liBuildingFootprints.data;
      // // console.log('Array.isArray(data):', Array.isArray(data));
      // if (data && Array.isArray(data)) {
      //   value = data[0].features;
      //   for (let i=1;i<data.length;i++) {
      //     // console.log('geojsonForTopic value:', value, 'data.length:', data.length, 'data[i]', data[i]);
      //     value = value.concat(data[i].features);
      //   }
      // } else if (data && data.features) {
      //   value = data.features;
      // }
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
