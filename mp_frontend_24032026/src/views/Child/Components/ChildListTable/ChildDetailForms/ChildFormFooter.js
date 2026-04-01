import { Stack } from "@mui/material";
import React from "react";
import PrimaryButton from "../../../../../components/PrimaryButton/PrimaryButton";
import { useTranslation } from "react-i18next";
import SecondaryButton from "../../../../../components/SecondaryButton/SecondaryButton";
import { ModalService } from "../../../../../components/Modal";
import CloseCaseForm from "./CloseCaseForm";

const ChildFormFooter = ({
  childId,
  childDetails,
  close: closeEditForm,
  onCaseChange,
  onSubmit,
  deleteChildClickHandler,
  reOpenCaseHandler,
}) => {
  const { t } = useTranslation(["common"]);

  const closeCaseHandler = () => {
    ModalService.open(
      ({ close }) => (
        <CloseCaseForm
          close={close}
          closeEditForm={closeEditForm}
          onCaseClose={onCaseChange}
          childId={childId}
        />
      ),
      {
        modalTitle: t(
          "common:common.Close this child’s case?",
          "Close this child’s case?",
        ),
        width: "30%",
        hideModalFooter: true,
        enableClose: true,
        maxHeight: "90%",
      },
    );
  };

  return (
    <>
      {childDetails?.status === "Case Closed" ? (
        <Stack direction="row" justifyContent="end" spacing={2} mt={3}>
          <SecondaryButton
            label={t("common:common.Re-open case", "Re-open case")}
            onClick={reOpenCaseHandler}
          />
          <PrimaryButton
            label={t("common:common.Close", "Close")}
            onClick={closeEditForm}
          />
        </Stack>
      ) : (
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          mt={3}
        >
          <Stack direction="row" spacing={2}>
            <SecondaryButton
              label={t("common:common.Delete", "Delete")}
              sx={{ visibility: childId ? "visible" : "hidden" }}
              onClick={deleteChildClickHandler}
            />
            <SecondaryButton
              label={t("common:common.Close case", "Close case")}
              sx={{ visibility: childId ? "visible" : "hidden" }}
              onClick={closeCaseHandler}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <SecondaryButton
              label={t("common:common.Cancel", "Cancel")}
              onClick={closeEditForm}
            />
            <PrimaryButton
              label={t("common:common.Save", "Save")}
              onClick={onSubmit}
            />
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default ChildFormFooter;
