import React, { useContext, useState } from 'react';
// import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Formik, Field } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, Button, Card, Grid, TextField, Typography, } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
// import NumberFormat from 'react-number-format';
// import wait from '../../../../__fakeApi__/Wait';
import APIS from '../../../../common/hooks/UseApiCalls';
// import { customerApi } from '../../../../__fakeApi__/customerApi';

import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import InformationCircleIcon from '../../../../assets/icons/InformationCircle';
import AutoCompleteDropdownMultiNames from '../../../../components/UserComponents/AutoCompleteDropdownMultiNames';


const EditCaseForm = (props) => {
  const { t } = useTranslation(['common']);
  const { cases, ...other } = props;
  const navigate = useNavigate();
  const { userList } = useContext(CommonDataContext);
  const [modalFlag, setModalFlag] = useState(false);
  // const primaryCaregiver = cases && cases.HT_familyMembers && cases.HT_familyMembers.find(member => member.isPrimaryCareGiver === true)


  const closeCase = async (e, value) => {
    e.preventDefault()
    try {
      const statusPayload = {
        "caseId": value.caseID,
        "forceClose": false
      }
      await APIS.CloseCase(statusPayload)
        .then((res) => {
          if (res.status === 200) {
            toast.success('Case has been Closed');
            navigate('/dashboard/cases/');
          }
          else if (res.body.Error === 'There must be no incomplete assessments') {
            toast.error('There are incomplete assessments for this child.');
          }
          else {
            toast.error('Something went wrong');
          }
          setModalFlag(false);
        })

    } catch (err) {
      toast.error('Something went wrong');

    }
  }

  const handleClose = (e) => {
    e.preventDefault()
    setModalFlag(false);
  };


  return (
    <Formik
      initialValues={{
        caseID: cases.id,
        caseWorker: cases.TWUserId,
        child: cases.HTChildId,
        submit: null,
      }}
      validationSchema={Yup
        .object()
        .shape({
          caseID: Yup.string().max(255).required(t('common:warnings.Case ID is required')),
          caseWorker: Yup.string().max(255).required(t('common:warnings.Case Worker is required')),
          child: Yup.string().max(255).required(t('common:warnings.Child is required')),
        })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        let payload = {
          "id": cases && cases.id,
          "TWUserId": values.caseWorker,
          "HTChildId": values.child,
        }

        try {
          await APIS.EditCase(payload)
            .then((res) => {
              if (res && res.data && res.status === 200) {
                resetForm();
                setStatus({ success: true });
                setSubmitting(false);
                toast.success(t('common:case.Case Updated Successfully'));
                navigate('/dashboard/cases/');
              } else {
                toast.error(t('common:common.Something went wrong'));
                setStatus({ success: false });
                setSubmitting(false);
              }
            })
        } catch (err) {
          toast.error(t('common:common.Something went wrong'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
        // navigate('/dashboard/cases');

      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, handleReset }) => (
        <form
          onSubmit={handleSubmit}
          onReset={handleReset}
          {...other}
        >
          <Card >
            <Box
              sx={{ m: 2, mt: 3 }}
            >
              <Grid
                container
                spacing={3}
              >

                <Grid
                  item
                  md={12}
                  xs={12}
                >
                  <Typography
                    color="textSecondary"
                    variant="subtitle2">
                    {/* Member {index + 1} */}
                    {t('common:case.Case Information')}
                  </Typography>
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.caseID && errors.caseID)}
                    fullWidth
                    helperText={touched.caseID && errors.caseID}
                    label={t('common:child.Case ID')}
                    name="caseID"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.caseID}
                    variant="outlined"
                    required
                    disabled={true}
                  />
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                  sx={{ mt: -2 }}
                >
                  <Field
                    error={Boolean(touched.caseWorker && errors.caseWorker)}
                    fullWidth
                    helperText={touched.caseWorker && errors.caseWorker}
                    name="caseWorker"
                    accessKey1="firstName"
                    accessKey2="lastName"
                    component={AutoCompleteDropdownMultiNames}
                    required={true}
                    label="caseWorker"
                    options={userList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t('common:common.Case Worker')
                    }}

                  />
                </Grid>
                <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.child && errors.child)}
                    fullWidth
                    helperText={touched.child && errors.child}
                    label={t('common:common.Child')}
                    name="child"
                    select
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.child}
                    variant="outlined"
                    required
                    disabled={true}
                  >
                    <MenuItem key={cases.HTChildId}
                      value={cases.HTChildId}>
                      {cases.childFirstName + ' ' + cases.childLastName}
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid
                  item
                  md={6}
                  xs={12}
                >
                </Grid>
              </Grid>


              <Box sx={{ mt: 2 }}>
                <Button
                  color="primary"
                  disabled={isSubmitting}
                  type="submit"
                  sx={{ width: 200 }}
                  variant="contained"
                >
                  {t('common:case.Update Case')}
                </Button>
                <Button
                  color="primary"
                  sx={{ width: 200, ml: 21 }}
                  disabled={isSubmitting}
                  type="reset"
                  variant="contained"
                >
                  {t('common:common.Reset')}
                </Button>
                {cases.caseStatus === 'Open' ? (<Button
                  color="primary"
                  disabled={isSubmitting}
                  onClick={() => setModalFlag(true)}
                  sx={{ width: 200, ml: 21 }}
                  variant="contained"
                >
                  {t('common:case.Close Case')}
                </Button>) : <></>}
              </Box>
            </Box>
            <Dialog aria-labelledby="simple-dialog-title" open={modalFlag}>
              <DialogTitle id="simple-dialog-title">Are you sure?</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {t('common:common.All scheduled assessments related to this case will be deleted')}
                  <br />
                  {t('common:common.Before closing the case, please complete all the overdue assessments of the child if there are any')}
                  <br />
                  {t('common:common.Would you like to proceed with closing this case')}<br></br>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={(e) => closeCase(e, values)} color="primary">
                  Yes
                </Button>
                <Button onClick={(e) => handleClose(e)} color="primary" autoFocus>
                  No
                </Button>
              </DialogActions>

            </Dialog>
          </Card>
        </form>
      )}
    </Formik>
  );
};

EditCaseForm.propTypes = {
  //cases: PropTypes.object.isRequired
};

export default EditCaseForm;
