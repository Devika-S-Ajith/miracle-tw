import { useState, createContext, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

import APIS from "../hooks/UseApiCalls";
import { Auth } from "aws-amplify";
import { filterMessagesByCurrentTime } from "../../constants";
import useAuth from "../hooks/UseAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { getCurrentLanguageIdFromCode } from "../../helpers/helperFunction";

export const CommonDataContext = createContext();

// ---------------------------------------------------------------------------
// Module-level helpers (pure, no closure over state)
// ---------------------------------------------------------------------------

/** Returns the numeric language id stored in localStorage, defaulting to "1". */
const getStoredLangId = () => {
  const code = localStorage.getItem("language");
  const list = JSON.parse(localStorage.getItem("languageList") || "[]");
  if (!code || !list.length) return "1";
  return list.find((item) => item.languageCode === code)?.id ?? "1";
};

/** Returns the current language id for dropdown payloads. */
const getCurrentLangId = () =>
  getCurrentLanguageIdFromCode(localStorage.getItem("language"));

const getDayOfWeek = () => {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[new Date().getDay()];
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

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
  const [childCurrentPlacementList, setChildCurrentPlacementList] = useState([]);
  const [questionDomainList, setQuestionDomainList] = useState([]);
  const [redFlagQuestionList, setRedFlagQuestionList] = useState([]);
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
  const [showNewNotifications, setShowNewNotifications] = useState(false);
  const [changeLanguageFromAssessment, setChangeLanguageFromAssessment] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState([]);
  const [formDetails, setFormDetails] = useState([]);
  const [currentlySelectedDomain, setCurrentlySelectedDomain] = useState(1);
  const [formPageValue, setFormPageValue] = useState(1);
  const [signedURL, setSignedURL] = useState("");
  const [dbRegion, setDBRegion] = useState("");
  const [accountTypesList, setAccountTypesList] = useState([]);
  const [isSelectedTS, setIsSelectedTS] = useState(localStorage.getItem("tsSelected"));
  const [isSelectedFS, setIsSelectedFS] = useState(localStorage.getItem("fsSelected"));
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
  const [navbarFilterValues, setNavbarFilterValues] = useState([]);
  const [countryListForSidenav, setCountryListForSidenav] = useState([]);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [familyDropdownLists, setFamilyDropdownLists] = useState({
    familyDeactivateReason: [],
    familyDeleteReason: [],
    familyMemberType: [],
    familyRelations: [],
    familySituation: [],
    familyTypeAndGoal: [],
  });
  const [childDropdownLists, setChildDropdownLists] = useState({});

  const intervalRef = useRef(null);
  const signedinHTUserRoleId = localStorage.getItem("HTUserRoleId");
  const signedinFSUserRoleId = localStorage.getItem("FSUserRoleId");

  const { i18n, t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Re-check login state whenever roles are resolved
  useEffect(() => {
    getUserDetails();
    //getInitialUserData()
    getSignedinUserRole();
    getSignedinUserOrgType();
    getSignedinUserId();
  }, [signedinUserRoleHT, signedinUserRoleFS]);

  useEffect(() => {
    localStorage.setItem("accessToken", accessToken);
  }, [accessToken]);

  // Poll for system messages once both role IDs are available
  useEffect(() => {
    const htId = localStorage.getItem("HTUserRoleId") === "undefined"
      ? null
      : localStorage.getItem("HTUserRoleId");
    const fsId = localStorage.getItem("FSUserRoleId") === "undefined"
      ? null
      : localStorage.getItem("FSUserRoleId");

    if (!htId || !fsId || systemMessagesFetchedAtLogin) return;

    getSystemMessages();
    intervalRef.current = setInterval(getSystemMessages, 600_000);
    return () => clearInterval(intervalRef.current);
  }, [signedinHTUserRoleId, signedinFSUserRoleId]);

  // ---------------------------------------------------------------------------
  // Bulk API launcher
  // ---------------------------------------------------------------------------


  const callCommonAPISAfterLogin = useCallback(() => {
    getTypesList();
    getFamilyList();
    getQuestionDomainList();
    getUserList();
    getChildList();
    getVisitTypeList();
    getChildFamilyList();
    getFsChildListData();
    getTsChildListData();
    getTsFamilyListData();
    getFamilyDropdownLists();
    getChildDropdownLists();
  }, []);

  const callAllAPIs = useCallback(() => {
    getRolesList();
    getUserTokens();
    getUserRegion();
    getAccountTypesList();
    getOrganizationList();
    getLocationList();
    getLanguageList()
    getLanguagesList();
    getSystemMessageTypes();
    getCountryListForSidenav();
    callCommonAPISAfterLogin();
  }, []);

  // ---------------------------------------------------------------------------
  // User / auth
  // ---------------------------------------------------------------------------

  const getSignedinUserRole = () => {
    setSignedinUserRoleHT(localStorage.getItem("ht_role"));
    setSignedinUserRoleFS(localStorage.getItem("fs_role"));
  };

  const getSignedinUserId = () => {
    setUserIdData(localStorage.getItem("username"));
  };

  const getUserDetails = useCallback(async () => {
    const id = localStorage.getItem("username");
    if (!id) return;

    try {
      const data = await APIS.UserDetails(id);
      const resData = data?.data?.data;
      if (!resData) return;

      setFirstName(resData.firstName);
      setLastName(resData.lastName);
      localStorage.setItem("HTUserRoleId", resData.HTUserRoleId);
      localStorage.setItem("FSUserRoleId", resData.FSUserRoleId);
      if (resData.TWCountryId) localStorage.setItem("userRegion", resData.TWCountryId);

      setUserImage(resData.fileUrl);
      setUserRegion(resData.countryInfo);
      sessionStorage.setItem("username", resData.id);
      localStorage.setItem("username", resData.id);
      localStorage.setItem("isTermsOfUseAccepted", resData.isTermsOfUseAccepted);
      setLanguageId(resData.MPLanguageId);

      const currentLanguageList = JSON.parse(localStorage.getItem("languageList") || "[]");
      const langCode = currentLanguageList.find((item) => item.id == resData.MPLanguageId)
        ?.languageCode ?? "en";

      i18n.changeLanguage(langCode);
      localStorage.setItem("language", langCode);
      callAllAPIs();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserTokens = useCallback(async () => {
    try {
      const session = await Auth.currentSession();
      const jwt = session.accessToken.jwtToken;
      setAccessToken(jwt);
      setRefreshToken(session.refreshToken.jwtToken);
      localStorage.setItem("accessToken", jwt);
      localStorage.setItem("refreshToken", session.refreshToken.jwtToken);
      localStorage.setItem("idToken", session.idToken.jwtToken);
    } catch {
      setAccessToken("");
      setRefreshToken("");
      setSignedinOrgType(null);
    }
  }, []);

  const getSignedinUserOrgType = useCallback(async (val = null) => {
    try {
      const accountId = val ?? localStorage.getItem("orgId");
      const accountData = await APIS.OrganisationDetails(accountId);
      const org = accountData?.data?.data;
      if (!org) return;
      setLinkedAccounts(
        (org.linkedAccounts ?? []).map((acc) => ({
          accountId: acc.id,
          accountName: acc.accountName,
        }))
      );
      setSignedInOrgName(org.accountName);
      localStorage.setItem("signedinOrgType", org.MPAccountTypeId);
        setSignedinOrgType(org.MPAccountTypeId);
      // const typeRes = await APIS.OrgTypeDetails(org.MPAccountTypeId);
      // if (typeRes.status === 200) {
      //   const typeId = typeRes.data?.data[0].id;
        
      // }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getInitialUserData = async () => {
    const payload = {
      "TWUserId": localStorage.getItem("username"),
      "limit": 1,
      "start": 0,
      "name": "",
      "todolistOnly": false
    }
    try {
      const res = await APIS.GetInitializeUserData(payload);
    } catch (err) {
      console.error("Error fetching user region:", err);
    }
  }

  const getUserRegion = async () => {
    try {
      const res = await APIS.GetRegion();
      const fetchedRegion = res?.data?.data?.region;
      const stored = localStorage.getItem("userDBRegion");

      if (stored && stored !== fetchedRegion) {
        toast.error(t("common:common.Network location changed"));
        await logout();
        localStorage.clear();
        localStorage.setItem("userDBRegion", fetchedRegion);
        navigate("/signin");
        return;
      }

      localStorage.setItem("userDBRegion", fetchedRegion);
      return res?.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getDepricationData = async () => {
    try {
      const res = await APIS.checkIfAppDepricated();
      return res?.data;
    } catch { }
  };

  // ---------------------------------------------------------------------------
  // System messages
  // ---------------------------------------------------------------------------

  const getSystemMessageTypes = async () => {
    const res = await APIS.getSystemMessageTypeList();
    setSystemMessageTypes(res?.data?.data);
  };

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

  // ---------------------------------------------------------------------------
  // Dropdown / list fetchers  (all follow the same pattern)
  // ---------------------------------------------------------------------------

  const getLocationList = useCallback(async () => {
    try {
      const data = await APIS.LocationList(getStoredLangId());
      if (data?.data?.data) setLocationList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getVisitTypeList = useCallback(async () => {
    try {
      const data = await APIS.VisitTypeList(getStoredLangId());
      if (data?.data?.data?.length) setVisitTypeList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getReIntegrationTypeList = useCallback(async () => {
    try {
      const data = await APIS.ReIntegrationTypeList(getStoredLangId());
      if (data?.data?.data?.length) setReIntegrationTypeList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getRelationList = useCallback(async () => {
    try {
      const data = await APIS.RelationList(getStoredLangId());
      if (data?.data?.relations) setRelationList(data.data.relations);
    } catch (err) { console.error(err); }
  }, []);

  const getAccountTypesList = useCallback(async () => {
    try {
      const res = await APIS.TypeList({ languageId: getStoredLangId() });
      setAccountTypesList(res.data.data);
    } catch { }
  }, []);

  const getMemberTypeList = useCallback(async () => {
    try {
      const data = await APIS.MemberTypeList(getStoredLangId());
      if (data?.data?.familyMemberType) setMemberTypeList(data.data.familyMemberType);
    } catch (err) { console.error(err); }
  }, []);

  const getChildPlacementStatus = useCallback(async () => {
    try {
      const data = await APIS.ChildPlacementStatus(getStoredLangId());
      if (data?.data?.data) setChildPlacementList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getChildStatus = useCallback(async () => {
    try {
      const data = await APIS.ChildStatus(getStoredLangId());
      if (data?.data?.data) setChildStatusList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getChildCurrentPlacementStatus = useCallback(async () => {
    try {
      const data = await APIS.ChildCurrentPlacementStatus(getStoredLangId());
      if (data?.data?.data) setChildCurrentPlacementList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getChildEducationLevels = useCallback(async () => {
    try {
      const data = await APIS.ChildEducationList(getStoredLangId());
      if (data?.data?.data) setChildEducationList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getQuestionDomainList = useCallback(async () => {
    try {
      const data = await APIS.QuestionDomainList(getStoredLangId());
      if (data?.data?.data?.length) setQuestionDomainList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getFamilySituationAndGoals = useCallback(async () => {
    try {
      const data = await APIS.familySituationAndGoals(null);
      if (data?.data?.familySituationAndGoals)
        setSituationsAndGoals(data.data.familySituationAndGoals);
    } catch (err) { console.error(err); }
  }, []);

  // ---------------------------------------------------------------------------
  // Fetchers that don't need a language id
  // ---------------------------------------------------------------------------

  const getFsChildCurrentPlacementStatus = useCallback(async () => {
    try {
      const res = await APIS.getFsChildPlacementStatusList();
      if (res.status === 200) setFsChildPlacementList(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getLanguageList = useCallback(async () => {
    try {
      const data = await APIS.LanguageList();
      if (data?.data?.data?.length) {
        setLanguageList(data.data.data);
        localStorage.setItem("languageList", JSON.stringify(data.data.data));
      }
    } catch (err) { console.error(err); }
  }, []);

  const getLanguagesList = useCallback(async () => {
    try {
      const [htLangs, fsLangs, allLangs] = await Promise.all([
        APIS.GetLanguagesList("THRIVE_SCALE"),
        APIS.GetLanguagesList("FOSTER_SHARE"),
        APIS.GetLanguagesList("BOTH"),
      ]);
      setHtLanguagesList(htLangs?.data?.data);
      setFsLanguagesList(fsLangs?.data?.data);
      setAllLanguagesList(allLangs?.data?.data);
    } catch (err) { console.error(err); }
  }, []);

  const getRolesList = useCallback(async () => {
    try {
      const langId = getStoredLangId();
      const [dataFS, dataHT] = await Promise.all([
        APIS.UserRoleListFS(langId),
        APIS.UserRoleListHT(langId),
      ]);
      if (dataFS?.data?.data) setRoleListFS(dataFS.data.data);
      if (dataHT?.data?.data) setRoleListHT(dataHT.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getTypesList = useCallback(async () => {
    try {
      const data = await APIS.TypeList();
      if (data?.data?.data) setTypeList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  // ---------------------------------------------------------------------------
  // List fetchers with pagination
  // ---------------------------------------------------------------------------

  const getOrganizationList = useCallback(async () => {
    try {
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        globalSearchQuery: "",
        orderByField: [["accountName", "ASC"]],
        MPCountryId: localStorage.getItem("userRegion"),
      };
      const data = await APIS.OrganizationList(payload);
      if (data?.data?.data?.length) setOrganizationList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getFamilyList = useCallback(async () => {
    try {
      const data = await APIS.FamilyList({
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["familyName", "ASC"]],
      });
      if (data?.data?.familyDetails) setFamilyList(data.data.familyDetails);
    } catch (err) { console.error(err); }
  }, []);

  const getCaseList = useCallback(async () => {
    try {
      const data = await APIS.CaseList({
        needFullData: true,
        orderByField: [["id", "ASC"]],
      });
      if (data?.data?.data?.length) setCaseList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getUserList = useCallback(async () => {
    try {
      const data = await APIS.ListUsers({
        rowCount: "100",
        pageNumber: "1",
        globalSearchQuery: "",
        orderByField: [["id", "ASC"]],
      });
      if (data?.data?.users?.length) setUserList(data.data.users);
    } catch (err) { console.error(err); }
  }, []);

  const getChildList = useCallback(async () => {
    try {
      const data = await APIS.ListChildren({
        rowCount: "100",
        pageNumber: "1",
        HTCaseId: null,
        globalSearchQuery: "",
        orderByField: [["id", "ASC"]],
      });
      if (data?.data?.data?.length) setChildList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getChildFamilyList = useCallback(async () => {
    try {
      const data = await APIS.ListChildren({
        rowCount: "10000",
        pageNumber: "1",
        HTFamilyId: null,
        globalSearchQuery: "",
        orderByField: [["id", "ASC"]],
      });
      if (data?.data?.data?.length) setChildFamilyList(data.data.data);
    } catch (err) { console.error(err); }
  }, []);

  const getFsChildListData = async (rowCount = 100000, pageNumber = 1) => {
    try {
      const res = await APIS.getFsChildList({ rowCount, pageNumber, placementStatus: "ALL" });
      if (Array.isArray(res?.data?.data))
        setFsAvailableChildrenIds(res.data.data.map((obj) => obj.id));
    } catch { }
  };

  const getTsChildListData = async (rowCount = 100000, pageNumber = 1) => {
    try {
      const res = await APIS.ListChildren({ rowCount, pageNumber });
      if (Array.isArray(res?.data?.data))
        setTsAvailableChildrenIds(res.data.data.map((obj) => obj.id));
    } catch { }
  };

  const getTsFamilyListData = async (rowCount = 100000, pageNumber = 1) => {
    try {
      const res = await APIS.FamilyList({ rowCount, pageNumber });
      if (Array.isArray(res?.data?.familyDetails))
        setTsAvailableFamilyIds(res.data.familyDetails.map((obj) => obj.id));
    } catch { }
  };

  // ---------------------------------------------------------------------------
  // Country / sidenav
  // ---------------------------------------------------------------------------

  const getCountryListForSidenav = useCallback(async () => {
    try {
      const res = await APIS.GetLoactionsForFilter();
      const countries = res?.data?.data?.countries;
      if (!Array.isArray(countries)) return;

      countries.sort((a, b) => a.stateName?.localeCompare(b.stateName));
      countries.forEach((country) => {
        country.districts?.sort((a, b) => a.districtName?.localeCompare(b.districtName));
        country.zipcodes?.forEach((zip, idx) => { zip.id = idx + 1; });
      });

      setCountryListForSidenav(countries);
    } catch (err) { console.error(err); }
  }, []);

  // ---------------------------------------------------------------------------
  // Bulk dropdown fetchers
  // ---------------------------------------------------------------------------

  const getFamilyDropdownLists = async () => {
    const langId = getCurrentLangId();
    try {
      const res = await APIS.GetFamilyDropdownLists({
        dropdowns: [
          { name: "familymembertype",        languageId: langId, sortOrder: "ASC" },
          { name: "familysituation",         languageId: langId, sortOrder: "ASC" },
          { name: "familyrelation",          languageId: langId, sortOrder: "ASC" },
          { name: "familytypeandgoal",       languageId: langId, sortOrder: "ASC" },
          { name: "familydeactivationreason",languageId: langId, sortOrder: "ASC" },
          { name: "familydeletereason",      languageId: langId, sortOrder: "ASC" },
        ],
      });
      setFamilyDropdownLists(res?.data?.data);
    } catch (err) { console.error(err); }
  };

  const getChildDropdownLists = async () => {
    const langId = getCurrentLangId();
    try {
      const res = await APIS.GetChildDropdownLists({
        dropdowns: [
          { name: "PLACEMENTSTATUS",       languageId: langId, sortOrder: "" },
          { name: "EDUCATIONLEVEL",        languageId: langId, sortOrder: "" },
          { name: "CURRENTPLACEMENTSTATUS",languageId: langId, sortOrder: "" },
          { name: "ETHNICITY",             languageId: langId },
          { name: "FAMILYCHANGEREASONS" },
          { name: "CASECLOSEREASONS" },
        ],
      });
      setChildDropdownLists(res?.data?.data);
    } catch (err) { console.error(err); }
  };

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value = {
    getUserDetails,
    locationList, setLocationList,
    organizationList, setOrganizationList,
    familyList, getFamilyList,
    family, setFamily,
    membersInFamily, setMembersInFamily,
    typeList, setTypeList,
    getOrganizationList, getLocationList, getTypesList,
    languageList, setLanguageList,
    relationList, setRelationList, getRelationList,
    memberTypeList, getMemberTypeList,
    accountTypesList, getAccountTypesList,
    language, setLanguage,
    getRolesList, roleListFS, roleListHT, setRoleListFS, setRoleListHT,
    getUserTokens,
    accessToken, setAccessToken,
    refreshToken, setRefreshToken,
    childPlacementList, setChildPlacementList, getChildPlacementStatus,
    fsChildPlacementList, getFsChildCurrentPlacementStatus,
    childStatusList, setChildStatusList, getChildStatus,
    childCurrentPlacementList, setChildCurrentPlacementList, getChildCurrentPlacementStatus,
    questionDomainList, getQuestionDomainList,
    redFlagQuestionList, setRedFlagQuestionList,
    userList, setUserList, getUserList,
    childList, setChildList, getChildList,
    visitTypeList, getVisitTypeList,
    reIntegrationTypeList, getReIntegrationTypeList,
    situationsAndGoals, getFamilySituationAndGoals,
    caseList, getCaseList,
    assessmentData, setAssessmentData,
    childFamilyList, setChildFamilyList, getChildFamilyList,
    childEducationList, setChildEducationList, getChildEducationLevels,
    signedinOrgType, setSignedinOrgType, getSignedinUserOrgType,
    signedinUserRoleFS, setSignedinUserRoleFS,
    signedinUserRoleHT, setSignedinUserRoleHT, getSignedinUserRole,
    userIdData,
    signedInOrgName, setSignedInOrgName,
    firstName, setFirstName,
    lastName, setLastName,
    userImage, setUserImage,
    userRegion,
    signedURL, setSignedURL,
    languageChange, setLanguageChange,
    showNewNotifications, setShowNewNotifications,
    languageId,
    changeLanguageFromAssessment, setChangeLanguageFromAssessment,
    currentUserlanguage, setCurrentUserlanguage,
    formPageValue, setFormPageValue,
    currentQuestionData, setCurrentQuestionData,
    formDetails, setFormDetails,
    currentlySelectedDomain, setCurrentlySelectedDomain,
    dbRegion, setDBRegion,
    isSelectedTS, setIsSelectedTS,
    isSelectedFS, setIsSelectedFS,
    fsLanguagesList, htLanguagesList, allLanguagesList, getLanguagesList,
    getFsChildListData, getTsChildListData, getTsFamilyListData,
    fsAvailableChildrenIds, tsAvailableChildrenIds, tsAvailableFamilyIds,
    allSystemMessages, setAllSystemMessages,
    popupMessages, setPopupMessages,
    bannerMessages, setBannerMessages,
    getSystemMessages, getSystemMessageTypes, systemMessageTypes,
    setSystemMessagesFetchedAtLogin,
    getDepricationData,
    getUserRegion,
    navbarFilterValues, setNavbarFilterValues,
    countryListForSidenav,
    linkedAccounts,
    getFamilyDropdownLists, getChildDropdownLists,
    familyDropdownLists, childDropdownLists,
    callCommonAPISAfterLogin
  };

  return (
    <CommonDataContext.Provider value={value}>
      {props.children}
    </CommonDataContext.Provider>
  );
};

export default CommonDataContextProvider;