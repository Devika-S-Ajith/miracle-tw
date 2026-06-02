
import React, {useEffect,useState, useRef, useCallback, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import PropTypes from 'prop-types';
// import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import { 
  Box, 
  Button, 
  Card, 
  Grid, 
  CircularProgress,
  TextField,
  IconButton,
  // useTheme, 
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary 
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import CloseIcon from '@material-ui/icons/Close';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
// import wait from '../../../../__fakeApi__/Wait';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const ManageFormComponent = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const {languageList,languageChange} = useContext(CommonDataContext);
  const currentLanguage = localStorage.getItem('language');
  const [loading,setLoading] = useState(false);
  const [domains,setDomains] = useState([]);
  const [domainQuestions,setDomainQuestions] = useState([]);
  const [selectedDomainValues,setSelectedDomainValues] = useState([]);
  const [selectedDomainQuestions,setSelectedDomainQuestions] = useState([]);
  // const theme = useTheme();
  const { form, redirectPage, ...other } = props;
  const formRef = useRef();

  const getLanguageId = () => {
    const langId = languageList.length && languageList.find(item => item.languageCode == currentLanguage)?.id
    return langId;
  }

  useEffect(()=>{
    if(redirectPage){
      setLoading(true)
      const updatedList = selectedDomainQuestions.map((el, index) => {
        return({
          "HTQuestionId": el.id,
          "order": (index + 1).toString()
        })
      })
      let payload = {
        "formId": "1",
        "questions": updatedList
      }
      APIS.AddFormQuetions(payload).then((res)=>{
        console.log("res >>",res)
        if(res && res.data && res.status === 200){
          if(redirectPage == 'preview'){
            toast.success('Form Saved Successfully');
            console.log("navigating...")
            setLoading(false)
            navigate(`/dashboard/forms/${payload.formId}/preview`, { 
              state: {
                "fetchFormDetails": true
              }
            });
          } else{
            APIS.PublishForm({formId: payload.formId}).then((res)=>{
              console.log("res >>",res)
              if(res && res.data && res.status === 200){
                toast.success('Published Form Successfully');
                console.log("navigating...")
                setLoading(false)
                navigate(`/dashboard/forms`, { 
                  state: {
                    "fetchFormDetails": true
                  }
                });
              }else{
                toast.error('Something went wrong!');
                setLoading(false)
              }
              
            })
          }
        }else{
          toast.error('Something went wrong!');
          setLoading(false)
        }
        
      })
    }
  }, [redirectPage])

  useEffect(() => {
    getDomains()
    getQuestionList()
    getMappedQuestions()
  }, [currentLanguage])

  useEffect(() => {
    getDomains()
    getQuestionList()
    getMappedQuestions()
    console.log("form in manage form >>",form)
    return () => {
      
    }
  }, [])

  const getQuestionList = async() => {
    setLoading(true);
    let getQuestionsPayload = {
      "rowCount": "",
      "pageNumber": "1",
      "questionStatus": "",
      "globalSearchQuery": "",
      "HTQuestionDomainId": "",
      // "HTQuestionTypeId": "",
      "orderByField": [
        // ["HTQuestionTypeId", "DESC"],
        ["isActive", "ASC"]
      ],
      "needFullData" : "true",
      //"HTLanguageId" : currentLanguage === 'en' ? "" : getLanguageId()
    }
    const data = await APIS.ListQuestions(getQuestionsPayload);
    setDomainQuestions(data && data.data && data.data.data)
  }

  const getMappedQuestions = useCallback(async () => {
    setLoading(true)
    const payload = {
      "formId":"1",
      "HTQuestionDomainId" : "",
      //"HTLanguageId" : currentLanguage === 'en' ? "" : getLanguageId()
    }
    try {
      const data = await APIS.GetMappedQuestions(payload);
      setSelectedDomainQuestions(data && data.data && data.data.data)
      console.log(data.data.data)
      setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);

  const getDomains =  useCallback(async () => {
    setLoading(true)
    try {
      const data = await APIS.DomainList();
      const domainList = data.data.data
      setDomains(domainList)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);

  const handleAddDomainQuestion = ()=>{
    if(formRef.current){
      let formValues = formRef.current.values;
      let domainQuestionIndex = formValues.domain_question
      let item = selectedDomainQuestions.find(item=>item.id === domainQuestionIndex)
      if(item == undefined || item == null){
        let newItem = domainQuestions.find(item=>item.id === domainQuestionIndex)
        let currentDomainQuestion = selectedDomainQuestions.filter(item=>item.HTQuestionDomainId === newItem.HTQuestionDomainId)
        let currentDomainQuestionLength = currentDomainQuestion?.length
        let lastOrder = currentDomainQuestion[currentDomainQuestionLength-1].order
        newItem.order = lastOrder
        selectedDomainQuestions.splice(lastOrder, 0, newItem)
        for(var i=lastOrder;i<selectedDomainQuestions.length;i++){
          selectedDomainQuestions[i].order=selectedDomainQuestions[i].order + 1
        }
        setSelectedDomainQuestions(selectedDomainQuestions)
        forceUpdate()
        toast.success('Question added to the list');
      }
      else{
        toast.error('Question already in the list');
      }
    }
  }

  function useForceUpdate(){
    const [value, setValue] = useState(0); 
    return () => setValue(value => value + 1); 
  }
  
  const forceUpdate = useForceUpdate();

  const handleDomainRemove = (index)=>{
    let items = selectedDomainQuestions.filter(item=>item.id !== index)
    const updatedList = items.map((el, index) => {
      el.order = index + 1
      return el
    })
    setSelectedDomainQuestions(updatedList)
  }

  
  
  const handleDomainQuestionValues = (value, id) => {
    const domainValue = selectedDomainValues?.find(item => item.id === id)
    if(!domainValue) {
      const tempArray = [...selectedDomainValues, { id, value}]
      setSelectedDomainValues(tempArray)
    } else{
      const tempArray = selectedDomainValues.map(el => (el.id === id ? {...el, value: value} : el))
      setSelectedDomainValues(tempArray)
    }
  }

  const onDragEnd = (result)=> {
    if (!result.destination) {
      return;
    }
    let options = selectedDomainQuestions;
    const items = options
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedDomainQuestions(items)
  }

  const saveForm = async() => {
    setLoading(true)
    const updatedList = selectedDomainQuestions.map((el, index) => {
      return({
        "HTQuestionId": el.id,
        "order": (index + 1).toString()
      })
    })
    let payload = {
      "formId": "1",
      "questions": updatedList
    }

    try { 
      await APIS.AddFormQuetions(payload).then((res)=>{
        console.log("res >>",res)
        if(res && res.data && res.status === 200){
          toast.success('Questions Added Successfully');
          console.log("navigating...")
          setLoading(false)
          navigate(`/dashboard/forms`, { 
            state: {
              "fetchFormDetails": true
            }
          });
        }else{
          toast.error('Something went wrong!');
          setLoading(false)
        }
        
      })
    }catch(err){
        console.error(err);
        toast.error('Something went wrong!');
        setLoading(false)
    }
  }
  
  return (
    <Formik
    innerRef={formRef}
      initialValues={{
        domain : '',
        domain_question : '',
        intervention_question : '',
        domain_questions : [],
        intervention_questions : [],


      }}
      validationSchema={Yup
        .object()
        .shape({

            domain: Yup
              .string()
              .max(255)
              .required('Domain is required'),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form
          onSubmit={handleSubmit}
          //{...other}
        >
          <Card>
            <Box 
            sx={{ m: 2,mt:3 }}
            >
              <Grid
                container
                spacing={3}
              >
                {loading && 
                  <CircularProgress 
                    sx={{
                      zIndex : 1000,
                      position : "absolute",
                      top : "55%",
                      left : "45%"
                    }}
                    color="primary" 
                  />
                }
                <Grid
                  item
                  md={12}
                  xs={12}
                >

                  { domains && domains?.map((domain)=>{
                      return(
                        <Accordion>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                          >
                            <Typography sx={{ width: '33%', flexShrink: 0 }} variant="h6">
                              {domain.domainName}
                            </Typography>
                            {/* <Typography sx={{ color: 'text.secondary' }}></Typography> */}
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid
                              container
                              spacing={3}
                            >
                              <Grid
                                item
                                md={12}
                                xs={12}
                              >
                                <Typography
                                color="textSecondary"
                                variant="subtitle2">
                                    {t('common:form.Domain Questions')}
                                </Typography>
                              </Grid>

                              <Grid
                                item
                                md={11}
                                xs={12}
                              >
                                <TextField
                                  error={Boolean(touched.domain_question && errors.domain_question)}
                                  fullWidth
                                  helperText={touched.domain_question && errors.domain_question}
                                  // disabled={isSubmitting || values.domain === ''}
                                  label={t('common:form.Domain Question')}
                                  name="domain_question"
                                  onBlur={handleBlur}
                                  onChange={(event) => {handleChange(event); handleDomainQuestionValues(event.target.value, domain.id) }}
                                  //required
                                  select
                                  value={selectedDomainValues.length ? selectedDomainValues?.find(item => item.id === domain.id)?.value : ""}
                                  variant="outlined"
                                >
                                  { domainQuestions && domainQuestions.map((question)=>{
                                        return(
                                          question.HTQuestionDomainId == domain.id &&
                                          <MenuItem key={question.id} value={question.id}>{question.questionText}</MenuItem>
                                        )
                                    })}
                                  </TextField>
                              </Grid>
                              <Grid
                                item
                                md={1}
                                xs={1}
                              >
                              
                                <Box sx={{mt: 1}}>
                                  <Button
                                    color="primary"
                                    disabled={isSubmitting || !selectedDomainValues.length || !selectedDomainValues?.find(item => item.id === domain.id)?.value}
                                    type="button"
                                    //sx={{maxWidth : 130, height: 40}}
                                    sx={{width : '140%', ml:-2}}
                                    variant="contained"
                                    onClick={() => handleAddDomainQuestion()}
                                  >
                                    {t('common:common.Add')}
                                  </Button>
                                </Box>
                              </Grid>

                              <Grid
                                item
                                md={12}
                                xs={12}
                              >
                                <DragDropContext onDragEnd={onDragEnd}>
                                  <FieldArray name="checkbox_question_options">
                                    {()=> (
                                    <>
                                    <Droppable droppableId="OptionList">
                                      {(provided) => (

                                        <Box ref={provided.innerRef}
                                        {...provided.droppableProps}>
                                            { selectedDomainQuestions && 
                                              selectedDomainQuestions.length > 0 &&
                                              selectedDomainQuestions.map((option,index) => {
                                                return(
                                                 option.HTQuestionDomainId  == domain.id &&
                                                  <Draggable 
                                                    key={option.id}
                                                    draggableId={option.id}
                                                    index={index}
                                                  >
                                                      {(provided) =>(
                                                      <div ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="dragFormQuestionDiv"
                                                      >
                                                      <TextField
                                                        sx={{mb: 4 , width : '75%', borderColor: 'blue'}}
                                                        onBlur={handleBlur}
                                                        name={`checkbox_question_options[${index}].choiceName`}
                                                        onChange={handleChange}
                                                        label={`Option ${index+1}`}
                                                        disabled
                                                        value={selectedDomainQuestions[index]?.questionText}
                                                        variant="outlined"
                                                        InputProps={{
                                                          endAdornment: 
                                                          <>
                                                            <IconButton
                                                              color="inherit"
                                                              onClick={()=> handleDomainRemove(option.id)}
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>

                                                            <IconButton color="inherit">
                                                                  <DragIndicatorIcon fontSize="medium"/>
                                                            </IconButton>
                                                          </>
                                                        }}
                                                      />
                                                      </div>
                                                      )}
                                                  </Draggable>
                                                );                   
                                        })}
                                          {provided.placeholder}
                                        </Box>
                                      )}
                                    </Droppable>
                                    </>)}
                                  </FieldArray>
                                </DragDropContext>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      )
                  })}
                </Grid>

                </Grid>

              {domains && domains.length ?
              <Box sx={{ mt: 2 }}>
                <Button
                  color="primary"
                  disabled={isSubmitting || loading}
                  type="button"
                  variant="contained"
                  onClick={() => saveForm()}
                >
                  {t('common:form.save')}
                </Button>
              </Box>
              : <></> }
            </Box>
          </Card>
        </form>
      )}
    </Formik>
  );
};

// ManageFormComponent.propTypes = {
//   user: PropTypes.object.isRequired
// };

export default ManageFormComponent;

