import { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import { customerApi } from "../../../__fakeApi__/customerApi";
import useMounted from "../../../common/hooks/UseMounted";
import { useTranslation } from "react-i18next";
import AccountForm from "../Components/AccountForm";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import PageLoader from "../../../components/UserComponents/PageLoader";

const AddOrganization = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
   const { authStatus, checkAuth } = useAuthorization("AddAccount");
  
  useEffect(() => {
      document.title = "Accounts | Thrivewell";;
      checkAuth();
    }, []);
  
    if (authStatus === 'loading' || authStatus === 'idle') {
      return <PageLoader />;
    }
  
    if (authStatus === 'unauthorized') {
      return null; // Or a custom message
    }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2
        }}
      >
        <Box sx={{ width: "100%" }} px={2}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid
              item
              sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
            >
              <Typography color="textPrimary" variant="h5">
                {t("common:common.Admin")}
              </Typography>
              <Box
                sx={{
                  m: 0.75,
                }}
                style={{ cursor: "text" }}
              >
                <ChevronRightIcon color="disabled" fontSize="small" />
              </Box>
              <Typography
                color="textPrimary"
                variant="h5"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/admin/organizations")}
              >
                {t("common:common.Organizations")}
              </Typography>
              <Box
                sx={{
                  m: 0.75,
                }}
                style={{ cursor: "text" }}
              >
                <ChevronRightIcon color="disabled" fontSize="small" />
              </Box>
              <Typography
                color="textPrimary"
                variant="h5"
                id="add_account_button"
              >
                {t("common:organization.Add a new organization")}
              </Typography>
            </Grid>
          </Grid>
          <Box mt={3}>
            <AccountForm />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddOrganization;
