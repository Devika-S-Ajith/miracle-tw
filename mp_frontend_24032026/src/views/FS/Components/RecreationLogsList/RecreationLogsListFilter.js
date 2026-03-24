import React from "react";
import { Box } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const RecreationLogsListFilter = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box my>
        <DatePicker
          label={"From*"}
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
          label={"To*"}
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

export default RecreationLogsListFilter;
