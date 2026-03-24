import _ from "lodash";
import axios from "axios";
import { AppConfig } from "../config";
import { API, Auth } from "aws-amplify";
import toast from "react-hot-toast";
import API_URLS from "./apiUrls";

//_______________________________________________________________________________
axios.defaults.baseURL = AppConfig.baseURL;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";
axios.defaults.headers.post["Accept"] = "application/json";
axios.defaults.headers.put["Accept"] = "application/json";
axios.defaults.headers.patch["Accept"] = "application/json";
axios.defaults.headers.common["Authorization"] = `${localStorage.getItem(
  "idToken"
)}`;
//_______________________________________________________________________________

const migrateUserAccountBaseURL = AppConfig.migrationURL;

const LocationListURL = AppConfig.baseURL + "/countries";
const OrganisationDetailsPartialURL = AppConfig.baseURL + "/account?id=";
const OrganisationListURL = AppConfig.baseURL + "/accounts";
const ConsentStatusUpdationURL =
  AppConfig.baseURL + "/account/changeConsentStatus";

const AddOrganisationURL = AppConfig.baseURL + "/account";
const EditOrganisationURL = AppConfig.baseURL + "/account";
const ReactivateAccountURL = AppConfig.baseURL + "/reactivate-account";
const GetLinkedOrganisationsURL = AppConfig.baseURL + "/account/filter";
const LinkOrganizationURL = AppConfig.baseURL + "/link-account";
const OrgTypeDetailsPartialURL = AppConfig.baseURL + "/account-types";
const TransferChildOrgList = OrganisationListURL + "/ht-transferChildList";
const TypeListURL = AppConfig.baseURL + "/account-types";

const AddFamilyURL = AppConfig.baseURL + "/ht-family";
const AddFamilyMemberURL = AppConfig.baseURL + "/ht-family/member";
const FamilyListURL = AppConfig.baseURL + "/ht-family/list";
const EditFamilyStatusURL = AppConfig.baseURL + "/ht-family";
const EditFamilyMemberURL = AppConfig.baseURL + "/ht-family/member";
const EditFamilyURL = AppConfig.baseURL + "/ht-family";
const GetFamilyDetails = AppConfig.baseURL + "/ht-family?family_id=";
const exportFamiliesURL = AppConfig.baseURL + "/ht-family/export";
const exportChildrenURL = AppConfig.baseURL + "/ht-child/export";
const exportAssessmentURL = AppConfig.baseURL + "/ht-assessment/exportList";
const LanguageListURL = AppConfig.baseURL + "/languages";
const getFamilyMilestoneListURL = AppConfig.baseURL + "/ht-family/getMilestoneList";

const RelationListURL = AppConfig.baseURL + "/ht-family/relation";
const FamilyInterventionSummaryURL = AppConfig.baseURL + "/ht-family/getInterventionSummary";
const familySituationAndGoalsURL =
  AppConfig.baseURL + "/ht-family/situation-and-goals";
const familyMembersURL = AppConfig.baseURL + "/ht-family/members";
const MemberTypeListURL = AppConfig.baseURL + "/ht-family/membertype";
const FamilyInterventionListURL = AppConfig.baseURL + "/ht-family/familyIntervention";
const FamilyHistoryListURL = AppConfig.baseURL + "/ht-family/listFamilyHistory";
const UserListURL = AppConfig.baseURL + "/users";
const UserRoleList = AppConfig.baseURL + "/user-roles";
const UserDetailsPartialURL = AppConfig.baseURL + "/user?id=";
const AddUserURL = AppConfig.baseURL + "/user";
const EditUserURL = AppConfig.baseURL + "/user";
const UserEmailURL = AppConfig.baseURL + "/user/checkUniqueEmail?email=";
const UserAccountExistanceURL = AppConfig.baseURL + "/user/login/validate";
const migrateUserAccountURL = migrateUserAccountBaseURL + "/update/id";
const updateCognitoIdinRegionalDBURL = AppConfig.baseURL + "/update-cognitoId";
const resetTokenURL =
  "https://iauul2jne9.execute-api.us-east-1.amazonaws.com/dev/reset-token";
const ForgotPasswordURL = AppConfig.baseURL + "/user/forgot-password";
const UpdatePasswordURL = AppConfig.baseURL + "/user/update-password";
const NewPasswordOnRegistrationURL = AppConfig.baseURL + "/user/register";
const validateTSRoleChangeURL = AppConfig.baseURL + "/validate-ht-role-change";
const validateFSRoleChangeURL = AppConfig.baseURL + "/validate-fs-role-change";
const ValidateUserDeactivationTSURL =
  AppConfig.baseURL + "/validate-ht-user-deactivation";
const ValidateUserDeactivationFSURL =
  AppConfig.baseURL + "/fs-user-deactivation-check";
const ChildListURL = AppConfig.baseURL + "/ht-child/list";
const ChildDetailsPartialURL = AppConfig.baseURL + "/ht-child?child_id=";
const AddChildURL = AppConfig.baseURL + "/ht-child";
const ChildDocURL = AppConfig.baseURL + "/ht-child/file";
const FamilyDocURL = AppConfig.baseURL + "/ht-family/file";
const ChildDocumentListURL = AppConfig.baseURL + "/ht-child/get-files";
const FamilyDocumentListURL = AppConfig.baseURL + "/ht-family/get-files";
const ChildPlacementStatusURL = AddChildURL + "/placementStatus";
const ChildStatusURL = AddChildURL + "/childStatus";
const ChildCurrentPlacementURL = AddChildURL + "/currentPlacementStatus";
const ChildEducationLevelURL = AddChildURL + "/educationLevels";
const TransferChildURL = AddChildURL + "/transfer";
const ChildAuditURL = AddChildURL + "/auditlog";
const FamilyAuditURL = AddFamilyURL + "/auditlog";
const fileUploadURL = AppConfig.baseURL + "/create-url-for-upload";

const CaseListURL = AppConfig.baseURL + "/ht-case/list";
const AddCaseURL = AppConfig.baseURL + "/ht-case";
const CaseDetailsPartialURL = AppConfig.baseURL + "/ht-case?case_id=";
const CloseCaseURL = AppConfig.baseURL + "/case/close";
const ConsentURL = AppConfig.baseURL + "/ht-consent-new/listChildFamilyConsent";
const FormListURL = AppConfig.baseURL + "/ht-form";
const DomainListURL = AppConfig.baseURL + "/ht-question/domain";
const AddFormQuetionsURL = AppConfig.baseURL + "/form/questions";
const MappedQuetionsURL = AppConfig.baseURL + "/form/mappedQuestions";
const PreviewFormQuestionsURL = AppConfig.baseURL + "/ht-form/preview?formId=";
const NewPreviewFormQuestionsURL =
  AppConfig.baseURL + "/ht-form/getFormDetails";
const PublishForm = AppConfig.baseURL + "/ht-form/publish";
const UpdateFormURL = AppConfig.baseURL + "/ht-form/updateForm";
const UpdateFormStatus = AppConfig.baseURL + "/ht-form/updateFormStatus";
const SaveNewFormURL = AppConfig.baseURL + "/ht-form/saveNewForm";

const getFormDetailsUrl = AppConfig.baseURL + "/ht-form/getFormDetails";

const VisitTypeListURL = AppConfig.baseURL + "/ht-assessment/visittypes";
const ReIntegrationTypeListURL =
  AppConfig.baseURL + "/ht-assessment/reintegrationtypes";
const AssessmentListURL = AppConfig.baseURL + "/ht-assessment/list";
const SaveResponseURL = AppConfig.baseURL + "/assessment/save/response";

