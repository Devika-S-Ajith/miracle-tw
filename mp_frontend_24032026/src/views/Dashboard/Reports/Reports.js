import { React, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from "../../../common/hooks/UseSettings";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import {
  Box,
  Card,
  Container,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  // TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import _ from "lodash";
// import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import ArrowRightIcon from "../../../assets/icons/ArrowRight";
import Scrollbar from "../Components/ScrollBar/ScrollBar";
// import { customerApi } from '../../../../__fakeApi__/customerApi';
const Reports = (props) => {
  const { t } = useTranslation(["common"]);
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext);
  const navigate = useNavigate();
  // const mounted = useMounted();
  const { settings } = useSettings();
  // const [value, setValue] = useState(null);
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
  const orgListlevel1 = ["1", "3", "4", "5"];
  const orgListlevel2 = ["1", "2", "3", "4", "5"];
  const orgListlevel3 = ["1", "2", "3", "4"];
  const orgListlevel4 = ["3", "4"];
  const userListlevel1 = ["superadmin", "admin", "caseworker","viewonly"];
  const userListlevel2 = ["superadmin", "admin","caseworker"];
  const userListlevel3 = ["admin", "caseworker"];

  const handleReport = (reportData) => {
    console.log({ reportData });
    if (reportData.ReportTitle === "Red Flags") {
      navigate("/dashboard/reportsChildRedFlag");
    } else if (reportData.ReportTitle === "Children Served") {
      navigate("/dashboard/reportsChildServed");
    } else if (reportData.ReportTitle === "Disruption Cases") {
      navigate("/dashboard/disruptionCases");
    } else if (reportData.ReportTitle === "Average Thrive Scale") {
      navigate("/dashboard/averageThriveScore");
    } else if (reportData.ReportTitle === "Days of Followup") {
      navigate("/dashboard/reportsDaysofFollowup");
    } else if (reportData.ReportTitle === "Children Overdue") {
      navigate("/dashboard/reportsChildrenOverdue");
    } else if (
      reportData.ReportTitle === "Number of children newly admitted over time"
    ) {
      navigate("/dashboard/reportsNewlyAddeddChildren");
    } else if (reportData.ReportTitle === "Children in Case Management") {
      navigate("/dashboard/reportsCaseManagement");
    } else if (reportData.ReportTitle === "Children in CCI") {
      navigate("/dashboard/reportsChildrenInCCI");
    } else if (reportData.ReportTitle === "Current Placement") {
      navigate("/dashboard/reportsCurrentPlacement");
    } else if (reportData.ReportTitle === "Duration In CCI") {
      navigate("/dashboard/durationInCCI");
    }else if (reportData.ReportTitle === "Child Status") {
      navigate("/dashboard/reportsChildStatus");
    }else if (reportData.ReportTitle === "Reintegrated Children") {
      navigate("/dashboard/ReintegratedChildren");
    }else if (reportData.ReportTitle === "Newly Added Children") {
      navigate("/dashboard/NewlyAdded");
    }else if (reportData.ReportTitle === "Average % change in Thrive Scale") {
      navigate("/dashboard/reportsAverageChange");
    }else if (reportData.ReportTitle === "Progress Report") {
      navigate("/dashboard/ProgressReport");
    }

    // call a component and pass th reportData -> report detail list component
  };
  // const ReportListSample = [
  //   {
  //     Name: t("common:common.ChildrenServed"),
  //     ReportTitle: "Children Served",
  //     id: 1,
  //   },
  //   {
  //     Name: t("common:common.RedFlags"),
  //     ReportTitle: "Red Flags",
  //     id: 2,
  //   },
  //   {
  //     Name: t("common:common.DisruptionCases"),
  //     ReportTitle: "Disruption Cases",
  //     id: 3,
  //   },
  //   {
  //     Name: t("common:common.Days of Followup"),
  //     ReportTitle: "Days of Followup",
  //     id: 4,
  //   },
  //   {
  //     Name: t("common:common.Average Thrive Scale Scores"),
  //     ReportTitle: "Average Thrive Scale",
  //     id: 5,
  //   },
  //   {
  //     Name: t("common:common.Children Overdue"),
  //     ReportTitle: "Children Overdue",
  //     id: 6,
  //   },
  //   {
  //     Name: t("common:common.Number of children newly admitted over time"),
  //     ReportTitle: "Number of children newly admitted over time",
  //     id: 7,
  //   },
  //   {
  //     Name: t("common:common.Children in Case Management"),
  //     ReportTitle: "Children in Case Management",
  //     id: 8,
  //   },
  //   {
  //     Name: t("common:common.Children in CCI"),
  //     ReportTitle: "Children in CCI",
  //     id: 9,
  //   },
  //   {
  //     Name: t("common:common.Current Placement"),
  //     ReportTitle: "Current Placement",
  //     id: 10,
  //   },
  //   {
  //     Name: t("common:common.Duration in CCI"),
  //     ReportTitle: "Duration In CCI",
  //     id: 11,
  //   },
  //   {
  //     Name: t("common:common.ReintegratedChildren"),
  //     ReportTitle: "Reintegrated Children",
  //     id: 12,
  //   },
  //   {
  //     Name: t("common:common.NewlyAdded"),
  //     ReportTitle: "Newly Added Children",
  //     id: 13,
  //   },
  //   {
  //     Name: t("common:common.Child Status"),
  //     ReportTitle: "Child Status",
  //     id: 14,
  //   },
  //   {
  //     Name: t("common:common.Average % change in Thrive Scale"),
  //     ReportTitle: "Average % change in Thrive Scale",
  //     id: 15,
  //   },
  // ];

  const ReportListSample = [
    {
      Name: "Progress Report",
      ReportTitle: "Progress Report",
      id: 1,
    },
    {
      Name: "ChildrenServed",
      ReportTitle: "Children Served",
      id: 2,
    },
    {
      Name: "RedFlags",
      ReportTitle: "Red Flags",
      id: 3,
    },
    {
      Name: "DisruptionCases",
      ReportTitle: "Disruption Cases",
      id: 4,
    },
    {
      Name: "Days of Followup",
      ReportTitle: "Days of Followup",
      id: 5,
    },
    {
      Name: "Average Thrive Scale Scores",
      ReportTitle: "Average Thrive Scale",
      id: 6,
    },
    {
      Name: "Children Overdue",
      ReportTitle: "Children Overdue",
      id: 7,
    },
    {
      Name: "Number of children newly admitted over time",
      ReportTitle: "Number of children newly admitted over time",
      id: 8,
    },
    {
      Name: "Children in Case Management",
      ReportTitle: "Children in Case Management",
      id: 9,
    },
    {
      Name: "Children in CCI",
      ReportTitle: "Children in CCI",
      id: 10,
    },
    {
      Name: "Current Placement",
      ReportTitle: "Current Placement",
      id: 11,
    },
    {
      Name: "Duration in CCI",
      ReportTitle: "Duration In CCI",
      id: 12,
    },
    {
      Name: "ReintegratedChildren",
      ReportTitle: "Reintegrated Children",
      id: 13,
    },
    {
      Name: "NewlyAdded",
      ReportTitle: "Newly Added Children",
      id: 14,
    },
    {
      Name: "Child Status",
      ReportTitle: "Child Status",
      id: 15,
    },
    {
      Name: "Average % change in Thrive Scale",
      ReportTitle: "Average % change in Thrive Scale",
      id: 16,
    },
    
  ];

  useEffect(() => {
    // let tempValue = _.cloneDeep(ReportListSample);
    let tempValue = [];

    if (signedinOrgType !== null && signedinUserRole !== null) {
      if(userListlevel1.includes(signedinUserRole) && orgListlevel2.includes(signedinOrgType)){
        let value = ReportListSample.filter((item) => [6,4,16,12,1].includes(item.id));
        tempValue = _.unionBy(value,tempValue,'id');
      }
      if(userListlevel2.includes(signedinUserRole) && orgListlevel1.includes(signedinOrgType)){
        let value = ReportListSample.filter((item) => [2].includes(item.id));
        tempValue = _.unionBy(value,tempValue,'id');
      }
      if(userListlevel3.includes(signedinUserRole) && orgListlevel1.includes(signedinOrgType)){
        let value = ReportListSample.filter((item) => [3,5,7,14,10,13].includes(item.id));
        tempValue = _.unionBy(value,tempValue,'id');
      }
      if(signedinUserRole === 'admin' && orgListlevel3.includes(signedinOrgType)){
        let value = ReportListSample.filter((item) => [8,9,11,15].includes(item.id));
        tempValue = _.unionBy(value,tempValue,'id');
      }
      if(signedinUserRole === 'caseworker' && orgListlevel4.includes(signedinOrgType)){
        tempValue = _.unionBy(ReportListSample,tempValue,'id');
      }
      tempValue = _.orderBy(tempValue,'id','asc');
      setReportList(tempValue);
    }
  }, [signedinOrgType, signedinUserRole]);

  useEffect(() => {
    document.title = "Reports | Miracle Foundation"
  }, [])

  return (
    <div>
      <>
        {/* <Helmet>
        <title>Dashboard: Customer List | Material Kit Pro</title>
      </Helmet> */}
        <Box
          sx={{
            backgroundColor: "background.default",
            minHeight: "100%",
            pt: 2, //new style
            //py: 8
          }}
        >
          <Container maxWidth={settings.compact ? "xl" : false}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography color="textPrimary" variant="h5">
                  {t("common:common.Reports")}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Card {...other}>
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    flexWrap: "wrap",
                    pt: 2,
                    //m: -1,
                    p: 2,
                  }}
                >
                  {/* <Box
          sx={{
            m: 1,
            maxWidth: '100%',
            width: 500
          }}
        >
          <TextField
            fullWidth
            InputProps={{
              startAdornment: 
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>,
              endAdornment: 
                 <IconButton
                color="inherit"
                >
                  <ClearIcon/>
                </IconButton>
            }}
            // onChange={handleQueryChange}
            placeholder={t('common:child.Search Child')}
            value={''}
            variant="outlined"
          />
        </Box> */}
                  {/* <Box
          sx={{
            m: 1,
            width: 240
          }}
        >
          <TextField
            label={t('common:common.Sort By')}
            name="sort"
            // onChange={handleSortChange}
            // select
            // SelectProps={{ native: true }}
            value={''}
            variant="outlined"
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {t(`common:common.${option.label}`)}
              </option>
            ))}
          </TextField>
        </Box> */}
                </Box>
                <Scrollbar>
                  <Box sx={{ minWidth: 700 }}>
                    {reportList && reportList.length > 0 && (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              {t("common:common.ReportName")}
                              {/* Report Name */}
                            </TableCell>
                            <TableCell align="right" sx={{ pl: 2 }}>
                              {t("common:common.Actions")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportList.map((customer) => {
                            return (
                              <TableRow
                                hover
                                key={customer.id}
                                onClick={() => {
                                  handleReport(customer);
                                }}
                              >
                                <TableCell> {t(`common:common.${customer.Name}`)}</TableCell>

                                <TableCell align="right">
                                  <Tooltip
                                    title={t("common:child.View Report")}
                                  >
                                    <IconButton
                                    // component={RouterLink}
                                    //value={customer.Name}
                                    // onClick={()=>{handleReport(customer)}}
                                    // to={`/dashboard/child/${customer.id}/view`}
                                    >
                                      <ArrowRightIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                    {customers && customers.length === 0 && (
                      <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
                        <Box>
                          <Grid container spacing={3}>
                            <Grid
                              item
                              md={3} //6
                              xs={6} //12
                            >
                              <Typography>
                                {t("common:common.No match")}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Scrollbar>
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
          </Container>
        </Box>
      </>
    </div>
  );
};
export default Reports;
