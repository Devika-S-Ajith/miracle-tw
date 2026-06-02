import { useState, useRef, useEffect, useCallback, useContext } from 'react';
// import { format } from 'date-fns';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import { addDays, endOfDay, setHours, setMinutes, startOfDay, subDays } from 'date-fns';
// import { Helmet } from 'react-helmet-async';
import FullCalendar, { getSlotClassNames } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
// import esLocale from '@fullcalendar/core/locales/en';
import hiLocale from '@fullcalendar/core/locales/hi';
import taLocale from '@fullcalendar/core/locales/ta-in';
import {
  Box,
  // Breadcrumbs,
  Button,
  Card,
  Container,
  Dialog,
  Grid,
  TextField,
  // Link,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { alpha, experimentalStyled } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { CalendarEventForm, CalendarToolbar } from '../Components/Calendar';
// import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';
import PlusIcon from '../../../assets/icons/Plus';
import APIS from '../../../common/hooks/UseApiCalls';
import useMounted from '../../../common/hooks/UseMounted';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import AutoCompleteDropdownMultiNameToFilter from '../../../components/UserComponents/AutoCompleteDropdownMultiNameToFilter'
import AutoCompleteDropdownToFilter from '../../../components/UserComponents/AutoCompleteDropdownToFilter'

// import gtm from '../../lib/gtm';
// import {
//   closeModal,
//   getEvents,
//   openModal,
//   selectEvent,
//   selectRange,
//   updateEvent
// } from '../../../slices/calendar';
// import { useDispatch, useSelector } from '../../store';

// const selectedEventSelector = (state) => {
//   const { events, selectedEventId } = state.calendar;

//   if (selectedEventId) {
//     return events.find((_event) => _event.id === selectedEventId);
//   }

//   return null;
// };

const FullCalendarWrapper = experimentalStyled('div')(({ theme }) => ({
  '& .fc-license-message': {
    display: 'none'
  },
  '& .fc': {
    '--fc-bg-event-opacity': 1,
    '--fc-border-color': theme.palette.divider,
    '--fc-daygrid-event-dot-width': '10px',
    '--fc-event-text-color': theme.palette.text.primary,
    '--fc-list-event-hover-bg-color': theme.palette.background.default,
    '--fc-neutral-bg-color': theme.palette.background.default,
    '--fc-page-bg-color': theme.palette.background.default,
    '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.25),
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily
  },
  '& .fc .fc-col-header-cell-cushion': {
    paddingBottom: '10px',
    paddingTop: '10px'
  },
  '& .fc .fc-day-other .fc-daygrid-day-top': {
    color: theme.palette.text.secondary
  },
  '& .fc-daygrid-event': {
    padding: '10px'
  },
  '& .fc-h-event .fc-event-main-frame': {
    display: 'block' /* for make fc-event-title-container expand */
    }
}));

const Calendar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { reIntegrationTypeList, roleList, signedinUserRole, signedinOrgType, organizationList } = useContext(CommonDataContext);
  const calendarRef = useRef(null);
  const mobileDevice = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const caseWorkerRoleId = roleList?.find(r => r.role == "Case Worker")?.id
  const orgId = localStorage.getItem('orgId');
  const isDCPUOrg = organizationList?.find(item => item.id === orgId)?.isDCPUOrg;
//   const { events, isModalOpen, selectedRange } = useSelector((state) => state.calendar);
// const events = [];
// const now = new Date();
// let eventsData = [
//   {
//     id: '5e8882e440f6322fa399eeb8',
//     allDay: false,
//     color: '#43a048',
//     description: 'Inform about new contract',
//     end: setHours(setMinutes(subDays(now, 6), 0), 19).getTime(),
//     start: setHours(setMinutes(subDays(now, 6), 30), 17).getTime(),
//     title: 'Call Samantha'
//   },
//   {
//     id: '5e8882eb5f8ec686220ff131',
//     allDay: false,
//     color: null,
//     description: 'Discuss about new partnership',
//     end: setHours(setMinutes(addDays(now, 2), 30), 15).getTime(),
//     start: setHours(setMinutes(addDays(now, 2), 0), 12).getTime(),
//     title: 'Meet with IBM'
//   },
//   {
//     id: '5e8882f1f0c9216396e05a9b',
//     allDay: false,
//     color: null,
//     description: 'Prepare docs',
//     end: setHours(setMinutes(addDays(now, 5), 0), 12).getTime(),
//     start: setHours(setMinutes(addDays(now, 5), 0), 8).getTime(),
//     title: 'SCRUM Planning'
//   },
//   {
//     id: '5e8882f6daf81eccfa40dee2',
//     allDay: true,
//     color: null,
//     description: 'Meet with team to discuss',
//     end: startOfDay(subDays(now, 11)).getTime(),
//     start: endOfDay(subDays(now, 12)).getTime(),
//     title: 'Begin SEM'
//   },
//   {
//     id: '5e8882fcd525e076b3c1542c',
//     allDay: false,
//     color: '#43a048',
//     description: 'Sorry, John!',
//     end: setHours(setMinutes(addDays(now, 3), 31), 7).getTime(),
//     start: setHours(setMinutes(addDays(now, 3), 30), 7).getTime(),
//     title: 'Fire John'
//   },
//   {
//     id: '5e888302e62149e4b49aa609',
//     allDay: false,
//     color: null,
//     description: 'Discuss about the new project',
//     end: setHours(setMinutes(subDays(now, 6), 30), 9).getTime(),
//     start: setHours(setMinutes(subDays(now, 6), 0), 9).getTime(),
//     title: 'Call Alex'
//   },
//   {
//     id: '5e88830672d089c53c46ece3',
//     allDay: false,
//     color: '#43a048',
//     description: 'Get a new quote for the payment processor',
//     end: setHours(setMinutes(now, 30), 17).getTime(),
//     start: setHours(setMinutes(now, 30), 15).getTime(),
//     title: 'Visit Samantha'
//   }
// ];
// const isModalOpen = false;
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
const [selectedDeleteType, setSelectedDeleteType] = useState('currentEvent');
const currentLanguage = localStorage.getItem('language');
const mounted = useMounted();
const [children, setChildren] = useState([]);
const [users, setUsers] = useState([]);
const [loading,setLoading] = useState(false);
const selectedRange = null;
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(mobileDevice
    ? 'listWeek'
    : 'dayGridMonth');

//   useEffect(() => {
//     gtm.push({ event: 'page_view' });
//   }, []);

  // useEffect(() => {
  //   // dispatch(getEvents());
  // }, []);

  // var dateString = "07/09/2021 - 09:15";
  // const dateArgs = dateString.match(/\d{2,4}/g);
  // const year = dateArgs[2];
  // const month = parseInt(dateArgs[1]) - 1;
  // const day = dateArgs[0];
  // const hour = dateArgs[3] || '00';
  // const minutes = dateArgs[4] || '00';

  // var milliseconds = new Date(year, month, day, hour, minutes).getTime();

  useEffect(() => { 
    if(signedinUserRole !== null && signedinOrgType !== null){
      if(signedinUserRole === 'viewonly'){
        navigate('/Unauthorized');
      } else {
        getAssessments();
        getEvents();
        getChildren();
        getUserList();
      }
    }
    return () => {
      
    }
  }, [signedinUserRole,signedinOrgType]);

  useEffect(() => {
    document.title = "Calendar | Miracle Foundation"
  }, [])

  useEffect(() => {
    const caseWorkerPayload = {
      "rowCount": "",
      "pageNumber": "1",
      "orderByField": [
            ["firstName", "ASC"]
          ],
      "globalSearchQuery": "",
      "HTOrganizationId": "",
      "HTLanguageId": "",
      "HTChildPlacementStatusId": "",
      "HTChildStatusId": "",
      "needFullData": "true",
      "HTUserRoleId": roleList?.find(r => r.role == "Case Worker")?.id 
    }
    getUserList(caseWorkerPayload);
  }, [roleList])

  const getChildrenListpayloadConstant = {
    "rowCount": "",
    "pageNumber": "1",
    "orderByField": [
          ["firstName", "ASC"]
        ],
    "globalSearchQuery": "",
    "HTOrganizationId": "",
    "HTLanguageId": "",
    "HTChildPlacementStatusId": "",
    "HTChildStatusId": "",
    "needFullData": "true"
  }

  const getUserListpayloadConstant = {
    "rowCount": "",
    "pageNumber": "1",
    "orderByField": [
          ["firstName", "ASC"]
        ],
    "globalSearchQuery": "",
    "HTOrganizationId": "",
    "HTLanguageId": "",
    "HTChildPlacementStatusId": "",
    "HTChildStatusId": "",
    "needFullData": "true",
    "HTUserRoleId": caseWorkerRoleId 
  }

  let getUserListpayload = {
    "rowCount": "",
    "pageNumber": "1",
    "orderByField": [
          ["firstName", "ASC"]
        ],
    "globalSearchQuery": "",
    "HTOrganizationId": "",
    "HTLanguageId": "",
    "HTChildPlacementStatusId": "",
    "HTChildStatusId": "",
    "needFullData": "true"
  }

  let getAssessmentListpayload = {
    "rowCount": "",
    "pageNumber": "1",
    "orderByField": [
        [
            "id",
            "DESC"
        ]
    ],
    "assessmentStatus": "",
    "globalSearchQuery": "",
    "isComplete": "",
    "needFullData": "true",
    "userTimeZone": userTimeZone
  }

  const calculateMilliseconds = (dateString) => {
    // var dateString = "07/09/2021 - 09:15";  // Format Example
    const dateArgs = dateString.match(/\d{2,4}/g);
    const year = dateArgs[2];
    const month = parseInt(dateArgs[1]) - 1;
    const day = dateArgs[0];
    const hour = dateArgs[3] || '00';
    const minutes = dateArgs[4] || '00';

    const milliseconds = new Date(year, month, day, hour, minutes).getTime();
    return milliseconds
  }

  const getChildren = useCallback(async (payload = null) => {
    setLoading(true)
    try {
      let finalPayload
      if(payload === null){
        finalPayload = getChildrenListpayloadConstant
      } else {
            finalPayload = { ...getUserListpayload, ...payload};
            getUserListpayload = { ...finalPayload }
      }
      console.log("final payload >>",finalPayload)
      const data = await APIS.ListChildren(finalPayload);
      console.log("api call",data) 
      //if (mounted.current) {
        if(data=== undefined){
          // getUserList();
        }
        setChildren(data && data.data && data.data.data);
        setLoading(false)
      //}
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, [mounted]);

  const getUserList =  useCallback(async (payload = null) => {
    setLoading(true)
    try {
      let finalPayload
      if(payload === null){
        finalPayload = getUserListpayloadConstant
      } else {
            finalPayload = { ...getUserListpayload, ...payload};
            getUserListpayload = { ...finalPayload }
      }
      console.log("final payload >>",finalPayload)
      const data = await APIS.ListUsers(finalPayload);
      console.log("api call",data) 
      //if (mounted.current) {
        if(data=== undefined){
          // getUserList();
        }
        setUsers(data && data.data && data.data.users);
        setLoading(false)
      //}
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, [mounted]);

  const getAssessments =  useCallback(async (payload = null) => {
    setLoading(true)
    try {
      let finalPayload
      if(payload === null){
        finalPayload = getAssessmentListpayload;
      } else {
        finalPayload = { ...getAssessmentListpayload, ...payload};
      }
      const data = await APIS.AssessmentList(finalPayload); 
      //if (mounted.current) {
        // console.log("assessent data", data);
        const temp = data && data.data && data.data.data;
        const formattedEvents = temp?.length && temp?.map(item => {
          const formattedEvent = {
            id: item.id,
            allDay: true,
            color: item.isComplete ? '#43a048' : null,
            description: item.caseWorkerFirstName + ' ' + item.caseWorkerLastName,
            start: calculateMilliseconds(item.dateOfAssessment),
            end: calculateMilliseconds(item.dateOfAssessment),
            title: "CHILD"+'-'+item.childId + ' - ' + item.childFirstName + ' ' + item.childLastName,
            HTChildId: item.childId,
            isComplete: item.isComplete,
            isAssessment: true
          }
          return formattedEvent
        })
        // setEvents(formattedEvents)
        setAssessmentEvents(formattedEvents)
        setLoading(false)
      //}
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, [mounted]);

  const getEvents =  useCallback(async (payload = null) => {
    setLoading(true)
    try {
      let finalPayload
      if(payload === null){
        finalPayload = {
          "userTimeZone": userTimeZone
        };
      } else {
        finalPayload = payload;
      }
      const data = await APIS.ListEvents(finalPayload); 
      console.log("events data", data);
      //if (mounted.current) {
        // console.log("assessent data", data);
        const temp = data && data.data && data.data.data;
        const formattedEvents = temp?.map(item => {
          const formattedEvent = {
            id: item.id,
            allDay: false,
            color: '#f37123' || '#ffcc00',
            description: item.description,
            start: calculateMilliseconds(moment(item.startTimeInLocal).format('DD-MM-YYYY HH:mm:ss')),
            end: calculateMilliseconds(moment(item.endTimeInLocal).format('DD-MM-YYYY HH:mm:ss')),
            endRecur: item.endRecur ? calculateMilliseconds(moment(item.endRecur).format('DD-MM-YYYY HH:mm:ss')) : '',
            endRecurLocal: item.recurrenceEndDate || '',
            recurrenceTypeName: item.recurringEventName,
            title: item.title,
            isComplete: item.isComplete,
            // isAssessment: false,
            HTChildId: item.HTChildId
          }
          return formattedEvent
        })
        setEvents(formattedEvents)
        setLoading(false)
      //}
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, [mounted]);

  useEffect(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = mobileDevice ? 'listWeek' : 'dayGridMonth';

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
    setSelectedEvent(null)
    setIsModalOpen(true)
  };

  const handleRangeSelect = (arg) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.unselect();
    }
    setIsModalOpen(true)
  };

  const handleEventSelect = (arg) => {
    const selectedEventId = arg.event.id;
    if (selectedEventId) {
      const currentEvent = [...events, ...assessmentEvents].find((_event) => _event.id === selectedEventId);
      setSelectedEvent(currentEvent)
      setIsModalOpen(true)
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
    //   await dispatch(updateEvent(event.id, {
    //     allDay: event.allDay,
    //     start: event.start,
    //     end: event.end
    //   }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  };

  const formatDate = (dateValue) => {
    // const formattedDate = new Date(dateValue).toLocaleDateString() + " " + new Date(dateValue).toLocaleTimeString()
    const formattedDate = moment(dateValue).format('YYYY-MM-DD HH:mm:ss')
    return formattedDate
  }

  const handleAdd = async (data) => {
    setLoading(true)
    setIsModalOpen(false)
    let payload = {    
      "title": data.title,
      "description": data.description,
      "recurringEventName": data.recurrenceTypeName,
      "startDate": formatDate(data.start),
      "endDate": formatDate(data.end),
      "HTChildId": data.HTChildId,
      "recurrenceEndDate" : data.endRecur ? formatDate(data.endRecur) : "",
      // "userTimeZone": userTimeZone
    }
    try {
      await APIS.CreateEvents(payload)
      .then((resp)=>{
        if(resp && resp.data && resp.status === 200 && 
          resp.data.Message === 'Event Created Successfully'){
          toast.success(t('common:calendar.Event Added Successfully'));
          setLoading(false)
        }else{
          toast.error(t('common:common.Something went wrong'));
          setLoading(false)
        }
      })
    }catch(err){
      toast.error(t('common:warnings.Error Occured'));
      setLoading(false)
    }
    // setEvents([...events, data])
    getEvents()
    setSelectedEvent(null)
  };

  const handleDelete = (id, childId) => {
    setEventId(id)
    setEventChildId(childId)
    setIsDeleteOpen(true)
  };

  const confirmDelete = async() => {
    setLoading(true)
    try {
      let finalPayload = {
        id: eventId,
        deleteType: selectedDeleteType,
        HTChildId: eventChildId
      }
      await APIS.DeleteEvents(finalPayload)
      .then((resp)=>{
        if(resp && resp.data && resp.status === 200 && 
          resp.data.Message === 'Event Deleted Successfully'){
          toast.success(t('common:calendar.Event Deleted Successfully'));
          setLoading(false)
        }else{
          toast.error(t('common:common.Something went wrong'));
          setLoading(false)
        }
      });
      setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
    // const updatedEvents = events.filter((_event) => _event.id !== eventId);
    // setEvents(updatedEvents)
    setIsModalOpen(false)
    setIsDeleteOpen(false)
    setSelectedEvent(null)
    getEvents();
  };

  const handleEdit = async (id, data) => {
    let payload = {
      "id": data.id,
      "title": data.title,
      "description": data.description,
      "recurringEventName": data.recurrenceTypeName,
      "startDate": formatDate(data.start),
      "endDate": formatDate(data.end),
      "HTChildId": data.HTChildId,
      "recurrenceEndDate" : data.endRecur ? formatDate(data.endRecur) : "",
      // "userTimeZone": userTimeZone,
      "isComplete": data.isComplete
    }
    try {
      await APIS.EditEvents(payload)
      .then((resp)=>{
        if(resp && resp.data && resp.status === 200 && 
          resp.data.Message === 'Event Updated Successfully'){
          toast.success(t('common:calendar.Event Updated Successfully'));
          setLoading(false)
        }else{
          toast.error(t('common:common.Something went wrong'));
          setLoading(false)
        }
      })
    }catch(err){
      toast.error(t('common:warnings.Error Occured'));
      setLoading(false)
    }
    // const updatedEvents = events.map((_event) => {
    //   if (_event.id === id) {
    //     return data;
    //   }

    //   return _event;
    // });
    getEvents();
    //setEvents(updatedEvents)
    setIsModalOpen(false)
    setSelectedEvent(null)
  };

  const handleChildFilter = (value) => { 
    const childId = value
    let eventsPayload = {
      "userTimeZone": userTimeZone
    };
    setSelectedChild(childId)
    if(childId !== "0"){
      getAssessmentListpayload.childFilter = childId;
      eventsPayload.childFilter = childId;
    }
    getAssessmentListpayload.caseWorkerFilter = selectedUser !== "0" ? selectedUser : '';
    getAssessmentListpayload.reIntegrationTypeFilter = selectedReintegration !== "0" ? selectedReintegration : '';
    getAssessments(getAssessmentListpayload)
    getEvents(eventsPayload)
  }

  const handleCaseWorkerFilter = (value) => { 
    const userId = value
    setSelectedUser(userId)
    if(userId !== "0"){
      getAssessmentListpayload.caseWorkerFilter = userId;
    }
    getAssessmentListpayload.childFilter = selectedChild !== "0" ? selectedChild : '';
    getAssessmentListpayload.reIntegrationTypeFilter = selectedReintegration !== "0" ? selectedReintegration : '';
    getAssessments(getAssessmentListpayload)
  }

  const handleReIntegrationFilter = (value) => { 
    const integrationId = value
    setSelectedReintegration(integrationId)
    if(integrationId !== "0"){
      getAssessmentListpayload.reIntegrationTypeFilter = integrationId;
    }
    getAssessmentListpayload.childFilter = selectedChild !== "0" ? selectedChild : '';
    getAssessmentListpayload.caseWorkerFilter = selectedUser !== "0" ? selectedUser : '';
    getAssessments(getAssessmentListpayload)
  }

  const getLocale =()=>{
    switch(currentLanguage){
      case "ta":
         return taLocale
      case "hi":
         return hiLocale
      default:
         return null
    }

  }

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Calendar | Material Kit Pro</title>
      </Helmet> */}
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 4
        }}
      >
        <Container maxWidth={false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item>
              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:common.Calendar')}
              </Typography>
              {/* <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Dashboard
                </Link>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                >
                  Calendar
                </Typography>
              </Breadcrumbs> */}
            </Grid>
            {(((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && 
            (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')) 
            || (signedinOrgType == 2 && isDCPUOrg))
            ? <Grid item>
              <Box sx={{ m: -1 }}>
                <Button
                  color="primary"
                  onClick={handleAddClick}
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="contained"
                >
                   {t('common:common.New Event')}
                </Button>
              </Box>
            </Grid> : <></>}
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
          <Box 
            sx={{ ml: 2,mt: 5,mb :1 }}
            >
            <Grid
              container
              spacing={3}
            >
              
              <TextField
                 sx={{width : 250,ml:1}}                       
                 name="child"
                 accessKey1="firstName"
                 accessKey2="lastName"
                 component={AutoCompleteDropdownMultiNameToFilter}
                 getValueFunction={(value)=>{handleChildFilter(value)}}
                 label="child"
                 options={children}
                 textFieldProps={{
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   label:t('common:common.Child')
                 }}
               />
               {signedinUserRole === 'caseworker' ? <></> :
                <TextField
                 sx={{width : 250,ml:1}}                       
                 name="caseworker"
                 accessKey1="firstName"
                 accessKey2="lastName"
                 component={AutoCompleteDropdownMultiNameToFilter}
                 getValueFunction={(value)=>{handleCaseWorkerFilter(value)}}
                 label="caseworker"
                 options={users}
                 textFieldProps={{
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   label:t('common:common.Case Worker')
                 }}
               />}
              {/* <TextField
                sx={{width : 250,ml:1}}
                label={t('common:common.Case Worker')}
                id="caseworker"
                name="caseworker"
                select
                onChange={handleCaseWorkerFilter}
                // SelectProps={{ native: true }}
                value={selectedUser}
                variant="outlined"
              >
                <MenuItem
                  key='0'
                  value='0'
                >
                  All
                </MenuItem>
                { users && users.length > 0 && users.map((type)=>{
                  return(
                    <MenuItem key={type.id} 
                      value={type.id}>
                      {type.firstName} {type.lastName}
                    </MenuItem>
                  );
                })
                }
              </TextField> */}
              {/* <TextField
                sx={{width : 250,ml:1}}
                label={t('common:assessment.Type Reintegration')}
                id="reintegration"
                name="reintegration"
                select
                onChange={handleReIntegrationFilter}
                // SelectProps={{ native: true }}
                value={selectedReintegration}
                // value=''
                variant="outlined"
              >
                <MenuItem
                  key='0'
                  value='0'
                >
                  All
                </MenuItem>
                { reIntegrationTypeList && reIntegrationTypeList.length > 0 && reIntegrationTypeList.map((type)=>{
                  return(
                  <MenuItem key={type.id} 
                    value={type.id}>
                    {type.reIntegrationType}
                  </MenuItem>
                  );
                })
                }
                </TextField> */}
                <TextField
                 sx={{width : 250,ml:2}}                       
                 name="reintegration"
                 accessKey="reIntegrationType"
                 EnableClearable={true}
                 component={AutoCompleteDropdownToFilter}
                 getValueFunction={(value)=>{handleReIntegrationFilter(value)}}
                 label="reintegration"
                 options={reIntegrationTypeList}
                 textFieldProps={{
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   label:t('common:assessment.Type Reintegration')
                 }}
               />
            </Grid>
          </Box>
          {loading && 
            <CircularProgress 
              sx={{
                zIndex : 1000,
                position : "absolute",
                top : "55%",
                left : "45%"
              }}
              color="primary" 
            />}
          <Card
            sx={{
              mt: 3,
              p: 2
            }}
          >
            <FullCalendarWrapper>
              <FullCalendar
                locale={currentLanguage === 'en' ? null : getLocale()}
                allDayMaintainDuration
                dayMaxEventRows={3}
                droppable
                editable={false}
                eventClick={handleEventSelect}
                eventDisplay="block"
                eventDrop={handleEventDrop}
                eventResizableFromStart
                eventResize={handleEventResize}
                events={[...events || [], ...assessmentEvents || []]}
                headerToolbar={false}
                height={800}
                eventTimeFormat= {{
                  hour: 'numeric' ,
                  minute: '2-digit', 
                  omitZeroMinute:true,
                  //meridiem: "short", 
                  hour12: true }
                }
                initialDate={date}
                initialView={view}
                plugins={[
                  dayGridPlugin,
                  interactionPlugin,
                  listPlugin,
                  timeGridPlugin,
                  timelinePlugin
                ]}
                ref={calendarRef}
                rerenderDelay={10}
                select={handleRangeSelect}
                selectable
                weekends
              />
            </FullCalendarWrapper>
          </Card>
          {!selectedEvent ? 
          (((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && 
            (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')) 
            || (signedinOrgType == 2 && isDCPUOrg))
            ?
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
                />
              )}
            </Dialog>
          : <></>
          : 
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
                />
              )}
            </Dialog>
            }
          <Dialog aria-labelledby="simple-dialog-title" open={isDeleteOpen}>
            <DialogTitle id="simple-dialog-title">{t('common:calendar.Delete Event')}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t('common:calendar.confirmDeleteEvent')}<br></br>
                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <RadioGroup 
                    row
                    value={selectedDeleteType}
                    onChange={(e)=>setSelectedDeleteType(e.target.value)}
                    style={{display: 'flex', flexDirection: 'column'}}
                  >
                    <FormControlLabel
                      value="currentEvent"
                      name="currentEvent"
                      required
                      control={<Radio required={true} />}
                      label={t('common:calendar.Delete Current Event')}
                    />
                    <FormControlLabel
                      value="futureEvents"
                      required
                      name="futureEvents"
                      control={<Radio required={true} />} 
                      label={t('common:calendar.Delete this Event and Future Events')}
                    />
                    <FormControlLabel
                      value="allEvents" 
                      required
                      name="allEvents"
                      control={<Radio required={true} />} 
                      label={t('common:calendar.Delete All Events')}
                    />
                  </RadioGroup>
                </Grid>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>confirmDelete()} color="primary">
              {t('common:common.Yes')}
              </Button>
              <Button onClick={()=>setIsDeleteOpen(false)} color="primary"autoFocus>
              {t('common:common.No')}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
};

export default Calendar;
