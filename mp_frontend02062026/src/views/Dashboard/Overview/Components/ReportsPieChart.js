import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
} from "@mui/material";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import { useTranslation } from "react-i18next";
import MUIPieChart from "./MUIPieCharts";
import ErrorWithReload from "../../GovtDashboardOverview/Components/ErrorWithReload";

const ReportsPieChart = ({ title, res, loading, reportLink, canViewReport, hasError ,handleReload = () => {} }) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    if (!res || hasError) {
      setChartSeries([]);
      return;
    }

    const valueArray = Object.entries(res).map(([key, value]) => ({
      id: key,
      value,
      label: key,
    }));

    const hasData = valueArray.some((series) => series.value !== 0);
    setChartSeries(hasData ? valueArray : []);
  }, [res, hasError]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (hasError) {
      return (
        <ErrorWithReload onReload={handleReload} />
      );
    }

    if (!chartSeries.length) {
      return (
        <Typography textAlign="center" alignContent="center" justifyContent="center">
          {t("common:common.No data found", "No data found")}
        </Typography>
      );
    }

    return <MUIPieChart series={chartSeries} />;
  };

  return (
    <Card sx={{ mb: 1 }}>
      <CardHeader
        disableTypography
        title={
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography color="textPrimary" variant="subtitle2" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
        }
      />
      <CardContent>{renderContent()}</CardContent>
      {canViewReport && chartSeries.length > 0 && (
        <CardActions
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "background.default",
          }}
        >
          <Button
            color="primary"
            endIcon={<ArrowRightIcon fontSize="small" />}
            variant="text"
            onClick={() =>
              navigate(reportLink, {
                state: { fromDashboard: true },
              })
            }
          >
            {t("common:common.View Report")}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ReportsPieChart;