import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  // useParams, 
  useNavigate, useParams
} from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  Container,
  Typography,
  IconButton,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  makeStyles,
  MobileStepper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import APIS from '../../../common/hooks/UseApiCalls'
import useSettings from '../../../common/hooks/UseSettings';
import { useLocation } from "react-router";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@mui/system';

const useStyles = makeStyles((theme) => ({
  progress: {
    width: '100% !important', // Set the desired width for the progress bar
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
      backgroundColor: "#f2f5f7",
  },
  // hide last border
  '&:last-child td, &:last-child th': {
      border: 3,
  },
}));


const PreviewForm = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const location = useLocation();
  // let { id } = useParams();
  const currentLanguage = localStorage.getItem('language');
  const [formName, setFormName] = useState(location?.state && location?.state?.formName);
  const [isSaved, setIsSaved] = useState(location?.state && location?.state?.isSaved);
  const [isCreateForm, setIsCreateForm] = useState(location?.state && location?.state?.isCreateForm);
  const [isPublished, setIsPublished] = useState(location?.state && location?.state?.isPublished);
  const [globalDefault, setGlobalDefault] = useState(location?.state && location?.state?.globalDefault);
  const [selectedDomainQuestions, setSelectedDomainQuestions] = useState(location?.state && location?.state?.selectedDomainQuestions);

  const defaultFormId = location?.state && location?.state?.defaultId
  let { id } = useParams();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const { settings } = useSettings();
  const [formPage, setFormPage] = useState(1)
  const [domains, setDomains] = useState([])
  const [currentDomain, setCurrentDomain] = useState(null)
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [swichPage, setSwichPage] = useState('assessments')
  const { signedinOrgType, signedinUserRole, languageList, currentQuestionData, setCurrentQuestionData } = useContext(CommonDataContext);
  const getLanguageId = () => {
    const langId = languageList.length && languageList.find(item => item.languageCode == currentLanguage)?.id
    return langId;
  }
  const [formQuestions, setFormQuestions] = useState([])
  const [domainAndQuestions, setDomainAndQuestions] = useState([])
  const [newFormQuestions, setNewFormQuestions] = useState([])
  const [primaryChoices, setPrimaryChoices] = useState([])
  const [selectedLanguageId, setSelectedLanguageId] = useState(currentLanguage === 'en' ? "" : getLanguageId());
  const [activeStep, setActiveStep] = useState(1);
  const [buttonText, setButtonText] = useState(t('common:assessment.View Interventions'));
  const targetDivRef = useRef(null);
  const [modalFlagPublish, setModalFlagPublish] = useState(false)
  const [formList, setFormList] = useState([])
  const [currentquestiondata, setcurrentquestiondata] = useState(currentQuestionData)
  const [newFormId, setNewFormId] = useState();

  useEffect(() => {
    if (signedinOrgType !== null && signedinUserRole !== null) {
      if ((signedinUserRole === 'superadmin') || (signedinUserRole === 'admin') || (signedinOrgType == 1 && signedinUserRole === 'caseworker')) {
        // has access
        console.log('selectedDomainQuestions',selectedDomainQuestions,currentquestiondata);

        getFormQuestions(id,selectedLanguageId)
      } else {
        navigate('/Unauthorized');
      }
    }
    return () => {
    }
  }, [signedinOrgType, signedinUserRole]);

  useEffect(() => {
    console.log('aaaaaaa', domainAndQuestions, currentDomain, currentDomainIndex)

    if (currentDomain) {

      const formQuestions = domainAndQuestions.find(element => element.domainId == currentDomain)?.questions.map((item) => {
        item['showHelperText'] = false
        return item;
      });
      setNewFormQuestions(formQuestions);

      console.log('setNewFormQuestions', formQuestions)

    }
  }, [domainAndQuestions, currentDomainIndex, currentDomain]);


  useEffect(() => {
    console.log('newFormId',id)

    setIsLoading(true);
    const HTLanguageId = currentLanguage === 'en' ? "" : getLanguageId()
    if (selectedLanguageId != HTLanguageId) {
      getFormQuestions(id, HTLanguageId)
      setSelectedLanguageId(HTLanguageId)
    }
  }, [currentLanguage])

  useEffect(() => {
    if(newFormId){
      setIsLoading(true);
      const HTLanguageId = currentLanguage === 'en' ? "" : getLanguageId();
        getFormQuestions(newFormId, HTLanguageId)
        setSelectedLanguageId(HTLanguageId)
        getForms(newFormId)
    }
   
  }, [newFormId])
  
  const getForms = useCallback(async (formId) => {
    setIsLoading(true)
    let payload = {
        "formName": "",
        "HTFormId": `${formId}`,
        "limit": 10,
        "page": 1
    }
    try {
        const data = await APIS.GetFormDetails(payload);
        if(!isCreateForm){
            setFormName(data?.data?.formData[0].formName)
        }
        const domainData = data?.data?.formData[0].domainData;
        console.log('getForms',payload,domainData)

        setSelectedDomainQuestions(domainData);
        setcurrentquestiondata(domainData);
        setDomainAndQuestions(domainData);

        setIsLoading(false)
    } catch (err) {
        console.error(err);
        setIsLoading(false)
    }
});

  const getFormQuestions = useCallback(async (formId, HTLanguageId = null) => {
    // setLoading(true)
    document.title = "Forms | Preview | Miracle Foundation"
    try {
      const data = await APIS.FormPreviewQuestions(formId, HTLanguageId);
      console.log('getFormQuestions', formId,data.data.form.HT_formQuestionMappings)

      setFormQuestions(data && data.data && data.data.form.HT_formQuestionMappings);
      setPrimaryChoices(data && data.data && data.data.primaryChoices);
      const domainData = await APIS.DomainList();
      const payload = {
        "langId": HTLanguageId,
        "formName": "",
        "HTFormId": formId,
        "limit": 10,
        "page": 1
      }
      let newPreviewQuestions;
      console.log('domainData',payload, domainData,currentquestiondata);
      if (domainData && domainData.data && domainData.data.data) {
        setCurrentDomainIndex(0);
        setCurrentDomain(domainData.data.data[0].id);
      }
      if (currentquestiondata.length > 0) {
        newPreviewQuestions = currentquestiondata;
        setDomainAndQuestions(currentquestiondata);
        console.log('entrylate', newPreviewQuestions);

        const convertedDomains = domainData.data.data.map((item, index) => {
          const questions = newPreviewQuestions.filter(d => d.domainId === item.id)[0].questions;
          console.log('samplequestions', questions);
          item['questionCount'] = questions?.length > 0 ? questions?.length : 0;
          let totalInterventions = 0;
          for (const data of questions) {
            totalInterventions = totalInterventions + data?.choices.length;
          }
          item['interventionsCount'] = totalInterventions;
          return item;
        })
        console.log('convertedDomains', convertedDomains)

        setDomains(domainData && domainData.data && domainData.data.data);
        setIsLoading(false);

      }
      else {
        newPreviewQuestions = await APIS.NewPreviewQuestions(payload);
        if (newPreviewQuestions.data.formData.length > 0) {
          console.log('currentQuestionData', newPreviewQuestions.data.formData[0].domainData);
          setDomainAndQuestions(newPreviewQuestions.data.formData[0].domainData);
        }

        const convertedDomains = domainData.data.data.map((item, index) => {
          const samplequestions = newPreviewQuestions.data.formData[0].domainData.filter(d => d.domainId === item.id)
          const questions = newPreviewQuestions.data.formData[0].domainData.filter(d => d.domainId === item.id)[0].questions;
          console.log('questioncount', samplequestions);
          item['questionCount'] = questions?.length > 0 ? questions?.length : 0;
          let totalInterventions = 0;
          for (const data of questions) {
            totalInterventions = totalInterventions + data?.choices.length;
          }
          item['interventionsCount'] = totalInterventions;
          return item;
        })
        console.log('convertedDomains', convertedDomains)

        setDomains(domainData && domainData.data && domainData.data.data);
        setIsLoading(false);
      }
      //setLoading(false)
    } catch (err) {
      console.error(err);
      // setLoading(false)
    }
  }, []);

  const scrollToTop = () => {
    console.log('scroll')
    if (targetDivRef.current) {
      targetDivRef.current.scrollIntoView({
        behavior: 'smooth', // You can use 'auto' instead of 'smooth' for instant scrolling
        block: 'start', // Scroll to the start (top) of the element
      });
    }
    }
  const handleChangeDomainQuestions = (value, id) => {
    const questions = formQuestions.map(item => {
      if (item.HT_question.id === id) {
        return { ...item, value }
      } else {
        return item
      }
    })
    setFormQuestions(questions)
  }

  const handleClickPage = (value) => {
    if (value < formPage) {
      setFormPage(value)
    }
  }
  const handleCancelOperation = () => {
    setModalFlagPublish(false)
}

  const PublishForm = async () => {
    console.log('domainData',selectedDomainQuestions,id,newFormId,isSaved);
    setIsLoading(true)
    try {
        if (isSaved) {               
            await APIS.PublishForm({ formId: newFormId ? newFormId : id }).then((res) => {
                //console.log("res >>", finalQuestionList)
                if (res && res.data && res.status === 200) {
                    toast.success('Form Published Successfully');
                    console.log("navigating...")
                    setIsLoading(false)
                    navigate(`/dashboard/forms`, {
                        state: {
                            "fetchFormDetails": true
                        }
                    });
                } else {
                    toast.error('Something went wrong!');
                    setIsLoading(false)
                }

            })
        }else{
             await saveForm()        
             await APIS.PublishForm({ formId: newFormId ? newFormId : id }).then((res) => {                  
                if (res && res.data && res.status === 200) {
                    toast.success('Form Published Successfully');
                    console.log("navigating...")
                    setIsLoading(false)
                    navigate(`/dashboard/forms`, {
                        state: {
                            "fetchFormDetails": true
                        }
                    });
                } else {
                    toast.error('Something went wrong!');
                    setIsLoading(false)
                }

            })
        }

    } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
        setIsLoading(false)
    }
}
  const handlePublishFormModal = () => {
    console.log('handlepublish');
    setModalFlagPublish(true)
}


