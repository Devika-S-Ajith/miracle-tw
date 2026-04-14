import { Grid } from "@mui/material";
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
import RadioGroupList from "../../../../TWFamily/ManageFamily/Components/RadioGroupList";
import BodyText from "../../../../../components/BodyText/BodyText";
import { CommonDataContext } from "../../../../../common/contexts/CommonDataContext";
import APIS from "../../../../../common/hooks/UseApiCalls";

const CloseCaseForm = ({ close, setHideChildModal, handleChildModalOpen, onCaseClose, childId }) => {
  const { t } = useTranslation(["common"]);
  const { childDropdownLists } = useContext(CommonDataContext);

  const { deactivationDeletionReason } = childDropdownLists || {};

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

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    useFormik({
      initialValues: {},
    });
  const caseCloseHandler = async () => {
    try {
      const payload = {
        childId: childId,
        caseCloseReason: values.deactivationReason,
        // previousFamilyCutoffDaysCount: days,
        caseCloseDate: values.dateCaseClosed,
        keepFamilyAssociation: values.association, // Assuming true is the option to keep association
      };
      const res = await APIS.CloseChildCase(payload);
      if (res?.status === 200) {
        close();
        onCaseClose();
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
    }
  };

  const cancelHandler = () => {
    close();
    // handleChildModalOpen();
    setHideChildModal(false);
  }
  return (
    <>
      <Box mx={-2}>
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 2 }}>
          <Grid container spacing={2}>
            <DynamicForm
              values={values}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              config={CaseCloseDetails}
            />
            <Box sx={{ p: 2, borderRadius: 1, mb: 1 }}>
              <BodyText
                value={t(
                  "common:family.Child/family association",
                  "Child/family association",
                )}
              />
              <RadioGroupList
                name="association"
                options={associationOptions}
                value={values.association}
                onChange={(e) => setFieldValue("association", e.target.value)}
                renderPrimary={(option) => <BodyText value={option.label} />}
              />
            </Box>
            {/* <Box sx={{ p: 2, borderRadius: 1, mb: 1 }}>
              <FamilyAccessDays value={days} onChange={setDays} />
            </Box> */}
            <Box sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <BodyText
                value={t(
                  "common:family. Why is this person being deactivated?",
                  "Why is this person being deactivated?",
                )}
              />
              <RadioGroupList
                name="deactivationReason"
                options={deactivationDeletionReason}
                value={values.deactivationReason}
                onChange={(e) =>
                  setFieldValue("deactivationReason", e.target.value)
                }
                renderPrimary={(option) => <BodyText value={option.value} />}
              />
            </Box>
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
            onClick={caseCloseHandler}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CloseCaseForm;
