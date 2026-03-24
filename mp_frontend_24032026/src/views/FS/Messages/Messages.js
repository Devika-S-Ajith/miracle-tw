import React, { useContext, useEffect, useRef } from "react";
import { Box, Card, Grid, Typography } from "@mui/material";
import SentMessagesList from "./SentMessagesList";
import ScheduledMessagesList from "./ScheduledMessagesList";
import { useNavigate } from "react-router";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const Messages = () => {
  useEffect(() => {
    document.title = "Messages | ThriveWell";
  }, []);

  const navigate = useNavigate();
  const scheduledMessagesGridRef = useRef(null);
  const sentMessagesGridRef = useRef(null);
  const { signedinUserRoleFS } = useContext(CommonDataContext)

  useAuthorization(
    null,
    signedinUserRoleFS,
    null,
    "Message",
    false
  );

  return (
    <Box m={2}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={3}>
        <Typography
          color="textPrimary"
          variant="h5"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/dashboard")}
        >
          FosterShare
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
          Messages
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
