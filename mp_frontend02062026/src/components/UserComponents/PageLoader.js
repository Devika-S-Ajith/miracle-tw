import React from "react";
import { CircularProgress, Box } from "@mui/material";

const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      zIndex: 1000,
      background: "rgba(255,255,255,0.6)",
    }}
  >
    <CircularProgress size={60} thickness={5} />
  </Box>
);

export default PageLoader;
