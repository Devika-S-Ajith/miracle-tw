import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Divider,
  CircularProgress,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import ErrorWithReload from "../../GovtDashboardOverview/Components/ErrorWithReload";

const DashboardCountWidgets = ({
  title,
  linkAddress,
  data,
  isloading,
  canViewReport,
  hasError,
  handleReload = () => {},
}) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (linkAddress) {
      navigate(linkAddress, { state: { fromDashboard: true } });
    }
  };

  const renderContent = () => {
    if (isloading) {
      return <CircularProgress color="primary" sx={{ mt: 1 }} />;
    }

    if (hasError) {
      return (
        <ErrorWithReload onReload={handleReload} />
      );
    }

    return (
      <Typography color="textPrimary" sx={{ mt: 1 }} variant="h4">
        {data ?? "-"}
      </Typography>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          height: 1,
        }}
      >
        <Box flexGrow={1}>
          <Typography color="textPrimary" variant="subtitle2">
            {title}
          </Typography>
          {renderContent()}
        </Box>

        {linkAddress && canViewReport && !hasError && (
          <>
            <Divider sx={{ my: 2, mx: -2 }} />
            <Box sx={{ px: 3, maxHeight: 93 }}>
              <Button
                color="primary"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                variant="text"
                onClick={handleNavigation}
              >
                {t("common:common.View Report")}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};

export default DashboardCountWidgets;