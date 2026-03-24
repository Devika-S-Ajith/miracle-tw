const regionEnvMap = {
  'ap-south-1': {
    region: process.env.REACT_APP_POOL_REGION_IND,
    userPoolId: process.env.REACT_APP_USER_POOL_ID_IND,
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID_IND,
  },
  'us-east-1': {
    region: process.env.REACT_APP_POOL_REGION,
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  },
  // Add more regions here as needed
};

export function getAmplifyConfig() {
  const userDBRegion = localStorage.getItem('userDBRegion');
  const selectedEnv = regionEnvMap[userDBRegion];
  console.log("Selected Env: ", selectedEnv);
  return {
    ...selectedEnv,
    oauth: {
      responseType: "code"
    },
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  };
}

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

export const AppConfig = {
  baseURL: process.env.REACT_APP_BASE_URL,
  baseEndPoint: process.env.REACT_APP_BASE_END_POINT,
  webSocketURL: process.env.REACT_APP_WEB_SOCKET_URL,
  migrationURL: process.env.REACT_APP_MIGRATION_URL
};
