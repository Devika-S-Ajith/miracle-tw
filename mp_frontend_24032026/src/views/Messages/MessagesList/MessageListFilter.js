import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  convertUnderscoreToText,
  DateTimeFormatFromRegion,
  dateTimeFormatter,
} from "../../../constants";
import dayjs from "dayjs";
import { useContext } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

const MessageListFilter = ({
  onClose,
  applyFilter,
  clearFilter,
  filterValues,
}) => {
  const { t } = useTranslation(["common"]);

  const { systemMessageTypes } = useContext(CommonDataContext);
  const initialValues = {
    messageStatus: filterValues.status || null,
    messageType: filterValues.MPSystemMessageTypeId || null,
    fromDate: filterValues.from?.id || null,
    toDate: filterValues.to?.id || null,
  };

  const [messageTypes, setMessageTypes] = useState([]);

  useEffect(() => {
    if (systemMessageTypes?.length)
      setMessageTypes(
        systemMessageTypes?.map((obj) => ({ id: obj?.id, value: obj?.name }))
      );
  }, [systemMessageTypes]);
  // const validationSchema = Yup.object({
  //   toDate: Yup.string().when("fromDate", (fromDate, schema) => {
  //     return fromDate
  //       ? schema.test({
  //           test: (toDate) => toDate > fromDate,
  //           message: "To date must be greater than From date",
  //         })
  //       : schema;
  //   }),
  // });
  const validationSchema = Yup.object({
    fromDate: Yup.date().nullable(),
    toDate: Yup.date()
      .nullable()
      .when("fromDate", (fromDate, schema) => {
        return fromDate
          ? schema.min(fromDate, "To date must be greater than From date")
          : schema;
      }),
  });

  const handleApplyFilter = (values) => {
    applyFilter({
      status: values.messageStatus,
      MPSystemMessageTypeId: values.messageType,
      from: values.fromDate
        ? {
            id: new Date(values.fromDate),
            value: dateTimeFormatter(new Date(values.fromDate)),
          }
        : null,
      to: values.toDate
        ? {
            id: new Date(values.toDate),
            value: dateTimeFormatter(new Date(values.toDate)),
          }
        : null,
    });
    onClose();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleApplyFilter}
      enableReinitialize
    >
      {({ values, setFieldValue, resetForm, errors, touched }) => (
        <Form>
          <Box display="flex" flexDirection="column" gap={2}>
            <Autocomplete
              id="message-status"
              name="messageStatus"
              value={values.messageStatus}
              options={["Active", "Scheduled", "Draft", "Sent", "Canceled"]}
              sx={{ minWidth: "256px" }}
              fullWidth
              onChange={(_, newValue) =>
                setFieldValue("messageStatus", newValue)
              }
              disableClearable
              getOptionLabel={(option) => convertUnderscoreToText(option)}
              renderInput={(params) => (
                <Field
                  component={TextField}
                  {...params}
                  label="Status"
                  fullWidth
                />
              )}
            />
            <Autocomplete
              id="message-type"
              name="messageType"
              value={values.messageType}
              options={messageTypes}
              sx={{ minWidth: "256px" }}
              fullWidth
              onChange={(_, newValue) => setFieldValue("messageType", newValue)}
              disableClearable
              getOptionLabel={(option) =>
                convertUnderscoreToText(option?.value)
              }
              renderInput={(params) => (
                <Field
                  component={TextField}
                  {...params}
                  label="Message Type"
                  fullWidth
                />
              )}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item md={12}>
                <DateTimePicker
                  id="fromDateBehavior"
                  name="fromDate"
                  value={values.fromDate ? dayjs(values.fromDate) : undefined}
                  disableFuture
                  slotProps={{ field: { clearable: true } }}
                  onChange={(newValue) => setFieldValue("fromDate", newValue)}
                  format={DateTimeFormatFromRegion()}
                  label={t("common:From")}
                  sx={{
                    width: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2 / 8,
                      height: 48,
                    },
                    "& .MuiFormLabel-root": {
                      top: "-4px",
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(touched.fromDate && errors.fromDate)}
                      helperText={touched.fromDate && errors.fromDate}
                    />
                  )}
                />
              </Grid>
              <Grid item md={12}>
                <DateTimePicker
                  id="toDateBehavior"
                  name="toDate"
                  label={t("common:To")}
                  slotProps={{
                    textField: {
                      error: touched?.toDate && Boolean(errors?.toDate),
                      helperText: touched?.toDate && errors?.toDate,
                    },
                  }}
                  value={values.toDate ? dayjs(values.toDate) : undefined}
                  onChange={(newValue) => setFieldValue("toDate", newValue)}
                  clearable
                  format={DateTimeFormatFromRegion()}
                  sx={{
                    width: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2 / 8,
                      height: 48,
                    },
                    "& .MuiFormLabel-root": {
                      top: "-4px",
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      variant="standard"
                      margin="normal"
                    />
                  )}
                />
              </Grid>
            </LocalizationProvider>
            <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
              <Button
                sx={{ borderRadius: "4px" }}
                variant="outlined"
                onClick={() => {
                  clearFilter();
                  resetForm();
                  setTimeout(() => {
                    onClose();
                  }, 100);
                }}
              >
                Clear
              </Button>
              <Button
                sx={{ borderRadius: "4px" }}
                variant="contained"
                type="submit"
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default MessageListFilter;
