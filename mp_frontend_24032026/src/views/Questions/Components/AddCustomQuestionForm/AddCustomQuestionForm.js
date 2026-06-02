import React, { useState, useEffect, useContext, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Formik,
  Form,
  FieldArray,
  Field,
  ErrorMessage,
  useFormikContext,
  // useFormikContext, yupToFormErrors, Field
} from "formik";
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import TrashIcon from "../../../../assets/icons/Trash";
import ChevronLeftIcon from "../../../../assets/icons/ChevronLeft";
import { useParams } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import BodyText from "../../../../components/BodyText/BodyText";
import SmallText from "../../../../components/SmallText/SmallText";
import SubHeading from "../../../../components/SubHeading";

const useStyles = makeStyles((theme) => ({
  root: {
    color: "white", // Custom color
    background: "#f37123",
    borderRadius: "5px;",
    "&:hover": {
      color: "white", // Custom color
      background: "#f37123",
      backgroundImage: "linear-gradient(rgb(0 0 0/40%) 0 0)",
    },
  },
  isRedFlag: {
    borderRadius: "5px",
    paddingTop: "10px",
    height: "60px",
    "&:hover": {
      border: "1px solid black",
    },
  },
  placeholder: {
    "& span": {
      fontWeight: "bold",
    },
  },
  error: {
    borderStyle: "solid",
    color: "red",
  },
}));

