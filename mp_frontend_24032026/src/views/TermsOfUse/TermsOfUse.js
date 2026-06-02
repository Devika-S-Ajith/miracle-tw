import React from 'react';
import { Container, useTheme, Box, Typography, Card,CardContent } from '@material-ui/core';
var __html = require('./terms.html');
var template = { __html: __html };

const TermsOfUse = () => {
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
      <Card sx={{ mt: 8, mb: 8,boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ padding: '16px' }}>
          <Box sx={{
            alignItems: "center",
            height: 70,
          }}>
            <Typography color="textSecondary"
              variant="h3"
              align="center"
              sx={{ mt: 2 }}
            >
              Terms of Use
            </Typography>
          </Box>
          <span dangerouslySetInnerHTML={template} />
        </CardContent>
      </Card>
      
    </Container>
  );
};

export default TermsOfUse;
