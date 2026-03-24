import React from 'react';
import {  Link } from 'react-router-dom';
import './Download.css';

const Download = () => {
    return (
        <div className="App">
            <div className="background">
                <div className="top-bar">
                    <Link to="/signin" className="sign-in-button">Sign In</Link>
                </div>
                <div className="content">
                    <div className="logo">
                        <img src="static/phone.png" alt="Logo" />
                    </div>
                    <div className="download-buttons">

                        <h2>Welcome to ThriveWell™</h2>
                        <p>Download ThriveWell™ on the App Store or on Google Play to start with your digital assistant.</p>
                        <a href="https://apps.apple.com/in/app/thrivewell-built-for-families/id6476358512" target='_blank'>
                            <img src="static/AppStore.png" alt="Download on the App Store" className="store-button" />
                        </a>
                        <a href="https://play.google.com/store/apps/details?id=com.miraclefoundation.baybridge" target='_blank'>
                            <img src="static/GooglePlayStore.png" alt="Get it on Google Play" className="store-button" />
                        </a>
                        <p>Google Play and the Google Play logo are trademarks of Google LLC.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Download;