const handlePreviewFormFromTheTable = (form) => {
  console.log('handlePreviewFormFromTheTable', form)
  setIsSaved(true);
  setFormName(form.formName);
  setIsPublished(false);
  setFormList([]);
  setNewFormQuestions([]);
  setcurrentquestiondata([]);
  setNewFormId(form.HTFormId);
  handleCancelOperation();
}
  const saveForm = async () => {
    console.log('selectedDomainQuestions',selectedDomainQuestions);
    setIsLoading(true)
    let updatedList = selectedDomainQuestions.map(function (val) {
        return val.questions;
    }).reduce(function (pre, cur) {
        return pre.concat(cur);
    }).map(function (e, i) {
        return { HTQuestionId: e.questionId, order: (i + 1).toString() };
    });

    if (formName === '' || formName === undefined) {
      setIsLoading(false);
        return;
    }
    let payload = {
        "formName": `${formName}`,
        "formDescription": `${formName}`,
        "formId": `${newFormId ? newFormId : id}`,
        "removedQuestions": [],
        "questions": updatedList
    }

    try {
        if (isCreateForm) {
            delete payload.formId
            await APIS.CreateForm(payload).then((res) => {
                console.log("res >>", updatedList)
                if (res && res.data && res.status === 200) {
                    toast.success('Form saved Successfully');
                    setIsLoading(false)
                    // getForms(res?.data?.formId)
                } else {
                    if(res?.body?.Error){
                        toast.error(res?.body?.Error);
                    }else{
                        toast.error('Something went wrong!');
                    }
                    setIsLoading(false)
                    
                }
            })
        } else {
            await APIS.UpdateForm(payload).then((res) => {
                console.log("res >>", updatedList)
                if (res && res.data && res.status === 200) {
                    toast.success('Form Updated Successfully');
                    setIsLoading(false)
                } else {
                    if(res?.body?.Error){
                        toast.error(res?.body?.Error);
                    }else{
                        toast.error('Something went wrong!');
                    }
                    setIsLoading(false)
                }

            })
        }

    } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
        setIsLoading(false)
    }
}

