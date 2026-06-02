import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Box, Button, FormHelperText, TextField ,Container, useTheme, Typography} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
// import useAuth from '../../common/hooks/UseAuth';
import { forgotPasswordSubmit } from '../../common/contexts/CognitoHandler';

const NewPassword = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  searchParams.get("email")
  //const location= useLocation();
  const theme = useTheme();
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  // const email = location.state && location.state.email;
  const email = searchParams && searchParams.get("email")
  const verificationCode = searchParams && searchParams.get("verification_code")
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  console.log("email >>",email)
  console.log("location >>",searchParams.get("email"))

  return (
    <Formik
      initialValues={{
        new_password : '',
        verification_code : verificationCode || '',
        confirm_password : '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        new_password: Yup.string()
                          .max(16, "Password must be at most 16 characters")
                          .matches(passwordRegex, "Password should be minimum 8 characters with an uppercase, numeric and a special character")
                          .required('New password is required'),
        confirm_password: Yup.string()
                          .oneOf([Yup.ref('new_password'),null],'Passwords should match')
                          .required('You should confirm password.'),
        verification_code : Yup.string()
                          .min(4)
                          .max(25)
                          .required('Verification Code is required'),
      })}
      onSubmit={  async (values, { setErrors, setStatus, setSubmitting }) => {
        // console.log("submit called")
       
      try {
          let data = {
              new_password : values.new_password,
              code : values.verification_code,
              username : email
          }
       forgotPasswordSubmit(data)
      .then((res)=>{
        if(res && (res["code"] || res["message"])){
            const errorMsg = res["message"] ? res["message"].replace(".", "") : 'Error occured while changing password'
            toast.error(t(`common:warnings.${errorMsg}`));
        }else{
            toast.success('Password Changed Successfully');
            navigate('/dashboard',{replace : true})
        }
        
         })
    }
    catch (err){
    toast.error('Error changing password.');
    setStatus({ success: false });
    setErrors({ submit: err.message });
    setSubmitting(false);
    console.log("error in forgotPassword api call")
    }
        


        
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
       
        <Container sx={{display : "flex",
                        flexDirection : "column",
                        width : 450,
                        mt : 5,
                        backgroundColor : "#fff",
                        borderRadius : 1,
                        boxShadow: theme.shadows[5],
                        }}>

        
        <form
          noValidate
          onSubmit={handleSubmit}
          //{...props}
        >
          <Container sx={{alignItems : "center"}}>
            <Box sx={{
              alignItems :"center",
              justifyContent:"center",
              //borderWidth :5,
              //borderColor :"red",
              //width :450,
              height :140}}>
            {/* <Typography color="textPrimary"
            variant="h1">
            Miracle Foundation
            </Typography> */}
                  <Typography color="textSecondary"
                  variant="h3"
                  align="center"
                  sx={{mt : 2}}
                  >
                    {t('common:common.Thrive Scale')}
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
            sx={{ mt: 2,mb : 2 }}
            variant="h5"
          >
            {t('common:common.Enter verification code and new password')}
          </Typography>

          <TextField
            autoFocus
            error={Boolean(touched.verification_code && errors.verification_code)}
            fullWidth
            helperText={touched.verification_code && errors.verification_code}
            label={t('common:signin.Verification Code')}
            margin="normal"
            name="verification_code"
            onBlur={handleBlur}
            onChange={handleChange}
            type="text"
            value={values.verification_code}
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
              sx={{backgroundColor : theme.palette.primary,mb : 3}}
              disabled={isSubmitting}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {t('common:signin.Confirm New Password')}
            </Button>
          </Box>
          </Container>
          
        </form>
        </Container>
      )}
    </Formik>
  );
};

export default NewPassword;
