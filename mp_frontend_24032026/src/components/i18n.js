// import { useContext } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// import { CommonDataContext } from '../common/contexts/CommonDataContext';

// const resources = {
//   en: {
//     translation: {
//       'Welcome to React': 'Welcome to React and react-i18next'
//     }
//   },
//   fr: {
//     translation: {
//       'Welcome to React': 'Bienvenue à React et react-i18next'
//     }
//   }
// };
let language = localStorage.getItem('language');
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    //resources,
    react : {
    useSuspense : false
    },
    lng: language && language!== null ? language : 'en',
    //lng: 'en',
    debug: false,   
    //fallbackLng: 'en',
    fallbackLng: language && language!== null ? language : 'en',
    ns: ['common', 'message', 'loginView', 'dataList'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });