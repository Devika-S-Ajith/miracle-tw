import React, { useEffect,useCallback,useState } from 'react';
import {
    Box,
    Divider,
    Card,
    CardHeader,
    Grid,Typography,CircularProgress
  } from '@material-ui/core';
import { Radar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import APIS from '../../../../common/hooks/UseApiCalls';
// import Education from '../../../../assets/icons/Education';
// import LivingCondition from '../../../../assets/icons/LivingCondition';
// import HouseholdEconomy from '../../../../assets/icons/HouseholdEconomy';
// import HealthMental from '../../../../assets/icons/HealthMental';
// import FamilySocialRelationship from '../../../../assets/icons/FamilySocialRelationship';
import moment from 'moment';
const color=['','#FFA500','#33FFEC','#66334f','#ff5393','#E033FF','#FFEC33','#427293'];
const RadarGraph =(props)=> {
  const {childId}=props;
  const { t } = useTranslation(['common']);  
  const graphDataTemplate =  {
    labels: [` ${t('common:assessment.Family and Social Relationships')}`, `${t('common:assessment.Household Economy ')}`, `${t('common:assessment.Living Conditions')}`, `   ${t('common:assessment.Education')}   `,`${t('common:assessment.Health and Mental Health')}`],
    datasets: [],
  };
  const [scoreData, setScoreData] = useState(graphDataTemplate);
  const [dataStatus, setDataStatus] = useState(false);
  const [loading,setLoading] = useState(true);

  const options = {
    scales:{
      r:{
        angleLines:{
          color:'rgb(120, 120, 120)',
        },
        grid:{
          color:'rgb(120, 120, 120)',
        },
        ticks: {
          min: 15,
          max: 100,
          stepSize: 10,
          beginAtZero:true,
          showLabelBackdrop: false,
          backdropColor: "rgba(203, 197, 11, 1)"
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  }
//use effect
  useEffect(() => {getChildThriveScore(childId);}, []);
  const getChildThriveScore =  useCallback(async(childId)=> {
    try {
      const data = await APIS.ScoreForEachChild(childId);  
      console.log({data});
      setLoading(false);
      if(data && data.length!==0 &&data.data.assessments.length!==0)
      {
        
      setDataStatus(true);
      getSorceData(data.data.assessments);
      }
      else{
        setDataStatus(false)
      }

      
    } catch (err) {
      console.error(err);

    }
  });
//function definition
  const getSorceData=(radardata)=>{
 
  if(radardata){
    let datasets = [];
    let total= [];
    let dataColor = color[0];
    let count=0;
    radardata.map((item, index) =>{
      total.push(item.totalScore);
      // console.log({total});
      let minData=Math.min(total);
        let domainData = item.domainScores.map(item => item.score);
        datasets.push({
            label :moment(item.dateOfAssessment).format('DD-MM-YYYY'),
            data:domainData,
            borderColor:(radardata.length===1|| minData===item.totalScore)? "#FF0000" :dataColor,
            borderWidth: 2,
            fill:false     
        });
        count= index % color.length;
        dataColor=color[count];
    });
    datasets.push({
      label:'Goal',
      data:[100,100,100,100,100],
      borderColor: '#4CBB17',
      borderWidth: 2,
      fill:false
    });
    setScoreData( {
        ...graphDataTemplate,
        "datasets" :datasets  
    });
  }

}

const image = new Image();
image.src = "/static/family_social_relationships.png";

const plugins = [{
  id: 'custom_labels',
  afterDraw: (chart, args) => {
    if (image.complete) {
      const scale = chart.scales.r;
      drawTextAtIndex(scale, 0, -15, -25, "/static/family_social_relationships.png");
      drawTextAtIndex(scale, 1, 0, -40, "/static/household_economy.png");
      drawTextAtIndex(scale, 2, 5, -60, "/static/living_conditions.png");
      drawTextAtIndex(scale, 3, -35, -60, "/static/education.png");
      drawTextAtIndex(scale, 4, -30, -40, "/static/health_mental_health.png");
    } else {
      image.onload = () => chart.draw();
    }
  },
  beforeInit(chart) {
    // Get reference to the original fit function
    const originalFit = chart.legend.fit;

    // Override the fit function
    chart.legend.fit = function fit() {
      // Call original function and bind scope in order to use `this` correctly inside it
      originalFit.bind(chart.legend)();
      // Change the height as suggested in another answers
      this.height += 100;
    }
  }
}]

function drawTextAtIndex(scale, index, a, b, srcText) {
  const offset = 36;
  const r = scale.drawingArea + offset;
  const angle = scale.getIndexAngle(index) - Math.PI / 2;
  const x = scale.xCenter + Math.cos(angle) * r;
  const y = scale.yCenter + Math.sin(angle) * r;
  const ctx = scale.ctx;
  ctx.save();
  ctx.translate(x, y);
  //ctx.rotate(angle + Math.PI / 2);
  ctx.textAlign = 'center';

  ctx.fillStyle = 'blue';
  ctx.font = '20px material-icons'
  const imagex = new Image();
  imagex.src = srcText
  ctx.drawImage(imagex, a, b, 30, 30);

  ctx.font = "12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
  ctx.fillStyle = 'black';
  // ctx.fillText('', 0, 15, 100, 100);
  ctx.restore();
}

const getRadarScoreData = () => {
  const updatedScoreData = {
    ...graphDataTemplate,
    datasets: scoreData.datasets
  }
  return updatedScoreData
}

    return (
            <Grid
                container
                spacing={3}
            >
              <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={12}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
              >
                <Card>
                    <CardHeader title ={t('common:common.Thrive scale score trend')}/>
                    {loading && <CircularProgress 
                      sx={{zIndex : 1000,
                            position : "absolute",
                            top : "55%",
                            left : "45%"}}
                      color="primary" />}
                          <Divider /> 
                          { dataStatus ?
                          
                    <Grid
                      item
                      md={12}
                      xs={12}
                      container
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      style={{marginTop: "1px"}}
                    >
                        <Box 
                        sx={{width :"600px",
                        height:"600px",
                        // ml:"500px",
                        // mt:1,
                        // mb:1
                        }}
                        >
                          {/* <FamilySocialRelationship/>
                          <HealthMental/>
                          <HouseholdEconomy/>
                          <Education/>
                          <LivingCondition /> */}
                         <Radar id="chart" data={getRadarScoreData()} options={options} plugins={plugins} />
                      </Box>
                    </Grid>:
                  <Box sx={{ width : "100%", ml : "40%", mt : 5,mb :5}}>
                    <Box>
                      {!loading &&
                        <Grid
                          container
                          spacing={3}
                        >
                              <Grid
                                item
                                md={3} //6
                                xs={6} //12
                                >
                                  <Typography>{t('common:common.No assessments done yet')}</Typography>
                              </Grid>
                        </Grid>
                      }
                    </Box>
                  </Box>}
               </Card>
              </Grid>
            </Grid>
            
            
    )
}

export default RadarGraph;
