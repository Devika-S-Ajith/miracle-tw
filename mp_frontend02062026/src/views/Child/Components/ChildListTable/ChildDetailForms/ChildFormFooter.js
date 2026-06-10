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
  handleChildModalOpen,
  setHideChildModal,
  onCaseChange,
  onSubmit,
  deleteChildClickHandler,
  reOpenCaseHandler,
  hideChildModal
}) => {
  const { t } = useTranslation(["common"]);

  const closeCaseHandler = () => {
    setHideChildModal(true);
    ModalService.open(
      ({ close }) => (
        <CloseCaseForm
          close={close}
          handleChildModalOpen={handleChildModalOpen}
          setHideChildModal={setHideChildModal}
          onCaseClose={onCaseChange}
          childId={childId}
        />
      ),
      {
       
        width: "30%",
        hideModalFooter: true,
        enableClose: false,
        height: "95%",
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
            onClick={handleChildModalOpen}
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
              label={t("common:common.Close case", "Close case")}
              sx={{ visibility: childId && !hideChildModal ? "visible" : "hidden" }}
              onClick={closeCaseHandler}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <SecondaryButton
              label={t("common:common.Cancel", "Cancel")}
              onClick={handleChildModalOpen}
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
