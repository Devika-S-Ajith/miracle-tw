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
import { useParams } from "react-router";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";
import { ModalService } from "../../../components/Modal";
import SupportServiceDetailForm from "../../FS/Components/SupportServiceDetailForm";
import LabelValue from "../../../components/LabelValue";
import ManageSupportServicesForm from "../SupportServicesForm/ManageSupportServicesForm";
import { useTranslation } from "react-i18next";

const SupportServiceDetails = () => {
  const { id } = useParams();
  const [supportServiceDetail, setSupportServiceDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(["common"]);
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
            {t("common:infoCard.Support service details", "Support service details")}
          </Typography>
          <EditIcon
            sx={{ cursor: "pointer" }}
            onClick={() => {
              ModalService.open(
                ({ close }) => (
                  <ManageSupportServicesForm
                    supportServiceDetail={supportServiceDetail}
                    close={close}
                    onSuccess={() => getDetailOfSupportService(id)}
                  />
                ),
                {
                  modalTitle: t("common:infoCard.Support service information", "Support service information"),
                  // width: "70%",
                  height: "95%%",
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
              label={t("common:infoCard.Support service name", "Support service name")}
              value={supportServiceDetail?.name}
            />
          </Grid>
          <Grid item xs={12}>
            <LabelValue
              label={t("common:common.Description", "Description")}
              value={supportServiceDetail?.description}
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue
              label={t("common:common.Phone", "Phone")}
              value={supportServiceDetail?.phoneNumber}
            />
          </Grid>
          <Grid item xs={6}>
            <LabelValue label={t("common:common.Email", "Email")} value={supportServiceDetail?.email} />
          </Grid>
          <Grid item xs={12}>
            <LabelValue label={t("common:infoCard.URL", "URL")} value={supportServiceDetail?.website} />
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
                {t("common:infoCard.Go to URL", "Go to URL")}
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SupportServiceDetails;
