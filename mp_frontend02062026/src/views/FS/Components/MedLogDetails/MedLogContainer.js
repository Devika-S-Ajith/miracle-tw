import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import MedLogDetails from "./MedLogDetails";
import MedicationList from "./MedicationList";
import MedLogOverviewList from "./MedLogOverviewList";
import APIS from "../../../../common/hooks/UseApiCalls";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import { utcToLocalDateReverse } from "../../../../helpers/helperFunction";
import MedicationChangesLog from "./MedicationChangesLog";

const MedLogContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [medLogDetail, setMedLogDetail] = useState([]);
  const [medicationList, setMedicationList] = useState([]);
  const [childId, setChildId] = useState(null);
  const [loadingMedicationList, setLoadingMedicationList] = useState(false);
  const { state } = useLocation();

  useEffect(() => {
    getMedLogDetail();
  }, [id]);

  const getMedLogDetail = useCallback(async () => {
    try {
      let payload = {
        logId: id,
      };
      const data = await APIS.DetailRecLog(payload);
      if (data && data.data && data.data.data && data.data.data?.logs) {
        const logs = data?.data?.data?.logs;
        const { TWChildId, TWFormEngineId, entity, id, date } = logs;
        setMedLogDetail(logs);
        setChildId(TWChildId);
        getMedicationList(TWChildId, TWFormEngineId, entity, id, date);
      }
      //setpageCount(data && data.data && data.data.pageCount);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getMedicationList = useCallback(
    async (TWChildId, TWFormEngineId, entity, id, date) => {
      setLoadingMedicationList(true);
      try {
        const payload = {
          formEngineId: TWFormEngineId,
          entity: "MEDICINE",
          stepOrder: "0",
          currentUserId: localStorage.getItem("username"),
          date: utcToLocalDateReverse(date),
          dependingEntity: entity,
          filter: {
            dependingEntityId: TWChildId,
            hasUnsignedMedicinesOnly: false,
            formResponseId: id, //for pastdues only
          },
        };
        const data = await APIS.GetMedicationList(payload);
        if (data && data.data && data.data.data && data.data.data) {
          setMedicationList(data.data.data);
        }
        setLoadingMedicationList(false);
      } catch (err) {
        setLoadingMedicationList(false);
      }
    }
  );

  return (
    <Box p={1}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={1}>
        <Typography
          color="textPrimary"
          variant="h5"
          onClick={() => navigate("/fostershare/dashboard")}
          sx={{ cursor: "pointer" }}
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
        <Typography
          id="support services-table-label"
          color="textPrimary"
          variant="h5"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/fostershare/${state?.module}/${state?.id}`)}
        >
          Med logs
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
          id="support services-table-label"
          color="textPrimary"
          variant="h5"
        >
          Med log details
        </Typography>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <MedLogDetails medLogDetail={medLogDetail} />
            <MedicationList
              list={medicationList}
              loading={loadingMedicationList}
            />
            {childId && <MedicationChangesLog childId={childId} />}
          </Box>
        </Grid>
        <Grid item xs={7}>
          <Card sx={{ borderRadius: 2 / 8 }}>
            <CardContent>
              <MedLogOverviewList
                medLogDetail={medLogDetail}
                medLogList={
                  medLogDetail?.formPostCompleteAnswer?.medlogEntry || []
                }
                decodedTemplate={medLogDetail?.decodedTemplate || []}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MedLogContainer;
