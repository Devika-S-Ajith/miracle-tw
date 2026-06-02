// components/ChildRenderOption.jsx

import { Box, Typography, ListItemText } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const ChildRenderOption = (props, option) => {
  // Format date of birth
  const formatDOB = (dob) => {
    if (!dob) return 'N/A';
    const date = new Date(dob);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderGender = (gender) => {
    if (!gender) return null;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" fontWeight="medium">
          {gender}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      component="li"
      {...props}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemText
        primary={
          <Typography variant="body1" fontWeight="medium">
            {option.firstName} {option.lastName}
          </Typography>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            {option.gender && renderGender(option.gender)}
            {option.gender && option.dateOfBirth && (
              <FiberManualRecordIcon  sx={{ fontSize: 10, m: 0.5 }} />
            )}
            {option.dateOfBirth && (
               <Typography variant="body2" fontWeight="medium">
                {formatDOB(option.dateOfBirth)}
              </Typography>
            )}
          </Box>
        }
      />
    </Box>
  );
};

export default ChildRenderOption;