import { useState, useCallback, useEffect, useContext, useRef } from 'react';
import Chart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardHeader, CardActions, Checkbox, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import APIS from '../../../../common/hooks/UseApiCalls';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import _ from "lodash";
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';


const dataTemplate2 = {
  series: [
    {
      color: '#EF476F',
      name: 'This Organization',
      data: []
    },
  ],
  xaxis: {
    dataPoints: []
  }
}

// Helper: converts a raw score value to a chart-safe value.
// "-"  → null  (ApexCharts skips null points; tooltip will show "-")
// "0" or 0 → 0
// anything else → parseFloat(value)
const parseScore = (value) => {
  if (value === '-' || value === undefined || value === null) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};


const ReportsTrafficSources = (props) => {
  const { t } = useTranslation(['common']);
  const dataTemplate = {
    series: [
      {
        color: '#EF476F',
        name: t('common:common.Education Score'),
        data: []
      },
      {
        color: '#F78C6B',
        name: t('common:common.Family and Social Relationships Score'),
        data: []
      },
      {
        color: '#FFD166',
        name: t('common:common.Health and Mental Health Score'),
        data: []
      },
      {
        color: '#06D6A0',
        name: t('common:common.Household Economy Score'),
        data: []
      },
      {
        color: '#118AB2',
        name: t('common:common.Living Conditions Score'),
        data: []
      },
      {
        color: '#073B4C',
        name: t('common:common.Overall Score'),
        data: []
      },
    ],
    xaxis: {
      dataPoints: []
    }
  }
  const AvgArray = [
    t('common:common.Education Score'),
    t('common:common.Family and Social Relationships Score'),
    t('common:common.Health and Mental Health Score'),
    t('common:common.Household Economy Score'),
    t('common:common.Living Conditions Score'),
    t('common:common.Overall Score')
  ];
  const { title, chartData1, payload, isFamily = false, showCheckbox = true, showLabels = true, ...other } = props
  const { signedInOrgName, signedinOrgType, signedinUserRole, languageChange } = useContext(CommonDataContext);
  const theme = useTheme();
  const [chartData, setChartData] = useState(dataTemplate)
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [currentRoute, setCurrentRoute] = useState('');
  const [loading, setLoading] = useState(false)
  const latestRequestId = useRef(0);
  const navigate = useNavigate();

  const orgListlevel2 = ['1', '2', '3', '4', '5'];
  const userListLevel1 = ['superadmin', 'admin'];

  const parseData = (data) => {
    let parsedData = _.cloneDeep(dataTemplate);
    if (data.length === 0) {
      parsedData.series[0].name = t('common:common.Education Score');
      parsedData.series[1].name = t('common:common.Family and Social Relationships Score');
      parsedData.series[2].name = t('common:common.Health and Mental Health Score');
      parsedData.series[3].name = t('common:common.Household Economy Score');
      parsedData.series[4].name = t('common:common.Living Conditions Score');
      parsedData.series[5].name = t('common:common.Overall Score');
    } else {
      data.forEach(item => {
        // Use parseScore instead of parseFloat so "-" becomes null and "0" stays 0
        parsedData.series[0].data.push(parseScore(item?.EducationScore));
        parsedData.series[1].data.push(parseScore(item?.FamilyandSocialRelationshipsScore));
        parsedData.series[2].data.push(parseScore(item?.HealthAndMentalHealthScore));
        parsedData.series[3].data.push(parseScore(item?.HouseholdEconomyScore));
        parsedData.series[4].data.push(parseScore(item?.LivingConditionsScore));
        parsedData.series[5].data.push(parseScore(item?.OverallScore));
        parsedData.xaxis.dataPoints.push(item?.lastDate);
      });
      parsedData.series[0].name = t('common:common.Education Score');
      parsedData.series[1].name = t('common:common.Family and Social Relationships Score');
      parsedData.series[2].name = t('common:common.Health and Mental Health Score');
      parsedData.series[3].name = t('common:common.Household Economy Score');
      parsedData.series[4].name = t('common:common.Living Conditions Score');
      parsedData.series[5].name = t('common:common.Overall Score');
    }
    setChartData(parsedData);
    return parsedData;
  };

  const parseNewlyAdmittedData = (data) => {
    let parsedData = _.cloneDeep(dataTemplate2);
    if (data.length !== 0) {
      data.forEach(item => {
        parsedData.series[0].data.push(parseScore(item?.noOfChildren));
        parsedData.xaxis.dataPoints.push(item?.monthEndDateDateOfEntry);
      });
      parsedData.series[0].name = signedInOrgName;
    } else {
      parsedData.series[0].name = signedInOrgName;
    }
    setChartData(parsedData);
    setSelectedSeries([signedInOrgName]);
    return parsedData;
  };

  const parseReintegratedChildrenData = (data) => {
    let parsedData = _.cloneDeep(dataTemplate2);
    if (data.length !== 0) {
      data.forEach(item => {
        parsedData.series[0].data.push(parseScore(item?.noOfChildren));
        parsedData.xaxis.dataPoints.push(item?.monthEndDateOfLeaving);
      });
      parsedData.series[0].name = signedInOrgName;
    } else {
      parsedData.series[0].name = signedInOrgName;
    }
    setChartData(parsedData);
    setSelectedSeries([signedInOrgName]);
    return parsedData;
  };

  const getChildServed = useCallback(async (newPayload) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const payload = { ...newPayload, languageId: "1" };
      if (isFamily) payload.assessmentType = 'FAMILY';
      const response = await APIS.AverageThrivescaleReport(payload);
      if (latestRequestId.current === requestId) {
        parseData(response.data.message.data);
      }
    } catch (err) {
      if (latestRequestId.current === requestId) {
        setChartData(dataTemplate);
      }
      console.error(err);
    } finally {
      if (latestRequestId.current === requestId) setLoading(false);
    }
  }, [isFamily, dataTemplate, parseData]);

  const getNewlyAdmittedChildren = useCallback(async (newPayload) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const response = await APIS.NewlyAdmittedChildrenReport(newPayload);
      if (latestRequestId.current === requestId) {
        parseNewlyAdmittedData(response.data.message.dashboardData);
      }
    } catch (err) {
      if (latestRequestId.current === requestId) {
        setChartData(dataTemplate2);
      }
      console.error(err);
    } finally {
      if (latestRequestId.current === requestId) setLoading(false);
    }
  }, [dataTemplate2, parseNewlyAdmittedData])

  const getChildrenInCCI = useCallback(async (newPayload) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const response = await APIS.ChildrenInCCI(newPayload);
      if (latestRequestId.current === requestId) {
        parseNewlyAdmittedData(response.data.message.dashboardData);
      }
    } catch (err) {
      if (latestRequestId.current === requestId) {
        setChartData(dataTemplate2);
      }
      console.error(err);
    } finally {
      if (latestRequestId.current === requestId) setLoading(false);
    }
  }, [dataTemplate2, parseNewlyAdmittedData]);

  const getChildrenReintegrated = useCallback(async (newPayload) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const response = await APIS.ReintegratedChildren(newPayload);
      if (latestRequestId.current === requestId) {
        parseReintegratedChildrenData(response.data.message.dashboardData);
      }
    } catch (err) {
      if (latestRequestId.current === requestId) {
        setChartData(dataTemplate2);
      }
      console.error(err);
    } finally {
      if (latestRequestId.current === requestId) setLoading(false);
    }
  }, [dataTemplate2, parseReintegratedChildrenData]);

  useEffect(() => {
    if (localStorage.getItem('userRegion')) {
      if (chartData1 === 'chartData') {
        getChildServed(payload)
        setSelectedSeries(AvgArray)
        isFamily ? setCurrentRoute('/dashboard/reportAverageThriveScaleScoresFamilies') : setCurrentRoute('/dashboard/reportAverageThriveScoreChildren')
      } else if (chartData1 === 'dataTemplate') {
        getNewlyAdmittedChildren(payload)
        setSelectedSeries([signedInOrgName]);
        if (signedinOrgType !== null && signedinUserRole !== null) {
          let condition4 = !userListLevel1.includes(signedinUserRole);
          let condition5 = !orgListlevel2.includes(signedinOrgType);
          let condition6 = condition4 && condition5
          if (condition4 || condition5 || condition6) {
            setCurrentRoute('');
          } else {
            setCurrentRoute('/dashboard/reportsNewlyAddeddChildren')
          }
        }
      } else if (chartData1 === 'data') {
        if (payload && Object.keys(payload).length > 0) {
          getChildrenInCCI(payload);
        }
        setSelectedSeries([signedInOrgName]);
        if (signedinOrgType !== null && signedinUserRole !== null) {
          let condition4 = !userListLevel1.includes(signedinUserRole);
          let condition5 = !orgListlevel2.includes(signedinOrgType);
          let condition6 = condition4 && condition5
          if (condition4 || condition5 || condition6) {
            setCurrentRoute('');
          } else {
            setCurrentRoute('/dashboard/reportsChildrenInCCI')
          }
        }
      } else {
        if (payload && Object.keys(payload).length > 0) {
          getChildrenReintegrated(payload);
        }
        setSelectedSeries([signedInOrgName]);
        if (signedinOrgType !== null && signedinUserRole !== null) {
          let condition4 = !userListLevel1.includes(signedinUserRole);
          let condition5 = !orgListlevel2.includes(signedinOrgType);
          let condition6 = condition4 && condition5
          if (condition4 || condition5 || condition6) {
            setCurrentRoute('');
          } else {
            setCurrentRoute('/dashboard/ReintegratedChildren')
          }
        }
      }
    } else {
      return
    }
  }, [payload, languageChange, signedInOrgName])


  useEffect(() => {
    if (localStorage.getItem('userRegion')) {
      if (chartData1 === 'chartData') {
        getChildServed(payload)
        setSelectedSeries(AvgArray)
        setCurrentRoute('/dashboard/averageThriveScore')
      } else if (chartData1 === 'dataTemplate') {
        getNewlyAdmittedChildren(payload)
        if (signedinOrgType !== null && signedinUserRole !== null) {
          let condition4 = !userListLevel1.includes(signedinUserRole);
          let condition5 = !orgListlevel2.includes(signedinOrgType);
          let condition6 = condition4 && condition5
          if (condition4 || condition5 || condition6) {
            setCurrentRoute('');
          } else {
            setCurrentRoute('/dashboard/reportsNewlyAddeddChildren')
          }
        }
      } else if (chartData1 === 'data') {
        if (payload && Object.keys(payload).length > 0) {
          getChildrenInCCI(payload);
        }
        if (signedinOrgType !== null && signedinUserRole !== null) {
          let condition4 = !userListLevel1.includes(signedinUserRole);
          let condition5 = !orgListlevel2.includes(signedinOrgType);
          let condition6 = condition4 && condition5
          if (condition4 || condition5 || condition6) {
            setCurrentRoute('');
          } else {
            setCurrentRoute('/dashboard/reportsChildrenInCCI')
          }
        }
      } else {
        if (payload && Object.keys(payload).length > 0) {
          getChildrenReintegrated(payload);
        }
        if (signedinOrgType !== null && signedinUserRole !== null) {
          let condition4 = !userListLevel1.includes(signedinUserRole);
          let condition5 = !orgListlevel2.includes(signedinOrgType);
          let condition6 = condition4 && condition5
          if (condition4 || condition5 || condition6) {
            setCurrentRoute('');
          } else {
            setCurrentRoute('/dashboard/ReintegratedChildren')
          }
        }
      }
    } else {
      return
    }

  }, [localStorage.getItem('userRegion')])


  useEffect(() => {
    if (chartData1 !== 'chartData') {
      setSelectedSeries([signedInOrgName])
    }
  }, [signedInOrgName])

  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [chartData, selectedSeries])

  const handleChange = (event, name) => {
    if (!event.target.checked) {
      setSelectedSeries(selectedSeries.filter((item) => item !== name));
    } else {
      setSelectedSeries([...selectedSeries, name]);
    }
  };

  const chartSeries = showCheckbox
    ? chartData.series.filter((item) => selectedSeries.includes(item.name))
    : chartData.series;

  const chartOptions = {
    chart: {
      id: title,
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: chartSeries.map((item) => item.color),
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      show: false
    },
    markers: {
      hover: {
        size: undefined,
        sizeOffset: 2
      },
      radius: 2,
      shape: 'circle',
      size: 4,
      strokeWidth: 0
    },
    stroke: {
      curve: 'smooth',
      lineCap: 'butt',
      width: 3
    },
    // Show "-" in tooltip for null values instead of nothing
    tooltip: {
      y: {
        formatter: (value) => (value === null || value === undefined ? '-' : value)
      }
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        color: theme.palette.divider
      },
      axisTicks: {
        color: theme.palette.divider,
        show: true
      },
      categories: chartData.xaxis.dataPoints,
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: [
      {
        axisBorder: {
          color: theme.palette.divider,
          show: true
        },
        axisTicks: {
          color: theme.palette.divider,
          show: true
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary
          }
        }
      },
    ]
  };

  return (
    <Card {...other}>
      <CardHeader
        disableTypography
        title={(
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Typography
              color="textPrimary"
              variant="h6"
            >
              {title}
            </Typography>
            {/* <Tooltip title="Widget25 Source by channel">
              <InformationCircleIcon fontSize="small" />
            </Tooltip> */}
          </Box>
        )}
      />
      {!loading ? (<>
        {showLabels && (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              px: 2
            }}
          >
            {chartData.series.map((item) => (
              <Box
                key={item.name}
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  mr: 2
                }}
              >
                {showCheckbox &&
                  <Checkbox
                    checked={selectedSeries.some((visibleItem) => visibleItem === item.name)}
                    color="primary"
                    onChange={(event) => handleChange(event, item.name)}
                  />
                }
                <Box
                  sx={{
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    height: 8,
                    ml: 1,
                    mr: 2,
                    width: 8
                  }}
                />
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        <Chart
          height="390"
          // width="690"
          options={chartOptions}
          series={chartSeries}
          type="line"
        /></>) :
        <CircularProgress
          sx={{
            position: 'absolute',
            top: "55%",
            left: "45%"
          }}
          color='primary' />}
      <CardActions
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: 'background.default'
        }}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon fontSize="small" />}
          variant="text"
          disabled={currentRoute === ''}
          onClick={() => navigate(currentRoute, {
            state: {
              "fromDashboard": true,
            }
          })}
        // disabled={true}
        >
          {t('common:common.View Report')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ReportsTrafficSources;
