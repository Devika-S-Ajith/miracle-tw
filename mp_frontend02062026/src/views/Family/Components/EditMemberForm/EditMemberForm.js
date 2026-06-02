import React, { useState, useContext } from "react";
// import PropTypes from 'prop-types';
import {
  // Link as RouterLink, useParams, Navigate,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  TextField,
} from "@mui/material";
import APIS from "../../../../common/hooks/UseApiCalls";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import { PhoneTextInput } from "../../../../components/PhoneTextInput/PhoneTextInput";
import { PhoneNumberUtil } from "google-libphonenumber";
const phoneUtil = PhoneNumberUtil.getInstance();

const EditMemberForm = (props) => {
  const { t } = useTranslation(["common"]);
  const { member } = props;

  console.log("member", member);

  const initialValues = {
    member_id: (member && member.id) || "",
    first_name: (member && member.firstName) || "",
    last_name: (member && member.lastName) || "",
    phone: (member && member.phoneNumber) || "",
    email: (member && member.email) || "",
    occupation: (member && member.occupation) || "",
    member_type: (member && member.HTFamilyMemberTypeId) || "",
    relation: (member && member.HTFamilyRelationId) || "",
    is_primary: member && member.isPrimaryCareGiver,
    other_relation: (member && member.otherRelation) || "",
    submit: null,
  };
  const navigate = useNavigate();
  const [checked, setChecked] = useState(member && member.isPrimaryCareGiver);
  const { memberTypeList, relationList, getFamilyList, userRegion } =
    useContext(CommonDataContext);
  // const mounted = useMounted();
  const [loading, setLoading] = useState(false);
  const [modelFlag, setModelFlag] = useState(false);

  const handleClose2 = () => {
    setModelFlag(false);
  };
 

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        first_name: Yup.string()
          .max(255)
          .required(t("common:warnings.First Name is required")),
        last_name: Yup.string().max(255),
        email: Yup.string()
          .email(t("common:warnings.Must be a valid email"))
          .max(255),
        occupation: Yup.string().max(255),
        relation: Yup.string()
          .max(255)
          .required(t("common:warnings.Relation is required")),
        phone: Yup.string()
          .required(t("common:warnings.Phone Number is required"))
          .test(
            "phone-format-validation",
            t("common:warnings.Invalid Phone number"),
            (value) => {
              try {
                const phoneNumber = phoneUtil.parseAndKeepRawInput(value);
                return phoneUtil.isValidNumber(phoneNumber);
              } catch (error) {
                return false; // Handle parsing errors
              }
            }
          ),
        other_relation: Yup.string().when("relation", {
          is: (relation) => relation && relation == "7",
          then: Yup.string().required(
            t("common:warnings.Other relation is required")
          ),
          otherwise: Yup.string(),
        }),
      })}
      onSubmit={async (
        values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        let payload = {
          id: values.member_id,
          firstName: values.first_name,
          lastName: values.last_name,
          occupation: values.occupation,
          phoneNumber: values.phone,
          email: values.email,
          isPrimaryCareGiver: checked,
          HTFamilyRelationId: values.relation,
          HTFamilyId: member && member.familyId,
          otherRelation: values.relation == "7" ? values.other_relation : "",
          HTFamilyMemberTypeId: values.member_type,
        };
        try {
          setLoading(true);
          await APIS.EditFamilyMember(payload).then((res) => {
            if (res && res.data && res.status === 200) {
              //resetForm();
              setStatus({ success: true });
              getFamilyList();
              setSubmitting(false);
              setLoading(false);
              toast.success(t("common:common.Member Updated Successfully"));
              navigate(-1);
            } else {
              setLoading(false);
              toast.error(t("common:common.Something went wrong"));
              setStatus({ success: false });
              setSubmitting(false);
            }
          });
        } catch (err) {
          toast.error(t("common:common.Something went wrong"));
          setStatus({ success: false });
          setLoading(false);
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
        setFieldValue,
        resetForm,
      }) => (
        <form
          onSubmit={handleSubmit}
          //{...other}
        >
          <Card>
            <Box sx={{ m: 2, mt: 4 }}>
              <Grid container spacing={3}>
                {loading && (
                  <CircularProgress
                    sx={{
                      zIndex: 1000,
                      position: "absolute",
                      top: "55%",
                      left: "45%",
                    }}
                    color="primary"
                  />
                )}

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.first_name && errors.first_name)}
                    fullWidth
                    autoFocus
                    helperText={touched.first_name && errors.first_name}
                    label={t("common:common.FirstName")}
                    name="first_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.first_name}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.last_name && errors.last_name)}
                    fullWidth
                    helperText={touched.last_name && errors.last_name}
                    label={t("common:common.LastName")}
                    name="last_name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.last_name}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.occupation && errors.occupation)}
                    fullWidth
                    helperText={touched.occupation && errors.occupation}
                    label={t("common:common.Occupation")}
                    name="occupation"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.occupation}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <PhoneTextInput
                    name={`phone`}
                    required
                    onBlur={handleBlur}
                    error={Boolean(touched?.phone && errors?.phone)}
                    helperText={touched?.phone && errors?.phone}
                    value={values.phone}
                    onChange={(phone) => setFieldValue("phone", phone)}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.email && errors.email)}
                    fullWidth
                    helperText={touched.email && errors.email}
                    label={t("common:common.Email")}
                    id="email"
                    name="email"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      setFieldValue("email", e.target.value.trim());
                    }}
                    value={values.email}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12} sx={{ mt: -2 }}>
                  <Field
                    error={Boolean(touched.relation && errors.relation)}
                    fullWidth
                    helperText={touched.relation && errors.relation}
                    name="relation"
                    accessKey="relation"
                    component={AutoCompleteDropdown}
                    label="relation"
                    options={relationList}
                    textFieldProps={{
                      required: true,
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Relationship to Child"),
                    }}
                  />
                </Grid>

                {values.relation === "7" && (
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(
                        touched.other_relation && errors.other_relation
                      )}
                      fullWidth
                      helperText={
                        touched.other_relation && errors.other_relation
                      }
                      label={t("common:common.Other Relation")}
                      name="other_relation"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.other_relation}
                      variant="outlined"
                      required
                    />
                  </Grid>
                )}
                <Grid />
              </Grid>

              <Box sx={{ mt: 2 }} display="flex" gap={1.5}>
                <Button
                  // sx={{ ml: 15 }}
                  color="primary"
                  type="reset"
                  variant="contained"
                  onClick={() => {
                    resetForm();
                  }}
                >
                  {t("common:common.Reset")}
                </Button>
                <Button
                  color="primary"
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                >
                  {t("common:common.Update")}
                </Button>
              </Box>
            </Box>
            <Dialog aria-labelledby="primarycaregiverDLG" open={modelFlag}>
              <DialogTitle id="primarycaregiverDLGtittle">
                {t("common:question.Are you sure")}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {t("common:family.confirmPrimaryCaregiver")}
                  <br></br>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setChecked(!checked);
                    setModelFlag(false);
                  }}
                  color="primary"
                >
                  {t("common:common.Yes")}
                </Button>
                <Button onClick={handleClose2} color="primary" autoFocus>
                  {t("common:common.No")}
                </Button>
              </DialogActions>
            </Dialog>
          </Card>
        </form>
      )}
    </Formik>
  );
};

EditMemberForm.propTypes = {
  //family: PropTypes.object.isRequired
};

export default EditMemberForm;
