import { Stack } from "@mui/material";
import React from "react";
import PrimaryButton from "../../../../../components/PrimaryButton/PrimaryButton";
import { useTranslation } from "react-i18next";
import SecondaryButton from "../../../../../components/SecondaryButton/SecondaryButton";
import { ModalService } from "../../../../../components/Modal";
import CloseCaseForm from "./CloseCaseForm";

const ChildFormFooter = ({
  childId,
  onCaseClose,
  onSubmit,
  deleteChildClickHandler,
}) => {
  const { t } = useTranslation(["common"]);

  const closeCaseHandler = () => {
    ModalService.open(
      ({ close }) => (
        <CloseCaseForm
          close={close}
          onCaseClose={onCaseClose}
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
    <Stack direction="row" justifyContent="space-between" spacing={2} mt={3}>
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
          onClick={onCaseClose}
        />
        <PrimaryButton
          label={t("common:common.Save", "Save")}
          onClick={onSubmit}
        />
      </Stack>
    </Stack>
  );
};

export default ChildFormFooter;
