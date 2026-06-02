import {
  Box,
  Button,
  Grid,
  TextField,
  Autocomplete,
} from "@mui/material";
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const DeactivateFamilyModal = ({
  close,
  deactivateFamilyHandler,
  setIsFamilyActive,
}) => {
  const options = [
    {
      label: "Decided not to use ThriveWell but still active client of our organization",
      value: "Decided not to use ThriveWell but still active client of our organization",
    },
    {
      label: "Adopted or became legal guardian of child and no longer fostering",
      value: "Adopted or became legal guardian of child and no longer fostering",
    },
    {
      label: "Is no longer an active foster at our organization",
      value: "Is no longer an active foster at our organization",
    },
    { label: "Other", value: "Other" },
  ];

  // Validation schema
  const validationSchema = Yup.object({
    deactivateReason: Yup.object()
      .nullable()
      .required("Deactivate reason is required."),
    customDeactivateReason: Yup.string().when("deactivateReason", {
      is: (reason) => reason?.value === "Other",
      then: Yup.string()
        .required("Reason is required."),
      otherwise: Yup.string(),
    }),
  });

  return (
    <Formik
      initialValues={{
        deactivateReason: null,
        customDeactivateReason: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        deactivateFamilyHandler(
          values.deactivateReason,
          values.customDeactivateReason,
          false
        );
        close();
      }}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        handleChange,
        handleSubmit,
      }) => (
        <Form>
          <Box>
            <Autocomplete
              id="deactivateReason"
              name="deactivateReason"
              value={values.deactivateReason}
              options={options}
              sx={{ width:0.49,mb: 2 }}
              isOptionEqualToValue={(option, value) =>
                JSON.stringify(option) === JSON.stringify(value)
              }
              onChange={(_, newValue) =>
                setFieldValue("deactivateReason", newValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Deactivate reason*"
                  error={
                    touched.deactivateReason && Boolean(errors.deactivateReason)
                  }
                  helperText={
                    touched.deactivateReason && errors.deactivateReason
                  }
                />
              )}
            />
            {values.deactivateReason?.value === "Other" && (
              <TextField
                sx={{ mb: 2 }}
                id="customDeactivateReason"
                fullWidth
                placeholder="Why are you deactivating this family? (required)"
                onChange={handleChange}
                value={values.customDeactivateReason}
                name="customDeactivateReason"
                variant="outlined"
                multiline
                rows={3}
                error={
                  touched.customDeactivateReason &&
                  Boolean(errors.customDeactivateReason)
                }
                helperText={
                  touched.customDeactivateReason && errors.customDeactivateReason
                }
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  sx={{ mr: 1, borderRadius: "4px", width: "100%" }}
                  variant="outlined"
                  onClick={() => {
                    close();
                    setIsFamilyActive(true);
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  sx={{ mr: 1, borderRadius: "4px", width: "100%" }}
                  variant="contained"
                  type="submit"
                >
                  Deactivate account
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default DeactivateFamilyModal;
