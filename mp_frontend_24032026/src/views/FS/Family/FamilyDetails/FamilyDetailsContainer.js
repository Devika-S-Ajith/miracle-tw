import React, { useContext, useEffect, useState } from "react";
import { Grid, Typography, Tabs, Tab, Box } from "@mui/material";
import FamilyDetails from "./FamilyDetails";
import RecentNotifications from "./RecentNotifications";
import UploadedImages from "./UploadedImages";
import FamilyLogDetails from "./FamilyLogDetails";
import { useNavigate, useParams } from "react-router";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import ChildCombinedLogsList from "../../Child/ChildDetails/ChildCombinedLogsList";
import { FamilyMembersSection } from "./FamilyMemberSection";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";

const FamilyDetailsContainer = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [familyName, setFamilyName] = useState();
  
  const { id } = useParams();
  const [familyData, setFamilyData] = useState();
  const { signedinUserRoleFS } = useContext(CommonDataContext);

  useAuthorization(null, signedinUserRoleFS, null, "FSFamily", false);

  useEffect(() => {
    if (id) getFamilyDetailsHandler();
    return () => {};
  }, [id]);

  const getFamilyDetailsHandler = async () => {
    try {
      const res = await APIS.getFsFamily(id);
      if (res?.status === 200) {
        setFamilyData(res.data.data);
      }
    } catch (error) {}
  };

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box m={2}>
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
        mb={2}
      >
        <Typography
          color="textPrimary"
          variant="h5"
          fontWeight={700}
          fontSize="1.5rem"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/dashboard")}
        >
          FosterShare
        </Typography>
        <ChevronRightIcon color="disabled" fontSize="small" />
        <Typography
          color="textPrimary"
          variant="h5"
          fontWeight={700}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/families")}
        >
          Families
        </Typography>
        <ChevronRightIcon color="disabled" fontSize="small" />
        <Typography
          color="textPrimary"
          variant="h5"
          fontWeight={700}
          sx={{ pointerEvents: "none" }}
        >
          {familyName || "Family details"}
        </Typography>
      </Box>
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Details" />
        <Tab label="Logs" />
      </Tabs>
      {tabIndex === 0 && (
        <Grid container spacing={2}>
          <Grid xs={12} sm={12} md={5} item>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FamilyDetails familyData={familyData} familyName={familyName} setFamilyName={setFamilyName} />
              <UploadedImages />
              <RecentNotifications />
              <FamilyMembersSection
              childData={familyData?.children || []}
              parentData={familyData?.secondaryParents || []}
              primaryParent={[{
                email: familyData?.email,
                firstName: familyData?.firstName,
                id: familyData?.primaryParentId,
                lastName: familyData?.lastName,
                occupation: familyData?.occupation,
                phoneNumber: familyData?.phoneNumber
              }]} />
            </Box>
          </Grid>
          <Grid xs={12} sm={12} md={7} item>
            {/* You can add more details here if needed */}
          </Grid>
        </Grid>
      )}
      {tabIndex === 1 && (
        <Grid container spacing={2}>
          <Grid xs={12} item>
            {/* <FamilyLogDetails /> */}
            <ChildCombinedLogsList showForChild={true} module="families"/>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FamilyDetailsContainer;
