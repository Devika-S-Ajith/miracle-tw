import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LabelValue from "../../../../components/LabelValue";
import { useParams } from "react-router";
import APIS from "../../../../common/hooks/UseApiCalls";
import Loader from "../../../../components/UserComponents/Loader";
import { ModalService } from "../../../../components/Modal";
import SupportServiceDetailForm from "../../Components/SupportServiceDetailForm";

const SupportServiceDetails = () => {
  const { id } = useParams();
  const [supportServiceDetail, setSupportServiceDetail] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) getDetailOfSupportService(id);
  }, [id]);

  const getDetailOfSupportService = async (id) => {
    setLoading(true);
    try {
      const res = await APIS.GetSupportServiceDetail(id);
      setSupportServiceDetail(res?.data?.data);
      setLoading(false);
    } catch (err) {
      console.log("Error on fetching support service detail");
      setLoading(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2 / 8, width: 1 }}>
      <Loader loading={loading}></Loader>
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
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1.25rem"
          >
            Support service details
          </Typography>
          <EditIcon
            sx={{ cursor: "pointer" }}
            onClick={() => {
              ModalService.open(
                ({ close }) => (
                  <SupportServiceDetailForm
                    supportServiceDetail={supportServiceDetail}
                    close={close}
                    onSuccess={() => getDetailOfSupportService(id)}
                  />
                ),
                {
                  modalTitle: "Support service information",
                  // width: "70%",
                  hideModalFooter: true,
                }
              );
            }}
          />
        </Box>

        {/* Family Details */}
        <Grid container rowSpacing={1.5} my>
          <Grid item xs={12}>
            <LabelValue
              label="Support service name"
              value={supportServiceDetail?.name}
            />
          </Grid>
          <Grid item xs={12}>
            <LabelValue
              label="Description"
              value={supportServiceDetail?.description}
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue
              label="Phone"
              value={supportServiceDetail?.phoneNumber}
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue label="Email" value={supportServiceDetail?.email} />
          </Grid>
          <Grid item xs={12}>
            <LabelValue label="URL" value={supportServiceDetail?.website} />
          </Grid>
          {supportServiceDetail?.website && (
            <Grid item xs={12}>
              <Button
                sx={{ borderRadius: "4px" }}
                variant="contained"
                onClick={() => {
                  window.open(supportServiceDetail?.website, "_blank");
                }}
              >
                Go to URL
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SupportServiceDetails;
