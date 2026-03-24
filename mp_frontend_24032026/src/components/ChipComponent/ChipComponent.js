import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

const ChipComponent = ({ label, backgroundColor, ...props }) => {
  return (
    <Chip
      label={label}
      {...props}
      deleteIcon={
        <CloseIcon
          fontSize="large"
          sx={{ color: "#FFF !important", fontSize: "16px !important" }}
        />
      }
    />
  );
};

export default ChipComponent;
