// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;




//import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import './components/i18n';
// import SettingsDrawer from './components/SettingsDrawer';
// import SplashScreen from './components/SplashScreen';
//import useAuth from './common/hooks/UseAuth';
import useScrollReset from './common/hooks/UseScrollReset';
import useSettings from './common/hooks/UseSettings';
import routes from './Routes';
import { createCustomTheme } from './theme';
import CommonDataContextProvider from './common/contexts/CommonDataContext';
import { amplifyConfig } from './common/config';
import Amplify from 'aws-amplify';


//import RTL from './components/RTL';
//import { gtmConfig } from './config';
//import gtm from './lib/gtm';

const App = () => {
  const content = useRoutes(routes);
  const { settings } = useSettings();
  Amplify.configure(amplifyConfig);

  useScrollReset();

  const theme = createCustomTheme({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    roundedCorners: settings.roundedCorners,
    theme: settings.theme
  });

  return (
    <ThemeProvider theme={theme}>
      <CommonDataContextProvider>
        <CssBaseline />
        <Toaster position="top-center" />
        {/* <SettingsDrawer /> */}
        {/* {auth.isInitialized ? content : <SplashScreen />} */}
        {content}
        </CommonDataContextProvider>
    </ThemeProvider>
  );
};

export default App;
