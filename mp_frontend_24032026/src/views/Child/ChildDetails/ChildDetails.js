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
  IconButton,
  Modal
} from "@mui/material";
import ChildContactDetails from "../Components/ChildContactDetails";
import ChildHistory from "../Components/ChildHistory";
import Documents from "../Components/Documents";
import ProgressReport from "../Components/ProgressReport";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import PencilAltIcon from "../../../assets/icons/PencilAlt";
import APIS from "../../../common/hooks/UseApiCalls";
import Assessments from "../Components/Assessments";
import { useTranslation } from "react-i18next";
import RadarGraph from "../Components/RadarGraph/RadarGraph";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { authorizationConfig } from "../../../assets/authorizationConfig";
import Loader from "../../../components/UserComponents/Loader";
import ChildMilestones from "../Components/ChildMilestones/ChildMilestones";
import FollowUps from "../../Assessments/Components/FollowUps";
import ChildInterventions from "./ChildInterventions";
import ConsolidatedAssessmentProgressReport from "../../../components/ConsolidatedAssessmentProgressReport";
import ChildSummary from "../Components/ChildBasicDetails";
import ChildBasicDetails from "../Components/ChildBasicDetails";
import ChildLogs from "../Components/ChildLogs";
import ManageChildForm from "../Components/ChildListTable/ChildDetailForms/ManageChildForm";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
                                                                    
