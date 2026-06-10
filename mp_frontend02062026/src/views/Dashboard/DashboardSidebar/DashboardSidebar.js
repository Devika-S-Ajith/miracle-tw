import { useEffect, useState, useContext } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Skeleton, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";
import { Box, Divider, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import NavSection from "../Components/NavSection";
import _ from "lodash";
import {
  UserIcon,
  HomeIcon,
  ResourcesIcon,
  ReportsIcon,
  ChildIcon,
  OrganizationIcon,
  SupportServicesIcon,
  FamilyIcon,
  FormsIcon,
  CalendarIcon,
  MessagesIcon,
  AssessmentIcon,
  HomeIconActive,
  ReportsIconActive,
  CalendarIconActive,
  FamilyIconActive,
  ChildIconActive,
  FormsIconActive,
  AssessmentIconActive,
  MessagesIconActive,
  ResourcesIconActive,
  SupportServicesIconActive,
  OrganizationIconActive,
  UserIconActive,
  SystemMessageIcon,
  SystemMessageIconActive,
  MilestonesIconActive,
  MilestonesIcon,
  InterventionsIcon,
  InterventionsIconActive,
} from "../../../assets/icons/SideBarIcons";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useStyles from "./Layout.js";
import clsx from "clsx";
import toast from "react-hot-toast";
import { AppConfig } from "../../../common/config";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  SUPER_ADMIN,
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
  VIEW_ONLY,
  MIRACLE,
  GOVT_CCI,
  GOVT_ORG,
  NGO_PARTNER,
  PRIVATE_CCI,
  UNASSIGNED,
  PARENT_ORGANIZATION,
} from "../../../helpers/constant.js";
import DashboardFilterSection from "../DashboardFilterSection/DashboardFilterSection.js";
import DashboardSkelton from "./DashboardSkelton.js";

