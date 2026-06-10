import { Grid } from "@mui/material";
import React from "react";

export const ObservationTextField = ({ label, name, value, required = false, CustomTextField, handleBlur, handleChange }) => (
    <Grid item md={12} xs={12} mt={2}>
      <CustomTextField
        fullWidth
        label={label}
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        value={value}
        disabled
        multiline
        rows={3}
        rowsMax={10}
        variant="outlined"
        required={required}
      />
    </Grid>
  );
