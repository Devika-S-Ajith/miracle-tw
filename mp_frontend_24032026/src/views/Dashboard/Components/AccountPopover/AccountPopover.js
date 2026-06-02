import { useRef, useState, useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Link,
  ButtonBase,
  Divider,
  Popover,
  Typography,
  Tooltip,
} from "@mui/material";
import useAuth from "../../../../common/hooks/UseAuth";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import CloseIcon from "@mui/icons-material/Close";
import LanguagePopover from "../LanguagePopover";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const AccountPopover = () => {
  const anchorRef = useRef(null);
  const { logout } = useAuth();
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const userId = localStorage.getItem("username");
  const accId = localStorage.getItem("orgId");
  const {
    signedinUserRoleHT,
    signedinUserRoleFS,
    signedInOrgName,
    firstName,
    lastName,
    userImage,
    setAllSystemMessages,
    setPopupMessages,
    setBannerMessages,
    setNavbarFilterValues
  } = useContext(CommonDataContext);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
      setAllSystemMessages([]);
      setPopupMessages([]);
      setNavbarFilterValues([]);
      setBannerMessages([]);
      setNavbarFilterValues([])
      localStorage.clear();
      sessionStorage.clear();
      navigate('/signin');
    } catch (err) {
      console.error(err);
      toast.error("Unable to logout.");
    }
  };

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpen}
        ref={anchorRef}
        sx={{
          alignItems: "center",
          display: "flex",
        }}
      >
        <AccountCircleOutlinedIcon
          id="account_circle_icon"
          sx={{
            height: 32,
            width: 32,
            color: "#F37123",
          }}
        />
      </Box>
      <Popover
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        keepMounted
        onClose={handleClose}
        open={open}
      >
        <Box sx={{ maxWidth: 265 }}>
          <Box px={2} py={1} sx={{ display: "flex", justifyContent: "end" }}>
            <CloseIcon
              onClick={handleClose}
              sx={{ color: "#C6C4BE", cursor: "pointer" }}
            />
          </Box>
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Box>
              <Avatar
                src={userImage}
                sx={{
                  height: 32,
                  width: 32,
                }}
              />
            </Box>
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%", // Ensure it doesn't overflow its container
              }}
            >
              <Link
                color="inherit"
                component={RouterLink}
                to={`/dashboard/team/${userId}/view`}
                variant="h6"
                style={{
                  color: "#F37123",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <Tooltip title={firstName + " " + lastName}>
                  <Typography
                    color="primary"
                    variant="subtitle2"
                    onClick={() => setOpen(false)}
                    fontWeight={700}
                    fontSize="1.15rem"
                    textTransform="capitalize"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%", // Ensure it doesn't overflow its container
                    }}
                  >
                    {firstName + " " + lastName}
                  </Typography>
                </Tooltip>
              </Link>
            </Box>
            <Link
              color="inherit"
              component={RouterLink}
              to={`/dashboard/organizations/${accId}/view`}
              variant="h6"
              style={{
                color: "#F37123",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <Box>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                  style={{ textTransform: "capitalize" }}
                >
                  {signedInOrgName}
                </Typography>
              </Box>
            </Link>
          </Box>
          <Divider sx={{ mx: 2 }} />
          <Box p={2}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {signedinUserRoleHT !== "unassigned" && (
                <Typography color="textSecondary" variant="subtitle2">
                  <span>
                    <b>Thrive Scale</b> -{" "}
                    {t(`common:userRoles.${signedinUserRoleHT}`)}
                  </span>
                </Typography>
              )}
              {signedinUserRoleFS !== "unassigned" && (
                <Typography color="textSecondary" variant="subtitle2">
                  <span>
                    <b>FosterShare</b> -{" "}
                    {t(`common:userRoles.${signedinUserRoleFS}`)}
                  </span>
                </Typography>
              )}
            </Box>
          </Box>
          <Divider sx={{ mx: 2 }} />
          <Box p={2}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Link
                color="inherit"
                component={RouterLink}
                to={`/dashboard/team/${userId}/edit`}
                variant="h6"
                style={{
                  color: "#F37123",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <Typography color="primary" variant="subtitle1">
                  Edit profile
                </Typography>
              </Link>
              <Link
                color="inherit"
                component={RouterLink}
                to={`/dashboard/organizations/${accId}/view`}
                variant="h6"
                style={{
                  color: "#F37123",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <Typography color="primary" variant="subtitle1">
                  View organization
                </Typography>
              </Link>
              <LanguagePopover
                handleCloseProfilePopover={handleClose}
                handleOpenProfilePopover={handleOpen}
              />
            </Box>
          </Box>

          <Divider sx={{ mx: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "left" }} gap={0.5} p={2}>
            <div
              id="logout_button"
              onClick={handleLogout}
              style={{
                display: "flex",
                cursor: "pointer",
                alignItems: "left",
              }}
            >
              <Typography
                color="primary"
                variant="subtitle2"
                fontSize="1rem"
                fontWeight={700}
                lineHeight="1.25rem"
              >
                Sign out
              </Typography>
            </div>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default AccountPopover;
