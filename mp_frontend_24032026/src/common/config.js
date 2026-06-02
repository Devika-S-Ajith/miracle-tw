export const amplifyConfig = {
    region: process.env.REACT_APP_POOL_REGION,
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID, 
    oauth: {
      responseType:"code"
    },
  };
  
  export const auth0Config = {
    client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
    domain: process.env.REACT_APP_AUTH0_DOMAIN
  };
  
  export const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
  };
  
  export const gtmConfig = {
    containerId: process.env.REACT_APP_GTM_CONTAINER_ID
  };

  export const urlPack = {
    baseUrl : process.env.REACT_APP_BASE_URL,
    baseEndPointUrl : process.env.REACT_APP_BASE_END_POINT,
  }
  
  const getBaseURL = () => {
    //return "https://876nyqrwm0.execute-api.us-east-1.amazonaws.com";
    // return "https://7246a5b111.execute-api.us-east-1.amazonaws.com"; //working
    //return "https://c05zhqrtzb.execute-api.us-east-1.amazonaws.com";
    return urlPack.baseUrl;
 };

  const getBaseEndPoint = () => {
    //return "dev";
    // return "test";
    // return "staging-test";
    return urlPack.baseEndPointUrl;
  }

  export const websocketConfig = {
    websocketURL: process.env.REACT_APP_WEB_SOCKET_URL
  }

  const getWebSocketURL = () => {
    return websocketConfig.websocketURL
  }

 export const AppConfig = {
  baseURL: getBaseURL(),
  baseEndPoint:getBaseEndPoint(),
  webSocketURL:getWebSocketURL()
};