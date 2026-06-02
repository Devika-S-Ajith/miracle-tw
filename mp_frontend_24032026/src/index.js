import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
//import './i18n';
import './components/i18n';
import { initGA, logPageView } from "./analytics";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

initGA();
logPageView();

function MainApp() {
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);

  return <App />;
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <MainApp />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
