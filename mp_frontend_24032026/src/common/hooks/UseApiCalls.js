import _ from "lodash";
import axios from "axios";

import { AppConfig } from "../config";
import { Auth } from "aws-amplify";
// import { useAuthDataContext } from 'views';
// import { useHistory} from 'react-router-dom';
// import { getAuthSignOut } from 'common/auth';

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

const LocationListURL = AppConfig.baseURL + "/location/countryStateCityList";
const OrganisationDetailsPartialURL = AppConfig.baseURL + "/organization?organization_id=";
const OrganisationListURL = AppConfig.baseURL + "/organizations";
const ConsentStatusUpdationURL = AppConfig.baseURL + "/organization/changeConsentStatus";

const AddOrganisationURL = AppConfig.baseURL + "/organization";
const EditOrganisationURL = AppConfig.baseURL + "/organization";
const GetLinkedOrganisationsURL = AppConfig.baseURL + "/organization/filter";
const LinkOrganizationURL = AddOrganisationURL + "/link";
const OrgTypeDetailsPartialURL = AddOrganisationURL + "/orgType?organization_id=";
const TransferChildOrgList = OrganisationListURL + "/transferChildList";

const TypeListURL = AppConfig.baseURL + "/organization/types";

const AddFamilyURL = AppConfig.baseURL + "/family";
const AddFamilyMemberURL = AppConfig.baseURL + "/family/member";
const FamilyListURL = AppConfig.baseURL + "/family/list";
const EditFamilyStatusURL = AppConfig.baseURL + "/family";
const EditFamilyMemberURL = AppConfig.baseURL + "/family/member";
const EditFamilyURL = AppConfig.baseURL + "/family";
const GetFamilyDetails = AppConfig.baseURL + "/family?family_id=";

const LanguageListURL = AppConfig.baseURL + "/languages";

const RelationListURL = AppConfig.baseURL + "/family/relation";
const MemberTypeListURL = AppConfig.baseURL + "/family/membertype";

const UserListURL = AppConfig.baseURL + "/users";
const UserRoleList = AppConfig.baseURL + "/user/roles";
const UserDetailsPartialURL = AppConfig.baseURL + "/user?user_id=";
const AddUserURL = AppConfig.baseURL + "/user";
const EditUserURL = AppConfig.baseURL + "/user";
const UserEmailURL =AppConfig.baseURL + "/user/check/unique?email=";

const ChildListURL = AppConfig.baseURL + "/child/list";
const ChildDetailsPartialURL = AppConfig.baseURL + "/child?child_id=";
const AddChildURL = AppConfig.baseURL + "/child";
const ChildPlacementStatusURL = AddChildURL + "/placementStatus";
const ChildStatusURL = AddChildURL + "/childStatus";
const ChildCurrentPlacementURL = AddChildURL + "/currentPlacementStatus";
const ChildEducationLevelURL = AddChildURL + "/educationLevels";
const TransferChildURL = AddChildURL + "/transfer";
const ChildAuditURL = AddChildURL + "/auditlog";

const CaseListURL = AppConfig.baseURL + "/case/list";
const AddCaseURL = AppConfig.baseURL + "/case";
const CaseDetailsPartialURL = AppConfig.baseURL + "/case?case_id=";
const CloseCaseURL = AppConfig.baseURL + "/case/close";

const ChildConsentURL = AppConfig.baseURL + "/consent/listChildConsent";

const FormListURL = AppConfig.baseURL + "/form";

const DomainListURL = AppConfig.baseURL + "/question/domain";
const AddFormQuetionsURL = AppConfig.baseURL + "/form/questions";
const MappedQuetionsURL = AppConfig.baseURL + "/form/mappedQuestions";
const PreviewFormQuestionsURL = AppConfig.baseURL + "/form/preview?formId=";
const NewPreviewFormQuestionsURL = AppConfig.baseURL + "/form/getFormDetails";
const PublishForm = AppConfig.baseURL + "/form/publish";
const UpdateFormURL =  AppConfig.baseURL + "/form/updateForm"
const UpdateFormStatus =  AppConfig.baseURL + "/form/updateFormStatus"
const SaveNewFormURL = AppConfig.baseURL + "/form/saveNewForm"


const getFormDetailsUrl = AppConfig.baseURL + "/form/getFormDetails";

const VisitTypeListURL = AppConfig.baseURL + "/assessment/visittypes";
const ReIntegrationTypeListURL = AppConfig.baseURL + "/assessment/reintegrationtypes";
const AssessmentListURL = AppConfig.baseURL + "/assessment/list";
const SaveResponseURL =AppConfig.baseURL + "/assessment/save/response";