const tabs = [
  { label: "Details", value: "details" },
  { label: "Assessments & Progress Reports", value: "assessmentsProgressReports", id: "tab_assessments_progress_reports" },
 // { label: "Milestones", value: "Milestones" },
  //{ label: "Interventions", value: "interventions", id: "tab_interventions" },
  { label: "Follow - ups", value: "followUps" },
  { label: "Thrive scale score trend", value: "Thrive scale score trend" },
  { label: "History", value: "History" },
  { label: "Documents", value: "Documents" },
  { label: "Logs", value: "childLogs" },
];
const ChildDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const comingFromChildList = Boolean(state?.tabvalue);
  const currtabvalue = state?.tabvalue;
  const [children, setChildren] = useState(null);
  const [currentTab, setCurrentTab] = useState(
    comingFromChildList ? currtabvalue : "details"
  );
  let { id } = useParams();
  const { signedinOrgType, signedinUserRoleHT } = useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const { allowedRoles, allowedOrgTypes } = authorizationConfig["AddChild"];
  const[memberList, setMemberList] = useState([]);
  const[childDetailsLoading, setChildDetailsLoading] = useState(false);
  const [isActiveFamily,setIsActiveFamily] = useState(false);

  const [childModalOpen, setChildModalOpen] = useState(false);
  const [hideChildModal, setHideChildModal] = useState(false);
  const handleChildModalOpen = () => {
    setChildModalOpen(!childModalOpen);
  };

  const getMembersUnderFamily = async (familyId) => {
    try {
      
      if (!familyId) {
        setMemberList([]);
        setChildDetailsLoading(false);
        return;
      }

      const payload = { id: familyId, listType: "DETAILED" };
      const data = await APIS.GetFamilyDetails(payload);
      const members = data?.data?.data?.members || [];
      setMemberList(members);
      setChildDetailsLoading(false);
    } catch (err) {
      setChildDetailsLoading(false);
      console.error(err);
    }
  };

  const getChildren = useCallback(async () => {
    setChildDetailsLoading(true)
    setChildren(null)
    try {
      const res = await APIS.GetChildDetails(id);
      console.log("Child full data ====>", res.data.data);
      console.log("HTCaseId ====>", res.data.data?.HTCaseId);
      setChildren(res.data.data);
      const familyId = res.data.data?.TWFamilyId;
      getMembersUnderFamily(familyId);
    } catch (err) {
      console.log("GET CHILD ERROR ====>", err);          // add this
      setChildDetailsLoading(false)
      console.error(err);
    }
  }, [id]);

    useEffect(() => {
    document.title = "Child | Details | ThriveWell";
    getChildren();
    return () => {};
  }, [getChildren]);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };
  // if (!children) {
  //   return null;
  // }
  const renderTabContent = () => {
    switch (currentTab) {
      case "details":
        return (
          <ChildBasicDetails child={children} members={memberList} />
          // <ChildContactDetails
          //   name={`${children.firstName} ${children.lastName ?? ""}`}
          //   country={children.HTCountryId}
          //   gender={children.gender}
          //   birthdate={children.birthDate}
          //   isVerified={children.isActive}
          //   caseManager={
          //     children?.userFirstName
          //       ? `${children.userFirstName} ${children.userLastName ?? ""}`
          //       : ""
          //   }
          //   caregiver={children.familyMemberName}
          //   organization={children.HTOrganizationId}
          //   email={children.email}
          //   phone={children.phoneNumber}
          //   language={children.HTLanguageId}
          //   id={children.id}
          //   state={children.HTStateId}
          //   city={children.city}
          //   district={children.HTDistrictId}
          //   zip={children.zipCode}
          //   address1={children.addressLine1}
          //   address2={children.addressLine2}
          //   education={children.HTChildEducationLevelId}
          //   status={children.HTChildStatusId}
          //   placementStatus={children.HTChildPlacementStatusId}
          //   currentPlacement={children.HTChildCurrentPlacementStatusId}
          //   addDate={children.dateOfEntry}
          //   closedDate={children.dateOfExit}
          //   educationSpecific={children.highestEducationLevel}
          //   profileImage={children.fileUrl}
          //   familyName={children.familyName}
          //   familyId={children?.HTFamilyId}
          //   childStatus={children.isActive}
          //   childStatusList={children.childStatusList}
          //   familyMembers={memberList}
          //   getMembersUnderFamily={getMembersUnderFamily}
          //   getChildren={getChildren}
          //   isActiveFamily={isActiveFamily}
          // />
        );
      case "Assessments":
        return <Assessments childId={children.id} />;
      case "Documents":
        return <Documents childId={children.id} active={children?.isActive} />;
      case "History":
        return <ChildHistory id={children.id} caseId={children.HTCaseId} />;
      case "Thrive scale score trend":
        return <RadarGraph childId={children.id} />;
      case "ProgressReport":
        return <ProgressReport id={children.id} caseId={children.HTCaseId} />;
      case "followUps":
        return <FollowUps id={children.id} caseId={children.HTCaseId} type="CHILD" />;
      case "assessmentsProgressReports":
        return (
          <Box mr>
            <ConsolidatedAssessmentProgressReport id={children.id} pageType="CHILD" />;
          </Box>
        );
        case "Milestones":
          return <ChildMilestones familyMembers={memberList}  familyName={children?.familyName}/>;
      case "interventions":
        return <ChildInterventions childId={children?.id} memberList={memberList} />;
      case "childLogs":
        return <ChildLogs module="children" />;
      default:
        return null;
    }
  };

  return (
    <>
    <Modal
        open={childModalOpen}
        onClose={handleChildModalOpen}
        sx={{ visibility: hideChildModal ? "hidden" : "visible" }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500, md: 600, lg: 700 },
            bgcolor: "background.paper",
            // border: "2px solid #000",
            p: 3,
            boxShadow: 24,
          }}
        >
          <ManageChildForm
            handleChildModalOpen={handleChildModalOpen}
            id={id}
            // refreshTable={getTableData} // Refresh data after re-opening case
            setHideChildModal={setHideChildModal}
          />
        </Box>
      </Modal>
      <Loader loading={childDetailsLoading} />
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
                label: t("common:common.Children"),
                onClick: () => navigate("/dashboard/children")
               },
                {
                  label: `${children?.firstName} ${children?.lastName ?? ""}`,
                },
              ]}
            />
              </Grid>
              <Grid item>
                <Box sx={{ m: -1 }}>
                  {allowedOrgTypes.includes(signedinOrgType) &&
                  allowedRoles.includes(signedinUserRoleHT) ? (
                    (currentTab === "details" ||
                      currentTab === "CCI" ||
                      currentTab === "Family") && (
                      <Button
                        color="primary"
                        startIcon={<PencilAltIcon fontSize="small" />}
                        sx={{ m: 1 }}
                        variant="contained"
                        onClick={() => {
                          setChildModalOpen(true);
                          // ModalService.open(
                          //   ({ close }) => (
                          //     <ManageChildForm close={close} id={id} />
                          //   ),
                          //   {
                          //     width: "30%",
                          //     height: "95%",
                          //     hideModalFooter: true,
                          //     enableClose: false,
                          //   },
                          // );
                        }}
                      >
                        {t("common:common.Edit")}
                      </Button>
                    )
                  ) : (
                    <></>
                  )}
                  {currentTab == "Family" && children.TWFamilyId ? (
                    <Button
                      color="primary"
                      component={RouterLink}
                      sx={{ m: 1 }}
                      to={`/dashboard/families/${children.TWFamilyId}/view`}
                      variant="contained"
                    >
                      {t("common:common.View Family Page")}
                    </Button>
                  ) : (
                    <></>
                  )}
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 1 }}>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={currentTab}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={t(`common:common.${tab.label}`, tab.label)}
                    value={tab.value}
                  />
                ))}
              </Tabs>
            </Box>
            <Divider />
            <Box sx={{ mt: 3 }}>
              {/* {currentTab === "details" && (
                <ChildContactDetails
                  name={`${children.firstName} ${children.lastName ?? ""}`}
                  country={children.HTCountryId}
                  gender={children.gender}
                  birthdate={children.birthDate}
                  isVerified={children.isActive}
                  caseManager={
                    children?.userFirstName
                      ? `${children.userFirstName} ${children.userLastName ?? ""}`
                      : ""
                  }
                  caregiver={children.familyMemberName}
                  organization={children.HTOrganizationId}
                  email={children.email}
                  phone={children.phoneNumber}
                  language={children.HTLanguageId}
                  id={children.id}
                  state={children.HTStateId}
                  city={children.city}
                  district={children.HTDistrictId}
                  zip={children.zipCode}
                  address1={children.addressLine1}
                  address2={children.addressLine2}
                  education={children.HTChildEducationLevelId}
                  status={children.HTChildStatusId}
                  placementStatus={children.HTChildPlacementStatusId}
                  currentPlacement={children.HTChildCurrentPlacementStatusId}
                  addDate={children.dateOfEntry}
                  closedDate={children.dateOfExit}
                  educationSpecific={children.highestEducationLevel}
                  profileImage={children.fileUrl}
                  familyName={children.familyName}
                  familyId ={children?.HTFamilyId}
                  childStatus={children.isActive}
                  childStatusList={children.childStatusList}
                  familyMembers={memberList}
                  getMembersUnderFamily={getMembersUnderFamily}
                  getChildren={getChildren}
                  isActiveFamily={isActiveFamily}
                />
              )}
              {currentTab === "Assessments" && (
                <Assessments childId={children.id} />
              )}
               {currentTab === "Milestones" && (
                <ChildMilestones/>
              )}
              {currentTab === "Documents" && (
                <Documents childId={children.id} active={children?.isActive} />
              )}
              {currentTab === "History" && (
                <ChildHistory id={children.id} caseId={children.HTCaseId} />
              )}
              {currentTab === "Thrive scale score trend" && (
                <RadarGraph childId={children.id} />
              )}
              {currentTab === "ProgressReport" && (
                <ProgressReport id={children.id} caseId={children.HTCaseId} />
              )} */}
              {renderTabContent()}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default ChildDetails;
