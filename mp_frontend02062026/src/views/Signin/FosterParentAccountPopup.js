import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import QRCodeImage from "../../assets/images/QR.png";

const FosterParentAccountPopup = ({
  setFieldValue,
  onClose,
  resetForm,
}) => {
  return (
    <>
      <Typography variant="body1" paragraph sx={{ marginTop: "16px" }}>
        At the moment, foster caregiver can use only the mobile app for
        ThriveWell™. The web portal is for case managers.
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        marginBottom="16px"
      >
        <Typography variant="body1">
          Use the QR code with your mobile device to download the ThriveWell™
          app in the App Store or Google Play store.
        </Typography>
        <Box width="80px" height="80px" marginTop="18px" alignSelf="flex-start">
          <img
            src={QRCodeImage}
            alt="QR Code"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
      </Box>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => {
              setFieldValue("email", "");
              resetForm();
              onClose();
            }}
            sx={{
              border: "none",
              borderRadius: 0,
              "&:hover": {
                backgroundColor: "transparent !important",
                border: "none",
              },
            }}
          >
            Okay
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default FosterParentAccountPopup;
