import React from 'react';
import { Radar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import EducationInAssessment from '../../../../assets/icons/EducationInAssessment';
import LivingConditionInAssessment from '../../../../assets/icons/LivingConditionInAssessment';
import HouseholdEconomyInAssessment from '../../../../assets/icons/HouseholdEconomyInAssessment';
import HealthMentalInAssessment from '../../../../assets/icons/HealthMentalInAssessment';
import FamilySocialRelationship from '../../../../assets/icons/FamilySocialRelationship';
const data = {
  labels: ['Family and Social Relationships', 'Household Economy', 'Living Conditions', 'Education', 'Health and Mental Health'],
  datasets: [
    {
      label: '12/08/2005',
      data: [100, 90, 73, 50, 82],
      borderColor: '#FFA500',
      borderWidth: 2,
      fill: false
    },
    {
      label: '10/10/2010',
      data: [70, 80, 83, 70, 92],
      borderColor: '#0000FF',
      borderWidth: 2,
      fill: false
    },
    {
      label: '19/11/2000',
      data: [20, 30, 43, 35, 48],
      borderColor: '#F44336',
      borderWidth: 2,
      fill: false
    },
    {
      label: 'Goals',
      data: [100, 100, 100, 100, 100,],
      borderColor: '#4CBB17',
      borderWidth: 2,
      fill: false
    }
  ],
};

const options = {
  scale: {
    r: {
      angleLines: {
        color: 'rgb(210, 210, 210)',
      },
      grid: {
        color: 'rgb(210, 210, 210)'
      }
      , ticks: {
        min: 15,
        max: 100,
        stepSize: 10,
        beginAtZero: true,
        showLabelBackdrop: false,
        backdropColor: "rgba(203, 197, 11, 1)"
      },
      suggestedMin: 0,
      suggestedMax: 100
    }
  }
  // scale: {
  //     pointLabels: {
  //       font:{
  //       family: "Font Awesome 5 Free",
  //       }
  //     }
  //   }
  // scale: {
  //   ticks: {
  //     min: 15,
  //     max: 100,
  //     stepSize: 10,
  //     beginAtZero:true,
  //     showLabelBackdrop: false,
  //     backdropColor: "rgba(203, 197, 11, 1)"
  //   },
  //   angleLines: {
  //     color: "rgba(255, 255, 255, .3)",
  //     lineWidth: 5
  //   },
  //   gridLines: {
  //     color: "rgba(210, 210, 210, .3)",
  //     circular: true
  //   }
  // }
};

const RadarChart = (props) => {
  const { t } = useTranslation(['common']);
  const { getScoreList, dateOfAssessment } = props;
  const datearray = dateOfAssessment && dateOfAssessment.split('-');
  const newDateOfAssessment = datearray && datearray[2] + '-' + datearray[1] + '-' + datearray[0];
  const scoreData = {
    labels: [` ${t('common:assessment.Family and Social Relationships')}`, `${t('common:assessment.Household Economy ')}`, `${t('common:assessment.Living Conditions')}`, `   ${t('common:assessment.Education')}   `, `${t('common:assessment.Health and Mental Health')}`],
    // labels: ['\uf119', '\uf2b9', '\uf14a', '\uf0e0', '\uf20a'],
    // labels: ['\uf2b5', '\uf3d1', '\uf14a', '\uf2b5','\uf004'],
    datasets: [
      {
        label: dateOfAssessment,
        data: getScoreList,
        borderColor: '#FFA500',
        borderWidth: 2,
        fill: false
      },
      {
        label: 'Goal',
        data: [100, 100, 100, 100, 100,],
        borderColor: '#4CBB17',
        borderWidth: 2,
        fill: false
      }
    ],
  };
  return (
    <>
      {getScoreList ?
        <Box sx={{
          width: "500px",
          height: "500px",
          ml: "60px",
          mt: 1,
          mb: 1
        }}>
          <FamilySocialRelationship />
          <HealthMentalInAssessment />
          <HouseholdEconomyInAssessment />
          <EducationInAssessment />
          <LivingConditionInAssessment />
          <Radar data={getScoreList ? scoreData : data} options={options} />
        </Box>
        :
        <Box>
          <Radar data={data} options={options} />
        </Box>
      }
    </>
  )
}
export default RadarChart;
