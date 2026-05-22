import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Tooltip,
  Button,
} from "@mui/material";
import Scrollbar from "../../../Dashboard/Components/ScrollBar";
import APIS from "../../../../common/hooks/UseApiCalls";
import CustomDialogModal from "../../../Child/Components/CustomDialogModal";
import { useParams } from "react-router-dom";

const FamilyProgressReport = (props) => {
  const { t } = useTranslation(["common"]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const { caseId, ...other } = props;
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [progressList, setProgresstList] = useState();
  const [progressReportModal, setProgressReportModal] = useState(false);
  const [progressReportData, setProgressReportData] = useState([]);
  const [assessmentIdForReport, setassessmentIdForReport] = useState(null);

  const color = {
    Pending: "warning",
    Completed: "success",
  };
  

  const getProgressList = useCallback(async (pageValue = 1) => {
    try {
      setLoading(true);
      let payload = {
        limit: 10,
        start: pageValue,
        webStatus: true,
        type: "FAMILY",
        HT_familyId: id
      };
      if (!payload.HT_familyId) {
          setProgresstList([]);
          setPageCount(1);
          setLoading(false);
          return; 
        }
      await APIS.ProgressReportListForChild(payload).then((resp) => {
        if (resp && resp.data && resp.data.data) {
          setProgresstList(resp.data?.data?.rows);
          setPageCount(resp.data.data.count);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProgressList();
  }, []);

  const handlePageChange = (event, value) => {
    getProgressList(value);
    setPage(value);
  };

  const handleViewProgressReport = (assessmentId) => {
    setassessmentIdForReport(assessmentId);
    getProgressReportData(assessmentId);
  };

  const getProgressReportData = useCallback(async (assessmentId) => {
    try {
      setLoading(true);
      let payload = {
        TWAssessmentId: assessmentId,
      };
      const data = await APIS.viewFollowUpProgress(payload);
      setProgressReportModal(true);
      setProgressReportData(data?.data?.data);
      console.log(data?.data?.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  function utcToLocal(utcDateTime) {
    const localDateTime = moment.utc(utcDateTime).local();
    return localDateTime.format("DD/MM/YYYY");
  }

  return (
    <>
      <Card {...other}>
        <CardHeader title={t("common:common.Progress Report")} />
        <Divider />

        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            //m: -1,
          }}
        ></Box>
        <Scrollbar>
          {loading && (
            <CircularProgress
              sx={{
                zIndex: 1000,
                position: "absolute",
                top: "55%",
                left: "45%",
              }}
              color="primary"
            />
          )}
          <Box sx={{ minWidth: 700 }}>
            {progressList && progressList?.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {t("common:common.Assessment Submitted on")}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {t("common:common.Progress Report Status")}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {t("common:common.Progress Report Submission Date")}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {t("common:common.Actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {progressList?.map((ProgressListItem) => {
                    return (
                      <TableRow hover key={ProgressListItem.AssessmentId}>
                        <TableCell align="center">
                          {ProgressListItem?.assessmentCompletionDate
                            ? utcToLocal(
                                ProgressListItem.assessmentCompletionDate
                              )
                            : "--"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={t(
                              `common:common.${ProgressListItem?.followUpStatus}`
                            )}
                            color={color[ProgressListItem?.followUpStatus]}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {ProgressListItem?.followUpCompletedOn
                            ? utcToLocal(ProgressListItem.followUpCompletedOn)
                            : "--"}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={t("common:common.View Report")}>
                            <Button
                              style={{ borderRadius: 4 }}
                              variant="contained"
                              disabled={
                                ProgressListItem.followUpStatus == "Completed"
                                  ? false
                                  : true
                              }
                              size="small"
                              onClick={() =>
                                handleViewProgressReport(
                                  ProgressListItem.HTAssessmentId
                                )
                              }
                            >
                              {t("common:common.View")}
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {progressList && progressList?.length === 0 && (
              <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
                <Box>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={6}>
                      <Typography>
                        {t("common:common.No Progress Report found")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
        </Scrollbar>
        <Box sx={{ display: "flex" }} flexDirection="row-reverse" p={1} m={1}>
          <Box sx={{ alignContent: "flex-end" }}>
            <Pagination
              onChange={handlePageChange}
              page={page}
              count={pageCount}
              shape="rounded"
            />
          </Box>
        </Box>
      </Card>
      <CustomDialogModal
        progressReportData={progressReportData}
        assessmentIdForReport={assessmentIdForReport}
        setProgressReportModal={setProgressReportModal}
        progressReportModal={progressReportModal}
      />
    </>
  );
};

export default FamilyProgressReport;
