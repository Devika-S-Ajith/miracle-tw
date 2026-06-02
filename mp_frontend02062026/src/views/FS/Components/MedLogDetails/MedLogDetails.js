import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import LabelValue from "../../../../components/LabelValue";
import { monthYear } from "../../../../helpers/helperFunction";
import { useCallback, useRef, useState } from "react";
import APIS from "../../../../common/hooks/UseApiCalls";
import { makeStyles } from "@mui/styles";
import { convertUnderscoreToText } from "../../../../constants";
import { useNavigate } from "react-router";

const useStyles = makeStyles({
  blinkingText: {
    animation: "$blink-animation 1s infinite",
  },
  "@keyframes blink-animation": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
});

const MedLogDetails = ({ medLogDetail }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadFileUrl, setDownloadFileUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState(null);
  const downloadFileRef = useRef(null);

  const getMedlogDocument = useCallback(async (id) => {
    setDownloading(true);
    try {
      let payload = {
        logId: id,
      };
      const data = await APIS.getSignedMedLogDoc(payload);
      if (data?.data?.data?.medLogDocumentUrl) {
        setDownloadFileUrl(data?.data?.data?.medLogDocumentUrl);
        setDownloadFileName(`Medication_Log.pdf`);
        //_${medLogDetail?.childName}${monthYear(medLogDetail?.date)}
        downloadFileRef.current?.click();
        setDownloading(false);
      }
      //
    } catch (err) {
      setDownloading(false);
    }
  }, []);

  console.log("medLogDetail", medLogDetail);
  return (
    <Card>
      <CardContent>
        <Typography
          color="textPrimary"
          // variant="subtitle2"
          fontWeight={700}
          fontSize="1.25rem"
          sx={{ pointerEvents: "none" }}
          mb
        >
          Med log details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <LabelValue
              label="Child"
              value={medLogDetail?.childName}
              onClick={() =>
                navigate(`/fostershare/children/${medLogDetail?.FSChildId}`)
              }
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue
              label="Gender"
              value={convertUnderscoreToText(medLogDetail?.childDetail?.gender)}
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue
              label="Family"
              value={
                medLogDetail?.familyDetail?.firstName +
                " " +
                medLogDetail?.familyDetail?.lastName
              }
              onClick={() =>
                navigate(
                  `/fostershare/families/${medLogDetail?.familyDetail?.id}`
                )
              }
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue label="Month" value={monthYear(medLogDetail?.date)} />
          </Grid>
          <Grid item xs={6}>
            <LabelValue
              label="Allergies"
              value={
                medLogDetail?.childDetail?.allergy == "no"
                  ? "No known allergies"
                  : medLogDetail?.childDetail?.allergy
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Typography
              variant="body1"
              style={{ textAlign: "right" }}
            ></Typography>
            <LabelValue
              label="Med log status"
              value={
                medLogDetail?.formStatus == "SUBMITTED"
                  ? "Signed & Submitted"
                  : "Not Signed"
              }
            />
          </Grid>
          {medLogDetail?.formStatus == "SUBMITTED" && (
            <Grid item xs={6}>
              <Button
                sx={{ borderRadius: "4px" }}
                variant="contained"
                onClick={() => {
                  getMedlogDocument(medLogDetail?.id);
                }}
                disabled={downloading}
                loadingIndicator={
                  <CircularProgress color="inherit" size={20} />
                }
              >
                <span className={downloading ? classes.blinkingText : ""}>
                  {downloading ? "Downloading..." : "Get Document"}
                </span>
                <a
                  href={downloadFileUrl}
                  download={downloadFileName}
                  className="hidden"
                  ref={downloadFileRef}
                />
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MedLogDetails;
