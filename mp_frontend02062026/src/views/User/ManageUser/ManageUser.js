import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import { useTranslation } from "react-i18next";
import ManageUserForm from "../Components/ManageUserForm";
import { isNil } from "lodash";
import PageLoader from "../../../components/UserComponents/PageLoader";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const ManageUser = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  let { id } = useParams();
  const isAddForm = isNil(id);
  const { authStatus, checkAuth } = useAuthorization(isAddForm ? "AddUser" : "EditUser");
  
  useEffect(() => {
      document.title = "Team | Thrivewell";;
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
          mt: 2,
        }}
      >
        <Box px={2}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid
              item
              sx={{ display: "flex", flexDirection: "row", padding: 0 }}
            >
              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t("common:common.Admin")}
              </Typography>
              <Box
                sx={{
                  m: 0.75,

                }}
                style={{ cursor: 'text' }}
              >
                <ChevronRightIcon color='disabled' fontSize="small" />
              </Box>
              <Typography
                color="textPrimary"
                variant="h5"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/dashboard/team')}
              >
                {t("common:common.Team")}
              </Typography>
              <Box
                sx={{
                  m: 0.75,

                }}
                style={{ cursor: 'text' }}
              >
                <ChevronRightIcon color='disabled' fontSize="small" />
              </Box>

              <Typography color="textPrimary" variant="h5">
                {isAddForm
                  ? t("common:user.Add User")
                  : t("common:user.User Edit")}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid
                item
                //lg={settings.compact ? 6 : 4}
                lg={10}
                //md={6}
                md={12}
                //xl={settings.compact ? 6 : 3}
                xl={12}
                xs={12}
              >
                <ManageUserForm isAddForm={isAddForm} userID={id} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ManageUser;