const QuestionDomainListURL = AppConfig.baseURL + "/ht-question/domain";
const QuestionTypeListURL = AppConfig.baseURL + "/tw-question/type";
const QuestionListURL = AppConfig.baseURL + "/ht-question/list";
const GetQuestionDetails = AppConfig.baseURL + "/ht-question?question_id=";
const GetQuestionDetailsForEdit =
  AppConfig.baseURL + "/ht-question/for/edit?question_id=";

const AnswerTypeListURL = AppConfig.baseURL + "/ht-question/answerType";
const CheckIsQuestionUniqueURL =
  AppConfig.baseURL + "/ht-question/check/unique";
const CreateQuestionURL = AppConfig.baseURL + "/ht-question";
const EditQuestionURL = AppConfig.baseURL + "/ht-question";
const EditQuestionStatusURL = AppConfig.baseURL + "/ht-question";
const DeleteQuestionURL = AppConfig.baseURL + "/ht-question";

const ListFormQuestionsURL =
  AppConfig.baseURL + "/ht-assessment/getassessmentform?formId=";
const GetAssessmentDetailsURL =
  AppConfig.baseURL + "/ht-assessment/getassessmentdetails?assessmentId=";
const CalculateScoreURL = AppConfig.baseURL + "/ht-score/calculate";
const ScoreURL = AppConfig.baseURL + "/ht-score";

const UploadURL = AppConfig.baseURL + "/fileUploads/";
const UploadedFilesURL = AppConfig.baseURL + "/fileUploads";

const UploadCSVURL = AppConfig.baseURL + "/fileUploads/importFile/";
const CsvHeaderValue = AppConfig.baseURL + "/importFile/mapdata?documentId=";
const ActualImport = AppConfig.baseURL + "/importFile";

const ListEventsURL = AppConfig.baseURL + "/ht-events/list";
const CreateEventsURL = AppConfig.baseURL + "/ht-events/create";
const DeleteEventsURL = AppConfig.baseURL + "/ht-events";
const EditEventsURL = AppConfig.baseURL + "/ht-events";

const ChildServedReportURL = AppConfig.baseURL + "/report/ht-childrenserved";
const ChildRedFlagReportURL =
  AppConfig.baseURL + "/report/children/ht-redflags";
const DurationFollowupReportURL =
  AppConfig.baseURL + "/report/ht-durationFollowup";
const ChildOverdueReportURL = AppConfig.baseURL + "/report/ht-childoverdue";
const NewlyAddedChildrenReportURL =
  AppConfig.baseURL + "/report/ht-newlyadmitted";
const CaseManagementReportURL = AppConfig.baseURL + "/report/tw-casemanagement";
const CaseworkerServedURL = AppConfig.baseURL + "/report/caseworkerserved";
const FamiliesServedURL = AppConfig.baseURL + "/report/familyserved";
const DashboardOverallURL = AppConfig.baseURL + "/report/ht-dashboardOverall";
const FSDashboardOverallURL = AppConfig.baseURL + "/fs-reports";

const ExportURL = AppConfig.baseURL + "/exportFile";
const AverageThriveURL = AppConfig.baseURL + "/report/ht-averageThrivescale";
const FollowupURL = AppConfig.baseURL + "/report/durationFollowup";
const OverdueURL = AppConfig.baseURL + "/report/childoverdue";
const NewlyAdmittedURL = AppConfig.baseURL + "/report/ht-newlyadmitted";
const DisruptionCasesURL = AppConfig.baseURL + "/report/ht-disruptionCase";
const CaseManagementURL = AppConfig.baseURL + "/report/tw-casemanagement";
const ChildrenInCCIURL = AppConfig.baseURL + "/report/current/ht-cciresident";
const CurrentPlacementURL = AppConfig.baseURL + "/report/current/ht-placement";
const DurationInCCIURL = AppConfig.baseURL + "/report/cci/ht-duration";
const ReintegratedChildrenURL =
  AppConfig.baseURL + "/report/reintegrated/ht-children";
const NewlyAddedURL = AppConfig.baseURL + "/report/ht-newlyadded";
const InterventionDetailsURL =
  AppConfig.baseURL + "/report/ht-interventiondetails";
const MapReportURL = AppConfig.baseURL + "/report/ht-map";
const AverageChangeURL =
  AppConfig.baseURL + "/report/ht-avgPercentChangeTScore";
const EditProfileURL = AppConfig.baseURL + "/user/profile";
const ResendInvitationURL = AppConfig.baseURL + "/user/resendInvite";

const NotificationListURL = AppConfig.baseURL + "/notification/list";
const UpdateNotificationURL = AppConfig.baseURL + "/notification/update";
const saveUserLanguageURL = AppConfig.baseURL + "/user/updateFields";
const ProgressReportListURL =
  AppConfig.baseURL + "/ht-followup/getFollowUpChildList";
const viewFollowUpProgressURL =
  AppConfig.baseURL + "/ht-followup/viewFollowUpProgress";
const getFollowupDomainDetailsURL =
  AppConfig.baseURL + "/ht-followup/getFollowupDomainDetails";
const generarateProgressReportListURL =
  AppConfig.baseURL + "/ht-followup/generateFollowUpProgressListExcel";
const generateFollowUpProgressPdfURL =
  AppConfig.baseURL + "/ht-followup/generateFollowUpProgressPdf";

// fs child api URLs
const fsChildURL = AppConfig.baseURL + "/child";
const fsChildListURL = AppConfig.baseURL + "/children";
const getFsChildURL = AppConfig.baseURL + "/child?id=";
const getFsChildPlacementStatusURL =
  AppConfig.baseURL + "/child-placement-status";

const childDischargeReasonsListURL =
  AppConfig.baseURL + "/child-discharge-reason";

const EthnicityListURL = AppConfig.baseURL + "/child-ethnicity";

// fs family api URLs
const fsFamilyURL = AppConfig.baseURL + "/fs-families";
const fsParentsURL = AppConfig.baseURL + "/user/parents";
const getFsFamilyURL = AppConfig.baseURL + "/fs-family";
const fsFamilyDropdownURL = AppConfig.baseURL + "/fs-family-list";
const GetFamilyImagesURL = AppConfig.baseURL + "/fs-family-images";
const getMessageListURL = AppConfig.baseURL + "/tw-messages";
const createScheduleMessageURL = AppConfig.baseURL + "/tw-scheduled-message";
const createMessageURL = AppConfig.baseURL + "/tw-message";
const getScheduledMessageListURL = AppConfig.baseURL + "/tw-scheduled-messages";
const getFamilyPerCaseWorkerURL =
  AppConfig.baseURL + "/fs-reports/getFamiliesPerUser";
const getCaseManagerChildPerAccountURL =
  AppConfig.baseURL + "/fs-reports/getCaseManager-Child-PerAccount";

const getChildPerCaseWorker =
  AppConfig.baseURL + "/report/ht-childrenPerCaseworker";

// fs family api URLs
const fsEventsURL = AppConfig.baseURL + "/events";
const fsEventsActionURL = AppConfig.baseURL + "/event";
const UnlinkParentsFromFamilyURL = AppConfig.baseURL + "/fs-family/unlink-users";

// log api url
const GenericLogsListURL = AppConfig.baseURL + "/form-engines";
const ListRecLogURL = AppConfig.baseURL + "/form-engines/list-logs";
const DetailRecLogURL = AppConfig.baseURL + "/form-engines/child-log";
const MedicationListURL = AppConfig.baseURL + "/form-engines/list-entity";
const MedicationChangeLogListURL = AppConfig.baseURL + "/form-engines/medication/history";
const ExportMedChangeLogListURL = AppConfig.baseURL + "/fs-reports/export-medication-history-pdf";
const getSignedMedLogDocURL =
  AppConfig.baseURL + "/form-engines/get-medlog-document";
const getLogImagesDocURL =
  AppConfig.baseURL + "/form-engines/adapter-functions";
