import { Box } from "@mui/material";
import React from "react";
import ChildSummary from "./ChildSummary";
import ToDoWidget from "../../../Family/Components/FamilyBasicDetails/ToDoWidget";
import { useTranslation } from "react-i18next";
import { Masonry } from "@mui/lab";
import FamilyMembersAndCaregivers from "../../../Family/Components/FamilyMembersAndCaregivers";


const ChildBasicDetails = ({ child, members }) => {
  const { t } = useTranslation(["common"]);
  const familyId = child?.HTFamilyId ?? child?.TWFamilyId;


  return (
    // <Grid container gap={2}>
    //   <Grid item xs={12} md={6}>


    //     <ChildSummary child={child} />
    //     <ToDoWidget t={t}  />
    //   </Grid>
    // </Grid>
    <Masonry columns={2} spacing={2}>
      <Box sx={{ height: "fit-content" }}>
        <ChildSummary child={child} />
      </Box>
      {/* <Box height="fit-content">
        <ChildOverviewList t={t} />
      </Box> */}
      <Box height="fit-content">
        <ToDoWidget t={t} HTFamilyId={familyId} />
      </Box>
      {/* <Box height="fit-content">
        <ConcerningBehaviorList />
      </Box> */}
      {/* <Box height="fit-content">
        <InterventionsSummary />
      </Box>
      <Box height="fit-content">
        <MostReccentAssessmentSummary />
      </Box> */}
      <Box height="fit-content">
        <FamilyMembersAndCaregivers members={members} />
      </Box>
    </Masonry>
  );
};

export default ChildBasicDetails;
