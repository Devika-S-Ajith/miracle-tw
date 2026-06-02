import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  TextField,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import APIS from "../../../../common/hooks/UseApiCalls";
import {
  fileUpload,
  generateUniqueKeyForImage,
} from "../../../../helpers/helperFunction";
import CloseIcon from "@mui/icons-material/Close";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import toast from "react-hot-toast";
import FileUploadField from "../../../Dashboard/Components/FileUploadField";
import {
  DateFormatFromRegion,
  combineTimeDate,
  dateFormatter,
  formatTime,
  fromUtc,
  toUtc,
} from "../../../../constants";
import Loader from "../../../../components/UserComponents/Loader";
import { ModalService } from "../../../../components/Modal";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const EventDetailForm = ({ close, eventData, onSuccess }) => {
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Please provide a title"),
    description: Yup.string().required("Please provide a description"),
    venue: Yup.string().required("Venue is required"),
    date: Yup.string()
      .required("Please enter a date")
      .test("is-future", "Past dates are not allowed", function (date) {
        const selectedDate = new Date(date)?.getTime();
        const now = new Date().setHours(0, 0, 0, 0);
        return selectedDate >= now;
      })
      .nullable(),
    startsAt: Yup.string()
      .required("Start time is required")
      .when(["date"], (date, schema) => {
        if (date) {
          return schema.test(
            "is-future-time",
            "Past times are not allowed for today's date",
            function (startsAt) {
              if (startsAt) {
                let checkDate = combineTimeDate(date, formatTime(startsAt));
                const selectedDate = new Date(checkDate)?.getTime();
                const now = new Date();
                return selectedDate >= now;
              }
              return true;
            }
          );
        }
        return schema;
      })
      .nullable(),
    endsAt: Yup.string()
      .required("End time is required")
      .nullable()
      .test(
        "is-greater",
        "The end time must come after the start time",
        function (endsAt) {
          const { startsAt } = this.parent;
          if (startsAt && endsAt) {
            return dayjs(startsAt) < dayjs(endsAt);
          }
          return true;
        }
      ),
    address: Yup.string().required("Street address is required"),
    eventType: Yup.object().required("An event type is required").nullable(),
    articleLink: Yup.string().url("Invalid Link").nullable(),
    eventParticipants: Yup.array()
      .min(1, "At least one participant is required")
      .when("eventType", {
        is: (eventType) => eventType && eventType.key === "AGENTVISIT",
        then: Yup.array()
          .min(1, "At least one participant is required")
          .max(1, "Only one participant can be invited for this event type "),
        otherwise: Yup.array(),
      }),
  });

  const initialValues = {
    title: "",
    description: "",
    articleLink: "",
    venue: "",
    eventType: null,
    address: "",
    date: null,
    startsAt: null,
    endsAt: null,
    eventParticipants: [],
    filePath: null,
    uploadStatus: "INPROCESS",
  };
  const formRef = useRef(null);

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: initialValues,
    onSubmit: (values) => handleSubmitHandler(values),
    innerRef: formRef,
    validateOnChange: true,
  });
  const {
    touched,
    errors,
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = formik;

  const [isLoading, setIsLoading] = useState();

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  const [selectedFile, setSelectedFile] = useState();

  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    getEventTypesList();
  }, []);

  const getEventTypesList = async () => {
    setIsLoading(true);
    try {
      const res = await APIS.getEventTypeList();
      setEventTypes(res?.data?.data);
    } catch (error) {}
    setIsLoading(false);
  };

  useEffect(() => {
    if (eventData && eventTypes.length) {
      setFieldValue("id", eventData?.id);
      setFieldValue("title", eventData?.title);
      setFieldValue("description", eventData?.description);
      setFieldValue("articleLink", eventData?.url);
      setFieldValue("venue", eventData?.venue);
      setFieldValue(
        "eventType",
        eventTypes.find((obj) => obj.key == eventData?.eventType)
      );
      setFieldValue("address", eventData?.address);
      setFieldValue("date", dateFormatter(eventData?.date));

      setFieldValue("startsAt", fromUtc(eventData?.startsAtTimestamp));
      setFieldValue("endsAt", fromUtc(eventData?.endsAtTimestamp));
      setFieldValue(
        "eventParticipants",
        eventData?.participants.map((obj) => ({
          id: obj.FS_familyDetail.id,
          label:
            obj.FS_familyDetail.firstName + " " + obj.FS_familyDetail.lastName,
        }))
      );
      setFieldValue("filePath", eventData?.filePath);
      setFieldValue("uploadStatus", eventData?.uploadStatus);
    }
  }, [eventData, eventTypes]);

  const handleSubmitHandler = (data) => {
    eventData ? updateEventHandler(data) : createEventHandler(data);
  };

  const createEventHandler = async (data = values) => {
    setIsLoading(true);

    let params = {
      title: data.title,
      description: data.description,
      url: data.articleLink,
      venue: data.venue,
      eventType: data.eventType.key,
      address: data.address,
      startsAt: toUtc(combineTimeDate(data.date, formatTime(data.startsAt))),
      endsAt: toUtc(combineTimeDate(data.date, formatTime(data.endsAt))),
      eventParticipants: data.eventParticipants.map((obj) => obj.id),
      filePath: data.filePath,
      hasAttachmentPending: data?.filePath ? true : false,
      uploadStatus: data.uploadStatus,
    };

    if (values?.articleLink?.length) {
      params.filePath = null;
      params.hasAttachmentPending = false;
    } else {
      params.url = null;
    }
    delete params["filePath"];
    try {
      const res = await APIS.createEvent(params);
      if (res.status == 200) {
        setFieldValue("id", res.data.data.id);

        if (!values?.articleLink?.length && selectedFile) {
          let key = generateUniqueKeyForImage(selectedFile.name);
          await getSignedURL(res.data.data.id, key);

          setSelectedFile(undefined);
          await updateEventHandler(values, res.data.data.id, key);
        }
        toast.success(res.data.message);
        setIsLoading(false);

        onSuccess();
        close();
      }
    } catch (error) {}
    setIsLoading(false);
  };

  const updateEventHandler = async (data = values, id, key) => {
    setIsLoading(true);

    let params = {
      id: data.id || id,
      title: data.title,
      description: data.description,
      url: data.articleLink,
      venue: data.venue,
      eventType: data.eventType.key,
      address: data.address,
      startsAt: combineTimeDate(data.date, formatTime(data.startsAt)),
      endsAt: combineTimeDate(data.date, formatTime(data.endsAt)),
      eventParticipants: data.eventParticipants.map((obj) => obj.id),
      filePath: key,
      hasAttachmentPending: false,
      uploadStatus: data?.filePath?.length ? "PROCESSED" : data.uploadStatus,
    };

    if (values?.articleLink?.length) params.filePath = null;
    else {
      params.url = null;
    }
    try {
      if (!values?.articleLink?.length && selectedFile) {
        let key = generateUniqueKeyForImage(selectedFile.name);
        await getSignedURL(params.id, key);
      }
      const res = await APIS.updateEvent(params);
      if (res.status == 200) {
        if (!id) toast.success(res.data.message);
        setIsLoading(false);

        close();
        onSuccess();
      }
    } catch (error) {}
    setIsLoading(false);
  };

  const [familyList, setFamilyList] = useState([]);

  useEffect(() => {
    const getFamilyList = async () => {
      setIsLoading(true);

      let params = {
        rowCount: 10000,
        pageNumber: 1,
        orderByField: [["primaryParentName", "ASC"]],
      };
      try {
        const res = await APIS.getFsFamilyListForDropdown(params);

        if (eventData)
          setFamilyList(
            res?.data?.data?.map((obj) => ({
              id: obj.id,
              label: obj.parentFirstName + " " + obj.parentLastName,
            }))
          );
        else
          setFamilyList([
            { id: -1, label: "Select All" },
            { id: -2, label: "Deselect All" },
            ...res?.data?.data?.map((obj) => ({
              id: obj.id,
              label: obj.parentFirstName + " " + obj.parentLastName,
            })),
          ]);
      } catch (error) {}
      setIsLoading(false);
    };
    getFamilyList();
  }, []);

  const allowedExtensions = new Set([
    "pdf",
    "doc",
    "docx",
    "jpeg",
    "png",
    "jpg",
    "csv",
  ]);

  const fileChangeHandler = (files) => {
    let filenames = files[0].name.split(".");
    let extension = filenames[filenames.length - 1];

    if (files[0].size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return;
    }
    if (!allowedExtensions.has(extension.toLowerCase())) {
      toast.error(
        "File format is not supported. Supported files: .pdf, .doc, .docx, .jpeg, .png, .csv"
      );
      return;
    }
    setSelectedFile(files[0]);
    setFieldValue("filePath", files[0].name);
  };

  const getSignedURL = async (id, key) => {
    try {
      let payload = {
        key: `${id}/${key}`,
        module: "FS_EVENT",
        // module: "FS_CHILD",
      };
      const data = await APIS.generateFileUploadURL(payload);
      if (data && data?.data && data?.data?.data) {
        const response = await fileUpload(selectedFile, data?.data?.data);
        if (response.status === 200) {
          setFieldValue("filePath", key);
          setFieldValue("uploadStatus", "PROCESSED");
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onDeleteFamilyChipHandler = (id) => {
    setFieldValue(
      "eventParticipants",
      values?.eventParticipants?.filter((obj) => obj?.id !== id) || []
    );
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: "Unsaved Changes",
      width: "30%",
      modalDescription:
        "If you leave this page, any changes you have made will be lost",
      actionButtonText: "Leave page",
      onClick: () => close(),
    });
  };
  return (
    <>
      <Loader loading={isLoading} />

      <Box mt={2} mx={-2}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            overflowY: "auto", // 'auto' will add a scrollbar when needed
            maxHeight: "70vh", // Set a maximum height to limit the scrollable area
          }}
          px={2}
          pt={1}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TextField
              id="title"
              error={Boolean(touched?.title && errors?.title)}
              fullWidth
              helperText={touched?.title && errors?.title}
              label="Title"
              name="title"
              onBlur={handleBlur}
              onChange={handleChange}
              required
              value={values?.title}
              variant="outlined"
            />
            <TextField
              id="description"
              error={Boolean(touched?.description && errors?.description)}
              fullWidth
              helperText={touched?.description && errors?.description}
              label="Description"
              name="description"
              onBlur={handleBlur}
              onChange={handleChange}
              required
              value={values?.description}
              variant="outlined"
              multiline
              rows={3}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  id="venue"
                  error={Boolean(touched?.venue && errors?.venue)}
                  fullWidth
                  helperText={touched?.venue && errors?.venue}
                  label="Venue"
                  name="venue"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  required
                  value={values?.venue}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  id="date"
                  label="Date"
                  value={values.date ? dayjs(values.date) : undefined}
                  onChange={(newValue) => {
                    setFieldValue("date", newValue);
                  }}
                  format={DateFormatFromRegion()}
                  required
                  // onBlur={handleBlur}
                  // maxDate={dayjs()}
                  disablePast={true}
                  sx={{ width: 1 }}
                  slotProps={{
                    textField: {
                      error: touched?.date && Boolean(errors?.date),
                      helperText: touched?.date && errors?.date,
                      required: true,
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      margin="normal"
                      required
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <TimePicker
                  id="starts-at"
                  value={values.startsAt ? dayjs(values?.startsAt) : null}
                  onChange={(time) => setFieldValue("startsAt", time)}
                  sx={{ width: 1 }}
                  // ampm={false}
                  format="hh:mm A"
                  minuteStep={30}
                  label="Starts at"
                  placeholder="Select time*"
                  slotProps={{
                    textField: {
                      error: touched?.startsAt && Boolean(errors?.startsAt),
                      helperText: touched?.startsAt && errors?.startsAt,
                      required: true,
                    },
                  }}
                  // referenceDate={values.date ? dayjs(values.date) : undefined}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      margin="normal"
                      required
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TimePicker
                  id="ends-at"
                  value={values.endsAt ? dayjs(values?.endsAt) : null}
                  onChange={(time) => setFieldValue("endsAt", time)}
                  // ampm={false}
                  format="hh:mm A"
                  minuteStep={30}
                  label="Ends at"
                  sx={{ width: 1 }}
                  placeholder="Select time*"
                  slotProps={{
                    textField: {
                      error: touched?.endsAt && Boolean(errors?.endsAt),
                      helperText: touched?.endsAt && errors?.endsAt,
                      required: true,
                    },
                  }}
                  // minTime={dayjs(values?.startsAt)} // Adjust minTime based on startsAt
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      margin="normal"
                      required
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <TextField
              id="street-address"
              error={Boolean(touched?.address && errors?.address)}
              fullWidth
              helperText={touched?.address && errors?.address}
              label="Street address"
              name="address"
              onBlur={handleBlur}
              onChange={handleChange}
              required
              value={values?.address}
              variant="outlined"
            />
            <Autocomplete
              id="eventType"
              name="eventType"
              value={values?.eventType}
              required={true}
              options={eventTypes}
              getOptionLabel={(option) => option.value}
              isOptionEqualToValue={(option, value) => {
                return Object.is(JSON.stringify(option), JSON.stringify(value));
              }}
              disabled={eventData ? true : false}
              sx={{ width: 1 }}
              onChange={(_, newValue) => setFieldValue("eventType", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Event type"
                  required
                  error={touched?.eventType && Boolean(errors?.eventType)}
                  helperText={touched?.eventType && errors?.eventType}
                />
              )}
            />
            <TextField
              id="article-link"
              error={Boolean(touched?.articleLink && errors?.articleLink)}
              fullWidth
              helperText={touched?.articleLink && errors?.articleLink}
              label="Attach link"
              name="articleLink"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values?.articleLink}
              variant="outlined"
              disabled={values?.filePath?.length ? true : false}
            />

            <FileUploadField
              handleChange={fileChangeHandler}
              values={values}
              setFieldValue={setFieldValue}
            />
            <Autocomplete
              sx={{ mb: 1 }}
              multiple
              id="event-participants"
              options={familyList}
              clearIcon={false}
              disableCloseOnSelect
              getOptionLabel={(option) => option.label}
              value={values?.eventParticipants}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                if (newValue.some((obj) => obj.id === -1)) {
                  setFieldValue(
                    "eventParticipants",
                    familyList?.filter((obj) => obj.id !== -1 && obj.id !== -2)
                  );
                  return;
                } else if (newValue.some((obj) => obj.id === -2)) {
                  setFieldValue("eventParticipants", []);
                  return;
                } else {
                  setFieldValue("eventParticipants", newValue);
                }
              }}
              renderTags={(value, getTagProps) => {
                return (
                  <Box
                    display="flex"
                    gap={1}
                    flexDirection="row"
                    flexWrap="wrap"
                  >
                    {value.map((obj) => (
                      <Chip
                        color="primary"
                        key={obj.id}
                        label={obj.label}
                        size="medium"
                        sx={{
                          backgroundColor: "#1D334B",
                          borderRadius: "16px",
                        }}
                        onDelete={() => {
                          onDeleteFamilyChipHandler(obj.id);
                        }}
                        deleteIcon={
                          <CloseIcon
                            style={{
                              fontSize: "17px",
                              pointerEvents: eventData?.participants.some(
                                (fam) => fam.FS_familyDetail.id === obj.id
                              )
                                ? "none"
                                : "unset",
                              opacity: eventData?.participants.some(
                                (fam) => fam.FS_familyDetail.id === obj.id
                              )
                                ? "50%"
                                : "unset",
                            }}
                          />
                        }
                      ></Chip>
                    ))}
                  </Box>
                );
              }}
              renderOption={(props, option, { selected }) => {
                if (option.id < 0) {
                  if (
                    option.id === -1 &&
                    values.eventParticipants?.length === familyList?.length - 2
                  )
                    return;
                  if (option.id === -2 && !values.eventParticipants?.length)
                    return;
                  return <li key={option.id} {...props}>{option.label}</li>;
                }
                return (
                  <li
                  style={{
                    pointerEvents: eventData?.participants.some(
                      (fam) => fam.FS_familyDetail.id === option.id
                    )
                    ? "none"
                    : "",
                  }}
                  {...props}
                  key={option.id}
                  >
                    <Checkbox
                      key={option.id}
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      disabled={eventData?.participants.some(
                        (fam) => fam.FS_familyDetail.id === option.id
                      )}
                    />

                    {option.label}
                  </li>
                );
              }}
              renderInput={(params) => {
                const inputProps = {
                  ...params.InputProps,
                };

                return (
                  <TextField
                    {...params}
                    sx={{
                      width: 1,
                      // ml: 1,

                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0px",
                      },
                    }}
                    error={
                      touched?.eventParticipants &&
                      Boolean(errors?.eventParticipants)
                    }
                    helperText={
                      touched?.eventParticipants && errors?.eventParticipants
                    }
                    textFieldProps={{
                      fullWidth: true,
                      borderRadius: "0px",
                      margin: "normal",
                      variant: "outlined",
                      // placeholder: "Select family",
                    }}
                    // placeholder={selectedCount < 1 && "Select families"}
                    label="Select families"
                    //label="Multi-select Dropdown"
                    variant="outlined"
                    InputProps={inputProps}
                    required={true}
                  />
                );
              }}
            />
          </LocalizationProvider>
        </Box>
        <Box my={2} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="outlined"
            onClick={cancelClickHandler}
          >
            Cancel
          </Button>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default EventDetailForm;
