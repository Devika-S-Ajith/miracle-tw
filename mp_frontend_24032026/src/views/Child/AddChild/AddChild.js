import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Grid, Typography, IconButton } from "@mui/material";
import AddChildForm from "../Components/AddChildForm";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";

import { useTranslation } from "react-i18next";
const AddChild = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const comingFromFam = Boolean(state?.fromFamily);
  const famNumber = state?.fromFamily;
  const { t } = useTranslation(["common"]);
  const { signedinOrgType, signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);

  //handle role permissions
  useAuthorization(signedinUserRoleHT, signedinUserRoleFS, signedinOrgType, 'AddChild', true)

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
        }}
      >
        <Grid container width={1} >
          <Grid item xs={12} sx={{mr:1}}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textPrimary"
                  variant="h5"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/dashboard")}
                >
                  {t("common:common.Thrive Scale")}
                </Typography>
                <Box
                  sx={{
                    m: 0.75,
                  }}
                  style={{ cursor: "text" }}
                >
                  <ChevronRightIcon color="disabled" fontSize="small" />
                </Box>
                <Grid item>
                  <Typography
                    color="textPrimary"
                    variant="h5"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(-1)}
                  >
                    {t("common:common.Children")}
                  </Typography>
                </Grid>
                <IconButton color="disabled" sx={{ mt: -0.5 }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
                <Typography color="textPrimary" variant="h5">
                  {t("common:child.Add Child")}
                </Typography>
              </Grid>
            </Grid>
            <Box mt={3}>
              <AddChildForm
                fromFam={comingFromFam}
                famNumber={famNumber}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AddChild;
