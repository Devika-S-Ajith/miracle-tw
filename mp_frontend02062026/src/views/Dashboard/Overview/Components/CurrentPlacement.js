import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const CurrentPlacement = (props) => {

  const { title, data, payload, res, ...other } = props;
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const [chartSeries, setChartSeries] = useState([])
  const [currentRoute, setCurrentRoute] = useState('');
  const orgListlevel2 = ['1', '2', '3', '4', '5']
  const userListlevel2 = ['admin']



  let chartOptions3 = {
    chart: {
      id: 3,
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: [
      '#C0392B', '#9B59B6', '#2980B9', '#1ABC9C', '#2ECC71', '#F1C40F', 'rgba(86, 100, 210, 0.5)', '#64B6F7', '#8E44AD'
    ],
    dataLabels: {
      enabled: false
    },
    labels: [
      t('common:common.Foster care'),
      t('common:common.Semi- independent living'),
      t('common:common.Parents/step parents'),
      t('common:common.Other'),
      t('common:common.Independent living'),
      t('common:common.Kinship'),
      t('common:common.CCI'),
      t('common:common.After care'),
      t('common:common.Group living')
    ],
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
    //   labelArray.push(item.currentPlacementStatus);
    //   valueArray.push(parseInt(item.noOfChildren))
    // });
    for (var item in value) {
      // console.log(item);
      labelArray.push(item);
      valueArray.push(parseInt(value[item]));
    }
    chartOptions3.labels = labelArray;
    setChartSeries(valueArray);



  }


  // const getCurrenPlacement = useCallback(async (newpayload) => {
  //   try {
  //     let finalPaylod = {...newpayload};
  //     finalPaylod.isCurrentPlacementStatus = "true"
  //     const response = await APIS.CurrentPlacement(finalPaylod);
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
    //getCurrenPlacement(payload);
    parseApiData(res)
  }, [res])


  useEffect(() => {
    if (signedinOrgType !== null && signedinUserRole !== null) {
      let condition4 = !userListlevel2.includes(signedinUserRole);
      let condition5 = !orgListlevel2.includes(signedinOrgType);
      let condition6 = condition4 && condition5
      if (condition4 || condition5 || condition6) {
        setCurrentRoute('');
      } else {
        setCurrentRoute('/dashboard/reportsCurrentPlacement')
      }
    }

  }, [signedinOrgType, signedinUserRole])


  return (
    <Card {...other} sx={{mt:1}}>
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
          </Box>
        )}
      />
      <CardContent>
        {chartSeries ? <Chart
          height={300}
          options={chartOptions3}
          series={chartSeries}
          type="donut"
        /> : <>No Data Available</>}
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
          onClick={() => navigate('/dashboard/reportsCurrentPlacement', {
            state: {
              "fromDashboard": true
            }
          })}
        >
          {t('common:common.View Report')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CurrentPlacement;
