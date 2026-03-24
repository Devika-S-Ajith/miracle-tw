import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const NotificationRow = ({
  name,
  text,
  time,
  unreadMessage,
  onClick,
}) => {
  const backgroundColor = unreadMessage ? "#FEF1E9" : "inherit";
  const nameColor = unreadMessage ? "#F37123" : "inherit";
  const borderLeftColor = unreadMessage ? "3px solid #F37123" : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #F3F6FA",
        backgroundColor: backgroundColor,
        borderLeft: borderLeftColor,
        padding: "8px 0",
      }}
    >
      <Box sx={{ flex: 0.5, marginLeft: "18px" }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: nameColor }}
        >
          {name}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flex: 2, alignItems: "center" }}>
        <Typography
          variant="body2"
          sx={{ color: "textPrimary", marginRight: "16px" }}
        >
          {text}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: "textPrimary" }}>
        {time}
      </Typography>
      <IconButton>
        <ArrowRightIcon onClick={onClick} />
      </IconButton>
    </Box>
  );
};

export default NotificationRow;
