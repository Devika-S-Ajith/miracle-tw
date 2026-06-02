import React, { useState, useEffect, useContext } from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Box, Button, FormHelperText, TextField, Container, useTheme, Grid, Typography, CircularProgress } from '@material-ui/core';
// import useAuth from '../../common/hooks/UseAuth';
// import useMounted from '../../common/hooks/UseMounted';
import { signIn, completePassword } from '../../common/contexts/CognitoHandler';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../common/contexts/CommonDataContext';
import APIS from '../../common/hooks/UseApiCalls';
import useSettings from '../../common/hooks/UseSettings';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeStyles } from "@material-ui/core/styles";
import _ from 'lodash'
import Stack from '@mui/material/Stack';

import './signin.css'

const useStyles = makeStyles((theme) => ({

  input: {
    background: alpha('#778791', 0.2),
    borderRadius: 8,
    position: 'relative',
    border: '0px solid',
    fontSize: 16,
    width: '100%',
    padding: '10px 12px',
    disableUnderline: true,
    "&::placeholder": {
      textAlign: "center"
    },
    "&:hover": {
      background: 'white',
      border: '1px solid #F37123',
      borderRadius: 8
    },
  },

}));

const useStylesHaveData = makeStyles((theme) => ({

  input: {
    background: '#ffffff',
    borderRadius: 8,
    position: 'relative',
    border: '1px solid #F37123',
    fontSize: 16,
    width: '100%',
    padding: '10px 12px',
    disableUnderline: true,
    "&::placeholder": {
      textAlign: "center"
    },

    "&:hover": {
      background: 'white',
      border: '1px solid #F37123',
      borderRadius: 8
    },
  },

}));

const languageOptions = [
   {
    id:1,
    icon:'/static/English.svg',
    language: 'English',
    languageCode : 'en'
   },
   {
    id:2,
    icon:'/static/Hindi.svg',
    language: 'Hindi',
    languageCode : 'hi'
   }, {
    id:3,
    icon:'/static/Tamil.svg',
    language: 'Tamil',
    languageCode : 'ta'
   }
  ]

