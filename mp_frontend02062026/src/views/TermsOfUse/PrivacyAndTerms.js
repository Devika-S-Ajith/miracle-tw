import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import {
  Box,
  Grid,
  Button,
  FormHelperText,
  Checkbox,
  useTheme,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import APIS from "../../common/hooks/UseApiCalls";
import { ModalService } from "../../components/Modal";
import PrivacyAndTermsPopUp from "./PrivacyAndTermsPopUp";

const PrivacyAndTerms = ({ onClose, id, onAcceptingHandler }) => {
  const [checked, setChecked] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();

  const handleOpenModal = (title, PageId) => {
    ModalService.open(
      ({ close }) => (
        <PrivacyAndTermsPopUp onClose={close} PageId={PageId} title={title} />
      ),
      {
        modalTitle: "",
        width: "35%",
        hideModalFooter: true,
      }
    );
  };

  return (
    <Formik
      initialValues={{
        acceptTermsAndPolicy: false,
        submit: null,
      }}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        try {
          let payload = {
            id: id,
            isTermsOfUseAccepted: checked,
          };
          const response = await APIS.AcceptTermsAndPrivacyPolicy(payload);
          if (response.status === 200) {
            onClose();
            onAcceptingHandler();
          }
        } catch (err) {
          console.log(err);
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleSubmit, isSubmitting }) => (
        <Grid direction="column" justifyContent="right" alignItems="right">
          <Grid
            item
            sx={{
              // minHeight: "70vh",
              zIndex: 1,
              backgroundColor: "#fff",
              borderRadius: "6px",
            }}
          >
            <form noValidate onSubmit={handleSubmit}>
              <Box
                sx={{
                  margin: "auto",
                  maxWidth: "283px",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  alt="Miracle Foundation Logo"
                  src="/static/login_logo.png"
                  style={{
                    width: "50%",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  padding: "4px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#FEF1E9",
                }}
              >
                <Typography
                  align="left"
                  color="textPrimary"
                  variant="body2"
                  margin={1}
                >
                  We have updated our{" "}
                  <span
                    style={{
                      color: "var(--Orange-Orange, #F37123)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenModal("Terms of use", "TOF")}
                  >
                    Terms of use
                  </span>{" "}
                  and{" "}
                  <span
                    style={{
                      color: "var(--Orange-Orange, #F37123)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenModal("Privacy policy", "PP")}
                  >
                    Privacy policy
                  </span>
                  . By continuing to use our service, you accept these terms and
                  policies.
                </Typography>
              </Box>
              <Box sx={{ my: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() => {
                        setChecked(!checked);
                      }}
                      name="termsCheckbox"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      onClick={(e) => e.preventDefault()}
                      sx={{cursor: "default"}}
                    >
                      I have read the ThriveWell{" "}
                      <span
                        style={{
                          color: "var(--Orange-Orange, #F37123)",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenModal("Terms of use", "TOF");
                        }}
                      >
                        Terms of use
                      </span>{" "}
                      and{" "}
                      <span
                        style={{
                          color: "var(--Orange-Orange, #F37123)",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenModal("Privacy policy", "PP");
                        }}
                      >
                        Privacy policy
                      </span>
                      .
                    </Typography>
                  }
                  sx={{ alignSelf: "flex-start" }}
                />
              </Box>

              {errors.submit && (
                <Box sx={{ mt: 3 }}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Box>
              )}
              <Box sx={{ mt: 3 }}>
                <Button
                  sx={{
                    backgroundColor: theme.palette.primary,
                  }}
                  disabled={isSubmitting || !checked}
                  fullWidth
                  id="acceptTermsAndPolicy"
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  Continue
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  disabled={isSubmitting}
                  fullWidth
                  id="returnToLogin"
                  size="small"
                  variant="text"
                  onClick={() => {
                    onClose();
                    navigate("/signin");
                    localStorage.clear();
                    sessionStorage.clear();
                  }}
                >
                  Return to login
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      )}
    </Formik>
  );
};

export default PrivacyAndTerms;
