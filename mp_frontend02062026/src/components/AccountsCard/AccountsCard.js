import { Box, Card, Typography } from "@mui/material";
import React from "react";

const AccountsCard = ({ title, subTitle ,setSelected, isSelected ,id}) => {

  const handleCardSelection = () => {
    localStorage.setItem(`${id}`,!isSelected)
    setSelected(!isSelected)
  }


  return (
    <Card sx={{ cursor:'pointer' ,background:isSelected?'#f7d9d2':'', borderRadius: 1 / 8 }}  elevation={2}>
      <Box id={id} p={1} onClick={handleCardSelection}>
        <Typography
          color="primary"
          variant="subtitle2"
          fontWeight={600}
          fontSize="0.875rem"
        >
          {title}
        </Typography>
        <Typography
          color="primary"
          variant="subtitle2"
          fontWeight={500}
          fontSize="0.75rem"
        >
          {subTitle}
        </Typography>
      </Box>
    </Card>
  );
};

export default AccountsCard;
