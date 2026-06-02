import { Typography } from "@mui/material";
import React from "react";

const MedicationLabelValue = ({
  label,
  value,
  onClick = undefined,
  wrap = false,
}) => {
  return (
    <>
      <Typography
        color="#0C1825"
        // variant="subtitle2"
        fontWeight={600}
        fontSize="0.875rem"
      >
        {label}
      </Typography>
      <Typography
        color="#535F66"
        // variant="subtitle2"
        fontWeight={400}
        fontSize="0.875rem"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: wrap ? "wrap" : "nowrap",
          cursor: onClick ? "pointer" : "text",
        }}
        onClick={onClick}
      >
        {value || "-"}
      </Typography>
    </>
  );
};

export default MedicationLabelValue;
