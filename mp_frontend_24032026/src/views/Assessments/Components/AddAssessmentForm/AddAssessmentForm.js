import React,{ useState, useEffect, useContext, useCallback, useRef } from 'react';
// import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useNavigate, useLocation, useParams, Prompt } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Formik,Form,Field } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import NumberFormat from 'react-number-format';
import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { Box,
  Button,
  Card,
  Grid,
  Container,
  // Switch,
  TextField,
  Typography,
  useTheme,
  // Divider,
  Checkbox,
  Tooltip,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  FormGroup,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
// import wait from '../../../../__fakeApi__/Wait';

// import { customerApi } from '../../../../__fakeApi__/customerApi';

import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import InformationCircleIcon from '../../../../assets/icons/InformationCircle';
import APIS from '../../../../common/hooks/UseApiCalls';
import RadarChart from  '../../../../views/Dashboard/Overview/Components/RadarChart';
//import { DatePicker } from '@material-ui/pickers';
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown"
import UseDidMountEffect from "../UseDidMountEffect"

const AddAssessmentForm = (props) => {
  const { t, i18n } = useTranslation(['common']);
  const formRef = useRef();
  const navigate = useNavigate();
  const location= useLocation();
  // const [value, setValue] = useState(null);
  const viewAssessment = location.state && location.state.viewAssessment
  const editAssessment = location.state && location.state.editAssessment
  const formRevisionNumber = location.state && location.state.formRevisionNumber
  const fromCaseList = location.state && location.state.fromCaseList
  const caseId = location.state && location.state.caseId
  const theme = useTheme();
  const currentLanguage = localStorage.getItem('language');
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const [formPage, setFormPage] = useState(1)
  const { 
    visitTypeList,
    reIntegrationTypeList,
    languageList,
    getChildStatus,
    getChildPlacementStatus,
    getChildCurrentPlacementStatus,
    getChildEducationLevels,
    getRelationList,
    getMemberTypeList,
    getVisitTypeList,
    getReIntegrationTypeList,
    getLocationList,
    languageChange,
    setLanguageChange,
    setChangeLanguageFromAssessment,
    setFormPageValue
  } = useContext(CommonDataContext);
  const [domains, setDomains] = useState([])
  const [caseList, setCaseList] = useState([])
  const [formQuestions, setFormQuestions] = useState([])
  const [allFormQuestions, setAllFormQuestions] = useState([])
  const [assessment,  setAssessment] = useState(null)
  const [integrationOptions, setIntegrationOptions] = useState([])
  const [primaryChoices, setPrimaryChoices] = useState([])
  const [visitInterval, setVisitInterval] = useState('')
  const [loading,setLoading] = useState(false);
  const [questionsLoading,setQuestionsLoading] = useState(false);
  const [helperText, setHelperText] = useState('');
  const [formError, setFormError] = useState(false);
  const [score, setScore] = useState({});
  const [assessmentStartsAt, setAssessmentStartsAt] = useState(new Date().toISOString());
  const [currentFormRevision, setCurrentFormRevision] = useState(null);
  const [caseDetails, setCaseDetails] = useState({});
  const [getScoreList, setGetScoreList] = useState([]);
  const [isSaveandExit, setIsSaveandExit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [yesText, setYesText] = useState(`${t('common:common.Yes')}`);
  const [noText, setNoText] = useState(`${t('common:common.No')}`);
  const [modalHeading, setModalHeading] = useState(`${t('common:assessment.Change Language')}`);
  const [modalSubHeading, setModalSubHeading] = useState(`${t('common:assessment.Change Assessment Language Text')}`);
  const [modalSubHeadingAlternative, setModalSubHeadingAlternative] = useState(`${t('common:assessment.Change Assessment Language Text Alternative')}`);
  const [modalQuestion, setModalQuestion] = useState(`${t('common:assessment.Are you sure you want to change the language')}`);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  let assessmentId = useParams()
  
  
  const getLanguageId = () => {
    const checkLanguageList = JSON.parse(localStorage.getItem('languageList'));
    const langId = checkLanguageList.length && checkLanguageList.find(item => item.languageCode == localStorage.getItem('language'))?.id
    return langId;
  }

  useEffect(() => { 
    getFormList()
    getCaseList()
    if(caseId){
      getCaseDetails(caseId)
    }
    return () => {
      setLoading(false)
    }
   
  },[])

  // useEffect(() => {
  //   getVisitTypeList()
  //   getReIntegrationTypeList()
  //   getFormList()
  //   getCaseList()
    
  // })

  useEffect(()=>{
    setFormPageValue(formPage)
    if(domains && domains.length > 0 && formQuestions && formQuestions.length > 0 && formPage === 7){
      if(!viewAssessment){
        CalculateAssessmentScore()
      }
    }
  },[formPage])

  useEffect(()=>{
    return()=>{
      setChangeLanguageFromAssessment(false)
    }
  })

  useEffect(()=>{
    if(languageChange){
      if(formRef.current.values.case_id && formRef.current.values.visit_type && 
          formRef.current.values.reintegration_type && formRef.current.values.child_thought &&
          formRef.current.values.family_thought && formRef.current.values.question) {
            setIsOpen(true);
      } 
      else {
        setIsSaveandExit(true)
        setIsOpen(true);
      }
      
    }
  },[languageChange])

  useEffect(() => {
    getVisitTypeList()
    getReIntegrationTypeList()
    getFormList()
    getCaseList()
    
  },[languageChange])

  const handleLanguageChange = () => {
    setChangeLanguageFromAssessment(true)
    if(!viewAssessment && !isSaveandExit){
      if (formRef.current) {
        setLoading(true)
        formRef.current.handleSubmit()
      }
    } else {
     setIsOpen(false)
     getVisitTypeList()
     getReIntegrationTypeList()
     getFormList()
     getCaseList()
    }
    //setIsOpen(false)
  }


  const handleClose = () => {
    setIsSaveandExit(false)
    // setLanguageChange(false)
    // i18n.changeLanguage(selectedLanguage)
    // //setSelectedLanguage(selectedLanguage)
    // localStorage.setItem('language',selectedLanguage)
    // setYesText(`${t('common:common.Yes')}`)
    // setNoText(`${t('common:common.No')}`)
    // setModalHeading(`${t('common:assessment.Change Language')}`)
    // setModalSubHeading(`${t('common:assessment.Change Assessment Language Text')}`)
    // setModalSubHeadingAlternative(`${t('common:assessment.Change Assessment Language Text Alternative')}`)
    // setModalQuestion(`${t('common:assessment.Are you sure you want to change the language')}`)
    getChildStatus()
    getChildPlacementStatus()
    getChildCurrentPlacementStatus()
    getChildEducationLevels()
    getRelationList()
    getMemberTypeList()
    getVisitTypeList()
    getReIntegrationTypeList()
    getLocationList()
    setLanguageChange(false)
    const currentLanguage = i18n.language
    i18n.changeLanguage(currentLanguage)
    setSelectedLanguage(currentLanguage)
    localStorage.setItem('language',currentLanguage)
    setIsOpen(false);
  }

  const getCaseList = useCallback(async () => {
    setLoading(true)
    try {
      let payload = {
        "needFullData" : true,
        "orderByField": [
          ["HTChildId", "ASC"]
        ],
        "caseStatusFilter": "Open"
      }
      const data = await APIS.CaseList(payload);
      if (data && data.data && data.data.data.length) {
        let list = data.data.data
        setCaseList(list)
      }
      setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);

  const getFormList =  useCallback(async () => {
    setLoading(true)
    setQuestionsLoading(true)
    try {
      const data = await APIS.FormList();
      if(data && data.data && data.data.data[0]){
        let details = data.data.data[0]
        if(editAssessment || viewAssessment){
          if(assessmentId && assessmentId.id){
            const updatedFormRevision = formRevisionNumber || details.currentRevision
            getAssessmentDetails(assessmentId.id, updatedFormRevision)
          }
        }else{
            setCurrentFormRevision(details.currentRevision)
            getFormQuestions(details.id,details.currentRevision)
        }
      }
      setLoading(false)
      setQuestionsLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
      setQuestionsLoading(false)
    }
  }, []);

  const getFormQuestions =  useCallback(async (id,revision) => {
    setLoading(true)
    setQuestionsLoading(true)
    try {
      const domainData = await APIS.DomainList();
      setDomains(domainData && domainData.data && domainData.data.data)
      //const HTLanguageId = currentLanguage === 'en' ? "" : getLanguageId()
      const data = await APIS.ListAssessmentFormQuestions(id, revision);
      setFormQuestions(data && data.data && data.data.form[0].HT_formQuestionMappings)
      setAllFormQuestions(data && data.data && data.data.form[0].HT_formQuestionMappings)
      setPrimaryChoices(data && data.data && data.data.primaryChoices)
      setIntegrationOptions(data && data.data && data.data.integrationOptions)
      setLoading(false)
      setQuestionsLoading(false)
      // setAssessmentStartsAt(new Date().toISOString())
    } catch (err) {
      console.error(err);
      setLoading(false)
      setQuestionsLoading(false)
    }
  }, []);
    


  const getAssessmentDetails =  useCallback(async (id,revision) => {
    setLoading(true)
    setQuestionsLoading(true)
    try {
      const domainData = await APIS.DomainList();
      setDomains(domainData && domainData.data && domainData.data.data)
      //const HTLanguageId = currentLanguage === 'en' ? "" : getLanguageId()
      const data = await APIS.GetAssessmentDetails(id, revision);
      if(data && data.data){
        let details = data.data
        let formQuestions = details.assessmentDetails[0] && 
                            details.assessmentDetails[0].HT_form &&
                            details.assessmentDetails[0].HT_form.HT_formQuestionMappings
        getCaseDetails(details.assessmentDetails[0].HTCaseId)
        const currentReintegrationType = details.assessmentDetails[0] && details.assessmentDetails[0].HTAssessmentReintegrationTypeId
        if(reIntegrationTypeList?.length && currentReintegrationType !== reIntegrationTypeList.find(item=>item.reIntegrationType == t('common:assessment.Foster Care'))?.id){
          const updatedFormQuestions = formQuestions.filter(item => !item.HT_question.isFosterCareFlag)
          setFormQuestions(updatedFormQuestions)
        } else {
          setFormQuestions(formQuestions)
        }
        setAllFormQuestions(formQuestions)
        if(editAssessment && details.assessmentDetails[0] && details.assessmentDetails[0].currentPagePosition){
          setFormPage(details.assessmentDetails[0].currentPagePosition)
        }
        if((viewAssessment || editAssessment) && details.assessmentScore){
          setScore(details.assessmentScore)
        }
        setAssessment(details.assessmentDetails[0])
        setIntegrationOptions(details.integrationOptionResponses)
        setPrimaryChoices(details.primaryChoices)
        setVisitInterval(details.assessmentDetails[0].schedulingOption) 
      }
      setLoading(false)
      setQuestionsLoading(false)
      // setAssessmentStartsAt(new Date().toISOString())
    } catch (err) {
      console.error(err);
      setLoading(false)
      setQuestionsLoading(false)
    }
  }, []);
  
  const recommendationQuestionOptions = [{
    id: "1",
    option: "Weekly"
  },{
    id: "2",
    option: "Fortnightly (Bi-weekly)"
  },{
    id: "3",
    option: "Monthly"
  },{
    id: "4",
    option: "Every 2 Months (Bi-monthly)"
  },{
    id: "5",
    option: "No need for more frequent follow ups - stay with regular schedule"
  }]
  //const { organization, ...other } = props;

  const findAge = (dateString) =>{
    var birthday = +new Date(dateString);
    return ~~((Date.now() - birthday) / (31557600000));
  }

  const handleCaseIdChange=(value)=>{
    getCaseDetails(value)
  }


  const getCaseId=()=>{
    let caseValue;
    if(assessment && assessment.HTCaseId){
      caseValue = assessment.HTCaseId
    }else if(fromCaseList){
      caseValue = caseId
    }else{
      caseValue = ''
    }
   return caseValue
  }

  const getCaseDetails = useCallback(async (id) => {
    setLoading(true)
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    try {
      const data = await APIS.CaseDetails(id);
       if (data && data.data && data.data.data) {
        setCaseDetails(data.data.data)
        setLoading(false)
       }
    } catch (err) { 
      setLoading(false)
      console.error(err)
    }
  }, []);


  const getCaseData = (type)=>{
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    if(caseDetails && Object.keys(caseDetails).length !== 0){
      switch(type){
        case "id" : {
          return caseDetails.childId
        }
        case "age" :  {
          return findAge(caseDetails.childBirthDate)
        }
        case "gender" : {
          return caseDetails.childGender
        }
        case "name" : {
          return caseDetails.childFirstName + ' '+ caseDetails.childLastName
        }
        case "caseWorkerName" : {
          return caseDetails.userFirstName + " "+ caseDetails.userLastName
        }
        case "lastDate" : {
          return caseDetails.lastAsessmentDate.toLocaleDateString("en-US", options)
        }
        case "displaytext" : {
          return caseDetails.dispplytext
        }
        
        default: { 
          return " "
        }
      }
    }

  }


  const handleChangeDomainQuestionValue = (value, id) => {
    const questions = formQuestions && formQuestions.length > 0 && formQuestions.map(item => {
      if(item.HT_question.id === id){
        if(item.HT_question.HT_responses?.length && item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId){
          item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId = value
        } else{
          item.HT_question.HT_responses = [{HTChoiceId: value, isInterResp: false}]
        }
        return item
      } else {
        return item
      }
    })
    setFormQuestions(questions)
  }

  const handleClickPage = (value) => {
    if(value<formPage){
      setFormPage(value)
    }
  }

  const checkDomainResponses = (values) => {
    if(formPage === 1){
      if(
      values.case_id === '' ||
      values.visit_type === '' || 
      values.question === '' || 
      values.child_thought.trim() === "" || values.child_thought.length > 255 ||
      values.family_thought.trim() === "" || values.family_thought.length > 255 ||
      (values.reintegration_type === '8' && values.other_value === '')){
        return true
      }else {
        return false 
      }
    }
    if(formPage === 8){
      let isDisabled = false
      const redFlagOptionIds = primaryChoices && primaryChoices.length > 0 && primaryChoices.map(c=>{
        if(c.choiceName===t('common:assessment.In-crisis') || c.choiceName===t('common:assessment.Vulnerable')) {return c.id}
      }).filter(c=>c)
      formQuestions.map(item=>{
        if(item.HT_question.HT_choices.length > 0 && item.HT_question.isRedFlag &&
        (item.HT_question.HT_responses.find(resp => resp.HTChoiceId == redFlagOptionIds[0]) ||
        item.HT_question.HT_responses.find(resp => resp.HTChoiceId == redFlagOptionIds[1])) &&
        item.HT_question.HT_responses.length < 2)
        {
          isDisabled = true
        }
        const othersId = item.HT_question.HT_choices.find(resp => resp.choiceName == t('common:assessment.Other (please specify)'))?.id
        if(othersId && item.HT_question.HT_responses.find(resp => resp.HTChoiceId == othersId)
          && !item.HT_question.HT_responses.find(resp => resp.HTChoiceId == othersId).otherResponse){
          isDisabled = true
        }
        return item
      })
      return isDisabled
    }
    if(formPage === 9){
      if(values.overall_observations === '' || values.specify_reason === '' || !visitInterval){
        return true
      }else{
        let isDisabled = false
        const redFlagOptionIds = primaryChoices && primaryChoices.length > 0 && primaryChoices.map(c=>{
          if(c.choiceName===t('common:assessment.In-crisis') || c.choiceName===t('common:assessment.Vulnerable')) {return c.id}
        }).filter(c=>c)
        formQuestions.map(item=>{
          if(item.HT_question.HT_choices.length > 0 && !item.HT_question.isRedFlag &&
          (item.HT_question.HT_responses.find(resp => resp.HTChoiceId == redFlagOptionIds[0]) ||
          item.HT_question.HT_responses.find(resp => resp.HTChoiceId == redFlagOptionIds[1])) &&
          item.HT_question.HT_responses.length < 2)
          {
            isDisabled = true
          }
          const othersId = item.HT_question.HT_choices.find(resp => resp.choiceName == t('common:assessment.Other (please specify)'))?.id
          if(othersId && item.HT_question.HT_responses.find(resp => resp.HTChoiceId == othersId)
            && !item.HT_question.HT_responses.find(resp => resp.HTChoiceId == othersId).otherResponse){
            isDisabled = true
          }
          return item
        })
        const integrationValidation = integrationOptions.filter(opt => checkIntegrationOptionStatus() ? opt.isRedFlag : !opt.isRedFlag)?.length > 0 &&
        integrationOptions.filter(opt => checkIntegrationOptionStatus() ? opt.isRedFlag : !opt.isRedFlag).
        filter(item=> item.HT_assessmentIntegrationOptionMappings && item.HT_assessmentIntegrationOptionMappings.length > 0)
        if(!integrationValidation || !integrationValidation.length){
          isDisabled = true
        }
        return isDisabled
      }
      
    }
    if(formPage >= 2 && formPage < domains.length + 1) {
      const unanswered = formQuestions?.filter(item => ((domains[formPage - 2].id === item.HT_question.HTQuestionDomainId) && (!item.HT_question.HT_responses || !item.HT_question.HT_responses.length)))
      return unanswered?.length ? true : false
    } else {
      return false
    }
  }

  const changeInterventionCheckValue = (value, questionId, choiceId) => {
    const options = formQuestions && formQuestions.length > 0 && formQuestions.map(item => {
      if(item.HT_question.id === questionId){
        if(value){
          item.HT_question.HT_responses.push({HTChoiceId: choiceId, isInterResp: true})
        } else {
          item.HT_question.HT_responses = item.HT_question.HT_responses.filter(resp =>  resp.HTChoiceId !== choiceId)
        }
        return item
      } else {
        return item
      }
    })
    setFormQuestions(options)
  }

  const changeInterventionValue = (value, questionId, field) => {
    const options = formQuestions && formQuestions.length > 0 && formQuestions.map(item => {
      if(item.HT_question.id === questionId){
        item.HT_question && item.HT_question.HT_responses && 
        item.HT_question.HT_responses.length > 0 &&
        item.HT_question.HT_responses.map(resp=>{
          if(field === 'textResponse'){
            resp.textResponse = value;
          } else if(field === 'otherResponse'){
            resp.otherResponse = value;
          }
          return resp
        })
        return item
      } else {
        return item
      }
    })
    setFormQuestions(options)
  }

  const changeIntegrationCheckValue = (value, id) => {
    const options = integrationOptions && integrationOptions.length > 0 && integrationOptions.map(item => {
      if(item.id === id){
        if(value){
          item.HT_assessmentIntegrationOptionMappings = [{HTIntegrationOptionId: id}]
        } else {
          item.HT_assessmentIntegrationOptionMappings = []
        }
        return item
      } else {
        return item
      }
    })
    setIntegrationOptions(options)
  }

  const CalculateAssessmentScore =  async () => {
  setLoading(true)
  //let questionAndChoices = [];
    const formattedData = formQuestions && formQuestions.length > 0 && formQuestions.map(item=>{
      const formattedResponses = item.HT_question && item.HT_question.HT_responses && 
                                 item.HT_question.HT_responses.length > 0 && 
                                 item.HT_question.HT_responses.map(c=>{
        const resp = {
          HTChoiceId: c.HTChoiceId,
          isInterResp: c.isInterResp,
          HTResponseId: c.id || ''
        }
        return resp;
      })
      const formattedQuestions = {
        HTQuestionId: item.HT_question && item.HT_question.id,
        HTQuestionDomainId: item.HT_question && item.HT_question.HTQuestionDomainId,
        textResponse: item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(c=> c.textResponse)?.textResponse || '',
        otherResponse: item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(c=> c.otherResponse)?.otherResponse || '',
        choiceDetails: formattedResponses
      }
      return formattedQuestions
    })

    const questionAndChoices = domains?.length > 0 && domains.map(domain=>{
      const filteredQuestions = formattedData && formattedData.length > 0 && formattedData.filter(item=>item.HTQuestionDomainId === domain.id)
      const formattedFilteredQuestions = filteredQuestions?.length > 0 ? filteredQuestions.map(item=> {
        return {
          HTQuestionId: item.HTQuestionId,
          textResponse: item.textResponse,
          otherResponse: item.otherResponse,
          choiceDetails: item.choiceDetails,
        }
      }) : [];
      const option = {
        HTQuestionDomainId: domain.id,
        questions: formattedFilteredQuestions
      }
      return option
    })

    try {
      let payload = {"questionAndChoices" : questionAndChoices}
      await APIS.CalculateScore(payload)
      .then((res) =>{
        if(res && res.data && res.data.score){
          setLoading(false)
          setScore(res.data.score)
          // toast.success(`Home Thrive Score Calculated Successfully`);
          //setIsOpen(false);
          //getQuestionList();
  
        }else {
          setLoading(false)
          toast.error(`Couldn't Calculate Home Thrive Score`);
        }
      })
    }catch (err) {
      setLoading(false)
      toast.error('Something went wrong');
    }
  }; 

  const handleNextPage=(values,handleSubmit,setFieldValue)=>{
    if(document.getElementById("scroller")){
      const scrollerDiv = document.getElementById("scroller").parentNode
      // scrollerDiv.scroll(0,0)
      scrollerDiv.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    if(formPage == 1) {
      const currentReintegrationType = formRef?.current?.values?.reintegration_type 
      if(currentReintegrationType !== reIntegrationTypeList.find(item=>item.reIntegrationType == t('common:assessment.Foster Care'))?.id){
        const updatedFormQuestions = allFormQuestions?.filter(item => !item.HT_question.isFosterCareFlag)
        setFormQuestions(updatedFormQuestions)
      } else {
        setFormQuestions(allFormQuestions)
      }
    }
    setFormPage(formPage !== 10 ? formPage + 1 : formPage)
    if(formPage === 9 && !viewAssessment){
      setFieldValue('is_completed',true)
      handleSubmit(values)
      
    }
    
  }


  const handlePreviousPage=()=>{
    setFormPage(formPage !== 1 ? formPage - 1 : formPage)
  }

  const checkIntegrationOptionStatus = () => {
    const redFlagOptionIds = primaryChoices && primaryChoices.length > 0 && primaryChoices.map(c=>{
      if(c.choiceName===t('common:assessment.In-crisis') || c.choiceName===t('common:assessment.Vulnerable')) {return c.id}
    }).filter(c=>c)
    let count = 0;
    formQuestions && formQuestions.length > 0 && formQuestions.map(item=>{
      if(item.HT_question.isRedFlag && redFlagOptionIds.length > 0 && item.HT_question.HT_responses?.find(resp=>redFlagOptionIds.find(c=>c == resp.HTChoiceId))){
        count = 1;
      }
      return item
    })
    return count ? true : false;
  }

  const checkIsAnswered=()=>{
    let answered = false;
    formQuestions && formQuestions.length > 0 && formQuestions.map((item)=>{
    if(item.choiceDetails && item.choiceDetails.length > 0 && answered === false ){
        answered = true
    }
    })
    return answered
  }

  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date([month, day, year].join('/'));
  };

  const getDate = (payload = null) => {
      let yourDate = payload === null ? new Date() : new Date(stringToDate(payload))
      return yourDate.toString().slice(0,24)
  }

  const getScore=(value)=>{
    let domainScore = "0.0 %";
    score && score.questionDomains && score.questionDomains.length > 0 && score.questionDomains.map((item)=>{
      if(item.HTQuestionDomainId === value){
        domainScore = item.totalScoreInPercentageAsString+" %"
      }
      getScoreList.length<= 4 && getScoreList.push(parseInt(item.totalScoreInPercentageAsString, 10));
    })
    return domainScore;
    
  }

  const getRadarChartScore=()=>{
    let radarScore = [];
    score && score.questionDomains && score.questionDomains.length > 0 && score.questionDomains.map((item)=>{
      radarScore.push(item.totalScoreInPercentage)
    })
    return radarScore;
  }

  const getHTScore=()=>{
    let totalScoreInPercentageAsString;
    if(score && score.totalScoreInPercentageAsString){
      totalScoreInPercentageAsString = score.totalScoreInPercentageAsString + " %"
    }
    return totalScoreInPercentageAsString;
    //return totalScoreInPercentageAsString;
  }

  const checkRedFlagIntervention = (value) => {
    const redFlagOptionId = primaryChoices && primaryChoices.length > 0 && primaryChoices.find(c=>c.choiceName==value)?.id
    let count = 0;
    formQuestions && formQuestions.length > 0 && formQuestions.map(item=>{
      if(item.HT_question && item.HT_question.isRedFlag && item.HT_question.HT_responses?.find(resp=>redFlagOptionId == resp.HTChoiceId)){
        count = count + 1;
      }
      return item
    })
    return count > 0 ? true : false;
  }

  const checkIntervention = (value) => {
    const redFlagOptionIds = primaryChoices && primaryChoices.length > 0 && primaryChoices.map(c=>{
      if(c.choiceName== t('common:assessment.In-crisis') || c.choiceName== t('common:assessment.Vulnerable')) {return c.id}
    }).filter(c=>c)
    let count = 0;
    formQuestions && formQuestions.length > 0 && formQuestions.map(item=>{
      if(item.HT_question && item.HT_question.HTQuestionDomainId === value && !item.HT_question.isRedFlag && 
        (item.HT_question.HT_responses?.find(resp=>redFlagOptionIds[0] == resp.HTChoiceId) || 
         item.HT_question.HT_responses?.find(resp=>redFlagOptionIds[1] == resp.HTChoiceId))
        ){
        count = count + 1;
      }
      return item
    })
    return count > 0 ? true : false;
  }

  return (
    <>
    <Prompt 
      when={!viewAssessment && !isSaveandExit} 
      message="Are you sure you want to leave?" 
    />
    <Formik
      innerRef={formRef}
      initialValues={{
        form: '',
        case_id: getCaseId(),
        last_assessment : '',
        date_of_assessment : assessment && assessment.dateOfAssessment ? getDate(assessment.dateOfAssessment) : `${getDate()}`,
        visit_type: assessment?.HTAssessmentVisitTypeId || '',
        reintegration_type: assessment?.HTAssessmentReintegrationTypeId || '',
        other_value: '',
        child_thought: assessment?.placementThoughtsOfChild || '',
        family_thought: assessment?.placementThoughtsOfFamily || '',
        other_value: assessment?.otherReIntegrationTypeValue || '',
        question: assessment && assessment.meetWithChild === true ? 'Yes' : assessment && assessment.meetWithChild === false ? 'No' : '',
        language : '',
        relation : '',
        other_relation : '',
        overall_observations : assessment && assessment.overallObservation ? assessment.overallObservation : '',
        is_complete : assessment?.isComplete || false,
        total_score : 0,
        specify_reason : assessment && assessment.specifyReason ? assessment.specifyReason : '',
        scheduling_option : assessment && assessment.schedulingOption ? assessment.schedulingOption : '',
        is_completed : false,
        submit: null,
      }}
      enableReinitialize={(editAssessment || viewAssessment) ? true : false}
      validationSchema={Yup
        .object()
        .shape({
          form :  Yup
            .string()
            .max(255),
          case_id :  Yup
            .string()
            .max(255)
            .required(t('common:warnings.Child is required')),
          case_worker :  Yup
            .string()
            .max(255),
          child_thought: Yup
          .string()
          .max(255, t('common:warnings.Must be at most 255 characters'))
          .required(t('common:warnings.Child Thought is required')),
          family_thought: Yup
          .string()
          .max(255, t('common:warnings.Must be at most 255 characters'))
          .required(t('common:warnings.Family Thought is required')),
          last_assessment: Yup
            .string()
            .max(255),
          visit_type: Yup
            .string()
            .max(255)
            .required(t('common:warnings.This is a required field')),
          reintegration_type: Yup
            .string()
            .max(255)
            .required(t('common:warnings.This is a required field')),
          other_value: Yup
            .string()
            .max(255)
            .when('reintegration_type', (type) => {
            // is: '3',
            // then: Yup.string().required("Option is required")
              if(type === '8'){
                return Yup
                .string()
                .required(t('common:warnings.Other Value is required'))
               }
            }),
          relation: Yup
            .string()
            .max(255),
          other_relation: Yup
            .string()
            .max(255),
          date_of_assessment : Yup
            .date()
            //.min(new Date().setDate(new Date().getDate() - 1))
            //.min(new Date(Date.now() - 864e5)) //yesterday
            //.min(new Date(Date.now() -86400000))
            //
        })}
        onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
          getScore("1")
          setLoading(true)
          // setIsSaveandExit(true)

          if(values && values.question !== 'Yes' || values.question !== 'No'){
            setHelperText("Please Choose an option")
            setFormError(true)
            setLoading(false)
          }
        //setIsComplete(true)
        const formattedData = formQuestions && formQuestions.length > 0 && formQuestions.map(item=>{
          const formattedResponses = item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.map(c=>{
            const resp = {
              HTChoiceId: c.HTChoiceId,
              isInterResp: c.isInterResp,
              HTResponseId: c.id || ''
            }
            return resp;
          })

          const formattedQuestions = {
            HTQuestionId: item.HT_question.id,
            HTQuestionDomainId: item.HT_question.HTQuestionDomainId,
            textResponse: item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(c=> c.textResponse)?.textResponse || '',
            otherResponse: item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(c=> c.otherResponse)?.otherResponse || '',
            choiceDetails: formattedResponses || []
          }
          return formattedQuestions
        })
        const finalQuestionAndChoices = domains?.length > 0 && domains.map(domain=>{
          const filteredQuestions = formattedData && formattedData.length > 0 && formattedData.filter(item=>item.HTQuestionDomainId === domain.id)
          const formattedFilteredQuestions = filteredQuestions?.length > 0 ? filteredQuestions.map(item=> {
            return {
              HTQuestionId: item.HTQuestionId,
              textResponse: item.textResponse,
              otherResponse: item.otherResponse,
              choiceDetails: item.choiceDetails,
            }
          }) : [];
          const option = {
            HTQuestionDomainId: domain.id,
            questions: formattedFilteredQuestions
          }
          return option
        })
  
        const formattedintegrationOptions = integrationOptions && integrationOptions.length > 0 && integrationOptions.filter(item=>item.HT_assessmentIntegrationOptionMappings?.length > 0).map((item)=>{
          return  {
            HTIntegrationOptionId : item.id,
            isCaseCloseOption : item.isCaseCloseOption
          }
        })


        let payload = {
          "HTAssessmentId": assessment?.id || '',
          "HTCaseId": values.case_id,
          "HTAssessmentVisitTypeId": values.visit_type,
          "HTAssessmentReintegrationTypeId": values.reintegration_type,
          "meetWithChild": values.question === "Yes" ? "true" : "false",
          "placementThoughtsOfChild": values.child_thought,
          "placementThoughtsOfFamily": values.family_thought,
          //"dateOfAssessment": values.date_of_assessment,
          "otherReIntegrationTypeValue" : values.other_value,
          "isComplete" : values.is_completed,
          "totalScore": score && score.totalScoreInPercentage,
          "dateOfAssessment": moment(values.date_of_assessment).format("YYYY-MM-DD"),
          "currentPagePosition": formPage,
          "specifyReason": values.specify_reason, 
          "overallObservation": values.overall_observations, 
          "schedulingOption": visitInterval || '',
          "questionAndChoices": checkIsAnswered() ? [] : finalQuestionAndChoices,
          "integrationOptions" : formattedintegrationOptions.length > 0 ? formattedintegrationOptions : [],
          "formRevisionNumber" : editAssessment ? (formRevisionNumber || currentFormRevision).toString() : currentFormRevision.toString(),
          "HTFormId": "1",
          "childId": caseDetails.HTChildId,
          "childFirstName": caseDetails.childFirstName,
          "assessmentStartsAt": assessmentStartsAt,
          "isOffline": false,
          "deviceType": "WEB"
      }
           
     if(values.question === 'Yes' || values.question === 'No'){ 
       
      try { 
        setLoading(true)
        await APIS.SaveAssessmentResponse(payload).then((res)=>{
          if(res && res.data && res.status === 200){
            setLoading(false)
            setIsSaveandExit(true)
            resetForm();
            setStatus({ success: true });
            setSubmitting(false);
            if(isOpen){
              if(!editAssessment){
                navigate(`/dashboard/assessments/${res.data.assessmentId}/edit` ,{ state: {editAssessment: true}});
              }
              window.location.reload();
              setIsOpen(false);
            }
            toast.success(t('common:assessment.Assessment Saved Successfully'));
            // navigate(`/dashboard/assessments`, { 
            //   state: {
            //     "addMember": true,
            //     "fetchFamilyDetails": true
            //   }
            // });
            if(!values.is_completed && !isOpen){
              navigate('/dashboard/assessments');
            }
            // setTimeout(()=>{
            //   setLoading(false)
            //   navigate('/dashboard/assessments')
            // },3000)
          }else{
           toast.error('Something went wrong!');
           setStatus({ success: false });
           setSubmitting(false);
           setLoading(false)
          }
          
        })
      }catch(err){
           console.error(err);
           toast.error('Something went wrong!');
           setStatus({ success: false });
           setErrors({ submit: err.message });
           setSubmitting(false);
           setLoading(false)
      }
    }

    
      }}

    >
      {({ errors, handleBlur, handleChange,setFieldValue, handleSubmit, isSubmitting, touched, values }) => (
        <Form
          onSubmit={handleSubmit}
          //{...other}
        >
        <LocalizationProvider dateAdapter={DateAdapter}>
          <Card>
            {/* {loading ?
              <CircularProgress 
                sx={{
                  zIndex : 1000,
                  position : "absolute",
                  top : "55%",
                  left : "45%"
                }}
                color="primary" 
              />
            : */}
            <Box sx={{ m: 2,mt:3 }} >
            {/* <Divider/> */}

              <Grid
                container
                spacing={3}
              >
            {(loading || questionsLoading) && <CircularProgress 
                            sx={{zIndex : 1000,
                                  position : "absolute",
                                  top : "55%",
                                  left : "45%"}}
                            color="primary" />}


                {formPage !== 10 &&
                <Box sx={{ width: '100%', marginTop: '30px', marginBottom: '20px', overflow: 'auto' }}>
                  <Stepper activeStep={formPage-1} alternativeLabel>
                    <Step key="Details" onClick={() => handleClickPage(1)}>
                      <StepLabel>{t('common:assessment.Details')}</StepLabel>
                    </Step>
                    {domains && domains.length > 0 && domains.map((label, index) => (
                      <Step key={label.domainName} onClick={() => handleClickPage(index+2)}>
                        <StepLabel>{label.domainName}</StepLabel>
                      </Step>
                    ))}
                    <Step key="Summary" onClick={() => handleClickPage(domains.length+2)}>
                      <StepLabel>{t('common:assessment.Summary')}</StepLabel>
                    </Step>
                    <Step key="Red Flag Milestones" onClick={() => handleClickPage(domains.length+3)}>
                      <StepLabel>{t('common:assessment.Red Flag Milestones')}</StepLabel>
                    </Step>
                    <Step key="Areas Needing Immediate Intervention" onClick={() => handleClickPage(domains.length+4)}>
                      <StepLabel>{t('common:assessment.Areas Needing Immediate Intervention')}</StepLabel>
                    </Step>
                  </Stepper>
                </Box> }
                    

                {formPage === 1 &&
                <>
               {viewAssessment ?
                <Grid
                  item
                  md={6}
                  xs={12}
                  style={{display: "flex", justifyContent: "space-between"}}
                >
                  <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Child ID')}
                    </Typography>
                    <Typography variant="h6">{getCaseData("displaytext") || '-'}</Typography>
                  </div>
                </Grid>
                :
                <Grid
                  item
                  md={6}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                  <Field
                    error={Boolean(touched.case_id && errors.case_id)}
                    fullWidth
                    helperText={touched.case_id && errors.case_id}
                    name="case_id"
                    accessKey="dispplytext"
                    component={AutoCompleteDropdown}
                    handleValueChange={(id)=>handleCaseIdChange(id)}
                    required={true}
                    label="case_id"
                    disabled={viewAssessment || fromCaseList}
                    options={caseList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:common.Child ID')
                   }}
           
                  />
                </Grid> }

                <Grid
                  item
                  md={6}
                  xs={12}
                  style={{display: "flex", justifyContent: "space-between"}}
                >
                  {values.case_id && caseDetails && caseDetails && Object.keys(caseDetails).length !== 0 &&
                  <>
                  
                  <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Child ID')}
                    </Typography>
                    <Typography variant="h6">{getCaseData("id")}</Typography>
                  </div>

                  <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:assessment.Child Name')}
                    </Typography>
                    <Typography variant="h6">{getCaseData("name")}</Typography>
                  </div> 

                 <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Age')}
                    </Typography>
                    <Typography variant="h6">{getCaseData("age")}</Typography>
                  </div>

                    <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Gender')}
                    </Typography>
                    <Typography align={"right"} variant="h6">{getCaseData("gender")}</Typography>
                  </div>
                  </> }
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                  <Field
                    error={Boolean(touched.visit_type && errors.visit_type)}
                    fullWidth
                    helperText={touched.visit_type && errors.visit_type}
                    name="visit_type"
                    accessKey="visitType"
                    component={AutoCompleteDropdown}
                    required={true}
                    label="visit_type"
                    disabled={viewAssessment}
                    options={visitTypeList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:assessment.Type of Visit')
                   }}
           
                  />
                </Grid>             
                <Grid
                  item
                  md={6}
                  xs={12}
                  style={{display: "flex", justifyContent: "space-between"}}
                >
                  {values.case_id && caseDetails && Object.keys(caseDetails).length !== 0 && 
                  <>
                    <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Case Worker')}
                    </Typography>
                  <Typography variant="h6">{getCaseData("caseWorkerName")}</Typography>
                    </div>
                  { caseDetails && caseDetails.lastAssesmentDate &&
                  <div>
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:assessment.Last Assessment Date')}
                    </Typography>
                    <Typography variant="h6" align={"right"}>
                      {caseDetails.lastAssesmentDate !== undefined && 
                       caseDetails.lastAssesmentDate !== null ? caseDetails.lastAssesmentDate : ''}
                       {/* caseDetails.lastAssesmentDate !== null ? getDate(caseDetails.lastAssesmentDate) : ''} */}
                      </Typography>
                  </div>}
                  </>}
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  {/* <TextField
                    error={Boolean(touched.date_of_assessment && errors.date_of_assessment)}
                    fullWidth
                    helperText={touched.date_of_assessment && errors.date_of_assessment}
                    label="Date of Assessment"
                    name="date_of_assessment"
                    onBlur={handleBlur}
                    disabled={viewAssessment}
                    onChange={handleChange}
                    required
                    type="date"
                    value={values.date_of_assessment}
                    variant="outlined"
                  /> */}
                  <DatePicker
                    label={t('common:assessment.Date of Assessment')}
                    name="date_of_assessment"
                    value={values.date_of_assessment}
                    disabled={viewAssessment}
                    //format="dd/MM/yyyy"
                    inputFormat = "dd/MM/yyyy"
                    onChange={(newValue) => {
                      const tempDateValue = moment(newValue).format("DD/MM/YYYY")
                      setFieldValue('date_of_assessment',getDate(tempDateValue));
                    }}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                    />
                </Grid>
                
                
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <div key="1">
                    <FormLabel>{t('common:assessment.Did you meet the child')}*</FormLabel>
                    <RadioGroup row value={values.question} onChange={handleChange}>
                      <FormControlLabel 
                      //error={Boolean(errors.question)}
                      error={formError}
                      helperText={errors.question}
                      value="Yes" 
                      disabled={viewAssessment}
                      name="question"
                      required
                      control={<Radio
                                required={true}
                                />}
                      label={t('common:assessment.Yes')} />
                      <FormControlLabel 
                      //error={Boolean(errors.question)}
                      error={formError}
                      helperText={errors.question}
                      value="No" 
                      disabled={viewAssessment}
                      required
                      name="question" 
                      control={<Radio
                                required={true}
                              />} 
                      label={t('common:assessment.No')} />
                    </RadioGroup>
                    {values.question == '' && 
                    <FormHelperText sx={{color :"red"}}>
                    {helperText}
                    </FormHelperText>}
                  </div>
                    
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                  <Field
                    error={Boolean(touched.reintegration_type && errors.reintegration_type)}
                    fullWidth
                    helperText={touched.reintegration_type && errors.reintegration_type}
                    name="reintegration_type"
                    accessKey="reIntegrationType"
                    component={AutoCompleteDropdown}
                    required={true}
                    label="reintegration_type"
                    disabled={viewAssessment}
                    options={reIntegrationTypeList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:assessment.Type of Reintegration')
                   }}
           
                  />
                </Grid>            


              

               

                {  values.reintegration_type === '8' && <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.other_value && errors.other_value)}
                    fullWidth
                    helperText={touched.other_value && errors.other_value}
                    label="Other Value"
                    name="other_value"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.other_value}
                    disabled={viewAssessment}
                    variant="outlined"
                    required
                    />
                    
                </Grid> }

              

                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.child_thought && errors.child_thought)}
                    fullWidth
                    helperText={touched.child_thought && errors.child_thought}
                    label={t('common:assessment.Child Thought')}
                    name="child_thought"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.child_thought}
                    disabled={viewAssessment}
                    multiline
                    rows={5}
                    rowsMax={10}
                    variant="outlined"
                    required
                  />
                    
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.family_thought && errors.family_thought)}
                    fullWidth
                    helperText={touched.family_thought && errors.family_thought}
                    label={t('common:assessment.Family Thought')}
                    name="family_thought"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.family_thought}
                    disabled={viewAssessment}
                    multiline
                    rows={5}
                    rowsMax={10}
                    variant="outlined"
                    required
                  />
                    
                </Grid>
                </>
                }

                {formPage >= 2 && formPage <= domains.length + 1 &&
                  domains && domains.length > 0 && domains.map((domain, index) => {
                    return(
                      formPage - index !== 2 ? <></> :
                    <>
                      <Grid
                        item
                        md={12}
                        xs={12}
                      >
                      <Typography
                      color="textSecondary"
                      variant="h6">
                        {domain.domainName}
                      </Typography>
                      <Typography
                      color="textSecondary"
                      variant="subtitle1">
                          {t('common:assessment.Consider the impact of important events')}
                      </Typography>
                      </Grid>
                      <Grid
                        item
                        md={12}
                        xs={12}
                      >
                        {formQuestions && formQuestions.length > 0 && formQuestions.map((item)=>{
                            return(
                              domain.id === item.HT_question.HTQuestionDomainId ?
                              <div key={item.HT_question.id} style={{marginBottom: 20}}>
                                <div style={{paddingRight: '20%'}}>
                                  <Tooltip title={item.HT_question && item.HT_question.questionHelpText} placement="right">
                                        <FormLabel style={{color: item.HT_question.isRedFlag ? 'red' : ''}}>
                                        {item.HT_question.isRedFlag ? `*${t('common:assessment.Red Flag')}: ` : '*'}{item.HT_question.questionText}
                                        </FormLabel>
                                  </Tooltip>
                                </div>
                             
                                <RadioGroup row value={item.HT_question?.HT_responses?.length && item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId} 
                                onChange={(e) => handleChangeDomainQuestionValue(e.target.value, item?.HT_question?.id)}>
                                  {primaryChoices?.length > 0 && primaryChoices?.sort((a, b) => a.id - b.id).length > 0 && 
                                    primaryChoices?.sort((a, b) => a.id - b.id).map((choice, index) => {
                                    return <FormControlLabel 
                                            value={choice.id} 
                                            key={index}
                                            name={choice.choiceName} 
                                            control={<Radio tabindex={formQuestions.find(el=>el.HT_question?.HT_responses?.length && el.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId == choice.id) ? 0 : 1} />} 
                                            label={choice.choiceName} 
                                            disabled={viewAssessment} />
                                  })}
                                </RadioGroup>
                                {/* {(!item.HT_question?.HT_responses?.length || !item.HT_question.HT_responses[0].HTChoiceId) && 
                                  <FormHelperText sx={{color :"red"}}>
                                    Hello
                                  </FormHelperText>
                                } */}
                              </div>
                              : <></>
                            );
                          }
                        )}
                      </Grid>
                      </>)
                  })
                }

                {formPage === 7 && 
                <>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography
                    color="textSecondary"
                    variant="h6">
                        {t('common:assessment.Summary')}
                    </Typography>
                  </Grid>
                  <div style={{width: '100%'}}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      minHeight: '100%',
                      px: 3,
                      py: '30px'
                    }}
                  >
                  <Container maxWidth="sm">
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{marginBottom: 20}}
                  >
                    {/* <div style={{display: "flex", justifyContent: "space-between", minWidth: mobileDevice ? '' : 600}}> */}
                      <Typography
                      color="textSecondary"
                      variant="subtitle2">
                        {t('common:assessment.Family and Social Relationships')}
                      </Typography>
                      <Typography
                      color="textSecondary"
                      variant="subtitle2">
                          {getScore("1")}
                      </Typography>
                    {/* </div> */}
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{marginBottom: 20}}
                  >
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                      {t('common:assessment.Household Economy ')}
                    </Typography>
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                        {getScore("2")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{marginBottom: 20}}
                  >
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                      {t('common:assessment.Living Conditions')}
                    </Typography>
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                        {getScore("3")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{marginBottom: 20}}
                  >
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                      {t('common:assessment.Education')}
                    </Typography>
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                        {getScore("4")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{marginBottom: 20}}
                  >
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                      {t('common:assessment.Health and Mental Health')}
                    </Typography>
                    <Typography
                    color="textSecondary"
                    variant="subtitle2">
                      {getScore("5")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                    color="textSecondary"
                    variant="h6">
                        {t('common:assessment.Home Thrive Score')}
                    </Typography>
                    <Typography
                    color="textSecondary"
                    variant="h6">
                        {getHTScore()}
                    </Typography>
                  </Grid>
                  </Container>
                </Box>
                </div>
                </>
                }

                {formPage === 8 &&
                <>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                <Typography
                color="textSecondary"
                variant="h6">
                  {t('common:assessment.Red Flag Milestones')}
                </Typography>
                <Typography
                color="textSecondary"
                variant="subtitle1">
                  {t('common:assessment.Red Flag Milestones Sub1')}
                </Typography>
                <Typography
                color="textSecondary"
                variant="subtitle1">
                  {t('common:assessment.Red Flag Milestones Sub2')}
                </Typography>
                {(checkRedFlagIntervention(t('common:assessment.In-crisis')) || checkRedFlagIntervention(t('common:assessment.Vulnerable'))) ?
                  <Typography
                  color="textSecondary"
                  variant="subtitle1">
                    {t('common:assessment.Red Flag Milestones Sub3')}
                  </Typography> : <></>}

                {(!checkRedFlagIntervention(t('common:assessment.In-crisis')) && !checkRedFlagIntervention(t('common:assessment.Vulnerable'))) ?
                  <Typography
                  color="textSecondary"
                  variant="subtitle1"
                  sx={{ mt: 3, color: '#6b778c', fontWeight: 'bold' }}>
                      - {t('common:assessment.There are no Red Flags for this child')}
                  </Typography> : <></>}
                </Grid>

                {checkRedFlagIntervention(t('common:assessment.In-crisis')) ?
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <div key="1" style={{border: '1px solid #f37123', borderRadius: '20px', padding: '20px'}}>
                    <FormGroup>
                      <FormLabel>{t('common:assessment.Red Flag Milestones Incrisis')}</FormLabel>
                      {domains && domains.length > 0 && domains.map((domain) => {
                        return (
                        formQuestions && formQuestions.length > 0 && formQuestions.map((item)=>{
                          return(
                            domain.id == item.HT_question?.HTQuestionDomainId &&
                            item.HT_question && item.HT_question.isRedFlag &&
                            primaryChoices.filter(el => el.choiceName == t('common:assessment.In-crisis'))?.length > 0 && item.HT_question && item.HT_question.HT_responses?.length > 0 &&
                            primaryChoices.filter(el => el.choiceName == t('common:assessment.In-crisis'))[0].id == item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId ?
                            <div key={item.HT_question && item.HT_question.id} style={{marginBottom: 20}}>
                              <FormLabel>*{item.HT_question && item.HT_question.questionText}</FormLabel>
                              <div style={{display: 'flex', flexDirection: 'column'}}>
                                {item.HT_question && item.HT_question.HT_choices?.length > 0 && 
                                  item.HT_question.HT_choices.sort((a, b) => a?.id - b?.id).length > 0 &&
                                  item.HT_question.HT_choices.sort((a, b) => a?.id - b?.id).map(choice => {
                                  return (
                                    <FormControlLabel
                                      control={<Checkbox />}
                                      checked={item.HT_question && item.HT_question.HT_responses?.length > 0 && item.HT_question.HT_responses.find(c=>c.HTChoiceId === choice?.id)}
                                      label={choice.choiceName}
                                      disabled={viewAssessment}
                                      onChange={(e)=>changeInterventionCheckValue(e.target.checked, item.HT_question && item.HT_question.id, choice?.id)}
                                    />
                                  )
                                })}
                              </div>
                              {item.HT_question && item.HT_question.HT_responses?.length > 0 && item.HT_question.HT_choices.length > 0 &&
                              item.HT_question.HT_responses.find(r=>r.HTChoiceId === item.HT_question.HT_choices.find(c=>c.choiceName==t('common:assessment.Other (please specify)'))?.id) &&
                                <TextField
                                  fullWidth
                                  sx={{mt: 2}}
                                  label={t('common:assessment.Explain Other Intervention')}
                                  name="otherIntervention"
                                  // onBlur={handleBlur}
                                  onChange={(e)=>changeInterventionValue(e.target.value, item.HT_question.id, 'otherResponse')}
                                  value={item.HT_question.HT_responses.find(r=>r.otherResponse)?.otherResponse || ''}
                                  disabled={viewAssessment}
                                  multiline
                                  rows={2}
                                  rowsMax={10}
                                  variant="outlined"
                                />
                              }
                              {item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.filter(r=>r.isInterResp).length > 0 ?
                                <TextField
                                  fullWidth
                                  sx={{mt: 2}}
                                  label={t('common:assessment.Intervention Details')}
                                  name="interventionDetails"
                                  // onBlur={handleBlur}
                                  onChange={(e)=>changeInterventionValue(e.target.value, item.HT_question && item.HT_question.id, 'textResponse')}
                                  value={item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(r=>r.textResponse)?.textResponse || ''}
                                  disabled={viewAssessment}
                                  multiline
                                  rows={2}
                                  rowsMax={10}
                                  variant="outlined"
                                /> : <></>
                              }
                            </div> : <></>
                          )
                        }
                      ))
                    })}
                    </FormGroup>
                  </div>
                </Grid> : <></> }
                {checkRedFlagIntervention(t('common:assessment.Vulnerable')) ?
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <div key="1" style={{border: '1px solid #f37123', borderRadius: '20px', padding: '20px'}}>
                    <FormGroup>
                      <FormLabel>{t('common:assessment.Red Flag Milestones Vulnerable')}</FormLabel>
                      { domains && domains.length > 0 && domains.map((domain) => {
                        return (
                        formQuestions && formQuestions.length > 0 && formQuestions.map((item)=>{
                          return(
                            domain.id == item.HT_question?.HTQuestionDomainId &&
                            item.HT_question && item.HT_question.isRedFlag &&
                            primaryChoices.filter(el => el.choiceName == t('common:assessment.Vulnerable'))?.length > 0 && item.HT_question.HT_responses?.length > 0 &&
                            primaryChoices.filter(el => el.choiceName == t('common:assessment.Vulnerable'))[0].id == item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId ?
                            <div key={item.HT_question && item.HT_question.id} style={{marginBottom: 20}}>
                              <FormLabel>*{item.HT_question && item.HT_question.questionText}</FormLabel>
                              <div style={{display: 'flex', flexDirection: 'column'}}>
                                {item.HT_question && item.HT_question.HT_choices && item.HT_question.HT_choices.length > 0 &&
                                  item.HT_question.HT_choices.sort((a, b) => a.id - b.id).length > 0 &&
                                  item.HT_question.HT_choices.sort((a, b) => a.id - b.id).map(choice => {
                                  return (
                                    <FormControlLabel 
                                      control={<Checkbox />}
                                      value={choice.choiceName || ''} //test
                                      checked={item.HT_question && item.HT_question.HT_responses && 
                                               item.HT_question.HT_responses.find(c=>c.HTChoiceId === choice?.id)}
                                      label={choice.choiceName}
                                      disabled={viewAssessment}
                                      onChange={(e)=>changeInterventionCheckValue(e.target.checked, item.HT_question && 
                                                item.HT_question.id, choice?.id)}
                                    />
                                  )
                                })}
                              </div>
                              {item.HT_question && item.HT_question.HT_responses?.length > 0 && item.HT_question.HT_choices.length > 0 &&
                               item.HT_question.HT_responses.find(r=>r.HTChoiceId === item.HT_question.HT_choices.find(c=>c.choiceName==t('common:assessment.Other (please specify)'))?.id) &&
                                <TextField
                                  fullWidth
                                  sx={{mt: 2}}
                                  label={t('common:assessment.Explain Other Intervention')}
                                  name="otherIntervention"
                                  // onBlur={handleBlur}
                                  onChange={(e)=>changeInterventionValue(e.target.value, item.HT_question && 
                                            item.HT_question.id, 'otherResponse')}
                                  value={item.HT_question && item.HT_question.HT_responses && 
                                         item.HT_question.HT_responses.find(r=>r.otherResponse)?.otherResponse || ''}
                                  disabled={viewAssessment}
                                  multiline
                                  rows={2}
                                  rowsMax={10}
                                  variant="outlined"
                                />
                              }
                              {item.HT_question && item.HT_question.HT_responses && 
                               item.HT_question.HT_responses.filter(r=>r.isInterResp).length > 0 ?
                                <TextField
                                  fullWidth
                                  sx={{mt: 2}}
                                  label={t('common:assessment.Intervention Details')}
                                  name="interventionDetails"
                                  // onBlur={handleBlur}
                                  onChange={(e)=>changeInterventionValue(e.target.value, item.HT_question.id, 'textResponse')}
                                  value={item.HT_question && item.HT_question.HT_responses && 
                                         item.HT_question.HT_responses.find(r=>r.textResponse)?.textResponse || ''}
                                  disabled={viewAssessment}
                                  multiline
                                  rows={2}
                                  rowsMax={10}
                                  variant="outlined"
                                /> : <></>
                              }
                            </div> : <></>
                          )
                        }
                      ))
                    })}
                    </FormGroup>
                  </div>
                </Grid> : <></> }
                </>
                }
                
                {formPage === 9 &&
                <>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <Typography
                  color="textSecondary"
                  variant="h6">
                    {t('common:assessment.Areas Needing Immediate Intervention')} - {t('common:assessment.Statements marked as In-Crisis or Vulnerable will show up here')}
                  </Typography>
                  <Typography
                  color="textSecondary"
                  variant="subtitle1">
                    {t('common:assessment.Intervention Sub1')}
                  </Typography>
                  <Typography
                  color="textSecondary"
                  variant="subtitle1">
                    {t('common:assessment.Intervention Sub2')}
                  </Typography>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  {domains && domains.length > 0 && domains.map((domain) => {
                     return (
                     <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                          {domain.domainName}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}></Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <div key="1">
                            {checkIntervention(domain.id) ?
                            <FormGroup>
                              {formQuestions && formQuestions.length > 0 && formQuestions.map((item)=>{
                                  return(
                                    domain.id == item.HT_question?.HTQuestionDomainId &&
                                    !item.HT_question.isRedFlag && item.HT_question.HT_responses?.length > 0 &&
                                    ((primaryChoices.filter(el => el.choiceName == t('common:assessment.In-crisis'))?.length > 0 && primaryChoices.filter(el => el.choiceName == t('common:assessment.In-crisis'))[0].id == item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId) ||
                                    (primaryChoices.filter(el => el.choiceName == t('common:assessment.Vulnerable'))?.length > 0 && primaryChoices.filter(el => el.choiceName == t('common:assessment.Vulnerable'))[0].id == item.HT_question.HT_responses.find(c=>!c.isInterResp).HTChoiceId)) ?
                                    <div key={item.HT_question.id} style={{marginBottom: 20}}>
                                      <FormLabel>*{item.HT_question.questionText}</FormLabel>
                                      <div style={{display: 'flex', flexDirection: 'column'}}>
                                        {item.HT_question && item.HT_question.HT_choices && item.HT_question.HT_choices.length > 0 &&
                                          item.HT_question.HT_choices.sort((a, b) => a.id - b.id).length > 0 &&
                                          item.HT_question.HT_choices.sort((a, b) => a.id - b.id).map(choice => {
                                          return (
                                            <FormControlLabel 
                                              control={<Checkbox />}
                                              checked={item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(c=>c.HTChoiceId === choice?.id)}
                                              value={choice.choiceName || ''} //test
                                              label={choice.choiceName}
                                              disabled={viewAssessment}
                                              onChange={(e)=>changeInterventionCheckValue(e.target.checked, item.HT_question && item.HT_question.id, choice?.id)}
                                            />
                                          )
                                        })}
                                      </div>
                                      {item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(r=>r.HTChoiceId === item.HT_question.HT_choices.find(c=>c.choiceName==t('common:assessment.Other (please specify)'))?.id) &&
                                        <TextField
                                          fullWidth
                                          sx={{mt: 2}}
                                          label={t('common:assessment.Explain Other Intervention')}
                                          name="otherIntervention"
                                          // onBlur={handleBlur}
                                          onChange={(e)=>changeInterventionValue(e.target.value, item.HT_question?.id, 'otherResponse')}
                                          value={item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(r=>r.otherResponse)?.otherResponse || ''}
                                          disabled={viewAssessment}
                                          multiline
                                          rows={2}
                                          rowsMax={10}
                                          variant="outlined"
                                        />
                                      }
                                      {item.HT_question.HT_responses.filter(r=>r.isInterResp).length > 0 ?
                                        <TextField
                                          fullWidth
                                          sx={{mt: 2}}
                                          label={t('common:assessment.Intervention Details')}
                                          name="interventionDetails"
                                          // onBlur={handleBlur}
                                          onChange={(e)=>changeInterventionValue(e.target.value, item.HT_question?.id, 'textResponse')}
                                          value={item.HT_question && item.HT_question.HT_responses && item.HT_question.HT_responses.find(r=>r.textResponse)?.textResponse || ''}
                                          disabled={viewAssessment}
                                          multiline
                                          rows={2}
                                          rowsMax={10}
                                          variant="outlined"
                                        /> : <></>
                                      }
                                    </div> : <></>
                                  )
                                }
                              )}
                            </FormGroup>
                            : <Typography
                            color="textSecondary"
                            variant="subtitle1"
                            sx={{ color: '#6b778c' }}>
                                - {t('common:assessment.No crisis level concerns')}
                            </Typography>}
                          </div>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>)
                  })}
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <div key="1">
                    <FormGroup>
                      {checkIntegrationOptionStatus() ?
                      <FormLabel>
                        {t('common:assessment.Reintegration Heading')} {t('common:assessment.Reintegration SubHeading')}
                      </FormLabel>
                      : <FormLabel>{t('common:assessment.Reintegration SubHeading')}</FormLabel>
                      }
                      {integrationOptions.length > 0 &&
                        integrationOptions.filter(opt => checkIntegrationOptionStatus() ? opt.isRedFlag : !opt.isRedFlag).length > 0 &&
                        integrationOptions.filter(opt => checkIntegrationOptionStatus() ? opt.isRedFlag : !opt.isRedFlag).map((item)=>{
                          return(
                            <FormControlLabel 
                              control={<Checkbox />}
                              //checked={item.HT_assessmentIntegrationOptionMappings && item.HT_assessmentIntegrationOptionMappings.length > 0} 
                              checked={item.HT_assessmentIntegrationOptionMappings?.length > 0 ? true : false} 
                              value={item.integrationOption} //test
                              label={item.integrationOption} 
                              disabled={viewAssessment} 
                              onChange={(e)=>changeIntegrationCheckValue(e.target.checked, item.id)}
                            />
                          )
                        }
                      )}
                    </FormGroup>
                  </div>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <TextField
                    // error={Boolean(touched.city && errors.city)}
                    fullWidth
                    // helperText={touched.city && errors.city}
                    label={t('common:assessment.Specify Reason')}
                    name="specify_reason"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.specify_reason}
                    disabled={viewAssessment}
                    multiline
                    rows={5}
                    rowsMax={10}
                    variant="outlined"
                    required
                  />
                    
                </Grid>

                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <div key="1">
                    <FormGroup>
                      <FormLabel>*{t('common:assessment.Followup Label')}</FormLabel>
                      <RadioGroup row value={visitInterval} onChange={(e) => setVisitInterval(e.target.value)} >
                        {recommendationQuestionOptions && recommendationQuestionOptions.length > 0 && recommendationQuestionOptions.map(item => {
                          return <FormControlLabel 
                          value={item.option}
                          //value={visitInterval}
                          name={item.option} 
                          control={<Radio />} 
                          label={t(`common:assessment.${item.option}`)}
                          disabled={viewAssessment} />
                        })}
                      </RadioGroup>
                    </FormGroup>
                  </div>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <TextField
                    // error={Boolean(touched.city && errors.city)}
                    fullWidth
                    // helperText={touched.city && errors.city}
                    label={t('common:assessment.Overall Observations and Thoughts')}
                    name="overall_observations"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.overall_observations}
                    disabled={viewAssessment}
                    multiline
                    rows={5}
                    rowsMax={10}
                    variant="outlined"
                    required
                  />
                    
                </Grid>
                </>
                }

                {formPage === 10 && 
                <>
                  {!viewAssessment &&
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    style={{marginTop: "30px",marginLeft:"20px"}}
                  >
                    <Typography
                    color="primary"
                    variant="h6"
                    align="center">
                      {t('common:assessment.Congratulations on completing the Home Thrive Scale Form!')}
                    </Typography>
                  </Grid> }
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    style={{marginLeft:"30px"}}
                  >
                    <Typography
                    color="textSecondary"
                    variant="h6"
                    align="center">
                        {t('common:common.Thrive Scale Score')}:  {getHTScore()}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    style={{marginTop: "1px"}}
                  >
                   {/* <div sx={{display:'flex'}}> */}
                  <RadarChart getScoreList={getRadarChartScore()} dateOfAssessment={moment(values.date_of_assessment).format("YYYY-MM-DD")}/>
                  {/* </div> */}
                  </Grid>
                  <div style={{width: '100%'}}>
                  <Box sx={{
                      alignItems: 'center',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      minHeight: '100%',
                      px: 3,
                      py: '30px',
                      marginLeft: "24px"
                    }}>
                    <Container maxWidth="sm">
                    <Grid
                      item
                      md={12}
                      xs={12}
                      container
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography
                      color="textSecondary"
                      variant="h6"
                      align="center">
                        {t('common:assessment.Success Page Text')}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      md={12}
                      xs={12}
                      container
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                    <img
                      alt="Miracle Foundation Logo"
                      src="/static/miracle_md_blue.png"
                      style={{
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 50,
                        marginBottom: 30,
                        width: mobileDevice ? '70%' : '50%'
                      }}
                    />
                    </Grid>
                    </Container>
                  </Box>
                </div>
                </>
                }
              
              </Grid>


         
              {formPage !== 10 ?
              <Box sx={{ mt: 2, display : "flex",flexDirection : "row", justifyContent: "flex-end" }}>

                {viewAssessment ?
                <>
                {formPage !== 1 ?
                <Button
                  color="primary"
                  sx={{width : 200}}
                  //type="submit"
                  tabindex="1"
                  variant="contained"
                  //onClick={() => setFormPage(formPage !== 1 ? formPage - 1 : formPage)} //working
                  onClick={handlePreviousPage}
                >
                  {t('common:assessment.Previous Page')}
                </Button>
                : <></> }

                <Button
                  color="primary"
                  sx={{width : 200,ml :1}}
                  disabled={isSubmitting}
                  type="reset"
                  tabindex="1"
                  variant="contained"
                  //onClick={() => setFormPage(formPage !== 10 ? formPage + 1 : formPage)}
                  onClick={() => handleNextPage(values,handleSubmit,setFieldValue)} //to calculate score in view assessment.
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {t('common:assessment.Next Page')}
                </Button>
                </>
                :
                <>
                {formPage !== 1 ?
                <Button
                  color="primary"
                  sx={{width : 200}}
                  //disabled={isSubmitting}
                  //type="submit"
                  variant="contained"
                  tabindex="1"
                  // onClick={handleSubmit}
                  //onClick={() => setFormPage(formPage !== 1 ? formPage - 1 : formPage)} //working
                  onClick={handlePreviousPage}
                >
                  {t('common:assessment.Previous Page')}
                </Button>
                : <></> }

                <Button
                  color="primary"
                  sx={{width : 200,ml :1}}
                  
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  tabindex="1"
                  onClick={handleSubmit}
                  // onClick={() => setFormPage(formPage + 1)}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {t('common:assessment.Save and Exit')}
                </Button>

                <Button
                  color="primary"
                  sx={{width : 200,ml :1}}
                  
                  disabled={isSubmitting || checkDomainResponses(values)}
                  //type="reset"
                  variant="contained"
                  tabindex="1"
                  //onClick={handleSubmit}
                  //onClick={() => setFormPage(formPage !== 10 ? formPage + 1 : formPage)}
                  onClick={() => handleNextPage(values,handleSubmit,setFieldValue)}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {formPage === 9 ? t('common:assessment.Submit') : t('common:assessment.Next Page')}
                </Button>
                </>
                }

              </Box> : <></> }

              <Dialog aria-labelledby="simple-dialog-title" open={isOpen} sx={{ backdropFilter: "blur(5px)" }}>
                <DialogTitle id="simple-dialog-title">{t('common:assessment.Change Language')}</DialogTitle>
                <DialogContent>
                  {(loading || questionsLoading) && <CircularProgress 
                              sx={{zIndex : 1000,
                                    position : "absolute",
                                    top : "55%",
                                    left : "45%"}}
                              color="primary" />}
                  {!viewAssessment ? 
                    <DialogContentText id="alert-dialog-description">
                      {!isSaveandExit ? t('common:assessment.Change Assessment Language Text') : t('common:assessment.Change Assessment Language Text Alternative')}
                    </DialogContentText> : <></> }
                  <DialogContentText id="alert-dialog-description">
                    {t('common:assessment.Are you sure you want to change the language')}
                  </DialogContentText>
                </DialogContent>                  
                <DialogActions>
                  <Button onClick={handleLanguageChange} color="primary">
                    {t('common:common.Yes')}
                  </Button>
                  <Button onClick={handleClose} color="primary" autoFocus>
                    {t('common:common.No')}
                  </Button>                              
                </DialogActions>                                          
              </Dialog>

            </Box>
          </Card>
        </LocalizationProvider>
        </Form>
      )}
    </Formik>
    </>
  );
};

export default AddAssessmentForm;

    