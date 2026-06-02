import React from 'react';
import { Container, useTheme, Box, Typography, Card, CardContent } from '@mui/material';
var __html = require('./policy.html');
var template = { __html: __html };

const PrivacyPolicy = () => {
  const theme = useTheme();

  const containerStyle = {
    [theme.breakpoints.up('xs')]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up('sm')]: {
      marginy: theme.spacing(2),
    },
    [theme.breakpoints.up('md')]: {
      marginy: theme.spacing(3),
    },
    [theme.breakpoints.up('lg')]: {
      marginy: theme.spacing(4),
    },
    [theme.breakpoints.up('xl')]: {
      marginy: theme.spacing(5),
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100% !important",
        m: 0,
        display: "flex",
        minHeight: "100vh",
        padding: "30px 24px",
        gap: "54px",
        isolation: "isolate",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url('/static/login_bg.svg')`,
        backgroundSize: "cover", // Ensure the image covers the entire area
        backgroundPosition: "center", // Adjust this according to your image positioning preferences
        backgroundAttachment: "fixed", // Keep the background fixed during scroll
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          width: 1,
          mt: 5,
          mb: 5,
          mx: 0,
          borderRadius: 1,
          ...containerStyle
        }}>
        <Card sx={{ mt: 8, mb: 8, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ padding: '16px' }}>
            <Box sx={{
              alignItems: "center",
              height: 70
            }}>
              <Typography color="textSecondary"
                variant="h3"
                align="center"
                sx={{ mt: 2 }}
              >
                Privacy Policy
              </Typography>
            </Box>
            <Box id="privacyPolicy">
              <span dangerouslySetInnerHTML={template} />
            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
