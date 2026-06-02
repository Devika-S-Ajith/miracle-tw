import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Link as RouterLink } from 'react-router-dom';
import { addMinutes, addDays, isSameDay, getDay } from 'date-fns';
import * as Yup from 'yup';
import { Formik, Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Divider,
  FormHelperText,
  IconButton,
  // Switch,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import TrashIcon from '../../../../assets/icons/Trash';
import createResourceId from '../../../../__fakeApi__/CreateResourceId';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import { createEvent, deleteEvent, updateEvent } from '../../../../slices/calendar';
// import { useDispatch } from '../../../store';
import AutoCompleteDropdownMultiNames from '../../../../components/UserComponents/AutoCompleteDropdownMultiNames';
import AutoCompleteDropdown from '../../../../components/UserComponents/AutoCompleteDropdown'
import { SUPER_ADMIN, VIEW_ONLY } from '../../../../helpers/constant';
import { MobileDatePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import { formatDateTime } from '../../../../helpers/helperFunction';
import { DateFormatFromRegion, DateTimeFormatFromRegion } from '../../../../constants';
const recurrenceTypes = [{
  id: '1',
  name: 'Does Not Repeat'
}, {
  id: '2',
  name: 'Daily'
}, {
  id: '3',
  name: 'Weekly'
}, {
  id: '4',
  name: 'Fortnightly (Bi-weekly)'
}, {
  id: '5',
  name: 'Monthly'
}, {
  id: '6',
  name: 'Every 2 Months (Bi-monthly)'
}]

const getInitialValues = (event, range) => {
  if (event) {
    return {
      allDay: event.allDay || false,
      color: event.color || '',
      description: event.description || '',
      end: event.end ? new Date(event.end) : addMinutes(new Date(), 30),
      start: event.start ? new Date(event.start) : new Date(),
      endRecur: event.endRecurLocal ? new Date(event.endRecurLocal) : addDays(new Date(), 1),
      title: event.title || '',
      submit: null,
      recurrenceType: event.recurrenceTypeName ? recurrenceTypes.find(item => item.name == event.recurrenceTypeName).id : '1',
      HTChildId: event?.isChild && event.HTChildId || null,
      HTFamilyId: !event?.isChild && event.HTFamilyId || null
    };
  }

  if (range) {
    return {
      allDay: false,
      color: '',
      description: '',
      end: new Date(range.end),
      start: new Date(range.start),
      endRecur: new Date(range.endRecur),
      title: '',
      submit: null,
      recurrenceType: '1',
      HTChildId: null
    };
  }

  return {
    allDay: false,
    color: '',
    description: '',
    end: addMinutes(new Date(), 30),
    start: new Date(),
    endRecur: addDays(new Date(), 1),
    title: '',
    submit: null,
    recurrenceType: '1',
    HTChildId: null
  };
};

const CalendarEventForm = (props) => {
  const { t } = useTranslation(['common']);
  const { event, onAddComplete, onCancel, onDeleteComplete, onEditComplete, range, children ,families} = props;
  const {  signedinUserRoleHT, organizationList } = useContext(CommonDataContext);
  const orgId = localStorage.getItem('orgId');
  const isDCPUOrg = organizationList?.find(item => item.id === orgId)?.isDCPUOrg;
  const [recType, setRecType] = useState([])
  // const recurrenceTypes = [{
  //   id: 1,
  //   name: 'Does Not Repeat'
  // },{
  //   id: 2,
  //   name: 'Daily'
  // },{
  //   id: 3,
  //   name: 'Weekly'
  // },{
  //   id: 4,
  //   name: 'Fortnightly (Bi-weekly)'
  // },{
  //   id: 5,
  //   name: 'Monthly'
  // },{
  //   id: 6,
  //   name: 'Every 2 Months (Bi-monthly)'
  // }]
  const [selectedRecurrenceType, setSelectedRecurrenceType] = useState(1);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isCompleted, setIsCompleted] = useState(event?.isComplete || false);

  const handleDelete = async () => {
    try {
      //   await dispatch(deleteEvent(event.id));

      onDeleteComplete?.(event.id, event.HTChildId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChildFilter = (event) => {
    const childId = event.target.value
    setSelectedChild(childId)
  }

  const getRecurrenceTypeList = (start, end) => {
    if (isSameDay(start, end)) {
      return recurrenceTypes
    } else {
      return recurrenceTypes.filter(item => item.id !== 2)
    }
  }

  const changeCompletedValue = (e) => {
    setIsCompleted(e.target.checked)
  }

  // const checkDisableStatus = () => {
  //   if (((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) &&
  //     (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
  //     || (signedinOrgType == 2 && isDCPUOrg)) {
  //     return false
  //   } else {
  //     return true
  //   }
  // }

  return (
    <Formik
      initialValues={getInitialValues(event, range)}
      validationSchema={Yup
        .object()
        .shape({
          allDay: Yup.bool(),
          description: Yup.string().max(5000),
          end: Yup
            .date()
            .when('start',
              (start, schema) => (start && schema.min(start,
                'End date must be later than start date'))),
          start: Yup.date(),
          endRecur: Yup
            .date()
            .when('recurrenceType', {
              is: (val) => val != 1,
              then: Yup.date().when('end',
                (end, schema) => (end && schema.min(end,
                  t('common:common.Recurring end date must be later than end date')))),
            }),
          // .when('end',
          //   (end, schema) => (end && schema.min(end,
          //     'Recurring end date must be later than end date'))),
          title: Yup
            .string()
            .max(255)
            .required(t('common:warnings.Title is required')),
          recurrenceType: Yup.string().max(5000),
          HTChildId: Yup.string().max(5000).required(t('common:warnings.Child is required')).nullable(),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        console.log('Time',formatDateTime(values.end,values.end))
        try {
          let data = {
            allDay: values.allDay,
            description: values.description,
            end: formatDateTime(values.end,values.end),
            start: formatDateTime(values.start,values.start),
            startRecur: values.recurrenceType !== 1 ? formatDateTime(values.start,values.start) : null,
            endRecur: values.recurrenceType !== 1 ? formatDateTime(values.endRecur,values.endRecur) : null,
            title: values.title,
            color: '#f37123' || '#ffcc00',
            daysOfWeek: values.recurrenceType === 3 ? [getDay(values.start)] : null,
            recurrenceType: values.recurrenceType,
            recurrenceTypeName: recurrenceTypes.find(item => item.id === values.recurrenceType).name,
            HTChildId: values.HTChildId,
            isComplete: isCompleted
          };

          if (event) {
            data.id = event.id;
            data.color = event.color;
            onEditComplete(event.id, data);
            // await dispatch(updateEvent(event.id, data));
          } else {
            data.id = createResourceId();
            onAddComplete(data);
            resetForm();
            // await dispatch(createEvent(data));
          }

          setStatus({ success: true });
          setSubmitting(false);
          // toast.success('Calendar updated!');

          // if (!event && onAddComplete) {
          //   onAddComplete();
          // }

          // if (event && onEditComplete) {
          //   onEditComplete();
          // }
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong!');
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        touched,
        values
      }) => (
        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 3 }}>
            <Typography
              align="center"
              color="textPrimary"
              gutterBottom
              variant="h5"
            >
              {event
                ? (event.isAssessment ? t('common:assessment.Edit Assessment') : t('common:calendar.Edit Event'))
                : t('common:calendar.Add Event')}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {(!event || !event?.isAssessment) ?
              <>
                <TextField
                  error={Boolean(touched.title && errors.title)}
                  fullWidth
                  helperText={touched.title && errors.title}
                  label={t('common:calendar.Title')}
                  name="title"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.title}
                  variant="outlined"
                  disabled={[SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT)}
                />
                <Box sx={{ mt: 2, mb: 2 }}>
                  <TextField
                    error={Boolean(touched.description && errors.description)}
                    fullWidth
                    helperText={touched.description && errors.description}
                    label={t('common:calendar.Description')}
                    name="description"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.description}
                    variant="outlined"
                    disabled={[SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT)}
                  />
                </Box> </> : <></>}
            {/* <Box sx={{ mt: 2 }}>
              <TextField
                error={Boolean(touched.title && errors.title)}
                fullWidth
                helperText={touched.title && errors.title}
                label="Child"
                name="title"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.title}
                variant="outlined"
                disabled={event && event.isAssessment}
              />
            </Box> */}
            {event?.isAssessment && (
              <Field
                fullWidth
                id={event.isChild ? "HTChildId" : "HTFamilyId"}
                name={event.isChild ? "HTChildId" : "HTFamilyId"}
                accessKey1={event.isChild && "firstName"}
                accessKey2={event.isChild && "lastName" }
                accessKey={!event.isChild && "familyName"}
                component={event.isChild ? AutoCompleteDropdownMultiNames : AutoCompleteDropdown}
                disabled={true}
                label={event.isChild ? "HTChildId" : "HTFamilyId"}
                options={event.isChild ? children : families}
                textFieldProps={{
                  fullWidth: true,
                  margin: "normal",
                  variant: "outlined",
                  label: event.isChild ? t('common:common.Child'):t('common:common.Family')
                }}
              />
            )}


            {(event && event?.isAssessment) ?
              <Box sx={{ mt: 2 }}>
                <TextField
                  error={Boolean(touched.description && errors.description)}
                  fullWidth
                  helperText={touched.description && errors.description}
                  label={t('common:common.Case Worker')}
                  name="caseworker"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.description}
                  variant="outlined"
                  disabled
                />
              </Box> : <></>}
            {/* {!event?.isAssessment ?
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={values.allDay}
                    color="primary"
                    name="allDay"
                    onChange={handleChange}
                  />
                )}
                label="All day"
              />
            </Box> : <></> } */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {!event?.isAssessment ?
                <>
                  <Box sx={{ mt: 2 }}>
                    <MobileDateTimePicker
                      label={t('common:calendar.Start Date')}
                      format={DateTimeFormatFromRegion()}
                      inputFormat={DateTimeFormatFromRegion()}
                      minDate={dayjs()}
                      onChange={(date) => setFieldValue('start', date)}
                      renderInput={(inputProps) => (
                        <TextField
                          fullWidth
                          variant="outlined"
                          {...inputProps}
                        />
                      )}
                      value={
                        values.start
                          ? dayjs(values.start)
                          : undefined
                      }
                      disabled={event}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <MobileDateTimePicker
                      label={t('common:calendar.End Date')}
                      format={DateTimeFormatFromRegion()}
                      inputFormat={DateTimeFormatFromRegion()}
                      minDate={dayjs()}
                      onChange={(date) => setFieldValue('end', date)}
                      renderInput={(inputProps) => (
                        <TextField
                          fullWidth
                          variant="outlined"
                          {...inputProps}
                        />
                      )}
                      value={
                        values.end
                          ? dayjs(values.end)
                          : undefined
                      }
                      disabled={event}
                    />
                  </Box>
                </>
                :
                <Box sx={{ mt: 2 }}>
                  <MobileDateTimePicker
                    label={t('common:common.Date of Assessment')}
                    format={DateFormatFromRegion()}
                    inputFormat={DateFormatFromRegion()}
                    minDate={dayjs()}
                    onChange={(date) => setFieldValue('start', date)}
                    renderInput={(inputProps) => (
                      <TextField
                        fullWidth
                        variant="outlined"
                        {...inputProps}
                      />
                    )}
                    value={
                      values.start
                        ? dayjs(values.start)
                        : undefined
                    }
                    disabled
                  />
                </Box>
              }
            </LocalizationProvider>
            {(!event || !event?.isAssessment) ?
              <>
                <Box sx={{ mt: 2 }}>
                  <Field
                    fullWidth
                    name="recurrenceType"
                    id="recurrenceType"
                    accessKey="name"
                    component={AutoCompleteDropdown}
                    disabled={event}
                    label="recurrenceType"
                    options={getRecurrenceTypeList(values.start, values.end)}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t('common:calendar.Recurrence Type')
                    }}

                  />
                </Box>
                {values.recurrenceType !== 1 ?
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ mt: 2 }}>
                      <MobileDatePicker
                        label={t('common:calendar.Recurrence End Date')}
                        minDate={dayjs()}
                        format={DateFormatFromRegion()}
                        inputFormat={DateFormatFromRegion()}
                        onChange={(date) => setFieldValue('endRecur', date)}
                        renderInput={(inputProps) => (
                          <TextField
                            fullWidth
                            variant="outlined"
                            {...inputProps}
                          />
                        )}
                        
                        value={
                          values.endRecur
                            ? dayjs(values.endRecur)
                            : undefined
                        }
                        disabled={event}
                      />
                    </Box>
                  </LocalizationProvider> : <></>}
              </> : <></>}
            {Boolean(touched.end && errors.end) && (
              <Box sx={{ mt: 2 }}>
                <FormHelperText error>
                  {errors.end}
                </FormHelperText>
              </Box>
            )}
            {Boolean(touched.endRecur && errors.endRecur) && (
              <Box sx={{ mt: 2 }}>
                <FormHelperText error>
                  {errors.endRecur}
                </FormHelperText>
              </Box>
            )}
            {event ?
              <FormGroup>
                <FormControlLabel control={<Checkbox checked={isCompleted} onChange={changeCompletedValue} disabled={[SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT)} />} label={t("common:common.Completed")} />
              </FormGroup> : <></>}
            {/* {event && event.isAssessment && !event?.isComplete && ![SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT) &&
              <Button
                color="primary"
                sx={{ mt: 1, mr: 1 }}
                variant="contained"
                component={!event.isComplete ? RouterLink : ''}
                to={`/dashboard/assessments/${event.id}/edit`}
                state={{ editAssessment: true, formRevisionNumber: event.formRevisionNumber }}
                disabled={!event.isComplete ? true : false}
              >
                {t('common:assessment.Edit Assessment')}
              </Button>} */}
            {event && event.isAssessment &&
              <Button
                color="primary"
                sx={{ mt: 1 }}
                variant="contained"
                component={RouterLink}
                to={`/dashboard/assessments/${event.id}/view`}
                state={{ viewAssessment: true, formRevisionNumber: event.formRevisionNumber }}
              >
                {t('common:common.View Assessment')}
              </Button>}
          </Box>
          <Divider />
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              p: 2
            }}
          >
            {event && !event?.isAssessment && ![SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT) && (
              <IconButton onClick={() => handleDelete()}>
                <TrashIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button
              color="primary"
              onClick={onCancel}
              variant="text"
            >
              {t('common:common.Cancel')}
            </Button>
            {(!event || !event?.isAssessment) && ![SUPER_ADMIN,VIEW_ONLY].includes(signedinUserRoleHT) ?
              <Button
                color="primary"
                disabled={isSubmitting}
                sx={{ ml: 1 }}
                type="submit"
                variant="contained"
              >
                {t('common:common.Confirm')}
              </Button> : <></>}
          </Box>
        </form>
      )}
    </Formik>
  );
};

CalendarEventForm.propTypes = {
  event: PropTypes.object,
  onAddComplete: PropTypes.func,
  onCancel: PropTypes.func,
  onDeleteComplete: PropTypes.func,
  onEditComplete: PropTypes.func,
  range: PropTypes.object
};

export default CalendarEventForm;
