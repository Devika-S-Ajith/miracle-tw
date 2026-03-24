import { Box } from '@mui/material';
import { ReplayCircleFilledRounded } from '@mui/icons-material';
import SmallText from '../../../../components/SmallText/SmallText';

const ErrorWithReload = ({ message = "Oops, something went wrong on our end. Please try again", onReload }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <SmallText value={message} color="text.secondary"/>
      <ReplayCircleFilledRounded
        onClick={onReload}
        sx={{
          fontSize: 30,
          color: "#9e9e9e",
          cursor: "pointer",
          transition: "transform 0.2s",
          "&:hover": { transform: "rotate(-90deg)" }
        }}
      />
    </Box>
  </Box>
);

export default ErrorWithReload;