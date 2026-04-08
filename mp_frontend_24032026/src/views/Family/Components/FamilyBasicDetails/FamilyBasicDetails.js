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

const FamilyBasicDetails = ({ family }) => {


  const { htLanguagesList } =
    useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const [data, setData] = useState({});
  const [loadingMostRecentAssessmentSummary, setLoadingMostRecentAssessmentSummary] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    getMostRecentAssesmentSummary()
    return () => { };
  }, []);

  const getMostRecentAssesmentSummary = async () => {
    setLoadingMostRecentAssessmentSummary(true);
    setApiError(false);
    try {
      const response = await APIS.GetMostRecentAssesmentSummary(family?.id);
      if (response.data && response.data.data) {
        const mostRecentAssesmentSummary = response.data.data;
        setData(
          mostRecentAssesmentSummary
        );
      }
    } catch (error) {
      setApiError(true);
      console.error("Error fetching organizational overview data:", error);
    } finally {
      setLoadingMostRecentAssessmentSummary(false);
    }
  };

  return (

    <Masonry columns={2} spacing={2}>
      <Box sx={{ height: "fit-content" }}>
        <FamilySummary t={t} family={family} />
      </Box>
      {/* <Box height="fit-content">
        <ChildOverviewList t={t} />
      </Box> */}
      <Box height="fit-content">
        <ToDoWidget t={t} HTFamilyId={family?.id} />
      </Box>
      {/* <Box height="fit-content">
        <ConcerningBehaviorList />
      </Box> */}
      <Box height="fit-content">
        <FamilyInterventionsTiles familyId={family?.id} />
      </Box> 
      {/* <Box height="fit-content">
        <FamilyInterventionsTiles familyId={family?.id} />
      </Box> */}
      {/* <Box height="fit-content">
        <FamilyInterventionsTiles familyId={family?.id} />
      </Box> */}
      <Box height="fit-content">
        <MostReccentAssessmentSummary
          reloadFunc={getMostRecentAssesmentSummary}
          apiError={apiError}
          data={data}
          loading={loadingMostRecentAssessmentSummary} />
      </Box>
      <Box height="fit-content">
        <FamilyMembersAndCaregivers  members={family?.members} />
      </Box>
    </Masonry>




    // <Grid container spacing={2}>
    //   <Grid item md={5.9} sm={11.5}>
    //     <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    //       <FamilySummary
    //         t={t}
    //         familyName={familyName}
    //         address1={address1}
    //         address2={address2}
    //         city={city}
    //         district={district}
    //         state={state}
    //         country={country}
    //         phoneNumber={familyMembers?.find(member => member.isPrimaryCareGiver)?.phoneNumber}
    //         caseworkerName={caseworkerName}
    //         id={id}
    //         status={status}
    //         language={language}
    //         htLanguagesList={htLanguagesList || []}
    //         firstAssessmentThriveScaleScore={data?.firstAssessmentThriveScaleScore}
    //         thriveScaleScore={data?.thriveScaleScore}
    //         assessmentDate={data?.assessmentDate}
    //         firstAssessmentDateOfAssessment={data?.firstAssessmentDateOfAssessment}
    //         percentageChangeFromFirst={data?.percentageChangeFromFirst}
    //       />
    //       {/* <ToDoWidget t={t} HTFamilyId={id} />
    //       <FamilyHistory t={t} HTFamilyId={id} /> */}
    //     </Box>
    //   </Grid>
    //   <Grid item md={5.9} xs={11.5}>
    //     <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    //       {/* {data?.assessmentId && 
    //         <MostReccentAssessmentSummary reloadFunc={getMostRecentAssesmentSummary} apiError={apiError} data={data} loading={loadingMostRecentAssessmentSummary} />
    //       }
    //       <FamilyInterventionsTiles familyId={id} /> */}
    //       {/* <FamilyMembers
    //         familyMembers={familyMembers}
    //         caseworkerName={caseworkerName}
    //         familyId={id}
    //         familyName={familyName}
    //         getFamilyMembers={getMembersUnderFamily}
    //         type={"FAMILY"}
    //         isActiveFamily={status}
    //       /> */}
    //     </Box>
    //   </Grid>
    // </Grid>
  )
};

export default FamilyBasicDetails;
