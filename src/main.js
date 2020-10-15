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
import zoningDocsEclipse from './data-sources/zoning-docs-eclipse';
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

import exclamationCallout from './components/ExclamationCallout';
import greetingVoting from './components/GreetingVoting';

const customComps = {
  'exclamationCallout': exclamationCallout,
  'greetingvoting': greetingVoting,
};

// import 'phila-standards/dist/css/phila-app.min.css';
// import './styles.css';

var BASE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/cityofphiladelphia/mapboard-default-base-config@36eae931932f27f59e861178d32846e71259690e/config.js';

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
    // type: 'custom',
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
    orientation: 'horizontal',
    measurementAllowed: false,
    popoutAble: true,
    recordingsUrl: 'https://atlas.cyclomedia.com/Recordings/wfs',
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
    zoningDocsEclipse,
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
  defaultTopic: 'property',
  components: [
    {
      type: 'topic-set',
      options: {
        defaultTopic: 'property',
      },
    },
  ],
  i18n: {
    header: 'i18nBanner',
    enabled: true,
    languages: [ 'en-US', 'es' ],
    topics: [ 'voting' ],
    expandCollapseTitle: false,
    footer: true,
    data: {
      locale: 'en-US',
      messages: {
        'en-US': {
          language: 'English',
          app: {
            title: 'Mail-in Voting Centers',
            subtitle: 'Find a vote-by-mail location near you.',
            // bannerAlert: 'Many sites are closed today. Check specific site details for more information.',
            noResults: 'No center was found within your search. Please try again.',
          },
          introPage: {
            introTitle: 'Find your polling place on Atlas',
            p1: 'COVID-19 info: Due to the pandemic, many polling places for the November 2020 general election have changed or have not been finalized.',
            p2: 'Check here to confirm the location and more before you head to the polls on election day.​',
            p3: 'Search your home address on the map to find:',
            ul1: {
              li1: 'Your polling place address and map location.',
              li2: 'Accessibility and parking information for the building.',
              li3: 'A preview of the November 2020 general election ballot.',
              li4: 'Your elected officials and their contact information.',
            },
            p4_b: 'Hours: ',
            p4: 'All polling places will be open on election day from 7 a.m. to 8 p.m.',
            p5: 'Changes to the official voter registry may not be reflected here immediately. For up-to-date, official polling place locations in Philadelphia County, contact the Philadelphia Voter Registration Office at (215) 686-1590.',
            relatedContent: 'Related content',
            link1: 'See our mail-in ballot guide for Philadelphia Voters',
            link2: 'Find where to get and return mail-in ballots in person',
            link3: 'Check the status of your mail-in ballot',
            link4: 'Confirm that you\'re registered to vote',

          },
          cityOfPhiladelphia: 'City of Philadelphia',
          cityCommissioners: 'City Commissioners',
          ballotGuide: 'General election mail-in ballot guide',
          siteHours: 'Site hours',
          details: {
            details: 'Details',
            inPerson: 'In-person registration and mail-in voting',
            ballotDropoff: 'Mail-in ballot drop-off',
            ballotDropoffLong: 'The Board of Elections should be notified immediately in the event the receptacle is full, not functioning, or is damaged in any fashion, by calling 215-686-3469 or by emailing vote@phila.gov.',
            interpretationAvailable: 'Telephonic interpretation services available',
            wheelchair: 'Wheelchair accessible',
            open24Hours: 'Open 24 hours',
          },
          'Election office': 'Election Office',
          'Official ballot return': 'Official Ballot Return',
          sections: {
            'Election office': {
              header: 'Election Office',
            },
            'Official ballot return': {
              header: 'Official Ballot Return',
            },
          },
          beforeYouGo: 'Before you go',
          checkSite: 'Eligibility requirements and testing hours vary by site. Be sure to check site details to arrange for testing.',
          hoursVary: 'Hours and availability varies.',
          eligibility: 'Details',
          testingHours: 'Testing hours',
          daysOfOperation: 'Days of operation',
          Monday: 'Mon.',
          Tuesday: 'Tues.',
          Wednesday: 'Wed.',
          Thursday: 'Thurs.',
          Friday: 'Fri.',
          Saturday: 'Sat.',
          Sunday: 'Sun.',
          Yes: 'Yes',
          No: 'No',
          Unknown: 'Unknown',
          website: 'Website',
        },
        'es': {
          language: 'Español',
          app: {
            title: 'Centros de votación por correo',
            subtitle: 'Encuentre un centro de votación por correo cerca de usted.',
            // bannerAlert: 'Muchos lugares están cerrados hoy. Consulte los detalles específicos del lugar para obtener más información.',
            noResults: 'No se encontró un lugar donde se realicen pruebas que coincida con su búsqueda.',
          },
          introPage: {
            introTitle: 'Spanish Find your polling place on Atlas',
            p1: 'Spanish COVID-19 info: Due to the pandemic, many polling places for the November 2020 general election have changed or have not been finalized.',
            p2: 'Spanish Check here to confirm the location and more before you head to the polls on election day.',
            p3: 'Spanish Search your home address on the map to find:',
            ul1: {
              li1: 'Spanish Your polling place address and map location.',
              li2: 'Spanish Accessibility and parking information for the building.',
              li3: 'Spanish A preview of the November 2020 general election ballot.',
              li4: 'Spanish Your elected officials and their contact information.',
            },
            p4_b: 'Spanish Hours: ',
            p4: 'Spanish All polling places will be open on election day from 7 a.m. to 8 p.m.',
            p5: 'Spanish Changes to the official voter registry may not be reflected here immediately. For up-to-date, official polling place locations in Philadelphia County, contact the Philadelphia Voter Registration Office at (215) 686-1590.',
            relatedContent: 'Contenido relacionado',
            link1: 'Spanish See our mail-in ballot guide for Philadelphia Voters',
            link2: 'Spanish Find where to get and return mail-in ballots in person',
            link3: 'Spanish Check the status of your mail-in ballot',
            link4: 'Spanish Confirm that you\'re registered to vote',

          },
          cityOfPhiladelphia: 'La Ciudad de Filadelfia',
          cityCommissioners: 'Los Comisionados de la Ciudad de Filadelfia',
          ballotGuide: 'Guía de votación por correo para la elección general',
          siteHours: 'Horas del centro',
          details: {
            details: 'Detalles',
            inPerson: 'Inscripción para votar y votar por correo',
            ballotDropoff: 'Entrega de boletas por correo',
            ballotDropoffLong: 'En caso de que el buzón esté lleno, no funcione o esté dañado de alguna manera, se debe notificar inmediatamente a la Junta Electoral, llamando al 215-686-3469 o enviando un correo electrónico a vote@phila.gov.',
            interpretationAvailable: 'Servicios de intérprete disponibles',
            wheelchair: 'Local accesible en silla de ruedas',
            open24Hours: 'Abierto las 24 horas',
          },
          'Election office': 'Oficina Electoral',
          'Official ballot return': 'Sitio oficial para devolver boletas',
          sections: {
            'Election office': {
              header: 'Oficina Electoral',
            },
            'Official ballot return': {
              header: 'Sitio oficial para devolver boletas',
            },
          },
          beforeYouGo: 'Antes de ir',
          checkSite: 'Revise los detalles específicos del lugar.',
          hoursVary: 'Los horarios y la disponibilidad pueden variar.',
          eligibility: 'Detalles',
          testingHours: 'Horario para las pruebas',
          daysOfOperation: 'Días de servicio',
          Monday: 'Lun.',
          Tuesday: 'Mar.',
          Wednesday: 'Mié.',
          Thursday: 'Jue.',
          Friday: 'Vie.',
          Saturday: 'Sáb.',
          Sunday: 'Dom.',
          Yes: 'Sí',
          No: 'No',
          Unknown: 'Desconocido',
          website: 'Sitio web',
        },
      },
    },
  },
});
