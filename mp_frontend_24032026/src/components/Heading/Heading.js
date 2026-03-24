import { Typography } from "@mui/material";
import React from "react";

const Heading = ({ heading, ...props }) => {
  return (
    <Typography
      color="#181A1B"
      fontWeight={700}
      fontSize="1.25rem"
      lineHeight="125%"
      {...props}
    >
      {heading}
    </Typography>
  );
};

export default Heading;
