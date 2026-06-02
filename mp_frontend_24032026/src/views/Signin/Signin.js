import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { signIn, completePassword } from "../../common/contexts/CognitoHandler";
import { getAmplifyConfig } from "../../common/config";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../common/contexts/CommonDataContext";
import APIS from "../../common/hooks/UseApiCalls";
import useMediaQuery from "@mui/material/useMediaQuery";
import Checkbox from "@mui/material/Checkbox";
import { useStyles } from "../../theme/CustomHooks";
import _ from "lodash";
import "./signin.css";
import { PARENT_ROLE_ID } from "../../helpers/constant";
import FosterParentAccountPopup from "./FosterParentAccountPopup";
import { ModalService } from "../../components/Modal";
import PrivacyAndTerms from "../TermsOfUse/PrivacyAndTerms";
import useAuth from "../../common/hooks/UseAuth";
import {Amplify} from "aws-amplify";
import { ca } from "date-fns/locale";

const SignIn = (props) => {
  const { t } = useTranslation(["common"]);
  const theme = useTheme();
  const classes = useStyles();
  const { logout } = useAuth();
 
  const {
    setSignedinUserRoleFS,
    getUserDetails,
    setSignedinUserRoleHT,
    signedinUserRoleHT,
    signedinUserRoleFS,
    getSignedinUserOrgType,
    setDBRegion,
    getSystemMessages,
    setSystemMessagesFetchedAtLogin,
    callCommonAPISAfterLogin
  } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(
    localStorage.getItem("keepLoggedIn") || false
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [canLogin, setCanLogin] = useState(true);
  const [helpEnabled, setHelpEnabled] = useState(false);
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [capsLockOn, setCapsLockOn] = useState(false);
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;


  // Function to fetch and set user region
  const fetchAndSetUserRegion = async () => {
    const res = await APIS.GetRegion();
    return res?.data?.data.region;
  };

  useEffect(() => {
  document.title = "Sign In | ThriveWell";
  
  // Early return if user isn't signed in
  if (!signedinUserRoleHT && !signedinUserRoleFS) {
    return;
  }
  
  // Get token based on keepLoggedIn preference
  const keepLoggedIn = localStorage.getItem("keepLoggedIn") === "true";
  const idToken = keepLoggedIn 
    ? localStorage.getItem("idToken")
    : sessionStorage.getItem("idToken");
  
  // Only navigate if we have a valid token
  if (!idToken || idToken === "undefined") {
    return;
  }
  
  // Handle navigation based on user role and org type
  if (localStorage.getItem("signedinOrgType") == "6") {
    navigate("/governmentDashboardOverview", { replace: true });
  } else {
    navigate("/dashboard", { replace: true });
  }
}, [signedinUserRoleHT, signedinUserRoleFS, navigate]);
  
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleKeepLoggedInChange = () => {
    setKeepLoggedIn(!keepLoggedIn);
  };

  useEffect(() => {
    if (localStorage.setItem("keepLoggedIn", keepLoggedIn) !== keepLoggedIn) {
      localStorage.setItem("keepLoggedIn", keepLoggedIn);
    }
  }, [keepLoggedIn]);

  const setBasicUserDetails = async (
    responseData,
    username,
    signInUserSession,
    accountId,
    refreshedIdToken
  ) => {
    let accessToken =
      signInUserSession &&
      signInUserSession.accessToken &&
      signInUserSession.accessToken.jwtToken;
    let refreshToken =
      signInUserSession &&
      signInUserSession.refreshToken &&
      signInUserSession.refreshToken.token;
    let idToken = refreshedIdToken
      ? refreshedIdToken
      : signInUserSession &&
        signInUserSession.idToken &&
        signInUserSession.idToken.jwtToken;
    let orgId = accountId;
    let dbRegion = responseData.attributes["custom:db_region"];
    let fs_role, ht_role;
    if (responseData.attributes && responseData.attributes["custom:fs_role"]) {
      fs_role = responseData.attributes["custom:fs_role"];
    } else {
      fs_role = "";
    }
    if (responseData.attributes && responseData.attributes["custom:ht_role"]) {
      ht_role = responseData.attributes["custom:ht_role"];
    } else {
      ht_role = "";
    }
    localStorage.setItem("email", responseData.attributes["email"]);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    if (localStorage.getItem("keepLoggedIn") == "true") {
      localStorage.setItem("idToken", idToken);
    } else {
      sessionStorage.setItem("idToken", idToken);
    }
    localStorage.setItem("orgId", orgId);
    localStorage.setItem("fs_role", fs_role);
    localStorage.setItem("ht_role", ht_role);
    localStorage.setItem("username", username);
    sessionStorage.setItem("username", username);
    const currentLanguage = localStorage.getItem("language");
    if (!currentLanguage) {
      localStorage.setItem("language", "en");
    }
    await getSignedinUserOrgType(orgId);
    setSignedinUserRoleHT(ht_role);
    setSignedinUserRoleFS(fs_role);
    setDBRegion(dbRegion);
    await getUserDetails();
    getSystemMessages(true);
    setSystemMessagesFetchedAtLogin(true);
    if (localStorage.getItem("signedinOrgType") == 6) {
      navigate("/governmentDashboardOverview", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
      setLoading(false);
  };


  const handleKeyUp = (event) => {
    const capsLockActivated =
      event.getModifierState && event.getModifierState("CapsLock");
    setCapsLockOn(capsLockActivated);
  };

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        new_password: "",
        confirm_new_password: "",
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
        password:
          isEmailVerified && Yup.string().required("Password is required"),
        new_password:
          challenge &&
          Yup.string()
            //.min(6)
            .max(16, "Password must be at most 16 characters")
            .matches(
              passwordRegex,
              "Password should be minimum 8 characters with an uppercase, numeric and a special character"
            )
            .required("New Password is required"),
        confirm_new_password:
          challenge &&
          Yup.string()
            .oneOf([Yup.ref("new_password"), null], "Passwords should match")
            .required(t("You should confirm password")),
      })}
      onSubmit={async (
        values,
        { setErrors, setStatus, setSubmitting, setFieldValue, resetForm }
      ) => {
        setLoading(true);
        try {
          const fetchedRegion = await fetchAndSetUserRegion();
          Amplify.configure(getAmplifyConfig())
          
          if (isEmailVerified) {
            let signinData = {
              username: values.email.toLocaleLowerCase(),
              password: values.password,
            };
            signIn(signinData)
              .then(async (res) => {
                if (res.challengeName === "NEW_PASSWORD_REQUIRED") {
                  if (challenge === true) {
                    let newPassword = values.new_password;
                    completePassword(res, newPassword)
                      .then(async (resp) => {
                        setLoading(false);
                        let username = res.attributes["sub"];
                        let signInUserSession = resp && resp.signInUserSession;
                        let responseData = res.challengeParam;
                        setBasicUserDetails(
                          responseData,
                          username,
                          signInUserSession,
                          responseData?.attributes["custom:account_id"],
                          null
                        );
                      })
                      .catch((err) => {
                        console.error("Error in confirm pass >>", err);
                        setLoading(false);
                        setErrors({ submit: err.message });
                        // navigate('/dashboard'); // bypassing
                      });
                  }
                  setChallenge(true);
                } else {
                  if (
                    res.signInUserSession &&
                    res?.attributes["email_verified"]
                  ) {
                    let isMigratedInd =
                      res.attributes && res.attributes["custom:isMigratedInd"];
                    if (isMigratedInd || localStorage.getItem('userDBRegion') === 'us-east-1') {
                      let username = res.attributes["sub"];
                      let signInUserSession = res && res.signInUserSession;
                      const data = await APIS.UserDetails(username);
                      if (data) {
                        const isTermsOfUseAccepted =
                          data?.data?.data?.isTermsOfUseAccepted;
                        let responseData = res;
                        if (isTermsOfUseAccepted === false) {
                          ModalService.open(
                            ({ close }) => (
                              <PrivacyAndTerms
                                onClose={close}
                                id={data?.data?.data?.id}
                                onAcceptingHandler={() =>
                                  setBasicUserDetails(
                                    responseData,
                                    username,
                                    signInUserSession,
                                    responseData?.attributes[
                                      "custom:account_id"
                                    ],
                                    null
                                  )
                                }
                              />
                            ),
                            {
                              modalTitle: "",
                              width: "30%",
                              hideModalFooter: true,
                            }
                          );
                        } else {
                          setBasicUserDetails(
                            responseData,
                            username,
                            signInUserSession,
                            responseData?.attributes["custom:account_id"],
                            null
                          );
                        }
                      } else {
                        toast.error("something went wrong");
                        setLoading(false);
                        return;
                      }
                    } else {
                      const payload = {
                        email: signinData.username,
                        // eventType: "cognito_user_migration",
                      };
                      const migrationResponse = await APIS.updateCognitoIdinRegionalDB(
                        payload
                      );
                      if (migrationResponse.status === 200) {
                        let username = res.attributes["sub"];
                        await APIS.refresh();
                        let signInUserSession = res && res.signInUserSession;
                        let responseData = res;
                        const data = await APIS.UserDetails(username);
                        if (data) {
                          const isTermsOfUseAccepted =
                            data?.data?.data?.isTermsOfUseAccepted;
                          if (!isTermsOfUseAccepted) {
                            ModalService.open(
                              ({ close }) => (
                                <PrivacyAndTerms
                                  onClose={close}
                                  id={data?.data?.data?.id}
                                  onAcceptingHandler={() =>
                                    setBasicUserDetails(
                                      responseData,
                                      username,
                                      signInUserSession,
                                      migrationResponse?.data?.accountId,
                                      null
                                    )
                                  }
                                />
                              ),
                              {
                                modalTitle: "",
                                width: "30%",
                                hideModalFooter: true,
                              }
                            );
                          } else {
                            setBasicUserDetails(
                              responseData,
                              username,
                              signInUserSession,
                              migrationResponse?.data?.accountId,
                              null
                            );
                          }
                        } else {
                          toast.error("something went wrong");
                          setLoading(false);
                          return;
                        }
                      } else {
                        console.error(
                          `Error: ${migrationResponse.status} - ${migrationResponse.data}`
                        );
                      }
                    }
                  } else {
                    const emailVerified =
                      res?.attributes?.email_verified ?? true;
                    if (emailVerified) {
                      setErrors({
                        submit: res.error && res.error.message.replace(".", ""),
                      });
                      setLoading(false)
                    } else {
                      setErrors({
                        submit: "Email is not verified",
                      });
                      setLoading(false)
                      await logout();
                      localStorage.clear();
                      sessionStorage.clear();
                    }
                  }
                  //setLoading(false);
                }
                //setLoading(false);
              })
              .catch((err) => {
                console.log("signin err >>", err);
                setErrors({ submit: err?.message });
                //toast.error(t("common:warnings.Error in password"));
                setLoading(false);
              });
          } else {
            if(localStorage.getItem("userDBRegion") != fetchedRegion){
              localStorage.clear();
              localStorage.setItem("userDBRegion", fetchedRegion);
            }
            const userEmail = values.email.toLowerCase();
            const data = await APIS.CheckUserAccountExist(userEmail);
            if (data?.status === 200) {
              if (data.data?.data?.canLogin == true) {
                if (data.data?.data?.FSUserRoleId === PARENT_ROLE_ID) {
                  setLoading(false);
                  await logout();
                  ModalService.open(
                    ({ close }) => (
                      <FosterParentAccountPopup
                        setFieldValue={setFieldValue}
                        resetForm={resetForm}
                        onClose={close}
                      />
                    ),
                    {
                      modalTitle: "You have a foster caregiver account!",
                      width: "30%",
                      hideModalFooter: true,
                    }
                  );
                } else {
                  setCanLogin(true);
                  setLoading(false);
                  setIsEmailVerified(true);
                  setHelpEnabled(false);
                }
              } else {
                setCanLogin(false);
                setIsEmailVerified(false);
                setLoading(false);
                setHelpEnabled(false);
                toast.dismiss();
              }
            } else {
              setIsEmailVerified(false);
              setLoading(false);
              toast.dismiss();
            }
          }
        } catch (err) {
          //toast.error(t('common:warnings.Error in password'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          //setErrors({ password: err.message });
          setSubmitting(false);
          console.log("error in signin api call");
          setLoading(false);
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
           
            <Grid item xs={12} sm={10} md={8} lg={6} xl={5}>
              <Grid
                // container
                direction="column"
                justifyContent="right"
                alignItems="right"
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
                  sx={{
                    // minHeight: "70vh",
                    zIndex: 1,
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    px: isExtraSmallScreen ? 2 : 4,
                    py: 2,
                  }}
                >
                  {canLogin ? (
                    <>
                      <form noValidate onSubmit={handleSubmit} {...props}>
                        {!challenge ? (
                          <Container
                            sx={{ alignItems: "center", width: "100%" }}
                          >
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
                                mt: 2,
                                mb: 4,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                alt="Miracle Foundation Logo"
                                src="/static/login_logo.png"
                                style={{
                                  // marginRight: 6,
                                  // height: "30%",
                                  width: "50%",
                                }}
                              />
                            </Box>
                            {
                              helpEnabled ? (
                                <>
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
                                      sx={{
                                        typography: { sm: "h5", xs: "h5" },
                                      }}
                                    >
                                      Enter your email
                                    </Typography>
                                  </Box>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      gutterBottom
                                      sx={{ mt: 1, mb: 1 }}
                                    >
                                      We recommend using the email address
                                      associated with your organization.
                                    </Typography>
                                  </div>
                                </>
                              ) : (
                                
                                <></>
                              )
                              
                            }
                            {errors.submit && (
                              <Box
                                sx={{
                                  mt: 2,
                                  mb: 2,
                                  border: "1px solid red",
                                  backgroundColor: "lightpink",
                                  color: "#750202",
                                  padding: "10px",
                                  borderRadius: "5px",
                                }}
                              >
                                <FormHelperText sx={{ color: "#c40404" }}>
                                  {t(`common:warnings.${errors.submit}`)}
                                </FormHelperText>
                              </Box>
                            )}
                            {
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mb: Boolean(touched.email && errors.email)
                                    ? 0
                                    : 2,
                                }}
                              >
                                <TextField
                                  error={Boolean(touched.email && errors.email)}
                                  fullWidth
                                  helperText={
                                    touched.email &&
                                    errors.email &&
                                    t(`common:warnings.${errors.email}`)
                                  }
                                  placeholder={t("common:common.Email")}
                                  inputProps={{ className: classes.input }}
                                  label=""
                                  id="email"
                                  size="small"
                                  name="email"
                                  // defaultValue="example"
                                  onBlur={handleBlur}
                                  disabled={isEmailVerified}
                                  onChange={handleChange}
                                  type="email"
                                  color="secondary"
                                  value={values.email}
                                  sx={{
                                    "& fieldset": {
                                      border:
                                        touched.email && errors.email
                                          ? "1px solid #D6DBDE"
                                          : "none",
                                    },
                                    "&:hover": {
                                      background: "white",
                                      borderColor: "#D6DBDE",
                                    },
                                  }}
                                />
                              </Box>
                            }
                            {isEmailVerified ? (
                              <>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: Boolean(
                                      touched.password && errors.password
                                    )
                                      ? 0
                                      : 2,
                                  }}
                                >
                                  <TextField
                                    error={Boolean(
                                      touched.password && errors.password
                                    )}
                                    fullWidth
                                    helperText={
                                      touched.password &&
                                      errors.password &&
                                      t(`common:warnings.${errors.password}`)
                                    }
                                    onKeyUp={handleKeyUp}
                                    label=""
                                    placeholder={t("common:common.Password")}
                                    inputProps={{ className: classes.password }}
                                    //inputProps={{ className: values.password ? classHaveData.input : classes.input }}
                                    name="password"
                                    id="password"
                                    size="small"
                                    onBlur={(e) => {
                                      handleBlur(e);
                                      setCapsLockOn(false);
                                    }}
                                    onChange={handleChange}
                                    type={showPassword ? "text" : "password"}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={
                                              handleMouseDownPassword
                                            }
                                            edge="end"
                                          >
                                            {showPassword ? (
                                              <VisibilityOff />
                                            ) : (
                                              <Visibility />
                                            )}
                                          </IconButton>
                                        </InputAdornment>
                                      ),
                                    }}
                                    value={values.password}
                                    sx={{
                                      "& fieldset": {
                                        border: "1px solid #D6DBDE",
                                        borderRadius: 2,
                                      },
                                      "&:hover": {
                                        background: "white",
                                        borderRadius: 0.5,
                                      },
                                      borderRadius: 4,
                                    }}
                                  />
                                </Box>
                                {capsLockOn && (
                                  <Typography
                                    fontSize="0.75rem"
                                    fontWeight={400}
                                    ml={"14px"}
                                    color={"red"}
                                  >
                                    Caps Lock is on
                                  </Typography>
                                  // <p
                                  //   style={{
                                  //     color: "red",
                                  //     fontSize: "12px",
                                  //     marginTop: "4px",
                                  //   }}
                                  // >
                                  // </p>
                                )}

                                <Box sx={{ m: 1, ml: -1 }}>
                                  <Checkbox
                                    checked={keepLoggedIn}
                                    id="keepLoggedIn"
                                    onChange={handleKeepLoggedInChange}
                                  />
                                  Keep me signed in
                                </Box>
                              </>
                            ) : (
                              <></>
                            )}
                            <Box sx={{ mt: 1 }}>
                              <Button
                                //color="primary"
                                style={{ borderRadius: 8 }}
                                sx={{
                                  backgroundColor: theme.palette.primary,
                                }}
                                disabled={isLoading}
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                id="signInBtn"
                              >
                                {isEmailVerified
                                  ? t("common:common.Signin")
                                  : t("common:calendar.Next")}
                              </Button>
                              {/* } */}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                margin: "auto",
                                // width: "50%",
                                padding: "0px",
                                justifyContent: "center",
                                mt: 1,
                              }}
                            >
                              {isEmailVerified ? (
                                <Link
                                  sx={{ flex: 1 }}
                                  color="textSecondary"
                                  to="/forgot_password"
                                  id="forgotPasswordLink"
                                  underline="none"
                                  style={{
                                    fontSize: "0.9rem",
                                    color: "#F37123",
                                    textDecoration: "none",
                                  }}
                                  variant="body1"
                                >
                                  {t("common:signin.Forgot Password")}
                                </Link>
                              ) : (
                                !helpEnabled && (
                                  <Typography
                                    variant="body1"
                                    onClick={() => setHelpEnabled(true)}
                                    sx={{
                                      color: "#F37123",
                                      cursor: "pointer",
                                      textDecoration: "none",
                                    }}
                                    mt
                                  >
                                    Need help logging in?
                                    {/* Todo - Add translation */}
                                  </Typography>
                                )
                              )}
                            </Box>
                            <Box display="flex" justifyContent="center">
                              <Typography
                                variant="body1"
                                onClick={() =>
                                  window.open(
                                    "https://www.portal.thrivewellapp.com/faqs",
                                    "_blank"
                                  )
                                }
                                sx={{
                                  color: "#F37123",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                  mt: 6,
                                }}
                                mt
                              >
                                Learn more about ThriveWell
                                {/* Todo - Add translation */}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: isExtraSmallScreen
                                  ? "column"
                                  : "row",
                                alignItems: "center",
                                justifyContent: "center",
                                // margin: "auto",
                                // width: isLargeDevice ? "85%" : "60%",
                                padding: "10px",
                                mb: 2,
                                gap: 1,
                                // ml: "10%",
                              }}
                            >
                              <Link
                                sx={{ flex: 1 }}
                                style={{ fontSize: "0.9rem", color: "grey" }}
                                color="textSecondary"
                                to="/terms"
                                id="termOfUseLink"
                                target="_blank"
                                underline="none"
                                variant="h6"
                              >
                                {t("common:common.Terms Of Use")}
                              </Link>
                              {!isExtraSmallScreen && (
                                <Box
                                  style={{
                                    color: "#778791",
                                    // margin: "0 5px 0 5px",
                                  }}
                                >
                                  |
                                </Box>
                              )}
                              <Link
                                sx={{ flex: 1 }}
                                style={{ fontSize: "0.9rem", color: "grey" }}
                                color="textSecondary"
                                to="/privacy"
                                id="privacyLink"
                                target="_blank"
                                underline="none"
                                variant="h6"
                              >
                                {t("common:common.Privacy Policy")}
                              </Link>
                            </Box>
                          </Container>
                        ) : (
                          <Container sx={{ alignItems: "center" }}>
                            <Typography
                              //align="center"
                              color="textSecondary"
                              sx={{ mt: 2, mb: 2 }}
                              variant="h6"
                            >
                              {t("common:signin.Change temporary password")}
                            </Typography>
                            <TextField
                              autoFocus
                              error={Boolean(
                                touched.new_password && errors.new_password
                              )}
                              fullWidth
                              helperText={
                                touched.new_password &&
                                errors.new_password &&
                                t(`common:warnings.${errors.new_password}`)
                              }
                              label={t("common:signin.New Password")}
                              margin="normal"
                              id="newPassword"
                              name="new_password"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              type={showPassword ? "text" : "password"}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              }
                              value={values.new_password}
                              variant="outlined"
                            />
                            <TextField
                              error={Boolean(
                                touched.confirm_new_password &&
                                  errors.confirm_new_password
                              )}
                              fullWidth
                              helperText={
                                touched.confirm_new_password &&
                                errors.confirm_new_password &&
                                t(
                                  `common:warnings.${errors.confirm_new_password}`
                                )
                              }
                              label={t("common:signin.Confirm New Password")}
                              margin="normal"
                              name="confirm_new_password"
                              id="confirmPassword"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              type={showPassword ? "text" : "password"}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              }
                              value={values.confirm_new_password}
                              variant="outlined"
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
                                disabled={
                                  isSubmitting || errors.confirm_new_password
                                }
                                fullWidth
                                id="changePasswordButton"
                                size="large"
                                type="submit"
                                variant="contained"
                              >
                                {t("common:signin.Change Password")}
                              </Button>
                            </Box>
                          </Container>
                        )}
                      </form>
                    </>
                  ) : (
                    <>
                      <Container sx={{ alignItems: "center", width: "100%" }}>
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
                            src="/static/logoOnly.svg"
                            style={{
                              marginRight: 6,
                              height: "20%",
                              width: "20%",
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            align="center"
                            fontFamily="Playfair Display"
                            sx={{ typography: { sm: "h6", xs: "h6" } }}
                          >
                            Check your email for next steps
                          </Typography>
                          <Typography
                            variant="body2"
                            id="check_email_text"
                            gutterBottom
                            sx={{ mt: 1, mb: 2 }}
                          >
                            We have sent an email to {values.email}. Please
                            check your inbox for next steps.
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <Button
                            //color="primary"
                            sx={{
                              backgroundColor: theme.palette.primary,
                              mb: 3,
                            }}
                            fullWidth
                            size="large"
                            id="returnToLoginBtn"
                            onClick={() => {
                              setCanLogin(true);
                            }}
                            variant="contained"
                          >
                            Return to login
                          </Button>
                        </Box>
                      </Container>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </Formik>
  );
};

export default SignIn;
