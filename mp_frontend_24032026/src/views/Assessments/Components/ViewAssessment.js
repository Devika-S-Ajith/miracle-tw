import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import toast from "react-hot-toast";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Chip,
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  Checkbox,
  Tooltip,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";
import { PrintAsPDF } from "../../../components/UserComponents/ReportGenerator";
import { styled } from "@mui/system";
import { currentDateAndTime, utcToLocalDate } from "../../../helpers/helperFunction";
import AssessmentObservations from "./AssessmentObservations";
import AssessmentFollowup from "./AssessmentFollowup";
import AssessmentStepIndicator from "./AssessmentStepIndicator/AssessmentStepIndicator";
import AssessmentChildDetails from "./AssessmentChildDetails";
import PreAssessmentDetails from "./PreAssessmentDetails/PreAssessmentDetails";
import AssessmentSummary from "./AssessmentSummary";

const StyledCard = styled(Card)({
  maxHeight: "90vh", // Adjust the height as needed
  overflowY: "auto",
});

const StyledCardHeader = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(0, -4), // Adjust padding as needed
  marginBottom: -4, // Remove margin bottom
  "& .MuiAccordionSummary-content": {
    margin: -4, // Remove margin
  },
  borderRadius: "4px",
  backgroundColor: "var(--Neutrals-Steel-Tint-2, #D6DBDE)", // Collapsed background color
  "&.Mui-expanded": {
    backgroundColor: "white", // Expanded background color
    minHeight: "40px", // Adjust the height when expanded
  },
  "& .MuiAccordionSummary-content.Mui-expanded": {
    margin: "12px 0", // Adjust margin when expanded
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  paddingTop: theme.spacing(0), // Remove padding top
  paddingBottom: theme.spacing(2), // Adjust padding bottom as needed
}));

const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  "&.MuiCheckbox-root.Mui-disabled": {
    color: "#1D334B", // Change the color of the checkbox when disabled
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#1D334B", // For webkit browsers
    color: "#1D334B", // fallback for other browsers
  },
  "& .Mui-disabled": {
    color: "#1D334B", // Ensures label and border color is like normal
  },
}));

const CustomRadio = styled(Radio)(({ theme }) => ({
  "&.MuiRadio-root.Mui-checked": {
    color: "#1D334B", // Change the color of the checkbox when disabled
  },
  "&.MuiRadio-root.Mui-disabled": {
    color: "disbled", // Change the color of the checkbox when disabled
  },
}));

const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  "& .MuiFormControlLabel-label.Mui-disabled": {
    color: theme.palette.text.primary, // Keep the label text color as primary even when disabled
  },
}));

