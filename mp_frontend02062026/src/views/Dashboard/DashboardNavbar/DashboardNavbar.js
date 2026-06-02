import { Link as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
import { AppBar, Box, Toolbar } from "@mui/material";
import AccountPopover from "../Components/AccountPopover";
import NotificationsPopover from "../Components/NotificationsPopover";
import MiracleLogo from "../../../assets/LogoSideBar";
import { styled } from "@mui/system";
import { useContext, useEffect } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { filterMessagesByCurrentTime } from "../../../constants";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  ...(theme.palette.mode === "light" && {
    backgroundColor: "white",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Add box shadow for light mode
    color: theme.palette.primary.contrastText,
  }),
  ...(theme.palette.mode === "dark" && {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Add box shadow for dark mode
  }),
  zIndex: theme.zIndex.drawer + 100,
  elevation: 4, // Add elevation
}));


const DashboardNavbar = (props) => {
  const { onSidebarMobileOpen, ...other } = props;

  const {
    signedinUserRoleHT,
    allSystemMessages,
    setPopupMessages,
    setBannerMessages,
    signedinOrgType,
  } = useContext(CommonDataContext);

  const { t } = useTranslation(["common"]);
  useEffect(() => {
    const filterAndSetMessages = () => {
      const messages = filterMessagesByCurrentTime(allSystemMessages);
  
      const filteredPopupMessages = messages?.filter(msg => msg.MPSystemMessageTypeId == 1);
      const filteredBannerMessages = messages?.filter(msg => msg.MPSystemMessageTypeId == 3);
  
      // Update the message lists
      setPopupMessages(filteredPopupMessages);
      setBannerMessages(filteredBannerMessages);
    };
  
    // Initial run
    filterAndSetMessages();
  
    // Set an interval to check every minute (or any interval you need)
    const intervalId = setInterval(() => {
      filterAndSetMessages();
    }, 60000); // 60,000 milliseconds = 1 minute
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [allSystemMessages]);

  const getLogoLink = (orgType) => {
  if (orgType == 6) return "/governmentDashboardOverview";
  return "/dashboard";
};

  return (
    <DashboardNavbarRoot {...other}>
      <Toolbar sx={{ elevation: 4, minHeight: 64 }}>
        <Box
          sx={{
            display: {
              lg: "flex",
              xs: "flex",
            },
            justifyContent: "center",
            pt: 1,
            pb: 1,
          }}
        >
          <RouterLink to={getLogoLink(signedinOrgType)}>
            <MiracleLogo
              sx={{
                height: 40,
                width: 40,
              }}
            />
          </RouterLink>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            ml: 2,
          }}
        />
        <Box sx={{ ml: 2 }}>
          <Tooltip title={t("common.Online documentation")}>
          <a
            href="https://miraclefoundation.atlassian.net/servicedesk/customer/portals"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center" }}
          >
            <InfoRoundedIcon sx={{ color: "#F37123", height: 32, width: 32 }} />
            
          </a>
          </Tooltip>
        </Box>
        {signedinOrgType !== "6" && (
          <Box sx={{ ml: 2 }}>
            <NotificationsPopover />
          </Box>
        )}
        <Box sx={{ ml: 2 }}>
          <AccountPopover />
        </Box>
      </Toolbar>
    </DashboardNavbarRoot>
  );
};

DashboardNavbar.propTypes = {
  onSidebarMobileOpen: PropTypes.func,
};

export default DashboardNavbar;
