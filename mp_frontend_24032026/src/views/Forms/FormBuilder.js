import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ChevronLeftIcon from "../../assets/icons/ChevronLeft";
import DialogTitle from "@mui/material/DialogTitle";
import toast from "react-hot-toast";
import { styled } from "@mui/system";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { makeStyles } from "@mui/styles";
import APIS from "../../common/hooks/UseApiCalls";
import "./../../theme/scrollbar.css";
import { useNavigate } from "react-router-dom";
import { CommonDataContext } from "../../common/contexts/CommonDataContext";
import LoadingButton from "@mui/lab/LoadingButton";
import moment from "moment";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useAuthorization from "../../components/UserComponents/useAuthorization";
import BodyText from "../../components/BodyText/BodyText";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export const StyledTab = styled(Tab)({
  "&.Mui-selected": {
    color: "white",
  },
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: "#f2f5f7",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 3,
  },
}));

const useStyles = makeStyles((theme) => ({
  indicator: {
    background: "none",
  },

  selected1: {
    background: "#0C1825",
    color: "white",
    borderRadius: "5px",
    border: "0px hidden #000000",
  },
  indTab: {
    "&.MuiTab-root": {
      minHeight: "100px",
    },
    "&.Mui-selected": {
      color: "white",
      textTransform: "none",
      "&:after": {
        content: "",
        position: "absolute",
        top: "95%",
        left: "38%",
        width: 25,
        height: 25,
        borderTop: "25px solid transparent",
        borderLeft: "50px solid #555",
        borderBottom: "25px solid transparent",
        clear: "both",
      },
    },
  },
  tabs: {
    "& button": {
      padding: "10px",
    },
    "& button[aria-selected]": {
      position: "relative",
      marginBottom: 20,
      marginRight: 20,
      marginLeft: 20,
      textTransform: "none",

      "&:before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        border: "1px solid",
        borderRadius: "5px",
        // background: "#000000",
        zIndex: 0,
      },

      "& > *": { zIndex: 0 },
      "& .MuiTab-wrapper": {
        //background: "white",
        height: "100%",
        padding: 8,
        textAlign: "center",
      },
    },
  },
}));

