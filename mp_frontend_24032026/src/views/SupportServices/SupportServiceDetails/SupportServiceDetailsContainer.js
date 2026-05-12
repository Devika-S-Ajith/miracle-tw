import React from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router";
import SupportServiceDetails from "./SupportServiceDetails";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import { useTranslation } from "react-i18next";

const SupportServiceDetailsContainer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  return (
    <Box m={2} mx={1}>
      <PageBreadcrumbs
        data={[
          {
            label: t("common:common.Support Services", "Support Services"),
            onClick: () => navigate("/admin/support-services"),
          },
          {
            label: t(
              "common:infoCard.Support service details",
              "Support service details",
            ),
          },
        ]}
      />

      <Grid container spacing={2}>
        <Grid xs={12} sm={12} md={5} item>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <SupportServiceDetails />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupportServiceDetailsContainer;