const onCloseAfterUnpublish = () => {
  setModalFlagPublish(false)
  navigate(`/dashboard/forms`, {
      state: {
          "fetchFormDetails": true
      }
  });
}

const UpdateFormStatus = async () => {
  setIsLoading(true)

  let payload = {
      "action": "UNPUBLISH",
      "formIdActive": `${defaultFormId}`,
      "formIdInactive": `${id}`
  }

  try {
      await APIS.UpdateFormStatus(payload).then(async(res) => {
          if (res && res.data && res.status === 200) {
              await getFormsList();
              setCurrentQuestionData([])
              console.log("navigating...")
              setIsLoading(false)
          } else {
              toast.error('Something went wrong!');
              setIsLoading(false)
          }

      })
  } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
      setIsLoading(false)
  }
}
 

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
};

const getFormsList = useCallback(async () => {
  setIsLoading(true)
  let payload = {
      "formName": '',
      "HTFormId": "",
      "limit": 10,
      "page": 1
  }
  try {
      const data = await APIS.GetFormDetails(payload);
      console.log('getFormsList', data?.data?.formData)
      setFormList(data?.data?.formData)
     // setIsLoading(false)
  } catch (err) {
      console.error(err);
      setIsLoading(false)
  }
});
  const handleShowHelperText = (index) => {
    const updatedFormQuestions = [...newFormQuestions]; // Create a shallow copy of the state array
    updatedFormQuestions[index].showHelperText = !updatedFormQuestions[index].showHelperText; // Modify the copy

    setNewFormQuestions(updatedFormQuestions);

  }
  const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];


  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt: 2
        }}
        ref={targetDivRef}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>

          <Card>

            <Box
              sx={{ m: 2, mt: 3 }}
            >
              {isLoading && <CircularProgress
                sx={{
                  zIndex: 1000,
                  position: "absolute",
                  top: "55%",
                  left: "45%"
                }}
                color="primary" />}
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  sm={0.7}
                  md={0.7}
                  xs={0.7}
                  lg={0.7}
                >


                  <IconButton
                    color="inherit"
                    onClick={() => navigate(-1)}
                    sx={{ mt: -1.5 }}
                  >
                    <ChevronLeftIcon fontSize="large" />
                  </IconButton>
                </Grid>
                <Grid
                  item
                  sm={5.3}
                  md={5.3}
                  xs={5.3}
                  lg={5.3}
                >

                  <Typography
                    color="textPrimary"
                    variant="h5"
                    sx={{ ml: -2 }}
                  >
                    {t('common:question.Preview FormName', { formName: formName })}
                  </Typography>

                </Grid>

                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                  style={{ flexDirection: 'right' }}
                >
                  <Box display="flex" justifyContent="flex-end">

                    {!isPublished ? <Button
                      color="primary"
                      sx={{ width: 120, ml: 2 }}
                      style={{ borderRadius: '5px', height: '50px' }}
                      variant="contained"
                      onClick={handlePublishFormModal}
                      disabled={isLoading}
                    >
                      {t('common:question.Publish')}
                    </Button> : <Button
                      color="primary"
                      sx={{ width: 120, ml: 2 }}
                      style={{ borderRadius: '5px', height: '50px' }}
                      variant="contained"
                      onClick={handlePublishFormModal}
                      disabled={isLoading || globalDefault}
                    >
                      {t('common:question.Unpublish')}
                    </Button>}
                  </Box>



                </Grid>

                {/* horizontal bar */}

                <Grid
                  item
                  sm={12}
                  md={12}
                  xs={12}
                  lg={12}
                  style={{ paddingTop: '10px' }}
                >
                  <hr
                    style={{
                      color: 'black',
                      backgroundColor: 'black',
                      height: 2,
                    }}
                  />
                </Grid>


                {domains.map((label, index) => (
                  <Grid item
                    md={2.4}
                    xs={2.4}
                    sm={2.4}
                    lg={2.4}
                    sx={{ textAlign: 'center' }}
                  >
                    <Typography
                      color="textPrimary"
                      variant="subtitle1">
                      {t(`${label.domainName}(${swichPage === 'assessments' ? label.questionCount : label.interventionsCount})`)}
                    </Typography>
                  </Grid>

                ))}
                <Grid item
                  md={12}
                  xs={12}
                  sm={12}
                  lg={12}
                >
                  <MobileStepper
                    variant="progress"
                    steps={6}
                    position="static"
                    activeStep={activeStep}
                    sx={{ mt: -3, background: 'white !important' }}
                    classes={{
                      progress: classes.progress,
                    }}
                  />

                </Grid>

                {domains.map((domain, index) => {
                  return (
                    formPage - index !== 1 ? <></> :
                      <>
                        <Grid
                          item
                          md={12}
                          xs={12}
                        >
                          <Typography
                            color="textPrimary"
                            variant="subtitle1">
                            {t('common:question.In Domain', { domainName: domain.domainName })}, {t('common:assessment.Consider the impact of important events')}
                          </Typography>
                          <Grid
                            item
                            sm={12}
                            md={12}
                            xs={12}
                            lg={12}
                            style={{ paddingTop: '10px' }}
                          >
                            <hr
                              style={{
                                color: 'textPrimary',
                                backgroundColor: 'textPrimary',
                                height: 2,
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          md={12}
                          xs={12}
                        >
                          {newFormQuestions.map((item, index) => {
                            return (
                              <div key={item.questionId} style={{ marginBottom: 20 }}>
                                {/* <FormLabel style={{ color: item.HT_question.isRedFlag ? 'red' : '' }}>{item.HT_question.isRedFlag ? `*${t('common:assessment.Red Flag')}: ` : ''}{item.HT_question.questionText}</FormLabel> */}
                                <FormLabel style={{ color: 'black' }}> {t('common:question.Question')}: {<Typography sx={{ display: 'inline' }} variant='subtitle1'>{item.questionText}</Typography>}</FormLabel>
                                {
                                  swichPage === 'assessments' &&
                                  <Grid>
                                    <Grid
                                      item
                                      sm={12}
                                      md={12}
                                      xs={12}
                                      lg={12}
                                      sx={{ flexDirection: 'left', mt: 2 }}
                                    >
                                      <Box display="flex" justifyContent="flex-start">
                                        {item.isRedFlag &&
                                          <Button
                                            color="primary"
                                            sx={{ mr: 2, width: 91, mr: item.questionHelpText !== "" ? 2 : 0 }}
                                            style={{ justifyContent: "flex-start", borderRadius: '5px', height: '30px', background: '#CC0000' }}
                                            variant="contained"
                                          >
                                            {t('common:assessment.Red Flag')}
                                          </Button>
                                        }
                                        {
                                          item.questionHelpText !== "" &&
                                          <Button
                                            color="primary"
                                            onClick={() => handleShowHelperText(index)}
                                            sx={{ width: 150 }}
                                            style={{ justifyContent: "flex-start", borderRadius: '5px', height: '30px', background: '#778791' }}
                                            variant="contained"
                                            endIcon={item.showHelperText ? <ExpandLess style={{marginLeft: '12px'}} fontSize="small" /> : <ExpandMore style={{marginLeft: '12px'}} fontSize="small" />}

                                          >
                                            {t('common:question.Helper Text')}
                                          </Button>
                                        }
                                      </Box>



                                    </Grid>
                                    {item.showHelperText &&
                                      <Grid item
                                        sm={12}
                                        md={12}
                                        xs={12}
                                        lg={12}
                                        sx={{ mt: 2 }}>
                                        <FormLabel sx={{ color: 'black', mt: 1, mb: 2 }}>{item.questionHelpText}</FormLabel>

                                      </Grid>
                                    }
                                    <RadioGroup row value={item.value} onChange={(e) => handleChangeDomainQuestions(e.target.value, item.questionId)}>
                                      {primaryChoices?.sort((a, b) => a.id - b.id).map((choice, index) => {
                                        return <FormControlLabel
                                          value={choice.choiceName}
                                          key={index}
                                          name={choice.choiceName}
                                          control={<Radio tabindex={formQuestions.find(el => el.value == choice.choiceName) ? 0 : 1} />}
                                          label={choice.choiceName} />
                                      })}
                                    </RadioGroup>
                                  </Grid>
                                }
                                {
                                  swichPage === 'interventions' && item.choices.length > 0 &&
                                  <Grid>
                                    {item.choices.map((item, index) => {
                                      return (
                                        <Grid sm={12}
                                          md={12}
                                          xs={12}
                                          lg={12}
                                          sx={{ mt: 1 }}>
                                          <FormLabel sx={{ color: 'black', mt: 1, mb: 2 }}>{index + 1}. {item.choiceName}</FormLabel>
                                        </Grid>
                                      );
                                    }
                                    )}
                                  </Grid>
                                }


                                <Grid
                                  item
                                  sm={12}
                                  md={12}
                                  xs={12}
                                  lg={12}
                                  style={{ paddingTop: '10px' }}
                                >
                                  <hr
                                    style={{
                                      color: 'textPrimary',
                                      backgroundColor: 'textPrimary',
                                      height: 1,
                                    }}
                                  />
                                </Grid>
                              </div>
                            );
                          }
                          )}
                        </Grid>
                      </>)
                })
                }

              </Grid>
              <Grid item
                sm={12}
                md={12}
                xs={12}
                lg={12}
                sx={{ mt: 2, display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
                <Grid item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}>
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>

                    <Button
                      sx={{ width: 150, ml: 1 }}
                      type="button"
                      style={{ borderRadius: '5px', borderColor: 'black', height: '50px', color: swichPage === 'assessments' ? 'white' : 'black', background: swichPage === 'assessments' ? '#1D334B' : 'white' }}
                      variant="outlined"
                      onClick={() => {
                        setSwichPage('assessments');
                        setButtonText(t('common:assessment.View Interventions'));
                        scrollToTop();

                      }}
                    >
                      {t('common:common.Assessments')}
                    </Button>


                    <Button
                      color="primary"
                      sx={{ width: 150, ml: 1 }}
                      type="button"
                      style={{ borderRadius: '5px', borderColor: 'black', color: swichPage === 'interventions' ? 'white' : 'black', height: '50px', background: swichPage === 'interventions' ? '#1D334B' : 'white' }}
                      variant="outlined"
                      onClick={() => {
                        setSwichPage('interventions');
                        setButtonText(t('common:assessment.View Assessments'));
                        scrollToTop();

                      }}

                    >
                      {t('common:question.Interventions')}
                    </Button>

                  </Box>
                </Grid>

                <Grid item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}>
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>

                    {formPage !== 1 ?
                      <Button
                        sx={{ width: 150, ml: 1 }}
                        type="button"
                        style={{ borderRadius: '5px', height: '50px', color: '#F37123', borderColor: '#F37123', background: 'white' }}
                        variant="contained"
                        onClick={() => {
                          setActiveStep((prevActiveStep) => prevActiveStep - 1);
                          setFormPage(formPage - 1);
                          console.log('domainssssss', domains, currentDomainIndex);
                          setCurrentDomain(domains[currentDomainIndex - 1].id);
                          setCurrentDomainIndex(currentDomainIndex - 1);
                          scrollToTop();
                        }}
                      >
                        {t('common:assessment.Previous Page')}
                      </Button>
                      : <></>}


                    <Button
                      color="primary"
                      sx={{ width: 150, ml: 1 }}
                      type="button"
                      style={{ borderRadius: '5px', height: '50px', padding: '0px' }}
                      // disabled={formPage < domains.length ? false : true}
                      variant="contained"
                      onClick={() => {
                        if (formPage < domains.length) {
                          setActiveStep((prevActiveStep) => prevActiveStep + 1);
                          setFormPage(formPage + 1);
                          console.log('domainssssss', domains, currentDomainIndex);
                          setCurrentDomain(domains[currentDomainIndex + 1].id);
                          setCurrentDomainIndex(currentDomainIndex + 1);
                          scrollToTop();
                        } else {
                          if (swichPage === 'assessments') {
                            setSwichPage('interventions');
                            setButtonText(t('common:assessment.View Assessments'));
                          } else {
                            setSwichPage('assessments');
                            setButtonText(t('common:assessment.View Interventions'));
                          }
                          setFormPage(1);
                          setActiveStep(1);
                          setCurrentDomain(domains[0].id);
                          setCurrentDomainIndex(0);
                          scrollToTop();
                        }
                      }}
                    >
                      {formPage < domains.length ? t('common:assessment.Next Page') : buttonText}
                    </Button>
                  </Box>
                </Grid>
              </Grid>




            </Box>
          </Card>
        </Container>
        <Dialog fullScreen open={modalFlagPublish} onClose={handleClose} sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "8px",
                        backgroundColor: 'rgba(255,255,255,0.9)'
                    },
                }} style={{ marginRight: '2.5%', marginTop: '6%', marginBottom: '0.5%', marginLeft: '22%', backgroundColor: 'transparent' }}
                    overlayStyle={{ backgroundColor: 'transparent' }}>

                    {formList?.length < 1 ? <DialogTitle style={{ display: 'flex', marginTop: formList?.length > 0 ? '3%' : '12%', justifyContent: 'center', alignItems: 'center' }}>{isCreateForm ? "Publish" : isPublished ? t('common:question.Unpublish') : t('common:question.Publish')} {formName}</DialogTitle>
                        : <DialogTitle style={{ display: 'flex', marginTop: formList?.length > 0 ? '3%' : '12%', justifyContent: 'center', alignItems: 'center' }}>{formName} {t('common:question.Successfully Unpublished')}</DialogTitle>}
                    <DialogContent style={{ display: 'flex', mt: '2', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                        {formList?.length < 1 ? <Typography sx={{ textAlign: 'center', maxWidth: '75%' }}>
                            {isCreateForm ? t('common:question.Form Publish')
                                : isPublished ? t('common:question.Want To Unpublish This Form')+ t('common:question.Form Unpublish')
                                    : t('common:question.Form Publish')}
                        </Typography> : <Typography sx={{ textAlign: 'center', maxWidth: '35%' }}>{t('common:question.Your Form Has Been Unpublished')}</Typography>}
                    </DialogContent>
                    {formList?.length < 1 && <DialogContent sx={{ mt: 2 }} style={{ display: 'flex', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography sx={{ textAlign: 'center', maxWidth: '52%' }}>{isCreateForm ? t('common:question.Want To Publish This Form') : isPublished ? t('common:question.Want To Unpublish This Form') : t('common:question.Want To Publish This Form')}</Typography></DialogContent>}
                    {formList?.length > 0 && <DialogContent sx={{ mt: 2, mb: 2, maxWidth: '40%', ml: '30%' }} style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Table size="small">
                            <TableHead style={{ color: 'white', backgroundColor: '#1D334B' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>
                                        {t('common:form.Form Name')}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ color: 'white' }}
                                    >
                                        {t('common:common.Actions')}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formList && formList.map((form) => {
                                    return (
                                        <StyledTableRow
                                            hover
                                            key={form.id}
                                        >
                                            <TableCell>
                                                <Button
                                                    color="inherit"
                                                    variant="text"  
                                                >
                                                    {form.formName}
                                                </Button>
                                            </TableCell>

                                            <TableCell
                                                align="center"
                                                spacing={1}
                                            >
                                                {signedinUserRole === 'superadmin' || signedinUserRole === 'admin' ? (<Tooltip title={t('common:form.manageForm')}>
                                                    <Button
                                                        color="primary"
                                                        style={{ borderRadius: 4 }}
                                                        variant="contained"
                                                        size='small'
                                                        onClick={() => handlePreviewFormFromTheTable(form)}
                                                    >
                                                        {t('common:question.Preview And Publish')}
                                                    </Button>
                                                </Tooltip>) : <></>}
                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </DialogContent>}
                    {formList?.length < 1 ? <DialogActions style={{ position: 'relative', marginBottom: '15%', justifyContent: 'center', alignItems: 'center' }}>
                        <Button variant='outlined' style={{ borderRadius: 2 }} onClick={handleCancelOperation}>{t('common:question.No Cancel')}</Button>
                        {isCreateForm ? <LoadingButton loading={isLoading} variant='contained' style={{ borderRadius: 2 }} onClick={PublishForm}>{t('common:question.Save Publish')}</LoadingButton> :
                            isPublished ?
                                <><LoadingButton loading={isLoading} variant='contained' style={{ borderRadius: 2 }} onClick={UpdateFormStatus}>{t('common:question.Yes Unpublish')}</LoadingButton>
                                </>
                                :
                                <LoadingButton loading={isLoading} variant='contained' style={{ borderRadius: 2 }} onClick={PublishForm}>{t('common:question.Save Publish')}</LoadingButton>}
                    </DialogActions> :
                        <DialogActions style={{ position: 'relative', marginBottom: '2%', justifyContent: 'center', alignItems: 'center' }}>
                            <Button variant='outlined' style={{ borderRadius: 2 }} onClick={onCloseAfterUnpublish}>{t('common:common.Close')}</Button>
                        </DialogActions>
                    }
        </Dialog>
      </Box>
    </>
  );
};

export default PreviewForm;
