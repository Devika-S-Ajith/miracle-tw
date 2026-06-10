import { Box, Grid } from "@mui/material";
import ChildSummary from "./ChildSummary";
import ToDoWidget from "../../../Family/Components/FamilyBasicDetails/ToDoWidget";
import { useTranslation } from "react-i18next";
import { Masonry } from "@mui/lab";
import FamilyMembersAndCaregivers from "../../../Family/Components/FamilyMembersAndCaregivers";
import useCRUDPermissions from "../../../../components/UserComponents/useCRUDPermissions";

const ChildBasicDetails = ({ child, members,familyId, refreshData }) => {
  const { t } = useTranslation(["common"]);
  const childId = child?.id;
  const { 
    IS_HT_ALLOWED, 
    BOTH_FS_HT_ALLOWED, 
  } = useCRUDPermissions();
  // return (
   
  //   <Masonry columns={2} spacing={2}>
  //     <Box sx={{ height: "fit-content" }}>
  //       <ChildSummary child={child} />
  //     </Box>
  //     <Box height="fit-content">
  //       <ToDoWidget t={t} TWChildId={childId} />
  //     </Box>
  //     <Box height="fit-content">
       
  //     </Box>
  //   </Masonry>
  // );



  const SummaryWidget = BOTH_FS_HT_ALLOWED && (
      <Box sx={{ height: "fit-content", width: "100%" }}>
        <ChildSummary child={child} />
      </Box>
    );
  
    const MembersWidget = BOTH_FS_HT_ALLOWED && (
      <Box sx={{ height: "fit-content", width: "100%" }}>
        <FamilyMembersAndCaregivers familyId={familyId} members={members} refreshData={refreshData} />
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
          <ToDoWidget t={t} TWChildId={childId} />
        </Box>
        {MembersWidget}
      </Masonry>
    );
};

export default ChildBasicDetails;
