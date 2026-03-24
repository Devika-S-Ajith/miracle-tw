import { useState, useEffect, useCallback, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Tooltip,
  TableRow,
  CircularProgress,
} from "@mui/material";
import useMounted from "../../../../common/hooks/UseMounted";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import PencilAltIcon from "../../../../assets/icons/PencilAlt";
import Check from "../../../../assets/icons/Check";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
//import MoreMenu from '../../MoreMenu';
import Scrollbar from "../../../Dashboard/Components/ScrollBar";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";

const Assessments = (props) => {
  const { t } = useTranslation(["common"]);
  const mounted = useMounted();
  const { caseId } = props;
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { signedinOrgType } = useContext(CommonDataContext);
  // const [ members, setMembers] = useState(care_givers);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [signedinOrgId, setSignedinOrgId] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setpageCount] = useState(1);
  // const assessments = [{
  //   id: 1,
  //   caseID: 1001,
  //   childName: "Child 1",
  //   caseWorkerName: "Worker 1",
  //   childCareName: "Miracle",
  //   assessmentDate: "1 Januray 2021",
  //   assessmentType: "In person",
  //   submittedDate: "1 Januray 2021",
  //   editAssessment: false
  // },{
  //   id: 2,
  //   caseID: 1002,
  //   childName: "Child 2",
  //   caseWorkerName: "Worker 2",
  //   childCareName: "Miracle",
  //   assessmentDate: "1 Januray 2021",
  //   assessmentType: "Remote",
  //   submittedDate: "",
  //   editAssessment: true
  // }]

  useEffect(() => {
    getAssessments(caseId);
    setSignedinOrgId(localStorage.getItem("orgId"));
    return () => {};
  }, []);

  // const getDate = (dateString) => {
  //   let yourDate = new Date(dateString)
  //   // yourDate.toISOString().split('T')[0];
  //   const offset = yourDate.getTimezoneOffset()
  //   yourDate = new Date(yourDate.getTime() - (offset*60*1000))
  //   return yourDate.toISOString().split('T')[0]
  // }

  // const getAssessments = () =>{
  //   setLoading(true);
  //   console.log("id to check >>",id)
  //     caseList && caseList.forEach((cases)=>{
  //       if(cases.id === id){
  //         let familyMembers = cases.assessments.filter(assessment => assessment.isPrimaryCareGiver === false)
  //         console.log("assessments >>",cases.assessments)
  //         // setMembers(familyMembers);
  //         setLoading(false);
  //       }
  //     })
  // }
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
        let finalPayload = getAssessmentListpayload;
        finalPayload.caseFilter = value;
        finalPayload.pageNumber = pageNumber;

        const data = await APIS.AssessmentList(finalPayload);
        //if (mounted.current) {
        setAssessments(data && data.data && data.data.data);
        setpageCount(data && data.data && data.data.pageCount);
        setLoading(false);
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  const handlePageChange = (event, newPage) => {
    getAssessments(caseId, newPage);
    setPage(newPage);
  };

  return (
    <Card {...props}>
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
        <Box sx={{ minWidth: 1150 }}>
          {assessments && assessments.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("common:child.Case ID")}</TableCell>
                  <TableCell>{t("common:child.Child Name")}</TableCell>
                  <TableCell>{t("common:common.Caseworker Name")}</TableCell>
                  <TableCell>
                    {t("common:common.Name of Child Care Institution")}
                  </TableCell>
                  <TableCell>{t("common:common.Date of Assessment")}</TableCell>
                  <TableCell>{t("common:common.Submitted Date")}</TableCell>
                  <TableCell align="right">
                    {t("common:common.Actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments &&
                  assessments.length > 0 &&
                  assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>{assessment.HTCaseId}</TableCell>

                      <TableCell>
                        {assessment.childFirstName +
                          " " +
                          assessment.childLastName}
                      </TableCell>

                      <TableCell>
                        {assessment.caseWorkerFirstName +
                          " " +
                          assessment.caseWorkerLastName}
                      </TableCell>

                      <TableCell>{assessment.organizationName}</TableCell>

                      <TableCell>
                        {/* {getDate(assessment.dateOfAssessment)} */}
                        {assessment.dateOfAssessment}
                      </TableCell>

                      <TableCell>
                        {/* {assessment.isComplete ? getDate(assessment.updatedAt) : ''} */}
                        {assessment.isComplete ? assessment.updatedAt : ""}
                      </TableCell>
                      <TableCell align="right">
                        {[3, 4, 5].includes(parseInt(signedinOrgType)) &&
                        assessment.organizationId === signedinOrgId ? (
                          <Tooltip
                            title={
                              assessment.isComplete
                                ? t("common:common.Completed")
                                : t("common:assessment.Edit Assessment")
                            }
                          >
                            <IconButton
                              component={
                                !assessment.isComplete ? RouterLink : ""
                              }
                              to={`/dashboard/assessments/${assessment.id}/edit`}
                              state={{
                                editAssessment: true,
                                formRevisionNumber:
                                  assessment.formRevisionNumber,
                              }}
                              disabled={!assessment.isComplete ? true : false}
                            >
                              {assessment.isComplete ? (
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
          {assessments && assessments.length === 0 && (
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
