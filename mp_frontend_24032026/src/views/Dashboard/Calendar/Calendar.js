import { useState, useRef, useEffect, useCallback, useContext } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import FullCalendar, { getSlotClassNames } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import timelinePlugin from "@fullcalendar/timeline";
import hiLocale from "@fullcalendar/core/locales/hi";
import taLocale from "@fullcalendar/core/locales/ta-in";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  TextField,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CalendarEventForm, CalendarToolbar } from "../Components/Calendar";
import { useTranslation } from "react-i18next";
import PlusIcon from "../../../assets/icons/Plus";
import APIS from "../../../common/hooks/UseApiCalls";
import useMounted from "../../../common/hooks/UseMounted";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownMultiNameToFilter from "../../../components/UserComponents/AutoCompleteDropdownMultiNameToFilter";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import { styled } from "@mui/system";
import { alpha } from "@mui/material/styles";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
  SUPER_ADMIN,
  VIEW_ONLY,
} from "../../../helpers/constant";

const FullCalendarWrapper = styled("div")(({ theme }) => ({
  "& .fc-license-message": {
    display: "none",
  },
  "& .fc": {
    "--fc-bg-event-opacity": 1,
    "--fc-border-color": theme.palette.divider,
    "--fc-daygrid-event-dot-width": "10px",
    "--fc-event-text-color": theme.palette.text.primary,
    "--fc-list-event-hover-bg-color": theme.palette.background.default,
    "--fc-neutral-bg-color": theme.palette.background.default,
    "--fc-page-bg-color": theme.palette.background.default,
    "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.25),
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  "& .fc .fc-col-header-cell-cushion": {
    paddingBottom: "10px",
    paddingTop: "10px",
  },
  "& .fc .fc-day-other .fc-daygrid-day-top": {
    color: theme.palette.text.secondary,
  },
  "& .fc-daygrid-event": {
    padding: "10px",
  },
  "& .fc-h-event .fc-event-main-frame": {
    display: "block" /* for make fc-event-title-container expand */,
  },
}));

const Calendar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const {
    reIntegrationTypeList,
    roleList,
    signedinUserRoleHT,
    signedinOrgType,
    organizationList,
  } = useContext(CommonDataContext);
  const calendarRef = useRef(null);
  const mobileDevice = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const caseWorkerRoleId = roleList?.find(
    (r) => r.cognitoValue == "casemanager"
  )?.id;
  const orgId = localStorage.getItem("orgId");
  const isDCPUOrg = organizationList?.find(
    (item) => item.id === orgId
  )?.isDCPUOrg;
  const [events, setEvents] = useState([]);
  const [assessmentEvents, setAssessmentEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [eventChildId, setEventChildId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedReintegration, setSelectedReintegration] = useState(0);
  const [selectedChild, setSelectedChild] = useState(0);
  const [selectedUser, setSelectedUser] = useState(0);
  const [selectedDeleteType, setSelectedDeleteType] = useState("currentEvent");
  const currentLanguage = localStorage.getItem("language");
  const mounted = useMounted();
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedRange = null;
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(mobileDevice ? "listWeek" : "dayGridMonth");
  const [families,setFamilies] = useState([])

  useEffect(() => {
    if (signedinUserRoleHT !== null && signedinOrgType !== null) {
      if (signedinUserRoleHT === "viewonly") {
        navigate("/Unauthorized");
      } else {
        getAssessments();
        getEvents();
        getChildren();
        getFamilies()
        getUserList();
      }
    }
    return () => {};
  }, [signedinUserRoleHT, signedinOrgType]);

  useEffect(() => {
    document.title = "Calendar | ThriveWell";
  }, []);

  const getFamilies = useCallback(
    async () => {
      setLoading(true);
      try {
        let finalPayload={
          rowCount: "10000",
          pageNumber: "1",
          orderByField: [["familyName", "ASC"]],
          familyStatus: "",
          globalSearchQuery: "",
          TWAccountId: "",
          HTCountryId : localStorage.getItem("userRegion")
        }
       
        const data = await APIS.FamilyList(finalPayload);
        setFamilies(data && data.data && data.data.familyDetails);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  useEffect(() => {
    const caseWorkerPayload = {
      rowCount: "",
      pageNumber: "1",
      orderByField: [["firstName", "ASC"]],
      globalSearchQuery: "",
      HTOrganizationId: "",
      HTLanguageId: "",
      HTChildPlacementStatusId: "",
      HTChildStatusId: "",
      needFullData: "true",
      HTUserRoleId: ["4", "5"],
    };
    getUserList(caseWorkerPayload);
  }, [roleList]);

  const getChildrenListpayloadConstant = {
    rowCount: "",
    pageNumber: "1",
    orderByField: [["firstName", "ASC"]],
    globalSearchQuery: "",
    HTOrganizationId: "",
    HTLanguageId: "",
    HTChildPlacementStatusId: "",
    HTChildStatusId: "",
    needFullData: "true",
  };

  const getUserListpayloadConstant = {
    rowCount: "",
    pageNumber: "1",
    orderByField: [["firstName", "ASC"]],
    globalSearchQuery: "",
    HTOrganizationId: "",
    HTLanguageId: "",
    HTChildPlacementStatusId: "",
    HTChildStatusId: "",
    needFullData: "true",
    HTUserRoleId: ["4", "5"],
  };

  let getUserListpayload = {
    rowCount: "",
    pageNumber: "1",
    orderByField: [["firstName", "ASC"]],
    globalSearchQuery: "",
    HTOrganizationId: "",
    HTLanguageId: "",
    HTChildPlacementStatusId: "",
    HTChildStatusId: "",
    needFullData: "true",
  };

  let getAssessmentListpayload = {
    rowCount: "",
    pageNumber: "1",
    orderByField: [["id", "DESC"]],
    assessmentStatus: "",
    globalSearchQuery: "",
    isComplete: "",
    needFullData: "true",
    userTimeZone: userTimeZone,
  };

  const calculateMilliseconds = (dateString) => {
    // var dateString = "07/09/2021 - 09:15";  // Format Example
    const dateArgs = dateString.match(/\d{2,4}/g);
    const year = dateArgs[2];
    const month = parseInt(dateArgs[1]) - 1;
    const day = dateArgs[0];
    const hour = dateArgs[3] || "00";
    const minutes = dateArgs[4] || "00";

    const milliseconds = new Date(year, month, day, hour, minutes).getTime();
    return milliseconds;
  };

  const getChildren = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getChildrenListpayloadConstant;
        } else {
          finalPayload = { ...getUserListpayload, ...payload };
          getUserListpayload = { ...finalPayload };
        }
        console.log("final payload >>", finalPayload);
        const data = await APIS.ListChildren(finalPayload);
        console.log("api call", data);
        //if (mounted.current) {
        if (data === undefined) {
          // getUserList();
        }
        setChildren(data && data.data && data.data.data);
        setLoading(false);
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  const getUserList = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getUserListpayloadConstant;
        } else {
          finalPayload = { ...getUserListpayload, ...payload };
          getUserListpayload = { ...finalPayload };
        }
        console.log("final payload >>", finalPayload);
        const data = await APIS.ListUsers(finalPayload);
        console.log("api call", data);
        //if (mounted.current) {
        if (data === undefined) {
          // getUserList();
        }
        setUsers(data && data.data && data.data.data);
        setLoading(false);
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  const getAssessments = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getAssessmentListpayload;
        } else {
          finalPayload = { ...getAssessmentListpayload, ...payload };
        }
        const data = await APIS.AssessmentList(finalPayload);
        //if (mounted.current) {
        // console.log("assessent data", data);
        const temp = data && data.data && data.data.data;
        const formattedEvents =
          temp?.length &&
          temp?.map((item) => {
            const formattedEvent = {
              id: item.id,
              allDay: true,
              color: item.isComplete ? "#43a048" : null,
              description:
                item.caseWorkerFirstName + " " + item.caseWorkerLastName,
              start: calculateMilliseconds(item.dateOfAssessment),
              end: calculateMilliseconds(item.dateOfAssessment),
              title:item?.type === "CHILD" ?
                  "CHILD" +
                  "-" +
                  item.childId +
                  " - " +
                  item.childFirstName +
                  " " +
                  item.childLastName : "FAMILY" +
                  "-" +
                  item.HTFamilyId +
                  " - " +
                  item.familyName,
              HTChildId: item?.type === "CHILD" && item.childId ,
              HTFamilyId:item?.type === "FAMILY" && item.HTFamilyId,
              isChild:item?.type === "CHILD",
              isComplete: item.isComplete,
              isAssessment: true,
            };
            return formattedEvent;
          });
        // setEvents(formattedEvents)
        setAssessmentEvents(formattedEvents);
        setLoading(false);
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  const getEvents = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = {
            userTimeZone: userTimeZone,
          };
        } else {
          finalPayload = payload;
        }
        const data = await APIS.ListEvents(finalPayload);
        console.log("events data", data);
        //if (mounted.current) {
        // console.log("assessent data", data);
        const temp = data && data.data && data.data.data;
        const formattedEvents = temp?.map((item) => {
          const formattedEvent = {
            id: item.id,
            allDay: false,
            color: "#f37123" || "#ffcc00",
            description: item.description,
            start: calculateMilliseconds(
              moment(item.startTimeInLocal).format("DD-MM-YYYY HH:mm:ss")
            ),
            end: calculateMilliseconds(
              moment(item.endTimeInLocal).format("DD-MM-YYYY HH:mm:ss")
            ),
            endRecur: item.endRecur
              ? calculateMilliseconds(
                  moment(item.endRecur).format("DD-MM-YYYY HH:mm:ss")
                )
              : "",
            endRecurLocal: item.recurrenceEndDate || "",
            recurrenceTypeName: item.recurringEventName,
            title: item.title,
            isComplete: item.isComplete,
            isChild:true,
            HTChildId: item.HTChildId,
          };
          return formattedEvent;
        });
        setEvents(formattedEvents);
        setLoading(false);
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  useEffect(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = mobileDevice ? "listWeek" : "dayGridMonth";

      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [mobileDevice]);

  const handleDateToday = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleViewChange = (newView) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      setView(newView);
    }
  };

  const handleDatePrev = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleDateNext = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  const handleAddClick = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleRangeSelect = (arg) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.unselect();
    }
    setIsModalOpen(true);
  };

  const handleEventSelect = (arg) => {
    const selectedEventId = arg.event.id;
    if (selectedEventId) {
      const currentEvent = [...events, ...(assessmentEvents || [])].find(
        (_event) => _event.id === selectedEventId
      );
      setSelectedEvent(currentEvent);
      setIsModalOpen(true);
    }
  };

  const handleEventResize = async ({ event }) => {
    try {
      //   await dispatch(updateEvent(event.id, {
      //     allDay: event.allDay,
      //     start: event.start,
      //     end: event.end
      //   }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventDrop = async ({ event }) => {
    try {
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateValue) => {
    const formattedDate = moment(dateValue).format("YYYY-MM-DD HH:mm:ss");
    return formattedDate;
  };

  const handleAdd = async (data) => {
    setLoading(true);
    setIsModalOpen(false);
    let payload = {
      title: data.title,
      description: data.description,
      recurringEventName: data.recurrenceTypeName,
      startDate: formatDate(data.start),
      endDate: formatDate(data.end),
      HTChildId: data.HTChildId,
      recurrenceEndDate: data.endRecur ? formatDate(data.endRecur) : "",
    };
    try {
      await APIS.CreateEvents(payload).then((resp) => {
        if (
          resp &&
          resp.data &&
          resp.status === 200 &&
          resp.data.Message === "Event Created Successfully"
        ) {
          toast.success(t("common:calendar.Event Added Successfully"));
          setLoading(false);
        } else {
          toast.error(t("common:common.Something went wrong"));
          setLoading(false);
        }
      });
    } catch (err) {
      toast.error(t("common:warnings.Error Occured"));
      setLoading(false);
    }
    getEvents();
    setSelectedEvent(null);
  };

  const handleDelete = (id, childId) => {
    setEventId(id);
    setEventChildId(childId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      let finalPayload = {
        id: eventId,
        deleteType: selectedDeleteType,
        HTChildId: eventChildId,
      };
      await APIS.DeleteEvents(finalPayload).then((resp) => {
        if (
          resp &&
          resp.data &&
          resp.status === 200 &&
          resp.data.Message === "Event Deleted Successfully"
        ) {
          toast.success(t("common:calendar.Event Deleted Successfully"));
          setLoading(false);
        } else {
          toast.error(t("common:common.Something went wrong"));
          setLoading(false);
        }
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
    setIsModalOpen(false);
    setIsDeleteOpen(false);
    setSelectedEvent(null);
    getEvents();
  };

  const handleEdit = async (id, data) => {
    let payload = {
      id: data.id,
      title: data.title,
      description: data.description,
      recurringEventName: data.recurrenceTypeName,
      startDate: formatDate(data.start),
      endDate: formatDate(data.end),
      HTChildId: data.HTChildId,
      recurrenceEndDate: data.endRecur ? formatDate(data.endRecur) : "",
      // "userTimeZone": userTimeZone,
      isComplete: data.isComplete,
    };
    try {
      await APIS.EditEvents(payload).then((resp) => {
        if (
          resp &&
          resp.data &&
          resp.status === 200 &&
          resp.data.Message === "Event Updated Successfully"
        ) {
          toast.success(t("common:calendar.Event Updated Successfully"));
          setLoading(false);
        } else {
          toast.error(t("common:common.Something went wrong"));
          setLoading(false);
        }
      });
    } catch (err) {
      toast.error(t("common:warnings.Error Occured"));
      setLoading(false);
    }
    getEvents();
    //setEvents(updatedEvents)
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleChildFilter = (value) => {
    const childId = value;
    let eventsPayload = {
      userTimeZone: userTimeZone,
    };
    setSelectedChild(childId);
    if (childId !== "0") {
      getAssessmentListpayload.childFilter = childId;
      eventsPayload.childFilter = childId;
    }
    getAssessmentListpayload.caseWorkerFilter =
      selectedUser !== "0" ? selectedUser : "";
    getAssessmentListpayload.reIntegrationTypeFilter =
      selectedReintegration !== "0" ? selectedReintegration : "";
    getAssessments(getAssessmentListpayload);
    getEvents(eventsPayload);
  };

  const handleCaseWorkerFilter = (value) => {
    const userId = value;
    setSelectedUser(userId);
    if (userId !== "0") {
      getAssessmentListpayload.caseWorkerFilter = userId;
    }
    getAssessmentListpayload.childFilter =
      selectedChild !== "0" ? selectedChild : "";
    getAssessmentListpayload.reIntegrationTypeFilter =
      selectedReintegration !== "0" ? selectedReintegration : "";
    getAssessments(getAssessmentListpayload);
  };

  const handleReIntegrationFilter = (value) => {
    const integrationId = value;
    setSelectedReintegration(integrationId);
    if (integrationId !== "0") {
      getAssessmentListpayload.reIntegrationTypeFilter = integrationId;
    }
    getAssessmentListpayload.childFilter =
      selectedChild !== "0" ? selectedChild : "";
    getAssessmentListpayload.caseWorkerFilter =
      selectedUser !== "0" ? selectedUser : "";
    getAssessments(getAssessmentListpayload);
  };

  const getLocale = () => {
    switch (currentLanguage) {
      case "ta":
        return taLocale;
      case "hi":
        return hiLocale;
      default:
        return null;
    }
  };

  console.log(
    "signedinOrgType",
    signedinOrgType,
    signedinUserRoleHT,
    isDCPUOrg
  );
  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Calendar | Material Kit Pro</title>
      </Helmet> */}
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          py: 4,
        }}
      >
        <Container maxWidth={false}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item>
              <Typography color="textPrimary" variant="h5">
                {t("common:common.Calendar")}
              </Typography>
            </Grid>

            {[ADMIN, ADMIN_CASEWORKER, CASEWORKER].includes(
              signedinUserRoleHT
            ) && (
              <Grid item>
                <Box sx={{ m: -1 }}>
                  <Button
                    color="primary"
                    onClick={handleAddClick}
                    startIcon={<PlusIcon fontSize="small" />}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {t("common:common.New Event")}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 3 }}>
            <CalendarToolbar
              date={date}
              onDateNext={handleDateNext}
              onDatePrev={handleDatePrev}
              onDateToday={handleDateToday}
              onViewChange={handleViewChange}
              view={view}
            />
          </Box>
          <Box sx={{ ml: 2, mt: 5, mb: 1 }}>
            <Grid container spacing={3}>
              <TextField
                sx={{ width: 250, ml: 1 }}
                name="child"
                accessKey1="firstName"
                accessKey2="lastName"
                component={AutoCompleteDropdownMultiNameToFilter}
                getValueFunction={(value) => {
                  handleChildFilter(value);
                }}
                label="child"
                options={children}
                textFieldProps={{
                  fullWidth: true,
                  margin: "normal",
                  variant: "outlined",
                  label: t("common:common.Child"),
                }}
              />
              {[SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, VIEW_ONLY].includes(
                signedinUserRoleHT
              ) && (
                <TextField
                  sx={{ width: 250, ml: 1 }}
                  name="caseworker"
                  accessKey1="firstName"
                  accessKey2="lastName"
                  component={AutoCompleteDropdownMultiNameToFilter}
                  getValueFunction={(value) => {
                    handleCaseWorkerFilter(value);
                  }}
                  label="caseworker"
                  options={users}
                  textFieldProps={{
                    fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label: t("common:common.Case Worker"),
                  }}
                />
              )}
              <TextField
                sx={{ width: 250, ml: 2 }}
                name="reintegration"
                accessKey="reIntegrationType"
                EnableClearable={true}
                component={AutoCompleteDropdownToFilter}
                getValueFunction={(value) => {
                  handleReIntegrationFilter(value);
                }}
                label="reintegration"
                options={reIntegrationTypeList}
                textFieldProps={{
                  fullWidth: true,
                  margin: "normal",
                  variant: "outlined",
                  label: t("common:assessment.Type Reintegration"),
                }}
              />
            </Grid>
          </Box>
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
          <Card
            sx={{
              mt: 3,
              p: 2,
            }}
          >
            <FullCalendarWrapper>
              <FullCalendar
                locale={currentLanguage === "en" ? null : getLocale()}
                allDayMaintainDuration
                dayMaxEventRows={3}
                droppable
                editable={false}
                eventClick={handleEventSelect}
                eventDisplay="block"
                eventDrop={handleEventDrop}
                eventResizableFromStart
                eventResize={handleEventResize}
                events={[...(events || []), ...(assessmentEvents || [])]}
                headerToolbar={false}
                height={800}
                eventTimeFormat={{
                  hour: "numeric",
                  minute: "2-digit",
                  omitZeroMinute: true,
                  //meridiem: "short",
                  hour12: true,
                }}
                initialDate={date}
                initialView={view}
                plugins={[
                  dayGridPlugin,
                  interactionPlugin,
                  listPlugin,
                  timeGridPlugin,
                  timelinePlugin,
                ]}
                ref={calendarRef}
                rerenderDelay={10}
                select={handleRangeSelect}
                selectable
                weekends
              />
            </FullCalendarWrapper>
          </Card>
          {!selectedEvent ? (
            signedinUserRoleHT === "admin" ||
            signedinUserRoleHT === "caseworker" ||
            signedinUserRoleHT === "admin+caseworker" ? (
              <Dialog
                fullWidth
                maxWidth="sm"
                onClose={handleModalClose}
                open={isModalOpen}
              >
                {/* Dialog renders its body even if not open */}
                {isModalOpen && (
                  <CalendarEventForm
                    event={selectedEvent}
                    onAddComplete={handleAdd}
                    onCancel={handleModalClose}
                    onDeleteComplete={handleDelete}
                    onEditComplete={handleEdit}
                    range={selectedRange}
                    children={children}
                    families={families}
                  />
                )}
              </Dialog>
            ) : (
              <></>
            )
          ) : (
            <Dialog
              fullWidth
              maxWidth="sm"
              onClose={handleModalClose}
              open={isModalOpen}
            >
              {/* Dialog renders its body even if not open */}
              {isModalOpen && (
                <CalendarEventForm
                  event={selectedEvent}
                  onAddComplete={handleAdd}
                  onCancel={handleModalClose}
                  onDeleteComplete={handleDelete}
                  onEditComplete={handleEdit}
                  range={selectedRange}
                  children={children}
                  families={families}
                />
              )}
            </Dialog>
          )}
          <Dialog aria-labelledby="simple-dialog-title" open={isDeleteOpen}>
            <DialogTitle id="simple-dialog-title">
              {t("common:calendar.Delete Event")}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t("common:calendar.confirmDeleteEvent")}
                <br></br>
                <Grid item md={12} xs={12}>
                  <RadioGroup
                    row
                    value={selectedDeleteType}
                    onChange={(e) => setSelectedDeleteType(e.target.value)}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <FormControlLabel
                      value="currentEvent"
                      name="currentEvent"
                      required
                      control={<Radio required={true} />}
                      label={t("common:calendar.Delete Current Event")}
                    />
                    <FormControlLabel
                      value="futureEvents"
                      required
                      name="futureEvents"
                      control={<Radio required={true} />}
                      label={t(
                        "common:calendar.Delete this Event and Future Events"
                      )}
                    />
                    <FormControlLabel
                      value="allEvents"
                      required
                      name="allEvents"
                      control={<Radio required={true} />}
                      label={t("common:calendar.Delete All Events")}
                    />
                  </RadioGroup>
                </Grid>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => confirmDelete()} color="primary">
                {t("common:common.Yes")}
              </Button>
              <Button
                onClick={() => setIsDeleteOpen(false)}
                color="primary"
                autoFocus
              >
                {t("common:common.No")}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
};

export default Calendar;
