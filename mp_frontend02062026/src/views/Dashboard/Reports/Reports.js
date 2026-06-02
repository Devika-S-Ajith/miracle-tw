import { React, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {
  Box,
  Button,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Grid
} from "@mui/material";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import ArrowRightIcon from "../../../assets/icons/ArrowRight";
import Scrollbar from "../Components/ScrollBar/ScrollBar";
import ReportHeader from "./Components/ReportHeader";
import ReportTableNoData from "./Components/ReportTableNoData";
import APIS from "../../../common/hooks/UseApiCalls";
import { ConvertToXLSX } from "../../../components/UserComponents/ReportGenerator";
import { ModalService } from "../../../components/Modal";
import AutoCompleteDropdownToFilter from "../../../components/UserComponents/AutoCompleteDropdownToFilter";
import toast from "react-hot-toast";
import Loader from "../../../components/UserComponents/Loader";
import PageLoader from "../../../components/UserComponents/PageLoader";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const ReportCollectionList = [
  {
    Name: "Progress Report (children)",
    ReportTitle: "progressReportChildren",
    id: 1,
  },
  {
    Name: "Children assessed",
    ReportTitle: "reportsChildServed",
    id: 2,
  },
  {
    Name: "Children with Red Flags",
    ReportTitle: "reportsChildRedFlag",
    id: 3,
  },
  {
    Name: "DisruptionCases",
    ReportTitle: "disruptionCases",
    id: 4,
  },
  {
    Name: "Days of Followup",
    ReportTitle: "reportsDaysofFollowup",
    id: 5,
  },
  {
    Name: "Average Thrive Scale Scores (children)",
    ReportTitle: "reportAverageThriveScoreChildren",
    id: 6,
  },
  {
    Name: "All overdue assessments",
    ReportTitle: "reportsChildrenOverdue",
    id: 7,
  },
  {
    Name: "Children in CCI",
    ReportTitle: "reportsChildrenInCCI",
    id: 10,
  },
  {
    Name: "Average Thrive Scale Scores (families)",
    ReportTitle: "reportAverageThriveScaleScoresFamilies",
    id: 20,
  },
  {
    Name: "Progress reports (families)",
    ReportTitle: "reportProgressReportsFamilies",
    id: 21,
  },
  {
    Name: "Detailed progress report (families)",
    ReportTitle: "reportDetailedProgressReportFamilies",
    id: 22,
    isExportOnly: true,
  },
  {
    Name: "Legacy assessment score",
    ReportTitle: "reportLegacyAssessementScore",
    id: 24,
    isExportOnly: true,
  },
];

const Reports = (props) => {
  const { t } = useTranslation(["common"]);
  const { locationList,signedinOrgType, signedinUserRoleHT } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const {
    customers,
    getUserlist,
    savePageData,
    pageCount,
    saveCurrentPage,
    pageData,
    loading,
    ...other
  } = props;
  const [reportList, setReportList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedCountry,setSelectedCountry] = useState(localStorage.getItem('userRegion'))
  const [keyVal,setKeyVal] = useState(null)
  const userListlevel1 = [
    "superadmin",
    "admin",
    "admin+caseworker",
    "caseworker",
    "viewonly",
  ];
  const userListlevel2 = [
    "superadmin",
    "admin",
    "admin+caseworker",
    "caseworker",
  ];
  const userListlevel3 = ["admin", "admin+caseworker", "caseworker"];

  const handleReport = (reportData) => {
    if (reportData) {
      navigate(`/dashboard/${reportData.ReportTitle}`);
    }
  };

  useEffect(() => {
    let tempValue = [];

    if (signedinOrgType !== null && signedinUserRoleHT !== null) {
      if (userListlevel1.includes(signedinUserRoleHT)) {
        let value = ReportCollectionList.filter((item) =>
          [6, 4, 16, 12, 20].includes(item.id)
        );
        tempValue = _.unionBy(value, tempValue, "id");
      }
      if (userListlevel2.includes(signedinUserRoleHT)) {
        let value = ReportCollectionList.filter((item) =>
          [2].includes(item.id)
        );
        tempValue = _.unionBy(value, tempValue, "id");
      }
      if (userListlevel3.includes(signedinUserRoleHT)) {
        let value = ReportCollectionList.filter((item) =>
          [1, 3, 5, 7, 8, 14, 10, 13, 18, 19, 20, 21, 23, 24].includes(item.id)
        );
        tempValue = _.unionBy(value, tempValue, "id");
      }
      if (
        signedinUserRoleHT === "admin" ||
        signedinUserRoleHT === "admin+caseworker"
      ) {
        let value = ReportCollectionList.filter((item) =>
          [8, 9, 11, 15, 17].includes(item.id)
        );
        tempValue = _.unionBy(value, tempValue, "id");
      }
      if (signedinUserRoleHT === "caseworker") {
        // Exclude report with id 22 for caseworker
        const filteredList = ReportCollectionList.filter(item => item.id !== 22);
        tempValue = _.unionBy(filteredList, tempValue, "id");
      }
      if (signedinUserRoleHT === "superadmin") {
        let value = ReportCollectionList.filter((item) =>
          [17, 22].includes(item.id)
        );
        tempValue = _.unionBy(value, tempValue, "id");
      }
      tempValue = _.orderBy(tempValue, "id", "asc");
      setReportList(tempValue.sort((a, b) => a.Name.localeCompare(b.Name)));
    }
  }, [signedinOrgType, signedinUserRoleHT]);



  const { authStatus, checkAuth } = useAuthorization("Reports");

   useEffect(() => {
      document.title = "Reports | ThriveWell";
      checkAuth();
    }, []);
  
    if (authStatus === 'loading' || authStatus === 'idle') {
      return <PageLoader />;
    }
  
    if (authStatus === 'unauthorized') {
      return null; // Or a custom message
    }


  const handleCountryChange = (value,close) => {
    setSelectedCountry(value);
    setKeyVal(!keyVal);
    handleExport(close,value)
  };

  const handleExport = (async (close,countryValue) => {
    try {
        let payload = {
            "limit": 5000,
            "start": 1,
            "childName": '',
            "fromDate": '',
            "toDate": '',
            "type": "OVERALL",
            "TWCountryId": countryValue, // This should be the updated value
            "listType": "FAMILY"
        };
        setLoading(true);
        const data = await APIS.generarateProgressReportList(payload);
        if (data?.data) {
            close()
            setLoading(false);
            ConvertToXLSX(data?.data, 'Progress Report Detailed View - Family');
        } else if (data.data.Message === "Unauthorized") {
            toast.error(t('common:common.Unauthorized'));
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
});

const handleExportLegacyScore = (async () => {
    try {
        let payload = {
            "TWUserId":signedinUserRoleHT === "caseworker" ? localStorage.getItem("username") : null,
            "TWAccountId": localStorage.getItem("orgId")  
        };
        setLoading(true);
        const data = await APIS.generaratelegacyDataExport(payload);
        if (data?.data) {
            setLoading(false);
            ConvertToXLSX(data?.data, 'Legacy assessement score');
        } else if (data.data.Message === "Unauthorized") {
            toast.error(t('common:common.Unauthorized'));
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
});

  const handleReportExport = (async (reportTitle) => {
    if(reportTitle == "reportLegacyAssessementScore"){
       handleExportLegacyScore()
    }else{
      openCountrySelectionModal();
    }
  });

  const openCountrySelectionModal = (async () => {
    ModalService.open(
      ({ close }) => (
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              id="country"
              name="country"
              accessKey="countryName"
              getValueFunction={(value) => {
                handleCountryChange(value, close);
              }}
              component={AutoCompleteDropdownToFilter}
              value={selectedCountry}
              required={true}
              key={keyVal}
              defaultVal={null}
              label="country"
              options={locationList.filter((locItem) =>
                localStorage.getItem("userRegion") === "1"
                  ? locItem.id === "1"  // If userRegion is "1", show only item with id "1"
                  : locItem.id !== "1"  // Otherwise, show items with id "2" and "3" (exclude "1")
              )}
              textFieldProps={{
                sx: { height: '36px' },
                fullWidth: true,
                margin: "normal",
                variant: "outlined",
                label: t("common:common.Country"),
              }}
            />
          </Grid>
        </Grid>
      ),
      {
        modalTitle: t("common:common.Select country"),
        width: "30%",
        maxHeight: "80%",
        overflow: "hidden",
        hideModalFooter: true,
        enableClose: true,
      }
    );
  }); 

  return (
    <div>
       <Loader loading={isLoading} />
      <>
        <Box
          sx={{
            backgroundColor: "background.default",
            minHeight: "100%",
            pt: 3,
            pr: 2,
          }}
        >
          <ReportHeader />
          <Box sx={{ mt: 3 }}>
            <Card {...other} sx={{ p: "10px" }}>
                <Box sx={{ minWidth: 700 }}>
                  {reportList && reportList.length > 0 && (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              color="text.secondary"
                            >
                              {" "}
                              {t("common:common.ReportName")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pl: 2 }}>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              color="text.secondary"
                            >
                              {" "}
                              {t("common:common.Actions")}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportList.map((report) => {
                          return (
                            <TableRow
                              hover
                              key={report.id}
                              onClick={() => {
                                !report?.isExportOnly && handleReport(report);
                              }}
                            >
                              <TableCell>
                                {" "}
                                {t(`common:reports.${report.Name}`, report.Name)}
                              </TableCell>

                              <TableCell align="right">
                                {report?.isExportOnly ? (
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      handleReportExport(report.ReportTitle);
                                    }}
                                  >
                                    {t('common:common.Export')}
                                  </Button>
                                ) : (
                                  <Tooltip
                                    title={t("common:child.View Report")}
                                  >
                                    <IconButton>
                                      <ArrowRightIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                  {customers && customers.length === 0 && <ReportTableNoData />}
                </Box>
              <Box
                sx={{ display: "flex" }}
                flexDirection="row-reverse"
                p={1}
                m={1}
              >
                <Box sx={{ alignContent: "flex-end" }}>
                  {/* <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" /> */}
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </>
    </div>
  );
};
export default Reports;
