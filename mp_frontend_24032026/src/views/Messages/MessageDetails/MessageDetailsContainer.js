import {
  Box,
  Card,
  CardContent,
  Grid,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import { useTranslation } from "react-i18next";
import MessageDetails from "./MessageDetails";
import Recipients from "./Recipients";
import PreviewMessage from "./PreviewMessage";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";
import { ModalService } from "../../../components/Modal";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import BodyText from "../../../components/BodyText/BodyText";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { styled } from "@mui/styles";

const steps = ["Message details", "Recipient(s)", "Preview"];

const MessageDetailsContainer = () => {
  const { t } = useTranslation(["common"]);
  const [completeMessageDetails, setCompleteMessageDetails] = useState({});
  const [activeStepperIndex, setActiveStepperIndex] = useState(0);
  const [messageDetailsForEditing, setMessageDetailsForEditing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    getSystemMessages,
    signedinOrgType,
    signedinUserRoleHT,
    signedinUserRoleFS,
  } = useContext(CommonDataContext);

  useAuthorization(
    signedinUserRoleHT,
    signedinUserRoleFS,
    signedinOrgType,
    "SYSTEM_MESSAGES",
    true
  );

  useEffect(() => {
    document.title = "System messages | ThriveWell";
  }, []);

  const onTabNavigation = (values) => {
    setCompleteMessageDetails((prevDetails) => {
      // Extract the inner properties from the "0" key
      const { 0: innerDetails, ...rest } = prevDetails;

      // Combine the inner properties with the updated values
      const newDetails = {
        ...innerDetails,
        ...rest,
        ...values,
      };
      newDetails.startsAt = new Date(newDetails.startsAt).toISOString();
      newDetails.endsAt = new Date(newDetails.endsAt).toISOString();

      return newDetails;
    });
  };

  const [draftId, setDraftId] = useState(null);

  const createSystemMessages = async (mode, draftedContent = null) => {
    const formContent = draftedContent ?? completeMessageDetails;
    const {
      messageSubject,
      messageType,
      messageContent,
      addActionEnabled,
      buttonLabel,
      buttonUrl,
      messageFrequency,
      startsAt,
      endsAt,
      receipientType,
      receipientMatchingConditions,
      messageFreqAdditionalInfo,
    } = formContent ?? {};

    const payload = {
      subject: messageSubject,
      content: messageContent,
      availableActions:
        (addActionEnabled && [
          {
            link: buttonUrl,
            type: "BUTTON",
            label: buttonLabel,
            order: 1,
            isDeleted: false,
          },
        ]) ||
        null,
      messageFreqAdditionalInfo: messageFreqAdditionalInfo?.length
        ? messageType === "3" && messageFrequency === "ON_CERTAIN_DAYS"
          ? messageFreqAdditionalInfo
          : null
        : null,
      messageFrequency: messageFrequency,
      receipientType: receipientType,
      startDateTime: startsAt ? new Date(startsAt).toISOString() : "",
      endDateTime: endsAt ? new Date(endsAt).toISOString() : "",
      messageTypeId: messageType,
      messageStatus: mode,
      receipientMatchingConditions: receipientMatchingConditions ?? null,
    };

    setIsLoading(true);
    try {
      let res;
      if (id || draftId) {
        payload.id = id || draftId;
        res = await APIS.UpdateSystemMessages(payload);
      } else {
        res = await APIS.CreateSystemMessages(payload);
      }

      if (res?.data?.data?.id) {
        setDraftId(res?.data?.data?.id);
      }

      if (res?.status === 200) {
        id || draftId
          ? toast.success("Message updated successfully")
          : toast.success("Message created successfully");
        getSystemMessages();
        if (mode !== "DRAFT") navigate("/admin/messages");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
    setIsLoading(false);
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: t("common:common.Unsaved Changes"),
      width: "30%",
      modalDescription: t(
        "common:common.If you leave this page, any changes you have made will be lost"
      ),
      actionButtonText: t("common:common.Leave page"),
      onClick: () => navigate("/admin/messages"),
      cancelButtonText:t("common:common.Cancel"),
    });
  };

  const SystemMessagesDetails = useCallback(async () => {
    setIsLoading(true);
    let payload = { id: id };
    try {
      const res = await APIS.SystemMessagesDetails(payload);
      if (res?.status === 200) {
        // navigate('/admin/messages')
        setMessageDetailsForEditing(res?.data?.data);
      }
    } catch (error) {
      console.log("api call failed");
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) {
      SystemMessagesDetails();
    }
  }, [id]);

  const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 30,
      left: "calc(-50% + 64px)",
      right: "calc(50% + 64px)",
    },
    // [`&.${stepConnectorClasses.active}`]: {
    //   [`& .${stepConnectorClasses.line}`]: {
    //     borderColor: "#784af4",
    //   },
    // },
    // [`&.${stepConnectorClasses.completed}`]: {
    //   [`& .${stepConnectorClasses.line}`]: {
    //     borderColor: "#784af4",
    //   },
    // },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#eaeaf0",
      borderTopWidth: 3,
      borderRadius: 1,
    },
  }));

  const StepperComponent = (step) => (
    <Box
      sx={{
        backgroundColor: step === activeStepperIndex ? "#F37123" : "#9CADB8",
        width: 40, // Set the width to 40px
        height: 40, // Set the height to 40px
        borderRadius: "50%", // Make it a circle
        display: "flex", // Center content horizontally and vertically
        alignItems: "center", // Center content vertically
        justifyContent: "center", // Center content horizontally
        color: "white", // Text color (optional, for visibility)
        position: "relative", // Ensures proper positioning of the step icon
      }}
    >
      {step + 1}
    </Box>
  );

  return (
    <Grid xs={12} item>
      <Loader loading={isLoading} />
      <Box px={2}>
        <Grid item sx={{ display: "flex", flexDirection: "row" }} my={3}>
          <Typography
            color="textPrimary"
            variant="h5"
            sx={{ cursor: "pointer" }}
          >
            {t("common:common.Admin")}
          </Typography>
          <Box
            sx={{
              m: 0.75,
            }}
            style={{ cursor: "text" }}
          >
            <ChevronRightIcon color="disabled" fontSize="small" />
          </Box>
          <Typography
            id="family-table-label"
            color="textPrimary"
            variant="h5"
            onClick={() => navigate("/admin/messages")}
            sx={{ cursor: "pointer" }}
          >
            {t("common:common.System messages")}
          </Typography>
          <Box
            sx={{
              m: 0.75,
            }}
            style={{ cursor: "text" }}
          >
            <ChevronRightIcon color="disabled" fontSize="small" />
          </Box>
          <Typography id="family-table-label" color="textPrimary" variant="h5">
            {id
              ? t("common:common.Edit message")
              : t("common:common.Create a new message")}
          </Typography>
        </Grid>
        <Card sx={{ width: { xs: "100%", lg: "50vw" } }}>
          <CardContent sx={{ p: 3 }}>
            <Box mb={6}>
              <Stepper
                activeStep={activeStepperIndex}
                alternativeLabel
                connector={<QontoConnector />}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={() => StepperComponent(index)}
                    >
                      <BodyText
                        value={label}
                        fontWeight={600}
                        color={
                          index <= activeStepperIndex ? "#181A1B" : "#778791"
                        }
                      />
                      {/* <Typography
                      color="#181A1B"
                      fontWeight={600}
                      fontSize="1rem"
                      lineHeight="125%"
                      >
                      {label}
                    </Typography> */}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Message details */}
            {activeStepperIndex === 0 && (
              <MessageDetails
                initialValuesForEditing={messageDetailsForEditing}
                setActiveStepperIndex={setActiveStepperIndex}
                onSubmit={createSystemMessages}
                onNextPage={onTabNavigation}
                cancelClickHandler={cancelClickHandler}
                setMessageDetailsForEditing={setMessageDetailsForEditing}
              />
            )}

            {/* Recipients details */}
            {activeStepperIndex === 1 && (
              <Recipients
                initialValuesForEditing={messageDetailsForEditing}
                setMessageDetailsForEditing={setMessageDetailsForEditing}
                setActiveStepperIndex={setActiveStepperIndex}
                onSubmit={createSystemMessages}
                onNextPage={onTabNavigation}
                cancelClickHandler={cancelClickHandler}
              />
            )}

            {activeStepperIndex === 2 && (
              <PreviewMessage
                messageData={completeMessageDetails}
                setMessageDetailsForEditing={setMessageDetailsForEditing}
                onSubmit={createSystemMessages}
                setActiveStepperIndex={setActiveStepperIndex}
                cancelClickHandler={cancelClickHandler}
                draftId={draftId}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </Grid>
  );
};

export default MessageDetailsContainer;
