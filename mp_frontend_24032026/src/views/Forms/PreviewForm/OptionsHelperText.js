import React from "react";
import LabelValue from "../../../components/LabelValue/LabelValue";
import { Box, Stack } from "@mui/material";

const OptionsHelperText = ({ options }) => {
  return (
    <Stack spacing={2} direction="column">
      {options?.["1"]?.trim().length > 0 && (
        <Box>
          <LabelValue
            label={
              <Stack direction="row" mb={0.5} spacing={0.5} alignItems="center">
                <img
                  // key={index}
                  src="/static/icons/inCrisisIcon.png"
                  style={{ width: 15, height: 15 }}
                />
                <span>In-crisis</span>
              </Stack>
            }
            value={options?.["1"]}
            wrap={true}
            tooltip={false}
            descriptionFontWeight={400}
          />
        </Box>
      )}
      {options?.["2"]?.trim().length > 0 && (
        <Box>
          <LabelValue
            label={
              <Stack direction="row" mb={0.5} spacing={0.5} alignItems="center">
                <img
                  // key={index}
                  src="/static/icons/vulnerableIcon.png"
                  style={{ width: 15, height: 15 }}
                />
                <span>Vulnerable</span>
              </Stack>
            }
            value={options?.["2"]}
            wrap={true}
            tooltip={false}
            descriptionFontWeight={400}
          />
        </Box>
      )}
      {options?.["3"]?.trim().length > 0 && (
        <Box>
          <LabelValue
            label={
              <Stack direction="row" mb={0.5} spacing={0.5} alignItems="center">
                <img
                  // key={index}
                  src="/static/icons/safeIcon.png"
                  style={{ width: 15, height: 15 }}
                />
                <span>Safe</span>
              </Stack>
            }
            value={options?.["3"]}
            wrap={true}
            tooltip={false}
            descriptionFontWeight={400}
          />
        </Box>
      )}
      {options?.["4"]?.trim().length > 0 && (
        <Box>
          <LabelValue
            label={
              <Stack direction="row" mb={0.5} spacing={0.5} alignItems="center">
                <img
                  // key={index}
                  src="/static/icons/thrivingIcon.png"
                  style={{ width: 15, height: 15 }}
                />
                <span>Thriving</span>
              </Stack>
            }
            value={options?.["4"]}
            wrap={true}
            tooltip={false}
            descriptionFontWeight={400}
          />
        </Box>
      )}
    </Stack>
  );
};

export default OptionsHelperText;
