import React, { useContext, useState, useEffect, useCallback } from 'react';
// import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
// import NumberFormat from 'react-number-format';
import {
  Box, Button, Card, Grid, TextField, Typography, useTheme, CircularProgress
  // Divider 
} from '@mui/material';

import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import useMounted from '../../../../common/hooks/UseMounted';
import APIS from '../../../../common/hooks/UseApiCalls'
import AutoCompleteDropdownMultiNames from '../../../../components/UserComponents/AutoCompleteDropdownMultiNames';

const AddCaseForm = (props) => {
  const { t } = useTranslation(['common']);
  const [users, setUsers] = useState([]);
  const [childList, setChildList] = useState([]);
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();
  const { roleList } = useContext(CommonDataContext);
  const caseWorkerRoleId = roleList?.find(r => r.role == "Case Worker")?.id
  const navigate = useNavigate();
  const theme = useTheme();

  // const addMember = (e, { value })=>{
  // }

  const getUserList = useCallback(async () => {
    setLoading(true)
    try {
      const payload = {
        "rowCount": "",
        "pageNumber": "1",
        "orderByField": [
          ["firstName", "ASC"]
        ],
        "globalSearchQuery": "",
        "HTOrganizationId": "",
        "HTLanguageId": "",
        "HTChildPlacementStatusId": "",
        "HTChildStatusId": "",
        "needFullData": "true",
        "HTUserRoleId": caseWorkerRoleId
      }
      console.log("final payload >>", payload)
      const data = await APIS.ListUsers(payload);
      console.log("api call", data)
      setUsers(data && data.data && data.data.users);
      setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, [mounted]);

  const getChildrenList = useCallback(async () => {
    try {
      let getChildListpayload = {
        "rowCount": "100",
        "pageNumber": "1",
        "HTCaseId": null,
        "globalSearchQuery": "",
        "childStatus": "Active",
        "orderByField": [
          [
            "firstName",
            "ASC"
          ]
        ],
      }
      const data = await APIS.ListChildren(getChildListpayload);
      if (data && data.data && data.data.data.length) {
        setChildList(data.data.data)
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    getUserList()
    getChildrenList()
  }, [])

  return (
    <Formik
      initialValues={{
        caseID: '1001',
        caseWorker: '',
        child: '',
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
          "TWUserId": values.caseWorker,
          "HTChildId": values.child,
        }
        try {
          await APIS.AddCase(payload).then((res) => {
            if (res && res.data && (res.status === 200 || res.status === 201)) {
              resetForm();
              setStatus({ success: true });
              setSubmitting(false);
              toast.success(t('common:case.Case Added Successfully'));
              // toast.success('Case Added Successfully');
              navigate('/dashboard/cases/');

            } else {
              if (res.status === 400) {
                if (res.body.hasOwnProperty('Message')) {
                  toast.error(res.body.Message)
                }
                let errorMessage = res.body.Error.split(":");
                toast.error(errorMessage[errorMessage.length - 1]);
              } else {
                toast.error(t('common:common.Something went wrong'));
              }

              setStatus({ success: false });
              setSubmitting(false);
            }

          })
        } catch (err) {
          console.error(err);
          toast.error(t('common:common.Something went wrong'));
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
        // try { 
        //   await APIS.AddFamily(payload).then((res)=>{
        //     console.log("res >>",res)
        //     if(res && res.data && res.status === 200){
        //       resetForm();
        //       let familyId = res.data.familyId;
        //       setStatus({ success: true });
        //       getFamilyList();
        //       setSubmitting(false);
        //       toast.success('Family Added Successfully');
        //       console.log("navigating...")
        //       navigate(`/dashboard/family/${familyId}/edit`, { 
        //         state: {
        //           "addMember": true,
        //           "fetchFamilyDetails": true
        //         }
        //       });
        //       //navigate to add member >> dashboard/family/id/edit && tab == members

        //     }else{
        //      toast.error('Something went wrong!');
        //      setStatus({ success: false });
        //      setSubmitting(false);
        //     }

        //   })
        // }catch(err){
        //      console.error(err);
        //      toast.error('Something went wrong!');
        //      setStatus({ success: false });
        //      setErrors({ submit: err.message });
        //      setSubmitting(false);
        // }
        // navigate(`/dashboard/cases/`, { 
        //   state: {
        //     "addMember": true,
        //     "fetchFamilyDetails": true
        //   }
        // });


      }}

    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <Form
          onSubmit={handleSubmit}
        //{...other}
        >
          <Card>
            <Box
              sx={{ m: 2, mt: 3 }}
            >
              {/* <Divider/> */}

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

                {/* <Grid
                  item
                  md={6}
                  xs={12}
                >
                  <TextField
                    error={Boolean(touched.caseID && errors.caseID)}
                    fullWidth
                    helperText={touched.caseID && errors.caseID}
                    label="Case ID"
                    name="caseID"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.caseID}
                    variant="outlined"
                    required
                    disabled
                  />
                </Grid> */}
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
                    options={users}
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
                  sx={{ mt: -2 }}
                >
                  <Field
                    error={Boolean(touched.child && errors.child)}
                    fullWidth
                    helperText={touched.child && errors.child}
                    name="child"
                    accessKey1="firstName"
                    accessKey2="lastName"
                    component={AutoCompleteDropdownMultiNames}
                    required={true}
                    label="child"
                    options={childList}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t('common:common.Child')
                    }}

                  />
                </Grid>
              </Grid>

              {loading &&
                <CircularProgress
                  sx={{
                    zIndex: 1000,
                    position: "absolute",
                    top: "55%",
                    left: "45%"
                  }}
                  color="primary"
                />}

              <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>

                <Button
                  color="primary"
                  sx={{ width: 200 }}
                  //disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  {t('common:case.Save Case')}
                </Button>


                <Button
                  color="primary"
                  sx={{ width: 200, ml: 21 }}

                  disabled={isSubmitting}
                  type="reset"
                  variant="contained"
                  //onClick={handleSubmit}
                  style={{ backgroundColor: theme.palette.button.primary }}
                >
                  {t('common:common.Reset')}
                </Button>

              </Box>


            </Box>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

AddCaseForm.propTypes = {
  // caseID: PropTypes.object.isRequired
};

export default AddCaseForm;