const AddCustomQuestionForm = (props) => {
  const { t } = useTranslation(["common"]);
  const { questionId } = useParams();

  const formRef = useRef();
  const classes = useStyles();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState(undefined);

  const location = useLocation();
  const domainId = location?.state && location?.state?.domainId;
  const domainName = location?.state && location?.state?.domainName;
  const formId = location?.state && location?.state?.formId;
  const createForm = location?.state && location?.state?.createForm;
  const { setCurrentQuestionData } = useContext(CommonDataContext);
  const [loading, setLoading] = useState(false);

  const maxCharacterLimit = 350;

  useEffect(() => {
    if (questionId !== undefined) {
      const fetchQustionDataForEdit = async () => {
        setLoading(true);
        try {
          const response = await APIS.QuestionDetailsForEdit(questionId);
          setQuestion(response?.data?.data);
        } catch (error) {
          console.log("Error fetching data:", error);
        }
        setLoading(false);
      };

      fetchQustionDataForEdit();
    }
  }, []);

  const checkUnique = async (values, questionId, TWQuestionDomainId) => {
    let checkUniquePayload = {
      id: questionId !== undefined ? questionId : "",
      questionText: values.question,
      TWQuestionDomainId: TWQuestionDomainId,
      HTOrganizationId: null,
      formId: formId,
    };
    try {
      const resp = await APIS.CheckIsQuestionUnique(checkUniquePayload);
      return resp;
    } catch (err) {
      console.log("error in api call >>", err);
    }
  };

  const getId = () => {
    return Math.floor(Math.random() * Date.now()).toString();
  };

  return (
    <Formik
      innerRef={formRef}
      initialValues={{
        id: (question && question.id) || "",
        question:
          question && question.questionText ? question.questionText : "",
        helper_text:
          question && question.questionHelpText
            ? question.questionHelpText
            : "",
        is_red_flag: question ? (question.isRedFlag ? "true" : "false") : "",
        domain_question_options: [
          { choiceName: "In-crisis", score: "1" },
          { choiceName: "Vulnerable", score: "2" },
          { choiceName: "Safe", score: "3" },
          { choiceName: "Thriving", score: "4" },
        ],
        checkbox_question_options:
          question &&
          question?.choiceDetails &&
          question?.choiceDetails.length > 0
            ? [...question.choiceDetails]
            : [],
        option: "",
        in_crisis_helper_text: question?.choiceHelperText?.["1"] || "",
        vulnerable_helper_text: question?.choiceHelperText?.["2"] || "",
        safe_helper_text: question?.choiceHelperText?.["3"] || "",
        thriving_helper_text: question?.choiceHelperText?.["4"] || "",
        submit: null,
      }}
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        option: Yup.string()
          .max(350, t("common:question.Option Text Limit"))
          .when("checkbox_question_options", {
            is: (options) => options && options.length > 0,
            then: Yup.string(),
            otherwise: Yup.string().required(
              t("common:question.One Option Required")
            ),
          }),
        helper_text: Yup.string().max(
          350,
          t("common:question.Helper Text Validation")
        ),
        in_crisis_helper_text: Yup.string().max(
          350,
          t("common:question.Helper Text Validation")
        ),
        vulnerable_helper_text: Yup.string().max(
          350,
          t("common:question.Helper Text Validation")
        ),
        safe_helper_text: Yup.string().max(
          350,
          t("common:question.Helper Text Validation")
        ),
        thriving_helper_text: Yup.string().max(
          350,
          t("common:question.Helper Text Validation")
        ),
        is_red_flag: Yup.string().required(
          t("common:question.Please Select An Option")
        ),

        question: Yup.string()
          .max(255)
          .required(t("common:warnings.Factor is required", "Factor is required"))
          .test(
            "not-empty",
            t("common:warnings.Factor is required", "Factor is required"),
            value => !!value && value.trim().length > 0
          ),
        checkbox_question_options: Yup.array().of(
          Yup.object().shape({
            choiceName: Yup.string()
              .required(t("common:question.Please Enter Intervention"))
              .test(
                "not-empty",
                t("common:question.Please Enter Intervention"),
                value => !!value && value.trim().length > 0
              )
              .max(350, t("common:question.Option Text Limit")),
            id: Yup.string().max(250),
          })
        ),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        setSubmitting(true);
        if (values?.checkbox_question_options?.length <= 0) {
          // setMinOptionError(true)
        } else {
          // setMinOptionError(false)
          setIsLoading(true);
          checkUnique(values, questionId, question?.TWQuestionDomainId)
            .then(async (res) => {
              if (
                res &&
                res.data &&
                res.status === 200 &&
                res.data.Message === "Question is unique"
              ) {
                let customOptions = [];
                values.checkbox_question_options.map((option) => {
                  let choice = {
                    choiceName: option.choiceName,
                  };
                  customOptions.push(choice);
                });
                //for edit qustion only
                // if(questionId !== undefined)
                // setNavigation(true);

                let payload = {
                  id: questionId !== undefined ? questionId : "",
                  questionText: values.question,
                  questionHelpText: values.helper_text?.trim() || "",
                  isRedFlag: values.is_red_flag === "true" ? true : false,
                  HTQuestionDomainId: domainId,
                  choiceDetails: customOptions.length > 0 ? customOptions : [],
                  otherLanguageDetails: [],
                  HTOrganizationId: "",
                  choiceHelperText: {
                    1: values.in_crisis_helper_text?.trim() || "",
                    2: values.vulnerable_helper_text?.trim() || "",
                    3: values.safe_helper_text?.trim() || "",
                    4: values.thriving_helper_text?.trim() || "",
                  },
                };

                try {
                  // CREATE QUESTION
                  if (questionId === undefined || createForm) {
                    await APIS.CreateQuestion(payload).then((resp) => {
                      if (
                        resp &&
                        resp.data &&
                        resp.status === 200 &&
                        resp.data.message === "Question Added Successfully!"
                      ) {
                        setStatus({ success: true });
                        setSubmitting(false);
                        let storageItem = resp.data.data;
                        storageItem["OldQuestionId"] =
                          createForm && questionId !== undefined
                            ? questionId
                            : null;
                        if (createForm && questionId !== undefined) {
                          toast.success(
                            t("common:question.Question Edited Successfully")
                          );
                        } else {
                          toast.success(
                            t("common:question.Question added Successfully")
                          );
                        }
                        localStorage.setItem(
                          "newlyAddedQuestion",
                          JSON.stringify(storageItem)
                        );
                        navigate(-1);
                        setIsLoading(false);
                        resetForm();
                      } else {
                        setStatus({ success: false });
                        setSubmitting(false);
                        setIsLoading(false);
                      }
                    });
                  } else {
                    // UPDATE QUESTION
                    try {
                      await APIS.EditQuestion(payload).then((resp) => {
                        if (resp && resp.data && resp.status === 200) {
                          setStatus({ success: true });
                          setSubmitting(false);
                          localStorage.setItem("isQuestionIsEdited", true);
                          localStorage.setItem(
                            "newlyAddedQuestion",
                            JSON.stringify(resp.data.data)
                          );
                          toast.success("Question Edited Successfully");
                          setIsLoading(false);
                          navigate(-1);
                        } else {
                          setStatus({ success: false });
                          setSubmitting(false);
                          toast.error("Error Occured, Try again later.");
                          setIsLoading(false);
                        }
                      });
                    } catch (err) {
                      setStatus({ success: false });
                      setSubmitting(false);
                      console.log("error occured");
                      toast.error(t("common:warnings.Error Occured"));
                      setIsLoading(false);
                    }
                  }
                } catch (err) {
                  setStatus({ success: false });
                  setSubmitting(false);
                  toast.error(t("common:warnings.Error Occured"));
                  setIsLoading(false);
                }
              } else {
                toast.error(t("common:warnings.Question already exists"));
                setStatus({ success: false });
                setIsLoading(false);
                setSubmitting(false);
              }
            })
            .catch((err) => {
              toast.error(t("common:warnings.Please try again later"));
              setStatus({ success: false });
              setIsLoading(false);
              setSubmitting(false);
            });
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        setFieldValue,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <Form
          onSubmit={handleSubmit}
          onChange={handleChange}
          //{...other}
        >
          {loading && (
            <CircularProgress
              sx={{
                zIndex: 1000,
                position: "absolute",
                top: "55%",
                left: "45%",
              }}
              color="primary"
            />
          )}
          <Card>
            <Box sx={{ m: 2, mt: 3 }}>
              {/* <Divider/> */}
              {isLoading && (
                <CircularProgress
                  sx={{
                    zIndex: 1000,
                    position: "absolute",
                    top: "55%",
                    left: "45%",
                  }}
                  color="primary"
                />
              )}
              <Grid container spacing={3}>
                <Grid item sm={0.7} md={0.7} xs={0.7} lg={0.7}>
                  <IconButton
                    color="inherit"
                    onClick={() => navigate(-1)}
                    sx={{ mt: -1.5 }}
                  >
                    <ChevronLeftIcon fontSize="large" />
                  </IconButton>
                </Grid>
                <Grid item sm={6.3} md={6.3} xs={6.3} lg={6.3}>
                  <Box sx={{ display: "flex", flexDirection: "row" }}>
                    <Typography
                      color="textPrimary"
                      variant="h5"
                      sx={{ ml: -3, spaddingRight: "5px" }}
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
                  style={{ flexDirection: "right" }}
                >
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      color="primary"
                      // sx={{ width: 100 }}
                      style={{ borderRadius: "5px", height: "50px" }}
                      variant="outlined"
                      onClick={() => navigate(-1)}
                    >
                      {t("common:common.Cancel")}
                    </Button>
                    <Button
                      color="primary"
                      sx={{ ml: 2 }}
                      style={{ borderRadius: "5px", height: "50px" }}
                      disabled={isSubmitting || values.option !== ""}
                      variant="contained"
                      onClick={handleSubmit}
                    >
                      {t("common:common.Save", "Save")}
                    </Button>
                  </Box>
                </Grid>

                <Grid
                  item
                  sm={12}
                  md={12}
                  xs={12}
                  lg={12}
                  style={{ paddingTop: "10px" }}
                >
                  <hr
                    style={{
                      color: "black",
                      backgroundColor: "black",
                      height: 1,
                    }}
                  />
                </Grid>

                <Grid item sm={12} md={12} xs={12} lg={6}>
                  <FormControl>
                    <FormLabel id="is_red_flag_label">
                      <BodyText value="Is this a red flag factor? *" />
                      <SmallText
                        value="A red flag factor indicates a situation where someone’s physical or mental health and well being are in immediate and imminent danger"
                        sx={{
                          my: 1,
                          fontWeight: 500,
                          fontStyle: "italic",
                          color: "#1D334B",
                        }}
                      />
                    </FormLabel>
                    <RadioGroup
                      name="is_red_flag"
                      value={`${values.is_red_flag}`}
                      onChange={handleChange}
                      sx={{ float: "right" }}
                      row
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio />}
                        label={t("common:common.Yes")}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio />}
                        label={t("common:common.No")}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <ErrorMessage name="is_red_flag">
                  {(errorMsg) => (
                    <Grid
                      item
                      sm={12}
                      md={12}
                      xs={12}
                      lg={12}
                      sx={{ paddingTop: "10px !important" }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          marginLeft: "14px",
                          color: "#f44336",
                        }}
                      >
                        {errorMsg}
                      </div>
                    </Grid>
                  )}
                </ErrorMessage>

                <Grid item sm={12} md={12} xs={12} lg={12}>
                  <Field name="question">
                    {({ field, form }) => (
                      <TextField
                        InputProps={{
                          sx: {
                            borderRadius: "5px",
                            background: "#ffffff",
                            position: "relative",
                            fontSize: 16,
                          },

                          maxLength: maxCharacterLimit,
                        }}
                        error={Boolean(touched.question && errors.question)}
                        fullWidth
                        helperText={
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <SmallText
                              value={touched.question && errors.question}
                              color="#f44336"
                            />
                            <SmallText
                              value={`${values.question?.length}/${maxCharacterLimit}`}
                              sx={{ marginLeft: "auto" }}
                            />
                          </Stack>
                        }
                        label="Factor (required)"
                        placeholder={t(
                          "common:question.Type Your Own Question"
                        )}
                        name="question"
                        multiline
                        rows={3}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        {...field}
                        // onChange={(event) => checkCharacterLength(event, field)}
                        value={values.question || ""}
                        variant="outlined"
                        required
                      />
                    )}
                  </Field>
                </Grid>

                <Grid item sm={12} md={12} xs={12} lg={12}>
                  <Field name="helper_text">
                    {({ field, form }) => (
                      <TextField
                        InputProps={{
                          sx: {
                            borderRadius: "5px",
                            background: "#ffffff",
                            position: "relative",
                            fontSize: 16,
                          },
                          maxLength: maxCharacterLimit,
                        }}
                        error={Boolean(
                          touched.helper_text && errors.helper_text
                        )}
                        fullWidth
                        helperText={
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <SmallText
                              value={touched.helper_text && errors.helper_text}
                              color="#f44336"
                            />
                            <SmallText
                              value={`${values.helper_text?.length}/${maxCharacterLimit}`}
                              sx={{ marginLeft: "auto" }}
                            />
                          </Stack>
                        }
                        label="Helper text (optional)"
                        placeholder={t("common:question.Helper Text Limit")}
                        name="helper_text"
                        multiline
                        rows={3}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        {...field}
                        // onChange={(event) => checkCharacterLength(event, field)}
                        value={values.helper_text || ""}
                        variant="outlined"
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item sm={12} md={12} xs={12} lg={12}>
                  <SubHeading value="Rating option explanations" />

                  <Stack direction="column" spacing={2} mt={2}>
                    <Field name="in_crisis_helper_text">
                      {({ field, form }) => (
                        <>
                        <Stack
                              spacing={1}
                              direction="row"
                              alignItems="center"
                            >
                              <img
                                // key={index}
                                src="/static/icons/inCrisisIcon.png"
                                style={{ width: 20, height: 20 }}
                              />
                              <Typography>In crisis (optional)</Typography>
                            </Stack>
                        <TextField
                          InputProps={{
                            sx: {
                              borderRadius: "5px",
                              background: "#ffffff",
                              position: "relative",
                              fontSize: 16,
                            },

                            maxLength: maxCharacterLimit,
                          }}
                          error={Boolean(
                            touched.in_crisis_helper_text &&
                              errors.in_crisis_helper_text
                          )}
                          fullWidth
                          helperText={
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <SmallText
                                value={
                                  touched.in_crisis_helper_text &&
                                  errors.in_crisis_helper_text
                                }
                                color="#f44336"
                              />
                              <SmallText
                                value={`${values.in_crisis_helper_text?.length}/${maxCharacterLimit}`}
                                sx={{ marginLeft: "auto" }}
                              />
                            </Stack>
                          }
                          placeholder={t("common:question.Helper Text Limit")}
                          name="in_crisis_helper_text"
                          multiline
                          rows={3}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          {...field}
                          // onChange={(event) => checkCharacterLength(event, field)}
                          value={values.in_crisis_helper_text || ""}
                          variant="outlined"
                        />
                        </>
                      )}
                    </Field>
                    <Field name="vulnerable_helper_text">
                      {({ field, form }) => (
                        <>
                          <Stack
                            spacing={1}
                            direction="row"
                            alignItems="center"
                          >
                            <img
                              // key={index}
                              src="/static/icons/vulnerableIcon.png"
                              style={{ width: 20, height: 20 }}
                            />
                            <Typography>Vulnerable (optional)</Typography>
                          </Stack>
                          <TextField
                            InputProps={{
                              sx: {
                                borderRadius: "5px",
                                background: "#ffffff",
                                position: "relative",
                                fontSize: 16,
                              },

                              maxLength: maxCharacterLimit,
                              // endAdornment: (
                              //   <InputAdornment
                              //     sx={{ marginTop: "70px" }}
                              //     position="end"
                              //   >
                              //     {values.vulnerable_helper_text?.length || 0}/
                              //     {maxCharacterLimit}
                              //   </InputAdornment>
                              // ),
                              // shrink: true,
                              // FormLabelClasses: {
                              //   asterisk: classes.placeholder,
                              // },
                            }}
                            error={Boolean(
                              touched.vulnerable_helper_text &&
                                errors.vulnerable_helper_text
                            )}
                            fullWidth
                            helperText={
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <SmallText
                                  value={
                                    touched.vulnerable_helper_text &&
                                    errors.vulnerable_helper_text
                                  }
                                  color="#f44336"
                                />
                                <SmallText
                                  value={`${values.vulnerable_helper_text?.length}/${maxCharacterLimit}`}
                                  sx={{ marginLeft: "auto" }}
                                />
                              </Stack>
                            }
                            // label={
                            //   <Stack
                            //     spacing={1}
                            //     direction="row"
                            //     alignItems="center"
                            //   >
                            //     <img
                            //       // key={index}
                            //       src="/static/icons/vulnerableIcon.png"
                            //       style={{ width: 20, height: 20 }}
                            //     />
                            //     <Typography>Vulnerable (optional)</Typography>
                            //   </Stack>
                            // }
                            placeholder={t("common:question.Helper Text Limit")}
                            name="vulnerable_helper_text"
                            multiline
                            rows={3}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            {...field}
                            // onChange={(event) => checkCharacterLength(event, field)}
                            value={values.vulnerable_helper_text || ""}
                            variant="outlined"
                          />
                        </>
                      )}
                    </Field>
                    <Field name="safe_helper_text">
                      {({ field, form }) => (
                        <>
                          <Stack
                            spacing={1}
                            direction="row"
                            alignItems="center"
                          >
                            <img
                              // key={index}
                              src="/static/icons/safeIcon.png"
                              style={{ width: 20, height: 20 }}
                            />
                            <BodyText value="Safe (optional)" />
                          </Stack>
                          <TextField
                            InputProps={{
                              sx: {
                                borderRadius: "5px",
                                background: "#ffffff",
                                position: "relative",
                                fontSize: 16,
                              },

                              maxLength: maxCharacterLimit,
                            }}
                            error={Boolean(
                              touched.safe_helper_text &&
                                errors.safe_helper_text
                            )}
                            fullWidth
                            helperText={
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <SmallText
                                  value={
                                    touched.safe_helper_text &&
                                    errors.safe_helper_text
                                  }
                                  color="#f44336"
                                />
                                <SmallText
                                  value={`${values.safe_helper_text?.length}/${maxCharacterLimit}`}
                                  sx={{ marginLeft: "auto" }}
                                />
                              </Stack>
                            }
                            placeholder={t("common:question.Helper Text Limit")}
                            name="safe_helper_text"
                            multiline
                            rows={3}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            {...field}
                            // onChange={(event) => checkCharacterLength(event, field)}
                            value={values.safe_helper_text || ""}
                            variant="outlined"
                          />
                        </>
                      )}
                    </Field>
                    <Field name="thriving_helper_text">
                      {({ field, form }) => (
                        <>
                          <Stack
                            spacing={1}
                            direction="row"
                            alignItems="center"
                          >
                            <img
                              // key={index}
                              src="/static/icons/thrivingIcon.png"
                              style={{ width: 20, height: 20 }}
                            />
                            <Typography>Thriving (optional)</Typography>
                          </Stack>
                          <TextField
                            InputProps={{
                              sx: {
                                borderRadius: "5px",
                                background: "#ffffff",
                                position: "relative",
                                fontSize: 16,
                              },

                              maxLength: maxCharacterLimit,
                            }}
                            error={Boolean(
                              touched.thriving_helper_text &&
                                errors.thriving_helper_text
                            )}
                            fullWidth
                            helperText={
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <SmallText
                                  value={
                                    touched.thriving_helper_text &&
                                    errors.thriving_helper_text
                                  }
                                  color="#f44336"
                                />
                                <SmallText
                                  value={`${values.thriving_helper_text?.length}/${maxCharacterLimit}`}
                                  sx={{ marginLeft: "auto" }}
                                />
                              </Stack>
                            }
                            placeholder={t("common:question.Helper Text Limit")}
                            name="thriving_helper_text"
                            multiline
                            rows={3}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            {...field}
                            // onChange={(event) => checkCharacterLength(event, field)}
                            value={values.thriving_helper_text || ""}
                            variant="outlined"
                          />
                        </>
                      )}
                    </Field>
                  </Stack>
                </Grid>
                <Grid item sm={3} md={12} xs={12} lg={12}>
                  <Typography
                    sx={{ paddingRight: "5px" }}
                    color="textPrimary"
                    variant="h6"
                  >
                    {t(
                      "common:question.Intervention options",
                      "Intervention options"
                    )}
                  </Typography>
                </Grid>
                <FieldArray name="checkbox_question_options">
                  {({ push, remove }) => (
                    <Grid
                      container
                      style={{
                        width: "100%",
                        paddingLeft: "24px",
                        paddingTop: "24px",
                      }}
                      spacing={2}
                    >
                      {values.checkbox_question_options &&
                        values.checkbox_question_options?.length > 0 &&
                        values.checkbox_question_options.map(
                          (option, index) => {
                            return (
                              <Grid
                                item
                                sm={12}
                                md={12}
                                xs={12}
                                lg={12}
                                key={{ index }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <TextField
                                    label={`Intervention ${index + 1}`}
                                    placeholder={t(
                                      "common:question.Intervention Length",
                                      {
                                        length: index + 1,
                                      }
                                    )}
                                    multiline
                                    rows={3}
                                    error={Boolean(
                                      touched.checkbox_question_options?.[index]
                                        ?.choiceName &&
                                        errors.checkbox_question_options?.[
                                          index
                                        ]?.choiceName
                                    )}
                                    helperText={
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="space-between"
                                        alignItems="center"
                                      >
                                        <SmallText
                                          value={
                                            touched.checkbox_question_options?.[
                                              index
                                            ]?.choiceName &&
                                            errors.checkbox_question_options?.[
                                              index
                                            ]?.choiceName
                                          }
                                          color="#f44336"
                                        />
                                        <SmallText
                                          value={`${values.checkbox_question_options?.[index]?.choiceName?.length}/${maxCharacterLimit}`}
                                          sx={{ marginLeft: "auto" }}
                                        />
                                      </Stack>
                                    }
                                    InputProps={{
                                      sx: {
                                        borderRadius: "5px",
                                        background: "#ffffff",
                                      },
                                    }}
                                    name={`checkbox_question_options[${index}].choiceName`}
                                    key={`checkbox_question_options${index}.choiceName`}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={option.choiceName || ""}
                                    variant="outlined"
                                    fullWidth
                                  />
                                  <IconButton
                                    onClick={() => remove(index)}
                                    className={classes.root}
                                  >
                                    <TrashIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Grid>
                            );
                          }
                        )}
                      {values.checkbox_question_options?.length < 5 && (
                        <Grid item sm={12} md={12} xs={12} lg={12}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <TextField
                              multiline
                              rows={3}
                              error={Boolean(touched.option && errors.option)}
                              helperText={
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <SmallText
                                    value={touched.option && errors.option}
                                    color="#f44336"
                                  />
                                  <SmallText
                                    value={`${values.option?.length}/${maxCharacterLimit}`}
                                    sx={{ marginLeft: "auto" }}
                                  />
                                </Stack>
                              }
                              InputProps={{
                                sx: {
                                  borderRadius: "5px",
                                  background: "#ffffff",
                                  position: "relative",
                                },
                              }}
                              onBlur={handleBlur}
                              name="option"
                              value={values.option || ""}
                              onChange={handleChange}
                              variant="outlined"
                              fullWidth
                              label={t("")}
                              placeholder={t(
                                "common:question.Intervention Length",
                                {
                                  length:
                                    values.checkbox_question_options.length + 1,
                                }
                              )}
                            />
                            {values.option && (
                              <IconButton
                                onClick={() => {
                                  push({
                                    choiceName: values.option,
                                    id: getId(),
                                  });
                                  setFieldValue("option", "");
                                }}
                                className={classes.root}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </Grid>
                      )}
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
