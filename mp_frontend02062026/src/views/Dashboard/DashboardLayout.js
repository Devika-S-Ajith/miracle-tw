import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardSystemMessages from "./DashboardSystemMessages";

const DashboardLayoutRoot = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: "flex",
  height: "100%",
  overflow: "hidden",
  width: "100%",
}));

const DashboardLayoutWrapper = styled("div")(({ isSidebarMobileOpen }) => ({
  display: "flex",
  flex: "1 1 auto",
  overflow: "",
  paddingTop: "64px",
  paddingLeft: isSidebarMobileOpen ? "250px" : "120px", // Set padding based on isSidebarMobileOpen
  transition: "padding-left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  willChange: "padding-left",
  // width:"-webkit-fill-available"
  width: "100%" /* Fills the available width */,
  boxSizing:
    "border-box" /* Include padding and border widths in the total width */,
}));

const DashboardLayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
  width: "100%",
});

const DashboardLayoutContent = styled("div")({
  // flex: '1 1 auto',
  height: "100%",
  overflow: "auto",
  position: "relative",
  paddingBottom: "64px",
  WebkitOverflowScrolling: "touch",
  // width: "-webkit-fill-available",
  width: "100%" /* Fills the available width */,
  boxSizing:
    "border-box" /* Include padding and border widths in the total width */
});

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobileSize = useMediaQuery(theme.breakpoints.down("lg"));
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(
    isMobileSize ? false : true
  );

  useEffect(() => {
    setIsSidebarMobileOpen(!isMobileSize);
  }, [isMobileSize]);

  return (
    <DashboardLayoutRoot>
      <DashboardNavbar />
      <DashboardSidebar
        onMobileClose={() => setIsSidebarMobileOpen(false)}
        openMobile={isSidebarMobileOpen}
        onSidebarMobileOpen={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
      />
      <DashboardLayoutWrapper isSidebarMobileOpen={isSidebarMobileOpen}>
        <DashboardLayoutContainer>
          <DashboardLayoutContent>
            <DashboardSystemMessages />
            <Outlet />
          </DashboardLayoutContent>
        </DashboardLayoutContainer>
      </DashboardLayoutWrapper>
    </DashboardLayoutRoot>
  );
};

export default DashboardLayout;
