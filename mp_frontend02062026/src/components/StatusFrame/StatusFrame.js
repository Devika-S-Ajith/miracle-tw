import React from "react";
import { Box, Stack } from "@mui/material";
import BodyText from "../BodyText/BodyText";

const StatusFrame = ({ type, label, icon, statusType = null, bgColor, borderColor }) => {
  return (
    <Box
      sx={{
        minWidth: 250,
        backgroundColor: bgColor,
        border: `0.5px solid ${borderColor}`,
        borderRadius: 1,
        padding: 0.5,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <img
          src={icon}
          // alt={altFrom}
          width={20}
          height={20}
          style={{ objectFit: "contain" }}
        />
        <BodyText value={label} />
      </Stack>
    </Box>
  );
};

export default StatusFrame;
