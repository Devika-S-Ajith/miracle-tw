
import React, { useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { CommonDataContext } from '../common/contexts/CommonDataContext';

const Landing = () => {
    const navigate = useNavigate();
	const { getDepricationData, getUserRegion } = useContext(CommonDataContext);

    useEffect(() => {
        const handleNavigation = (event) => {
            if (event.data.type === 'navigate' && event.data.path) {
                navigate(event.data.path);
            }
        };
        window.addEventListener('message', handleNavigation);
        return () => {
            window.removeEventListener('message', handleNavigation);
        };
    }, [navigate]);

	useEffect(() => {
		checkAppDeprication()
        getUserRegion()
	}, []);

	const checkAppDeprication = async () => {
	try {
		getDepricationData().then(res => {
		if (res?.type === 'APP_DEPRICATED') {
			navigate('/maintenance');
		}
		})
	} catch (err) {
		toast.error("Something went wrong");
	}
	};
    
    return (
        <iframe
            src="/Landingpage/index.html"
            style={{ width: '100%', height: '100vh', border: 'none' }}
            title="Landing Page"
        ></iframe>
    );
};

export default Landing;
