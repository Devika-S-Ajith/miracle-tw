
import PropTypes from "prop-types";
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Toolbar,
} from "@mui/material";
import MenuIcon from "../../../../assets/icons/Menu";
import MiracleLogo from "../../../../assets/LogoSideBar";
import { styled } from "@mui/system";

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
  elevation: 4
}));

const MainNavbar = (props) => {

  const { onSidebarMobileOpen } = props;

  return (
    <DashboardNavbarRoot>
      <Toolbar sx={{ minHeight: 70 }}>
        <IconButton
          color="inherit"
          onClick={onSidebarMobileOpen}
          sx={{
            display: {
              md: "none",
            },
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <MiracleLogo
          sx={{
            height: 40,
            width: 40,
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            alignItems: "center",
            display: {
              md: "flex",
              xs: "none",
            },
          }}
        >
        </Box>
      </Toolbar>
      <Divider />
    </DashboardNavbarRoot>
  );
};

MainNavbar.propTypes = {
  onSidebarMobileOpen: PropTypes.func,
};

export default MainNavbar;
