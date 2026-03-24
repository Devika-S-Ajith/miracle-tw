import { Typography } from "@mui/material";
import React from "react";
import { dateFormatter } from "../../../../constants";

const ChildHistory = ({ date, value }) => {
  return (
    <>
      <Typography
        color="textPrimary"
        // variant="subtitle2"
        fontWeight={700}
        // fontSize="0.75rem"
      >
        {dateFormatter(date)}
      </Typography>
      <Typography
        color="textPrimary"
        // variant="subtitle2"
        // fontWeight={700}
        // fontSize="0.75rem"
      >
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </Typography>
    </>
  );
};

export default ChildHistory;
