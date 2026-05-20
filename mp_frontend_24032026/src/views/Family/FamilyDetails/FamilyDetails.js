import { useCallback, useState, useEffect, useContext } from "react";
import {
  Link as RouterLink,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import FamilyBasicDetails from "../Components/FamilyBasicDetails";
import PencilAltIcon from "../../../assets/icons/PencilAlt";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import Loader from "../../../components/UserComponents/Loader";
import FamilyAssessments from "../Components/FamilyAssessments/FamilyAssessments";
import FamilyProgressReport from "../Components/ProgressReport/FamilyProgressReport";
import FamilyDocuments from "../Components/FamilyDocuments/FamilyDocuments";
import RadarGraph from "../../Child/Components/RadarGraph/RadarGraph";
import FamilyHistory from "../Components/FamilyHistory";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import FollowUps from "../../Assessments/Components/FollowUps";
import FamilyMilestones from "../Components/FamilyMilestones/FamilyMilestones";
import FamilyInterventions from "./FamilyInterventions";
import ConsolidatedAssessmentProgressReport from "../../../components/ConsolidatedAssessmentProgressReport";
import ChildLogs from "../../Child/Components/ChildLogs";
import useCRUDPermissions from "../../../components/UserComponents/useCRUDPermissions";





const FamilyDetails = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [family, setFamily] = useState(null);
  const [currentTab, setCurrentTab] = useState("details");
  const { state: locationValues } = useLocation();
  const [memberList, setMemberList] = useState([]);
  const { 
    IS_HT_ALLOWED, 
    IS_FS_ALLOWED,
    BOTH_FS_HT_ALLOWED, 
    IS_EDIT_ALLOWED 
  } = useCRUDPermissions();


  const tabs = [
    { label: "Details", value: "details", id: "tab_details", Permission:BOTH_FS_HT_ALLOWED },
    { label: "Logs", value: "ConsolidatedLog", id: "tab_logs", Permission:IS_FS_ALLOWED },
    { label: "Assessments & Progress Reports", value: "assessmentsProgressReports", id: "tab_assessments_progress_reports" , Permission:IS_HT_ALLOWED  },
    //{ label: "Milestones", value: "milestones" ,id:"tab_milestones" },
    //{ label: "Interventions", value: "interventions", id: "tab_interventions" },
    { label: "Follow - ups", value: "followUps", id: "tab_follow_ups", Permission:IS_HT_ALLOWED },
    {
      label: "Thrive scale score trend",
      value: "thriveScale score trend",
      id: "tab_thriveScale_score_trend",
      Permission:IS_HT_ALLOWED
    },
    { label: "History", value: "history", id: "tab_history" , Permission:BOTH_FS_HT_ALLOWED },
    { label: "Documents", value: "documents", id: "tab_documents", Permission:BOTH_FS_HT_ALLOWED },
  ];

  useEffect(() => {
    if (locationValues) {
      setCurrentTab(locationValues.tabvalue);
    }
  }, []);

  let { id } = useParams();

 
  useEffect(() => {
    document.title = "Family | Details | ThriveWell";
    getFamilyDetails();
    return () => {};
  }, []);

  // useAuthorization(
  //   signedinUserRoleHT,
  //   signedinUserRoleFS,
  //   signedinOrgType,
  //   "ManageFamily",
  //   true
  // );

  const getFamilyDetails = useCallback(async () => {
    setLoading(true);
    const payload = {
      id: id,
      listType:"DETAILED"
    };
    try {
      const data = await APIS.GetFamilyDetails(payload);
      setFamily(data.data.data || {});
      setMemberList(data?.data?.data?.members || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };


  const renderTabContent = () => {
    switch (currentTab) {
      case "details":
        return (
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              {family && (
                <FamilyBasicDetails
                  family={family}
                  refreshData={getFamilyDetails}
                />
              )}
            </Grid>
          </Grid>
        );
      case "assessments":
        return <FamilyAssessments id={family?.id} />;
      case "thriveScale score trend":
        return <RadarGraph familyId={family?.id} />;
      case "progressReport":
        return <FamilyProgressReport id={family?.id} />;
      case "documents":
        return <FamilyDocuments active={family?.isActive} />;
      case "history":
        return <FamilyHistory id={family?.id} />;
      case "followUps":
        return <FollowUps id={family?.id} type="FAMILY" />;
      case "interventions":
        return <FamilyInterventions memberList={memberList} familyId={family?.id} />;
      case "milestones":
        return <FamilyMilestones  familyMembers={memberList}  familyName={family.familyName} />;
      case "assessmentsProgressReports":
        return <ConsolidatedAssessmentProgressReport id={family?.id} pageType="FAMILY" />;
      case "ConsolidatedLog":
        return <ChildLogs module="family" showForChild={true} />;
      default:
        return null;
    }
  };
  return (
    <>
      <Loader loading={loading} />
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12} sx={{ mr: 1 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <PageBreadcrumbs
                  data={[
                    {
                      label: t("common:family.Families"),
                      onClick: () => navigate("/dashboard/families"),
                      href: "/dashboard/families",
                    },
                    {
                      label: family && family.familyName,
                    },
                  ]}
                />
              </Grid>

              {IS_EDIT_ALLOWED && (
                <Grid item>
                  <Box sx={{ m: -1 }}>
                    <Button
                      color="primary"
                      component={RouterLink}
                      startIcon={<PencilAltIcon fontSize="small" />}
                    sx={{ m: 1 }}
                    to={`/dashboard/families/${family && family.id}/edit`}
                    variant="contained"
                  >
                    {t("common:common.Edit")}
                  </Button>
                </Box>
              </Grid>)}
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={currentTab}
                variant="scrollable"
              >
                {tabs.filter((tab) => tab.Permission).map((tab) => (
                  <Tab
                    key={tab.value}
                    id={tab.id}
                    label={t(`common:common.${tab.label}`, tab.label)}
                    value={tab.value}
                  />
                ))}
              </Tabs>
            </Box>
            <Divider />
            <Box sx={{ mt: 3 }}>{renderTabContent()}</Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default FamilyDetails;
