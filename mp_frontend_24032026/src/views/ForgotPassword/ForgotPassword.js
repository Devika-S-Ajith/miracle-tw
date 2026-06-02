import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Box, Button, FormHelperText, Grid,TextField, Container, useTheme, Typography, CircularProgress } from '@material-ui/core';
// import useAuth from '../../common/hooks/UseAuth';
// import useMounted from '../../common/hooks/UseMounted';
import { forgotPassword } from '../../common/contexts/CognitoHandler';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';


const ForgotPassword = (props) => {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const [isLoading, setLoading] = useState(false);
  // const mounted = useMounted();
  const navigate = useNavigate();
  const isLargeDevice = useMediaQuery('(min-width:1280px)');
  //const { login } = useAuth();

  useEffect(() => {
    document.title = "Forgot Password | Miracle Foundation"
  }, []);

  return (
    <Formik
      initialValues={{
        email: '',
        new_password: '',
        verification_code: '',
        confirm_new_password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email(t('common:warnings.Must be a valid email'))
          .max(255)
          .required(t('common:warnings.Email is required'))
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        // console.log("submit called")

        try {
          setLoading(true)
          forgotPassword(values.email)
            .then((res) => {
              console.log("response >>", res)
              if (res && res["CodeDeliveryDetails"]) {
                setLoading(false)
                toast.success('Reset password email has been sent to your mail.');
                // navigate('/new_password', { 
                //           state: {
                //             "email": values.email
                //           }
                //         });
                navigate('/');
              } else {
                setErrors({ email: t('common:warnings.User does not exist') }); //working
                toast.error(t('common:warnings.User with this email does not exist')); //working
                setLoading(false)
              }

            })
        } catch (err) {
          toast.error(t('common:warnings.Please try after sometime.'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
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
          backgroundColor='#1D334B'>
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
                <Grid container direction="column" justifyContent="right" alignItems="right" position='relative' right={isLargeDevice ? '50%' : 0}>
                  <Grid item xs={4} sm={4} md={4} lg={12} xl={12} sx={{ zIndex: 1, backgroundColor: '#fff', borderRadius: '8px' }}>
                    <form
                      noValidate
                      onSubmit={handleSubmit}
                      {...props}
                    >
                      <Container
                        sx={{ alignItems: "center" }}
                      >

                        {isLoading && <CircularProgress
                          sx={{
                            zIndex: 1000,
                            position: "absolute",
                            top: "55%",
                            left: "48%"
                          }}
                          color="success" />}

                        <Box sx={{
                          alignItems: "center",
                          justifyContent: "center",
                          //borderWidth :5,
                          //borderColor :"red",
                          //width :450,
                          height: 140
                        }}>

                          <Typography color="textSecondary"
                            variant="h3"
                            align="center"
                            sx={{ mt: 2 }}
                          >

                            Thrive Scale
                          </Typography>

                          <img
                            alt="Miracle Foundation Logo"
                            src="/static/miracle_md_blue.png"
                            style={{
                              display: 'block',
                              marginLeft: 'auto',
                              marginRight: 'auto',
                              marginTop: 20,
                              width: '70%'
                            }}
                          />
                        </Box>
                        <Typography
                          //align="center"
                          color="textSecondary"
                          sx={{ mt: 2, mb: 2 }}
                          variant="h5"
                        >
                          {t('common:signin.Forgot Password')} ?
                        </Typography>

                        <TextField
                          autoFocus
                          error={Boolean(touched.email && errors.email)}
                          fullWidth
                          helperText={touched.email && errors.email}
                          label={t('common:common.Email')}
                          margin="normal"
                          name="email"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="email"
                          value={values.email}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
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
                            sx={{ backgroundColor: theme.palette.primary, mb: 3 }}
                            disabled={isSubmitting || isLoading}
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                          >
                            {t('common:assessment.Submit')}
                          </Button>
                        </Box>
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

export default ForgotPassword;
