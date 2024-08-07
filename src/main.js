/*
   _____   __  .__
  /  _  \_/  |_|  | _____    ______
 /  /_\  \   __\  | \__  \  /  ___/
/    |    \  | |  |__/ __ \_\___ \
\____|__  /__| |____(____  /____  >
        \/               \/     \/
*/

// turn off console logging in production
const { hostname='' } = location;
if (hostname !== 'localhost' && !hostname.match(/(\d+\.){3}\d+/)) {
  console.log = console.info = console.debug = console.error = function () {};
}

console.warn = function(){
  let warning = '%cWARNING: ' + arguments[0];
  if (!arguments[0].includes('[vue-i18n]')) {
    console.log(warning, 'background-color: #FEF3DC;');
  }
};

import i18n from './i18n/i18n.js';

// Font Awesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDotCircle } from '@fortawesome/free-regular-svg-icons/faDotCircle';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faWrench } from '@fortawesome/free-solid-svg-icons/faWrench';
import { faUniversity } from '@fortawesome/free-solid-svg-icons/faUniversity';
import { faGavel } from '@fortawesome/free-solid-svg-icons/faGavel';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';
import { faLandmark } from '@fortawesome/free-solid-svg-icons/faLandmark';
import { faBuilding } from '@fortawesome/free-solid-svg-icons/faBuilding';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
library.add(faDotCircle, faHome, faBook, faWrench, faUniversity, faGavel, faMapMarkerAlt, faLandmark, faBuilding, faExclamationTriangle);

import accounting from 'accounting';
import mapboard from '@phila/mapboard/src/main.js';

// General Config Modules
import helpers from './util/helpers';
import map from './general/map';
// import mbStyle from './general/mbStyle';
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
import electedOfficials from './data-sources/elected-officials';
import electionSplits from './data-sources/election-splits';
// import electedOfficialsFuture from './data-sources/elected-officials-future';
import liBusinessLicenses from './data-sources/li-business-licenses';
import liBuildingCertSummary from './data-sources/li-building-cert-summary';
import liBuildingCerts from './data-sources/li-building-certs';
import liInspections from './data-sources/li-inspections';
import liPermits from './data-sources/li-permits';
import liViolations from './data-sources/li-violations';
import liBuildingFootprints from './data-sources/li-building-footprints';
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
import zoningDocsEclipse from './data-sources/zoning-docs-eclipse';
import zoningOverlay from './data-sources/zoning-overlay';
import nearbyPermits from './data-sources/nearby-permits.js';
import nearbyViolations from './data-sources/nearby-violations.js';
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

import exclamationCallout from './components/ExclamationCallout';
import exclamationContentTopic from './components/ExclamationContentTopic';
import exclamationContentGreeting from './components/ExclamationContentGreeting';
import greetingVoting from './components/GreetingVoting';
import i18nBanner from '@phila/mapboard/src/components/i18nBanner.vue';

const customComps = {
  'exclamationCallout': exclamationCallout,
  'exclamationContentTopic': exclamationContentTopic,
  'exclamationContentGreeting': exclamationContentGreeting,
  'greetingvoting': greetingVoting,
  'i18nBanner': i18nBanner,
};

// import 'phila-standards/dist/css/phila-app.min.css';
// import './styles.css';

var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/cityofphiladelphia/mapboard-default-base-config@9e29bae288deda916df98e377bdff2303706cda9/config.js';

// configure accounting.js
accounting.settings.currency.precision = 0;

let pictApiKey, pictSecretKey;
const host = window.location.hostname;
if (host === 'cityatlas-dev.phila.gov') {
  pictApiKey = process.env.VUE_APP_DEV_PICTOMETRY_API_KEY;
  pictSecretKey = process.env.VUE_APP_DEV_PICTOMETRY_SECRET_KEY;
} else {
  pictApiKey = process.env.VUE_APP_PICTOMETRY_API_KEY;
  pictSecretKey = process.env.VUE_APP_PICTOMETRY_SECRET_KEY;
}

// console.log('atlas main.js about to call mapboard');

mapboard({
  // defaultAddress: '1234 MARKET ST',
  // plugin: true,
  agoTokenNeeded: false,
  resetDataOnGeocode: true,
  resetDataExtra: {
    'ActiveLiBuilding': {},
    'ActiveLiBuildingCert': [],
  },
  customComps,
  header: {
    enabled: true,
    text: 'Atlas',
  },
  panels: [
    'topics',
    'map',
  ],
  router: {
    enabled: true,
    type: 'vue',
    // returnToDefaultTopicOnGeocode: false,
  },
  defaultAddressTextPlaceholder: {
    // text: "Search Address or 9-digit OPA Property Number",
    wideStyle: {
      'max-width': '100%',
      'font-size': '24px',
      'line-height': '28px',
    },
    narrowStyle: {
      'max-width': '100%',
      'font-size': '20px',
      'line-height': '24px',
    },
  },
  geolocation: {
    enabled: true,
    icon: [ 'far', 'dot-circle' ],
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
  gatekeeperKey: process.env.VUE_APP_GATEKEEPER_KEY,
  map,
  mbStyle: {
    glyphs: '//fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  },
  // mbStyle,
  baseConfig: BASE_CONFIG_URL,
  parcels,
  imageOverlayGroups,
  legendControls,
  cyclomedia: {
    enabled: true,
    // orientation: 'horizontal',
    measurementAllowed: false,
    popoutAble: true,
    // recordingsUrl: 'https://atlas.cyclomedia.com/Recordings/wfs',
    recordingsUrl: 'https://atlasapi.cyclomedia.com/api/recording/wfs',
    username: process.env.VUE_APP_CYCLOMEDIA_USERNAME,
    password: process.env.VUE_APP_CYCLOMEDIA_PASSWORD,
    apiKey: process.env.VUE_APP_CYCLOMEDIA_API_KEY,
  },
  pictometry: {
    enabled: true,
    orientation: 'horizontal',
    iframeId: 'pictometry-ipa',
    apiKey: pictApiKey,
    secretKey: pictSecretKey,
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
    electionSplits,
    // electedOfficialsFuture,
    liBusinessLicenses,
    liBuildingCertSummary,
    liBuildingCerts,
    liInspections,
    liPermits,
    liViolations,
    liBuildingFootprints,
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
    zoningDocsEclipse,
    zoningOverlay,
    nearbyPermits,
    nearbyViolations,
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
  defaultTopic: 'property',
  components: [
    {
      type: 'topic-set',
      options: {
        defaultTopic: 'property',
      },
    },
  ],
  i18n: i18n.i18n,
});
