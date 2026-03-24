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
  CircularProgress
} from "@mui/material";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import { useTranslation } from "react-i18next";
import MUIPieChart from "./MUIPieCharts";

const ReportsPieChart = (props) => {
  const { title, res, loading, labels, reportLink, canViewReport, ...other } = props;
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [chartSeries, setChartSeries] = useState([]);
 
  const parseApiData = (value) => {
    let valueArray = [];
    for (const item in value) {
        let series = { id: item, value: value[item], label: item };
        valueArray.push(series);
    }
    const hasData = valueArray.some((series) => series.value != 0);
    setChartSeries(hasData ? valueArray : []);
};

  useEffect(() => {
    parseApiData(res);
  }, [res]);

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
      <CardContent>
        {!loading ? (
          chartSeries.length ?
            <MUIPieChart
              series={chartSeries} /> :
            <Typography
              alignContent="center"
              textAlign="center"
              justifyContent="center">
              No data found
            </Typography>
        ) : (
          <CircularProgress color="primary" sx={{ mt: 1 }} />
        )}
      </CardContent>
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
          disabled={!canViewReport || !chartSeries.length}
          onClick={() =>
            navigate(reportLink, {
              state: {
                fromDashboard: true,
              },
            })
          }
        >
             {t("common:common.View Report")}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ReportsPieChart;