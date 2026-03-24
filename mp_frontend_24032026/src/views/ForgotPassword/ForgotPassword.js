import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  TextField,
  Container,
  useTheme,
  Typography,
  CircularProgress,
} from "@mui/material";
// import useAuth from '../../common/hooks/UseAuth';
// import useMounted from '../../common/hooks/UseMounted';
import { forgotPassword } from "../../common/contexts/CognitoHandler";
import { useTranslation } from "react-i18next";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useStyles } from "../../theme/CustomHooks";
import APIS from "../../common/hooks/UseApiCalls";

const ForgotPassword = (props) => {
  const { t } = useTranslation(["common"]);
  const theme = useTheme();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isLargeDevice = useMediaQuery("(min-width:1280px)");
  const classes = useStyles();

  useEffect(() => {
    document.title = "Forgot Password | ThriveWell";
  }, []);

  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Formik
      initialValues={{
        email: "",
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255)
          .required(t("common:warnings.Email is required")),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        // console.log("submit called")

        try {
          setLoading(true);
          const payload = {
            email: values.email.toLowerCase(),
          };
          await APIS.forgotPassword(payload).then((res) => {
            if (res.status == 200 && res.data.data) {
              setLoading(false);
              toast.success("Reset password email has been sent to your mail.");
              navigate("/signin");
            } else {
              setErrors({ email: t("common:warnings.User does not exist") }); //working
              toast.error(
                t("common:warnings.User with this email does not exist")
              ); //working
              setLoading(false);
            }
          });
        } catch (err) {
          toast.error(t("common:warnings.Please try after sometime."));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
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
            // backgroundColor: "#1D334B",
            backgroundImage: `url('/static/login_bg.svg')`, // Replace 'path_to_your_image.jpg' with the actual path to your image
            backgroundSize: "cover", // Adjust this according to your image size preferences
            backgroundPosition: "center", // Adjust this according to your image positioning preferences
            backgroundAttachment: "fixed", // Keep the background fixed during scroll
          }}
        >
          <Grid spacing={1} container justifyContent="center">
            {/* <Grid
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
              </Grid> */}

            <Grid item xs={12} sm={10} md={8} lg={6} xl={5}>
              <Grid
                // container
                direction="column"
                justifyContent="right"
                alignItems="right"
                // position="relative"
                // right={isLargeDevice ? "60%" : "27%"}
                sx={{
                  ml: 10,
                  mr: 10,
                  "@media (max-width: 768px)": {
                    ml: 1,
                    mr: 1,
                  },
                }}
              >
                <Grid
                  item
                  // xs={4}
                  // sm={4}
                  // md={4}
                  // lg={8}
                  // xl={8}
                  sx={{
                    // minHeight: "70vh",
                    zIndex: 1,
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    px: isExtraSmallScreen ? 2 : 4,
                    py: 2,
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
                          color="success"
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
                          src="/static/login_logo.png"
                          style={{
                            width: "50%",
                          }}
                        />
                      </Box>
                      <Typography
                        align="center"
                        color="textPrimary"
                        sx={{ mt: 2, mb: 2 }}
                        variant="h5"
                      >
                        Set a New Password
                      </Typography>
                      <Typography
                        variant="body2"
                        gutterBottom
                        sx={{ mt: 1, mb: 1 }}
                      >
                        Enter the email address associated with your account and
                        we will send you instructions to update your password.
                      </Typography>
                      <TextField
                        autoFocus
                        error={Boolean(touched.email && errors.email)}
                        fullWidth
                        id="email"
                        helperText={touched.email && errors.email}
                        label=""
                        placeholder={t("common:common.Email")}
                        margin="normal"
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="email"
                        value={values.email}
                        inputProps={{ className: classes.input }}
                        sx={{
                          "& fieldset": { border: "none" },
                          fontFamily: "Playfair Display",
                        }}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                      {errors.submit && (
                        <Box sx={{ mt: 3 }}>
                          <FormHelperText error>{errors.submit}</FormHelperText>
                        </Box>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Button
                          //color="primary"
                          sx={{
                            backgroundColor: theme.palette.primary,
                            mb: 3,
                          }}
                          disabled={isSubmitting || isLoading}
                          fullWidth
                          id="updatePwdBtn"
                          size="large"
                          type="submit"
                          variant="contained"
                        >
                          Update password
                        </Button>
                      </Box>
                    </Container>
                  </form>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </Formik>
  );
};

export default ForgotPassword;
