/*
   _____   __  .__
  /  _  \_/  |_|  | _____    ______
 /  /_\  \   __\  | \__  \  /  ___/
/    |    \  | |  |__/ __ \_\___ \
\____|__  /__| |____(____  /____  >
        \/               \/     \/
*/

// import '@babel/polyfill';

// import * as Sentry from '@sentry/browser';
// Sentry.init({ dsn: 'https://276ef359f45543ff91b7db449d3035f8@sentry.io/1330874' });

// Font Awesome Icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome } from '@fortawesome/pro-solid-svg-icons/faHome';
import { faBook } from '@fortawesome/pro-solid-svg-icons/faBook';
import { faWrench } from '@fortawesome/pro-solid-svg-icons/faWrench';
import { faUniversity } from '@fortawesome/pro-solid-svg-icons/faUniversity';
import { faGavel } from '@fortawesome/pro-solid-svg-icons/faGavel';
import { faMapMarkerAlt } from '@fortawesome/pro-solid-svg-icons/faMapMarkerAlt';
import { faLandmark } from '@fortawesome/pro-solid-svg-icons/faLandmark';
import { faBuilding } from '@fortawesome/pro-solid-svg-icons/faBuilding';
library.add(faHome, faBook, faWrench, faUniversity, faGavel, faMapMarkerAlt, faLandmark, faBuilding);

console.log('atlas main.js before importing mapboard');

import accounting from 'accounting';
import axios from 'axios';
import moment from 'moment';

// import test2 from '@cityofphiladelphia/mapboard';
// console.log('test2:', test2);
// import * as test from '@cityofphiladelphia/mapboard';
// console.log('test:', test);
// import { initMapboard } from '@cityofphiladelphia/mapboard';
// console.log('mapboard:', mapboard, 'mapboard.constructor:', mapboard.constructor);
// console.log('initMapboard:', initMapboard);

// import mapboard from '@cityofphiladelphia/mapboard';
import mapboard from '@cityofphiladelphia/mapboard/src/main.js';
console.log('mapboard:', mapboard);

// General Config Modules
import helpers from './util/helpers';
import map from './general/map';
import transforms from './general/transforms';
import parcels from './general/parcels';
import legendControls from './general/legendControls';
import imageOverlayGroups from './general/imageOverlayGroups';
import greeting from './general/greeting';

// data sources
import threeOneOneCarto from './data-sources/311-carto';
import condoList from './data-sources/condo-list';
import crimeIncidents from './data-sources/crime-incidents';
import divisions from './data-sources/divisions';
import dorCondoList from './data-sources/dor-condo-list';
import dorDocuments from './data-sources/dor-documents';
import electedOfficials from './data-sources/elected-officials'
import liBusinessLicenses from './data-sources/li-business-licenses';
import liInspections from './data-sources/li-inspections';
import liPermits from './data-sources/li-permits';
import liViolations from './data-sources/li-violations';
import nearbyZoningAppeals from './data-sources/nearby-zoning-appeals';
import nextElectionAPI from './data-sources/election-next';
import opa from './data-sources/opa';
import pollingPlaces from './data-sources/polling-places';
import rco from './data-sources/rco';
import regmaps from './data-sources/regmaps';
import vacantIndicatorsPoints from './data-sources/vacant-indicator-points';
import zoningAppeals from './data-sources/zoning-appeals';
import zoningBase from './data-sources/zoning-base';
import zoningDocs from './data-sources/zoning-docs';
import zoningOverlay from './data-sources/zoning-overlay';
// import charterSchools from './data-sources/charter-schools';
// import neighboringProperties from './data-sources/neighboring-properties';

// Topics
import property from './topics/property';
import condos from './topics/condos';
import deeds from './topics/deeds';
import li from './topics/li';
import zoning from './topics/zoning';
// import polling from './topics/polling';
// import rcoTopic from './topics/rco';
import nearby from './topics/nearby';
import voting from './topics/voting';

// styles
// TODO move all styles here (that have a npm package)
import 'leaflet/dist/leaflet.css';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-measure/dist/leaflet-measure.css';
// REVIEW not sure why the hard path is necessary for vector icon
// REVIEW the vector icons seem to be working without this - why?
// import '../node_modules/@cityofphiladelphia/mapboard/node_modules/leaflet-vector-icon/dist/leaflet-vector-icon.css';

// turn off console logging in production
// TODO come up with better way of doing this with webpack + env vars
// const { hostname='' } = location;
// if (hostname !== 'localhost' && !hostname.match(/(\d+\.){3}\d+/)) {
//   console.log = console.info = console.debug = console.error = function () {};
// }

var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/ajrothwell/mapboard-base-config@d18a86feb27b7e7c4496ed422ce30b5d80e64c1b/config.js';

// configure accounting.js
accounting.settings.currency.precision = 0;

console.log('calling mapboard');

mapboard({
  // DEV
  // defaultAddress: '1234 MARKET ST',
  // plugin: true,
  panels: [
    'topics',
    'map'
  ],
  router: {
    enabled: true
  },
  defaultAddressTextPlaceholder: {
    // text: "Search Address or 9-digit OPA Property Number",
    wideStyle: {
      'max-width': '100%',
      'font-size': '24px',
      'line-height': '28px'
    },
    narrowStyle: {
      'max-width': '100%',
      'font-size': '20px',
      'line-height': '24px'
    }
  },
  geolocation: {
    enabled: true
  },
  addressInput: {
    width: 415,
    mapWidth: 300,
    position: 'right',
    autocompleteEnabled: false,
    autocompleteMax: 15,
    placeholder: 'Search the map',
  },
  rootStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gatekeeperKey: helpers.GATEKEEPER_KEY,
  map,
  baseConfig: BASE_CONFIG_URL,
  parcels,
  imageOverlayGroups,
  legendControls,
  cyclomedia: {
    enabled: true,
    measurementAllowed: false,
    popoutAble: true,
  },
  pictometry: {
    enabled: false,
  },
  transforms,
  greeting,
  dataSources: {
    threeOneOneCarto,
    condoList,
    crimeIncidents,
    divisions,
    dorCondoList,
    dorDocuments,
    electedOfficials,
    liBusinessLicenses,
    liInspections,
    liPermits,
    liViolations,
    nearbyZoningAppeals,
    nextElectionAPI,
    opa,
    pollingPlaces,
    rco,
    regmaps,
    vacantIndicatorsPoints,
    zoningAppeals,
    zoningBase,
    zoningDocs,
    zoningOverlay,
    // charterSchools,
    // neighboringProperties,
  },
  topics: [
    property,
    condos,
    deeds,
    li,
    zoning,
    // polling,
    // rcoTopic,
    voting,
    nearby,
  ],
  components: [
    {
      type: 'topic-set',
      options: {
        defaultTopic: 'property'
      }
    },
  ],
});
