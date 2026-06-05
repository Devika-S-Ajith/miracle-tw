import React, { useContext, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { FamilyChangeDetails } from "./ChildFormConfig";
import DynamicForm from "../../../../TWFamily/ManageFamily/Components/DynamicForm";
import { Box, Grid } from "@mui/material";
import SecondaryButton from "../../../../../components/SecondaryButton/SecondaryButton";
import PrimaryButton from "../../../../../components/PrimaryButton/PrimaryButton";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup"; // Added Yup import
import { CommonDataContext } from "../../../../../common/contexts/CommonDataContext";
import Loader from "../../../../../components/UserComponents/Loader";
import dayjs from "dayjs";

const FamilyChangeModal = ({ onFamilyChangeConfirm, onFamilyChangeCancel, close, setFieldValue, setHideChildModal }) => {
  const { t } = useTranslation(["common"]);
  const { childDropdownLists } = useContext(CommonDataContext);
  const [isLoading, setIsLoading] = useState(false);
  const schema = Yup.object().shape({
    familyChangeDetails: Yup.object().shape({
      childDischargedDate: Yup.date()
        .required("Date of family change is required")
        .nullable(),
       otherReason: Yup.string().when("childDischargeReason", {
        is: (val) => Array.isArray(val) && val.includes("OTHER"),
        then: (schema) =>
          schema.required("Reason for family change is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      childDischargeReason: Yup.array().min(1, "Please select an option"),
    }),
  });
  const {
    values: familyChangeValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue: setFamilyChangeFieldValue,
  } = useFormik({
    initialValues: {
      familyChangeDetails: {
        childDischargedDate: dayjs(),
        otherReason: "",
        childDischargeReason: [],
      },
    },
    validationSchema: schema,
    onSubmit: () => {
      close();
      onFamilyChangeConfirm({ familyChangeValues, setFieldValue });
    },
  });

  return (
    <LocalizationProvider>
      <Loader loading={isLoading} />
      <Box mx={-2}>
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 2 }}>
          <Grid container spacing={2}>
            <DynamicForm
              values={familyChangeValues}
              errors={errors}
              touched={touched}
              t={t}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFamilyChangeFieldValue}
              config={FamilyChangeDetails({
                values: familyChangeValues,
                familyChangeReasons: childDropdownLists?.familyChangeReasons,
              })}
            />
          </Grid>
        </Box>
      </Box>
      <Grid item container spacing={2} mt={1}>
        <Grid item xs={12} md={6}>
          <SecondaryButton
            label={t("common:common.No, Cancel", "No, Cancel")}
            fullWidth
            onClick={() => {
              setHideChildModal(false);
              onFamilyChangeCancel(setFieldValue);
              close();
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PrimaryButton
            label={t("common:common.Yes, change", "Yes, change")}
            fullWidth
            onClick={handleSubmit}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default FamilyChangeModal;
