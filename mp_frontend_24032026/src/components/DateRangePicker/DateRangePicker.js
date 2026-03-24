import React from "react";
import { Box, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import {
  DateFormatFromRegion,
} from "../../constants";

const DateRangePicker = ({ form, disableStartDate }) => {
  const { t } = useTranslation(["common"]);
  const { values, touched, errors, setFieldValue } = form;
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <DatePicker
        id="from-date"
        label={t("common:tableColumn.From", "From")}
        clearable
        value={values?.from ? dayjs(values.from) : undefined}
        onChange={(newValue) => {
          setFieldValue("from", newValue);
        }}
        format={DateFormatFromRegion()}
        closeOnSelect={true}
        disabled={disableStartDate}
        maxDate={dayjs()}
        disableFuture
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            height: 48, // Adjust the height here
          },
          "& .MuiFormLabel-root": {
            top: "-4px",
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
        slotProps={{
          field:{clearable: true},
          textField: {
            error: touched?.from && Boolean(errors?.from),
            helperText: <>{touched?.from && errors?.from}</>,
          },
        }}
      />
      <DatePicker
        id="to-date"
        label={t("common:tableColumn.To", "To")}
        value={values?.to ? dayjs(values.to) : undefined}
        onChange={(newValue) => {
          setFieldValue("to", newValue);
        }}
        closeOnSelect={true}
        disableFuture
        format={DateFormatFromRegion()}
        maxDate={dayjs()}
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
          field:{clearable: true},
          textField: {
            error: touched?.to && Boolean(errors?.to),
            helperText: <>{touched?.to && errors?.to}</>,
          },
        }}
      />
    </Box>
  );
};

export default DateRangePicker;
