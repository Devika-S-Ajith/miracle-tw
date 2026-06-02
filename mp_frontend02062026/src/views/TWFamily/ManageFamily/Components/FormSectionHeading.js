import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Typography component for form section headings
const StyledFormSectionHeading = styled(Typography)(({ theme }) => ({
  color: '#000',
  fontFamily: 'Mulish, sans-serif',
  fontSize: '20px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '125%', // 25px
}));

// Reusable FormSectionHeading component
const FormSectionHeading = ({ children, ...props }) => {
  return (
    <StyledFormSectionHeading {...props}>
      {children}
    </StyledFormSectionHeading>
  );
};

export default FormSectionHeading;