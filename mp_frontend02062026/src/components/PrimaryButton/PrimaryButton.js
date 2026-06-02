import { Button } from "@mui/material";
import React from "react";

const PrimaryButton = ({ label, onClick, fullWidth = false, ...props }) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      fullWidth={fullWidth}
      sx={{
        fontSize: "1rem",
        fontWeight: 700,
        backgroundColor: "#F37123",
        "&:hover": {
          backgroundColor: "#F79C65",
          // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        },
      }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default PrimaryButton;
