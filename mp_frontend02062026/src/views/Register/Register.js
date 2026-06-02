import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Container,
  useTheme,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import useMediaQuery from "@mui/material/useMediaQuery";
import _ from "lodash";
import { useStyles } from "../../theme/CustomHooks";

const Register = (props) => {
  const { t, i18n } = useTranslation(["common"]);
  const theme = useTheme();
  const isLargeDevice = useMediaQuery("(min-width:1280px)");
  const classes = useStyles();
  const [isMaillSend, setMailSend] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    return () => {};
  });

  useEffect(() => {
    document.title = "Register | ThriveWell";
  }, []);

  return (
    <Formik
      initialValues={{
        email: "",
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        setLoading(true);
        const data = {};
        setTimeout(() => {
          //data = { email: 'demoEmail@gmail.com', id: 'fgf687uggh6676', role: 'CaseWorker' }
          setLoading(false);
          setMailSend(true);
        }, 5000);

        if (data.id) {
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <Container
          sx={{
            display: "flex",
            minHeight: "100vh",
            padding: "30px 24px",
            gap: "54px",
            isolation: "isolate",
          }}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          backgroundColor="#1D334B"
        >
          <Grid container spacing={1}>
            <Grid
              container
              direction="row"
              sx={{ pt: "5%" }}
              justifyContent="center"
              alignItems="center"
            >
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                lg={8}
                xl={8}
                sx={{ ml: isLargeDevice ? 0 : 3 }}
                justifyContent="center"
                alignItems="center"
              >
                <img
                  alt="Miracle Foundation Logo"
                  src="/static/Frame_33.png"
                  style={{
                    width: isLargeDevice ? "70%" : "90%",
                  }}
                />
              </Grid>
              <Grid item xs={8} sm={6} md={6} lg={4} xl={4}>
                <Grid
                  container
                  direction="column"
                  justifyContent="right"
                  alignItems="right"
                  position="relative"
                  right={isLargeDevice ? "60%" : "27%"}
                  sx={{ ml: 10, mr: 10 }}
                >
                  <Grid
                    item
                    xs={4}
                    sm={4}
                    md={4}
                    lg={8}
                    xl={8}
                    sx={{
                      zIndex: 1,
                      minHeight: "70vh",
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                    }}
                  >
                    <form noValidate onSubmit={handleSubmit} {...props}>
                      <Container sx={{ alignItems: "center" }}>
                        {isLoading && (
                          <CircularProgress
                            sx={{
                              zIndex: 1000,
                              position: "absolute",
                              top: "55%",
                              left: "48%",
                            }}
                            color="primary"
                          />
                        )}
                        <Box
                          sx={{
                            margin: "auto",
                            maxWidth: "283px",
                            marginTop: 2,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            alt="Miracle Foundation Logo"
                            src="/static/logoWithout.svg"
                            style={{
                              marginRight: 6,
                              height: "30%",
                              width: "30%",
                            }}
                          />
                        </Box>
                        {!isMaillSend ? (
                          <>
                            {" "}
                            <Box
                              sx={{
                                margin: "auto",
                                maxWidth: "283px",
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                align="center"
                                fontFamily="Playfair Display"
                                sx={{ typography: { sm: "h5", xs: "h5" } }}
                              >
                                Confirm your BAY BRIDGE organization
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              gutterBottom
                              sx={{ mt: 1, mb: 1 }}
                            >
                              Enter your email address and we'll let you know if
                              you have an organization with us.
                            </Typography>
                            <TextField
                              //autoFocus
                              error={Boolean(touched.email && errors.email)}
                              fullWidth
                              helperText={
                                touched.email &&
                                errors.email &&
                                t(`common:warnings.${errors.email}`)
                              }
                              label=""
                              placeholder={t("common:common.Email")}
                              margin="normal"
                              name="email"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              type="email"
                              value={values.email}
                              variant="outlined"
                              sx={{
                                "& fieldset": { border: "none" },
                                fontFamily: "Playfair Display",
                              }}
                              inputProps={{ className: classes.input }}
                            />
                            {errors.submit && (
                              <Box sx={{ mt: 3 }}>
                                <FormHelperText error>
                                  {errors.submit}
                                </FormHelperText>
                              </Box>
                            )}
                            <Box sx={{ mt: 2 }}>
                              <Button
                                //color="primary"
                                sx={{
                                  backgroundColor: theme.palette.primary,
                                  mb: 1,
                                }}
                                disabled={isSubmitting}
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                              >
                                Confirm Organization
                              </Button>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 3,
                              }}
                            >
                              <Link
                                sx={{ flex: 1 }}
                                color="textSecondary"
                                to="/terms"
                                style={{
                                  fontSize: "0.9rem",
                                  color: "#F37123",
                                  textDecoration: "none",
                                }}
                                target="_blank"
                                underline="none"
                                variant="body1"
                              >
                                {t("common:common.Terms Of Use")}
                              </Link>
                              <p style={{ margin: "0 10px 0 10px" }}> | </p>
                              <Link
                                sx={{ flex: 1 }}
                                style={{
                                  fontSize: "0.9rem",
                                  color: "#F37123",
                                  textDecoration: "none",
                                }}
                                color="textSecondary"
                                to="/privacy"
                                target="_blank"
                                underline="none"
                                variant="body1"
                              >
                                {t("common:common.Privacy Policy")}
                              </Link>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography
                              align="center"
                              fontFamily="Playfair Display"
                              color="textPrimary"
                              sx={{ mt: 2, mb: 2 }}
                              variant="h4"
                            >
                              Check your email for next steps
                            </Typography>
                            <Typography
                              variant="body1"
                              gutterBottom
                              color="textPrimary"
                              sx={{ mt: 2, mb: 5 }}
                            >
                              We have sent an email to email@email.com. Please
                              check your inbox for next steps.
                            </Typography>
                          </>
                        )}
                      </Container>
                    </form>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      )}
    </Formik>
  );
};

export default Register;
