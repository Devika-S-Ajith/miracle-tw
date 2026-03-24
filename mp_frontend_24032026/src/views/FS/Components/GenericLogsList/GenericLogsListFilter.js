import React from "react";
import { Box } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const GenericLogsListFilter = () => {
  const { t } = useTranslation(["common"]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box my>
        <DatePicker
          label={t("common:From*")}
          defaultValue={null}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2 / 8,
            },
          }}
        />
      </Box>
      <Box my>
        <DatePicker
          label={t("common:To*")}
          defaultValue={null}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2 / 8,
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default GenericLogsListFilter;
