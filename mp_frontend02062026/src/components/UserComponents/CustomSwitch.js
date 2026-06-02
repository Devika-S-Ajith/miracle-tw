
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';


const CustomSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: "#F37123",
    '&:hover': {
      backgroundColor: alpha("#F37123", theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: "#F37123",
  },
  '& .MuiSwitch-switchBase.Mui-disabled': {
    color: theme.palette.action.disabled, // Greyed-out color for disabled state
  },
  '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
    //backgroundColor: theme.palette.action.disabledBackground, // Greyed-out track for disabled state
  },
}));


  export default CustomSwitch
  