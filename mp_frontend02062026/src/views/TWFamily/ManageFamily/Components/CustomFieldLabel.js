import React from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Typography component for labels
const StyledLabel = styled(Typography)(({ theme }) => ({
  color: '#535F66',
  fontFamily: 'Mulish, sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '125%', // 20px
}));

// Reusable Label component
const CustomFieldLabel = ({ children, ...props }) => {
  return (
    <StyledLabel variant="body1" {...props}>
      {children}
    </StyledLabel>
  );
};

export default CustomFieldLabel;