const QuestionDomainListURL = AppConfig.baseURL + "/question/domain";
const QuestionTypeListURL = AppConfig.baseURL + "/question/type";
const QuestionListURL = AppConfig.baseURL + "/question/list";
const GetQuestionDetails = AppConfig.baseURL + "/question?question_id=";
const GetQuestionDetailsForEdit = AppConfig.baseURL + "/question/for/edit?question_id=";

const AnswerTypeListURL = AppConfig.baseURL + "/question/answerType";
const CheckIsQuestionUniqueURL = AppConfig.baseURL + "/question/check/unique";
const CreateQuestionURL = AppConfig.baseURL + "/question";
const EditQuestionURL = AppConfig.baseURL + "/question";
const EditQuestionStatusURL = AppConfig.baseURL + "/question";
const DeleteQuestionURL = AppConfig.baseURL + "/question";

const ListFormQuestionsURL = AppConfig.baseURL + "/assessment/getassessmentform?formId=";
const GetAssessmentDetailsURL = AppConfig.baseURL + "/assessment/getassessmentdetails?assessmentId=";
const CalculateScoreURL = AppConfig.baseURL + "/score/calculate";
const ScoreURL = AppConfig.baseURL + "/score?childId=";

const UploadURL = AppConfig.baseURL + "/fileUploads/";
const UploadedFilesURL = AppConfig.baseURL + "/fileUploads";

const UploadCSVURL = AppConfig.baseURL + "/fileUploads/importFile/";
const CsvHeaderValue = AppConfig.baseURL + "/importFile/mapdata?documentId=";
const ActualImport = AppConfig.baseURL + "/importFile";

const ListEventsURL = AppConfig.baseURL + "/events/list";
const CreateEventsURL = AppConfig.baseURL + "/events/create";
const DeleteEventsURL =  AppConfig.baseURL + "/events";
const EditEventsURL = AppConfig.baseURL + "/events";

const ChildServedReportURL = AppConfig.baseURL + "/report/childrenserved";
const ChildRedFlagReportURL = AppConfig.baseURL + "/report/children/redflags";
const DurationFollowupReportURL = AppConfig.baseURL + "/report/durationFollowup";
const ChildOverdueReportURL = AppConfig.baseURL + "/report/childoverdue";
const NewlyAddedChildrenReportURL = AppConfig.baseURL + "/report/newlyadmitted";
const CaseManagementReportURL = AppConfig.baseURL + "/report/casemanagement";
const CaseworkerServedURL = AppConfig.baseURL + "/report/caseworkerserved";
const FamiliesServedURL = AppConfig.baseURL + "/report/familyserved";
const DashboardOverallURL = AppConfig.baseURL + "/report/dashboardOverall"

const ExportURL = AppConfig.baseURL + "/exportFile";
const AverageThriveURL = AppConfig.baseURL + "/report/averageThrivescale";
const FollowupURL = AppConfig.baseURL + "/report/durationFollowup";
const OverdueURL = AppConfig.baseURL + "/report/childoverdue";
const NewlyAdmittedURL = AppConfig.baseURL + "/report/newlyadmitted";
const DisruptionCasesURL = AppConfig.baseURL + "/report/disruptionCase";
const CaseManagementURL = AppConfig.baseURL + "/report/casemanagement";
const ChildrenInCCIURL = AppConfig.baseURL + "/report/current/cciresident";
const CurrentPlacementURL = AppConfig.baseURL + "/report/current/placement";
const DurationInCCIURL = AppConfig.baseURL + "/report/cci/duration";
const ReintegratedChildrenURL = AppConfig.baseURL + "/report/reintegrated/children"
const NewlyAddedURL = AppConfig.baseURL + '/report/newlyadded';
const InterventionDetailsURL = AppConfig.baseURL + '/report/interventiondetails';
const MapReportURL = AppConfig.baseURL + '/report/map';
const AverageChangeURL = AppConfig.baseURL + '/report/avgPercentChangeTScore';
const EditProfileURL = AppConfig.baseURL + "/user/profile";
const ResendInvitationURL = AppConfig.baseURL + '/user/resendInvite';