const ViewAssessment = forwardRef((props, ref) => {
  const { t} = useTranslation(["common"]);
  const formRef = useRef();
  const location = useLocation();
  const formRevisionNumber =
    location.state && location.state.formRevisionNumber;
  const [formPage, setFormPage] = useState(1);
  const {
    visitTypeList,
    reIntegrationTypeList,
    getVisitTypeList,
    getReIntegrationTypeList,
    languageChange,
  } = useContext(CommonDataContext);
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [formQuestions, setFormQuestions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [primaryChoices, setPrimaryChoices] = useState([]);
  const [visitInterval, setVisitInterval] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [score, setScore] = useState({});
  const [caseDetails, setCaseDetails] = useState({});
  const [memberPresent, setMemberPresent] = useState([]);
  const [childrenAssessed, setChildrenAssessed] = useState([]);
  let assessmentId = useParams();
  const [expanded, setExpanded] = useState(false);
  const [assessmentFormRevisionNumber, setassessmentFormRevisionNumber] =
    useState(null);
  const [domainSkippingReasons, setDomainSkippingReasons] = useState(null);
  const [followUpData, setFollowUpData] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const containerRef = useRef(null);


  const recommendationQuestionOptions = [
    {
      id: "1",
      option: "Weekly",
      value: "Weekly",
    },
    {
      id: "2",
      option: "Every two weeks",
      value: "Fortnightly (Bi-weekly)",
    },
    {
      id: "3",
      option: "Monthly",
      value: "Monthly",
    },
    {
      id: "4",
      option: "Every two months",
      value: "Every 2 Months (Bi-monthly)",
    },
    {
      id: "5",
      option: "Quarterly",
      value: "Quarterly",
    },
    {
      id: "6",
      option: "As needed",
      value: "As Needed",
    },
    {
      id: "7",
      option: "No follow-ups needed during the next 90 days",
      value: "No follow-ups needed during the next 90 days",
    },
  ];

  const domainImageIcons = [
    {
      id: "1",
      type: "Family & Social Relationships",
      image: "familyAndRelationships",
    },
    {
      id: "2",
      type: "Household Economy",
      image: "householdEconomy",
    },
    {
      id: "3",
      type: "Living Conditions",
      image: "livingConditions",
    },
    {
      id: "4",
      type: "Education",
      image: "education",
    },
    {
      id: "5",
      type: "Health & Mental Health",
      image: "healthAndMentalHealth",
    },
  ];

  useImperativeHandle(ref, () => ({
    handleExport,
  }));

  useEffect(() => {
    getFormList();
    getDomainSkipReasonsList();
    return () => {
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return; // Skip the first execution
    }
    getVisitTypeList();
    getReIntegrationTypeList();
    getFormList();
  }, [languageChange]);

  const scrollToRef = (ref) => {
    const boxId = `Box${ref}ref`;
    const boxElement = document.getElementById(boxId);
    if (boxElement) {
      boxElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const stepNumber = parseInt(id.match(/\d+/)[0], 10); // Extract the number from id
            setFormPage(stepNumber); // Update the active step (subtract 1 to match index)
          }
        });
      },
      {
        threshold: [0.5], // Adjust this threshold to determine when to trigger the update
      }
    );

    const elements = document.querySelectorAll("[id^='Box']");
    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      // Clean up the observer
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [caseDetails]);

  
  const getFollowUpData = useCallback(async (assessmentId) => {
    try {
      setLoading(true);
      const data = await APIS.getFollowupDomainDetails(assessmentId);
    
      setFollowUpData(data?.data?.data?.followupData[0]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const getFormList = useCallback(async () => {
    setLoading(true);
    setQuestionsLoading(true);
    try {
      const data = await APIS.FormList();
      if (data && data.data && data.data.data[0]) {
        let details = data.data.data[0];
        setassessmentFormRevisionNumber(details?.currentRevision);
        if (assessmentId && assessmentId.id) {
          const updatedFormRevision =
            formRevisionNumber || details.currentRevision;
          await getAssessmentDetails(assessmentId.id, updatedFormRevision);
          await getFollowUpData(assessmentId.id);
        }
      }
      setLoading(false);
      setQuestionsLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setQuestionsLoading(false);
    }
  }, []);

  const getDomainSkipReasonsList = useCallback(async () => {
    setLoading(true);
    setQuestionsLoading(true);
    try {
      const data = await APIS.getDomainSkipReasons();
      if (data?.data?.data) {
        let skippingReasonsList = data?.data?.data;
        setDomainSkippingReasons(skippingReasonsList);
      }
      setLoading(false);
      setQuestionsLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setQuestionsLoading(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      props.setExportLoading(true);

      const fileName =
        (caseDetails?.TWChildId ? caseDetails?.childFirstName?.[0] +
        "_" +
        caseDetails.childLastName : caseDetails?.familyName) +
        `_${assessment?.dateOfAssessment}TSAssessment_` +
        currentDateAndTime();
      const data = await APIS.GetAssessmentDetails(
        assessmentId?.id,
        assessmentFormRevisionNumber,
        assessment?.lastAssesmentDate,
        true
      );
      if (data && data?.data) {
        PrintAsPDF(data?.data, fileName);
        props.setExportLoading(false);
      } else if (data.data.Message === "Unauthorized") {
        toast.error(t("common:common.Unauthorized"));
        props.setExportLoading(false);
      } else {
        console.log("issue fetching data to export");
        toast.error(
          "Error while fetching data to export,Please try again in some time"
        );
        props.setExportLoading(false);
      }
    } catch (err) {
      console.error(err);
      props.setExportLoading(false);
    }
  });

  const getAssessmentDetails = useCallback(async (id, revision) => {
    setLoading(true);
    setQuestionsLoading(true);
    try {
      const domainData = await APIS.DomainList();
      setDomains(
        domainData &&
          domainData.data &&
          domainData?.data?.data
      )
      const data = await APIS.GetAssessmentDetails(id, revision);
      if (data && data.data) {
        const details = data.data;
        const assessment = details.assessmentDetails?.[0];
        const domainsSkipped = assessment?.domainsSkipped || [];
        let filteredDomains = domainData?.data?.data || [];
        if (Array.isArray(domainsSkipped) && domainsSkipped.length > 0) {
          filteredDomains = filteredDomains.filter(domain => !domainsSkipped.includes(String(domain.id)));
        }
        setFilteredDomains(filteredDomains);
        if (!assessment) return;
        const { TW_form, TWAssessmentReintegrationTypeId, schedulingOption, TWCaseId } = assessment;
        let formQuestions = TW_form?.TW_formQuestionMappings || [];
        if (
          reIntegrationTypeList?.length &&
          TWAssessmentReintegrationTypeId !==
          reIntegrationTypeList.find(
            (item) => item.reIntegrationType === t("common:assessment.Foster Care")
          )?.id
        ) {
          formQuestions = formQuestions.filter((item) => !item.TW_question.isFosterCareFlag);
        }
        setFormQuestions(formQuestions);
        setScore(details.assessmentScore);
        setAssessment(assessment);
        setMemberPresent(details?.membersPresent);
        setChildrenAssessed(details?.childrensAssessed);
        setPrimaryChoices(details.primaryChoices);
        setVisitInterval(schedulingOption);
        getCaseDetails(TWCaseId);
      }
      setLoading(false);
      setQuestionsLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setQuestionsLoading(false);
    }
  }, []);

  const getCaseDetails = useCallback(async (id) => {
    try {
      const data = await APIS.CaseDetails(id);
      if (data && data.data && data.data.data) {
        setCaseDetails(data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleClickPage = (value) => {
    setFormPage(value);
    scrollToRef(value);
  };

  function moveOtherToBottom(array) {
    if (!Array.isArray(array)) {
      throw new Error("Expected an array but received: " + typeof array);
    }

    let index = array.findIndex(
      (item) => item.choiceName?.trim() === "Other (please specify)"
    );

    if (index !== -1 && index !== array.length - 1) {
      let otherItem = array.splice(index, 1)[0];
      array.push(otherItem);
    }
    return array;
  }

  const getTWScore = () => {
    let totalScoreInPercentageAsString;
    if (score && score.totalScoreInPercentageAsString) {
      const num = Number(score.totalScoreInPercentageAsString);
      // Check if decimal part is zero
      if (Number.isInteger(num)) {
        totalScoreInPercentageAsString = num + " %";
      } else {
        totalScoreInPercentageAsString = score.totalScoreInPercentageAsString + " %";
      }
    }
    return totalScoreInPercentageAsString;
  };

  const checkIntervention = (value) => {
    const redFlagOptionIds =
      primaryChoices &&
      primaryChoices.length > 0 &&
      primaryChoices
        .map((c) => {
          if (
            c.choiceName == t("common:assessment.In-crisis") ||
            c.choiceName == t("common:assessment.Vulnerable")
          ) {
            return c.id;
          }
        })
        .filter((c) => c);
    let count = 0;
    formQuestions &&
      formQuestions.length > 0 &&
      formQuestions.map((item) => {
        if (
          item.TW_question &&
          item.TW_question.TWQuestionDomainId === value &&
          !item.TW_question.isRedFlag &&
          (item.TW_question.TW_responses?.find(
            (resp) => redFlagOptionIds[0] == resp.TWChoiceId
          ) ||
            item.TW_question.TW_responses?.find(
              (resp) => redFlagOptionIds[1] == resp.TWChoiceId
            ))
        ) {
          count = count + 1;
        }
        return item;
      });
    return count > 0 ? true : false;
  };

  const checkDomainHaveRedflagIntervention = (value) => {
    let count = 0;
    formQuestions &&
      formQuestions.length > 0 &&
      formQuestions.map((item) => {
        if (
          item.TW_question &&
          item.TW_question.TWQuestionDomainId === value &&
          item.TW_question.isRedFlag &&
          ["1", "2"].includes(
            item.TW_question.TW_responses.find((c) => !c.isInterResp)
              ?.TWChoiceId
          )
        ) {
          count = count + 1;
        }
      });
    return count > 0 ? true : false;
  };

  const checkHaveRedflagIntervention = () => {
    let count = 0;
    formQuestions &&
      formQuestions.length > 0 &&
      formQuestions.map((item) => {
        if (
          item.TW_question &&
          ["1", "2"].includes(
            item.TW_question.TW_responses.find((c) => !c.isInterResp)
              ?.TWChoiceId
          )
        ) {
          count = count + 1;
        }
      });
    return count > 0 ? true : false;
  };

  const handleChangePanel = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getTextResponseForInterventionNotes = (item, choiceId) => {
    return (
      item.TW_question?.TW_responses?.find(
        (r) => r.TWChoiceId === choiceId
      )?.textResponse || null
    );
  };

  const getDomainSkippedReason = (domainId) => {
    if (!assessment?.itemsSkipped?.length) return "";
    const item = assessment.itemsSkipped.find(i => i?.TWQuestionDomainId === domainId);
    if (!item) return "";
    if (item.notes) return item.notes;
    if (item.domainSkippReasonId && Array.isArray(domainSkippingReasons)) {
      const reasonObj = domainSkippingReasons.find(r => r.id === item.domainSkippReasonId);
      return reasonObj?.reason || "";
    }
    return "";
  };

  // Combined helper for skipped question info
  const getSkippedQuestionInfo = (domainId, questionId) => {
    if (!assessment?.itemsSkipped?.length) return { skipped: false, reason: "" };
    const domainItem = assessment.itemsSkipped.find(i => i?.TWQuestionDomainId === domainId && i?.isDomainSkipped !== true);
    if (!domainItem) return { skipped: false, reason: "" };
    const questionItem = domainItem?.skippedQuestions?.find(i => i?.TWQuestionId === questionId);
    if (!questionItem) return { skipped: false, reason: "" };
    let reason = "";
    if (questionItem?.notes) reason = questionItem.notes;
    else if (questionItem?.TWReasonId && Array.isArray(domainSkippingReasons)) {
      const reasonObj = domainSkippingReasons.find(r => r.id === questionItem.TWReasonId);
      reason = reasonObj?.reason || "";
    }
    return { skipped: true, reason };
  };

  // Helper to render skipped reason (for both domain and question)
  const renderSkippedReason = (reason, t) => {
    if (!reason) return null;
    const maxLen = 30;
    if (reason.length > maxLen) {
      return (
        <Tooltip title={reason} placement="top">
          <span>{` : ${t("common:assessment.excluded", "excluded")} (${reason.slice(0, maxLen)}…)`}</span>
        </Tooltip>
      );
    } else {
      return ` : ${t("common:assessment.excluded", "excluded")} (${reason})`;
    }
  };

  return (
    <Formik
        innerRef={formRef}
        initialValues={{
          form: "",
          type:assessment?.type,
          familyType:assessment?.familyType || null,
          Id: assessment?.TWChildId || assessment?.TWFamilyId,
          childbirthDate:assessment?.childbirthDate || null,
          childrenAssessed: childrenAssessed,
          childGender: assessment?.childGender || null,
          childName: assessment?.childFirstName ? `${assessment?.childFirstName}${assessment?.childLastName ? " " + assessment?.childLastName : ""}` : null,
          familyName: assessment?.familyName || null,
          caseworkerName: assessment?.caseworkerfirstName+" "+assessment?.caseworkerlastName,
          membersPresent: memberPresent,
          primaryContact : `${assessment?.memberFirstName || ""}${assessment?.memberLastName ? " " + assessment?.memberLastName : ""}`,
          lastAssesmentDate: assessment?.lastAssesmentDate || null,
          date_of_assessment: assessment?.dateOfAssessment || null,
          visit_type: assessment?.TWAssessmentVisitTypeId || "",
          reintegration_type: assessment?.TWAssessmentReintegrationTypeId || "",
          child_thought: assessment?.observations?.CHILD_THOUGHTS || "",
          caregiver_thought:
            assessment?.observations?.CARE_GIVER_THOUGHTS || "",
          first_notes_household: assessment?.firstNotesOnHousehold || "",
          caseworker_thought:
            assessment?.observations?.CASE_WORKER_THOUGHTS || "",
          placement_recommendations:
            assessment?.observations?.PLACEMENT_RECOMMENDATIONS || "",
          other_value: assessment?.otherReIntegrationTypeValue || "",
          question:
            assessment && assessment.meetWithChild === true
              ? "Yes"
              : assessment && assessment.meetWithChild === false
              ? "No"
              : "",
          language: "",
          relation: "",
          other_relation: "",
          overall_observations:
            assessment && assessment.overallObservation
              ? assessment.overallObservation
              : "",
          is_complete: assessment?.isComplete || false,
          total_score: 0,
          specify_reason:
            assessment && assessment.specifyReason
              ? assessment.specifyReason
              : "",
          scheduling_option:
            assessment && assessment.schedulingOption
              ? assessment.schedulingOption
              : "",
          is_completed: false,
          submit: null,
          updatedAt: assessment?.assessmentEndsAt ? utcToLocalDate(assessment.assessmentEndsAt) : null,
        }}
        enableReinitialize={true}
      >
        {({
          handleBlur,
          handleChange,
          values,
        }) => (
          <Form>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StyledCard ref={containerRef}>
                <Loader
                  loading={loading || questionsLoading }
                ></Loader>
                <StyledCardHeader>
                  <Box
                    sx={{
                      width: "100%",
                      marginTop: "10px",
                      marginBottom: "4px",
                      overflow: "auto",
                    }}
                  >
                    <AssessmentStepIndicator
                      formPage={formPage}
                      domains={domains}
                      score={score}
                      handleClickPage={handleClickPage}
                    />
                  </Box>
                </StyledCardHeader>
                <Grid spacing={3}>
                  <Grid item md={12} xs={12} m={2}>
                    <Box
                      className="box"
                      id="Box1ref"
                      sx={{
                        borderRadius: 1,
                        border:
                          formPage == 1
                            ? "1px solid var(--Midnight-Midnight, #1D334B)"
                            : "1px solid #ccc",
                        padding: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ textAlign: "center", my: 1 }}
                      >
                        {values?.type === "FAMILY"
                          ? t("common:family.Family Details")
                          : t("common:child.Child Details")}
                      </Typography>
                      <AssessmentChildDetails
                        caseDetails={values}
                      />
                      <Typography
                        variant="h6"
                        sx={{ textAlign: "center", my: 1 }}
                      >
                        {t("common:assessment.Pre Assessment")}
                      </Typography>
                      <PreAssessmentDetails
                        preAssessmentData={values}
                        reIntegrationTypeList={reIntegrationTypeList}
                        visitTypeList={visitTypeList}
                      />
                    </Box>
                  </Grid>
                  {score ? (
                    <Grid item md={12} xs={12} mx={2}>
                      <Box
                        className="box"
                        id="Box2ref"
                        sx={{
                          borderRadius: 1,
                          border:
                            formPage == 2
                              ? "1px solid var(--Midnight-Midnight, #1D334B)"
                              : "1px solid #ccc",
                          padding: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ textAlign: "center" }}>
                          {t("common:assessment.Thrive Scale Summary")}:{" "}
                          {getTWScore()}
                        </Typography>
                        <AssessmentSummary score={score} domains={domains} />
                      </Box>
                    </Grid>
                  ) : (
                    <></>
                  )}
                  {domains &&
                    domains.length > 0 &&
                    domains.map((domain, index) => {
                      // Determine if this domain should be disabled (greyed out)
                      const hasActiveQuestion = formQuestions?.some(
                        (item) =>
                          domain.id === item.TW_question?.TWQuestionDomainId &&
                          item.TW_question?.TW_responses?.find((c) => !c.isInterResp)?.TWChoiceId
                      );
                      return (
                        <Grid item md={12} xs={12} m={2} key={domain.id}>
                          <Box
                            className="box"
                            id={`Box${score ? index + 3 : index + 2}ref`}
                            sx={{
                              borderRadius: 1,
                              border:
                                formPage == (score ? index + 3 : index + 2)
                                  ? "1px solid var(--Midnight-Midnight, #1D334B)"
                                  : "1px solid #ccc",
                              padding: 2,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                alt="fiter_user"
                                src={`/static/icons/${
                                  domainImageIcons?.find(
                                    (item) => item.id === domain.id
                                  )?.image
                                }.svg`}
                                width={32}
                                height={32}
                                style={{
                                  alignSelf: "center",
                                  marginRight: "16px",
                                  filter: hasActiveQuestion ? undefined : 'grayscale(100%)',
                                  opacity: hasActiveQuestion ? 1 : 0.5,
                                }}
                              />
                              <Typography
                                variant="h6"
                                sx={{
                                  textAlign: "center",
                                  my: 1,
                                  color: hasActiveQuestion ? 'inherit' : 'text.disabled',
                                }}
                              >
                                {domain.domainName} 
                                {assessment?.domainsSkipped?.includes(domain.id) ? (
                                  (() => {
                                    const reason = getDomainSkippedReason(domain.id) || "";
                                    const maxLen = 30;
                                    if (reason.length > maxLen) {
                                      return (
                                        <Tooltip title={reason} placement="top">
                                          <span>{` : ${t("common:assessment.excluded", "excluded")} (${reason.slice(0, maxLen)}…)`}</span>
                                        </Tooltip>
                                      );
                                    } else {
                                      return ` : ${t("common:assessment.excluded", "excluded")} (${reason})`;
                                    }
                                  })()
                                ) : ""}
                              </Typography>
                            </div>

                            <Grid container spacing={2}>
                              <Grid item md={12} xs={12}>
                                {formQuestions &&
                                  formQuestions.length > 0 &&
                                  formQuestions.map((item) => {
                                    return domain.id ===
                                      item.TW_question.TWQuestionDomainId ? (
                                      <div
                                        key={item.TW_question.id}
                                        style={{ marginBottom: 20 }}
                                      >
                                        <div style={{ paddingRight: "20%" }}>
                                          <Tooltip
                                            title={
                                              item?.TW_question
                                                ?.questionHelpText
                                            }
                                            placement="bottom"
                                          >
                                            <Typography
                                              sx={{
                                                color:
                                                  item.TW_question?.TW_responses
                                                    ?.length &&
                                                  item.TW_question.TW_responses.find(
                                                    (c) => !c.isInterResp,
                                                  ).TWChoiceId
                                                    ? "inherit"
                                                    : "text.disabled",
                                              }}
                                            >
                                              {item.TW_question.questionText}
                                              {(() => {
                                                const { skipped, reason } = getSkippedQuestionInfo(domain.id, item.TW_question.id);
                                                return skipped ? renderSkippedReason(reason, t) : null;
                                              })()}
                                            </Typography>
                                          </Tooltip>
                                        </div>
                                        <Box display="flex" gap={5}>
                                          <Box>
                                            <div>
                                              {item.TW_question.isRedFlag && (
                                                <Chip
                                                  size="small"
                                                  sx={{
                                                    my: 1,
                                                    backgroundColor: "#CC0000",
                                                    color: "white",
                                                    borderRadius: "5px",
                                                  }}
                                                  label={t(
                                                    "common:assessment.Red Flag"
                                                  )}
                                                ></Chip>
                                              )}
                                            </div>

                                            <RadioGroup
                                              row
                                              value={
                                                item.TW_question?.TW_responses
                                                  ?.length &&
                                                item.TW_question.TW_responses.find(
                                                  (c) => !c.isInterResp
                                                ).TWChoiceId
                                              }
                                              // onChange={(e) =>
                                              //   handleChangeDomainQuestionValue(
                                              //     e.target.value,
                                              //     item?.TW_question?.id
                                              //   )
                                              // }
                                            >
                                              {primaryChoices?.length > 0 &&
                                                primaryChoices?.sort(
                                                  (a, b) => a.id - b.id
                                                ).length > 0 &&
                                                primaryChoices
                                                  ?.sort((a, b) => a.id - b.id)
                                                  .map((choice, index) => {
                                                    return (
                                                      <FormControlLabel
                                                        value={choice.id}
                                                        key={index}
                                                        name={choice.choiceName}
                                                        control={
                                                          <CustomRadio
                                                            tabindex={
                                                              formQuestions.find(
                                                                (el) =>
                                                                  el.TW_question
                                                                    ?.TW_responses
                                                                    ?.length &&
                                                                  el.TW_question.TW_responses.find(
                                                                    (c) =>
                                                                      !c.isInterResp
                                                                  )
                                                                    .TWChoiceId ==
                                                                    choice.id
                                                              )
                                                                ? 0
                                                                : 1
                                                            }
                                                          />
                                                        }
                                                        label={
                                                          choice.choiceName
                                                        }
                                                        disabled={
                                                          choice.id !==
                                                          (item.TW_question
                                                            ?.TW_responses
                                                            ?.length &&
                                                            item.TW_question.TW_responses.find(
                                                              (c) =>
                                                                !c.isInterResp
                                                            ).TWChoiceId)
                                                        }
                                                      ></FormControlLabel>
                                                    );
                                                  })}
                                            </RadioGroup>
                                          </Box>
                                          {item.TW_question?.TW_responses?.[0]
                                            ?.notes && (
                                            <Box
                                              sx={{
                                                backgroundColor: "#F3F6FA",
                                                borderRadius: 1,
                                                flex: 1,
                                                p: 2,
                                                mx: -2,
                                                m: 0,
                                                // flexBasis: "50%",
                                              }}
                                              width={1}
                                            >
                                              <Box
                                                sx={{
                                                  maxHeight: 100, // Set the max height (adjust as needed)
                                                  overflow: "auto", // Enable scrolling when content exceeds maxHeight
                                                  pr: 2,
                                                }}
                                              >
                                                <Typography
                                                  style={{
                                                    whiteSpace: "pre-line",
                                                  }}
                                                >
                                                  {
                                                    item.TW_question
                                                      ?.TW_responses?.[0]?.notes
                                                  }
                                                </Typography>
                                              </Box>
                                            </Box>
                                          )}
                                        </Box>
                                      </div>
                                    ) : (
                                      <></>
                                    );
                                  })}
                              </Grid>
                            </Grid>
                          </Box>
                        </Grid>
                      );
                    })}
                  <Grid item md={12} xs={12} m={2}>
                    <Box
                      className="box"
                      id={score ? `Box8ref` : `Box7ref`}
                      sx={{
                        borderRadius: 1,
                        border:
                          formPage == 8
                            ? "1px solid var(--Midnight-Midnight, #1D334B)"
                            : "1px solid #ccc",
                        padding: 2,
                      }}
                    >
                      <Typography color="black" variant="h6" textAlign="center">
                        {t(
                          "common:assessment.Areas Needing Immediate Intervention"
                        )}
                      </Typography>
                      <Typography color="textSecondary" variant="subtitle1">
                        {checkHaveRedflagIntervention() ? t("common:assessment.Intervention Sub1") : t("common:assessment.No immediate intervention needed")}
                      </Typography>
                      <Grid item md={12} xs={12} sx={{ mt: 2 }}>
                        {domains &&
                          domains.length > 0 &&
                          domains.map((domain, index) => {
                            return checkDomainHaveRedflagIntervention(
                              domain.id
                            ) || checkIntervention(domain.id) ? (
                              <Accordion
                                key={domain.id}
                                panel={index}
                                expanded={expanded == index}
                                onChange={handleChangePanel(index)}
                                sx={{ mb: 2, borderRadius: "4px" }}
                              >
                                <StyledAccordionSummary
                                  expandIcon={
                                    <ArrowDropUpIcon sx={{ color: "black" }} />
                                  }
                                  aria-controls="panel1bh-content"
                                  id="panel1bh-header"
                                >
                                  <Typography
                                    sx={{
                                      width: "33%",
                                      flexShrink: 0,
                                      fontWeight: "bold",
                                      my: 1,
                                    }}
                                  >
                                    {domain.domainName}
                                  </Typography>

                                  <Typography
                                    sx={{ color: "text.secondary" }}
                                  ></Typography>
                                </StyledAccordionSummary>
                                <StyledAccordionDetails>
                                  <hr></hr>
                                  <Typography>
                                    <div key="1">
                                      <FormGroup>
                                        {formQuestions &&
                                          formQuestions.length > 0 &&
                                          formQuestions.map((item) => {
                                            return domain.id ==
                                              item.TW_question
                                                ?.TWQuestionDomainId &&
                                              item.TW_question.TW_responses
                                                ?.length > 0 &&
                                              ((primaryChoices.filter(
                                                (el) =>
                                                  el.choiceName ==
                                                  t(
                                                    "common:assessment.In-crisis"
                                                  )
                                              )?.length > 0 &&
                                                primaryChoices.filter(
                                                  (el) =>
                                                    el.choiceName ==
                                                    t(
                                                      "common:assessment.In-crisis"
                                                    )
                                                )[0].id ==
                                                  item.TW_question.TW_responses.find(
                                                    (c) => !c.isInterResp
                                                  ).TWChoiceId) ||
                                                (primaryChoices.filter(
                                                  (el) =>
                                                    el.choiceName ==
                                                    t(
                                                      "common:assessment.Vulnerable"
                                                    )
                                                )?.length > 0 &&
                                                  primaryChoices.filter(
                                                    (el) =>
                                                      el.choiceName ==
                                                      t(
                                                        "common:assessment.Vulnerable"
                                                      )
                                                  )[0].id ==
                                                    item.TW_question.TW_responses.find(
                                                      (c) => !c.isInterResp
                                                    ).TWChoiceId)) ? (
                                              <div
                                                key={item.TW_question.id}
                                                style={{ marginBottom: 20 }}
                                              >
                                                <FormLabel sx={{color: "black", fontSize: "16px"}}>
                                                  {
                                                    item.TW_question
                                                      .questionText
                                                  }
                                                </FormLabel>
                                                <div>
                                                  {item.TW_question
                                                    .isRedFlag && (
                                                    <Chip
                                                      size="small"
                                                      sx={{
                                                        my: 1,
                                                        backgroundColor:
                                                          "#CC0000",
                                                        color: "white",
                                                        borderRadius: "5px",
                                                      }}
                                                      label={t(
                                                        "common:assessment.Red Flag"
                                                      )}
                                                    ></Chip>
                                                  )}
                                                </div>
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                  }}
                                                >
                                                  {item?.TW_question?.TW_choices &&
                                                    item.TW_question.TW_choices
                                                      .length > 0 &&
                                                    item.TW_question.TW_choices.sort(
                                                      (a, b) => a.id - b.id
                                                    ).length > 0 &&
                                                    item.TW_question.TW_choices.sort(
                                                      (a, b) => a.id - b.id
                                                    ) &&
                                                    moveOtherToBottom(
                                                      item.TW_question
                                                        .TW_choices
                                                        .filter(choices =>
                                                          item.TW_question?.TW_responses?.some(r => (r.TWChoiceId === choices?.id)&& r?.isInterResp))
                                                    ).map((choice) => {
                                                      return (
                                                        <>
                                                          <Grid
                                                            container
                                                            spacing={2}
                                                            sx={{mt:1}}
                                                          >
                                                            <Grid 
                                                              item 
                                                              xs={12} 
                                                              md={getTextResponseForInterventionNotes( item, choice?.id) ? 6 : 12}>
                                                              <table>
                                                                <tr>
                                                                  <td
                                                                    style={{
                                                                      fontWeight:
                                                                        "bold",
                                                                        verticalAlign: "top",
                                                                    }}
                                                                  >
                                                                    {t(
                                                                      "common:common.Intervention"
                                                                    )}
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      paddingLeft:
                                                                        "16px",
                                                                        verticalAlign: "top",
                                                                    }}
                                                                  >
                                                                    {
                                                                      choice.choiceName
                                                                    }
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td
                                                                    style={{
                                                                      fontWeight:
                                                                        "bold",
                                                                        verticalAlign: "top",
                                                                    }}
                                                                  >
                                                                    {t(
                                                                      "common:assessment.Applied to"
                                                                    )}
                                                                  </td>
                                                                  <td style={{ paddingLeft: "16px", verticalAlign: "top" }}>
                                                                    {values?.type === "FAMILY" ? (() => {
                                                                      const assessedChildrenNames = childrenAssessed
                                                                        .filter(child =>
                                                                          item.TW_question?.TW_responses?.some(
                                                                            r => r.TWChoiceId === choice?.id && r.appliedTo?.includes(child.id)
                                                                          )
                                                                        )
                                                                        .map(child => `${child?.firstName}${child?.lastName ? " " + child.lastName : ""}`);

                                                                      const hasFamilyId = item.TW_question?.TW_responses?.some(
                                                                        r => r.TWChoiceId === choice?.id && r.TWFamilyId
                                                                      );
                                                                      const resultParts = [...assessedChildrenNames];
                                                                      if (hasFamilyId && assessment?.familyName) {
                                                                        resultParts.push(assessment.familyName);
                                                                      }
                                                                      return resultParts.length > 0 ? resultParts.join(", ") : "-";
                                                                    })() : values?.childName}
                                                                  </td>
                                                                </tr>
                                                              </table>
                                                            </Grid>
                                                            {getTextResponseForInterventionNotes( item, choice?.id) &&
                                                            <Grid item xs={12} md={6}>
                                                              <TextField
                                                                fullWidth
                                                                disabled
                                                                label={
                                                                  choice.choiceName ===
                                                                  "Other (please specify)"
                                                                    ? t(
                                                                        "common:assessment.Intervention notes (required)"
                                                                      )
                                                                    : t(
                                                                        "common:assessment.Intervention notes (optional)"
                                                                      )
                                                                }
                                                                name="interventionDetails"
                                                                value={
                                                                  getTextResponseForInterventionNotes( item, choice?.id) ||
                                                                  ""
                                                                }
                                                                sx={{
                                                                  mb: 1,
                                                                  backgroundColor: `var(--Neutrals-Steel-Tint-3, #F3F6FA)`,
                                                                }}
                                                                InputProps={{
                                                                  readOnly: true,
                                                                }}
                                                                multiline
                                                                rows={2}
                                                                rowsMax={5}
                                                                variant="outlined"
                                                                required={
                                                                  choice.choiceName ===
                                                                  "Other (please specify)"
                                                                    ? true
                                                                    : false
                                                                }
                                                              />
                                                            </Grid>}
                                                          </Grid>
                                                        </>
                                                      );
                                                    })}
                                                </div>
                                                <Divider color='grey'/>
                                              </div>
                                            ) : (
                                              <></>
                                            );
                                          })}
                                      </FormGroup>
                                    </div>
                                  </Typography>
                                </StyledAccordionDetails>
                              </Accordion>
                            ) : (
                              <></>
                            );
                          })}
                      </Grid>
                    </Box>
                  </Grid>
                  <Grid item md={12} xs={12} m={2}>
                    <Box
                      className="box"
                      id={score ? `Box9ref` : `Box8ref`}
                      sx={{
                        borderRadius: 1,
                        border:
                          formPage == 9
                            ? "1px solid var(--Midnight-Midnight, #1D334B)"
                            : "1px solid #ccc",
                        padding: 2,
                      }}
                    >
                      <AssessmentFollowup
                        followUpData={followUpData}
                        domains={domains}
                        recommendationQuestionOptions={
                          recommendationQuestionOptions
                        }
                        visitInterval={visitInterval}
                        CustomFormControlLabel={CustomFormControlLabel}
                        CustomCheckbox={CustomCheckbox}
                        CustomRadio={CustomRadio}
                        formQuestions={formQuestions}
                        primaryChoices={primaryChoices}
                      />
                    </Box>
                  </Grid>
                  <Grid item md={12} xs={12} m={2}>
                    <Box
                      className="box"
                      id={score ? `Box10ref` : `Box9ref`}
                      sx={{
                        borderRadius: 1,
                        border:
                          formPage == 10
                            ? "1px solid var(--Midnight-Midnight, #1D334B)"
                            : "1px solid #ccc",
                        padding: 2,
                      }}
                    >
                      <AssessmentObservations
                        observationData={followUpData}
                        CustomTextField={CustomTextField}
                        observationValues={values}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                      />
                    </Box>
                  </Grid>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    m={2}
                    sx={{
                      textAlign: "center",
                      alignContent: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleClickPage(1)}
                    >
                      {t("common:assessment.Go up")}
                    </Button>
                  </Grid>
                </Grid>
              </StyledCard>
            </LocalizationProvider>
          </Form>
        )}
      </Formik>
  );
});

export default ViewAssessment;
