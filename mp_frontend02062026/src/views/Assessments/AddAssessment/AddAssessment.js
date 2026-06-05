import { useEffect, useContext, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadingButton from "@mui/lab/LoadingButton";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import "../../../theme/fontSize.css";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import ViewAssessment from "../Components/ViewAssessment";
import FileUploadIcon from '@mui/icons-material/FileUpload';

const AddAssessment = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const [exportLoading, setExportLoading] = useState(false);
  const { signedinUserRoleHT, signedinOrgType } = useContext(CommonDataContext);
  const location = useLocation();
  const viewAssessment = location.state && location.state.viewAssessment;
  const childRef = useRef();

  const handleButtonClick = () => {
    if (childRef.current) {
      childRef.current.handleExport();
    }
  };

  useEffect(() => {
    if (viewAssessment) {
      document.title = "Assessments | View | ThriveWell";
    }
  }, [signedinOrgType, signedinUserRoleHT]);

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "Assessment",
    true
  );

  return (
    <>
      <Box
        id="scroller"
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12} sx={{ mr: 1 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textPrimary"
                  sx={{ cursor: "pointer" }}
                  variant="h5"
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
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/dashboard/assessments")}
                    variant="h5"
                  >
                    {t("common:common.Assessments")}
                  </Typography>
                </Grid>
                <Box
                  sx={{
                    m: 0.75,
                  }}
                  style={{ cursor: "text" }}
                >
                  <ChevronRightIcon color="disabled" fontSize="small" />
                </Box>
                <Grid item>
                  <Typography color="textPrimary" variant="h5">
                    {t("common:assessment.View Assessment")}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                <LoadingButton
                  loadingPosition="start"
                  loading={exportLoading}
                  variant="contained"
                  onClick={() => handleButtonClick()}
                  startIcon={<FileUploadIcon />}
                >
                  {t("common:common.Export")}
                </LoadingButton>
              </Grid>
            </Grid>

            <Box mt={3}>
              <ViewAssessment
                ref={childRef}
                setExportLoading={setExportLoading}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AddAssessment;
