import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { formatDate, utcToLocalDate } from "../../../../../helpers/helperFunction";
import Loader from "../../../../../components/UserComponents/Loader";
import APIS from "../../../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";

const MedLogDetailsModal = ({
  propData,
  propChildData,
  propPreviewData,
  close,
  formResponseId,
  recursiveItemId,
  refetchData,
}) => {
    const { t } = useTranslation(["common"]);
  // State: use null for objects, array for previewData
  const [data, setData] = useState(null);
  const [childData, setChildData] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to get preview data by id
  const getPreviewDataById = (id, decodedTemplate) => {
    const entry = decodedTemplate?.find((item) => item.logItemEntryId === id);
    return entry ? entry.previewData : [];
  };

  // Unified data loader
  const loadData = async () => {
    if (refetchData) {
      setLoading(true);
      try {
        const payload = { logId: formResponseId };
        const apiRes = await APIS.DetailRecLog(payload);
        const logData = apiRes?.data?.data?.logs;
        const medlogDetails =
          logData?.formPostCompleteAnswer?.medlogEntry?.find(
            (item) => item.id === recursiveItemId,
          );
        setData(medlogDetails || null);
        setChildData(logData || null);
        setPreviewData(
          getPreviewDataById(recursiveItemId, logData?.decodedTemplate),
        );
      } catch (err) {
        console.error(err);
        setData(null);
        setChildData(null);
        setPreviewData([]);
      } finally {
        setLoading(false);
      }
    } else {
      setData(propData || null);
      setChildData(propChildData || null);
      setPreviewData(propPreviewData || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [formResponseId, refetchData]);

  // Table rendering extracted for clarity
  const renderMedLogTableRows = () => {
    if (!data) return null;
    if (data?.administered !== "No") {
      return (
        <>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Name of Medication", "Name of Medication")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.medicationName}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Dosage", "Dosage")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.dosage}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Strength", "Strength")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.strength}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Administered Time", "Administered Time")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.itemEntryDate ? formatDate(data?.itemEntryDate) : "-"}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Logged time", "Logged time")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.createdAt ? formatDate(data?.createdAt) : "-"}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Administered By", "Administered By")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.administeredBy}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Administered To", "Administered To")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.administeredTo}
              </Typography>
            </TableCell>
          </TableRow>
        </>
      );
    } else {
      return (
        <>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Name of Medication", "Name of Medication")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.noneAdministeredMedicationName}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Dosage", "Dosage")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.noneAdministeredDosage}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Strength", "Strength")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.strength}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Reason Missed", "Reason Missed")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.reasonNotAdministered}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Date Missed", "Date Missed")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {utcToLocalDate(data?.itemEntryDate)}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("common:common.Logged By", "Logged By")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                {data?.loggedBy}
              </Typography>
            </TableCell>
          </TableRow>
        </>
      );
    }
  };

  return (
    <>
      <Loader loading={loading} />
      <Box sx={{ height: "70vh", maxHeight: "600px", mr: -2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography id="recreational-log" color="textPrimary" variant="h5">
              {t("common:common.Med Log Details", "Med log details")}
            </Typography>
            <Typography color="textPrimary" variant="h6" sx={{ mt: 1 }}>
              {childData?.childName}
            </Typography>
          </Box>
          <Typography
            id="log-overview-table-label"
            color="textPrimary"
            variant="body2"
            sx={{ color: "text.secondary" }}
            fontWeight="bold"
            m
          >
            {data?.itemEntryDate ? utcToLocalDate(data?.itemEntryDate) : ""}
          </Typography>
        </Box>
        <Box
          height="90%"
          overflow="scroll"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            "&::-webkit-scrollbar": { width: "3px" },
            "&::-webkit-scrollbar-thumb": { borderRadius: "6px" },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "white",
              display: "none",
            },
          }}
        >
          <Box sx={{ mr: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography
                      fontWeight="bold"
                      variant="subtitle1"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("common:common.Field", "Field")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      fontWeight="bold"
                      variant="subtitle1"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("common:infoCard.Answer", "Answer")}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderMedLogTableRows()}
                {previewData?.map((individualItem, index) => (
                  <TableRow hover key={index}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {t(`common:common.${individualItem?.displayLabel}`, individualItem?.displayLabel)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {individualItem?.displayValue}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data?.reasonNotAdministered && (
              <Typography
                color="textPrimary"
                variant="subtitle2"
                fontWeight={700}
                fontSize="1rem"
                m
              >
                {t("common:common.What happened", "What happened")}?
              </Typography>
            )}
            <Typography
              color="textPrimary"
              variant="subtitle2"
              fontWeight={500}
              fontSize="1rem"
              ml={2}
            >
              {data?.failureReasonComments}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box mt={2} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
        <Button
          sx={{ borderRadius: "4px" }}
          variant="contained"
          onClick={close}
        >
          {t("common:common.Close", "Close")}
        </Button>
      </Box>
    </>
  );
};

export default MedLogDetailsModal;
