var app = app || {};

 app.config = {
  ais: {
    // url: '//api.phila.gov/ais/v1/addresses/',
    url: '//api.phila.gov/ais/v1/search/',
    gatekeeperKey: '82fe014b6575b8c38b44235580bc8b11',
    betsyKey: '35ae5b7bf8f0ff2613134935ce6b4c1e',
    // include_units: true,
  },
  // l&i config, denormalized by section for convenience
  li: {
    socrataIds: {
      'permits':          'uukf-7jf3',
      'appeals':          '3tq7-6fj4',
      'inspections':      'fypy-ek77',
      'violations':       'cctq-fx48',
    },
    // maps internal names to socrata fields. conveniently, these all have
    // (essentially) the same set of fields so the names can be consistent.
    // (id, date, description, status)
    fieldMap: {
      'permits': {
        'id':                 'permitnumber',
        'date':               'permitissuedate',
        'description':        'permitdescription',
        'status':             'status',
      },
      'appeals': {
        'id':                 'appealkey',
        'date':               'processeddate',
        'description':        'appealgrounds',
        'status':             'decision',
      },
      'inspections': {
        'id':                 'apinspkey',
        'date':               'inspectioncompleted',
        'description':        'inspectiondescription',
        'status':             'inspectionstatus',
      },
      'violations': {
        'id':                 'apfailkey',
        'date':               'violationdate',
        'description':        'violationdescription',
        'status':             'status',
      },
    },
    // for sorting l&i records
    // dateFields: {
    //   'permits':          'permitissuedate',
    //   'appeals':          'processeddate',
    //   'inspections':      'inspectioncompleted',
    //   'violations':       'violationdate',
    // },
    // these are the columns to show in each l&i section (using mapped
    // field names)
    // displayFields: {
    //   'permits':          ['issuedDate', 'id', 'description', 'status'],
    //   'appeals':          ['processedDate', 'id', 'grounds', 'decision'],
    //   'inspections':      ['completedDate', 'id', 'description', 'status'],
    //   'violations':       ['recordedDate', 'id', 'description', 'status'],
    // },
    displayFields:        ['date', 'id', 'description', 'status',],
  },

  nearby: {
    activityTypes: [
      {
        label: '311 Requests',
        socrataId: '4t9v-rppq',
        fieldMap: {
          date: 'requested_datetime',
          location: 'address',
          description: 'service_name',
          // geom:
        },
      },
      {
        label: 'Crime Incidents',
        socrataId: 'sspu-uyfa',
        fieldMap: {
          date: 'dispatch_date_time',
          location: 'location_block',
          description: 'text_general_code',
        },
      },
      {
        label: 'Zoning Appeals',
        socrataId: '3tq7-6fj4',
        fieldMap: {
          date: 'processeddate',
          location: 'address',
          description: 'appealgrounds',
        },
      },
    ],
    radius: 500,
  },

  map: {
    opacitySliders: {
      regmap: {
        defaultOpacity: 0.5,
      },
      zoning: {
        defaultOpacity: 1.0,
      },
      water: {
        defaultOpacity: 1.0,
      },
    }
  },

  topicRecordLimit: 5,

  //parcelLayerUrl: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0',
  esri: {
    tiledLayers: {
      baseMapLight: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
        type: 'base',
        zIndex: 1,
      },
      baseMapDORParcels: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap/MapServer',
        type: 'base',
        zIndex: 1,
      },
      baseMapImagery2016: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      baseMapImagery2015: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      baseMapImagery2012: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2012_3in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      baseMapImagery2010: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2010_3in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      baseMapImagery2008: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2008_3in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      baseMapImagery2004: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2004_6in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      baseMapImagery1996: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_1996_6in/MapServer',
        type: 'base',
        zIndex: 2,
      },
      parcels: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ParcleTile/MapServer',
        type: 'overlay',
        zIndex: 3,
      },
      overlayBaseLabels: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
        type: 'overlayBaseLabels',
        zIndex: 10,
      },
      overlayBaseDORLabels: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap_Labels/MapServer',
        type: 'overlayBaseLabelsDOR',
        zIndex: 10,
      },
      overlayImageryLabels: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer',
        type: 'overlayImageryLabels',
        zIndex: 10,
      },
    },
    dynamicLayers: {
      zoning: {
        url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer',
        type: 'overlay',
        zIndex: 4,
      },
      water: {
        url: '//gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer',
        type: 'overlay',
        zIndex: 4,
      },
      politicalDivisions: {
        url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
        type: 'overlay',
        zIndex: 4,
      },
      regmap: {
        url: '//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/0',
        type: 'overlay',
        zIndex: 4,
      },
    },
    otherLayers: {
      parcelLayerDOR: {
        url: '//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/24',
      },
      parcelLayerWater: {
        url: '//gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer/0',
      },
      divisionLayer: {
        url: '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
      },
    },
  },

  pictometry: {},
  cyclomedia: {
    username: 'maps@phila.gov',
    password: 'mapscyc01',
    apiKey: 'GfElS3oRuroNivgtibsZqDkpCvItyPUNuv0NmXglen8puXoJanEVarsZyns9ynkJ',
  },

  // socrataAppToken: 'bHXcnyGew4lczXrhTd7z7DKkc',
  // socrataAppToken: 'wEPcq2ctcmWapPW7v6nWp7gg4',
  socrata: {
    baseUrl: '//data.phila.gov/resource/',
  },
}
