import React, { useEffect, useState } from "react";
import { Grid, Box, Skeleton } from "@mui/material";
import InfoTile from "../../../../components/InfoTile/InfoTile";
import CommonCard from "../../../../components/CommonCard/CommonCard";
import { InterventionsIconBlack } from "../../../../assets/icons/SideBarIcons";
import APIS from "../../../../common/hooks/UseApiCalls";

const FamilyInterventionsTiles = ({ familyId, t }) => {
  const [interventions, setInterventions] = useState({
    active_interventions: 0,
    completed_interventions: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    setLoading(true);
    APIS.GetFamilyInterventionSummary(familyId)
      .then((res) => {
        if (res?.data?.data) {
          setInterventions({
            active_interventions: res.data.data.active_interventions || 0,
            completed_interventions: res.data.data.completed_interventions || 0,
          });
        }
      })
      .catch(() => {
        setInterventions({
          active_interventions: 0,
          completed_interventions: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [familyId]);

  return (
    <CommonCard title= {t("common:family.Interventions summary")}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {loading ? (
            <Skeleton variant="rectangular" height={80} />
          ) : (
            <InfoTile
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{interventions.active_interventions}</span>
                  <InterventionsIconBlack />
                </Box>
              }
              description= {t("common:common.Active interventions", "Active interventions")}
              bgcolor="#F3F6FA"
              height={1}
            />
          )}
        </Grid>
        <Grid item xs={6}>
          {loading ? (
            <Skeleton variant="rectangular" height={80} />
          ) : (
            <InfoTile
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{interventions.completed_interventions}</span>
                  <InterventionsIconBlack />
                </Box>
              }
              description= {t("common:common.Resolved interventions", "Resolved interventions")}
              bgcolor="#F3F7E2"
              height={1}
            />
          )}
        </Grid>
      </Grid>
    </CommonCard>
  );
};

export default FamilyInterventionsTiles;