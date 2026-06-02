import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import PageLoader from "../../../../components/UserComponents/PageLoader";

const ReportHeader = ({ reportHeaderText }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { authStatus, checkAuth } = useAuthorization("Reports");
  
     useEffect(() => {
        checkAuth();
      }, []);
    
      if (authStatus === 'loading' || authStatus === 'idle') {
        return <PageLoader />;
      }
    
      if (authStatus === 'unauthorized') {
        return null; // Or a custom message
      }
  


  return (
    <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <Typography
        color="textPrimary"
        variant="h5"
        onClick={() => navigate("/dashboard")}
        sx={{ cursor: "pointer" }}
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
      <Typography
        color="textPrimary"
        variant="h5"
        onClick={() => navigate("/dashboard/reports")}
        sx={{ cursor: "pointer" }}
      >
        {t("common:common.Reports")}
      </Typography>
      {reportHeaderText && (
        <>
          <Box sx={{ m: 0.75 }} style={{ cursor: "text" }}>
            <ChevronRightIcon color="disabled" fontSize="small" />
          </Box>
          <Typography color="textPrimary" variant="h5">
            {reportHeaderText}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default ReportHeader;
