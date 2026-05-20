import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import {
  Grid,
} from "@mui/material";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import FamilyMembers from "../FamilyMembers/FamilyMembers";
import MostReccentAssessmentSummary from "./MostReccentAssessmentSummary";
import FamilySummary from "./FamilySummary";
import ToDoWidget from "./ToDoWidget";
import APIS from "../../../../common/hooks/UseApiCalls";
import FamilyHistory from "./FamilyHistory";
import InfoTile from "../../../../components/InfoTile/InfoTile";
import FamilyInterventionsTiles from "./FamilyInterventionsTiles";
import { Box } from "@mui/system";
import { Masonry } from "@mui/lab";
import { ConcerningBehaviorList } from "../../../Child/Components/ChildBasicDetails/ConcerningBehaviorList";
import { ChildOverviewList } from "../../../Child/Components/ChildBasicDetails/ChildOverviewList";
import FamilyMembersAndCaregivers from "../FamilyMembersAndCaregivers";
import useCRUDPermissions from "../../../../components/UserComponents/useCRUDPermissions";

const FamilyBasicDetails = ({ family, refreshData }) => {
  const { signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const [mostRecentAssesmentSummary, setMostRecentAssesmentSummary] = useState({});
  const [loadingMostRecentAssessmentSummary, setLoadingMostRecentAssessmentSummary] = useState(false);
  const [apiError, setApiError] = useState(false);
  const { 
    IS_HT_ALLOWED, 
    BOTH_FS_HT_ALLOWED, 
  } = useCRUDPermissions();

  useEffect(() => {
    getMostRecentAssesmentSummary();
  }, []);

  const getMostRecentAssesmentSummary = async () => {
    setLoadingMostRecentAssessmentSummary(true);
    setApiError(false);
    try {
      const response = await APIS.GetMostRecentAssesmentSummary(family?.id);
      if (response.data && response.data.data) {
        setMostRecentAssesmentSummary(response.data.data);
      }
    } catch (error) {
      setApiError(true);
      console.error("Error fetching organizational overview data:", error);
    } finally {
      setLoadingMostRecentAssessmentSummary(false);
    }
  };

  // --- RENDERING LOGIC ---

  // Define the widgets to keep code clean
  const SummaryWidget = BOTH_FS_HT_ALLOWED && (
    <Box sx={{ height: "fit-content", width: "100%" }}>
      <FamilySummary t={t} family={family} mostRecentAssesmentSummary={mostRecentAssesmentSummary} />
    </Box>
  );

  const MembersWidget = BOTH_FS_HT_ALLOWED && (
    <Box sx={{ height: "fit-content", width: "100%" }}>
      <FamilyMembersAndCaregivers members={family?.members} refreshData={refreshData} />
    </Box>
  );

  // If HT is not allowed, we only have 2 widgets. Use Grid for stability.
  if (!IS_HT_ALLOWED) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {SummaryWidget}
        </Grid>
        <Grid item xs={12} md={6}>
          {MembersWidget}
        </Grid>
      </Grid>
    );
  }

  // If HT is allowed, use Masonry for the multi-widget dashboard look
  return (
    <Masonry columns={2} spacing={2}>
      {SummaryWidget}
      
      <Box sx={{ height: "fit-content" }}>
        <ToDoWidget t={t} TWFamilyId={family?.id} />
      </Box>

      <Box sx={{ height: "fit-content" }}>
        <FamilyInterventionsTiles t={t} familyId={family?.id} />
      </Box>

      <Box sx={{ height: "fit-content" }}>
        <MostReccentAssessmentSummary
          reloadFunc={getMostRecentAssesmentSummary}
          apiError={apiError}
          data={mostRecentAssesmentSummary}
          loading={loadingMostRecentAssessmentSummary}
          t={t}
        />
      </Box>

      {MembersWidget}
    </Masonry>
  );
};

export default FamilyBasicDetails;
