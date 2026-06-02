import { useState, createContext, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';

import APIS from "../hooks/UseApiCalls";
import { Auth } from 'aws-amplify';
// import toast from 'react-hot-toast';
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
  const [roleList, setRoleList] = useState([]);
  const [language, setLanguage] = useState('en');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [childPlacementList, setChildPlacementList] = useState([]);
  const [childStatusList, setChildStatusList] = useState([]);
  const [childCurrentPlacementList, setChildCurrentPlacementList] = useState([]);
  const [questionDomainList, setQuestionDomainList] = useState([]);
  const [questionTypeList, setQuestionTypeList] = useState([]);
  const [redFlagQuestionList, setRedFlagQuestionList] = useState([]);
  const [answerTypeList, setAnswerTypeList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [childList, setChildList] = useState([]);
  const [childFamilyList, setChildFamilyList] = useState([]);
  const [childEducationList, setChildEducationList] = useState([]);
  const [signedinUserRole, setSignedinUserRole] = useState(null);
  const [signedinOrgType, setSignedinOrgType] = useState(null);
  const [visitTypeList, setVisitTypeList] = useState([]);
  const [reIntegrationTypeList, setReIntegrationTypeList] = useState([]);
  const [caseList, setCaseList] = useState([]);
  const [signedInOrgName, setSignedInOrgName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userImage, setUserImage] = useState(null)
  const [userRegion,setUserRegion] = useState('')
  const [languageId, setLanguageId] = useState('1')
  const [languageChange, setLanguageChange] = useState(false);
  const [currentUserlanguage,setCurrentUserlanguage] = useState(localStorage.getItem('language'))
  // const [websocketData,setWebsocketData] = useState(null);
  const [isProfileDetailsChanged, setIsProfileDetailsChanged] = useState(false);
  const [isProfileImageUpdated, setIsProfileImageUpdated] = useState(false);
  const [isProfileImageDeleted, setIsProfileImageDeleted] = useState(false);
  const [showNewNotifications, setShowNewNotifications] = useState(false);
  const [changeLanguageFromAssessment,setChangeLanguageFromAssessment] = useState(false)
  const [currentQuestionData,setCurrentQuestionData] = useState([])
  const [formDetails,setFormDetails]=useState([])
  const [currentlySelectedDomain, setCurrentlySelectedDomain] = useState(1)
  const [formPageValue,setFormPageValue] = useState(1)
  const [signedURL, setSignedURL] = useState('');
  const {i18n } = useTranslation(['common']);

  const [staticRoleList, setStaticRoleList] = useState([
    {
      "id": "1",
      "role": "Super Admin"
    },
    {
      "id": "2",
      "role": "Admin"
    },
    {
      "id": "3",
      "role": "Case Worker"
    },
    {
      "id": "4",
      "role": "View Only"
    }
  ]);
  const [assessmentData, setAssessmentData] = useState({});
  const [userIdData, setUserIdData] = useState(null);
  useEffect(() => {
    getSignedinUserRole()
    getSignedinUserOrgType()
    getSignedinUserId()
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
    return () => {
    }
  }, [])
  useEffect(() => {
    checkIfLoggedIn()
    getUserDetails()
    return () => {
    }
  }, [signedinUserRole])

  useEffect(() => {
    localStorage.setItem('accessToken', accessToken)
  }, [accessToken])

  useEffect(() => {

    if(isProfileImageUpdated){
          getUserImageDetailsOnUpdation()
    }

  }, [isProfileImageUpdated])

  useEffect(() => {

    if(isProfileImageDeleted){
        getUserImageDetailsOnDeletion()
    }

  }, [isProfileImageDeleted])

  useEffect(() => {

    if(isProfileDetailsChanged){
       getUserDetails()
    }

  }, [isProfileDetailsChanged])



  // const setuserNames = () => {
  //   let fname = localStorage.getItem('firstName');
  //   let lname = localStorage.getItem('lastName');
  //   setFirstName(fname);
  //   setLastName(lname);
  // }


  const checkIfLoggedIn = () => {
    if (signedinOrgType !== null && signedinUserRole !== null) {
     // callAllAPIs()
    }
    else {
      getSignedinUserRole()
      getSignedinUserOrgType()
      getSignedinUserId()
    }

  }

  const callAllAPIs = () => {
    getLocationList()
    getOrganizationList()
    getTypesList()
    getLanguageList()
    getFamilyList()
    getRelationList()
    getMemberTypeList()
    getRolesList()
    getUserTokens();
    getChildPlacementStatus();
    getChildStatus();
    getChildCurrentPlacementStatus();
    getQuestionDomainList();
    getQuestionTypeList();
    getAnswerTypeList();
    getUserList();
    getChildList();
    getVisitTypeList();
    getReIntegrationTypeList();
    getCaseList();
    getChildFamilyList();
    getChildEducationLevels();
    getQuestionDomainList();

  }

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
  const getLocationList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.LocationList(langId);
      if (data && data.data && (Object.keys(data.data).length !== 0)) {
        setLocationList(data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserDetails = useCallback(async () => {
    let id = localStorage.getItem('username')
    try {
      const data = await APIS.UserDetails(id);
      setFirstName(data.data.userDetails.firstName);
      setLastName(data.data.userDetails.lastName);
      setUserImage(data.data.userDetails?.fileUrl);
      setUserRegion(data.data.userDetails?.countryInfo)
      console.log('this is region name in data context',userRegion)
      setLanguageId(data.data.userDetails.HTLanguageId)
      localStorage.setItem('userRegion',data.data.userDetails?.HTCountryId)
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!data.data.userDetails.HTLanguageId || !currentLanguageList?.length) {
        langId = "en"
      } else {
        langId = currentLanguageList.length && currentLanguageList.find(item => item.id == data.data.userDetails.HTLanguageId)?.languageCode
       }
       i18n.changeLanguage(langId);
       localStorage.setItem('language',langId)
       callAllAPIs()
      setIsProfileDetailsChanged(false)
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserImageDetailsOnUpdation = useCallback(async () => {
    let id = localStorage.getItem('username')
    let flag = true;
    try {
      while (flag == true) {
        console.log('called')  
        const data = await APIS.UserDetails(id);
        setUserImage(data.data.userDetails.fileUrl);
        if(data.data.userDetails.fileUrl != null ){
            flag=false
        }
      }
      setIsProfileImageUpdated(false)
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserImageDetailsOnDeletion = useCallback(async () => {
        setUserImage(null);  
        setIsProfileImageDeleted(false)
  }, []);


  const getVisitTypeList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.VisitTypeList(langId);
      if (data && data.data && data.data.data.length !== 0) {
        let list = data.data.data
        setVisitTypeList(list)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);


  const getReIntegrationTypeList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.ReIntegrationTypeList(langId);
      if (data && data.data && data.data.data.length !== 0) {
        let list = data.data.data
        setReIntegrationTypeList(list)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);


  const getCaseList = useCallback(async () => {
    try {
      let payload = {
        "needFullData": true,
        "orderByField": [
          ["id", "ASC"]
        ],
      }
      const data = await APIS.CaseList(payload);
      if (data && data.data && data.data.data.length) {
        let list = data.data.data
        setCaseList(list)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getLanguageList = useCallback(async () => {
    try {
      const data = await APIS.LanguageList();
      if (data && data.data && data.data.languages.length) {
        setLanguageList(data.data.languages)
        localStorage.setItem('languageList', JSON.stringify(data.data.languages))
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getRelationList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.RelationList(langId);
      if (data && data.data && data.data.relations) {
        setRelationList(data.data.relations)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getMemberTypeList = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.MemberTypeList(langId);
      if (data && data.data && data.data.familyMemberType) {
        setMemberTypeList(data.data.familyMemberType)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getOrganizationList = useCallback(async () => {
    try {
      let getOrgListpayload = {
        "rowCount": "1000",
        "pageNumber": "1",
        "globalSearchQuery": "",
        // "orgStatus": "",
        "orderByField": [
          [
            "organizationName",
            "ASC"
          ]
        ],
      }
      if(localStorage.getItem('role')==='superadmin'){
        getOrgListpayload.HTCountryId =''
      }else{
        getOrgListpayload.HTCountryId = localStorage.getItem('userRegion')
      }
      const data = await APIS.OrganizationList(getOrgListpayload);
      if (data && data.data && data.data.organizations.length) {
        setOrganizationList(data.data.organizations)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);


  const getFamilyList = useCallback(async () => {
    try {
      const data = await APIS.FamilyList();
      if (data && data.data && data.data.familyDetails) {
        setFamilyList(data.data.familyDetails)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);


  const getTypesList = useCallback(async () => {
    try {
      const data = await APIS.TypeList();
      if (data && data.data && data.data.organisationTypes) {
        setTypeList(data.data.organisationTypes)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getRolesList = useCallback(async () => {
    try {
      const data = await APIS.UserRoleList();
      if (data && data.data && data.data.userRoles) {
        setRoleList(data.data.userRoles)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserTokens = useCallback(async () => {
    try {
      Auth.currentSession()
        .then(data => {
          data.getAccessToken().getJwtToken()
          setAccessToken(data.accessToken.jwtToken);
          setRefreshToken(data.refreshToken.jwtToken);
          localStorage.setItem('accessToken', data.accessToken.jwtToken);
          localStorage.setItem('refreshToken', data.refreshToken.jwtToken);
          localStorage.setItem('idToken', data.idToken.jwtToken);
        })
        .catch(err => {
          setAccessToken('');
          setRefreshToken('')
        })
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildPlacementStatus = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.ChildPlacementStatus(langId);
      if (data && data.data && data.data.data) {
        setChildPlacementList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildStatus = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.ChildStatus(langId);
      if (data && data.data && data.data.data) {
        setChildStatusList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildCurrentPlacementStatus = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.ChildCurrentPlacementStatus(langId);
      if (data && data.data && data.data.data) {
        setChildCurrentPlacementList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildEducationLevels = useCallback(async () => {
    try {
      const currentLanguage = localStorage.getItem('language');
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }
      const data = await APIS.ChildEducationList(langId);
      if (data && data.data && data.data.data) {
        setChildEducationList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getQuestionDomainList = useCallback(async () => {
    const currentLanguage = localStorage.getItem('language');
    const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = ""
    } else {
      langId = currentLanguage === 'en' ? "" : currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
    }
    try {
      const data = await APIS.QuestionDomainList(langId);
      if (data && data.data && data.data.data && (data.data.data).length !== 0) {
        setQuestionDomainList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getQuestionTypeList = useCallback(async () => {
    try {
      const data = await APIS.QuestionTypeList();
      if (data && data.data && data.data.data && (data.data.data).length !== 0) {
        setQuestionTypeList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);


  const getUserList = useCallback(async () => {
    try {
      let getUserListpayload = {
        "rowCount": "100",
        "pageNumber": "1",
        "globalSearchQuery": "",
        "orderByField": [
          [
            "id",
            "ASC"
          ]
        ],
      }
      const data = await APIS.ListUsers(getUserListpayload);
      if (data && data.data && data.data.users.length) {
        setUserList(data.data.users)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getAnswerTypeList = useCallback(async () => {
    try {
      const data = await APIS.AnswerTypeList();
      if (data && data.data && data.data.data && (data.data.data).length !== 0) {
        setAnswerTypeList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);





  const getChildList = useCallback(async () => {
    try {
      let getChildListpayload = {
        "rowCount": "100",
        "pageNumber": "1",
        "HTCaseId": null,
        "globalSearchQuery": "",
        "orderByField": [
          [
            "id",
            "ASC"
          ]
        ],
      }
      const data = await APIS.ListChildren(getChildListpayload);
      if (data && data.data && data.data.data.length) {
        setChildList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getChildFamilyList = useCallback(async () => {
    try {
      let getChildListpayload = {
        "rowCount": "100",
        "pageNumber": "1",
        "HTFamilyId": null,
        "globalSearchQuery": "",
        "orderByField": [
          [
            "id",
            "ASC"
          ]
        ],
      }
      const data = await APIS.ListChildren(getChildListpayload);
      if (data && data.data && data.data.data.length) {
        setChildFamilyList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearListingPageDetails = (value) => {
    if (value === 'userPageData') {
      localStorage.removeItem('famPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'famPageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'orgPageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('famPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'childPageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('famPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'casePageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('famPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'formPageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('famPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'questionPageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('famPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('assessmentPageData');
    } else if (value === 'assessmentPageData') {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('famPageData');
    } else {
      localStorage.removeItem('userPageData');
      localStorage.removeItem('famPageData');
      localStorage.removeItem('orgPageData');
      localStorage.removeItem('childPageData');
      localStorage.removeItem('casePageData');
      localStorage.removeItem('formPageData');
      localStorage.removeItem('questionPageData');
      localStorage.removeItem('assessmentPageData');
    }
  }
  const getSignedinUserRole = () => {
    let userRole = localStorage.getItem('role');
    setSignedinUserRole(userRole);
  }
  const getSignedinUserId = () => {
    let userId = localStorage.getItem('username');
    setUserIdData(userId);
  }

  const getSignedinUserOrgType = useCallback(async (val = null) => {
    try {
      let orgId
      if (val === null) {
        orgId = localStorage.getItem('orgId')
      } else {
        orgId = val
      }
      if (orgId !== val) {
        const data = await APIS.OrgTypeDetails(orgId);
        if (data.status === 200) {
          setSignedinOrgType(data.data.organizationTypeDetails.id);
          setSignedInOrgName(data.data.organizationTypeDetails.name)
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);
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
    language,
    setLanguage,
    roleList,
    setRoleList,
    getUserTokens,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    childPlacementList,
    setChildPlacementList,
    getChildPlacementStatus,
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
    signedinUserRole,
    setSignedinUserRole,
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
    setCurrentlySelectedDomain
    //websocketConnection,
    //websocketData
  }
  

  return (
    <CommonDataContext.Provider value={{ ...value }}>
      {props.children}
    </CommonDataContext.Provider>
  )
}
export default CommonDataContextProvider;