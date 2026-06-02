import React from 'react';
import { Container, useTheme, Box, Typography,Card,CardContent } from '@material-ui/core';
var __html = require('./policy.html');
var template = { __html: __html };

const PrivacyPolicy = () => {
  const theme = useTheme();

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 950,
        mt: 5,
        mb: 5,
        borderRadius: 1,
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
          <span dangerouslySetInnerHTML={template} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrivacyPolicy;
