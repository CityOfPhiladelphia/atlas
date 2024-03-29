
import en from './en-us';
import es from './es';

let i18n = {
  i18n: {
    header: 'i18nBanner',
    enabled: true,
    banner: true,
    selector: false,
    topics: [ 'voting' ],
    languages: [ 'en-US', 'es' ],
    footer: true,
    data: {
      locale: 'en-US',
      messages: {
        'en-US': en,
        es: es,
      },
    },
  },
};

// console.log('atlas i18n.js, i18n:', i18n);

export default i18n;
