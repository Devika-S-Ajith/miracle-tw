import React, { useState, useEffect, useContext, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from "react-router";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Formik, Form, FieldArray, Field, ErrorMessage, useFormikContext,
  // useFormikContext, yupToFormErrors, Field 
} from 'formik';
import {
  Box, Button, Card, Grid, TextField, Switch, Typography,
  //  Input, Divider,
  useTheme, IconButton, CircularProgress, RadioGroup, FormControlLabel, Radio, InputAdornment, makeStyles
} from '@material-ui/core';
// import wait from '../../../../__fakeApi__/Wait';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import InformationCircleIcon from '../../../../assets/icons/InformationCircle';
import APIS from '../../../../common/hooks/UseApiCalls';
import TrashIcon from '../../../../assets/icons/Trash';
import ChevronLeftIcon from '../../../../assets/icons/ChevronLeft';
import { useParams } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';

const useStyles = makeStyles((theme) => ({
  root: {
    color: 'white', // Custom color
    background: '#f37123',
    borderRadius: '5px;',
    '&:hover': {
      color: 'white', // Custom color
      background: '#f37123',
      backgroundImage: 'linear-gradient(rgb(0 0 0/40%) 0 0)',
    },
  },
  isRedFlag: {
    borderRadius: '5px',
    paddingTop: '10px',
    height: '60px',
    '&:hover': {
      border: '1px solid black',
    },
  },
  placeholder: {
    '& span': {
      fontWeight: 'bold',
    },
  },
  error: {
    borderStyle: 'solid',
    color: 'red'
  }
}));


