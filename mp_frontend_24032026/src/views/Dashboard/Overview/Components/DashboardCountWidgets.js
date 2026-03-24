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

const DashboardCountWidgets = (props) => {
  const { t } = useTranslation(["common"]);
  const {
    title,
    sequence,
    linkAddress,
    data,
    isloading,
    canViewReport,
    percentageData,
    ...other
  } = props;
  const navigate = useNavigate();

  const handleNavigation = (linkData) => {
    if (linkData) {
      navigate(linkData, {
        state: {
          fromDashboard: true,
        },
      });
    } else {
      return;
    }
  };

  return (
    <Card {...other} sx={{ height: "100%" }}>
      <Box
        id="dashboard-widget"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          height:1
        }}
      >
        <Box flexGrow={1}>

          <Typography color="textPrimary" variant="subtitle2">
            {title}
          </Typography>
          {!isloading ? (
            <>
              {
                <>
                  <Typography
                    color="textPrimary"
                    sx={{ mt: 1 }}
                    variant="h4"
                    display="inline"
                  >
                    {data}
                  </Typography>
                  {sequence === 2 && (
                    <Typography
                      color="#bfb5b2"
                      sx={{ float: "right", mt: 1 }}
                      variant="h5"
                      display="inline"
                    >
                      {percentageData}%
                    </Typography>
                  )}
                </>
              }
            </>
          ) : (
            <CircularProgress color="primary" sx={{ mt: 1 }} />
          )}
        </Box>

       {linkAddress && (
          <>
            <Divider sx={{ my: 2, mx: -2 }} />

            <Box
              sx={{
                px: 3,
                // py: 2,
                maxHeight: 93,
              }}
            >
              <Button
                color="primary"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                variant="text"
                disabled={canViewReport}
                onClick={() => {
                  handleNavigation(linkAddress);
                }}
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
