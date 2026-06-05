import React from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { ModalService } from "../../../components/Modal";
import EventDetailForm from "../EventsForm/ManageEventsForm";
import LabelValue from "../../../components/LabelValue";
import { convertUnderscoreToText, dateFormatter, timeFormatter } from "../../../constants";

const EventDetails = ({ eventData, getEventDetails }) => {
  const eventDatePassed =
    new Date(eventData?.startsAtTimestamp).getTime() < new Date().getTime();

  return (
    <Card sx={{ borderRadius: 2 / 8, width: 1 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            color="textPrimary"
            fontWeight={700}
            fontSize="1.25rem"
          >
            Event details
          </Typography>
          {eventDatePassed ||
            (true && (
              <EditIcon
                sx={{ cursor: "pointer" }}
                titleAccess="Edit"
                onClick={() => {
                  ModalService.open(
                    ({ close }) => (
                      <EventDetailForm
                        close={close}
                        eventData={eventData}
                        onSuccess={getEventDetails}
                      />
                    ),
                    {
                      modalTitle: "Event details",
                      width: "40%",
                      height: "95%",
                      hideModalFooter: true,
                    }
                  );
                }}
              />
            ))}
        </Box>

        {/* Family Details */}
        <Grid container rowSpacing={1.5} my>
          <Grid item xs={12}>
            <LabelValue label="Title" value={eventData?.title} />
          </Grid>
          <Grid item xs={12}>
            <Typography
              color="textPrimary"
              fontWeight={700}
              fontSize="0.75rem"
            >
              Description
            </Typography>
            <Typography
              color="textPrimary"
              fontWeight={700}
              fontSize="1rem"
            >
              {eventData?.description}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <LabelValue
              label="Event type"
              value={convertUnderscoreToText(eventData?.eventType)}
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue label="Venue vame" value={eventData?.venue} />
          </Grid>
          <Grid item xs={6}>
            <LabelValue label="Location" value={eventData?.address} />
          </Grid>
          <Grid item xs={6}>
            <LabelValue label="Date" value={dateFormatter(eventData?.date)} />
          </Grid>
          <Grid item xs={12}>
            <LabelValue
              label="Time"
              value={
                eventData?.startsAtTimestamp
                  ? `${timeFormatter(
                      eventData?.startsAtTimestamp
                    )} - ${timeFormatter(eventData?.endsAtTimestamp)}`
                  : "-"
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EventDetails;
