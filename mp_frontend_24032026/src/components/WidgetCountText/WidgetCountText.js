import { Typography } from "@mui/material";


const WidgetCountText = ({ value, ...props }) => {
  return (
    <Typography
      color="#181A1B"
      fontWeight={700}
      fontSize="20px"
      lineHeight="125%"
      {...props}
    >
      {value}
    </Typography>
  );
};

export default WidgetCountText;
