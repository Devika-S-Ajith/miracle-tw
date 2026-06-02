import { useCallback, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  // Tooltip,
  Typography
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
// import InformationCircleIcon from '../../../../assets/icons/InformationCircle';
import { useTranslation } from 'react-i18next';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const ReportsSocialMediaSources = (props) => {

  const { title, data, payload, res, ...other } = props;
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const [chartSeries, setChartSeries] = useState([])
  const [currentRoute, setCurrentRoute] = useState('');
  const orgListlevel2 = ['1', '2', '3', '4', '5']
  const userListlevel2 = ['superadmin', 'admin']


  let chartOptions1 = {
    chart: {
      id: 1,
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: [
      'rgba(86, 100, 210, 0.5)', '#FFB547', '#7BC67E', '#64B6F7'
    ],
    dataLabels: {
      enabled: false
    },
    labels: [t('common:common.Intake'), t('common:common.Assessment'), t('common:common.Planning'), t('common:common.Case Closed')],
    legend: {
      fontSize: '14px',
      position: 'bottom',
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.subtitle2.fontWeight,
      itemMargin: {
        vertical: 8
      },
      labels: {
        colors: theme.palette.text.primary
      },
      markers: {
        width: 8,
        height: 8
      },
      show: true
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const parseApiData = (value) => {
    let labelArray = [];
    let valueArray = [];

    // value.forEach((item)=> {
    //   labelArray.push(item.placementStatus);
    //   valueArray.push(parseInt(item.noOfChildren))
    // });
    // if(value){
    for (var item in value) {
      // console.log(item);
      if (item != 'Follow up/Evaluate') {
        labelArray.push(item);
        valueArray.push(parseInt(value[item]));
      }
    }
    // }

    chartOptions1.labels = labelArray;
    setChartSeries(valueArray);
  }

  // const getNewlyAdmittedChildren = useCallback(async (newpayload) => {
  //   try {
  //     const response = await APIS.GetCaseManagement(newpayload);
  //     parseApiData(response.data.dashboardData)
  //     // setChartData(parseData(response.data.data))
  //     // if(response && response.status === 200 && response.data.hasOwnProperty('dataCount')){
  //     //   setNumberToShow(response.data.dataCount)
  //     // }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);


  useEffect(() => {
    parseApiData(res);
    // getNewlyAdmittedChildren(payload)
  }, [res])


  useEffect(() => {
    if (signedinOrgType !== null && signedinUserRole !== null) {
      let condition4 = !userListlevel2.includes(signedinUserRole);
      let condition5 = !orgListlevel2.includes(signedinOrgType);
      let condition6 = condition4 && condition5
      if (condition4 || condition5 || condition6) {
        setCurrentRoute('');
      } else {
        setCurrentRoute('/dashboard/reportsCaseManagement')
      }
    }

  }, [signedinOrgType, signedinUserRole])


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
            {/* <Tooltip title="Widget25 source by Social Media platforms">
              <InformationCircleIcon fontSize="small" />
            </Tooltip> */}
          </Box>
        )}
      />
      <CardContent>
        <Chart
          height={300}
          options={chartOptions1}
          series={chartSeries}
          type="donut"
        />
      </CardContent>
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
          onClick={() => navigate('/dashboard/reportsCaseManagement', {
            state: {
              "fromDashboard": true
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

export default ReportsSocialMediaSources;
