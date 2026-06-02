import { useState, useEffect, useCallback, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Tooltip,
  Pagination,
  TableRow,
  CircularProgress,
} from "@mui/material";
import useMounted from "../../../../common/hooks/UseMounted";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import Scrollbar from "../../../Dashboard/Components/ScrollBar";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { ChildIconBlack, FamilyIconBlack } from "../../../../assets/icons/SideBarIcons";
import { formattedDate } from "../../../../helpers/helperFunction";

const Assessments = (props) => {
  const mounted = useMounted();
  const [page, setPage] = useState(1);
  const [pageCount, setpageCount] = useState(1);
  const { t } = useTranslation(["common"]);
  const { care_givers, childId, ...other } = props;
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { signedinOrgType } = useContext(CommonDataContext);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [signedinOrgId, setSignedinOrgId] = useState("");

  useEffect(() => {
    getAssessments(childId);
    setSignedinOrgId(localStorage.getItem("orgId"));
    return () => {};
  }, []);

  let getAssessmentListpayload = {
    rowCount: "10",
    pageNumber: "1",
    orderByField: [
      ["dateOfAssessment", "ASC"],
      ["id", "DESC"],
    ],
    assessmentStatus: "",
    globalSearchQuery: "",
    isComplete: "",
    userTimeZone: userTimeZone,
  };

  const getAssessments = useCallback(
    async (value, pageNumber = 1) => {
      setLoading(true);
      try {
        const finalPayload = {
          ...getAssessmentListpayload,
          HTChildId: value,
          pageNumber,
        };
        const data = await APIS.AssessmentList(finalPayload);
        setAssessments(data?.data?.data);
        setpageCount(data?.data?.pageCount);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  const handlePageChange = (event, newPage) => {
    getAssessments(childId, newPage);
    setPage(newPage);
  };

  return (
    <Card {...other}>
      <CardHeader
        //action={<MoreMenu />}
        title={t("common:common.Assessments")}
      />
      <Divider />
      <Scrollbar>
        {loading && (
          <CircularProgress
            sx={{
              zIndex: 1000,
              position: "fixed",
              top: "50%", // Adjusted to 50% to center vertically
              left: "50%", // Adjusted to 50% to center horizontally
              transform: "translate(-50%, -50%)", // Centering trick
            }}
            color="primary"
          />
        )}
        <Box className={assessments?.length ? "scrollListTable" : ""}>
          {assessments?.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>
                {t('common:child.Case ID')}
                </TableCell> */}
                  <TableCell>{t("common:assessment.Assessment for")}</TableCell>
                  <TableCell>{t("common:common.Caseworker Name")}</TableCell>
                  {/* <TableCell>
                    {t("common:common.Name of Child Care Institution")}
                  </TableCell> */}
                  <TableCell>{t("common:common.Date of Assessment")}</TableCell>
                  <TableCell>{t("common:common.Submitted Date")}</TableCell>
                  <TableCell>{t("common:common.Score")}</TableCell>
                  <TableCell>
                    {t("common:assessment.Interventions for this person")}
                  </TableCell>
                  <TableCell align="right">
                    {t("common:common.Actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments &&
                  assessments?.length > 0 &&
                  assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      {/* <TableCell>
                    {assessment.HTCaseId}
                  </TableCell> */}

                      <TableCell>
                          <Box display="flex" alignItems="center">
                            {Boolean(assessment?.HTFamilyId) ? (
                              <FamilyIconBlack fontSize="small" />
                            ) : (
                              <ChildIconBlack fontSize="small" />
                            )}
                              <span style={{ marginLeft: "10px" }}>
                                {Boolean(assessment?.HTFamilyId)
                                  ? assessment?.familyName
                                  : assessment?.childFirstName +
                                  " " +
                                  assessment?.childLastName}
                              </span>
                          </Box>
                      </TableCell>

                      <TableCell>
                        {assessment.caseWorkerFirstName +
                          " " +
                          assessment.caseWorkerLastName}
                      </TableCell>


                      <TableCell>
                        {formattedDate(assessment.dateOfAssessment)}
                      </TableCell>

                      <TableCell>
                        {assessment.isComplete ? formattedDate(assessment.updatedAt) : ""}
                      </TableCell>

                      <TableCell>{assessment.totalScore}</TableCell>

                      <TableCell>{assessment.totalScore ? assessment.interventionCount : ""}</TableCell>
                      <TableCell align="right">
                        {/* {([3, 4, 5].includes(parseInt(signedinOrgType)) && assessment.organizationId === signedinOrgId)
                      ? <Tooltip title={assessment.isComplete ? t('common:common.Completed') : t('common:assessment.Edit Assessment')}>
                        <IconButton
                          component={!assessment.isComplete ? RouterLink : ''}
                          to={`/dashboard/assessments/${assessment.id}/edit`}
                          state={{ editAssessment: true, formRevisionNumber: assessment.formRevisionNumber }}
                          disabled={!assessment.isComplete ? true : false}
                        >
                          {assessment.isComplete ?
                            <Check fontSize="small" />
                            : <PencilAltIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip> : <></>} */}

                        <Tooltip title={t("common:common.View Assessment")}>
                          <IconButton
                            component={RouterLink}
                            to={`/dashboard/assessments/${assessment.id}/view`}
                            state={{
                              viewAssessment: true,
                              formRevisionNumber: assessment.formRevisionNumber,
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
          )}
          {assessments && assessments?.length === 0 && !loading && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>
                      {t("common:assessment.No Assessments to list")}
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
  );
};

export default Assessments;
