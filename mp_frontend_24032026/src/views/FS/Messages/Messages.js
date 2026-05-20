import React, { useContext, useEffect, useRef } from "react";
import { Box, Card, Grid, Typography } from "@mui/material";
import SentMessagesList from "./SentMessagesList";
import ScheduledMessagesList from "./ScheduledMessagesList";
import { useNavigate } from "react-router";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { useTranslation } from "react-i18next";
import PageLoader from "../../../components/UserComponents/PageLoader";

const Messages = () => {
  useEffect(() => {
    document.title = "Messages | ThriveWell";
  }, []);

  const { t } = useTranslation(["common"]);
  const scheduledMessagesGridRef = useRef(null);
  const sentMessagesGridRef = useRef(null);
   const { authStatus, checkAuth } = useAuthorization("Messages");
  
  useEffect(() => {
      document.title = "Message | Thrivewell";;
      checkAuth();
    }, []);
  
  if (authStatus === 'loading' || authStatus === 'idle') {
      return <PageLoader />;
    }
  
    if (authStatus === 'unauthorized') {
      return null; // Or a custom message
    }
  

  return (
    <Box m={2}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={3}>
        <Typography id="family-table-label" color="textPrimary" variant="h5">
          {t("common:common.Messages", "Messages")}
        </Typography>
      </Grid>
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card sx={{ borderRadius: 2 / 8, height: "100%" }}>
              <SentMessagesList sentMessagesGridRef={sentMessagesGridRef} />
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card sx={{ borderRadius: 2 / 8, height: "100%" }}>
              <ScheduledMessagesList
                scheduledMessagesGridRef={scheduledMessagesGridRef}
                sentMessagesGridRef={sentMessagesGridRef}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Messages;