const getLogTypesURL =
  AppConfig.baseURL + "/form-engines/get-web-list-dropdowns";
const getLogsListURL = AppConfig.baseURL + "/form-engines/list-logs-v2";
const ExportLogPdfURL = AppConfig.baseURL + "/fs-reports/export-log-pdf";
const getSupportServiceListURL = AppConfig.baseURL + "/fs-support-services";
const getSupportServiceDetailURL = AppConfig.baseURL + "/fs-support-service";
const getResourceListURL = AppConfig.baseURL + "/fs-resources";
const getResourceCategoriesListURL =
  AppConfig.baseURL + "/fs-resource-categories";
const getResourceDetailURL = AppConfig.baseURL + "/fs-resource";

// notifications api urls
const ListNotificationsURL = AppConfig.baseURL + "/notification/user/notification/web";
const AcceptTermsAndPrivacyPolicyURL =
  AppConfig.baseURL + "/user/acceptTermsOfUse";

const checkIfAppDepricatedURL =
  AppConfig.baseURL + `/deprication/checkIfAppDepricated?app=THRIVEWELL`;
const getRegionURL = AppConfig.baseURL + "/get-region";

const UpdateCaseWorkerURL = AppConfig.baseURL + "/ht-family/updateCaseworker";
const CheckChildIsFamilyCaregiverURL =
  AppConfig.baseURL + "/ht-family/checkifChildisFamilyCaregiver";
  const CheckDeactivationAllowedURL = AppConfig.baseURL + "/ht-child/isDeactivationAllowed"; 
  const deactivateReactivateReasonURL =  AppConfig.baseURL + "/ht-family/deactivation-deletion-reason";
  const CheckDuplicateChildURL =  AppConfig.baseURL +  "/ht-child/isUniqueChild";

// govt dashboard api URLs
const GOVT_DASHBOARD_BASE = AppConfig.baseURL + "/tw-govt-dashboard";
const LocationFilterURL = `${GOVT_DASHBOARD_BASE}/location-filter`;
const DomainScoresAssessmentURL = `${GOVT_DASHBOARD_BASE}/domain-scores-assessment`;
const dashboardAvgAssessmentScoresURL = `${GOVT_DASHBOARD_BASE}/average-assessment-scores`;
const dashboardOrganizationOverviewURL = `${GOVT_DASHBOARD_BASE}/organizational-overview`;
const dashboardOrganizationListURL = `${GOVT_DASHBOARD_BASE}/organizational-list-overview`;
const getGovtDashboardRedflagOverviewURL = `${GOVT_DASHBOARD_BASE}/redflag-overview`;
const RefreshDashboardDataViewURL = `${GOVT_DASHBOARD_BASE}/refresh-dashboard`;
const redFlagMilestoneByDomainURL = `${GOVT_DASHBOARD_BASE}/redflag-milestone-by-domain`;
const AllMilestonesURL = `${GOVT_DASHBOARD_BASE}/all-milestone-widget`;
const TopInCrisisURL = `${GOVT_DASHBOARD_BASE}/top-five-incrisis-milestones`;
const MilestoneRatingsTrendByAssessmentURL = `${GOVT_DASHBOARD_BASE}/milestone-trend-by-assessment`;
const CurrentStatusURL = `${GOVT_DASHBOARD_BASE}/milestone-current-status`;
const AllInterventionsForMilestoneURL = `${GOVT_DASHBOARD_BASE}/interventions-for-this-milestone`; 
const OrganizationsAppliedForMilestoneURL = `${GOVT_DASHBOARD_BASE}/org-associated-to-milestone`;
const AllInterventionsURL = `${GOVT_DASHBOARD_BASE}/all-interventions`;
const BestAndWorstInterventionsURL = `${GOVT_DASHBOARD_BASE}/best-worst-interventions`;
const InterventionProgressMetricsURL = `${GOVT_DASHBOARD_BASE}/intervention-progress-metrics`;
const AllFamiliesSixMonthsURL = `${GOVT_DASHBOARD_BASE}/all-families-last-six-months`;
const InterventionSummaryURL = `${GOVT_DASHBOARD_BASE}/intervention-summary`;
const AllChildrenSixMonthsURL = `${GOVT_DASHBOARD_BASE}/all-child-last-six-months`;
const IncrisisAndVulnerableMilestonesChildrenURL = `${GOVT_DASHBOARD_BASE}/inCrisis-vulnerable-milestone-child`;
const FollowUpListURL = `/ht-followup/getInterimFollowups`;
const FollowUpExportURL = `/ht-followup/exportInterimFollowups`;
const IncrisisAndVulnerableMilestonesFamilyURL = `${GOVT_DASHBOARD_BASE}/inCrisis-vulnerable-milestone-family`;
const CurrentLivingConditionURL = `${GOVT_DASHBOARD_BASE}/current-living-condition`;
const FamilyAssessmentScoreImprovementURL = `${GOVT_DASHBOARD_BASE}/family-assessment-score-improvements`;
const ConsolidatedAssessmentProgressReportURL = `/ht-assessment/listConsolidatedAssessmentData`;
const MostRecentAssesmentSummaryURL = `/ht-family/most-recent-assessment`;
const TodoListURL = AppConfig.baseURL + "/todo-List/list";
const ChildMilestoneListURL = AppConfig.baseURL + "/ht-child/getMilestoneList";
const InterventionForMilestoneListURL = AppConfig.baseURL + "/ht-family/getInterventionForMilestone";
const ChildInterventionListURL = AppConfig.baseURL + "/ht-child/getInterventionList";
const InterventionForMilestoneListChildURL = AppConfig.baseURL + "/ht-child/milestone-interventions";
const getInterventionForMilestoneListURL = AppConfig.baseURL + "/ht-family/getInterventionForMilestone";
const FamilyDropdownListsURL = AppConfig.baseURL + "/tw-families/dropdowns";
const ChildDropdownListsURL = AppConfig.baseURL + "/tw-children/dropdowns";

