/*
   _____   __  .__
  /  _  \_/  |_|  | _____    ______
 /  /_\  \   __\  | \__  \  /  ___/
/    |    \  | |  |__/ __ \_\___ \
\____|__  /__| |____(____  /____  >
        \/               \/     \/
*/

import accounting from 'accounting';
import axios from 'axios';
import moment from 'moment';
import mapboard from '@cityofphiladelphia/mapboard';


// General Config Modules
import helpers from './util/helpers';
import map from './config/map';
import dataSources from './config/dataSources';
import parcels from './config/parcels';
import legendControls from './config/legendControls';
import transforms from './config/transforms';
import imageOverlayGroups from './config/imageOverlayGroups';
import greeting from './config/greeting';


// Topics
import property from './config/topics/property';
import condos from './config/topics/condos';
import deeds from './config/topics/deeds';
import li from './config/topics/li';
import zoning from './config/topics/zoning';
// import polling from './config/topics/polling';
// import rco from './config/topics/rco';
import nearby from './config/topics/nearby';


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
const { hostname='' } = location;
if (hostname !== 'localhost' && !hostname.match(/(\d+\.){3}\d+/)) {
  console.log = console.info = console.debug = console.error = function () {};
}

var BASE_CONFIG_URL = 'https://cdn.rawgit.com/rbrtmrtn/mapboard-base-config/11f9644110fa1d6ff8a198f206d17631c8981947/config.js';

// configure accounting.js
accounting.settings.currency.precision = 0;

mapboard({
  // DEV
  // defaultAddress: '1234 MARKET ST',
  router: {
    enabled: true
  },
  geolocation: {
    enabled: false
  },
  addressAutocomplete: {
    enabled: false
  },
  rootStyle: {
    position: 'absolute',
    bottom: 0,
    // top: '78px',
    top: '118px',
    left: 0,
    right: 0,
  },
  gatekeeperKey: helpers.GATEKEEPER_KEY,
  map,
  baseConfig: BASE_CONFIG_URL,
  parcels,
  dataSources,
  imageOverlayGroups,
  legendControls,
  cyclomedia: {
    enabled: true,
    measurementAllowed: false,
    popoutAble: true,
  },
  pictometry: {
    enabled: true,
  },
  transforms,
  greeting,
  topics: [
    property,
    condos,
    deeds,
    li,
    zoning,
    // polling,
    // rco,
    nearby
  ],
});
