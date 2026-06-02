import { Typography } from "@mui/material";
import React from "react";

const SmallText = ({ value, ...props }) => {
  return (
    <Typography
      color="#181A1B"
      fontWeight={500}
      fontSize="0.875rem"
      lineHeight="125%"
      {...props}
    >
      {value}
    </Typography>
  );
};

export default SmallText;
