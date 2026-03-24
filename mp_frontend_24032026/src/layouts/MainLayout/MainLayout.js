import { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';
import MainSidebar from './Components/MainSidebar';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';

const MainLayoutRoot = styled('div')(({ theme }) => ({
  backgroundColor: '#1D334B',
  minHeight: '100vh',
}));

const MainLayout = ({ children }) => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
	const navigate = useNavigate()
	const { getDepricationData, getUserRegion } = useContext(CommonDataContext);

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
      console.log("Something went wrong");
    }
  };

  return (
    <MainLayoutRoot>
      <MainSidebar
        onMobileClose={() => setIsSidebarMobileOpen(false)}
        openMobile={isSidebarMobileOpen}
      />
      {children || <Outlet />}
    </MainLayoutRoot>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node
};

export default MainLayout;
