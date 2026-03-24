import { Typography } from "@mui/material";
import React from "react";

const SubHeading = ({ value, ...props }) => {
  return (
    <Typography
      color="#181A1B"
      fontWeight={600}
      fontSize="1.125rem"
      lineHeight="125%"
      {...props}
    >
      {value}
    </Typography>
  );
};

export default SubHeading;
