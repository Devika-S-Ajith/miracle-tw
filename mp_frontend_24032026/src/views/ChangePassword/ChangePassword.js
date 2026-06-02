import React from 'react';
import { useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Box, Button, FormHelperText, TextField, Container, useTheme, Typography, Grid, Divider, Card,IconButton } from '@material-ui/core';
// import useAuth from '../../common/hooks/UseAuth';
import { changePassword } from '../../common/contexts/CognitoHandler';
import useSettings from '../../common/hooks/UseSettings';
import { useTranslation } from 'react-i18next';
import ChevronLeftIcon from '../../assets/icons/ChevronLeft';

const ChangePassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { settings } = useSettings();
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  

  return (
    <Formik
      initialValues={{
        new_password: '',
        old_password: '',
        confirm_password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        new_password: Yup.string()
          .max(16, "Password must be at most 16 characters")
          .matches(passwordRegex,t('common:warnings.Password should be minimum 8 characters with an uppercase, numeric and a special character'))
          .required(t('common:warnings.New Password is required')),      
        confirm_password: Yup.string()
          .oneOf([Yup.ref('new_password'), null],t('common:warnings.Passwords should match'))
          .required(t('common:warnings.You should confirm password')),
        old_password: Yup.string()       
          .required(t('common:warnings.Old Password is required')),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          let data = {
            new_password: values.new_password,
            old_password: values.old_password,
            
          }
          changePassword(data)
            .then((res)=>{
              if(res && (res["code"] || res["message"])){
                if(res["message"]==='Incorrect username or password.'){
                  toast.error(t('common:warnings.Old Password is incorrect'));
                }else if(res["message"]==='Attempt limit exceeded, please try after some time.'){
                  toast.error(t('common:warnings.Attempt limit exceeded, please try after some time'));
                }else{
                  toast.error(t('common:warnings.Error occured while changing password'));
                }
                 
              }else{
                  toast.success(t('common:user.Password Changed Successfully'));
                  navigate('/dashboard/profile',{replace : true})
              }

               })
        }
        catch (err) {
          toast.error(t('common:user.Error changing password'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
         
        }




      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <Box
          sx={{
            backgroundColor: 'background.default',
            minHeight: '100%',
            mt: 2

          }}
        >

          <Container maxWidth={settings.compact ? 'xl' : false}>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton
              color="inherit"
              onClick={() => navigate(-1)}
              sx={{
                mt: -0.5,
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
                <Typography
                  color="textPrimary"
                  variant="h5"
                >
                  {t('common:user.ChangePassword')}
                </Typography>
              </Grid>

            </Grid>
            <Divider />

            <Card sx={{ mt: 3 }} >
              <Box sx={{ ml: 30,width :450 }} >
                <Grid
                  container
                  spacing={3}
                  direction="column"
                  alignItems="center"
                  justify="center"

                >
                  <Grid
                    item
                    lg={6}
                    md={6}
                    xl={6}
                    xs={6}

                  >
                    <form
                      noValidate
                      onSubmit={handleSubmit}
                    //{...props}
                    >
                      <Container sx={{ alignItems: "center" }}>
                        <TextField
                          autoFocus
                          error={Boolean(touched.old_password && errors.old_password)}
                          fullWidth
                          helperText={touched.old_password && errors.old_password}
                          label={t('common:user.Old Password')}
                          margin="normal"
                          name="old_password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="password"
                          value={values.old_password}
                          variant="outlined"
                        />


                        <TextField
                          error={Boolean(touched.new_password && errors.new_password)}
                          fullWidth
                          helperText={touched.new_password && errors.new_password}
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
                          error={Boolean(touched.confirm_password && errors.confirm_password)}
                          fullWidth
                          helperText={touched.confirm_password && errors.confirm_password}
                          label={t('common:signin.Confirm New Password')}
                          margin="normal"
                          name="confirm_password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="password"
                          value={values.confirm_password}
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
                            disabled={isSubmitting}
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                          >
                            {t('common:signin.Confirm Change Password')}
                          </Button>
                        </Box>
                      </Container>

                    </form>

                  </Grid>
                </Grid>


              </Box>
            </Card>




          </Container>

          {/* </Container> */}
        </Box>


      )}
    </Formik>
  );
};

export default ChangePassword;
