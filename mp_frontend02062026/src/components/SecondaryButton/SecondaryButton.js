import { Button } from "@mui/material";
import React from "react";

const SecondaryButton = ({ label, onClick, fullWidth = false, ...props }) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      fullWidth={fullWidth}
      sx={{
        fontSize: "1rem",
        fontWeight: 700,
      }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default SecondaryButton;