const NotificationListURL = AppConfig.baseURL + "/notification/list";
const UpdateNotificationURL = AppConfig.baseURL + "/notification/update";
const saveUserLanguageURL = AppConfig.baseURL + "/user/saveLanguage";
const ProgressReportListURL = AppConfig.baseURL + "/followup/getFollowUpChildList";
const viewFollowUpProgressURL = AppConfig.baseURL + "/followup/viewFollowUpProgress";
const generarateProgressReportListURL = AppConfig.baseURL + "/followup/generateFollowUpProgressListExcel";
const generateFollowUpProgressPdfURL = AppConfig.baseURL + "/followup/generateFollowUpProgressPdf";
// export default function LocationList (){
//      return axios.get(LocationListURL)
//     .then((response)=>{
//         console.log(response)
//     }).catch((error)=>{
//         console.log(error)
//     })
// }

// export default function OrganisationDetails (id){
//     const OrganizationDetailsCompletedURL = OrganisationDetailsPartialURL + id;
//     return axios.get(OrganizationDetailsCompletedURL)
//     .then((response) => {
//         console.log(response)
//     }).catch((error) => {
//         console.log(error)
//     })
// }

const APIS = {
  TypeList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(TypeListURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  LocationList(langId) {
    let CompletedLocationListURL = LocationListURL;
    const userRegion = localStorage.getItem('userRegion')
    let userRole = localStorage.getItem('role');
    if (langId) {
      CompletedLocationListURL = LocationListURL + `?languageId=${langId}` + `&HTCountryId=${userRole==='superadmin'?userRegion==='india'?userRegion:'':userRegion}`;
    }else{
      CompletedLocationListURL = LocationListURL + `?HTCountryId=${userRole==='superadmin'?userRegion==='india'?userRegion:'':userRegion}`;
    }
    let prerequest = this.PreRequestCall()
    return axios.all([prerequest]).then((res) => {
    return axios
      .get(CompletedLocationListURL)
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
    let prerequest = this.PreRequestCall()
    return axios.all([prerequest]).then((res) => {
    return axios
      .get(CompletedVisitTypeListURL)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
    });
  },

  ReIntegrationTypeList(langId) {
    let CompletedReIntegrationTypeListURL = ReIntegrationTypeListURL;
    if (langId) {
      CompletedReIntegrationTypeListURL =
        ReIntegrationTypeListURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall()
    return axios.all([prerequest]).then((res) => {
    return axios
      .get(CompletedReIntegrationTypeListURL)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
    });
  },

  CaseList(payload) {
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const OrganizationDetailsCompletedURL =
        OrganisationDetailsPartialURL + id ;
      return axios
        .get(OrganizationDetailsCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  OrganizationList(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(OrganisationListURL, payload)
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
  EditOrganization(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .put(EditOrganisationURL, payload)
        .then((resonse) => {
          return resonse;
        })
        .catch((error) => {
          console.log("error", error);
        });
    });
  },
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
    })
  },

  FamilyDetails(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const GetFamilyDetailsURL = GetFamilyDetails + id;
      return axios
        .get(GetFamilyDetailsURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ListUsers(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(UserListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  UserRoleList() {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .get(UserRoleList)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  UserDetails(id) {
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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

  AddFamilyMember(payload) {
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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

  FamilyList(payload) {
    let prerequest = this.PreRequestCall()
    return axios.all([prerequest]).then((res) => {
    return axios
      .post(FamilyListURL, payload)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
    });
  },

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
  CheckUserEmailExists(id) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const UserCompletedURL = UserEmailURL + id;
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
  PreRequestCall() {
    return Auth.currentSession()
      .then((data) => {
        data.getAccessToken().getJwtToken();
        localStorage.setItem("accessToken", data.accessToken.jwtToken);
        localStorage.setItem("refreshToken", data.refreshToken.jwtToken);
        localStorage.setItem("idToken", data.idToken.jwtToken);
        axios.defaults.headers.common["Authorization"] = data.idToken.jwtToken;
      })
      .catch((err) => {
        console.log("error", err);
        localStorage.setItem("accessToken", "");
        localStorage.setItem("refreshToken", "");
        localStorage.setItem("idToken", "");
      });
  },
  ListChildren(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildListURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },

  ListChildrenConsent(payload) {
    let prerequest = this.PreRequestCall();
    
    return axios.all([prerequest]).then((res) => {
      const ChildConsentCompletedURL = ChildConsentURL + `?HTChildId=` + payload.HTChildId + `&rowCount=`+ '' +`&pageNumber=`+'';
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
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const ChildCompletedURL = ChildDetailsPartialURL + id;
      return axios
        .get(ChildCompletedURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
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
          console.log("error", error);
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));

    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
    }
     payload.langId = langId

    return axios.all([prerequest]).then((res) => {
    return axios
      .post(getFormDetailsUrl,payload)
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
    return axios.all([prerequest]).then((res) => {
    return axios
      .post(NewPreviewFormQuestionsURL, payload)
      .then((resonse) => {
        console.log('NewPreviewQuestions',resonse)
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
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
      CompletedQuestionDomainListURL = QuestionDomainListURL + `?languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
    }
    payload.HTLanguageId = langId
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
    }
    payload.HTLanguageId = langId
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
    }
    let FormQuestionsCompletedURL =
      ListFormQuestionsURL + formId + `&formRevision=${formRevision}`;
    if (langId) {
      FormQuestionsCompletedURL =
        FormQuestionsCompletedURL + `&languageId=${langId}`;
    }
    let prerequest = this.PreRequestCall()
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

  GetAssessmentDetails(assessmentId, formRevision) {
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
    }
    const GetAssessmentDetailCompletedURL =
      GetAssessmentDetailsURL +
      assessmentId +
      `&formRevision=${formRevision}` +
      `&languageId=${langId}`;
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
  ScoreForEachChild(childId) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      const CompleteScoreURL = ScoreURL + childId;
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
  UploadFile(payload) {
    let payloadURL = `${payload.moduleType}/${payload.documentType}?fileName=${payload.fileName}&moduleId=${payload.moduleId}&fileSize=${payload.fileSize}&description=${payload.description}`;
    let newUploadURl = UploadURL + payloadURL;
    let prerequest = this.PreRequestCall()
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

  UploadCSVFile(payload) {
    let payloadURL = `${payload.moduleType}/${payload.documentType}?fileName=${payload.fileName}&fileSize=${payload.fileSize}&description=${payload.description}`;
    let newUploadURl = UploadCSVURL + payloadURL;
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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

  DeleteProfileImage(payload) {
    let payloadURL = `${payload.moduleType}/${payload.documentType}?moduleId=${payload.moduleId}`;
    let newUploadURl = UploadURL + payloadURL;
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
    let prerequest = this.PreRequestCall()
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
      const OrgDetailsCompleteURL = OrgTypeDetailsPartialURL + id;
      return axios
        .get(OrgDetailsCompleteURL)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ChildServedReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildServedReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ChildRedFlagReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildRedFlagReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  DurationFollowupReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(DurationFollowupReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ChildOverdueReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildOverdueReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  NewlyAddedChildrenReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(NewlyAddedChildrenReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  CaseManagementReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CaseManagementReportURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ExportFile(payload) {
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if(!currentLanguage || !currentLanguageList.length){
      langId =""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
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
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(AverageThriveURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  FollowupDurationReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(FollowupURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
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
  ChildrenOverdueReport(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(OverdueURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
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
  
  ChildrenInCCI(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ChildrenInCCIURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  CurrentPlacement(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(CurrentPlacementURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  // DurationInCCI() {
  //     //let prerequest = this.PreRequestCall()
  //     return axios
  //       .post(DurationInCCIURL)
  //       .then((response) => {
  //         return response;
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   },

  DurationInCCI(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(DurationInCCIURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  ReintegratedChildren(payload) {
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
      return axios
        .post(ReintegratedChildrenURL, payload)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  NewlyAddedChildren(payload){
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
        return axios.post(NewlyAddedURL,payload)
            .then((response)=>{
                return response
             }).catch((error)=>{
            console.log(error)
             })
    })
},
  InterventionDetails(payload){
    let prerequest = this.PreRequestCall();
    return axios.all([prerequest]).then((res) => {
        return axios.post(InterventionDetailsURL,payload)
            .then((response)=>{
                return response
             }).catch((error)=>{
            console.log(error)
             })
    })
},
MapDashboardData(payload){
  let prerequest = this.PreRequestCall();
  return axios.all([prerequest]).then((res) => {
      return axios.post(MapReportURL,payload)
          .then((response)=>{
              return response
           }).catch((error)=>{
          console.log(error)
           })
  })
},
AverageChangeTS(payload){
  let prerequest = this.PreRequestCall();
  return axios.all([prerequest]).then((res) => {
      return axios.post(AverageChangeURL,payload)
          .then((response)=>{
              return response
           }).catch((error)=>{
          console.log(error)
           })
  })
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
UploadUpdatedFile(payload){
  console.log("called")
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
ResendInvitation(payload){
  let prerequest = this.PreRequestCall();
  return axios.all([prerequest]).then((res) => {
      return axios.post(ResendInvitationURL,payload)
          .then((response)=>{
              return response
           }).catch((error) => {
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
  })
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
  let prerequest = this.PreRequestCall()
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
      .post(saveUserLanguageURL, payload)
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


  
};

export default APIS;
