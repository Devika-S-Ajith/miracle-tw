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

const ChildStatus = (props) => {

  const { title, data, payload, res, ...other } = props;
  const { signedinOrgType, signedinUserRole } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const [chartSeries, setChartSeries] = useState([])
  const [currentRoute, setCurrentRoute] = useState('');
  const orgListlevel2 = ['1', '2', '3', '4', '5']
  const userListlevel2 = ['admin']


  let chartOptions2 = {
    chart: {
      id: 2,
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: [
      '#C0392B', '#FFB547', '#7BC67E'
    ],
    dataLabels: {
      enabled: false
    },
    labels: [t('common:common.Orphan'), t('common:common.Semi-Orphan'), t('common:common.Economic Orphan')],
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
    for (var item in value) {
      labelArray.push(item);
      valueArray.push(parseInt(value[item]));
    }
    chartOptions2.labels = labelArray;
    setChartSeries(valueArray);
  }


  useEffect(() => {
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
        setCurrentRoute('/dashboard/reportsChildStatus')
      }
    }

  }, [signedinOrgType, signedinUserRole])


  return (
    <Card {...other} sx={{ mt: 1 }}>
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
          options={chartOptions2}
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
          onClick={() => navigate('/dashboard/reportsChildStatus', {
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

export default ChildStatus;
