import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import EventDetails from "./EventDetails";
import EventParticipantsList from "./EventParticipantsList/EventParticipantsList";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";

const EventDetailsContainer = () => {
  useEffect(() => {
    document.title = "Events | ThriveWell";
  }, []);

  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState();

  const [eventData, setEventData] = useState();

  useEffect(() => {
    if (id) getEventDetails();
    return () => {};
  }, [id]);

  const getEventDetails = async () => {
    setIsLoading(true);
    try {
      const res = await APIS.getEvent(id);
      if (res?.status === 200) {
        setEventData(res.data.data);
      }
    } catch (error) {}
    setIsLoading(false);
  };

  return (
    <>
      <Loader loading={isLoading} />

      <Box m={2}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
          mb={2}
        >
          <Typography
            color="textPrimary"
            variant="h5"
            fontWeight={700}
            fontSize="1.5rem"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            FosterShare
          </Typography>
          <ChevronRightIcon color="disabled" fontSize="small" />
          <Typography
            color="textPrimary"
            variant="h5"
            fontWeight={700}
            // fontSize="1.25rem"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/fostershare/events")}
          >
            Events
          </Typography>
          <ChevronRightIcon color="disabled" fontSize="small" />
          <Typography
            color="textPrimary"
            variant="h5"
            fontWeight={700}
            // fontSize="1.25rem"
            sx={{ pointerEvents: "none" }}
          >
            Event details
          </Typography>
        </Box>
        {/* <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} mb={2}>
        <Typography
          color="textPrimary"
          // variant="subtitle2"
          fontWeight={700}
          fontSize="1.5rem"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard/fostershare/families")}
        >
          {t("common:common.Events")}
        </Typography>
        <ArrowForwardIosIcon disabled />
        <Typography
          color="textPrimary"
          // variant="subtitle2"
          fontWeight={700}
          fontSize="1.5rem"
          sx={{ pointerEvents: "none" }}
        >
          {t("common:common.Event Details")}
        </Typography>
      </Box> */}
        <Grid container spacing={2}>
          <Grid xs={12} md={12} lg={4} item>
            <EventDetails
              eventData={eventData}
              getEventDetails={getEventDetails}
            />
          </Grid>
          <Grid xs={12} md={12} lg={8} item>
            <Card sx={{ borderRadius: 2 / 8 }}>
              <CardContent>
                <EventParticipantsList eventData={eventData} eventId={id} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EventDetailsContainer;
