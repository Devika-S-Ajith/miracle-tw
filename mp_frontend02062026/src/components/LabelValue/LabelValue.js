import { Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";

const LabelValue = ({
  label,
  value,
  onClick = undefined,
  wrap = false,
  tooltip = true,
  descriptionFontWeight = 700,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    // Start the timer when the mouse enters
    const id = setTimeout(() => {
      setShowTooltip(true); // Show tooltip after .5 seconds
    }, 500); // 500ms delay
    setTimeoutId(id); // Save timeout ID so it can be cleared if necessary
  };

  const handleMouseLeave = () => {
    // Clear the timer if the mouse leaves before .5 seconds
    clearTimeout(timeoutId);
    setShowTooltip(false); // Hide the tooltip immediately
  };

  return (
    <>
      <Typography color="textPrimary" fontWeight={700} fontSize="0.75rem">
        {label}
      </Typography>
      <Tooltip
        title={tooltip && value ? value : ""}
        disableInteractive
        open={tooltip && !!value ? showTooltip : false}
        onClose={() => setShowTooltip(false)}
        placement="bottom-start"
      >
        <Typography
          color="textPrimary"
          fontWeight={descriptionFontWeight}
          fontSize="1rem"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: wrap ? "wrap" : "nowrap",
            wordBreak: wrap ? "break-all" : "normal",
            cursor: onClick ? "pointer" : "text",
          }}
          onClick={onClick}
          onMouseEnter={tooltip ? handleMouseEnter : undefined}
          onMouseLeave={tooltip ? handleMouseLeave : undefined}
        >
          {value || "-"}
        </Typography>
      </Tooltip>

    </>
  );
};

export default LabelValue;
