import React, { useEffect, useState } from "react";
import { Backdrop, Box, Button, Grid, Modal, Typography } from "@mui/material";
import { createPortal } from "react-dom";
import CustomEventService from "./customEventService";
import CloseIcon from "@mui/icons-material/Close";

export const ModalService = {
  open: (component, modalProps = {}) => {
    CustomEventService.dispatch("modal-open", {
      component,
      config: { ...modalProps },
    });
  },
  close: (id) => {
    CustomEventService.dispatch("modal-close", id);
  },
};

export default function ModalRoot() {

  const [modalList, setModalList] = useState([]);

  const closeModal = (id) => {
    setModalList((prev) => {
      if (id) prev = prev.filter((i) => i.id !== id);
      else prev.pop();
      return [...prev];
    });
  };

  useEffect(() => {
    const openModal = (e) => {
      setModalList((prev) => [...prev, e.detail]);
    };
    CustomEventService.on("modal-open", openModal);
    CustomEventService.on("modal-close", (e) =>
      closeModal(e?.detail?.data?.id)
    );
    const handleUrlChange = () => {
      closeModal();
    };
    window.addEventListener("popstate", handleUrlChange);
    return () => {
      CustomEventService.off("modal-open", openModal);
      CustomEventService.off("modal-close", (e) =>
        closeModal(e?.detail?.data?.id)
      );
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);
  return (
    <>
      {Array.isArray(modalList) &&
        modalList.length > 0 &&
        modalList.map((modalData) => {
          const {
            modalHeader,
            modalTitle,
            modalExtraTitle,
            modalDescription,
            hideModalFooter,
            actionButtonText = "Submit",
            //cancelButtonText = t("common:common.Cancel"),
            cancelButtonText = "Cancel",
            hideActionButton = false,
            onClick,
            enableClose,
            width,
            minWidth,
            height,
            onHide = () => closeModal(modalData?.id),
            ...restProps
          } = modalData.data.config;
          const style = {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: width || "30%",
            minWidth: minWidth || 300,
            bgcolor: "background.paper",
            borderRadius: 1,
            border: "none",
            outline: "none",
            boxShadow: 24,
            overflow: "auto",
            maxHeight: height || "65vh",
            p: 3,
            ...restProps,
          };
          return createPortal(
            <>
              <Backdrop
                sx={{
                  zIndex: (theme) => theme.zIndex.modal - 1,
                  backdropFilter: "blur(4px)",
                }}
                open={true}
              />
              <Modal
                key={modalData?.id}
                open={true}
                onClose={onHide}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                // hideBackdrop
                disableEscapeKeyDown
                slots={{ backdrop: Backdrop }}
                sx={{
                  "& > .MuiBackdrop-root": {
                    backdropFilter: "blur(4px)",
                  },
                }}
                hideBackdrop
                {...restProps}
              >
                <Box sx={style}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 1 }}>
                    {/* Left Side: Title Group */}
                    <Box display="flex" sx={{ overflow: 'hidden' }}>
                      {modalTitle && (
                        <Typography
                          id="modal-modal-title"
                          fontSize="1.25rem"
                          fontWeight={700}
                          lineHeight="125%"
                        >
                          {modalTitle}
                        </Typography>
                      )}
                      {modalExtraTitle && (
                        <Typography
                          id="modal-modal-extra-title"
                          fontSize="1.25rem"
                          fontWeight={700}
                          lineHeight="125%"
                          sx={{
                            pl: 1,
                            color: '#F37123',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {modalExtraTitle}
                        </Typography>
                      )}
                    </Box>

                    {/* Right Side: Close Button */}
                    {enableClose && (
                      <CloseIcon
                        onClick={onHide}
                        sx={{ cursor: "pointer", ml: 2 }} // Added margin left for breathing room
                        fontSize="medium"
                      />
                    )}
                  </Box>
                  {modalDescription && (
                    <Typography id="modal-modal-description" my={2}>
                      {modalDescription}
                    </Typography>
                  )}
                  {typeof modalData?.data?.component === "function"
                    ? modalData?.data?.component?.(
                      // onSubmitHandler: () => closeModal(modalData?.id),
                      {
                        close: () => closeModal(modalData?.id),
                      }
                    )
                    : modalData?.data?.component}
                  {!hideModalFooter && (
                    <Grid container spacing={2}>
                      <Grid item xs={hideActionButton ? 12 : 6}>
                        <Button
                          sx={{ mr: 1, borderRadius: "4px", width: "100%" }}
                          variant={hideActionButton ? "contained" : "outlined"}
                          onClick={onHide}
                        >
                          {cancelButtonText}
                        </Button>
                      </Grid>
                      {!hideActionButton && (
                        <Grid item xs={6}>
                          <Button
                            sx={{ mr: 1, borderRadius: "4px", width: "100%" }}
                            variant="contained"
                            onClick={() => {
                              onHide();
                              onClick();
                            }}
                          >
                            {actionButtonText}
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Box>
              </Modal>
            </>,
            document.body
          );
        })}
    </>
  );
}
