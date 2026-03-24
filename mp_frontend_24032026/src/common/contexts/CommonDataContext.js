import { useState, createContext, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

import APIS from "../hooks/UseApiCalls";
import { Auth } from "aws-amplify";
import { filterMessagesByCurrentTime } from "../../constants";
import { get } from "lodash";
import useAuth from "../hooks/UseAuth";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router";
import { getCurrentLanguageIdFromCode } from "../../helpers/helperFunction";
//import { customerApi } from '../../__fakeApi__/customerApi';
export const CommonDataContext = createContext();

const CommonDataContextProvider = (props) => {
  const [locationList, setLocationList] = useState([]);
  const [organizationList, setOrganizationList] = useState([]);
  const [familyList, setFamilyList] = useState([]);
  const [membersInFamily, setMembersInFamily] = useState([]);
  const [family, setFamily] = useState({});
  const [typeList, setTypeList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [relationList, setRelationList] = useState([]);
  const [memberTypeList, setMemberTypeList] = useState([]);
  const [roleListFS, setRoleListFS] = useState([]);
  const [roleListHT, setRoleListHT] = useState([]);
  const [language, setLanguage] = useState("en");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [childPlacementList, setChildPlacementList] = useState([]);
  const [fsChildPlacementList, setFsChildPlacementList] = useState([]);
  const [childStatusList, setChildStatusList] = useState([]);
  const [childCurrentPlacementList, setChildCurrentPlacementList] = useState(
    []
  );
  const [questionDomainList, setQuestionDomainList] = useState([]);
  const [questionTypeList, setQuestionTypeList] = useState([]);
  const [redFlagQuestionList, setRedFlagQuestionList] = useState([]);
  const [answerTypeList, setAnswerTypeList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [childList, setChildList] = useState([]);
  const [childFamilyList, setChildFamilyList] = useState([]);
  const [childEducationList, setChildEducationList] = useState([]);
  const [signedinUserRoleHT, setSignedinUserRoleHT] = useState(null);
  const [signedinUserRoleFS, setSignedinUserRoleFS] = useState(null);
  const [signedinOrgType, setSignedinOrgType] = useState(null);
  const [visitTypeList, setVisitTypeList] = useState([]);
  const [reIntegrationTypeList, setReIntegrationTypeList] = useState([]);
  const [situationsAndGoals, setSituationsAndGoals] = useState([]);
  const [caseList, setCaseList] = useState([]);
  const [signedInOrgName, setSignedInOrgName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userImage, setUserImage] = useState(null);
  const [userRegion, setUserRegion] = useState("");
  const [languageId, setLanguageId] = useState("1");
  const [languageChange, setLanguageChange] = useState(false);
  const [currentUserlanguage, setCurrentUserlanguage] = useState(
    localStorage.getItem("language")
  );
  // const [websocketData,setWebsocketData] = useState(null);
  const [isProfileDetailsChanged, setIsProfileDetailsChanged] = useState(false);
  const [isProfileImageUpdated, setIsProfileImageUpdated] = useState(false);
  const [isProfileImageDeleted, setIsProfileImageDeleted] = useState(false);
  const [showNewNotifications, setShowNewNotifications] = useState(false);
  const [changeLanguageFromAssessment, setChangeLanguageFromAssessment] =
    useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState([]);
  const [formDetails, setFormDetails] = useState([]);
  const [currentlySelectedDomain, setCurrentlySelectedDomain] = useState(1);
  const [formPageValue, setFormPageValue] = useState(1);
  const [signedURL, setSignedURL] = useState("");
  const [dbRegion, setDBRegion] = useState("");
  const [accountTypesList, setAccountTypesList] = useState([]);
  const [isSelectedTS, setIsSelectedTS] = useState(
    localStorage.getItem("tsSelected")
  );
  const [isSelectedFS, setIsSelectedFS] = useState(
    localStorage.getItem("fsSelected")
  );
  const { i18n, t } = useTranslation(["common"]);
  const navigate = useNavigate();

  const [staticRoleList, setStaticRoleList] = useState([
    {
      id: "1",
      role: "Super Admin",
    },
    {
      id: "2",
      role: "Admin",
    },
    {
      id: "3",
      role: "Case Worker",
    },
    {
      id: "4",
      role: "View Only",
    },
  ]);
  const [assessmentData, setAssessmentData] = useState({});
  const [userIdData, setUserIdData] = useState(null);
  const [fsLanguagesList, setFsLanguagesList] = useState([]);
  const [htLanguagesList, setHtLanguagesList] = useState([]);
  const [allLanguagesList, setAllLanguagesList] = useState([]);
  const [fsAvailableChildrenIds, setFsAvailableChildrenIds] = useState([]);
  const [tsAvailableChildrenIds, setTsAvailableChildrenIds] = useState([]);
  const [tsAvailableFamilyIds, setTsAvailableFamilyIds] = useState([]);
  const [allSystemMessages, setAllSystemMessages] = useState([]);
  const [popupMessages, setPopupMessages] = useState([]);
  const [bannerMessages, setBannerMessages] = useState([]);
  const [systemMessageTypes, setSystemMessageTypes] = useState([]);
  const [systemMessagesFetchedAtLogin, setSystemMessagesFetchedAtLogin] = useState(false);
  const intervalRef = useRef(null);
  const signedinHTUserRoleId = localStorage.getItem("HTUserRoleId");
  const signedinFSUserRoleId = localStorage.getItem("FSUserRoleId");
  const [navbarFilterValues, setNavbarFilterValues] = useState([]);
  const [countryListForSidenav, setCountryListForSidenav] = useState([]);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [familyDropdownLists, setFamilyDropdownLists] = useState({
    familyDeactivateReason: [],
    familyDeleteReason: [],
    familyMemberType: [],
    familyRelations: [],
    familySituation: [],
    familyTypeAndGoal: []
  });  
  const [childDropdownLists, setChildDropdownLists] = useState({});
  const { logout } = useAuth();


  const getCountryListForSidenav = useCallback(async () => {
    try {
      const res = await APIS.GetLoactionsForFilter();
      if (Array.isArray(res?.data?.data?.countries)) {
        // Sort states by stateName
        res.data.data.countries.sort((a, b) => {
          if (a.stateName < b.stateName) return -1;
          if (a.stateName > b.stateName) return 1;
          return 0;
        });

        // Sort districts and zipcodes inside each state
        res.data.data.countries.forEach(country => {
          if (Array.isArray(country.districts)) {
            country.districts.sort((a, b) => {
              if (a.districtName < b.districtName) return -1;
              if (a.districtName > b.districtName) return 1;
              return 0;
            });
          }
          if (Array.isArray(country.zipcodes)) {
            country.zipcodes.forEach((zipcode, idx) => {
              zipcode.id = idx + 1;
            });
          }
        });
        res.data.data.countries.forEach(country => {
          if (Array.isArray(country.zipcodes)) {
        country.zipcodes.forEach((zipcode, idx) => {
          zipcode.id = idx + 1;
        });
          }
        });
      }      
        setCountryListForSidenav(res?.data?.data?.countries || []);
    } catch (err) {
      console.error(err);
    }
  }, []);
  useEffect(() => {
    getSignedinUserRole();
    getSignedinUserOrgType();
    getSignedinUserId();
    // getLocationList()
    // getOrganizationList()
    // getTypesList()
    // getLanguageList()
    // getFamilyList()
    // getRelationList()
    // getMemberTypeList()
    // getRolesList()
    // getUserTokens();
    // getChildPlacementStatus();
    // getChildStatus();
    // getChildCurrentPlacementStatus();
    // getQuestionDomainList();
    // getQuestionTypeList();
    // getAnswerTypeList();
    // getUserList();
    // getChildList();
    // getVisitTypeList();
    // getReIntegrationTypeList();
    // getCaseList();
    // getChildFamilyList();
    // getChildEducationLevels();
    return () => { };
  }, []);
  useEffect(() => {
    checkIfLoggedIn();
    getUserDetails();
    return () => { };
  }, [signedinUserRoleHT, signedinUserRoleFS]);

  useEffect(() => {
    localStorage.setItem("accessToken", accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (isProfileImageUpdated) {
      getUserImageDetailsOnUpdation();
    }
  }, [isProfileImageUpdated]);

  useEffect(() => {
    if (isProfileImageDeleted) {
      getUserImageDetailsOnDeletion();
    }
  }, [isProfileImageDeleted]);

  useEffect(() => {
    if (isProfileDetailsChanged) {
      getUserDetails();
    }
  }, [isProfileDetailsChanged]);

  useEffect(() => {
    const signedinHTUserRoleId = localStorage.getItem("HTUserRoleId") === "undefined" ? null : localStorage.getItem("HTUserRoleId");
    const signedinFSUserRoleId = localStorage.getItem("FSUserRoleId") === "undefined" ? null : localStorage.getItem("FSUserRoleId");
    if (signedinHTUserRoleId && signedinFSUserRoleId && !systemMessagesFetchedAtLogin) {
      getSystemMessages();

      // Set up the interval to call the function every hour (3600000 milliseconds)
      intervalRef.current = setInterval(getSystemMessages, 600000);
      // intervalRef.current = setInterval(getSystemMessages, 5000);

      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalRef.current);
    }
  }, [signedinHTUserRoleId, signedinFSUserRoleId]);

  // const setuserNames = () => {
  //   let fname = localStorage.getItem('firstName');
  //   let lname = localStorage.getItem('lastName');
  //   setFirstName(fname);
  //   setLastName(lname);
  // }

  const checkIfLoggedIn = () => {
    if (
      signedinOrgType !== null &&
      signedinUserRoleHT !== null &&
      signedinUserRoleFS !== null
    ) {
      // callAllAPIs()
    } else {
      getSignedinUserRole();
      getSignedinUserOrgType();
      getSignedinUserId();
    }
  };

  const callAllAPIs = () => {
    getLocationList();
    getOrganizationList();
    getTypesList();
    getLanguageList();
    getFamilyList();
    getRelationList();
    getAccountTypesList();
    getMemberTypeList();
    getRolesList();
    getUserTokens();
    getChildPlacementStatus();
    getFsChildCurrentPlacementStatus();
    getChildStatus();
    getChildCurrentPlacementStatus();
    getQuestionDomainList();
    getQuestionTypeList();
    getAnswerTypeList();
    getUserList();
    getChildList();
    getVisitTypeList();
    getReIntegrationTypeList();
    getFamilySituationAndGoals();
    getCaseList();
    getChildFamilyList();
    getChildEducationLevels();
    getQuestionDomainList();
    getLanguagesList();
    getFsChildListData();
    getTsChildListData();
    getTsFamilyListData();
    getSystemMessageTypes();
    getCountryListForSidenav();
    getFamilyDropdownLists()
    getChildDropdownLists()
    getUserRegion();
  };

  // const websocketConnection = ()=>{
  //      if (userIdData !== null ){
  //       const ws = new WebSocket(`wss://224glt19n6.execute-api.us-east-1.amazonaws.com/staging-test?userId=${userIdData}`);
  //     ws.onopen = function() {
  //       //ws.send(JSON.stringify({action:"getConnectionId",data:"hello world"}))
  //       // ws.send(JSON.stringify({action:"ping",data:"hello world"}))
  //       console.log("Websocket Connection established");
  //     };
  //     ws.onmessage = function(event) {
  //       console.log("Web socket response for import",event.data);
  //       const data = JSON.parse(event.data)
  //       setWebsocketData(data);
  //     };
  //   }

  // }

  const getSystemMessageTypes = async () => {
    const res = await APIS.getSystemMessageTypeList();
    setSystemMessageTypes(res?.data?.data);
  };

  const getFsChildListData = async (rowCount = 100000, pageNumber = 1) => {
    let params = {
      rowCount,
      pageNumber,
      placementStatus: "ALL",
    };
    try {
      const res = await APIS.getFsChildList({
        ...params,
      });

      const { data } = res;
      if (Array.isArray(data?.data))
        setFsAvailableChildrenIds(data?.data?.map((obj) => obj.id));
    } catch (error) { }
  };

   const getTsChildListData = async (rowCount = 100000, pageNumber = 1) => {
    let params = {
      rowCount,
      pageNumber,
    };
    try {
      const res = await APIS.ListChildren({
        ...params,
      });

      const { data } = res;
      if (Array.isArray(data?.data))
        setTsAvailableChildrenIds(data?.data?.map((obj) => obj.id));
    } catch (error) { }
  };

  const getTsFamilyListData = async (rowCount = 100000, pageNumber = 1) => {
    let params = {
      rowCount,
      pageNumber,
    };
    try {
      const res = await APIS.FamilyList({
        ...params,
      });

      const { data } = res;      
      if (Array.isArray(data?.familyDetails))
        setTsAvailableFamilyIds(data?.familyDetails?.map((obj) => obj.id));
    } catch (error) { }
  };

  const getLocationList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.LocationList(langId);
      if (data && data.data && data.data.data) {
        setLocationList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserDetails = useCallback(async () => {
    let id = localStorage.getItem("username");
    try {
      const data = await APIS.UserDetails(id);
      const resData = data?.data?.data;
      setFirstName(resData?.firstName);
      setLastName(resData?.lastName);
      localStorage.setItem("HTUserRoleId", resData?.HTUserRoleId);
      localStorage.setItem("FSUserRoleId", resData?.FSUserRoleId);
      if(resData?.TWCountryId) {
        localStorage.setItem("userRegion", resData?.TWCountryId);
      }
      setUserImage(resData?.fileUrl);
      setUserRegion(resData?.countryInfo);
      sessionStorage.setItem("username", resData?.id);
      localStorage.setItem("username", resData?.id);
      localStorage.setItem(
        "isTermsOfUseAccepted",
        resData?.isTermsOfUseAccepted
      );
      setLanguageId(resData?.MPLanguageId);
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!resData?.MPLanguageId || !currentLanguageList?.length) {
        langId = "en";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find((item) => item.id == resData.MPLanguageId)
            ?.languageCode;
      }
      i18n.changeLanguage(langId);
      localStorage.setItem("language", langId);
      callAllAPIs();
      setIsProfileDetailsChanged(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserImageDetailsOnUpdation = useCallback(async () => {
    let id = localStorage.getItem("username");
    let flag = true;
    try {
      while (flag == true) {
        const data = await APIS.UserDetails(id);
        setUserImage(data.data.userDetails.fileUrl);
        if (data.data.userDetails.fileUrl != null) {
          flag = false;
        }
      }
      setIsProfileImageUpdated(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserImageDetailsOnDeletion = useCallback(async () => {
    setUserImage(null);
    setIsProfileImageDeleted(false);
  }, []);

  const getVisitTypeList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.VisitTypeList(langId);
      if (data && data.data && data.data.data.length !== 0) {
        let list = data.data.data;
        setVisitTypeList(list);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getReIntegrationTypeList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.ReIntegrationTypeList(langId);
      if (data && data.data && data.data.data.length !== 0) {
        let list = data.data.data;
        setReIntegrationTypeList(list);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getFamilySituationAndGoals = useCallback(async () => {
      try {
        const currentLanguage = localStorage.getItem("language");
        const currentLanguageList = JSON.parse(
          localStorage.getItem("languageList")
        );
        let langId;
        if (!currentLanguage || !currentLanguageList?.length) {
          langId = "1";
        } else {
          langId =
            currentLanguageList.length &&
            currentLanguageList.find(
              (item) => item.languageCode == currentLanguage
            )?.id;
        }
        const data = await APIS.familySituationAndGoals(null);
        if (data?.data?.familySituationAndGoals) {
          setSituationsAndGoals(data?.data?.familySituationAndGoals);
        }
      } catch (err) {
        console.error(err);
      }
    }, []);

  const getCaseList = useCallback(async () => {
    try {
      let payload = {
        needFullData: true,
        orderByField: [["id", "ASC"]],
      };
      const data = await APIS.CaseList(payload);
      if (data && data.data && data.data.data.length) {
        let list = data.data.data;
        setCaseList(list);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getLanguageList = useCallback(async () => {
    try {
      const data = await APIS.LanguageList();
      if (data && data.data && data.data.data && data.data.data.length) {
        setLanguageList(data.data.data);
        localStorage.setItem("languageList", JSON.stringify(data.data.data));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getRelationList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.RelationList(langId);
      if (data && data.data && data.data.relations) {
        setRelationList(data.data.relations);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getAccountTypesList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const res = await APIS.TypeList({ languageId: langId });
      setAccountTypesList(res.data.data);
    } catch (error) { }
  }, []);

  const getMemberTypeList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.MemberTypeList(langId);
      if (data && data.data && data.data.familyMemberType) {
        setMemberTypeList(data.data.familyMemberType);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getOrganizationList = useCallback(async () => {
    try {
      let getOrgListpayload = {
        rowCount: "10000",
        pageNumber: "1",
        globalSearchQuery: "",
        // "orgStatus": "",
        orderByField: [["accountName", "ASC"]],
      };
      if (localStorage.getItem("role") === "superadmin") {
        getOrgListpayload.TWCountryId = "";
      } else {
        getOrgListpayload.TWCountryId = localStorage.getItem("userRegion");
      }
      const data = await APIS.OrganizationList(getOrgListpayload);
      if (data && data.data && data.data.data.length) {
        setOrganizationList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getFamilyList = useCallback(async () => {
    try {
      let getFamListpayload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["familyName", "ASC"]],
      };
      const data = await APIS.FamilyList(getFamListpayload);
      if (data && data.data && data.data.familyDetails) {
        setFamilyList(data.data.familyDetails);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getTypesList = useCallback(async () => {
    try {
      const data = await APIS.TypeList();
      if (data && data.data && data.data.data) {
        setTypeList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getRolesList = useCallback(async () => {
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    try {
      const dataFS = await APIS.UserRoleListFS(1);
      const dataHT = await APIS.UserRoleListHT(1);
      if (dataFS && dataFS.data && dataFS.data.data) {
        setRoleListFS(dataFS.data.data);
      }
      if (dataHT && dataHT.data && dataHT.data.data) {
        setRoleListHT(dataHT.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserTokens = useCallback(async () => {
    try {
      Auth.currentSession()
        .then((data) => {
          data.getAccessToken().getJwtToken();
          setAccessToken(data.accessToken.jwtToken);
          setRefreshToken(data.refreshToken.jwtToken);
          localStorage.setItem("accessToken", data.accessToken.jwtToken);
          localStorage.setItem("refreshToken", data.refreshToken.jwtToken);
          localStorage.setItem("idToken", data.idToken.jwtToken);
        })
        .catch((err) => {
          setAccessToken("");
          setRefreshToken("");
          setSignedinOrgType(null);
        });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildPlacementStatus = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.ChildPlacementStatus(langId);
      if (data && data.data && data.data.data) {
        setChildPlacementList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getFsChildCurrentPlacementStatus = useCallback(async () => {
    try {
      const res = await APIS.getFsChildPlacementStatusList();
      if (res.status === 200) {
        setFsChildPlacementList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildStatus = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.ChildStatus(langId);
      if (data && data.data && data.data.data) {
        setChildStatusList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildCurrentPlacementStatus = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.ChildCurrentPlacementStatus(langId);
      if (data && data.data && data.data.data) {
        setChildCurrentPlacementList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildEducationLevels = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem("language");
      const currentLanguageList = JSON.parse(
        localStorage.getItem("languageList")
      );
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = "1";
      } else {
        langId =
          currentLanguageList.length &&
          currentLanguageList.find(
            (item) => item.languageCode == currentLanguage
          )?.id;
      }
      const data = await APIS.ChildEducationList(langId);
      if (data && data.data && data.data.data) {
        setChildEducationList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getQuestionDomainList = useCallback(async () => {
    const currentLanguage = localStorage.getItem("language");
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }
    try {
      const data = await APIS.QuestionDomainList(langId);
      if (data && data.data && data.data.data && data.data.data.length !== 0) {
        setQuestionDomainList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getQuestionTypeList = useCallback(async () => {
    try {
      const data = await APIS.QuestionTypeList();
      if (data && data.data && data.data.data && data.data.data.length !== 0) {
        setQuestionTypeList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserList = useCallback(async () => {
    try {
      let getUserListpayload = {
        rowCount: "100",
        pageNumber: "1",
        globalSearchQuery: "",
        orderByField: [["id", "ASC"]],
      };
      const data = await APIS.ListUsers(getUserListpayload);
      if (data && data.data && data.data.users?.length) {
        setUserList(data.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getAnswerTypeList = useCallback(async () => {
    try {
      const data = await APIS.AnswerTypeList();
      if (data && data.data && data.data.data && data.data.data.length !== 0) {
        setAnswerTypeList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildList = useCallback(async () => {
    try {
      let getChildListpayload = {
        rowCount: "100",
        pageNumber: "1",
        HTCaseId: null,
        globalSearchQuery: "",
        orderByField: [["id", "ASC"]],
      };
      const data = await APIS.ListChildren(getChildListpayload);
      if (data && data.data && data.data.data.length) {
        setChildList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildFamilyList = useCallback(async () => {
    try {
      let getChildListpayload = {
        rowCount: "10000",
        pageNumber: "1",
        HTFamilyId: null,
        globalSearchQuery: "",
        orderByField: [["id", "ASC"]],
      };
      const data = await APIS.ListChildren(getChildListpayload);
      if (data && data.data && data.data.data.length) {
        setChildFamilyList(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearListingPageDetails = (value) => {
    if (value === "userPageData") {
      localStorage.removeItem("famPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "famPageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "orgPageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("famPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "childPageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("famPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "casePageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("famPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "formPageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("famPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "questionPageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("famPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("assessmentPageData");
    } else if (value === "assessmentPageData") {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("famPageData");
    } else {
      localStorage.removeItem("userPageData");
      localStorage.removeItem("famPageData");
      localStorage.removeItem("orgPageData");
      localStorage.removeItem("childPageData");
      localStorage.removeItem("casePageData");
      localStorage.removeItem("formPageData");
      localStorage.removeItem("questionPageData");
      localStorage.removeItem("assessmentPageData");
    }
  };
  const getSignedinUserRole = () => {
    let userRoleHT = localStorage.getItem("ht_role");
    setSignedinUserRoleHT(userRoleHT);
    let userRoleFS = localStorage.getItem("fs_role");
    setSignedinUserRoleFS(userRoleFS);
  };
  const getSignedinUserId = () => {
    let userId = localStorage.getItem("username");
    setUserIdData(userId);
  };

  const getSignedinUserOrgType = useCallback(async (val = null) => {
    try {
      let accountId;
      if (val === null) {
        accountId = localStorage.getItem("orgId");
      } else {
        accountId = val;
      }
      const accountData = await APIS.OrganisationDetails(accountId);     
      // Create a state variable for linkedAccounts
      const linkedAccountsRaw = accountData?.data?.data?.linkedAccounts || [];
      const mappedLinkedAccounts = linkedAccountsRaw.map(acc => ({
        accountId: acc.id,
        accountName: acc.accountName // You may want to fetch or set the account name if available
      }));
      setLinkedAccounts(mappedLinkedAccounts);
      setSignedInOrgName(accountData?.data?.data?.accountName);
      if (accountData?.data.data.MPAccountTypeId !== val) {
        const data = await APIS.OrgTypeDetails(
          accountData.data.data.MPAccountTypeId
        );
        if (data.status === 200) {
          localStorage.setItem(
            "signedinOrgType",
            data.data?.data[0].id
          );
          setSignedinOrgType(data.data?.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getLanguagesList = useCallback(async () => {
    try {
      let htLangs = await APIS.GetLanguagesList("THRIVE_SCALE");
      let fsLangs = await APIS.GetLanguagesList("FOSTER_SHARE");
      let allLangs = await APIS.GetLanguagesList("BOTH");
      setHtLanguagesList(htLangs?.data?.data);
      setFsLanguagesList(fsLangs?.data?.data);
      setAllLanguagesList(allLangs?.data?.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getCurrentDayOfWeek = () => {
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDayIndex = new Date().getDay();
    return daysOfWeek[currentDayIndex];
  };

  const getSystemMessages = async (isLoginCall = false) => {
    try {
      const signedinHTUserRoleId = localStorage.getItem("HTUserRoleId");
      const signedinFSUserRoleId = localStorage.getItem("FSUserRoleId");

      const date = new Date();

      const currentTime = date.toISOString();

      // Add 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
      date.setTime(date.getTime() + (60 * 60 * 1000));
      const oneHourLater = date.toISOString(); // Time 1 hour later in ISO format

      // Check if one hour has passed since the last API call
      const data = await APIS.GetSystemMessagesAfterLogin({
        FSUserRoleId: signedinFSUserRoleId,
        MPAccountId: localStorage.getItem("orgId"),
        HTUserRoleId: signedinHTUserRoleId,
        viewingFrom: "WEB",
        dayOfWeek: getCurrentDayOfWeek(),
        hourStart: currentTime,
        hourEnd: oneHourLater,
        status: "Active",
        userCountryId: localStorage.getItem("userRegion")
      });

      let messages = filterMessagesByCurrentTime(data?.data?.data)
      if (!isLoginCall) {
        messages = messages?.filter(msg => msg.messageFrequency !== "ON_EVERY_LOGIN")
      }
      const filteredPopupMessages = messages?.filter(msg => msg.MPSystemMessageTypeId == 1);
      const filteredBannerMessages = messages?.filter(msg => msg.MPSystemMessageTypeId == 3);

      // Update the message lists
      setAllSystemMessages(messages)
      setPopupMessages(filteredPopupMessages);
      setBannerMessages(filteredBannerMessages);
    } catch (error) {
      console.error("Failed to fetch system messages", error);
    }
  };

  const getDepricationData = async () => {
    try {
      const res = await APIS.checkIfAppDepricated();
      return res?.data;
    } catch (error) { }
  };

  const getUserRegion = async () => {
    try {
      const res = await APIS.GetRegion();
      const fetchedRegion = res?.data?.data?.region;
      if(localStorage.getItem("userDBRegion") != fetchedRegion){
        if(localStorage.getItem("userDBRegion")){
          toast.error(t("common:common.Network location changed"));
        }
        await logout();
        localStorage.clear();
        localStorage.setItem("userDBRegion", fetchedRegion);
        navigate('/signin');
      }
      localStorage.setItem("userDBRegion", fetchedRegion);
      return res?.data;
    } catch (error) { }
  };

  

  const getFamilyDropdownLists = async () => {
    try {
      let payload = {
        dropdowns: [
          {
            name: "familymembertype",
            languageId:getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            sortOrder: "ASC",
          },
          {
            name: "familysituation",
            languageId: getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            sortOrder: "ASC",
          },
          {
            name: "familyrelation",
            languageId: getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            sortOrder: "ASC",
          },
          {
            name: "familytypeandgoal",
            languageId: getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            sortOrder: "ASC",
          },
          {
            name: "familydeactivationreason",
            languageId: getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            sortOrder: "ASC",
          },
          {
            name: "familydeletereason",
            languageId: getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            sortOrder: "ASC",
          },
        ],
      };
      const res = await APIS.GetFamilyDropdownLists(payload);
      setFamilyDropdownLists(res?.data?.data);
    } catch (error) {
      console.error(error);
    }
  }; 
   const getChildDropdownLists = async () => {
     try {
       let payload = {
        "dropdowns": [{
          "name": "PLACEMENTSTATUS",
          "languageId": getCurrentLanguageIdFromCode(localStorage.getItem("language")),
          "sortOrder": ""
          },{
          "name": "EDUCATIONLEVEL",
          "languageId": getCurrentLanguageIdFromCode(localStorage.getItem("language")),
          "sortOrder": ""
          },{
            "name": "CURRENTPLACEMENTSTATUS",
            "languageId": getCurrentLanguageIdFromCode(localStorage.getItem("language")),
            "sortOrder": ""
          },
    {
          "name": "ETHNICITY",
          "languageId": getCurrentLanguageIdFromCode(localStorage.getItem("language"))
          },
          {
          "name": "CASECLOSEREASONS"
        }
      ]
}
        const res = await APIS.GetChildDropdownLists(payload);
        

      setChildDropdownLists(res?.data?.data);
    } catch (error) {
      console.error(error);
    }
  }; 

  // useEffect(()=>{
  // if (websocketData!==null){
  //   console.log("websocket data",websocketData.statusCode)
  //   if (websocketData.statusCode===201 && websocketData.statusMessage==="IMPORT_SUCESS")
  //   {
  //      toast.success("Import completed successfully")
  //   }
  //   if (websocketData.statusCode===400 && websocketData.statusMessage==="BAD_REQUEST")
  //   {
  //     toast.error("Bad request")
  //   }
  //   if (websocketData.statusCode===102 && websocketData.statusMessage==="IMPORT_PARTIALLY_COMPLETED")
  //   {
  //     toast.error("Import  partially completed ")
  //   }
  //   if (websocketData.statusCode===101 && websocketData.statusMessage==="INCORRECT_CSV")
  //   {
  //     toast.error("Incorrect CSV")
  //   }
  // }
  // },[websocketData])

  let value = {
    getUserDetails,
    locationList,
    setLocationList,
    organizationList,
    setOrganizationList,
    familyList,
    getFamilyList,
    family,
    setFamily,
    membersInFamily,
    setMembersInFamily,
    typeList,
    setTypeList,
    getOrganizationList,
    getLocationList,
    getTypesList,
    languageList,
    setLanguageList,
    relationList,
    setRelationList,
    getRelationList,
    memberTypeList,
    getMemberTypeList,
    accountTypesList,
    getAccountTypesList,
    language,
    setLanguage,
    getRolesList,
    roleListFS,
    roleListHT,
    setRoleListFS,
    setRoleListHT,
    getUserTokens,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    childPlacementList,
    fsChildPlacementList,
    setChildPlacementList,
    getChildPlacementStatus,
    getFsChildCurrentPlacementStatus,
    childStatusList,
    setChildStatusList,
    getChildStatus,
    childCurrentPlacementList,
    setChildCurrentPlacementList,
    getChildCurrentPlacementStatus,
    questionDomainList,
    getQuestionDomainList,
    questionTypeList,
    answerTypeList,
    redFlagQuestionList,
    setRedFlagQuestionList,
    userList,
    setUserList,
    getUserList,
    childList,
    setChildList,
    getChildList,
    visitTypeList,
    getVisitTypeList,
    reIntegrationTypeList,
    getReIntegrationTypeList,
    situationsAndGoals,
    getFamilySituationAndGoals,
    caseList,
    getCaseList,
    setAssessmentData,
    assessmentData,
    clearListingPageDetails,
    getChildFamilyList,
    childFamilyList,
    setChildFamilyList,
    childEducationList,
    setChildEducationList,
    getChildEducationLevels,
    signedinOrgType,
    setSignedinOrgType,
    getSignedinUserOrgType,
    signedinUserRoleFS,
    setSignedinUserRoleFS,
    signedinUserRoleHT,
    setSignedinUserRoleHT,
    getSignedinUserRole,
    staticRoleList,
    setStaticRoleList,
    userIdData,
    signedInOrgName,
    setSignedInOrgName,
    firstName,
    lastName,
    isProfileDetailsChanged,
    setIsProfileDetailsChanged,
    userImage,
    setUserImage,
    userRegion,
    signedURL,
    setSignedURL,
    languageChange,
    setLanguageChange,
    isProfileImageUpdated,
    setIsProfileImageUpdated,
    isProfileImageDeleted,
    setIsProfileImageDeleted,
    showNewNotifications,
    setShowNewNotifications,
    languageId,
    changeLanguageFromAssessment,
    currentUserlanguage,
    setCurrentUserlanguage,
    setChangeLanguageFromAssessment,
    setFormPageValue,
    formPageValue,
    currentQuestionData,
    setCurrentQuestionData,
    formDetails,
    setFormDetails,
    currentlySelectedDomain,
    setCurrentlySelectedDomain,
    dbRegion,
    setDBRegion,
    isSelectedTS,
    setIsSelectedTS,
    isSelectedFS,
    setIsSelectedFS,
    fsLanguagesList,
    htLanguagesList,
    getLanguagesList,
    getFsChildListData,
    getTsChildListData,
    getTsFamilyListData,
    fsAvailableChildrenIds,
    tsAvailableChildrenIds,
    tsAvailableFamilyIds,
    allSystemMessages,
    setAllSystemMessages,
    popupMessages,
    setPopupMessages,
    bannerMessages,
    setBannerMessages,
    getSystemMessages,
    getSystemMessageTypes,
    systemMessageTypes,
    setSystemMessagesFetchedAtLogin,
    getDepricationData,
    getUserRegion,
    navbarFilterValues,
    setNavbarFilterValues,
    countryListForSidenav,
    linkedAccounts,
    getFamilyDropdownLists,
    getChildDropdownLists,
    familyDropdownLists,
    childDropdownLists,
    allLanguagesList
    //websocketConnection,
    //websocketData
  };

  return (
    <CommonDataContext.Provider value={{ ...value }}>
      {props.children}
    </CommonDataContext.Provider>
  );
};
export default CommonDataContextProvider;
