import { Box } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import React from "react";
import { DateTimeFormatFromRegion } from "../../constants";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import BodyText from "../BodyText/BodyText";

const DateTimeRangePicker = ({
  errors,
  values,
  touched,
  setFieldValue,
  disableStartDate,
}) => {
  const { t } = useTranslation(["common"]);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <BodyText
        value={t("common:system messages.Starts at")}
        minWidth={50}
        fontWeight={600}
      />
      <DateTimePicker
        id="starts-date"
        label={t("common:system messages.Starts at")}
        // defaultValue={undefined}
        value={values?.startsAt ? dayjs(values.startsAt) : undefined}
        onChange={(newValue) => {
          setFieldValue("startsAt", newValue);
        }}
        format={DateTimeFormatFromRegion()}
        closeOnSelect={false}
        disabled={disableStartDate}
        //   maxDate={dayjs()}
        //   sx={{ width: 1 }}
        // disablePast
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            height: 48, // Adjust the height here
          },
          "& .MuiFormLabel-root": {
            top: "-4px",
          },
        }}
        slotProps={{
          textField: {
            required: true,
            error: touched?.startsAt && Boolean(errors?.startsAt),
            helperText: <>{touched?.startsAt && errors?.startsAt}</>,
          },
        }}
      />

      <BodyText
        value={t("common:system messages.Ends at")}
        minWidth={50}
        fontWeight={600}
      />
      <DateTimePicker
        id="ends-date"
        label={t("common:system messages.Ends at")}
        // defaultValue={undefined}
        value={values?.endsAt ? dayjs(values.endsAt) : undefined}
        onChange={(newValue) => {
          setFieldValue("endsAt", newValue);
        }}
        closeOnSelect={false}
        // disablePast
        format={DateTimeFormatFromRegion()}
        //   maxDate={dayjs()}
        //   sx={{ width: 1 }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            height: 48, // Adjust the height here
          },
          "& .MuiFormLabel-root": {
            top: "-4px",
          },
        }}
        slotProps={{
          textField: {
            required: true,
            error: touched?.endsAt && Boolean(errors?.endsAt),
            helperText: <>{touched?.endsAt && errors?.endsAt}</>,
          },
        }}
      />
    </Box>
  );
};

export default DateTimeRangePicker;
