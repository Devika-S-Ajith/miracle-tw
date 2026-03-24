import React, { useEffect, useState, useCallback, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Chip,
  Typography,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import APIS from "../../../../common/hooks/UseApiCalls";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  fileUpload,
  generateUniqueKeyForImage
} from "../../../../helpers/helperFunction";
import {
  DateFormatFromRegion,
  combineTimeDate,
  formatTime,
  getDayFromDate,
} from "../../../../constants";
import toast from "react-hot-toast";
import Loader from "../../../../components/UserComponents/Loader";
import FileUploadField from "../../../Dashboard/Components/FileUploadField";
import { ModalService } from "../../../../components/Modal";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MessageDetailForm = ({ close, onSuccess }) => {
  const [familyList, setFamilyList] = useState([]);
  const [uploadFile, setUploadedFile] = useState(null);

  const allowedExtensions = new Set([
    "pdf",
    "doc",
    "docx",
    "jpeg",
    "png",
    "jpg",
    "csv",
  ]);
  const recurringTypeList = [
    {
      id: "0",
      type: "Do not Repeat",
      value: "once",
    },
    {
      id: "1",
      type: "Daily",
      value: "daily",
    },
    {
      id: "2",
      type: "Weekly",
      value: "weekly",
    },
    {
      id: "3",
      type: "Monthly",
      value: "monthly",
    },
  ];

  const getFamilyListData = async () => {
    setIsLoading(true);

    const data = await APIS.getFsFamilyListForDropdown({
      rowCount: 10000,
      pageNumber: 1,
      orderByField: [["primaryParentName", "ASC"]],
    });
    let tempList = data.data.data || [];

    setFamilyList([
      { id: -1, label: "Select All" },
      { id: -2, label: "Deselect All" },
      ...tempList,
    ]);

    setIsLoading(false);
  };

  useEffect(() => {
    getFamilyListData();
  }, []);

  const validationSchema = Yup.object().shape({
    title: Yup.string().max(255).required("Please provide a title"),
    description: Yup.string().max(255).required("Please provide a description"),
    date: Yup.object().when("scheduled", {
      is: (val) => val,
      then: (schema) =>
        schema
          .required("Enter a date when this message will be sent")
          .nullable(),
      otherwise: (schema) => schema.nullable(),
    }),
    time: Yup.object().when("scheduled", {
      is: (val) => val,
      then: (schema) =>
        schema
          .required("Enter a time when this message will be sent")
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
      otherwise: (schema) => schema.nullable(),
    }),
    recurringType: Yup.object().when("scheduled", {
      is: (val) => val,
      then: (schema) =>
        schema.required("How often should this message be sent?").nullable(),
      otherwise: (schema) => schema.nullable(),
    }),
    family: Yup.array().min(
      1,
      "Please select the family/families that will receive this message"
    ),
  });

  const initialValues = {
    title: "",
    description: "",
    family: [],
    articleLink: "",
    scheduled: false,
    date: null,
    time: null,
    recurringType: {
      id: "0",
      type: "Do not Repeat",
      value: "once",
    },
  };
  const formRef = useRef(null);

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: initialValues,
    onSubmit: (values) => handleSubmitHandler(values),
    innerRef: formRef,
  });
  const {
    touched,
    errors,
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
  } = formik;

  const [isLoading, setIsLoading] = useState();

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  const updateMessageAttachment = useCallback(async (key, id, attachedDoc) => {
    // New Function
    try {
      let finalPayload = {
        id: id,
        fileName: key,
        uploadStatus: "PROCESSED",
      };
      await APIS.updateMessageAttachment(finalPayload);
      
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getSignedURL = async (attachedDoc, messageId) => {
    let key = generateUniqueKeyForImage(attachedDoc?.name);

    try {
      let payload = {
        key: messageId + "/" + key,
        module: "FS_MESSAGE",
      };
      const data = await APIS.generateFileUploadURL(payload);
      if (data && data?.data && data?.data?.data) {
        const response = await fileUpload(attachedDoc, data?.data?.data);
        if (response.status === 200) {
          await updateMessageAttachment(key, messageId, attachedDoc);
        } else {
          console.log("something went wrong!");
        }
      } else {
        console.log("something went wrong!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onFileChange = (files) => {
    let filenames = files[0]?.name.split(".");
    if (filenames) {
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
      setUploadedFile(files[0]);
      setFieldValue("filePath", files[0].name);
    }
  };

  const handleSubmitHandler = async (data) => {
    setIsLoading(true);
    const payload = {
      body: data.description,
      title: data.title,
      url: data.articleLink,
      messageParticipants: data.family.map((fam) => fam.id),
      uploadStatus: "INPROCESS",
    };
    let res;
    if (data?.scheduled) {
      const freq =
        data?.recurringType.value === "once"
          ? null
          : data?.recurringType.value.toUpperCase();
      payload.frequency = freq;
      payload.schedule = new Date(data?.time).toISOString();
      res = await APIS.createScheduleMessage(payload);
    } else {
      res = await APIS.createMessage(payload);
    }
    if (res && res.status === 200) {
      getSignedURL(uploadFile, res.data?.data?.id);
      toast.success(res.data?.message);
      close();
      onSuccess();
    }
    setIsLoading(false);
  };
  const onDeleteFamilyChipHandler = (id) => {
    setFieldValue(
      "family",
      values?.family?.filter((obj) => obj?.id !== id) || []
    );
  };

  const renderRecurringMessage = ({ value }) => {
    switch (value) {
      case "daily":
        return "The notification will be sent daily.";
      case "weekly":
        return `The notification will be sent every ${getDayFromDate(
          values?.date
        )}.`;

      case "monthly":
        return `The notification will be sent on the ${getDayFromDate(
          values?.date
        )} of every month.`;
      default:
        break;
    }
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
          <TextField
            id="title"
            error={Boolean(touched?.title && errors?.title)}
            fullWidth
            helperText={touched?.title && errors?.title}
            label={"Title"}
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
            label={"Description"}
            name="description"
            onBlur={handleBlur}
            onChange={handleChange}
            required
            value={values?.description}
            variant="outlined"
            multiline
            rows={3}
          />
          <Autocomplete
            multiple
            id="event-participants"
            options={familyList}
            clearIcon={false}
            clea
            disableCloseOnSelect
            getOptionLabel={(option) =>
              option.parentFirstName + ", " + option.parentLastName
            }
            value={values?.family}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(event, newValue) => {
              if (newValue.some((obj) => obj.id === -1)) {
                setFieldValue(
                  "family",
                  familyList?.filter((obj) => obj.id !== -1 && obj.id !== -2)
                );
                return;
              } else if (newValue.some((obj) => obj.id === -2)) {
                setFieldValue("family", []);
                return;
              } else {
                setFieldValue("family", newValue);
              }
            }}
            renderTags={(value, getTagProps) => {
              return (
                <Box display="flex" gap={1} flexDirection="row" flexWrap="wrap">
                  {value.map((obj) => (
                    <Chip
                      color="primary"
                      key={obj.id}
                      label={`${obj.parentFirstName} ${obj.parentLastName}`}
                      size="medium"
                      sx={{
                        backgroundColor: "#1D334B",
                        borderRadius: "16px",
                      }}
                      onDelete={() => {
                        onDeleteFamilyChipHandler(obj.id);
                      }}
                      deleteIcon={<CloseIcon />}
                    ></Chip>
                  ))}
                </Box>
              );
            }}
            renderOption={(props, option, { selected }) => {
              if (option.id < 0) {
                if (
                  option.id === -1 &&
                  values.family?.length === familyList?.length - 2
                )
                  return;
                if (option.id === -2 && !values.family?.length) return;
                return <li {...props}>{option.label}</li>;
              }
              return (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {`${option.parentFirstName} ${option.parentLastName}`}
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
                  error={touched?.family && Boolean(errors?.family)}
                  helperText={touched?.family && errors?.family}
                  textFieldProps={{
                    fullWidth: true,
                    borderRadius: "0px",
                    margin: "normal",
                    variant: "outlined",
                  }}
                  label="Select families"
                  variant="outlined"
                  InputProps={inputProps}
                  required={true}
                />
              );
            }}
          />
          <TextField
            id="articleLink"
            error={Boolean(touched?.articleLink && errors?.articleLink)}
            fullWidth
            helperText={touched?.articleLink && errors?.articleLink}
            label={"Attach link"}
            name="articleLink"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values?.articleLink}
            variant="outlined"
            disabled={values?.filePath?.length ? true : false}
          />

          <FileUploadField
            handleChange={onFileChange}
            values={values}
            setFieldValue={setFieldValue}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="scheduled"
                id="scheduled"
                label="Scheduled"
                checked={values.scheduled}
                onChange={handleChange}
                color="primary"
              />
            }
            label={"Schedule"}
          />
          {values.scheduled && (
            <>
              <Typography
                id="schedule-notification"
                color="textPrimary"
                variant="subtitle2"
                fontSize={"1rem"}
                fontWeight={600}
              >
                Schedule notification
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  id="date"
                  name="date"
                  label={"Date"}
                  value={values.date}
                  onChange={(newValue) => {
                    setFieldValue("date", newValue);
                  }}
                  format={DateFormatFromRegion()}
                  required
                  onBlur={() => setFieldTouched("date", true)}
                  minDate={dayjs()}
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
                <TimePicker
                  id="time"
                  name="time"
                  onChange={(time, timeString) => {
                    setFieldValue("time", time);
                  }}
                  onBlur={() => setFieldTouched("time", true)}
                  format="hh:mm A"
                  minuteStep={30}
                  label={"Time"}
                  placeholder="Select time*"
                  slotProps={{
                    textField: {
                      error: touched?.time && Boolean(errors?.time),
                      helperText: touched?.time && errors?.time,
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
              </LocalizationProvider>
              <Autocomplete
                id="recurringType"
                options={recurringTypeList || []}
                required
                clearIcon={false}
                getOptionLabel={(option) => option.type}
                value={values?.recurringType}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  setFieldValue("recurringType", newValue);
                }}
                disabled={!values?.date}
                onBlur={() => setFieldTouched("recurringType", true)}
                sx={{ width: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={"Recurring type"}
                    required
                    error={
                      touched?.recurringType && Boolean(errors?.recurringType)
                    }
                    helperText={touched?.recurringType && errors?.recurringType}
                    disabled={!values?.date}
                  />
                )}
              />
              {values?.recurringType && (
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                  sx={{ color: "#f37123" }}
                  mt={-1}
                  ml={1}
                >
                  {renderRecurringMessage(values?.recurringType)}
                </Typography>
              )}
            </>
          )}
        </Box>
        <Box my={2} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="outlined"
            onClick={cancelClickHandler}
          >
            {"Cancel"}
          </Button>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {values.scheduled ? "Schedule Message" : "Send Message"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default MessageDetailForm;