const AddCustomQuestionForm = (props) => {
  const { t } = useTranslation(['common']);
  const { questionId } = useParams();

  const formRef = useRef()
  const classes = useStyles();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState(undefined);

  const location = useLocation()
  const domainId = location?.state && location?.state?.domainId
  const domainName = location?.state && location?.state?.domainName
  const formId = location?.state && location?.state?.formId
  const createForm = location?.state && location?.state?.createForm;
  const {setCurrentQuestionData} = useContext(CommonDataContext);

  const maxCharacterLimit = 350;

  useEffect(() => {
    console.log('questionId', questionId)
    console.log('iscreateForm', createForm)
    if (questionId !== undefined) {
      const fetchQustionDataForEdit = async () => {
        try {
          const response = await APIS.QuestionDetailsForEdit(questionId);
          setQuestion(response?.data?.data);
          console.log('QuestionDetailsForEdit', response?.data?.data);
        } catch (error) {
          console.log('Error fetching data:', error);
        }
      };

      fetchQustionDataForEdit();
    }
  }, [])

  const checkUnique = async (values, questionId) => {
    let checkUniquePayload = {
      "id": questionId !== undefined ? questionId : "",
      "questionText": values.question,
      "HTQuestionDomainId": '1',
      "HTOrganizationId": null,
      "formId": formId
    }
    try {
      const resp = await APIS.CheckIsQuestionUnique(checkUniquePayload)
      return resp;
    } catch (err) {
      console.log("error in api call >>", err)
    }

  }

  const getId = () => {
    return Math.floor(Math.random() * Date.now()).toString()
  }

  return (
    <Formik
      innerRef={formRef}
      initialValues={{
        id: question && question.id || '',
        question: question && question.questionText ? question.questionText : '',
        helper_text: question && question.questionHelpText ? question.questionHelpText : '',
        is_red_flag: question ? (question.isRedFlag ? "true" : "false") : '',
        domain_question_options: [{ "choiceName": "In-crisis", "score": "1" },
        { "choiceName": "Vulnerable", "score": "2" },
        { "choiceName": "Safe", "score": "3" },
        { "choiceName": "Thriving", "score": "4" }],
        checkbox_question_options: question && question?.choiceDetails && question?.choiceDetails.length > 0 ? [...question.choiceDetails] : [],
        option: '',
        submit: null,
      }}
      enableReinitialize={true}
      validationSchema={Yup
        .object()
        .shape({
          option: Yup.string()
            .max(350, t('common:question.Option Text Limit'))
            .when('checkbox_question_options', {
              is: (options) => options && options.length > 0,
              then: Yup.string(),
              otherwise: Yup.string().required(t('common:question.One Option Required')),
            }),
          helper_text: Yup.string().max(350, t('common:question.Helper Text Validation')),
          is_red_flag: Yup.string().required(t('common:question.Please Select An Option')),

          question: Yup.string().max(255).required(t('common:warnings.Question is required')),
          checkbox_question_options: Yup.array().of(
            Yup.object().shape({
              choiceName: Yup.string()
                .required(t('common:question.Please Enter Intervention'))
                .max(350, t('common:question.Option Text Limit')),
              id: Yup.string().max(250),
            })
          ),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {

        setSubmitting(true);
        if (values?.checkbox_question_options?.length <= 0) {
          // setMinOptionError(true)
        } else {
          // setMinOptionError(false)
          setIsLoading(true)
          checkUnique(values, questionId)
            .then(async (res) => {
              if (res && res.data && res.status === 200 && res.data.Message === "Question is unique") {

                let customOptions = [];
                values.checkbox_question_options.map((option) => {
                  let choice = {
                    "choiceName": option.choiceName
                  }
                  customOptions.push(choice)
                })
                //for edit qustion only
                // if(questionId !== undefined)
                // setNavigation(true);

                let payload = {
                  "id": questionId !== undefined ? questionId : "",
                  "questionText": values.question,
                  "questionHelpText": values.helper_text,
                  "isRedFlag": values.is_red_flag === 'true' ? true : false,
                  "HTQuestionDomainId": domainId,
                  "choiceDetails": customOptions.length > 0 ? customOptions : [],
                  "otherLanguageDetails": [],
                  "HTOrganizationId": "",
                }

                console.log('formsubmit', payload, questionId);
                try {
                  // CREATE QUESTION
                  if (questionId === undefined || createForm) {
                    await APIS.CreateQuestion(payload)
                      .then((resp) => {
                        console.log('aaa', resp,questionId)
                        if (resp && resp.data && resp.status === 200 &&
                          resp.data.message === 'Question Added Successfully!') {
                          setStatus({ success: true })
                          setSubmitting(false)
                          let storageItem = resp.data.data;
                          storageItem['OldQuestionId'] = (createForm && questionId !== undefined) ? questionId : null;
                          if(createForm && questionId !== undefined){
                            toast.success(t('common:question.Question Edited Successfully'));
                          }else{
                            toast.success(t('common:question.Question added Successfully'));
                          }
                          localStorage.setItem('newlyAddedQuestion', JSON.stringify(storageItem))
                          navigate(-1)
                          setIsLoading(false)
                          resetForm();
                        } else {
                          setStatus({ success: false })
                          setSubmitting(false)
                          setIsLoading(false)
                        }
                      })
                  }
                  else {
                    // UPDATE QUESTION
                    try {
                      await APIS.EditQuestion(payload)
                        .then((resp) => {
                          if (resp && resp.data && resp.status === 200) {
                            setStatus({ success: true })
                            setSubmitting(false)
                            localStorage.setItem('isQuestionIsEdited', true)
                            localStorage.setItem('newlyAddedQuestion', JSON.stringify(resp.data.data))
                            toast.success('Question Edited Successfully');
                            setIsLoading(false)
                            navigate(-1)
                          } else {
                            setStatus({ success: false })
                            setSubmitting(false)
                            toast.error('Error Occured, Try again later.');
                            setIsLoading(false)
                          }
                        })
                    } catch (err) {
                      setStatus({ success: false })
                      setSubmitting(false)
                      console.log("error occured")
                      toast.error(t('common:warnings.Error Occured'));
                      setIsLoading(false)
                    }
                  }

                } catch (err) {
                  setStatus({ success: false })
                  setSubmitting(false)
                  toast.error(t('common:warnings.Error Occured'));
                  setIsLoading(false)
                }
              }
              else {
                toast.error(t('common:warnings.Question already exists'));
                setStatus({ success: false })
                setIsLoading(false)
                setSubmitting(false);
              }
            })
            .catch((err) => {
              toast.error(t('common:warnings.Please try again later'));
              setStatus({ success: false })
              setIsLoading(false)
              setSubmitting(false);
            })
        }


      }}


    >
      {({ errors, handleBlur, handleChange, setFieldValue, handleSubmit, isSubmitting, touched, values }) => (
        <Form
          onSubmit={handleSubmit}
          onChange={handleChange}
        //{...other}
        >
          <Card>
            <Box
              sx={{ m: 2, mt: 3 }}
            >
              {/* <Divider/> */}
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
                  sm={6.3}
                  md={6.3}
                  xs={6.3}
                  lg={6.3}
                >
                  <Box sx={{ display: "flex", flexDirection: 'row' }}>
                    <Typography
                      color="textPrimary"
                      variant="h5"
                      sx={{ ml: -3, spaddingRight: '5px' }}
                    >
                      {domainName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  item
                  sm={5}
                  md={5}
                  xs={5}
                  lg={5}
                  style={{ flexDirection: 'right' }}
                >
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      color="primary"
                      sx={{ width: 100 }}
                      style={{ borderRadius: '5px', height: '50px' }}
                      variant="outlined"
                      onClick={() => navigate(-1)}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button
                      color="primary"
                      sx={{ width: 180, ml: 2 }}
                      style={{ borderRadius: '5px', height: '50px' }}
                      disabled={isSubmitting || values.option !== ''}
                      variant="contained"
                      onClick={handleSubmit}
                    >
                      {questionId ? t('common:question.Update Question') : t('common:question.Add Question')}
                    </Button>
                  </Box>
                </Grid>

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
                      height: 1
                    }}
                  />
                </Grid>

                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                >
                  <Box sx={{ display: "flex", flexDirection: 'row' }}
                    className={classes.isRedFlag}
                    style={{ border: errors.is_red_flag && touched.is_red_flag ? '1px solid red' : '1px solid #c3c4c3' }}
                  >
                    <Grid container spacing={2}>
                      <Grid item sm={5}
                        md={6}
                        xs={4}
                        lg={6}>
                        <Typography
                          color="textPrimary"
                          variant="subtitle2"
                          sx={{ mt: 1, pl: 2 }}
                        >
                          {t('common:question.Is This A Red Flag Question')}
                        </Typography>
                      </Grid>
                      <Grid item sm={7}
                        md={6}
                        xs={8}
                        lg={6}
                      >
                        <Field name="is_red_flag">
                          {() => (
                            <RadioGroup
                              name="is_red_flag"
                              value={`${values.is_red_flag}`}
                              onChange={handleChange}
                              sx={{ float: 'right' }}
                              row
                            >
                              <FormControlLabel
                                value="true"
                                control={<Radio />}
                                label="Yes"
                              />
                              <FormControlLabel
                                value="false"
                                control={<Radio />}
                                label="No"
                              />
                            </RadioGroup>
                          )}
                        </Field>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid
                  item
                  sm={6}
                  md={6}
                  xs={6}
                  lg={6}
                >
                  <Box sx={{ display: "flex", flexDirection: 'row', flex: 1 }}
                    style={{ border: '1px solid #c3c4c3', borderRadius: '5px', paddingTop: '10px', height: '60px' }}
                  >
                    <Grid container spacing={2}>
                      <Grid item sm={3}
                        md={3}
                        xs={3}
                        lg={3}>
                        <Typography
                          color="textPrimary"
                          variant="subtitle2"
                          sx={{ mt: 1, pl: 2 }}
                        >
                          {t('Options')}
                        </Typography>
                      </Grid>
                      <Grid item sm={9}
                        md={9}
                        xs={9}
                        lg={9}
                        style={{ mt: 5, paddingTop: '21px', textAlign: 'right', paddingRight: '10px' }}

                      >
                        {values.domain_question_options.map((option, index) => {
                          return (
                            <Typography
                              style={{ mt: 5, }}
                              color="textPrimary"
                              variant="caption2"
                            >
                              {t(`common:assessment.${option.choiceName}`) + (index + 1 === values.domain_question_options?.length ? "" : " | ")}

                            </Typography>
                          )
                        })}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>


                <ErrorMessage name="is_red_flag">
                  {(errorMsg) =>
                    <Grid item sm={12}
                      md={12}
                      xs={12}
                      lg={12}
                      sx={{ paddingTop: '10px !important' }}
                    >
                      <div style={{ fontSize: '12px', marginLeft: '14px', color: '#f44336' }}>{errorMsg}</div>

                    </Grid>
                  }
                </ErrorMessage>


                <Grid
                  item
                  sm={12}
                  md={12}
                  xs={12}
                  lg={12}
                >
                  <TextField
                    InputProps={{
                      sx: {
                        borderRadius: '5px', background: '#ffffff',
                        position: 'relative',
                        fontSize: 16,

                      }
                    }}
                    error={Boolean(touched.question && errors.question)}
                    fullWidth
                    helperText={touched.question && errors.question}
                    label=''
                    placeholder={t('common:question.Type Your Own Question')}
                    name="question"
                    multiline
                    rows={3}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.question || ''}
                    variant="outlined"
                    required
                  />

                </Grid>

                <Grid
                  item
                  sm={12}
                  md={12}
                  xs={12}
                  lg={12}
                >
                  <Field name="helper_text">
                    {({ field, form }) => (
                      <TextField
                        InputProps={{
                          sx: {
                            borderRadius: '5px', background: '#ffffff',
                            position: 'relative',
                            fontSize: 16,

                          },

                          maxLength: maxCharacterLimit,
                          endAdornment: (
                            <InputAdornment sx={{ marginTop: '70px' }} position="end">
                              {values.helper_text?.length}/{maxCharacterLimit}
                            </InputAdornment>
                          ),
                          shrink: true,
                          FormLabelClasses: {
                            asterisk: classes.placeholder,
                          },


                        }}
                        error={Boolean(touched.helper_text && errors.helper_text)}
                        fullWidth
                        helperText={touched.helper_text && errors.helper_text}
                        label=''
                        placeholder={t('common:question.Helper Text Limit')}
                        name="helper_text"
                        multiline
                        rows={3}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        {...field}
                        // onChange={(event) => checkCharacterLength(event, field)}
                        value={values.helper_text || ''}
                        variant="outlined"
                        required
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item sm={3}
                  md={12}
                  xs={12}
                  lg={12}>
                  <Box sx={{ display: "flex", flexDirection: 'row' }}>
                    <Typography
                      sx={{ paddingRight: '5px' }}
                      color="textPrimary"
                      variant="h6">
                      {t('common:question.Enter Intervention Options')}
                    </Typography>
                    <Typography
                      style={{ paddingTop: '3px', paddingLeft: '2px' }}
                      color="textPrimary"
                      variant="subtitle2">
                      {t('common:question.Intervention Text Limit')}
                    </Typography>
                  </Box>
                </Grid>
                <FieldArray name="checkbox_question_options">
                  {({ push, remove }) => (
                    <Grid style={{ width: '100%', paddingLeft: '24px', paddingTop: '24px' }}>

                      {values.checkbox_question_options &&
                        values.checkbox_question_options?.length > 0 &&
                        values.checkbox_question_options.map((option, index) => {
                          return (

                            <Grid
                              item
                              sm={12}
                              md={12}
                              xs={12}
                              lg={12}
                              key={{ index }}
                            >

                              <TextField
                                InputProps={{
                                  sx: {
                                    borderRadius: '5px', background: '#ffffff',
                                    borderColor: touched[`checkbox_question_options.${index}.choiceName`] && errors[`checkbox_question_options.${index}.choiceName`] ? 'red' : 'black',
                                    position: 'relative',
                                    fontSize: 16,
                                    mb: 2,
                                    height: 70,
                                  },
                                  endAdornment:
                                    <InputAdornment position="end">
                                      <Typography
                                        style={{ paddingTop: '3px', marginRight: '20px' }}
                                        color="textPrimary"
                                        variant="subtitle2">
                                        ({option.choiceName.length})
                                      </Typography>
                                      <IconButton
                                        onClick={() => remove(index)}
                                        className={classes.root}
                                      >
                                        <TrashIcon fontSize="small" />
                                      </IconButton>

                                    </InputAdornment>
                                }}
                                name={`checkbox_question_options[${index}].choiceName`}
                                key={`checkbox_question_options${index}`}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={option.choiceName || ''}
                                variant="outlined"
                                fullWidth
                                // error={Boolean(touched.option?.choiceName && errors.option?.choiceName)}
                                // helperText={touched.option?.choiceName && errors.option?.choiceName}
                              />
                              <ErrorMessage name={`checkbox_question_options.${index}.choiceName`} component="Grid">
                                {(errorMsg) =>
                                  <Grid item sm={12}
                                    md={12}
                                    xs={12}
                                    lg={12}
                                    sx={{ paddingTop: '0px !important' }}
                                  >
                                    <div style={{ fontSize: '12px', marginLeft: '14px', color: '#f44336', }}>{errorMsg}</div>

                                  </Grid>
                                }
                              </ErrorMessage>

                            </Grid>
                          );
                        })}


                      {values.checkbox_question_options?.length < 5 && <Grid
                        item
                        sm={12}
                        md={12}
                        xs={12}
                        lg={12}
                      >
                        <TextField
                          error={Boolean(touched.option && errors.option)}
                          helperText={touched.option && errors.option}
                          InputProps={{
                            sx: {
                              borderRadius: '5px', background: '#ffffff',
                              position: 'relative',
                              fontSize: 16,
                              mb: 2,
                              height: 70,
                            },
                            endAdornment:
                              <InputAdornment position="end">
                                {values.option &&
                                  <IconButton
                                    onClick={() => {
                                      push({ "choiceName": values.option, "id": getId() });
                                      setFieldValue('option', '');
                                    }}
                                    className={classes.root}
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                }
                              </InputAdornment>
                          }}
                          onBlur={handleBlur}
                          name="option"
                          value={values.option || ''}
                          onChange={handleChange}
                          variant="outlined"
                          fullWidth
                          label={t('')}
                          placeholder={t('common:question.Intervention Length', { length: values.checkbox_question_options.length + 1 })}
                        />
                      </Grid>}
                    </Grid>
                  )}
                </FieldArray>
              </Grid>
            </Box>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default AddCustomQuestionForm;
