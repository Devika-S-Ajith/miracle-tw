import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Formik } from "formik";
import {
  Box,
  Grid,
  Button,
  FormHelperText,
  TextField,
  Container,
  useTheme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
// import useAuth from '../../common/hooks/UseAuth';
import { useStyles } from "../../theme/CustomHooks";
import APIS from "../../common/hooks/UseApiCalls";
import { ModalService } from "../../components/Modal";
import PrivacyAndTerms from "../TermsOfUse/PrivacyAndTerms";

const NewPassword = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const classes = useStyles();
  const isLargeDevice = useMediaQuery("(min-width:1280px)");
  const theme = useTheme();
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState();
  const token = searchParams && searchParams.get("token");
  const tokenEmail = searchParams && searchParams.get("email");
  const verificationCode =
    searchParams && searchParams.get("verification_code");
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  useEffect(() => {
    if (token) getEmailFromToken();
  }, [token]);

  useEffect(() => {
    if (tokenEmail) setEmail(tokenEmail);
  }, [tokenEmail]);

  const getEmailFromToken = async () => {
    const res = await APIS.getEmailFromToken(token);
    if (res?.status === 200) setEmail(res.data.slice(6));
    else {
      // toast.error(t("common:warnings.Invalid registration link"));
      toast.error("We couldn't complete your request. Please contact your admin for support");
      navigate("/signin");
    }
  };

  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Formik
      initialValues={{
        new_password: "",
        confirm_password: "",
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        new_password: Yup.string()
          .max(16, "Password must be at most 16 characters")
          .matches(
            passwordRegex,
            "Password should be minimum 8 characters with an uppercase, numeric and a special character"
          )
          .required("New password is required"),
        confirm_password: Yup.string()
          .oneOf([Yup.ref("new_password"), null], "Passwords should match")
          .required("You should confirm password."),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          let data = {
            email: email.toLowerCase(),
            password: values.new_password,
            verificationCode: verificationCode,
            confirmPassword: values.confirm_password,
          };
          if (verificationCode) {
            const payload = {
              email: email,
              eventType: "cognito_user_migration",
            };
            // const migrationResponse = await APIS.migrateUserToNewDB(payload);
            // if (migrationResponse.status === 200) {
              await APIS.updatePassword(data).then((res) => {
                if (res.status == 200) {
                  const isTermsOfUseAccepted =
                    res?.data?.data?.isTermsOfUseAccepted;
                  if (!isTermsOfUseAccepted) {
                    ModalService.open(
                      ({ close }) => (
                        <PrivacyAndTerms
                          onClose={close}
                          id={res?.data?.data?.id}
                          onAcceptingHandler={() => navigate("/signin")}
                        />
                      ),
                      {
                        modalTitle: "",
                        width: "30%",
                        hideModalFooter: true,
                      }
                    );
                  } else {
                    navigate("/signin");
                  }
                } else {
                  setIsPasswordChanged(true);
                  setIsPasswordChanged(true);

                  //toast.success('Password Changed Successfully');
                  //navigate('/dashboard', { replace: true })
                }
              });
            // }
          } else {
            await APIS.NewPasswordOnRegistration(data).then((res) => {
              if (res.status == 200) {
                ModalService.open(
                  ({ close }) => (
                    <PrivacyAndTerms
                      onClose={close}
                      id={res?.data?.data?.id}
                      onAcceptingHandler={() => navigate("/signin")}
                    />
                  ),
                  {
                    modalTitle: "",
                    width: "30%",
                    hideModalFooter: true,
                  }
                );
                console.log(res.data);
                //navigate("/signin");
                //const errorMsg = res["message"] ? res["message"].replace(".", "") : 'Error occured while changing password'
                //toast.error(t(`common:warnings.${errorMsg}`));
              } else {
                setIsPasswordChanged(true);
                setIsPasswordChanged(true);
                //toast.success('Password Changed Successfully');
                //navigate('/dashboard', { replace: true })
              }
            });
          }
        } catch (err) {
          toast.error("Error changing password.");
          setStatus({ success: false });
          setErrors({ submit: err?.response?.data?.description });
          setSubmitting(false);
          console.log("error in forgotPassword api call ", err);
        }
      }}

      // onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
      //  setLoading(true)
      //  const data = {}
      //  setTimeout(() => {
      //    //data = { email: 'demoEmail@gmail.com', id: 'fgf687uggh6676', role: 'CaseWorker' }
      //    setLoading(false)
      //    setIsPasswordChanged(true)
      //  }, 5000);

      //  if (data.id) {

      //  }

      //}}
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
                {!isPasswordChanged ? (
                  <>
                    <Grid
                      item
                      sx={{
                        // minHeight: "70vh",
                        zIndex: 1,
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        px: isExtraSmallScreen ? 2 : 4,
                        py: 2,
                      }}
                    >
                      <form
                        noValidate
                        onSubmit={handleSubmit}
                        //{...props}
                      >
                        <Container sx={{ alignItems: "center" }}>
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
                            sx={{
                              mt: 2,
                              mb: 2,
                            }}
                            variant="h5"
                          >
                            Set a new password for
                          </Typography>

                          <Typography
                            align="center"
                            color="textPrimary"
                            title={email}
                            sx={{
                              mt: 2,
                              mb: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            variant="h5"
                          >
                            {email}
                          </Typography>

                          <TextField
                            error={Boolean(
                              touched.new_password && errors.new_password
                            )}
                            fullWidth
                            helperText={
                              touched.new_password && errors.new_password
                            }
                            label=""
                            margin="normal"
                            placeholder={t("common:signin.New Password")}
                            name="new_password"
                            id="newPassword"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="password"
                            value={values.new_password}
                            variant="outlined"
                            inputProps={{ className: classes.input }}
                            sx={{
                              "& fieldset": { border: "none" },
                              fontFamily: "Playfair Display",
                            }}
                          />
                          <TextField
                            error={Boolean(
                              touched.confirm_password &&
                                errors.confirm_password
                            )}
                            fullWidth
                            helperText={
                              touched.confirm_password &&
                              errors.confirm_password
                            }
                            label=""
                            placeholder={t(
                              "common:signin.Confirm New Password"
                            )}
                            margin="normal"
                            id="confrimPassword"
                            name="confirm_password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="password"
                            value={values.confirm_password}
                            variant="outlined"
                            inputProps={{ className: classes.input }}
                            sx={{
                              "& fieldset": { border: "none" },
                              fontFamily: "Playfair Display",
                            }}
                          />
                          {errors.submit && (
                            <Box sx={{ mt: 3 }}>
                              <FormHelperText error>
                                {errors.submit}
                              </FormHelperText>
                            </Box>
                          )}
                          <Box sx={{ mt: 3 }}>
                            <Button
                              //color="primary"
                              sx={{
                                backgroundColor: theme.palette.primary,
                                mb: 3,
                              }}
                              disabled={isSubmitting}
                              fullWidth
                              id="updatePasswordBtn"
                              size="large"
                              type="submit"
                              variant="contained"
                            >
                              Update Password
                            </Button>
                          </Box>
                        </Container>
                      </form>
                    </Grid>
                  </>
                ) : (
                  <>
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
                        We have sent an email to email@email.com. Please check
                        your inbox for next steps.
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </Formik>
  );
};

export default NewPassword;
