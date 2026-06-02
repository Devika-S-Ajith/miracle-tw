import { Typography } from "@mui/material";
import React from "react";

const BodyText = ({ value, ...props }) => {
  return (
    <Typography
      color="#181A1B"
      fontWeight={400}
      fontSize="1rem"
      lineHeight="125%"
      {...props}
    >
      {value}
    </Typography>
  );
};

export default BodyText;
