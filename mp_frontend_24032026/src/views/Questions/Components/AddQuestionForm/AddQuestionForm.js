import React,{ useState,useEffect,useContext,useRef } from 'react';
// import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Formik, Form, FieldArray, 
  // useFormikContext, yupToFormErrors, Field 
} from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
// import NumberFormat from 'react-number-format';
import { Box, Button, Card, Grid, TextField, Switch, Typography,
        //  Input, Divider,
         useTheme, IconButton, CircularProgress } from '@material-ui/core';
// import wait from '../../../../__fakeApi__/Wait';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import InformationCircleIcon from '../../../../assets/icons/InformationCircle';
import APIS from '../../../../common/hooks/UseApiCalls'
import CloseIcon from '@material-ui/icons/Close';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import EditIcon from '@material-ui/icons/Edit';
// import AddIcon from '@material-ui/icons/Add';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AddQuestionForm = (props) => {
  const { t } = useTranslation(['common']);
  const formRef = useRef()
  //const optionRef = createRef()
  const navigate = useNavigate();
  const theme = useTheme();
  const [ isRedFlag,setIsRedFlag ] = useState(false);
  const [ isLoading,setIsLoading ] = useState(false);
  const [ isEditing,setIsEditing ] = useState(false);
  const [ navigation,setNavigation ] = useState(false);
  // const [ minOptionError,setMinOptionError ] = useState(false);
  //const { values, submitForm } = useFormikContext();
  const { questionDomainList } = useContext(CommonDataContext);
  //const { organization, ...other } = props;
  
  useEffect(() => {
    //setRedFlagQuestions()
    console.log('questionDomainList', questionDomainList)
    return () => {
      setNavigation(false)
      setIsEditing(false)
      setIsRedFlag(false)
    }
  }, [])

  const onDragEnd = (result)=> {
    if (!result.destination) {
      return;
    }
    if (formRef.current) {
      let options = formRef.current.values.checkbox_question_options;
      const items = options
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      formRef.current.values.checkbox_question_options = items
    }
    
  }


  const checkUnique = async (values)=> {
    let checkUniquePayload = {
      "id":"",
      "questionText":  values.question, 
      "HTQuestionDomainId": values.domain
    }
    try { 
      const resp = await APIS.CheckIsQuestionUnique(checkUniquePayload)
      return resp;
    }catch (err) {
      console.log("error in api call >>",err)
    }

  }
  // const validateOption=(value)=> {
  //   // let error;
  //   // if (value === 'admin') {
  //   //   error = 'Nice try!';
  //   // }
  //   // return error;
  // }

  const getId=()=> {
    return Math.floor(Math.random() * Date.now()).toString()
    }

  const saveOption =(values)=>{
    let options = values.checkbox_question_options
    let index = options.findIndex(option => option.id === values.optionId)
    let newOption = {
      "choiceName" : values.option,
      "choiceNameHindi" : values.option_hindi,
      "choiceNameTamil":values.option_tamil,
      "id" : values.optionId
    }
    values.checkbox_question_options[index] = newOption
    values.option = ''
    values.option_hindi = ''
    values.option_tamil =''
    values.optionId = ''
    setIsEditing(false)
    }

 


  return (
    <Formik
      innerRef={formRef}
      initialValues={{
        domain : '',
        question : '',
        helper_text : '',
        question_hindi : '',
        helper_text_hindi : '',
        question_tamil : '',
        helper_text_tamil : '',
        is_red_flag : false,
        red_flag_question : '',
        domain_question_options : [{ "choiceName": "In-crisis", "score": "1" },
                                   { "choiceName": "Vulnerable", "score": "2" },
                                   { "choiceName": "Safe", "score": "3" },
                                   { "choiceName": "Thriving", "score": "4" } ],
        checkbox_question_options : [],
        option : '',
        option_hindi : '',
        option_tamil:'',
        submit: null,
      }}
      validationSchema={Yup
        .object()
        .shape({
          option : Yup.string().max(255)
          //.required("At least One option must be entered.")
          .when('checkbox_question_options', (checkbox_question_options) => {
                // is: 0,
                // then: Yup.string().required("Option is required")
                if(checkbox_question_options.length <= 0){
                return Yup.string().required("At least one option is required.")
                }
               }),
          optionId : Yup.string().max(255),
          domain : Yup.string().max(255).required(t('common:warnings.Domain is required')),
          question : Yup.string().max(255).required(t('common:warnings.Question is required')),
          checkbox_question_options : Yup.array().of(
            Yup.object().shape({
              choiceName : Yup.string()
                              .max(255).required("At least one option is required"),
              id : Yup.string()
                      .max(255)
            })
          )
          .min(1)
      })}
        onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
          setSubmitting(true);
          if(values.checkbox_question_options.length <=0){
            // setMinOptionError(true)
          }else{
            // setMinOptionError(false)
        setIsLoading(true)
        checkUnique(values)
        .then(async (res)=> {
          console.log(res.data?.Message)
          if( res && res.data && res.status === 200 && res.data.Message === "Question is unique" ){
            //toast.success('Question is Unique');
            //let defaultOptions = values.domain_question_options

            let customOptions = [];
            let customOptionsHindi = [];
            let customOptionsTamil = [];
            values.checkbox_question_options.map((option)=>{
              let choice = {
                "choiceName" : option.choiceName
              }
              customOptions.push(choice)
              let choiceHindi = {
                "choiceName" : option.choiceNameHindi
              }
              customOptionsHindi.push(choiceHindi)
              let choiceTamil = {
                "choiceName" : option.choiceNameTamil
              }     
              customOptionsTamil.push(choiceTamil)
            })
            
            const otherLanguageDetails = [
             { 
                "HTLanguageId": "2",
                "questionText": values.question_hindi, 
                "questionHelpText": values.helper_text_hindi,
                "choiceDetails": customOptionsHindi.length > 0 ? customOptionsHindi : []},
              {
                "HTLanguageId": "3",
                "questionText": values.question_tamil, 
                "questionHelpText": values.helper_text_tamil,
                "choiceDetails": customOptionsTamil.length > 0 ? customOptionsTamil : []
              }
            ]

            let payload = {    
              "questionText": values.question, 
              "questionHelpText": values.helper_text,
              "isRedFlag": isRedFlag,
              "HTQuestionDomainId": values.domain, 
              "choiceDetails": customOptions.length > 0 ? customOptions : [],
              "otherLanguageDetails": otherLanguageDetails || [],
              "webStatus": true
            }
           try {
            await APIS.CreateQuestion(payload)
            .then((resp)=>{
              console.log(resp.data?.message)
              if(resp && resp.data && resp.status === 200 && 
                resp.data?.message === 'Question Added Successfully!'){
                setStatus({ success: true })
                setSubmitting(false)
                toast.success(t('common:question.Question added Successfully'));
                setIsLoading(false)
                setIsRedFlag(false)
                resetForm()
                if(navigation){
                  navigate('/dashboard/questions')
                }
              }else{
                setStatus({ success: false })
                setSubmitting(false)
                setIsLoading(false)
              }
            })
            }catch(err){
              setStatus({ success: false })
              setSubmitting(false)
              toast.error(t('common:warnings.Error Occured'));
              setIsLoading(false)
            }
          } else {
            toast.error(t('common:warnings.Question already exists'));
            setStatus({ success: false })
            setIsLoading(false)
            setSubmitting(false);
           }
        })
        .catch((err)=>{
            toast.error(t('common:warnings.Please try again later'));
            setStatus({ success: false })
            setIsLoading(false)
            setSubmitting(false);
        })
          }


        // setIsLoading(true)
        // checkUnique(values)
        // .then(async (res)=> {
        //   if( res && res.data && res.status === 200 && res.data.Message === "Question is unique" ){
        //     //toast.success('Question is Unique');
        //     //let defaultOptions = values.domain_question_options

        //     let customOptions = [];
        //     values.checkbox_question_options.map((option)=>{
        //       let choice = {
        //         "choiceName" : option.choiceName
        //       }
        //       customOptions.push(choice)
        //     })

        //     let payload = {    
        //       "questionText": values.question, 
        //       "questionHelpText": values.helper_text,
        //       "isRedFlag": isRedFlag,
        //       "HTQuestionDomainId": values.domain, 
        //       "choiceDetails": customOptions.length > 0 ? customOptions : []
        //   }
        //    try {
        //     await APIS.CreateQuestion(payload)
        //     .then((resp)=>{
        //       if(resp && resp.data && resp.status === 200 && 
        //         resp.data.Message === 'Question added Successfully'){
        //         setStatus({ success: true })
        //         setSubmitting(false)
        //         toast.success(t('common:question.Question added Successfully'));
        //         setIsLoading(false)
        //         setIsRedFlag(false)
        //         resetForm()
        //         if(navigation){
        //           navigate('/dashboard/questions')
        //         }
        //       }else{
        //         setStatus({ success: false })
        //         setSubmitting(false)
        //         setIsLoading(false)
        //       }
        //     })
        //     }catch(err){
        //       setStatus({ success: false })
        //       setSubmitting(false)
        //       toast.error(t('common:warnings.Error Occured'));
        //       setIsLoading(false)
        //     }
        //   } else {
        //     toast.error(t('common:warnings.Question already exists'));
        //     setStatus({ success: false })
        //     setIsLoading(false)
        //     setSubmitting(false);
        //    }
        // })
        // .catch((err)=>{
        //     toast.error(t('common:warnings.Please try again later'));
        //     setStatus({ success: false })
        //     setIsLoading(false)
        //     setSubmitting(false);
        // })

    
      }}

    >
      {({ errors, handleBlur, handleChange, setFieldValue, handleSubmit, isSubmitting, touched, values }) => (
        <Form
          onSubmit={handleSubmit}
          //{...other}
        >
          <Card>
            <Box 
            sx={{ m: 2,mt:3 }}
            >
            {/* <Divider/> */}
            {isLoading && <CircularProgress 
                            sx={{zIndex : 1000,
                                  position : "absolute",
                                  top : "55%",
                                  left : "45%"}}
                            color="primary" />}
              <Grid
                container
                spacing={3}
              >
                
             <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                >
                  
                  <TextField
                    error={Boolean(touched.domain && errors.domain)}
                    fullWidth
                    helperText={touched.domain && errors.domain}
                    label={t('common:question.Domain')}
                    name="domain"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.domain || ''}
                    variant="outlined"
                    required
                    select
                  >
                  { questionDomainList && questionDomainList.length > 0 && questionDomainList.map((domain)=>{
                     return(
                      <MenuItem key={domain.id} 
                        value={domain.id}>
                        {domain.domainName}
                      </MenuItem>
                      );
                   })
                    }
                    </TextField>
                </Grid> 

                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                ></Grid>


                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                >
                  <TextField
                    error={Boolean(touched.question && errors.question)}
                    fullWidth
                    helperText={touched.question && errors.question}
                    label={t('common:question.Question')}
                    name="question"
                    multiline
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.question || ''}
                    variant="outlined"
                    required
                  />
                  
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.helper_text && errors.helper_text)}
                    fullWidth
                    helperText={touched.helper_text && errors.helper_text}
                    label={t('common:question.Helper Text')}
                    name="helper_text"
                    multiline
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.helper_text || ''}
                    variant="outlined"
                  />
                  
                </Grid>

                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                >
                  <TextField
                    error={Boolean(touched.question_hindi && errors.question_hindi)}
                    fullWidth
                    helperText={touched.question_hindi && errors.question_hindi}
                    label={t('common:question.Question in Hindi')}
                    name="question_hindi"
                    multiline
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.question_hindi || ''}
                    variant="outlined"
                    required
                  />
                  
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.helper_text_hindi && errors.helper_text_hindi)}
                    fullWidth
                    helperText={touched.helper_text_hindi && errors.helper_text_hindi}
                    label={t('common:question.Helper Text in Hindi')}
                    name="helper_text_hindi"
                    multiline
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.helper_text_hindi || ''}
                    variant="outlined"
                  />
                  
                </Grid>

                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                >
                  <TextField
                    error={Boolean(touched.question_tamil && errors.question_tamil)}
                    fullWidth
                    helperText={touched.question_tamil && errors.question_tamil}
                    label={t('common:question.Question in Tamil')}
                    name="question_tamil"
                    multiline
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.question_tamil || ''}
                    variant="outlined"
                    required
                  />
                  
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.helper_text_tamil && errors.helper_text_tamil)}
                    fullWidth
                    helperText={touched.helper_text_tamil && errors.helper_text_tamil}
                    label={t('common:question.Helper Text in Tamil')}
                    name="helper_text_tamil"
                    multiline
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.helper_text_tamil || ''}
                    variant="outlined"
                  />
                  
                </Grid>


               
                <Grid
                  item
                  sm={2}
                  md={2}
                  xs={2}
                  lg={2}
                >
                   <Typography
                    color="textPrimary"
                    variant="subtitle2"
                    sx={{mt : 1}}
                    //align="right"
                    >
                    {t('common:question.Is Redflag')}
                  </Typography>
                </Grid>

                <Grid
                  item
                  sm={4}
                  md={4}
                  xs={4}
                  lg={4}
                  sx={{flexDirection : 'row'}}
                >
                        <Box sx={{display : "flex",flex :1,ml : "40%"}}>
                          <Box>
                            <Switch size="small" color="orange" 
                            checked={isRedFlag}
                            name="is_red_flag"
                            //color="primary"
                            //sx={{ml : "50%"}}
                            onChange={()=>setIsRedFlag(!isRedFlag)}/>   
                          </Box>
                          <Box>
                            <Typography
                              color={isRedFlag ? "#43AA8B" : "#F94144"}
                              variant="h6"
                              sx={{ml : 1 }}
                            >
                              {isRedFlag ? `${t('common:common.Yes')}`:`${t('common:common.No')}`}
                            </Typography>
                          </Box>  
                        </Box>
                </Grid>

                <Grid
                  item
                  sm={2}
                  md={2}
                  xs={2}
                  lg={2}
                >
                   <Typography
                    color="textPrimary"
                    variant="subtitle2"
                    sx={{ mt : 1 }}
                    //align="right"
                    >
                    {t('common:common.Options')}
                  </Typography>
                </Grid>

                <Grid
                  item
                  sm={4}
                  md={4}
                  xs={4}
                  lg={4}
                  //sx={{flexDirection : 'row'}}
                >

                  { values.domain_question_options.map((option,index) => {
                       return (
                        <Typography
                        sx={{mt : 5 }}
                        //sx={{mt: index > 0 ? 4 : 0 , width : '49%'}}
                        //onBlur={handleBlur}
                        //name={`domain_question_options[${index}].choiceName`}
                        color="textPrimary"
                        variant="caption2"
                        >
                          {t(`common:assessment.${option.choiceName}`) + (index+1 === values.domain_question_options.length ? "" : ", ")}
                          
                          </Typography>
                        )
                      })}
                </Grid>


               
              <Grid
                item
                sm={12}
                md={12}
                xs={12}
                lg={12}
                >
                    <Typography
                    color="textPrimary"
                    variant="subtitle2">
                        {t('common:common.Intervention Options')}
                    </Typography>
                    </Grid>
                 
                <Grid
                  item
                  sm={12}
                  md={12}
                  xs={12}
                  lg={12}
                >
                
              <DragDropContext onDragEnd={onDragEnd}>

              <FieldArray name="checkbox_question_options">
                  {({push,remove})=> (
                    <>
                <TextField
                //innerRef={optionRef}
                //autoFocus={values.domain !== '' && values.question !== ''}
                error={Boolean(touched.option && errors.option)}
                helperText={touched.option && errors.option}
                sx={{mb : 4, mr: 1, width : '25%'}}
                onBlur={handleBlur}
                name="option"
                value={values.option || ''}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                label={t('common:common.Enter Option')}
                required
                //focused={isEditing}
                />
                <TextField
                //innerRef={optionRef}
                //autoFocus={values.domain !== '' && values.question !== ''}
                error={Boolean(touched.option_hindi && errors.option_hindi)}
                helperText={touched.option_hindi && errors.option_hindi}
                sx={{mb : 4, mr: 1, width : '25%'}}
                onBlur={handleBlur}
                name="option_hindi"
                value={values.option_hindi || ''}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                label={t('common:common.Enter Option in Hindi')}
                required
                //focused={isEditing}
                />
                <TextField
                //innerRef={optionRef}
                //autoFocus={values.domain !== '' && values.question !== ''}
                error={Boolean(touched.option_tamil && errors.option_tamil)}
                helperText={touched.option_tamil && errors.option_tamil}
                sx={{mb : 4, mr: 1, width : '25%'}}
                onBlur={handleBlur}
                name="option_tamil"
                value={values.option_tamil || ''}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                label={t('common:common.Enter Option in Tamil')}
                required
                //focused={isEditing}
                />

                                    { values.domain !== '' && values.question !== ''  && 
                                      <>
                                      { !isEditing && <Button
                                        color="primary"
                                        sx={{width : 80,mt : 1 , ml : 3}}
                                        //align="right"
                                        disabled={values.option === ''}
                                        variant="contained"
                                        onClick={()=>{
                                          push({"choiceName" : values.option, "choiceNameHindi" : values.option_hindi,"choiceNameTamil" : values.option_tamil, "id" : getId()})
                                          setFieldValue('option','')
                                          setFieldValue('option_hindi','')
                                          setFieldValue('option_tamil','')
                                        }}
                                      >
                                        {t('common:common.Add')}
                                      </Button>}
                                      { isEditing &&
                                        <Button
                                        color="primary"
                                        sx={{width : 80,mt : 1 , ml : 3}}
                                        //align="right"
                                        disabled={values.option === ''}
                                        variant="contained"
                                        onClick={()=>{
                                          saveOption(values)
                                        }}
                                      >
                                        {t('common:common.Save')}
                                      </Button>
                                      }
                                      
                                     { values.option !== '' && <Button
                                      color="primary"
                                      sx={{width : 80,mt : 1 , ml : 3}}
                                      //align="right"
                                      // disabled={values.domain === '' || 
                                      //           values.question === '' || values.checkbox_question_options.length < 2}
                                      variant="contained"
                                      onClick={()=>{
                                        setFieldValue('option','')
                                        setFieldValue('option_hindi','')
                                        setFieldValue('option_tamil','')
                                      }}
                                    >
                                      {t('common:common.Cancel')}
                                    </Button>}
                                    </>
                                      }



                <Droppable droppableId="OptionList">
                {(provided) => (

                  <Box ref={provided.innerRef} 
                  {...provided.droppableProps}>
                      { values.checkbox_question_options && 
                        values.checkbox_question_options.length > 0 &&
                        values.checkbox_question_options.map((option,index) => {
                          return(
                                  <Draggable 
                                  key={option.id}
                                  draggableId={option.id}
                                  index={index}>
                                      {(provided) =>(
                                      <div ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="dragFormQuestionDiv"
                                      >
                                      <TextField
                                      //autoFocus={values.domain !== '' && values.question !== ''}
                                      //error={Boolean(touched.checkbox_question_options && errors.checkbox_question_options)}
                                      //helperText={touched.checkbox_question_options && errors.checkbox_question_options}
                                      sx={{mt: index > 0 ? 4 : 0 , mr: 1, width : '25%'}}
                                      //sx={{ width : '60%'}}
                                      onBlur={handleBlur}
                                      name={`checkbox_question_options[${index}].choiceName`}
                                      onChange={handleChange}
                                      label={`Option ${index+1}`}
                                      disabled={true}
                                      value={option.choiceName || ''}
                                      variant="outlined"
                                      // InputProps={{
                                      //   endAdornment: 
                                      //   <>
                                      //   <IconButton
                                      //   color="inherit"
                                      //   onClick={()=> {
                                      //     setIsEditing(!isEditing)
                                      //     setFieldValue('option',option.choiceName)
                                      //     setFieldValue('optionId',option.id)
                                      //   }}>
                                      //       <EditIcon />
                                      //   </IconButton>

                                      //   <IconButton
                                      //   color="inherit"
                                      //   onClick={()=> remove(index)}>
                                      //       <CloseIcon />
                                      //   </IconButton>

                                      //   <IconButton color="inherit">
                                      //         <DragIndicatorIcon fontSize="medium"/>
                                      //   </IconButton>
                                      //   </>
                                      // }}
                                      />
                                      <TextField
                                      //autoFocus={values.domain !== '' && values.question !== ''}
                                      //error={Boolean(touched.checkbox_question_options && errors.checkbox_question_options)}
                                      //helperText={touched.checkbox_question_options && errors.checkbox_question_options}
                                      sx={{mt: index > 0 ? 4 : 0 ,mr: 1, width : '25%'}}
                                      //sx={{ width : '60%'}}
                                      onBlur={handleBlur}
                                      name={`checkbox_question_options[${index}].choiceNameHindi`}
                                      onChange={handleChange}
                                      label={`Option ${index+1}`}
                                      disabled={true}
                                      value={option.choiceNameHindi || ''}
                                      variant="outlined"
                                      // InputProps={{
                                      //   endAdornment: 
                                      //   <>
                                      //   <IconButton
                                      //   color="inherit"
                                      //   onClick={()=> {
                                      //     setIsEditing(!isEditing)
                                      //     setFieldValue('option',option.choiceName)
                                      //     setFieldValue('option_hindi',option.choiceNameHindi)
                                      //     setFieldValue('option_tamil',option.choiceNameTamil)
                                      //     setFieldValue('optionId',option.id)
                                      //   }}>
                                      //       <EditIcon />
                                      //   </IconButton>

                                      //   <IconButton
                                      //   color="inherit"
                                      //   onClick={()=> remove(index)}>
                                      //       <CloseIcon />
                                      //   </IconButton>

                                      //   <IconButton color="inherit">
                                      //         <DragIndicatorIcon fontSize="medium"/>
                                      //   </IconButton>
                                      //   </>
                                      // }}
                                      />
                                     <TextField                                  
                                      sx={{mt: index > 0 ? 4 : 0 , width : '25%'}}                                   
                                      onBlur={handleBlur}
                                      name={`checkbox_question_options[${index}].choiceNameTamil`}
                                      onChange={handleChange}
                                      label={`Option ${index+1}`}
                                      disabled={true}
                                      value={option.choiceNameTamil || ''}
                                      variant="outlined"
                                      InputProps={{
                                        endAdornment: 
                                        <>
                                        <IconButton
                                        color="inherit"
                                        onClick={()=> {
                                          setIsEditing(!isEditing)
                                          setFieldValue('option',option.choiceName)
                                          setFieldValue('option_hindi',option.choiceNameHindi)
                                          setFieldValue('option_tamil',option.choiceNameTamil)
                                          setFieldValue('optionId',option.id)
                                        }}>
                                            <EditIcon />
                                        </IconButton>

                                        <IconButton
                                        color="inherit"
                                        onClick={()=> remove(index)}>
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
              </>
                    )}
                   
              </FieldArray>
              
            </DragDropContext>

                </Grid> 



                </Grid>


         
              <Box sx={{ mt: 4,display : "flex",flexDirection : "row" }}>

                <Button
                  color="primary"
                  sx={{width : 200}}
                  disabled={isSubmitting || values.option !== ''}
                  //type="submit"
                  variant="contained"
                  onClick={()=>{
                                  setNavigation(true);
                                  handleSubmit()
                                }
                            }
                >
                  {t('common:question.Save Question')}
                </Button>

                <Button
                  color="primary"
                  sx={{width : 200,ml :21}}
                  disabled={isSubmitting || values.option !== ''}
                  //type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  {t('common:question.Save and Add')}
                </Button>


                <Button
                  color="primary"
                  sx={{width : 200,ml :21}}
                  
                  disabled={isSubmitting}
                  type="reset"
                  variant="contained"
                  //onClick={handleSubmit}
                  style={{backgroundColor : theme.palette.button.primary}}
                >
                  {t('common:common.Reset')}
                </Button>

              </Box>


            </Box>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default AddQuestionForm;