const DashboardSidebar = (props) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const theme = useTheme();
  const classes = useStyles();
  const isMobileSize = useMediaQuery(theme.breakpoints.down("sm"));
  const { onMobileClose, openMobile, onSidebarMobileOpen } = props;
  const location = useLocation();
  const {
    signedinOrgType,
    signedinUserRoleHT,
    signedinUserRoleFS,
    userIdData,
  } = useContext(CommonDataContext);
  const [websocketData, setWebsocketData] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);
  const sections = [
    {
      items: [
        {
          title: "Overview",
          path: "/dashboard",
          icon: <HomeIcon fontSize="small" />,
          orangeIcon: <HomeIconActive fontSize="small" />,
          HT_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
           FS_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
          Allowed_Acc_Type: [
            MIRACLE,
            GOVT_CCI,
            GOVT_ORG,
            NGO_PARTNER,
            PRIVATE_CCI,
          ],
        },
        {
          title: "Overview",
          path: "/governmentDashboardOverview",
          icon: <HomeIcon fontSize="small" />,
          orangeIcon: <HomeIconActive fontSize="small" />,
          HT_Allowed_Roles: [
            ADMIN,
            VIEW_ONLY,
          ],
          Allowed_Acc_Type: [
            PARENT_ORGANIZATION
          ],
        },
        {
          title: "Organizations",
          path: "/governmentDashboardOrganizations",
          icon: <OrganizationIcon fontSize="small" />,
          orangeIcon: <OrganizationIconActive fontSize="small" />,
          HT_Allowed_Roles: [
            ADMIN,
            VIEW_ONLY,
          ],
          Allowed_Acc_Type: [
            PARENT_ORGANIZATION
          ],
        },
        {
          title: "Milestones",
          path: "/governmentDashboardMilestones",
          icon: <MilestonesIcon fontSize="small" />,
          orangeIcon: <MilestonesIconActive fontSize="small" />,
          HT_Allowed_Roles: [
           
          ],
          Allowed_Acc_Type: [
            
          ],
        },
        {
          title: "Milestones",
          path: "/governmentDashboardMilestones",
          icon: <MilestonesIcon fontSize="small" />,
          orangeIcon: <MilestonesIconActive fontSize="small" />,
          HT_Allowed_Roles: [],
          Allowed_Acc_Type: [],
        },
        {
          title: "Interventions",
          path: "/governmentDashboardInterventions",
          icon: <InterventionsIcon fontSize="small" />,
          orangeIcon: <InterventionsIconActive fontSize="small" />,
          HT_Allowed_Roles: [
            
          ],
          Allowed_Acc_Type: [
           
          ],
        },
         {
          title: "Interventions",
          path: "/governmentDashboardInterventions",
          icon: <InterventionsIcon fontSize="small" />,
          orangeIcon: <InterventionsIconActive fontSize="small" />,
          HT_Allowed_Roles: [],
          Allowed_Acc_Type: [],
        },
         {
          title: "Families",
          path: "/governmentDashboardFamily",
          icon: <FamilyIcon fontSize="small" />,
          orangeIcon: <FamilyIconActive fontSize="small" />,
          HT_Allowed_Roles: [
          
          ],
          Allowed_Acc_Type: [
          
          ],
        },
        {
          title: "Children",
          path: "/governmentDashboardChildren",
          icon: <ChildIcon fontSize="small" />,
          orangeIcon: <ChildIconActive fontSize="small" />,
          HT_Allowed_Roles: [
           
          ],
          Allowed_Acc_Type: [
           
          ],
        },
        {
          title: "Families",
          path: "/dashboard/families",
          icon: <FamilyIcon fontSize="small" />,
          orangeIcon: <FamilyIconActive fontSize="small" />,
          FS_Allowed_Roles: [
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
          HT_Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER,VIEW_ONLY],
          Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
        },
        {
          title: "Children",
          path: "/dashboard/children",
          icon: <ChildIcon fontSize="small" />,
          orangeIcon: <ChildIconActive fontSize="small" />,
          FS_Allowed_Roles: [
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
          HT_Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
          Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
        },
        {
          title: "Assessments & Progress Reports",
          path: "/dashboard/assessments",
          icon: <AssessmentIcon fontSize="small" />,
          orangeIcon: <AssessmentIconActive fontSize="small" />,
          HT_Allowed_Roles: [SUPER_ADMIN, ADMIN, CASEWORKER, ADMIN_CASEWORKER],
          Allowed_Acc_Type: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
          style: {alignItems: "start"}
        },
        {
          title: "Reports",
          path: "/dashboard/reports",
          icon: <ReportsIcon fontSize="small" />,
          orangeIcon: <ReportsIconActive fontSize="small" />,
          HT_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
          Allowed_Acc_Type: [
            MIRACLE,
            GOVT_CCI,
            GOVT_ORG,
            NGO_PARTNER,
            PRIVATE_CCI,
          ],
        },
        {
          title: "Events",
          path: "/dashboard/events",
          icon: <CalendarIcon fontSize="small" />,
          orangeIcon: <CalendarIconActive fontSize="small" />,
          FS_Allowed_Roles: [
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
          ],
          style: {alignItems: "start"}
        },
        {
          title: "Messages",
          path: "/fostershare/messages",
          icon: <MessagesIcon fontSize="small" />,
          orangeIcon: <MessagesIconActive fontSize="small" />,
          FS_Allowed_Roles: [ADMIN, CASEWORKER, ADMIN_CASEWORKER ],
        },
        {
          title: "Resources",
          path: "/fostershare/resources",
          icon: <ResourcesIcon fontSize="small" />,
          orangeIcon: <ResourcesIconActive fontSize="small" />,
          FS_Allowed_Roles: [SUPER_ADMIN],
        },
      ],
    },
  
    {
      title: "Admin",
      titleShortName: <SettingsIcon sx={{ ml: -0.5 }} fontSize="small" />,
      items: [
        {
          title: "System messages",
          path: "/admin/messages",
          icon: <SystemMessageIcon fontSize="small" />,
          orangeIcon: <SystemMessageIconActive fontSize="small" />,
          FS_Allowed_Roles: [SUPER_ADMIN],
          HT_Allowed_Roles: [SUPER_ADMIN],
          Allowed_Acc_Type: [MIRACLE],
        },
        {
          title:
            [SUPER_ADMIN].includes(signedinUserRoleFS) ||
            [SUPER_ADMIN].includes(signedinUserRoleHT)
              ? "Organizations"
              : "Organization",
          path:
            [SUPER_ADMIN].includes(signedinUserRoleFS) ||
            [SUPER_ADMIN].includes(signedinUserRoleHT)
              ? "/admin/organizations"
              : `/dashboard/organizations/${localStorage.getItem(
                  "orgId"
                )}/view`,
          icon: <OrganizationIcon fontSize="small" />,
          orangeIcon: <OrganizationIconActive fontSize="small" />,
          FS_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            ADMIN_CASEWORKER,
            CASEWORKER ,
          ],
          HT_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
          Allowed_Acc_Type: [
            MIRACLE,
            GOVT_CCI,
            GOVT_ORG,
            NGO_PARTNER,
            PRIVATE_CCI,
            PARENT_ORGANIZATION
          ],
        },
        {
          title: "Team",
          path: "/admin/team",
          icon: <UserIcon fontSize="small" />,
          orangeIcon: <UserIconActive fontSize="small" />,
          FS_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            ADMIN_CASEWORKER,
            CASEWORKER,
          ],
          HT_Allowed_Roles: [
            SUPER_ADMIN,
            ADMIN,
            CASEWORKER,
            ADMIN_CASEWORKER,
            VIEW_ONLY,
          ],
          Allowed_Acc_Type: [
            MIRACLE,
            GOVT_CCI,
            GOVT_ORG,
            NGO_PARTNER,
            PRIVATE_CCI,
            PARENT_ORGANIZATION
          ],
        },
        {
          title: "Forms",
          path: "/dashboard/forms",
          icon: <FormsIcon fontSize="small" />,
          orangeIcon: <FormsIconActive fontSize="small" />,
          HT_Allowed_Roles: [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
          FS_Allowed_Roles: [],
          Allowed_Acc_Type: [
            MIRACLE,
            GOVT_CCI,
            GOVT_ORG,
            NGO_PARTNER,
            PRIVATE_CCI,
          ],
        },
        {
          title: "Support Services",
          path: "/admin/support-services",
          icon: <SupportServicesIcon fontSize="small" />,
          orangeIcon: <SupportServicesIconActive fontSize="small" />,
          FS_Allowed_Roles: [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
        },
      ],
    },
  ];
  const filterSectionsByRoles = (sections) => {
    
    return sections.map((section, i) => {
      const filteredItems = section.items.filter((item) => {
        const htAllowedRoles = item.HT_Allowed_Roles || [];
        const fsAllowedRoles = item.FS_Allowed_Roles || [];
        const allowedAccTypes = item.Allowed_Acc_Type || [];
        return (
          (allowedAccTypes.includes(signedinOrgType) &&
          htAllowedRoles.includes(signedinUserRoleHT)) ||
          fsAllowedRoles.includes(signedinUserRoleFS)
        );
      });
      return {
        ...section,
        items: filteredItems,
      };
    });
  };

  // useEffect(() => {
  //   const clearLocalStorage = (event) => {
  //     const isKeepMeSignedIn = localStorage.getItem('keepLoggedIn');
  //     const username = sessionStorage.getItem('username');

  //     //console.log("isusername", username, isKeepMeSignedIn)
  //     // if(event && event?.currentTarget){
  //     //   localStorage.setItem('eventoccured',JSON.parse(event?.currentTarget))
  //     // }
  //     if (isKeepMeSignedIn !== 'true') {
  //       if (event && event.currentTarget.performance.navigation.type == 0) {
  //         //localStorage.clear();
  //         localStorage.setItem('eventoccured', 'cleared')
  //       }
  //     }
  //   };

  //   window.addEventListener('beforeunload', clearLocalStorage);
  //   return () => {
  //     window.removeEventListener('beforeunload', clearLocalStorage);
  //   };
  // }, []);

  useEffect(() => {
    let idToken =
      localStorage.getItem("keepLoggedIn") == "true"
        ? localStorage.getItem("idToken")
        : sessionStorage.getItem("idToken");
    if (_.isNil(idToken) || idToken === "undefined") {
      navigate("/signin");
    }
    const filteredSections = filterSectionsByRoles(sections);
    setFilteredSections(filteredSections);
  }, [signedinUserRoleHT, signedinUserRoleFS, signedinOrgType]);

  useEffect(() => {
    if (websocketData !== null) {
      if (
        websocketData.statusCode === 201 &&
        websocketData.statusMessage === "IMPORT_SUCESS"
      ) {
        toast.success(t("common:common.Import completed successfully"));
      }
      if (
        websocketData.statusCode === 201 &&
        websocketData.statusMessage === "EXPORT_SUCESS"
      ) {
        toast.success(t("common:common.Export completed successfully"));
        const url = websocketData.data.url;
        //  window.open(link, "_blank");
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "file.pdf");
        document.body.appendChild(link);
        link.click();
      }
      if (
        websocketData.statusCode === 400 &&
        websocketData.statusMessage === "BAD_REQUEST"
      ) {
        toast.error(t("common:common.Bad request"));
      }
      if (
        websocketData.statusCode === 102 &&
        websocketData.statusMessage === "IMPORT_PARTIALLY_COMPLETED"
      ) {
        toast.error(t("common:common.Import partially completed"));
      }
      if (
        websocketData.statusCode === 101 &&
        websocketData.statusMessage === "INCORRECT_CSV"
      ) {
        toast.error(t("common:common.Data Error in CSV file"));
      }
      if (
        websocketData.statusCode === 104 &&
        websocketData.statusMessage === "IMPORT_FAILED"
      ) {
        toast.error(t("common:common.Import Failed"));
      }
    }
  }, [websocketData]);

  // useEffect(() => {
  //  // websocketConnection();
  // }, [signedinUserRole])

  const websocketConnection = () => {
    if (userIdData !== null) {
      let websocketConfig = AppConfig.webSocketURL;
      const idToken = localStorage.getItem("idToken");
      const ws = new WebSocket(
        `${websocketConfig}=${userIdData}&Authorization=${idToken}`
      );
      ws.onopen = function (event) {
        console.log("Websocket Connection established", event);
      };
      ws.onmessage = function (event) {
        console.log("Web socket response for import", event.data);
        const data = JSON.parse(event.data);
        setWebsocketData(data);
      };
      ws.onclose = function (event) {
        console.log(
          "Websocket disconnected. Reconnect will be attempted in 1 second."
        );
        setTimeout(function () {
          //websocketConnection();
        }, 1000);
      };

      ws.onerror = function (event) {
        console.log("Web socket error", event);
      };
    }
  };

  const [currentSection, setCurrentsection] = useState();

  const drawerOpenHandler = (section) => {
    setCurrentsection(filteredSections.find((obj) => obj.title === section));
  };

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        mr: 2,
      }}
    >
      <Box sx={{ mt: 9, mb: 8 }}>
        {filteredSections?.[0]?.items?.length > 0 ? (
          filteredSections.map((section) => (
            <NavSection
              key={section.title}
              isOpenDrawer={openMobile}
              pathname={location.pathname}
              sx={{
                "& + &": {
                  mt: 1,
                },
              }}
              currentSection={currentSection}
              drawerOpenHandler={drawerOpenHandler}
              {...section}
            />
          ))
        ) : <DashboardSkelton isWeb={openMobile}/>}
      </Box>
      <Divider />
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      onClose={onMobileClose}
      open={openMobile}
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: openMobile,
        [classes.drawerClose]: !openMobile,
      })}
      classes={{
        paper: clsx(classes.drawer, {
          [classes.drawerOpen]: openMobile,
          [classes.drawerClose]: !openMobile,
        }),
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#1D334B",
          height: "calc(100% - 64px) !important",
          top: "64px !Important",
          borderRadius: 0,
          width: 280,
          "&::-webkit-scrollbar": {
            width: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#1a3047",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#1D334B",
          },
        },
      }}
    >
      {!isMobileSize && (
        <div
          className={clsx(classes.drawerToggle, {
            [classes.drawerToggleOpen]: openMobile,
            [classes.drawerToggleClosed]: !openMobile,
          })}
        >
          <IconButton id="sideBarToggle" onClick={onSidebarMobileOpen}>
            {!openMobile ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
      )}
      {[6].includes(Number(localStorage.getItem("signedinOrgType"))) && <DashboardFilterSection openMobile={openMobile} />}
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
};

export default DashboardSidebar;
