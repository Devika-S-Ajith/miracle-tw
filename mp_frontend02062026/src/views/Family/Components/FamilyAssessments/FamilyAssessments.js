import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import APIS from "../../../../common/hooks/UseApiCalls";
import { Link as RouterLink, useParams } from "react-router-dom";
import useMounted from "../../../../common/hooks/UseMounted";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import Check from "../../../../assets/icons/Check";
import PencilAltIcon from "../../../../assets/icons/PencilAlt";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import Loader from "../../../../components/UserComponents/Loader";

const Payload = {
  rowCount: "20",
  assessmentStatus: "",
  globalSearchQuery: "",
  isComplete: "",
  needFullData: "false",
  pageNumber: "1",
  orderByField: [
    ["dateOfAssessment", "ASC"],
    ["id", "DESC"],
  ],
  dateFilterFrom: "",
  dateFilterTo: "",
  loggedInDevice: "",
  HTFamilyId: null,
};
const FamilyAssessments = () => {
  const { t } = useTranslation(["common"]);
  const mounted = useMounted();
  const { signedinOrgType } = useContext(CommonDataContext);
  const [signedinOrgId, setSignedinOrgId] = useState("");
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setpageCount] = useState(1);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handlePageChange = (event, newPage) => {
    getAssessments(newPage);
    setPage(newPage);
  };

  useEffect(() => {
    getAssessments();
    setSignedinOrgId(localStorage.getItem("orgId"));
  }, []);

  const getAssessments = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      try {
        let finalPayload = { ...Payload };
        finalPayload.pageNumber = pageNumber;
        finalPayload.HTFamilyId = id;
        finalPayload.userTimeZone = userTimeZone;

        // Validate HTFamilyId before making API call
        if (!finalPayload.HTFamilyId) {
          setAssessments([]);
          setpageCount(1);
          setLoading(false);
          return; 
        }

        const data = await APIS.AssessmentList(finalPayload);

        setAssessments(data && data.data && data.data.data);
        setpageCount(data && data.data && data.data.pageCount);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [useMounted]
  );
  return (
    <>
    <Loader loading={loading} />
    <Card>
      <CardHeader title={t("Assessments")} />
      <Divider />
      <Box sx={{ minWidth: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("common:common.Date of Assessment")}</TableCell>
              <TableCell>{t("common:common.Submitted Date")}</TableCell>
              <TableCell>{t("common:common.Score")}</TableCell>
              <TableCell align="right">{t("common:common.Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessments?.map((assessment) => (
              <TableRow>
                <TableCell>{assessment?.dateOfAssessment}</TableCell>
                <TableCell>
                  {assessment?.isComplete ? assessment?.updatedAt : ""}
                </TableCell>
                <TableCell>{assessment?.totalScore}</TableCell>
                <TableCell align="right">
                  {[3, 4, 5].includes(parseInt(signedinOrgType)) &&
                  assessment?.organizationId === signedinOrgId ? (
                    <Tooltip
                      title={
                        assessment.isComplete
                          ? t("common:common.Completed")
                          : t("common:assessment.Edit Assessment")
                      }
                    >
                      <IconButton
                        component={!assessment?.isComplete ? RouterLink : ""}
                        to={`/dashboard/assessments/${assessment.id}/edit`}
                        state={{
                          editAssessment: true,
                          formRevisionNumber: assessment?.formRevisionNumber,
                        }}
                        disabled={!assessment?.isComplete ? true : false}
                      >
                        {assessment?.isComplete ? (
                          <Check fontSize="small" />
                        ) : (
                          <PencilAltIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <></>
                  )}

                  <Tooltip title={t("common:common.View Assessment")}>
                    <IconButton
                      component={RouterLink}
                      to={`/dashboard/assessments/${assessment.id}/view`}
                      state={{
                        viewAssessment: true,
                        formRevisionNumber: assessment?.formRevisionNumber,
                      }}
                    >
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          {assessments && assessments?.length === 0 && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={6}>
                    <Typography>
                      {t("common:assessment.No Assessments to list")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
      </Box>
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
    </>
  );
};

export default FamilyAssessments;
