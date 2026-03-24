import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CircularProgress,
  Typography,
  CardContent,
  Box,
  Grid,
} from "@mui/material";
import ProgressBar from "./ProgressBar";
import MultiProgressBar from "./MultiProgressBar";
import SmallText from "../../../components/SmallText/SmallText";
import BodyText from "../../../components/BodyText/BodyText";

const CountWidgets = (props) => {
  const {
    title,
    data,
    isloading,
    label,
    icon,
    needToShowBar,
    logSplitData,
    needToShowMultiBar,
    logsCompleted,
    ...other
  } = props;
  const navigate = useNavigate();

  return (
    <Card {...other}>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
            {title}
          </Typography> */}
          <BodyText value={title} sx={{ mb: 1, fontWeight: 600 }} />
          {!isloading ? (
            <Typography
              color="#181A1B"
              fontSize="1.25rem"
              fontWeight={700}
              lineHeight="125%"
              sx={{ mt: 1 }}
              //   variant="h5"
              display="inline"
            >
              {data} {label}
            </Typography>
          ) : (
            <CircularProgress color="primary" sx={{ mt: 1 }} />
          )}
        </div>
        <img
          alt={label}
          src={icon}
          height="50px"
          width="50px"
          style={{ marginLeft: "auto" }}
        />
      </CardContent>
      {needToShowBar && (
        <Grid container spacing={1} sx={{ m: 1, mb: 5 }}>
          <Grid item md={6}>
            <ProgressBar
              label="Behavior Logs Completed"
              percentage={logsCompleted}
            />
          </Grid>
          <Grid item md={6}>
            <ProgressBar label="Event Attendance" percentage={0} />
          </Grid>
        </Grid>
      )}
      {needToShowMultiBar && (
        <Grid container spacing={1} sx={{ m: 1, mb: 2.5 }}>
          <Grid item md={12}>
            <MultiProgressBar value={logSplitData} />
          </Grid>
        </Grid>
      )}
    </Card>
  );
};
export default CountWidgets;