const FormBuilder = (props) => {
  const { t } = useTranslation(["common"]);
  const location = useLocation();
  const [formName, setFormName] = useState(
    location?.state && location?.state?.formName?.trim()
  );
  const form = location?.state && location?.state?.formDetails;
  const defaultForm = location?.state && location?.state?.defaultForm;
  const {
    signedinUserRoleHT,
    signedinOrgType,
    currentQuestionData,
    setCurrentQuestionData,
    formDetails,
    setFormDetails,
    currentlySelectedDomain,
    setCurrentlySelectedDomain,
  } = useContext(CommonDataContext);
  const [isCreateForm, setIsCreateForm] = useState(
    localStorage.getItem("isCreateForm")
  );
  const [isSaved, setIsSaved] = useState(
    localStorage.getItem("isCreateForm") ? false : true
  );
  const [value, setValue] = useState(0);
  const [domains, setDomains] = useState([]);
  const [selectedDomainQuestions, setSelectedDomainQuestions] =
    useState(formDetails);
  const [currentlySelectedDomainName, setCurrentlySelectedDomainName] =
    useState("");
  const [open, setOpen] = React.useState(false);
  const [editEnabled, setEditEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [modalFlagPublish, setModalFlagPublish] = useState(false);
  const [formList, setFormList] = useState([]);
  const [deleteModalFlag, setDeleteModalFlag] = useState(false);
  const [deletedQuestionId, setDeletedQuestionId] = useState(null);
  const [formNameFieldError, setFormNameFieldError] = useState(false);
  const [questionLength, setQuestionLengths] = useState({});
  const [leftMargin, setLeftMargin] = useState(0);
  const [rightMargin, setRightMargin] = useState(0);
  const [cancelModalFlag, setCancelModalFlag] = useState(false);
  const classes = useStyles();
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const elementRef = useRef(null);

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "ManageForm",
    true
  );

  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === "/dashboard/forms/buildform") {
        navigate(`/dashboard/forms`, {
          state: {
            fetchFormDetails: true,
          },
        });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location]);

  const updateMargins = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const marginLeft = rect.left;
      const marginRight = window.innerWidth - rect.right;
      setLeftMargin(marginLeft);
      setRightMargin(marginRight);
    }
  };

  useEffect(() => {
    const calculateMarginsOnLoad = () => {
      updateMargins();
      window.removeEventListener("load", calculateMarginsOnLoad);
    };
    window.addEventListener("resize", updateMargins);
    window.addEventListener("load", calculateMarginsOnLoad);
    return () => {
      window.removeEventListener("resize", updateMargins);
      window.removeEventListener("load", calculateMarginsOnLoad);
    };
  }, [elementRef.current]);

  useEffect(() => {
    if (elementRef.current) {
      updateMargins();
    }
  }, [elementRef.current]);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    let allDomainData = selectedDomainQuestions;
    let options =
      selectedDomainQuestions[currentlySelectedDomain - 1].questions;
    const items = options;
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    var obj = Object.assign({}, allDomainData[currentlySelectedDomain - 1], {
      questions: items,
    });
    allDomainData.splice(currentlySelectedDomain - 1, 1, obj);
    //let updatedList = [...allDomainData, allDomainData[[currentlySelectedDomain]].questions = items];
    setSelectedDomainQuestions(allDomainData);
    setIsSaved(false);
  };
  const onEditFormName = () => {
    setEditEnabled(true);
  };

  useEffect(() => {
    console.log("form id ", form)
    getDomains();
    if (currentQuestionData?.length > 0) {
      getCurrentFormDetails();
    } else {
      getForms(form?.TWFormId);
    }
  }, []);

  const getCurrentFormDetails = async () => {
    const data = currentQuestionData;
    var domainData = data;

    const newlyAddedQuestion = JSON.parse(
      localStorage.getItem("newlyAddedQuestion")
    );
    console.log(
      "getCurrentFormDetails",
      newlyAddedQuestion,
      domainData[currentlySelectedDomain - 1].questions
    );

    let questionDetails = [];
    if (newlyAddedQuestion) {
      questionDetails = {
        questionId: newlyAddedQuestion.id,
        isRedFlag: newlyAddedQuestion.isRedFlag,
        isFosterCareFlag: newlyAddedQuestion.isFosterCareFlag,
        questionText: newlyAddedQuestion.questionText,
        questionHelpText: newlyAddedQuestion.questionHelpText,
        choices: newlyAddedQuestion.choices,
        choiceHelperText: Object.values(newlyAddedQuestion.choiceHelperText).some(value => value)
          ? newlyAddedQuestion.choiceHelperText
          : null,
      };
      if (
        localStorage.getItem("isQuestionIsEdited") ||
        (isCreateForm && newlyAddedQuestion.OldQuestionId !== null)
      ) {
        let index;
        if (isCreateForm) {
          index = domainData[currentlySelectedDomain - 1].questions.findIndex(
            (question) =>
              question.questionId == newlyAddedQuestion.OldQuestionId
          );
        } else {
          index = domainData[currentlySelectedDomain - 1].questions.findIndex(
            (question) => question.questionId == newlyAddedQuestion.id
          );
        }
        domainData[currentlySelectedDomain - 1].questions.splice(
          index,
          1,
          questionDetails
        );
        localStorage.removeItem("isQuestionIsEdited");
      } else {
        domainData[currentlySelectedDomain - 1].questions.push(questionDetails);
      }
    }
    let redFlagCount = domainData[currentlySelectedDomain - 1].questions.filter(
      (question) => question.isRedFlag == true
    )?.length;
    let totalQuestionCount =
      domainData[currentlySelectedDomain - 1]?.questions?.length;
    setQuestionLengths({
      redFlag: redFlagCount,
      NonRedFlag: totalQuestionCount - redFlagCount,
    });
    setCurrentQuestionData(domainData);
    localStorage.removeItem("newlyAddedQuestion");
    setLoading(false);
  };

  useEffect(() => {
    setSelectedDomainQuestions(currentQuestionData);
  }, [currentQuestionData?.length > 0]);

  const getForms = useCallback(async (formId) => {
    setLoading(true);
    let payload = {
      formName: "",
      TWFormId: `${formId}`,
      limit: 10,
      page: 1,
    };
    try {
      const data = await APIS.GetFormDetails(payload);
      setFormDetails(data?.data?.formData[0]);
      if (!isCreateForm) {
        setFormName(data?.data?.formData[0]?.formName);
      }
      var domainData = data?.data?.formData[0]?.domainData;
      const newlyAddedQuestion = JSON.parse(
        localStorage.getItem("newlyAddedQuestion")
      );
      let questionDetails = [];
      if (newlyAddedQuestion) {
        setIsSaved(false);
        questionDetails = {
          questionId: newlyAddedQuestion.id,
          isRedFlag: newlyAddedQuestion.isRedFlag,
          isFosterCareFlag: newlyAddedQuestion.isFosterCareFlag,
          questionText: newlyAddedQuestion.questionText,
          questionHelpText: newlyAddedQuestion.questionHelpText,
          choiceHelperText: Object.values(newlyAddedQuestion.choiceHelperText).some(value => value)
            ? newlyAddedQuestion.choiceHelperText
            : null
        };

        domainData[currentlySelectedDomain - 1].questions.push(questionDetails);
      }

      let redFlagCount = domainData[
        currentlySelectedDomain - 1
      ].questions.filter((question) => question.isRedFlag == true)?.length;
      let totalQuestionCount =
        domainData[currentlySelectedDomain - 1]?.questions?.length;
      setQuestionLengths({
        redFlag: redFlagCount,
        NonRedFlag: totalQuestionCount - redFlagCount,
      });
      console.log("domain question", domainData);
      setSelectedDomainQuestions(domainData);
      setCurrentQuestionData(data?.data?.formData[0].domainData);
      localStorage.removeItem("newlyAddedQuestion");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

  const getDomains = useCallback(async () => {
    setLoading(true);
    try {
      const data = await APIS.DomainList();
      const domainList = data?.data?.data?.sort((a, b) => a.id - b.id) || [];

      setCurrentlySelectedDomainName(
        domainList[currentlySelectedDomain - 1].domainName
      );
      setDomains(domainList);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const getFormsList = useCallback(async () => {
    setLoading(true);
    let payload = {
      formName: "",
      TWFormId: "",
      limit: 10,
      page: 1,
    };
    try {
      const data = await APIS.GetFormDetails(payload);
      setFormList(data?.data?.formData);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePublishFormModal = () => {
    if(formNameFieldError){
      toast.error("Please provide a valid form name");
      return;
    }
    setModalFlagPublish(true);
  };

  const PublishForm = async () => {
    console.log("selectedDomainQuestions", selectedDomainQuestions, isSaved);
    setLoading(true);
    try {
      if (isSaved) {
        await APIS.PublishForm({ formId: formDetails.id }).then((res) => {
          //console.log("res >>", finalQuestionList)
          if (res && res.data && res.status === 200) {
            toast.success("Form Published Successfully");
            console.log("navigating...");
            setLoading(false);
            navigate(`/dashboard/forms`, {
              state: {
                fetchFormDetails: true,
              },
            });
          } else {
            toast.error("Something went wrong!");
            setLoading(false);
          }
        });
      } else {
        await saveForm(true);

      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue((value) => value + 1);
  }

  const forceUpdate = useForceUpdate();

  const onQuestionDelete = (questionId) => {
    setDeletedQuestionId(questionId);
    setDeleteModalFlag(true);
  };

  const handleDomainRemove = () => {
    if (
      selectedDomainQuestions[currentlySelectedDomain - 1].questions?.length > 1
    ) {
      let allDomainData = selectedDomainQuestions;
      let deletedQuestion = selectedDomainQuestions[
        currentlySelectedDomain - 1
      ].questions.find((item) => item.questionId === deletedQuestionId);
      let items = selectedDomainQuestions[
        currentlySelectedDomain - 1
      ].questions.filter((item) => item.questionId !== deletedQuestionId);
      const updatedList = items.map((el, index) => {
        el.order = index + 1;
        return el;
      });
      var obj = Object.assign({}, allDomainData[currentlySelectedDomain - 1], {
        questions: updatedList,
      });
      allDomainData.splice(currentlySelectedDomain - 1, 1, obj);
      // let deletedList = [...allDomainData, allDomainData[[currentlySelectedDomain]].questions = updatedList];
      setSelectedDomainQuestions(allDomainData);

      let redFlagCount = allDomainData[
        currentlySelectedDomain - 1
      ].questions.filter((question) => question.isRedFlag == true)?.length;
      let totalQuestionCount =
        allDomainData[currentlySelectedDomain - 1]?.questions?.length;
      setQuestionLengths({
        redFlag: redFlagCount,
        NonRedFlag: totalQuestionCount - redFlagCount,
      });

      // if (deletedQuestion.isRedFlag) {
      //     setQuestionLengths({ redFlag: questionLength.redFlag - 1, NonRedFlag: questionLength.NonRedFlag })
      // } else {
      //     setQuestionLengths({ redFlag: questionLength.redFlag, NonRedFlag: questionLength.NonRedFlag - 1 })
      // }
      setIsSaved(false);
      setDeleteModalFlag(false);
      forceUpdate();
    } else {
      setOpen(true);
      setDeleteModalFlag(false);
    }
  };

  const saveForm = async (isPublishing = false) => {
   
    if(formNameFieldError){ 
      toast.error("Please provide a valid form name");
      return;
    }
    setLoading(true);
    var updatedList = selectedDomainQuestions
      .map(function (val) {
        return val.questions;
      })
      .reduce(function (pre, cur) {
        return pre.concat(cur);
      })
      .map(function (e, i) {
        return { HTQuestionId: e.questionId, order: (i + 1).toString() };
      });

    if (formName === "" || formName === undefined) {
      setLoading(false);
      return;
    }
    let payload = {
      formName: `${formName?.trim()}`,
      formDescription: `${formName?.trim()}`,
      formId: `${formDetails.id}`,
      removedQuestions: [],
      questions: updatedList,
    };

    try {
      if (localStorage.getItem("isCreateForm")) {
        delete payload.formId;
        await APIS.CreateForm(payload).then((res) => {
          console.log("res >>", updatedList);
          if (res && res.data && res.status === 200) {
            toast.success("Form saved Successfully");
            setLoading(false);
            setIsSaved(true);
            setIsCreateForm(false);
            localStorage.removeItem("isCreateForm");
            getForms(res?.data?.formId);
            if (isPublishing === true) {
              APIS.PublishForm({ formId: res?.data?.formId }).then((res) => {
                if (res && res.data && res.status === 200) {
                  toast.success("Form Published Successfully");
                  console.log("navigating...");
                  setLoading(false);
                  navigate(`/dashboard/forms`, {
                    state: {
                      fetchFormDetails: true,
                    },
                  });
                } else {
                  toast.error("Something went wrong!");
                  setLoading(false);
                }
              });
            }
            
          } else {
            if (res?.body?.Error) {
              toast.error(res?.body?.Error);
            } else {
              toast.error("Something went wrong!");
            }
            setLoading(false);
          }
        });
      } else {
        await APIS.UpdateForm(payload).then((res) => {
          console.log("res >>", updatedList);
          if (res && res.data && res.status === 200) {
            toast.success("Form Updated Successfully");
            setIsSaved(true);
            setLoading(false);
          } else {
            if (res?.body?.Error) {
              toast.error(res?.body?.Error);
            } else {
              toast.error("Something went wrong!");
            }
            setLoading(false);
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleAddForm = () => {
    navigate("/dashboard/questions/addCustomQuestion", {
      state: {
        domainId: currentlySelectedDomain,
        domainName: currentlySelectedDomainName,
        formId: formDetails.id,
      },
    });
  };

  const UpdateFormStatus = async () => {
    setLoading(true);

    let payload = {
      action: "UNPUBLISH",
      formIdActive: `${defaultForm.TWFormId}`,
      formIdInactive: `${formDetails.id}`,
    };

    try {
      await APIS.UpdateFormStatus(payload).then(async (res) => {
        //console.log("res >>", finalQuestionList)
        if (res && res.data && res.status === 200) {
          // toast.success('Questions Added Successfully');
          await getFormsList();
          setCurrentQuestionData([]);
          console.log("navigating...");
          setLoading(false);
        } else {
          toast.error("Something went wrong!");
          setLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleCancelOperation = () => {
    setModalFlag(false);
    setModalFlagPublish(false);
  };
  const handleConfirmDelete = () => {
    setModalFlag(true);
  };

  const onCloseAfterUnpublish = () => {
    setModalFlagPublish(false);
    navigate(`/dashboard/forms`, {
      state: {
        fetchFormDetails: true,
      },
    });
  };

  const handleDeleteForm = async () => {
    setLoading(true);
    let payload = {
      action: "DELETE",
      formIdActive: "",
      formIdInactive: `${formDetails.id}`,
    };
    try {
      await APIS.UpdateFormStatus(payload).then((res) => {
        //console.log("res >>", finalQuestionList)
        if (res && res.data && res.status === 200) {
          // toast.success('Questions Added Successfully');
          console.log("navigating...");
          setCurrentQuestionData([]);
          setLoading(false);
          navigate(`/dashboard/forms`, {
            state: {
              fetchFormDetails: true,
            },
          });
        } else {
          toast.error("Something went wrong!");
          setLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleYesCancel = () => {
    navigate(`/dashboard/forms`, {
      state: {
        fetchFormDetails: true,
      },
    });
  };

  function utcToLocal(utcDateTime) {
    const localDateTime = moment.utc(utcDateTime).local();
    return localDateTime.format("DD-MM-YYYY HH:mm:ss");
  }

  const handlePreviewForm = () => {
    if(formNameFieldError){
      toast.error("Please provide a valid form name");
      return;
    }
    navigate(`/dashboard/forms/${formDetails.id}/preview`, {
      state: {
        formName: formName,
        isSaved: isSaved,
        isPublished: isCreateForm ? false : formDetails.isPublished,
        defaultId: defaultForm?.TWFormId,
        isCreateForm: localStorage.getItem("isCreateForm"),
        selectedDomainQuestions: selectedDomainQuestions,
        globalDefault: formDetails.globalDefault,
      },
    });
  };

  const handlePreviewFormFromTheTable = (form) => {
    console.log("handlePreviewFormFromTheTable", form);
    navigate(`/dashboard/forms/${form.TWFormId}/preview`, {
      state: {
        formName: form.formName,
        isSaved: true,
        isPublished: false,
        createForm: localStorage.getItem("isCreateForm"),
        selectedDomainQuestions: selectedDomainQuestions,
      },
    });
  };

  const handleEditQuestion = (questionId) => {
    navigate(`/dashboard/questions/editCustomQuestion/${questionId}`, {
      state: {
        domainId: currentlySelectedDomain,
        domainName: currentlySelectedDomainName,
        formId: formDetails.id,
        createForm: localStorage.getItem("isCreateForm"),
      },
    });
  };

  const action = (
    <>
      <Button color="secondary" size="small" onClick={handleClose}></Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          pt: 2,
        }}
        ref={cardRef}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <Card sx={{ mr: 1 }}>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexWrap: "wrap",
                  pb: -1,
                }}
              >
                <Grid
                  container
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ m: 2 }}
                >
                  <Grid item xs={6} sm={6} md={6} xl={6} lg={6}>
                    <Stack spacing={1} direction="row">
                      <IconButton
                        color="inherit"
                        onClick={() =>
                          navigate(`/dashboard/forms`, {
                            state: {
                              fetchFormDetails: true,
                            },
                          })
                        }
                        sx={{ mt: -0.5 }}
                      >
                        <ChevronLeftIcon fontSize="normal" />
                      </IconButton>
                      {editEnabled || formNameFieldError ? (
                        <TextField
                          onChange={(e) => {
                            const value = e.target.value || '';
                            const trimmedStartValue = value.trimStart();
                            const isEmptyOrWhitespace = trimmedStartValue.trim() === '';
                            if (isEmptyOrWhitespace) {
                              setFormNameFieldError(true);
                            } else {
                              setFormNameFieldError(false);
                            }
                            setFormName(trimmedStartValue);
                            setIsSaved(false);
                          }}
                          id="formName"
                          InputProps={{
                            sx: {
                              borderRadius: "5px",
                              background: "#ffffff",
                              position: "relative",
                              fontSize: 16,
                              disableUnderline: true,
                            },
                          }}
                          sx={{
                            input: { textAlign: "left", fontWeight: "bold" },
                            maxWidth: "50%",
                          }}
                          label=""
                          error={formNameFieldError}
                          placeholder={t(
                            "common:question.Type The Assessment Form Name"
                          )}
                          name="formnamefield"
                          helperText={
                            formNameFieldError
                              ? t("common:question.Form Name Is Required")
                              : ""
                          }
                          fullWidth
                          onBlur={() => !formNameFieldError ? setEditEnabled(false) : null}
                          readOnly={!editEnabled}
                          disabled={!editEnabled}
                          autoFocus={true}
                          value={formName}
                          variant="outlined"
                          size="small"
                          required
                        />
                      ) : (
                        <Typography variant="h6">{formName}</Typography>
                      )}
                      {isCreateForm ? (
                        <EditIcon
                          sx={{
                            m: 1,
                            display: editEnabled ? "none" : "inline",
                          }}
                          onClick={onEditFormName}
                        ></EditIcon>
                      ) : (
                        !formDetails?.assessmentStat && !formDetails?.globalDefault && (
                          signedinUserRoleHT !== "superadmin" && 
                          <EditIcon
                            sx={{
                              m: 1,
                              display: editEnabled ? "none" : "inline",
                            }}
                            onClick={onEditFormName}
                          ></EditIcon>
                        )
                      )}
                    </Stack>
                    {selectedDomainQuestions?.length > 0 && (
                      <Typography sx={{ ml: 6 }}>
                        {t("common:question.Last Edited")} :{" "}
                        {utcToLocal(formDetails?.updatedAt)}
                      </Typography>
                    )}
                  </Grid>
                  {selectedDomainQuestions?.length > 0 && (
                    <Grid item>
                      {signedinUserRoleHT !== "caseworker" && (
                        <Stack spacing={2} direction="row">
                          <Button
                            sx={{ borderRadius: "4px" }}
                            onClick={() => setCancelModalFlag(true)}
                            variant="outlined"
                          >
                            {t("common:common.Cancel")}
                          </Button>
                          <Button
                            disabled={
                              (isCreateForm ? true : formDetails.assessmentStat)
                              || (signedinUserRoleHT === "superadmin" || formDetails?.globalDefault)
                            }
                            sx={{ borderRadius: "4px" }}
                            onClick={handleConfirmDelete}
                            variant="outlined"
                          >
                            {t("common:common.Delete")}
                          </Button>
                          <Button
                            onClick={saveForm}
                            disabled={
                              isCreateForm
                                ? false
                                : signedinUserRoleHT ===
                                      "superadmin" ||
                                    formDetails?.globalDefault || formDetails?.assessmentStat
                                  ? true
                                  : false
                            }
                            sx={{ borderRadius: "4px" }}
                            variant="outlined"
                          >
                            {t("common:common.Save")}
                          </Button>
                          <Button
                            sx={{ borderRadius: "4px" }}
                            variant="contained"
                            onClick={handlePreviewForm}
                          >
                            {t("common:question.Preview")}
                          </Button>
                          {isCreateForm ? (
                            <Button
                              onClick={handlePublishFormModal}
                              sx={{ borderRadius: "4px" }}
                              variant="contained"
                            >
                              {t("common:question.Publish")}
                            </Button>
                          ) : !formDetails.isPublished ? (
                            <Button
                              onClick={handlePublishFormModal}
                              disabled={formDetails?.isActive && (formDetails?.globalDefault || formDetails?.assessmentStat)}
                              sx={{ borderRadius: "4px" }}
                              variant="contained"
                            >
                              {t("common:question.Publish")}
                            </Button>
                          ) : (
                            <Button
                              onClick={handlePublishFormModal}
                              disabled={formDetails?.globalDefault || formDetails?.assessmentStat}
                              sx={{ borderRadius: "4px" }}
                              variant="contained"
                            >
                              {t("common:question.Unpublish")}
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Box>
              <Divider variant="middle" color="#000000" />
              <Box
                sx={{
                  flexGrow: 1,
                  bgcolor: "background.paper",
                  display: "flex",
                  height: "100vh",
                  mt: 2,
                }}
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
                <Tabs
                  className={classes.tabs}
                  classes={{ indicator: classes.indicator }}
                  orientation="vertical"
                  value={value}
                  visibleScrollbar={false}
                  onChange={handleChange}
                  aria-label="Vertical tabs"
                  variant="fullWidth"
                >
                  {formDetails?.domainData &&
                    formDetails?.domainData?.map((domain, index) => {
                      return (
                        <Tab
                          onClick={() => {
                            setCurrentlySelectedDomain(index + 1);
                            setCurrentlySelectedDomainName(domain.domainName);
                            setQuestionLengths({
                              redFlag: domain?.redFlagCount,
                              NonRedFlag:
                                domain?.questions?.length -
                                domain?.redFlagCount,
                            });
                          }}
                          className={classes.indTab}
                          classes={{ selected: classes.selected1 }}
                          label={
                            <>
                              <Typography variant="body1">
                                {domain.domainName}
                              </Typography>
                              <Typography variant="body2">
                                {selectedDomainQuestions?.length > 0
                                  ? "(" +
                                  `${domain?.questions?.length}` +
                                  " " +
                                  t("common:question.Factors", "Factors") +
                                  ")"
                                  : ""}
                              </Typography>{" "}
                            </>
                          }
                        />
                      );
                    })}
                </Tabs>
                {selectedDomainQuestions?.length > 0 && (
                  <Card
                    sx={{
                      borderRadius: "0px",
                      mb: 4,
                      maxWidth: "80%",
                      minWidth: "80%",
                      overflow: "scroll",
                    }}
                  >
                    {domains &&
                      domains?.map((domain, index) => {
                        return (
                          <TabPanel value={value} index={index}>
                            <Box>
                              <Grid
                                container
                                justifyContent="space-between"
                                sx={{ mb: 1 }}
                              >
                                <Grid item sx={{ ml: 1 }}>
                                  <Typography
                                    color="textPrimary"
                                    variant="h6"
                                    display="inline"
                                  >
                                    {t("common:question.Factors", "Factors")}{" "}
                                    <Typography
                                      color="textPrimary"
                                      variant="body2"
                                      display="inline"
                                    >
                                      ({questionLength.redFlag}{" "}
                                      {t("common:question.Red Flags")} ,{" "}
                                      {questionLength.NonRedFlag}{" "}
                                      {t("common:question.Non Red Flags")} )
                                    </Typography>
                                  </Typography>
                                </Grid>
                                {selectedDomainQuestions?.length > 0 && (
                                  <Grid item sx={{ float: "right" }}>
                                    {signedinUserRoleHT !== "caseworker" && (
                                      <Button
                                        color="primary"
                                        style={{ borderRadius: 4 }}
                                        onClick={handleAddForm}
                                        variant="contained"
                                        disabled={
                                          isCreateForm
                                            ? false
                                            : signedinUserRoleHT ===
                                                  "superadmin" ||
                                                formDetails?.globalDefault || formDetails?.assessmentStat
                                              ? true
                                              : false
                                        }
                                      >
                                        {t(
                                          "common:question.Add Factors",
                                          "Add Factors",
                                        )}
                                      </Button>
                                    )}
                                  </Grid>
                                )}
                              </Grid>
                              <Divider sx={{ ml: 1 }} color="#000000" />
                              <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="questions">
                                  {(provided) => (
                                    <Box
                                      className="questions"
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                    >
                                      {selectedDomainQuestions &&
                                        selectedDomainQuestions.map(
                                          ({ domainId, questions }, index) => {
                                            return domainId == domain.id ? (
                                              questions &&
                                              questions.map(
                                                (
                                                  {
                                                    questionId,
                                                    questionText,
                                                    isRedFlag,
                                                    choices,
                                                    questionHelpText,
                                                    choiceHelperText
                                                  },
                                                  index
                                                ) => {
                                                  return (
                                                    <Draggable
                                                      key={questionId}
                                                      draggableId={questionId}
                                                      index={index}
                                                    >
                                                      {(provided) => (
                                                        <Card
                                                          ref={
                                                            provided.innerRef
                                                          }
                                                          {...provided.draggableProps}
                                                          sx={{
                                                            border:
                                                              "1px solid #778791",
                                                            borderRadius:
                                                              "4px",
                                                            mt: 2,
                                                            ml: 1,
                                                            maxWidth: "100%",
                                                          }}
                                                        >
                                                          <Box
                                                            ref={elementRef}
                                                          >
                                                            <Grid
                                                              container
                                                              spacing={2}
                                                              alignItems="center"
                                                            >
                                                              <Grid
                                                                item
                                                                xs
                                                                sx={{ m: 2 }}
                                                              >
                                                                {index + 1}.
                                                                {questionText}
                                                                <br />
                                                                <Stack
                                                                  spacing={2}
                                                                  direction="row"
                                                                >
                                                                  {isRedFlag ? (
                                                                    <Typography
                                                                      color={
                                                                        "red"
                                                                      }
                                                                    >
                                                                      {t(
                                                                        "common:assessment.Red Flag"
                                                                      )}
                                                                      :{" "}
                                                                      {t(
                                                                        "common:common.Yes"
                                                                      )}
                                                                    </Typography>
                                                                  ) : (
                                                                    <></>
                                                                  )}
                                                                  {questionHelpText ? (
                                                                    <Typography>
                                                                      {t(
                                                                        "common:question.Helper Text"
                                                                      )}
                                                                      :{" "}
                                                                      {t(
                                                                        "common:common.Yes"
                                                                      )}
                                                                    </Typography>
                                                                  ) : (
                                                                    <></>
                                                                  )}
                                                                  <Typography>
                                                                    {t(
                                                                      "common:question.Interventions"
                                                                    )}
                                                                    :{" "}
                                                                    {t(
                                                                      "common:common.Yes"
                                                                    )}
                                                                  </Typography>
                                                                  {choiceHelperText && <BodyText value={"Rating explanations: Yes"} />}
                                                                </Stack>
                                                              </Grid>
                                                              {isCreateForm ? (
                                                                <>
                                                                  <Divider
                                                                    color="#778791"
                                                                    sx={{
                                                                      mr: -2,
                                                                    }}
                                                                    orientation="vertical"
                                                                    flexItem
                                                                  />
                                                                  <Grid item>
                                                                    <Stack
                                                                      direction="column"
                                                                      justifyContent="center"
                                                                      alignItems="center"
                                                                      spacing={
                                                                        1
                                                                      }
                                                                    >
                                                                      <EditIcon
                                                                        sx={{
                                                                          m: 1,
                                                                          cursor: "pointer",
                                                                        }}
                                                                        onClick={() =>
                                                                          handleEditQuestion(
                                                                            questionId
                                                                          )
                                                                        }
                                                                      />
                                                                      <Divider
                                                                        color="#778791"
                                                                        orientation="Horizontal"
                                                                        flexItem
                                                                      />
                                                                      <IconButton
                                                                        sx={{
                                                                          color:
                                                                            "#0C1825",
                                                                        }}
                                                                        disabled={
                                                                          questions?.length ==
                                                                          1
                                                                        }
                                                                      >
                                                                        <DeleteIcon
                                                                          onClick={() =>
                                                                            onQuestionDelete(
                                                                              questionId
                                                                            )
                                                                          }
                                                                        />
                                                                      </IconButton>
                                                                    </Stack>
                                                                  </Grid>
                                                                  <Divider
                                                                    color="#778791"
                                                                    orientation="vertical"
                                                                    flexItem
                                                                  />
                                                                  <Grid
                                                                    {...provided.dragHandleProps}
                                                                    item
                                                                    sx={{
                                                                      ml: -1,
                                                                      mr: 1,
                                                                    }}
                                                                  >
                                                                    <DragIndicatorIcon />
                                                                  </Grid>
                                                                </>
                                                              ) : (
                                                                signedinUserRoleHT ===
                                                                "caseworker" ||
                                                                (!formDetails.assessmentStat && (
                                                                  <>
                                                                    <Divider
                                                                      color="#778791"
                                                                      sx={{
                                                                        mr: -2,
                                                                      }}
                                                                      orientation="vertical"
                                                                      flexItem
                                                                    />
                                                                    <Grid
                                                                      item
                                                                    >
                                                                      <Stack
                                                                        direction="column"
                                                                        justifyContent="center"
                                                                        alignItems="center"
                                                                        spacing={
                                                                          1
                                                                        }
                                                                      >
                                                                        <IconButton 
                                                                          sx={{
                                                                            color: "#0C1825",
                                                                          }}
                                                                          disabled={(signedinUserRoleHT === "superadmin" || formDetails?.globalDefault) ? true : false}
                                                                        >
                                                                          <EditIcon
                                                                            sx={{
                                                                              m: 1,
                                                                              cursor:
                                                                                "pointer",
                                                                            }}
                                                                            onClick={() =>
                                                                              handleEditQuestion(
                                                                                questionId
                                                                              )
                                                                            }
                                                                          />
                                                                        </IconButton>
                                                                        <Divider
                                                                          color="#778791"
                                                                          orientation="Horizontal"
                                                                          flexItem
                                                                        />
                                                                        <IconButton
                                                                          sx={{
                                                                            color:
                                                                              "#0C1825",
                                                                          }}
                                                                          disabled={
                                                                            questions?.length == 1 || (signedinUserRoleHT === "superadmin" || formDetails?.globalDefault)
                                                                          }
                                                                        >
                                                                          <DeleteIcon
                                                                            onClick={() =>
                                                                              onQuestionDelete(
                                                                                questionId
                                                                              )
                                                                            }
                                                                          />
                                                                        </IconButton>
                                                                      </Stack>
                                                                    </Grid>
                                                                    <Divider
                                                                      color="#778791"
                                                                      orientation="vertical"
                                                                      flexItem
                                                                    />
                                                                    {(signedinUserRoleHT !== "superadmin" && !formDetails?.globalDefault) && (
                                                                    <Grid
                                                                      {...provided.dragHandleProps}
                                                                      item
                                                                      sx={{
                                                                        ml: -1,
                                                                        mr: 1,
                                                                      }}
                                                                    >
                                                                      <DragIndicatorIcon />
                                                                    </Grid>)}
                                                                  </>
                                                                ))
                                                              )}
                                                            </Grid>
                                                          </Box>
                                                        </Card>
                                                      )}
                                                    </Draggable>
                                                  );
                                                }
                                              )
                                            ) : (
                                              <></>
                                            );
                                          }
                                        )}

                                      {provided.placeholder}
                                    </Box>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </Box>
                          </TabPanel>
                        );
                      })}
                  </Card>
                )}
              </Box>
            </Card>

            <Snackbar
              open={open}
              autoHideDuration={6000}
              onClose={handleClose}
              message={t("common:question.Keep Atleast One Question")}
              action={action}
            />
          </Grid>
        </Grid>
        <Dialog
          fullWidth
          open={deleteModalFlag}
          onClose={() => {
            setDeleteModalFlag(false);
          }}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.9)",
              minWidth: "100%",
            },
          }}
          style={{
            marginTop: "6%",
            marginBottom: "0.5%",
            marginLeft: leftMargin,
            marginRight: rightMargin,
            backgroundColor: "transparent",
          }}
          overlayStyle={{ backgroundColor: "transparent" }}
        >
          <DialogContent
            style={{
              display: "flex",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography sx={{ textAlign: "center" }}>
              {t("common:question.Want To Delete This Question")}
            </Typography>
          </DialogContent>
          <DialogActions
            style={{
              position: "relative",
              marginBottom: "1%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              style={{ borderRadius: 2 }}
              onClick={() => {
                setDeleteModalFlag(false);
              }}
            >
              {t("common:common.No")}
            </Button>
            <Button
              variant="contained"
              style={{ borderRadius: 2 }}
              onClick={handleDomainRemove}
            >
              {t("common:common.Yes")}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullWidth
          open={cancelModalFlag}
          onClose={() => {
            setCancelModalFlag(false);
          }}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.9)",
              minWidth: "100%",
            },
          }}
          style={{
            marginTop: "6%",
            marginBottom: "0.5%",
            marginLeft: leftMargin,
            marginRight: rightMargin,
            backgroundColor: "transparent",
          }}
          overlayStyle={{ backgroundColor: "transparent" }}
        >
          <DialogContent
            style={{
              display: "flex",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography sx={{ textAlign: "center" }}>
              {t("common:question.WantToCancel")}
            </Typography>
          </DialogContent>
          <DialogActions
            style={{
              position: "relative",
              marginBottom: "1%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              style={{ borderRadius: 2 }}
              onClick={() => {
                setCancelModalFlag(false);
              }}
            >
              {t("common:common.No")}
            </Button>
            <Button
              variant="contained"
              style={{ borderRadius: 2 }}
              onClick={handleYesCancel}
            >
              {t("common:common.Yes")}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullScreen
          open={modalFlag}
          onClose={handleClose}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.9)",
            },
          }}
          style={{
            marginRight: "2.5%",
            marginTop: "6%",
            marginBottom: "0.5%",
            marginLeft: "22%",
            backgroundColor: "transparent",
          }}
          overlayStyle={{ backgroundColor: "transparent" }}
        >
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <DialogTitle
              style={{
                display: "flex",
                marginTop: "15%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {t("common:question.Deleting")} {formDetails?.formName}
            </DialogTitle>
            <Typography sx={{ textAlign: "center" }}>
              {t("common:question.Form Delete")}
            </Typography>
            <Typography sx={{ textAlign: "center" }}>
              {t("common:question.Form Delete2")}
            </Typography>
            <br />
            <Typography sx={{ textAlign: "center", maxWidth: "52%" }}>
              {t("common:question.Want To Delete This Form")}
            </Typography>
            <br />
            <DialogActions
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="outlined"
                style={{ borderRadius: 2 }}
                onClick={handleCancelOperation}
              >
                {t("common:question.No Cancel")}
              </Button>
              {isCreateForm ? (
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  style={{ borderRadius: 2 }}
                  onClick={handleDeleteForm}
                >
                  {t("common:question.Yes Delete")}
                </LoadingButton>
              ) : formDetails?.assessmentStat ? (
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  style={{ borderRadius: 2 }}
                  onClick={UpdateFormStatus}
                >
                  {t("common:question.Yes Unpublish")}
                </LoadingButton>
              ) : (
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  style={{ borderRadius: 2 }}
                  onClick={handleDeleteForm}
                >
                  {t("common:question.Yes Delete")}
                </LoadingButton>
              )}
            </DialogActions>
          </DialogContent>
        </Dialog>
        <Dialog
          fullScreen
          open={modalFlagPublish}
          onClose={handleClose}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.9)",
            },
          }}
          style={{
            marginRight: "2.5%",
            marginTop: "6%",
            marginBottom: "0.5%",
            marginLeft: "22%",
            backgroundColor: "transparent",
          }}
          overlayStyle={{ backgroundColor: "transparent" }}
        >
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {formList?.length < 1 ? (
              <DialogTitle
                style={{
                  display: "flex",
                  marginTop: formList?.length > 0 ? "3%" : "12%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isCreateForm
                  ? "Publish"
                  : formDetails?.isPublished
                    ? t("common:question.Unpublish")
                    : t("common:question.Publish")}{" "}
                {formName}
              </DialogTitle>
            ) : (
              <DialogTitle
                style={{
                  display: "flex",
                  marginTop: formList?.length > 0 ? "3%" : "12%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {formName}{" "}
                {t("common:question.Successfully Unpublished")}
              </DialogTitle>
            )}
            {formList?.length < 1 ? (
              <Typography sx={{ textAlign: "center", maxWidth: "75%" }}>
                {isCreateForm
                  ? t("common:question.Form Publish")
                  : formDetails?.isPublished
                    ? t("common:question.Want To Unpublish This Form") +
                    t("common:question.Form Unpublish")
                    : t("common:question.Form Publish")}
              </Typography>
            ) : (
              <Typography sx={{ textAlign: "center", maxWidth: "35%" }}>
                {t("common:question.Your Form Has Been Unpublished")}
              </Typography>
            )}

            {formList?.length < 1 && (
              <>
                <br />
                <Typography sx={{ textAlign: "center", maxWidth: "52%" }}>
                  {isCreateForm
                    ? t("common:question.Want To Publish This Form")
                    : formDetails?.isPublished
                      ? t("common:question.Want To Unpublish This Form")
                      : t("common:question.Want To Publish This Form")}
                </Typography>
                <br />
              </>
            )}
            {formList?.length > 0 && (
              <>
                <br />
                <div style={{ maxHeight: "60%", overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead
                      style={{ color: "white", backgroundColor: "#1D334B" }}
                    >
                      <TableRow>
                        <TableCell sx={{ color: "white" }}>
                          {t("common:form.Form Name")}
                        </TableCell>
                        <TableCell align="center" sx={{ color: "white" }}>
                          {t("common:common.Actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formList &&
                        formList.map((form) => {
                          return (
                            <StyledTableRow hover key={form.id}>
                              <TableCell>
                                <Button color="inherit" variant="text">
                                  {form.formName}
                                </Button>
                              </TableCell>

                              <TableCell align="center" spacing={1}>
                                {signedinUserRoleHT === "superadmin" ||
                                  signedinUserRoleHT === "admin" ||
                                  signedinUserRoleHT === "admin+caseworker" ? (
                                  <Tooltip title={t("common:form.manageForm")}>
                                    <Button
                                      color="primary"
                                      style={{ borderRadius: 4 }}
                                      variant="contained"
                                      size="small"
                                      onClick={() =>
                                        handlePreviewFormFromTheTable(form)
                                      }
                                    >
                                      {t("common:question.Preview And Publish")}
                                    </Button>
                                  </Tooltip>
                                ) : (
                                  <></>
                                )}
                              </TableCell>
                            </StyledTableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
            {formList?.length < 1 ? (
              <DialogActions
                style={{
                  position: "relative",
                  marginBottom: "15%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  style={{ borderRadius: 2 }}
                  onClick={handleCancelOperation}
                >
                  {t("common:question.No Cancel")}
                </Button>
                {isCreateForm ? (
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    style={{ borderRadius: 2 }}
                    onClick={PublishForm}
                  >
                    {t("common:question.Save Publish")}
                  </LoadingButton>
                ) : formDetails?.isPublished ? (
                  <>
                    <LoadingButton
                      loading={loading}
                      variant="contained"
                      style={{ borderRadius: 2 }}
                      onClick={UpdateFormStatus}
                    >
                      {t("common:question.Yes Unpublish")}
                    </LoadingButton>
                  </>
                ) : (
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    style={{ borderRadius: 2 }}
                    onClick={PublishForm}
                  >
                    {t("common:question.Save Publish")}
                  </LoadingButton>
                )}
              </DialogActions>
            ) : (
              <DialogActions
                style={{
                  position: "relative",
                  marginBottom: "2%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  style={{ borderRadius: 2 }}
                  onClick={onCloseAfterUnpublish}
                >
                  {t("common:common.Close")}
                </Button>
              </DialogActions>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default FormBuilder;
