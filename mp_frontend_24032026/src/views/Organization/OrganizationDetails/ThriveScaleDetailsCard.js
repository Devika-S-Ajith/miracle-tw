import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Fade,
  CircularProgress,
  Typography,
  Box
} from "@mui/material";
import { useTranslation } from "react-i18next";
import APIS from "../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";

const ThriveScaleDetailsCard = ({ selectedCountry }) => {
  // Todo - API integration
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(false);
  const [tileData, setTileData] = useState(null);
  let { id } = useParams();

  useEffect(async () => {
    if (selectedCountry) {
      getThriveScaleCounts();
    }
  }, [selectedCountry]);

  const getThriveScaleCounts = async () => {
    const payload = {
      rowCount: "100",
      pageNumber: "1",
      countryFilter: selectedCountry.id,
      stateFilter: "",
      districtFilter: "",
      startDate: "",
      endDate: "",
      TWAccountId: [`${id}`],
    };
    try {
      setLoading(true);
      payload.HTCountryId = selectedCountry?.id;
      const response = await APIS.DashboardTileData(payload);
      if (response && response.status === 200) {
        setTileData(response?.data?.message?.data);
        setLoading(false);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    // Todo - Handle props and API integration
    <Card sx={{ borderRadius: "8px", px: 2, height: 1 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="div">
              {t("common:common.Thrive Scale")}
            </Typography>
          </Box>
        }
      ></CardHeader>
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={3} direction="column">
            <Grid item>
              <Typography variant="subtitle1" fontWeight="bold">
                {loading ? (
                  <>
                    <Fade
                      in={loading}
                      style={{
                        transitionDelay: loading ? "400ms" : "0ms",
                      }}
                      unmountOnExit
                    >
                      <CircularProgress disableShrink size={20} thickness={5} />
                    </Fade>
                  </>
                ) : (
                  tileData?.childrenAssessed || 0
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:reports.Children assessed")}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={3} direction="column">
            <Grid item>
              <Typography variant="subtitle1" fontWeight="bold">
                {loading ? (
                  <>
                    <Fade
                      in={loading}
                      style={{
                        transitionDelay: loading ? "400ms" : "0ms",
                      }}
                      unmountOnExit
                    >
                      <CircularProgress disableShrink size={20} thickness={5} />
                    </Fade>
                  </>
                ) : (
                  tileData?.redflagCount || 0
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:common.RedFlags")}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={3} direction="column">
            <Grid item>
              <Typography variant="subtitle1" fontWeight="bold">
                {loading ? (
                  <>
                    <Fade
                      in={loading}
                      style={{
                        transitionDelay: loading ? "400ms" : "0ms",
                      }}
                      unmountOnExit
                    >
                      <CircularProgress disableShrink size={20} thickness={5} />
                    </Fade>
                  </>
                ) : (
                  tileData?.overallOverdue || 0
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:common.All overdue assessments")}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={3} direction="column">
            <Grid item>
              <Typography variant="subtitle1" fontWeight="bold">
                {loading ? (
                  <>
                    <Fade
                      in={loading}
                      style={{
                        transitionDelay: loading ? "400ms" : "0ms",
                      }}
                      unmountOnExit
                    >
                      <CircularProgress disableShrink size={20} thickness={5} />
                    </Fade>
                  </>
                ) : (
                  tileData?.familyServed || 0
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:common.FamiliesAssessed")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ThriveScaleDetailsCard;
