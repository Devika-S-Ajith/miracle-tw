import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Fade,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";

const FosterShareDetailsCard = ({ accountId, selectedCountry }) => {
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(false);
  const [tileData, setTileData] = useState(null);

  useEffect(async () => {
    if (selectedCountry) {
      getFosterShareCounts();
    }
  }, [selectedCountry]);

  const getFosterShareCounts = async () => {
    const payload = {
      TWAccountId: accountId,
      FSCountryId: selectedCountry.id,
      FSUserId: "",
      FSStateId: "",
      FSDistrictId: "",
    };
    try {
      setLoading(true);
      const response = await APIS.DashboardTileDataFS(payload);
      if (response && response.status === 200) {
        setTileData(response?.data?.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Todo - API integration

  return (
    // Todo - Handle props and API integration
    <Card sx={{ borderRadius: "8px", px: 2, height: 1 }}>
      <CardHeader title={t("common:common.FosterShare")} />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={4} direction="column">
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
                  tileData?.caseworkerServed
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:common.Case managers")}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={4} direction="column">
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
                  tileData?.familyServed
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:common.Families")}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={4} direction="column">
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
                  tileData?.childrenServed
                )}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase" }}
              >
                {t("common:common.Children")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FosterShareDetailsCard;
