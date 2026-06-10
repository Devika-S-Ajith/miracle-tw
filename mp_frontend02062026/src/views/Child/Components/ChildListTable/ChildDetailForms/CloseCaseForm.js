import { Grid, Stack } from "@mui/material";
import React, { useContext, useState } from "react";
import DynamicForm from "../../../../TWFamily/ManageFamily/Components/DynamicForm";
import { useFormik } from "formik";
import { CaseCloseDetails } from "./ChildFormConfig";
import SecondaryButton from "../../../../../components/SecondaryButton/SecondaryButton";
import PrimaryButton from "../../../../../components/PrimaryButton/PrimaryButton";
import { useTranslation } from "react-i18next";
import { ModalService } from "../../../../../components/Modal";
import SubHeading from "../../../../../components/SubHeading/SubHeading";
import { Box } from "@mui/system";
import { CommonDataContext } from "../../../../../common/contexts/CommonDataContext";
import APIS from "../../../../../common/hooks/UseApiCalls";
import * as Yup from "yup"; // Added Yup import
import Heading from "../../../../../components/Heading";
import CloseIcon from "@mui/icons-material/Close";
import Loader from "../../../../../components/UserComponents/Loader";

const CloseCaseForm = ({
  close,
  setHideChildModal,
  handleChildModalOpen,
  onCaseClose,
  childId,
}) => {
  const { t } = useTranslation(["common"]);
  const { childDropdownLists } = useContext(CommonDataContext);

  const { deactivationDeletionReason } = childDropdownLists || {};
  const [isLoading, setIsLoading] = useState(false);
  const associationOptions = [
    {
      id: false,
      label: "Do not associate the child with this family",
    },
    {
      id: true,
      label: "Leave child associated with this family",
    },
  ];
  const caseCloseHandler = async () => {
    setIsLoading(true);
    try {
      const payload = {
        childId: childId,
        caseCloseReason: values.deactivationReason,
        caseCloseDate: values.dateCaseClosed,
        keepFamilyAssociation: values.association, // Assuming true is the option to keep association
      };
      if(payload.caseCloseReason == "Other" ){
        payload.caseCloseReason = values.otherReason;
      }
      const res = await APIS.CloseChildCase(payload);
      if (res?.status === 200) {
        close();
        onCaseClose();
        handleChildModalOpen()
        setHideChildModal(false);
        ModalService.open(() => null, {
          width: "30%",
          modalDescription: (
            <SubHeading
              value={t(
                "common:common.Child’s case has been closed",
                "Child’s case has been closed",
              )}
            />
          ),
          hideActionButton: true,
          cancelButtonText: t("common:common.ok", "Ok"),
        });
      }
    } catch (error) {
      console.error("Error closing case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useFormik({
    onSubmit: caseCloseHandler,
    initialValues: {
      dateCaseClosed: new Date(),
      association: "",
      deactivationReason: "",
      otherReason: null,
    },
    validationSchema: Yup.object().shape({
      dateCaseClosed: Yup.string()
        .required(
          t(
            "common:common.Date case closed is required",
            "Date case closed is required",
          ),
        )
        .nullable(),
      association: Yup.string().required(
        t(
          "common:common.Please select an association option",
          "Please select an association option",
        ),
      ),
      deactivationReason: Yup.string().required(
        t(
          "common:common.Please select a deactivation reason",
          "Please select a deactivation reason",
        ),
      ),
      otherReason: Yup.string().when("deactivationReason", {
        is: (val) => {
          return val === "37" || val === 37;
        },
        then: (schema) =>
          schema.required(
            t(
              "common:common.Please specify other reason",
              "Please specify other reason",
            ),
          ),
        otherwise: (schema) => schema.notRequired(),
      }).nullable(),
    }),
  });
  const cancelHandler = () => {
    close();
    setHideChildModal(false);
  };
  return (
    <>
    <Loader loading={isLoading} />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" justifyContent="flex-start" spacing={1}>
          <Heading
            heading={t(
              "common:common.Close this child’s case?",
              "Close this child’s case?",
            )}
          />
        </Stack>
        <CloseIcon
          style={{ color: "#000", cursor: "pointer" }}
          onClick={cancelHandler}
        />
      </Stack>
      <Box mx={-2}>
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <DynamicForm
              values={values}
              errors={errors}
              touched={touched}
              t={t}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              config={CaseCloseDetails({
                associationOptions,
                deactivationDeletionReason,
                t,
                values,
              })}
            />
          </Grid>
        </Box>
      </Box>

      <Grid item container spacing={2}>
        <Grid item xs={12} md={6}>
          <SecondaryButton
            label={t("common:common.No, Cancel", "No, Cancel")}
            fullWidth
            onClick={cancelHandler}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PrimaryButton
            label={t("common:common.Yes, close case", "Yes, close case")}
            fullWidth
            onClick={handleSubmit}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CloseCaseForm;
