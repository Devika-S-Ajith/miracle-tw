import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  convertUnderscoreToText,
  DaysInWeek,
} from "../../../constants";
import DateRangePicker from "../../../components/DateTimeRangePicker";
import TimeRangePicker from "../../../components/TimeRangePicker";
import DateTimeRangePicker from "../../../components/DateTimeRangePicker";
import BodyText from "../../../components/BodyText/BodyText";
import { useParams } from "react-router";

const BannerDetails = ({ form }) => {
  const { t } = useTranslation(["common"]);
  const { id } = useParams();

  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    form;

  const [enabledDays, setEnabledDays] = useState(DaysInWeek);

  useEffect(() => {
    if (
      values.messageFrequency === "ON_CERTAIN_DAYS" &&
      values.startsAt &&
      values.endsAt
    ) {
      const startDate = new Date(values.startsAt);
      const endDate = new Date(values.endsAt);

      // Check if endDate needs to be adjusted
      let adjustedEndDate = new Date(endDate);
      if (
        adjustedEndDate.getTime() < startDate.getTime() &&
        (adjustedEndDate.getDate() === startDate.getDate() + 1 ||
          adjustedEndDate.getTime() < startDate.getTime())
      ) {
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      }

      const dayIndexToNameMap = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let daysToEnable = [];

      if (startDate <= adjustedEndDate) {
        let currentDate = new Date(startDate);
        while (currentDate < adjustedEndDate) {
          const dayOfWeek = currentDate.getDay();
          const dayName = dayIndexToNameMap[dayOfWeek];
          if (!daysToEnable.includes(dayName)) {
            daysToEnable.push(dayName);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add the end day if the endDate is a valid day within the range
        const endDayOfWeek = adjustedEndDate.getDay();
        const endDayName = dayIndexToNameMap[endDayOfWeek];
        if (!daysToEnable.includes(endDayName)) {
          daysToEnable.push(endDayName);
        }
      }

      let prevSelectedDays = DaysInWeek.filter(
        (day) =>
          daysToEnable.includes(day.day) &&
          values?.messageFreqAdditionalInfo?.includes(day.label)
      )?.map((day) => day.label);

      setFieldValue("messageFreqAdditionalInfo", prevSelectedDays);

      const enabledDays = DaysInWeek.filter((day) => {
        return daysToEnable.includes(day.day);
      });

      setEnabledDays(enabledDays);
    } else {
      setEnabledDays(DaysInWeek);
    }
  }, [values.startsAt, values.endsAt, values.messageFrequency]);

  // Handle click event
  const handleDayClick = (day) => {
    const { messageFreqAdditionalInfo } = values;
    if (messageFreqAdditionalInfo.includes(day.label)) {
      // Remove day if already selected
      setFieldValue(
        "messageFreqAdditionalInfo",
        messageFreqAdditionalInfo.filter((d) => d !== day.label)
      );
    } else {
      // Add day if not already selected
      setFieldValue("messageFreqAdditionalInfo", [
        ...messageFreqAdditionalInfo,
        day.label,
      ]);
    }
  };

  useEffect(() => {
    if (!["ALWAYS", "ON_CERTAIN_DAYS"].includes(values?.messageFrequency))
      setFieldValue("messageFrequency", "ALWAYS");
  }, [values?.messageFrequency]);

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
        defaultValue="ALWAYS"
        name="radio-buttons-group"
        // sx={{ gap: 3 }}
        onChange={handleChange}
        value={values?.messageFrequency}
      >
        <FormControlLabel
          name="messageFrequency"
          value="ALWAYS"
          control={<Radio />}
          sx={{ alignItems: "start", my: "10px" }}
          label={
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              onClick={(e) => e.preventDefault()}
            >
              <Typography variant="subtitle1">Always</Typography>

              {values?.messageFrequency === "ALWAYS" && (
                <DateTimeRangePicker
                  disableStartDate={
                    id && values?.messageStatus !== "DRAFT" ? true : false
                  }
                  {...form}
                />
              )}

              {/* <DateRangePicker />
              <TimeRangePicker /> */}
            </Box>
          }
        />
        <FormControlLabel
          name="messageFrequency"
          value="ON_CERTAIN_DAYS"
          control={<Radio />}
          sx={{ alignItems: "start" }}
          label={
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              mt
              onClick={(e) => e.preventDefault()}
            >
              <Typography variant="subtitle1">On certain day(s)</Typography>

              {values?.messageFrequency === "ON_CERTAIN_DAYS" && (
                <>
                  <DateTimeRangePicker
                    disableStartDate={
                      id && values?.messageStatus !== "DRAFT" ? true : false
                    }
                    {...form}
                  />

                  <BodyText
                    value={t("common:system messages.Show message on days")}
                    minWidth={50}
                    fontWeight={600}
                  />
                  <Box display="flex" gap={1}>
                    {DaysInWeek.length > 0 ? (
                      DaysInWeek.map((day) => (
                        <Box
                          key={day.day}
                          p={2}
                          display="flex"
                          alignItems="center"
                          borderRadius={2}
                          border={1}
                          borderColor={
                            enabledDays?.find((obj) => day?.day === obj?.day)
                              ? "#F37123"
                              : "transparent"
                          }
                          boxShadow={2}
                          height={48}
                          sx={{
                            fontWeight: 600,
                            backgroundColor:
                              values?.messageFreqAdditionalInfo?.includes(
                                day?.label
                              )
                                ? "#FEF1E9"
                                : "#ffffff",
                            cursor: enabledDays?.find(
                              (obj) => day?.day === obj?.day
                            )
                              ? "pointer"
                              : "not-allowed",
                          }}
                          onClick={() => {
                            if (
                              enabledDays?.find((obj) => day?.day === obj?.day)
                            )
                              handleDayClick(day);
                          }}
                        >
                          <BodyText
                            value={convertUnderscoreToText(day.label)}
                            fontWeight={600}
                            color={
                              enabledDays?.find((obj) => day?.day === obj?.day)
                                ? "#000"
                                : "#D6DBDE"
                            }
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="subtitle1">
                        No valid days within the selected range.
                      </Typography>
                    )}
                  </Box>
                  {touched?.messageFreqAdditionalInfo && (
                    <Typography fontSize="0.75rem" color="#f44336" ml="14px">
                      {errors?.messageFreqAdditionalInfo}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          }
        />
      </RadioGroup>
    </FormControl>
  );
};

export default BannerDetails;
