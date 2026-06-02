import { useState } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { experimentalStyled } from '@material-ui/core/styles';
//import Footer from './Components/Footer';
import MainNavbar from './Components/MainNavbar';
import MainSidebar from './Components/MainSidebar';

const MainLayoutRoot = experimentalStyled('div')(({ theme }) => ({
  backgroundColor: '#1D334B',
  minHeight: '100vh',
}));

const MainLayout = ({ children }) => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  return (
    <MainLayoutRoot>
      <MainNavbar onSidebarMobileOpen={() => setIsSidebarMobileOpen(true)} />
      <MainSidebar
        onMobileClose={() => setIsSidebarMobileOpen(false)}
        openMobile={isSidebarMobileOpen}
      />
      {children || <Outlet />}
      {/* <Footer /> */}
    </MainLayoutRoot>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node
};

export default MainLayout;