const SignIn = (props) => {
  const { t, i18n } = useTranslation(['common']);
  const theme = useTheme();
  const classes = useStyles();
  const classHaveData = useStylesHaveData()
  const isLargeDevice = useMediaQuery('(min-width:1280px)');
  const { setSignedinUserRole,getSignedinUserOrgType, currentUserlanguage, setCurrentUserlanguage, setLanguageChange } = useContext(CommonDataContext);
  // const mounted = useMounted();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(false);
  const [isLoading, setLoading] = useState(false);
  //const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  //hash password
  // const saltRounds = 10;
  //const { login } = useAuth();

  useEffect(() => {
    return () => {
      //setLoading(false)
      //setChallenge(false)
    }
  })

  useEffect(() => {
    document.title = "Sign In | Miracle Foundation"
    if(!_.isNil(localStorage.getItem('username'))){
      navigate('/dashboard')
    }
  }, []);

  function handleChangeLanguage(e, language) {
    e.preventDefault()
    setLanguageChange(true)
    console.log(language)
    setCurrentUserlanguage(language)
    i18n.changeLanguage(language);
    localStorage.setItem('language', language)

  };

  const setSelectedLanguageFromLoginScreen = async (username) => {
    let langId;
    const currentLanguageList = await JSON.parse(localStorage.getItem('languageList'));
    console.log('currentLanguageList', currentLanguageList);

    langId = currentLanguageList?.length && currentLanguageList.find(item => item.languageCode == localStorage.getItem('i18nextLng'))?.id;

    const payload = {
      "userId": `${username}`,
      "languageId": `${langId}`
    }
    console.log('payload', payload)

    try {
      if(payload.languageId != "undefined"){
        await APIS.saveUserLanguage(payload);
      }
    } catch (error) {
      console.log('setSelectedLanguageFromLoginScreen', error);
    }
  }

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        new_password: '',
        confirm_new_password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
        password: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .max(16, "Password must be at most 16 characters")
          .required("Password is required"),
        new_password: challenge && Yup.string()
          //.min(6)
          .max(16, "Password must be at most 16 characters")
          .matches(passwordRegex, "Password should be minimum 8 characters with an uppercase, numeric and a special character")
          .required("New Password is required"),
        confirm_new_password: challenge && Yup.string()
          .oneOf([Yup.ref('new_password'), null], "Passwords should match")
          .required(t("You should confirm password"))
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        setLoading(true)
        try {
          let signinData = {
            username: values.email,
            password: values.password
          }
          signIn(signinData)
            .then(async (res) => {
              console.log("response >>", res)
              if (res.challengeName === 'NEW_PASSWORD_REQUIRED') {
                if (challenge === true) {
                  let newPassword = values.new_password
                  completePassword(res, newPassword)
                    .then(async (resp) => {
                      setLoading(false)
                      let accessToken = resp && resp.signInUserSession &&
                        resp.signInUserSession.accessToken &&
                        resp.signInUserSession.accessToken.jwtToken &&
                        resp.signInUserSession.accessToken.jwtToken

                      let refreshToken = resp && resp.signInUserSession &&
                        resp.signInUserSession.refreshToken &&
                        resp.signInUserSession.refreshToken.token &&
                        resp.signInUserSession.refreshToken.token

                      let idToken = resp && resp.signInUserSession &&
                        resp.signInUserSession.idToken &&
                        resp.signInUserSession.idToken.jwtToken &&
                        resp.signInUserSession.idToken.jwtToken
                      let orgId = res.challengeParam.userAttributes['custom:organization_id'];
                      let role = res.challengeParam.userAttributes['custom:role'];
                      let username = res.username;
                      await setSelectedLanguageFromLoginScreen(username);
                      localStorage.setItem('accessToken', accessToken)
                      localStorage.setItem('refreshToken', refreshToken)
                      localStorage.setItem('idToken', idToken)
                      localStorage.setItem('orgId', orgId);
                      localStorage.setItem('role', role);
                      localStorage.setItem('username', username);
                      const currentLanguage = localStorage.getItem('language');
                      if (!currentLanguage) {
                        localStorage.setItem('language', 'en')
                      }
                      getSignedinUserOrgType(orgId)
                      setSignedinUserRole(role)
                      navigate('/dashboard', { replace: true });
                    })
                    .catch((err) => {
                      console.error('Error in confirm pass >>', err)
                      setLoading(false)
                      // navigate('/dashboard'); // bypassing
                    });
                }
                setChallenge(true)
              } else {
                if (res.signInUserSession) {
                  let accessToken = res.signInUserSession && res.signInUserSession.accessToken && res.signInUserSession.accessToken.jwtToken
                  let refreshToken = res.signInUserSession && res.signInUserSession.refreshToken && res.signInUserSession.refreshToken.token
                  let idToken = res.signInUserSession && res.signInUserSession.idToken && res.signInUserSession.idToken.jwtToken
                  let orgId = res.attributes['custom:organization_id'];
                  let role = res.attributes['custom:role'];
                  let username = res.username;
                  await setSelectedLanguageFromLoginScreen(username);
                  setStatus({ success: true });
                  console.log(res)
                  setSubmitting(false);
                  localStorage.setItem('accessToken', accessToken)
                  localStorage.setItem('refreshToken', refreshToken)
                  localStorage.setItem('idToken', idToken)
                  localStorage.setItem('orgId', orgId);
                  localStorage.setItem('role', role);
                  localStorage.setItem('username', username);
                  const currentLanguage = localStorage.getItem('language');
                  if (!currentLanguage) {
                    localStorage.setItem('language', 'en')
                  }
                  getSignedinUserOrgType(orgId)
                  setSignedinUserRole(role)
                  navigate('/dashboard', { replace: true });
                }
                else {
                  setErrors({ password: res.error && res.error.message.replace(".", "") });
                }
                setLoading(false)
              }
              setLoading(false)
            })
            .catch((err) => {
              console.log("signin err >>", err)
              setErrors({ password: err.message });
              toast.error(t('common:warnings.Error in password'));
              setLoading(false)
            })
        } catch (err) {
          toast.error(t('common:warnings.Error in password'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          //setErrors({ password: err.message });
          setSubmitting(false);
          console.log("error in signin api call")
          setLoading(false)
        }




      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (

        <Container sx={{
          display: "flex", minHeight: '100vh', padding: '30px 24px',
          gap: '54px',
          isolation: 'isolate'
        }}
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          backgroundColor='#1D334B'
          >
          <Grid container spacing={1}  >
            <Grid container direction="row" sx={{ pt: '5%' }} justifyContent="center" alignItems="center">
              <Grid item xs={12} sm={12} md={9} lg={9} xl={9} sx={{ ml: isLargeDevice ? 5 : 1 }} justifyContent="center" alignItems="center">
                <img
                  alt="Miracle Foundation Logo"
                  src="/static/Frame_33.png"
                  style={{
                    width: isLargeDevice ? '70%' : '90%',
                  }}
                />
              </Grid>
              <Grid item xs={8} sm={8} md={4} lg={2.6} xl={2.6}>
                <Grid container direction="column" justifyContent="right" alignItems="right" position='relative' right={isLargeDevice ? '60%' : '10%'} sx={{marginTop:10}}>
                  <Grid item xs={4} sm={4} md={4} lg={12} xl={12} sx={{ zIndex: 1, backgroundColor: '#fff', borderRadius: '8px' }}>
                    <form
                      noValidate
                      onSubmit={handleSubmit}
                      {...props}
                    >
                      {!challenge ? <Container
                        sx={{ alignItems: "center", width: '100%' }}
                      >
                        {isLoading && <CircularProgress
                          sx={{
                            zIndex: 1000,
                            position: "absolute",
                            top: "55%",
                            left: "48%"
                          }}
                          color="success" />}

                        <Box sx={{ margin: 'auto', maxWidth:'283px', marginTop: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img
                            alt="Miracle Foundation Logo"
                            src="/static/Group 202.png"
                            style={{
                              marginRight: 6,
                              height: '17%',
                              width: '17%'
                            }}
                          />
                          <Typography
                            align="center"
                            color="textSecondary"
                            fontFamily='mullish'
                            sx={{ typography: { sm: 'body1', xs: 'body1' } }}
                          >{t('common:signin.Sign in to your account')}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: Boolean(touched.email && errors.email) ? 1 : 2 }}>
                          <TextField
                            error={Boolean(touched.email && errors.email)}
                            fullWidth
                            helperText={touched.email && errors.email && t(`common:warnings.${errors.email}`)}
                            placeholder={t('common:common.Email')}
                            inputProps={{ className: values.email ? classHaveData.input : classes.input }}
                            label=''
                            name="email"
                            defaultValue="example"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="email"
                            color="secondary"
                            value={values.email}
                            sx={{
                              "& fieldset": { border: 'none' },
                              fontFamily:'mullish'

                            }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: Boolean(touched.password && errors.password) ? 1 : 2 }}>
                          <TextField
                            error={Boolean(touched.password && errors.password)}
                            fullWidth
                            helperText={touched.password && errors.password && t(`common:warnings.${errors.password}`)}
                            label=""
                            placeholder={t('common:common.Password')}
                            inputProps={{ className: values.password ? classHaveData.input : classes.input }}
                            name="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="password"
                            value={values.password}
                            sx={{
                              "& fieldset": { border: 'none' },
                            }}
                          />
                        </Box>
                        {errors.submit && (
                          <Box sx={{ mt: 3 }}>
                            <FormHelperText error>
                              {errors.submit}
                            </FormHelperText>
                          </Box>
                        )}
                        <Box sx={{
                          display: "flex",
                          margin: 'auto',
                          width: '50%',
                          padding: '0px'
                        }}>
                          <Link
                            sx={{ flex: 1 }}
                            color="textSecondary"
                            to="/forgot_password"
                            underline="none"
                            style={{ fontSize: '0.9rem' }}
                            variant="body1"
                          >
                            {t('common:signin.Forgot Password')}
                          </Link>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            //color="primary"
                            style={{ borderRadius: 8 }}
                            sx={{ backgroundColor: theme.palette.primary }}
                            disabled={isSubmitting || errors.password}
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                          >
                            {t('common:common.Signin')}
                          </Button>
                        </Box>
                        <Box sx={{
                          display: "flex",
                          margin: 'auto',
                          width: isLargeDevice?'85%':'60%',
                          padding: '5px'
                        }}>
                          <Link
                            sx={{ flex: 1 }}
                            style={{ fontSize: '0.9rem' }}
                            color="textSecondary"
                            to="/terms"
                            target="_blank"
                            underline='none'
                            variant="h6"
                          >
                            {t('common:common.Terms Of Use')}
                          </Link>
                          <p style={{ margin: '0 5px 0 5px' }}> | </p>
                          <Link
                            sx={{ flex: 1 }}
                            style={{ fontSize: '0.9rem' }}
                            color="textSecondary"
                            to="/privacy"
                            target="_blank"
                            underline="none"
                            variant="h6"
                          >
                            {t('common:common.Privacy Policy')}
                          </Link>
                        </Box>
                      </Container> :
                        <Container sx={{ alignItems: "center" }}>
                         
                          <Typography
                            //align="center"
                            color="textSecondary"
                            sx={{ mt: 2, mb: 2 }}
                            variant="h5"
                          >
                            {t('common:signin.Change temporary password')}
                          </Typography>
                          <TextField
                            autoFocus
                            error={Boolean(touched.new_password && errors.new_password)}
                            fullWidth
                            helperText={touched.new_password && errors.new_password && t(`common:warnings.${errors.new_password}`)}
                            label={t('common:signin.New Password')}
                            margin="normal"
                            name="new_password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="password"
                            value={values.new_password}
                            variant="outlined"
                          />
                          <TextField
                            error={Boolean(touched.confirm_new_password && errors.confirm_new_password)}
                            fullWidth
                            helperText={touched.confirm_new_password && errors.confirm_new_password && t(`common:warnings.${errors.confirm_new_password}`)}
                            label={t('common:signin.Confirm New Password')}
                            margin="normal"
                            name="confirm_new_password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="password"
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
                              sx={{ backgroundColor: theme.palette.primary, mb: 3 }}
                              disabled={isSubmitting || errors.confirm_new_password}
                              fullWidth
                              size="large"
                              type="submit"
                              variant="contained"
                            >
                              {t('common:signin.Change Password')}
                            </Button>
                          </Box>
                        </Container>
                      }
                    </form>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={6} xl={6} width='110%' justifyContent="center" alignItems="center" sx={{ mt: 2, zIndex: 1, backgroundColor: '#fff', borderRadius: '8px' }}>
                    <Box sx={{ alignItems: 'center', justifyContent: "center", pl: 2 }}>
                      <Typography color="textSecondary"
                        variant="body1"
                        align="center"
                        sx={{ mt: 1 }}
                      >{t('common:common.Select Language')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5, pb: 1, pt: 1, pr: 0.5 }}>
                      {
                        languageOptions?.map((languageItem) => {
                          return (<Stack direction="row" spacing={1} padding={0.5}>
                            <Button onClick={(e) => handleChangeLanguage(e, languageItem.languageCode)} size="small" style={{ backgroundColor: currentUserlanguage === languageItem?.languageCode ? '#1D334B' : "" }} sx={{ fontSize: '.9rem' }} variant={currentUserlanguage === languageItem.languageCode ? 'contained' : 'outlined'} startIcon={<img
                              alt={languageItem?.languageCode}
                              src={languageItem.icon}
                              style={{
                                marginLeft: -4,
                                width: '1.4rem'
                              }} />}>
                              {languageItem?.language}
                            </Button>
                          </Stack>)
                        })
                      }
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>


      )
      }
    </Formik >
  );
};

export default SignIn;
