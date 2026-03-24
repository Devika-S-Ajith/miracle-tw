import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  DateFormatFromRegion,
  DateTimeFormatFromRegion,
  DaysInWeek,
} from "../../../constants";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import DateTimeRangePicker from "../../../components/DateTimeRangePicker";

const BellNotificationDetails = ({ form }) => {
  const { t } = useTranslation(["common"]);

  const { values, setFieldValue, handleChange, handleBlur } = form;

  return (
    <FormControl component="fieldset">
      <FormLabel id="message-type">
        <Typography
          fontWeight={600}
          variant="subtitle1"
          color="#000"
          fontSize="1.125rem"
          mb
        >
          {t("common:system messages.How often should this message be shown?")}
        </Typography>
      </FormLabel>
      <RadioGroup
        aria-labelledby="message-frequency"
        defaultValue="ONCE"
        name="radio-buttons-group"
        sx={{ gap: 3 }}
        onChange={handleChange}
        value={values?.messageFrequency}
      >
        <FormControlLabel
          name="messageFrequency"
          value="ONCE"
          control={<Radio />}
          sx={{ alignItems: "start" }}
          label={
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              onClick={(e) => e.preventDefault()}
            >
              <Typography variant="subtitle1">Once</Typography>

              {values?.messageFrequency === "ONCE" && (
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="subtitle1">
                    {t("common:system messages.Send the message on")}
                  </Typography>
                  <DateTimePicker
                    id="starts-date"
                    label={t("common:system messages.Starts at")}
                    // defaultValue={undefined}
                    value={
                      values?.startsAt ? dayjs(values.startsAt) : undefined
                    }
                    onChange={(newValue) => {
                      setFieldValue("startsAt", newValue);
                    }}
                    format={DateTimeFormatFromRegion()}
                    //   maxDate={dayjs()}
                    //   sx={{ width: 1 }}
                    slotProps={{
                      textField: {
                        required: true,
                        //   error:
                        //     touched?.dateOfBirth &&
                        //     Boolean(errors?.dateOfBirth),
                        //   helperText: (

                        //       {touched?.dateOfBirth && errors?.dateOfBirth}
                        //   ),
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          }
        />
        <FormControlLabel
          name="messageFrequency"
          value="REPEATING"
          control={<Radio />}
          sx={{ alignItems: "start" }}
          label={
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              onClick={(e) => e.preventDefault()}
            >
              <Typography variant="subtitle1">Repeating</Typography>
              {values?.messageFrequency === "REPEATING" && (
                <>
                  <Box display="flex" alignItems="center" gap={2}>
                    {/* <Typography variant="subtitle1">
                  {t("common:system messages.Starts")}
                </Typography> */}
                    <DateTimeRangePicker {...form} />

                    {/* <DatePicker
                  id="send-date"
                  label={t("common:system messages.Start date")}
                  // defaultValue={undefined}
                  //   value={
                  //     values.dateOfBirth
                  //       ? dayjs(values.dateOfBirth)
                  //       : undefined
                  //   }
                  //   onChange={(newValue) => {
                  //     setFieldValue("dateOfBirth", newValue);
                  //   }}
                  format={DateFormatFromRegion()}
                  //   maxDate={dayjs()}
                  //   sx={{ width: 1 }}
                  slotProps={{
                    textField: {
                      required: true,
                      //   error:
                      //     touched?.dateOfBirth &&
                      //     Boolean(errors?.dateOfBirth),
                      //   helperText: (

                      //       {touched?.dateOfBirth && errors?.dateOfBirth}
                      //   ),
                    },
                  }}
                />
                <Typography variant="subtitle1">
                  {t("common:system messages.Ends")}
                </Typography>
                <DatePicker
                  id="send-date"
                  label={t("common:system messages.End date")}
                  // defaultValue={undefined}
                  //   value={
                  //     values.dateOfBirth
                  //       ? dayjs(values.dateOfBirth)
                  //       : undefined
                  //   }
                  //   onChange={(newValue) => {
                  //     setFieldValue("dateOfBirth", newValue);
                  //   }}
                  format={DateFormatFromRegion()}
                  //   maxDate={dayjs()}
                  //   sx={{ width: 1 }}
                  slotProps={{
                    textField: {
                      required: true,
                      //   error:
                      //     touched?.dateOfBirth &&
                      //     Boolean(errors?.dateOfBirth),
                      //   helperText: (

                      //       {touched?.dateOfBirth && errors?.dateOfBirth}
                      //   ),
                    },
                  }}
                /> */}
                  </Box>
                  {/* <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1">
                  {t("common:system messages.At")}
                </Typography>
                <TimePicker
                  id="end-time"
                  //   value={values.startsAt ? dayjs(values?.startsAt) : null}
                  //   onChange={(time) => setFieldValue("startsAt", time)}
                  //   sx={{ width: 1 }}
                  // ampm={false}
                  format="hh:mm A"
                  minuteStep={30}
                  label={t("common:system messages.Send time (local)")}
                  placeholder="Select time*"
                  slotProps={{
                    textField: {
                      //   error: touched?.startsAt && Boolean(errors?.startsAt),
                      //   helperText: touched?.startsAt && errors?.startsAt,
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
              </Box> */}
                  <Typography variant="subtitle1">
                    {t("common:system messages.Send message every")}
                  </Typography>
                  <Box display="flex" gap={1}>
                    {DaysInWeek?.map((day) => (
                      <Box
                        p
                        borderRadius={2}
                        border={1}
                        borderColor="#F37123"
                        boxShadow={2}
                        sx={{ backgroundColor: "#FEF1E9" }}
                      >
                        {day.label}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          }
        />
      </RadioGroup>
    </FormControl>
  );
};

export default BellNotificationDetails;
