import { Box, Popover } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const PopoverBox = ({
  title,
  button,
  content
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open ? "simple-popover" : undefined;
  return (
    <Box>
      <Box aria-describedby={id} onClick={handleClick}>
        {button}
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {title && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              m: 2,
            }}
          >
            <Box
              sx={{
                fontWeight: "bold",
                fontSize: "h6.fontSize",
                color: "#0C1825",
              }}
            >
              {title}
            </Box>
            <CloseIcon onClick={handleClose} />
          </Box>
        )}
        <Box sx={{ borderBottom: 1, borderBottomColor: "#C6C4BE" }}></Box>
        <Box sx={{ m: 2 }}>{content?.({ onClose: handleClose })}</Box>
      </Popover>
    </Box>
  );
};
export default PopoverBox;