const APIS = {
  async makePostRequest(url, payload) {
    try {
      await this.PreRequestCall(); // Ensuring PreRequestCall completes before proceeding
      const response = await axios.post(url, payload);
      return response;
    } catch (error) {
      console.error("Error in POST request:", error);
      throw error; // Rethrowing the error for proper handling
    }
  },

  async makeGetRequest(url) {
    try {
      await this.PreRequestCall(); // Wait for PreRequestCall
      return await axios.get(url); // Directly return response
    } catch (error) {
      console.error("GET request error:", error);
      throw error; // Allow caller to handle error
    }
  },

  async makePutRequest(url, payload) {
    try {
      await this.PreRequestCall(); // Wait for pre-request call
      return await axios.put(url, payload); // Directly return response
    } catch (error) {
      console.error("PUT request error:", error);
      throw error; // Allow caller to handle error
    }
  },

  async makeDeleteRequest(url, payload) {
    try {
      await this.PreRequestCall();
      const response = await axios.delete(url, { data: payload });
      return response;
    } catch (error) {
      console.error("DELETE request error:", error);
      throw error;
    }
  },

  async makePatchRequest(url, payload) {
    try {
      await this.PreRequestCall();
      const response = await axios.patch(url, payload);
      return response;
    } catch (error) {
      console.error("PATCH request error:", error);
      throw error;
    }
  },

  TypeList: (params = {}) => APIS.makePostRequest(TypeListURL, params),

  forgotPassword(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ForgotPasswordURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  updatePassword(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(UpdatePasswordURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  NewPasswordOnRegistration(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(NewPasswordOnRegistrationURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          throw error;
        });
    });
  },

  LocationList(langId) {
    let CompletedLocationListURL = LocationListURL;
    const payload = {
      languageId: langId,
    };
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CompletedLocationListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  VisitTypeList(langId) {
    let CompletedVisitTypeListURL = VisitTypeListURL;
    if (langId) {
      CompletedVisitTypeListURL = VisitTypeListURL + `?languageId=${langId}`;
    }
    return this.makeGetRequest(CompletedVisitTypeListURL);
  },

  ReIntegrationTypeList(langId) {
    let CompletedReIntegrationTypeListURL = ReIntegrationTypeListURL;
    if (langId) {
      CompletedReIntegrationTypeListURL =
        ReIntegrationTypeListURL + `?languageId=${langId}`;
    }
    return this.makeGetRequest(CompletedReIntegrationTypeListURL);
  },

  CaseList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CaseListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  LanguageList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(LanguageListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  RelationList(langId) {
    let CompletedRelationListURL = RelationListURL;
    if (langId) {
      CompletedRelationListURL = RelationListURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedRelationListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  MemberTypeList(langId) {
    let CompletedMemberTypeListURL = MemberTypeListURL;
    if (langId) {
      CompletedMemberTypeListURL = MemberTypeListURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedMemberTypeListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  OrganisationDetails(id) {
    if (id) {
      const OrganizationDetailsCompletedURL =
        OrganisationDetailsPartialURL + id;
      return this.makeGetRequest(OrganizationDetailsCompletedURL);
    }
  },

  OrganizationList: (payload) =>
    APIS.makePostRequest(OrganisationListURL, payload),

  getCaseManagerChildPerAccount(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getCaseManagerChildPerAccountURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  LinkedOrganizationList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(GetLinkedOrganisationsURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  LinkedTransferOrganizationList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(TransferChildOrgList)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  AddOrganization(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddOrganisationURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  EditOrganization: (payload) =>
    APIS.makePutRequest(EditOrganisationURL, payload),

  reActivateOrganization: (payload) =>
    APIS.makePutRequest(ReactivateAccountURL, payload),

  deactivateOrganization: (payload) =>
    APIS.makeDeleteRequest(EditOrganisationURL, payload),

  ChangeConsentStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(ConsentStatusUpdationURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },

  AcceptTermsAndPrivacyPolicy(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(AcceptTermsAndPrivacyPolicyURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },

  checkOrganizationName(id, name) {
    return this.makeGetRequest(`IsUniqueAccount?id=${id}&accountName=${name}`);
  },

  ChangeOrganizationStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(EditOrganisationURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  AddFamily(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddFamilyURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  FamilyDetails(id) {
    const GetFamilyDetailsURL = GetFamilyDetails + id;
    return this.makeGetRequest(GetFamilyDetailsURL);
  },

  ListUsers: (payload) => APIS.makePostRequest(UserListURL, payload),

  UserRoleListFS(langId = "1") {
    let prerequest = this.PreRequestCall();
    const payload = {
      type: "FS",
      languageId: langId,
    };
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(UserRoleList, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  UserRoleListHT(langId = "1") {
    let prerequest = this.PreRequestCall();
    const payload = {
      type: "HT",
      languageId: langId,
    };
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(UserRoleList, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetLanguagesList(accessType) {
    return this.makeGetRequest(`/languages?accessType=${accessType}`);
  },

  UserDetails(id) {
    if (_.isNil(id) || id === "undefined") {
      return;
    }
    if (id) {
      console.log("user", id);
      let prerequest = this.PreRequestCall();
      return axios.all([prerequest]).then((res) => {
        const UserCompletedURL = UserDetailsPartialURL + id;
        return axios
          .get(UserCompletedURL)
          .then((response) => {
            return response;
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  },
  AddUser(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddUserURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  ChangeFamilyStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(EditFamilyStatusURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  EditFamily(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditFamilyURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  EditUser(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditUserURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },

  UpdateCaseWorker(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(UpdateCaseWorkerURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  AddFamilyMember(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddFamilyMemberURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  EditFamilyMember(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditFamilyMemberURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },

  FamilyList: (payload) => APIS.makePostRequest(FamilyListURL, payload),

  ChangeUserStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(EditUserURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

   ChangeUserStatusByOrg: (payload) =>
    APIS.makeDeleteRequest(API_URLS.user.ChangeUserStatusByOrgId, payload),

  ValidateUserDeactivationTS(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ValidateUserDeactivationTSURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ValidateUserDeactivationFS(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ValidateUserDeactivationFSURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  CheckUserEmailExists(email,id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
     let UserCompletedURL="";
      if(id){
         UserCompletedURL = UserEmailURL + email +  `&excludeId=${id}`;
      }else{
        UserCompletedURL = UserEmailURL + email;
      }
      //const UserCompletedURL = UserEmailURL + email +  `&excludeId=${id}`;
      return axios
        .get(UserCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },
  CheckUserAccountExist(id) {
    //let prerequest = this.PreRequestCall();
    const payload = {
      email: id,
    };
    return axios.all([]).then((res) => {
      return axios
        .post(UserAccountExistanceURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  validateRoleChange(payload, name) {
    let prerequest = this.PreRequestCall();
    let APIURL =
      name === "FSRole" ? validateFSRoleChangeURL : validateTSRoleChangeURL;
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(APIURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  migrateUserToNewDB(payload) {
    //let prerequest = this.PreRequestCall();
    return axios.all([]).then((res) => {
      return axios
        .post(migrateUserAccountURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  updateCognitoIdinRegionalDB: (payload) => APIS.makePostRequest(updateCognitoIdinRegionalDBURL, payload),

  ResetToken(token) {
    //let prerequest = this.PreRequestCall();
    const payload = {
      refreshToken: token,
    };
    return axios.all([]).then((res) => {
      return axios
        .post(resetTokenURL, payload)
        .then((response) => {
          this.PreRequestCall().then(() => {
            return response;
          });
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  refresh() {
    Auth.currentAuthenticatedUser().then((currentUser) => {
      return Auth.currentSession().then((data) => {
        //data.getAccessToken().getJwtToken();
        currentUser.refreshSession(data?.refreshToken, (err, session) => {
          const { idToken, refreshToken, accessToken } = session;
          localStorage.setItem("accessToken", accessToken.jwtToken);
          localStorage.setItem("refreshToken", refreshToken.jwtToken);
          if (localStorage.getItem("keepLoggedIn") == "true") {
            localStorage.setItem("idToken", idToken.jwtToken);
          } else {
            sessionStorage.setItem("idToken", idToken.jwtToken);
          }
          axios.defaults.headers.common["Authorization"] = idToken.jwtToken;
        });
      });
    });
  },

  // PreRequestCall() {
  //   return Auth.currentSession()
  //     .then((data) => {
  //       data.getAccessToken().getJwtToken();
  //       localStorage.setItem("accessToken", data.accessToken.jwtToken);
  //       localStorage.setItem("refreshToken", data.refreshToken.jwtToken);
  //       if (localStorage.getItem("keepLoggedIn") == "true") {
  //         localStorage.setItem("idToken", data.idToken.jwtToken);
  //       } else {
  //         sessionStorage.setItem("idToken", data.idToken.jwtToken);
  //       }
  //       axios.defaults.headers.common["Authorization"] = data.idToken.jwtToken;
  //     })
  //     .catch((err) => {
  //       console.log("error", err);
  //       localStorage.setItem("accessToken", "");
  //       localStorage.setItem("refreshToken", "");
  //       //localStorage.setItem("idToken", "");

  //       let idToken =
  //         localStorage.getItem("keepLoggedIn") == "true"
  //           ? localStorage.getItem("idToken")
  //           : sessionStorage.getItem("idToken");
  //       if (!_.isNil(idToken) && idToken !== "undefined") {
  //         //localStorage.setItem("username", null);
  //         localStorage.clear();
  //         let linkout = "/";
  //         console.log("console url", window.location.href);
  //         if (window.location.href == linkout) {
  //           //location.reload();
  //         } else {
  //           window.location.href = linkout;
  //         }
  //       }
  //     });
  // },

  PreRequestCall() {
    return Auth.currentSession()
      .then((data) => {
        // Store tokens
        localStorage.setItem("accessToken", data.accessToken.jwtToken);
        localStorage.setItem("refreshToken", data.refreshToken.jwtToken);

        if (localStorage.getItem("keepLoggedIn") == "true") {
          localStorage.setItem("idToken", data.idToken.jwtToken);
        } else {
          sessionStorage.setItem("idToken", data.idToken.jwtToken);
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = data.idToken.jwtToken;
      })
      .catch((err) => {
        console.log("error", err);

        // Clear tokens
        localStorage.setItem("accessToken", "");
        localStorage.setItem("refreshToken", "");

        // Get current idToken
        let idToken = localStorage.getItem("keepLoggedIn") == "true"
          ? localStorage.getItem("idToken")
          : sessionStorage.getItem("idToken");

        // Only redirect if we have a valid token AND we're not already on the home page
        if (!_.isNil(idToken) && idToken !== "undefined" && idToken !== "") {
          // Clear all storage
          localStorage.clear();
          sessionStorage.clear(); // Also clear session storage

          // Remove axios authorization header
          delete axios.defaults.headers.common["Authorization"];

          const currentPath = window.location.pathname;
          const targetPath = "/signin";

          // Only redirect if we're not already on the target page
          if (currentPath !== targetPath) {
            window.location.href = targetPath;
          }
          // If we're already on the home page, don't redirect to avoid infinite loop
        }
      });
    },

  ListChildren: (payload) => APIS.makePostRequest(ChildListURL, payload),

  ListChildrenConsent(payload) {
    const ChildConsentCompletedURL =
      API_URLS.consentForm.familyChildConsent +
      `?HTChildId=` +
      payload.HTChildId;

    return this.makeGetRequest(ChildConsentCompletedURL);

  },

  ListFamilyConsent(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const ChildConsentCompletedURL =
        API_URLS.consentForm.familyChildConsent +
        `?HTFamilyId=` +
        payload.HTFamilyId;
      return axios
        .get(ChildConsentCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ChildDetails(id) {
    const ChildCompletedURL = ChildDetailsPartialURL + id;
    return this.makeGetRequest(ChildCompletedURL);
  },

  AddChild(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddChildURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  ChildPlacementStatus(langId) {
    let CompletedChildPlacementStatusURL = ChildPlacementStatusURL;
    if (langId) {
      CompletedChildPlacementStatusURL =
        ChildPlacementStatusURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedChildPlacementStatusURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ChildEducationList(langId) {
    let CompletedChildEducationLevelURL = ChildEducationLevelURL;
    if (langId) {
      CompletedChildEducationLevelURL =
        ChildEducationLevelURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedChildEducationLevelURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ChildStatus(langId) {
    let CompletedChildStatusURL = ChildStatusURL;
    if (langId) {
      CompletedChildStatusURL = ChildStatusURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedChildStatusURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  EditChild(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(AddChildURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          return error?.response;
        });
    });
  },
  ChangeChildStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(AddChildURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },
  ChildCurrentPlacementStatus(langId) {
    let CompletedChildCurrentPlacementURL = ChildCurrentPlacementURL;
    if (langId) {
      CompletedChildCurrentPlacementURL =
        ChildCurrentPlacementURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedChildCurrentPlacementURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ListCases(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CaseListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  AddCase(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddCaseURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  EditCase(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(AddCaseURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },
  CaseDetails(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const CaseCompletedURL = CaseDetailsPartialURL + id;
      return axios
        .get(CaseCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  DeleteCase(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(AddCaseURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  FormList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(FormListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetFormDetails(payload) {
    let prerequest = this.PreRequestCall();
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );

    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    payload.langId = langId;

    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getFormDetailsUrl, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  FormPreviewQuestions(formId, HTLanguageId) {
    const PreviewFormCompletedURL =
      PreviewFormQuestionsURL + formId + `&HTLanguageId=${HTLanguageId}`;
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(PreviewFormCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  NewPreviewQuestions(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(NewPreviewFormQuestionsURL, payload)
        .then((resonse) => {
          console.log("NewPreviewQuestions", resonse);
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  PublishForm(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(PublishForm, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  UpdateForm(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(UpdateFormURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  UpdateFormStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(UpdateFormStatus, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  CreateForm(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(SaveNewFormURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  DomainList() {
    let prerequest = this.PreRequestCall();
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    let CompletedDomainListURL = DomainListURL;
    if (langId) {
      CompletedDomainListURL = DomainListURL + `?languageId=${langId}`;
    }
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedDomainListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  QuestionDomainList(langId) {
    let CompletedQuestionDomainListURL = QuestionDomainListURL;
    if (langId) {
      CompletedQuestionDomainListURL =
        QuestionDomainListURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(CompletedQuestionDomainListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  QuestionTypeList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(QuestionTypeListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ListQuestions(payload) {
    let prerequest = this.PreRequestCall();
    const currentLanguage = localStorage.getItem("language");
    // const currentLanguageList = JSON.parse(
    //   localStorage.getItem("languageList")
    // );
    // Todo - Change this later
    const currentLanguageList = [
      { id: "1", language: "English", languageCode: "en" },
      { id: "2", language: "Hindi", languageCode: "hi" },
      { id: "3", language: "Tamil", languageCode: "ta" },
    ];
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    payload.HTLanguageId = langId;
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(QuestionListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  QuestionDetails(id, language_id) {
    let GetQuestionDetailsURL = GetQuestionDetails + id;
    if (language_id) {
      GetQuestionDetailsURL =
        GetQuestionDetailsURL + "&language_id=" + language_id;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(GetQuestionDetailsURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  QuestionDetailsForEdit(id) {
    const GetQuestionDetailsURL = GetQuestionDetailsForEdit + id;
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(GetQuestionDetailsURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  AnswerTypeList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(AnswerTypeListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  CheckIsQuestionUnique(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CheckIsQuestionUniqueURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  CreateQuestion(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CreateQuestionURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  EditQuestion(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditQuestionURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  DeleteQuestion(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(DeleteQuestionURL, { data: payload })
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  AddFormQuetions(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AddFormQuetionsURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  ChangeQuestionStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(EditQuestionStatusURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  GetMappedQuestions(payload) {
    let prerequest = this.PreRequestCall();
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    payload.HTLanguageId = langId;
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(MappedQuetionsURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  AssessmentList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AssessmentListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  SaveAssessmentResponse(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(SaveResponseURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  ListAssessmentFormQuestions(formId, formRevision) {
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    let FormQuestionsCompletedURL =
      ListFormQuestionsURL + formId + `&formRevision=${formRevision}`;
    if (langId) {
      FormQuestionsCompletedURL =
        FormQuestionsCompletedURL + `&languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(FormQuestionsCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetAssessmentDetails(
    assessmentId,
    formRevision,
    lastAssessmentDate,
    exportAssessment = false
  ) {
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    let GetAssessmentDetailCompletedURL;
    if (exportAssessment) {
      GetAssessmentDetailCompletedURL =
        GetAssessmentDetailsURL +
        assessmentId +
        `&formRevision=${formRevision}` +
        `&languageId=${langId}` +
        `&lastDateOfAssessment=${lastAssessmentDate}` +
        `&action=export`;
    } else {
      GetAssessmentDetailCompletedURL =
        GetAssessmentDetailsURL +
        assessmentId +
        `&formRevision=${formRevision}` +
        `&languageId=${langId}`;
    }

    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return (
        axios
          .get(GetAssessmentDetailCompletedURL)
          //return axios.get('https://lo3qexyas5.execute-api.us-east-1.amazonaws.com/dev-test/assessment/getassessmentdetails?assessmentId=7&formRevision=2')
          .then((response) => {
            return response;
          })
          .catch((error) => {
            console.log(error);
          })
      );
    });
  },

  CalculateScore(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CalculateScoreURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ScoreForEachChild({childId, familyId}) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const CompleteScoreURL = ScoreURL + (childId ? `?childId=${childId}` :`?familyId=${familyId}`);
      return axios
        .get(CompleteScoreURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },
  // UploadFile(payload) {
  //   let payloadURL = `${payload.moduleType}/${payload.documentType}?fileName=${payload.fileName}&moduleId=${payload.moduleId}&fileSize=${payload.fileSize}&description=${payload.description}`;
  //   let newUploadURl = UploadURL + payloadURL;
  //   let prerequest = this.PreRequestCall();
  //   return axios.all([prerequest]).then((res) => {
  //     return axios
  //       .post(newUploadURl)
  //       .then((response) => {
  //         return response;
  //       })
  //       .catch((error) => {
  //         let errorObject = {
  //           status: "",
  //           body: {},
  //         };
  //         if (error.request) {
  //           errorObject.status = error.request.status;
  //           errorObject.body = JSON.parse(error.request.response);
  //           return errorObject;
  //         }
  //         console.log("error", error);
  //       });
  //   });
  // },

  generateFileUploadURL(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(fileUploadURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },

  AddChildDocument(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildDocURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },

  AddFamilyDocument(payload) {
    return this.makePostRequest(FamilyDocURL, payload);
  },

  deleteChildDocument(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(ChildDocURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },

  deleteFamilyDocument(payload) {
    return this.makeDeleteRequest(FamilyDocURL, { data: payload });
  },

  generateConsent(payload) {
    return this.makePostRequest(API_URLS.consentForm.generateConsentPDF, payload);
  },

  UploadCSVFile(payload) {
    let payloadURL = `${payload.moduleType}/${payload.documentType}?fileName=${payload.fileName}&fileSize=${payload.fileSize}&description=${payload.description}`;
    let newUploadURl = UploadCSVURL + payloadURL;
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(newUploadURl)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  CSVDataBinding(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const CsvHeaderValueCompletedURL = CsvHeaderValue + id;
      return axios
        .get(CsvHeaderValueCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  SaveCsvFile(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ActualImport, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },
  UploadedFileList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(UploadedFilesURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ChildDocumentList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildDocumentListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  FamilyDocumentList(payload) {
    return this.makePostRequest(FamilyDocumentListURL, payload);
  },

  DeleteProfileImage(payload) {
    let payloadURL = `${payload.moduleType}/${payload.documentType}?moduleId=${payload.moduleId}`;
    let newUploadURl = UploadURL + payloadURL;
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(newUploadURl)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  DeleteDocument(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(UploadedFilesURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  ListEvents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ListEventsURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  CreateEvents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CreateEventsURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  DeleteEvents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .delete(DeleteEventsURL, { data: payload })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  EditEvents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditEventsURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },
  LinkOrganization(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(LinkOrganizationURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  OrgTypeDetails(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const OrgDetailsCompleteURL = OrgTypeDetailsPartialURL;
      return axios
        .post(OrgDetailsCompleteURL, { id: id })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ChildServedReport: (payload) =>
    APIS.makePostRequest(ChildServedReportURL, payload),

  ChildRedFlagReport: (payload) =>
    APIS.makePostRequest(ChildRedFlagReportURL, payload),

  DurationFollowupReport: (payload) =>
    APIS.makePostRequest(DurationFollowupReportURL, payload),

  ChildOverdueReport: (payload) =>
    APIS.makePostRequest(ChildOverdueReportURL, payload),

  NewlyAddedChildrenReport: (payload) =>
    APIS.makePostRequest(NewlyAddedChildrenReportURL, payload),

  CaseManagementReport: (payload) =>
    APIS.makePostRequest(CaseManagementReportURL, payload),

  ExportFile(payload) {
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }

    payload.languageId = langId;
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ExportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  generarateProgressReportList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(generarateProgressReportListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  AverageThrivescaleReport(payload) {
    let langId;
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    payload.languageId = langId;
    return this.makePostRequest(AverageThriveURL, payload);
  },

  FollowupDurationReport: (payload) =>
    APIS.makePostRequest(FollowupURL, payload),

  ChildrenOverdueReport: (payload) => APIS.makePostRequest(OverdueURL, payload),

  ChildAuditLog(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildAuditURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  FamilyAuditLog(payload) {
    return this.makePostRequest(FamilyAuditURL, payload);
  },

  NewlyAdmittedChildrenReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(NewlyAdmittedURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  TransferChildren(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(TransferChildURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  CloseCase(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .patch(CloseCaseURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
          console.log("error", error);
        });
    });
  },
  DisruptionCases(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(DisruptionCasesURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  GetCaseManagement(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CaseManagementURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  CaseworkersServed(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CaseworkerServedURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  FamiliesServed(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(FamiliesServedURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  DashboardTileData(payload) {
    let prerequest = this.PreRequestCall();
    //payload.HTCountryId = localStorage.getItem('userRegion')
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(DashboardOverallURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  DashboardTileDataFS(payload) {
    let prerequest = this.PreRequestCall();
    //payload.HTCountryId = localStorage.getItem('userRegion')
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(FSDashboardOverallURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ChildrenInCCI: (payload) => APIS.makePostRequest(ChildrenInCCIURL, payload),

  CurrentPlacement: (payload) =>
    APIS.makePostRequest(CurrentPlacementURL, payload),

  DurationInCCI: (payload) => APIS.makePostRequest(DurationInCCIURL, payload),

  ReintegratedChildren: (payload) =>
    APIS.makePostRequest(ReintegratedChildrenURL, payload),

  NewlyAddedChildren: (payload) => APIS.makePostRequest(NewlyAddedURL, payload),

  InterventionDetails(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(InterventionDetailsURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  MapDashboardData(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(MapReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  AverageChangeTS(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AverageChangeURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  EditProfile(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditProfileURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },
  UploadUpdatedFile(payload) {
    console.log("called");
    let payloadURL = `${payload.moduleType}/${payload.documentType}/${payload.documentId}?fileName=${payload.fileName}&moduleId=${payload.moduleId}&fileSize=${payload.fileSize}&description=${payload.description}`;
    let newUploadURl = UploadURL + payloadURL;
    return axios
      .put(newUploadURl)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        let errorObject = {
          status: "",
          body: {},
        };
        if (error.request) {
          errorObject.status = error.request.status;
          errorObject.body = JSON.parse(error.request.response);
          return errorObject;
        }
        console.log("error", error);
      });
  },
  ResendInvitation(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(ResendInvitationURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          console.log("error", error);
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  ListNotifications(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(NotificationListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  UpdateNotification(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .patch(UpdateNotificationURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          let errorObject = {
            status: "",
            body: {},
          };
          if (error.request) {
            errorObject.status = error.request.status;
            errorObject.body = JSON.parse(error.request.response);
            return errorObject;
          }
        });
    });
  },

  saveUserLanguage(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .patch(saveUserLanguageURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ProgressReportListForChild(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ProgressReportListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  viewFollowUpProgress(payload) {
    let prerequest = this.PreRequestCall();
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList?.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }

    payload.languageId = langId;
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(viewFollowUpProgressURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  getFollowupDomainDetails(assessmentId) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(`${getFollowupDomainDetailsURL}?assessmentId=${assessmentId}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  generateFollowUpProgressPdf(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(generateFollowUpProgressPdfURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  // child fs
  createFsChild(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(fsChildURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  updateFsChild(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(fsChildURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    });
  },

  getFsChild: (id) => APIS.makeGetRequest(`${getFsChildURL}${id}`),

  getFsChildList: (payload) => APIS.makePostRequest(fsChildListURL, payload),

  getFsChildPlacementStatusList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`${getFsChildPlacementStatusURL}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getFsChildDischargeReasonsList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`${childDischargeReasonsListURL}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getFsFamilyListForDropdown(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`${fsFamilyDropdownURL}`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  getChildHistoryList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`child-history`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  //fs family
  createFsParents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(fsParentsURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          if (error?.response?.status === 400)
            toast.error(error?.response?.data?.description);
        });
    });
  },

  linkFsParents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post("fs-family-link-users", payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    });
  },

  updateFsParents(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(fsParentsURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  createFsFamily(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getFsFamilyURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  updateFsFamily(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(getFsFamilyURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  upateFsFamily(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(getFsFamilyURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  getFsFamilyList: (payload) => APIS.makePostRequest(fsFamilyURL, payload),

  getFsFamily: (id) => APIS.makeGetRequest(`${getFsFamilyURL}?id=${id}`),

  updateFamilyStatus(params) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .patch(`${getFsFamilyURL}/change-activation-status`, params)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    });
  },
  getEmailFromToken(token) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(`/user/decryptUrl?encryptedUrl=${token}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  reverifyUser(token) {
    // let prerequest = this.PreRequestCall();
    return axios.all([]).then((res) => {
      return axios
        .get(`/user/reverifyUser?encryptedUrl=${token}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  createMessage(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(createMessageURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  // fs events

  getEventList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`${fsEventsURL}`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  updateMessageAttachment(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(createMessageURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  updateMessageStatus(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(`tw-cancel-scheduled-message`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  createEvent(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`${fsEventsActionURL}`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  createScheduleMessage(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(createScheduleMessageURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  updateEvent(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(`${fsEventsActionURL}`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getEvent(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(`${fsEventsActionURL}?id=${id}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getMessageList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getMessageListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getEventTypeList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`event-types`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getEventParticipantsList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(`event-participants`, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  getScheduledMessageList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getScheduledMessageListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  getFamilyPerCaseWorker(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getFamilyPerCaseWorkerURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  getChildPerCaseWorker(country) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getChildPerCaseWorker, { countryName: country })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ListRecLog(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ListRecLogURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ListGenericLogs(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(GenericLogsListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ListLogTypes: () => APIS.makeGetRequest(getLogTypesURL),
  ListAllLogs: (payload) => APIS.makePostRequest(getLogsListURL, payload),

  ExportLogPdf(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ExportLogPdfURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  DetailRecLog(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(DetailRecLogURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetMedicationList: (payload) =>
    APIS.makePostRequest(MedicationListURL, payload),

  GetMedicationChangeLogList: (payload) =>
    APIS.makePostRequest(MedicationChangeLogListURL, payload),

  ExportMedicationChangeLogList: (payload) =>
    APIS.makePostRequest(ExportMedChangeLogListURL, payload),

  getSignedMedLogDoc(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getSignedMedLogDocURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetFamilyImages(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(`${GetFamilyImagesURL}?id=${id}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetLogImages(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(getLogImagesDocURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  // Support Services API
  GetSupportServiceDetail: (id) =>
    APIS.makeGetRequest(`${getSupportServiceDetailURL}?id=${id}`),

  GetSupportServiceList: (payload) =>
    APIS.makePostRequest(getSupportServiceListURL, payload),

  CreateSupportService: (payload) =>
    APIS.makePostRequest(getSupportServiceDetailURL, payload),

  UpdateSupportService: (payload) =>
    APIS.makePutRequest(getSupportServiceDetailURL, payload),

  //Noification apis

  getNotificationList(req) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ListNotificationsURL, req)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  updateReadNotificationStatus(req) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(ListNotificationsURL, req)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  // Resource APIs
  GetResourceList: (payload) =>
    APIS.makePostRequest(getResourceListURL, payload),

  GetResourceCategories: (payload) =>
    APIS.makePostRequest(getResourceCategoriesListURL, payload),

  GetResourceDetail: (id) =>
    APIS.makeGetRequest(`${getResourceDetailURL}?id=${id}`),

  CreateNewResource: (payload) =>
    APIS.makePostRequest(getResourceDetailURL, payload),

  UpdateResource: (payload) =>
    APIS.makePutRequest(getResourceDetailURL, payload),

  // System messages apis

  GetSystemMessagesAfterLogin: (payload) =>
    APIS.makePostRequest(API_URLS.systemMessages.userMessageList, payload),

  CreateSystemMessages: (payload) =>
    APIS.makePostRequest(API_URLS.systemMessages.create, payload),

  UpdateSystemMessages: (payload) =>
    APIS.makePutRequest(API_URLS.systemMessages.create, payload),

  SystemMessagesDetails: (payload) =>
    APIS.makePostRequest(API_URLS.systemMessages.details, payload),

  UpdateSystemMessageReadStatus: (payload) =>
    APIS.makePostRequest(API_URLS.systemMessages.updateReadStatus, payload),

  getSystemMessageList: (payload) =>
    APIS.makePostRequest(`${API_URLS.systemMessages.messageList}`, payload),

  getSystemMessageTypeList: ()=>APIS.makeGetRequest(API_URLS.systemMessages.messageTypeList),

  copySystemMessage: (payload) =>
    APIS.makePostRequest(API_URLS.systemMessages.copyMessage, payload),

  cancelMessage: (payload) =>
    APIS.makePatchRequest(API_URLS.systemMessages.cancelMessage, payload),

  getReadCount: (payload) =>
    APIS.makePostRequest(API_URLS.systemMessages.getMessageViewCount, payload),

  checkIfAppDepricated() {
    // let prerequest = this.PreRequestCall();
    return axios.all([]).then((res) => {
      return axios
        .get(checkIfAppDepricatedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  GetRegion : ()=>APIS.makeGetRequest(getRegionURL),

  ethnicityList: (payload) => APIS.makePostRequest(EthnicityListURL, payload),

  familySituationAndGoals(langId) {
    let CompletedfamilySituationAndGoalsURL = familySituationAndGoalsURL;
    if (langId) {
      CompletedfamilySituationAndGoalsURL =
        familySituationAndGoalsURL + `?languageId=${langId}`;
    }
    return this.makeGetRequest(CompletedfamilySituationAndGoalsURL);
  },

  familyMembers(familyId) {
    let CompletedfamilyMembersURL = familyMembersURL + `?family_id=${familyId}`;
    return this.makeGetRequest(CompletedfamilyMembersURL);
  },

  checkChildIsPrimaryContactOfFamily(childId) {
    let CompletedCheckChildIsFamilyCaregiverURL =
      CheckChildIsFamilyCaregiverURL + `?HTChildId=${childId}`;
    return this.makeGetRequest(CompletedCheckChildIsFamilyCaregiverURL);
  },
  
  checkDeactivationAllowed(childId, familyId, type) {
    let CompletedcheckDeactivationAllowedURL =
      CheckDeactivationAllowedURL + `?child_id=${childId}&HTFamilyId=${familyId}&type=${type}`;
    return this.makeGetRequest(CompletedcheckDeactivationAllowedURL);
  },

  GetDeleteDeactivateReason(type) {
    let completeDeactivateReactivateReasonURL = deactivateReactivateReasonURL + `?type=${type}&sortOrder=ASC`;
    return this.makeGetRequest(completeDeactivateReactivateReasonURL);
  },

  CheckDuplicateChild: (payload) => APIS.makePostRequest(CheckDuplicateChildURL, payload),
  exportFamilies: (language="1", status="all", globalSearchQuery="") => APIS.makeGetRequest(`${exportFamiliesURL}?status=${status}&language=${language}&globalSearchQuery=${globalSearchQuery}`),
  exportChildren: (payload)=> APIS.makePostRequest(`${exportChildrenURL}`, payload),
  exportAssessments: (payload)=> APIS.makePostRequest(`${exportAssessmentURL}`, payload),
  DeleteFamilyDocument(payload) {
    return this.makeDeleteRequest(FamilyDocURL, payload);
  },
  DeleteChildDocument(payload) {
    return this.makeDeleteRequest(ChildDocURL, payload);
  },
  GetLoactionsForFilter: ()=>APIS.makeGetRequest(LocationFilterURL),
  DomainScoresAssessment: (payload) => APIS.makePostRequest(DomainScoresAssessmentURL, payload),
  GetGovtDashboardAverageAssessmentScores: (payload) => APIS.makePostRequest(dashboardAvgAssessmentScoresURL, payload),
  GetGovtDashboardOrganizationOverview: (payload) => APIS.makePostRequest(dashboardOrganizationOverviewURL, payload),
  GetGovtDashboardOrganizationList: (payload) => APIS.makePostRequest(dashboardOrganizationListURL, payload),
  GetGovtDashboardRedflagOverview: (payload) => APIS.makePostRequest(getGovtDashboardRedflagOverviewURL, payload), 
  UpdateDashboardDataViews:()=>APIS.makeGetRequest(RefreshDashboardDataViewURL),
  UnlinkParentsFromFamily: (payload) => APIS.makeDeleteRequest(UnlinkParentsFromFamilyURL, payload),
  UpdateFamilyAfterDeletion: (payload) => APIS.makeDeleteRequest(fsParentsURL, payload), 
  GetFollowUpList: (payload) => APIS.makePostRequest(FollowUpListURL, payload),
  ExportFollowUps: (payload)=> APIS.makePostRequest(`${FollowUpExportURL}`, payload),
  GetRedFlagMilestoneByDomain: (payload) => APIS.makePostRequest(redFlagMilestoneByDomainURL, payload),
  GetAllMilestones: (payload) => APIS.makePostRequest(AllMilestonesURL, payload),
  GetTopInCrisis: (payload) => APIS.makePostRequest(TopInCrisisURL, payload),
  GetMilestoneRatingsTrendByAssessment: (payload) => APIS.makePostRequest(MilestoneRatingsTrendByAssessmentURL, payload),
  GetCurrentStatus: (payload) => APIS.makePostRequest(CurrentStatusURL, payload),
  GetAllInterventionsForMilestone: (payload) => APIS.makePostRequest(AllInterventionsForMilestoneURL, payload),
  GetOrganizationsApliedForMilestone: (payload) => APIS.makePostRequest(OrganizationsAppliedForMilestoneURL, payload),
  GetAllInterventions: (payload) => APIS.makePostRequest(AllInterventionsURL, payload),
  GetBestAndWorstInterventions: (payload) => APIS.makePostRequest(BestAndWorstInterventionsURL, payload),
  GetInterventionProgressMetrics: (payload) => APIS.makePostRequest(InterventionProgressMetricsURL, payload),
  GetAllFamilesSixMonths: (payload) => APIS.makePostRequest(AllFamiliesSixMonthsURL, payload),
  GetAllChildrenSixMonths: (payload) => APIS.makePostRequest(AllChildrenSixMonthsURL, payload),
  GetInterventionSummary: (payload) => APIS.makePostRequest(InterventionSummaryURL, payload),
  GetIncrisisAndVulnerableMilestonesChildren: (payload) => APIS.makePostRequest(IncrisisAndVulnerableMilestonesChildrenURL, payload),
  GetIncrisisAndVulnerableMilestonesFamilies: (payload) => APIS.makePostRequest(IncrisisAndVulnerableMilestonesFamilyURL, payload),
  GetCurrentLivingCondition: (payload) => APIS.makePostRequest(CurrentLivingConditionURL, payload),
  GetFamilyAssessmentScoreImprovements: (payload) => APIS.makePostRequest(FamilyAssessmentScoreImprovementURL, payload),
  GetConsolidatedAssessmentProgressReport: (payload) => APIS.makePostRequest(ConsolidatedAssessmentProgressReportURL, payload),
  GetMostRecentAssesmentSummary(familyId) {
    let CompletedMostRecentAssesmentSummaryURL =
      MostRecentAssesmentSummaryURL + `?HTFamilyId=${familyId}`;
    return this.makeGetRequest(CompletedMostRecentAssesmentSummaryURL);
  },
  GetTodoList: (payload) => APIS.makePostRequest(TodoListURL, payload),
  GetChildMilestoneList: (payload) => APIS.makePostRequest(ChildMilestoneListURL, payload),
  GetInterventionForMilestoneListChild: (payload) => APIS.makePostRequest(InterventionForMilestoneListChildURL, payload),
  GetFamilyInterventionList: (payload) => APIS.makePostRequest(FamilyInterventionListURL, payload),
  GetFamilyMilestoneList: (payload) => APIS.makePostRequest(getFamilyMilestoneListURL, payload),
  GetInterventionForMilestoneList: (payload) => APIS.makePostRequest(getInterventionForMilestoneListURL, payload),
  GetFamilyHistoryList: (payload) => APIS.makePostRequest(FamilyHistoryListURL, payload),
  GetFamilyInterventionSummary: (payload) => APIS.makeGetRequest(FamilyInterventionSummaryURL + `?HTFamilyId=${payload}`),
  GetChildInterventionList: (payload) => APIS.makePostRequest(ChildInterventionListURL, payload),

  //Entity model API's
  //------Family-------
  CreateFamily: (payload) => APIS.makePostRequest(API_URLS.family.createFamily, payload),
  UpdateFamily: (payload) => APIS.makePutRequest(API_URLS.family.updateFamily, payload),
  GetFamilyDetails: (payload) => APIS.makeGetRequest(`${API_URLS.family.getFamilyDetails}?TWFamilyId=${payload?.id}&listType=${payload.listType}`),
  GetFamilyList: (payload) => APIS.makePostRequest(API_URLS.family.getFamilyList, payload),
  GetFamilyDropdown: (payload) => APIS.makePostRequest(API_URLS.family.getFamilyDropdownList, payload),
  UpdateFamilyMember: (payload) => APIS.makePutRequest(API_URLS.family.updateFamilyMember, payload),
  GetFamilyDropdownLists: (payload) => APIS.makePostRequest(API_URLS.family.getFamilyDropdownList, payload),
  CloseCase:(payload) => APIS.makePutRequest(API_URLS.family.closeCase, payload),

  //------Child-------
  GetChildDropdownLists: (payload) => APIS.makePostRequest(API_URLS.child.getChildDropdownLists, payload),
  GetChildList: (payload) => APIS.makePostRequest(API_URLS.child.getChildList, payload),
  CreateChild: (payload) => APIS.makePostRequest(API_URLS.child.createChild, payload),
  UpdateChild: (payload) => APIS.makePutRequest(API_URLS.child.createChild, payload),
  GetChildDetails: (id) => APIS.makeGetRequest(`${API_URLS.child.getChildDetails}?id=${id}`),
  GetDuplicateChildList: (payload) => APIS.makePostRequest(API_URLS.child.uniqueChildList, payload),
  CloseChildCase: (payload) => APIS.makePatchRequest(API_URLS.child.closeChildCase, payload),
  CheckUniqueChild: (payload) => APIS.makePostRequest(API_URLS.child.checkUniqueChild, payload),

  // events
  GetEventList: (payload) => APIS.makePostRequest(API_URLS.events.getEventList, payload),
};

export default APIS;
