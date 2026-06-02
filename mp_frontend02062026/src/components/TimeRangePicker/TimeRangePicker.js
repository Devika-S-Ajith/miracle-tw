import { Box, TextField, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import React from "react";
import { useTranslation } from "react-i18next";

const TimeRangePicker = () => {
  const { t } = useTranslation(["common"]);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="subtitle1" minWidth={50}>
        From
      </Typography>
      <TimePicker
        id="from"
        //   value={values.startsAt ? dayjs(values?.startsAt) : null}
        //   onChange={(time) => setFieldValue("startsAt", time)}
        //   sx={{ width: 1 }}
        // ampm={false}
        format="hh:mm A"
        minuteStep={30}
        label={t("common:common.Start time")}
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
      <Typography variant="subtitle1" minWidth={50}>
        Until
      </Typography>
      <TimePicker
        id="until"
        //   value={values.startsAt ? dayjs(values?.startsAt) : null}
        //   onChange={(time) => setFieldValue("startsAt", time)}
        //   sx={{ width: 1 }}
        // ampm={false}
        format="hh:mm A"
        minuteStep={30}
        label={t("common:common.End time")}
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
    </Box>
  );
};

export default TimeRangePicker;
