import React, { useCallback, useState, useEffect ,useContext} from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardHeader, Typography, } from '@material-ui/core';
import * as d3 from "d3";
// import "topojson-client";
// import Datamap from 'datamaps';
// import "../../../../assets/scripts/mapData.json"
import { StateMapPoints,StateMapPointsUSA,StateMapPointsUganda} from '../../../../assets/scripts/indiaStateLatlong';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import Datamap from 'react-datamaps'
let placeholderValue = []




const MapComponent = (props) => {
  const {mapCategory,countryData ,...other} = props		
  const { t } = useTranslation(['common']);
  const {userRegion} = useContext(CommonDataContext);
  const [stateData, setStateData ] = useState(placeholderValue)


const setProjection =(element) => {
	let centerCordinate =[]
	let translateValue =[]
	let scaleValue = 0
	if(userRegion.toLowerCase()==='india'){
	   centerCordinate=[78.9629, 23.5937]
	   translateValue =[200, 200]
	   scaleValue = 700
	}
	   else{
		if (countryData == 2) {
			centerCordinate = [32.2903, 1.3733];
			translateValue =[400, 300]
			scaleValue =4000
		  
		}else{
		   centerCordinate=[-98.5795, 39.8283]
		   translateValue =[450, 400]
		   scaleValue = 300
		}
	   }
	    

   const projection = d3.geoMercator()
	   .center(centerCordinate)
	   .scale(scaleValue).translate(translateValue);
   const path = d3.geoPath()
	   .projection(projection);

    return { path: path, projection: projection };
}



const parseStateData = (ApiData) => {
	let arrayToTraverse = []
	if(userRegion.toLowerCase()=='india'){
		arrayToTraverse = StateMapPoints.States;
	} else {
		if (countryData == 1) {
			arrayToTraverse = StateMapPointsUSA.States;
		} else {
			arrayToTraverse = StateMapPointsUganda.States;
		}
}
	
	let NewArray = [];
	// arrayToTraverse.forEach(item => {
	// 	let newItem = item;
	// 	newItem.fillKey= 'MAJOR'
	// 	NewArray.push(newItem)
	// });
	ApiData.forEach(item =>{
		const StateData = arrayToTraverse.find(({ state }) => state === item.state);
		if(StateData !== undefined){
			let combinedObject = { ...StateData, ...item}
			combinedObject.fillKey='MAJOR'
			NewArray.push(combinedObject)
		}
	})
	// console.log(NewArray);
	// console.log(placeholderValue)
	const fixedRadius = 10;

	const processedData = NewArray.map(item => ({
		fillKey: "MAJOR",
		latitude: item.latitude,
		longitude: item.longitude,
		state:item.state,
		count:item.radius,
		radius:Math.min(item.radius, 20), // Add a property to store the fixed radius
	}));
	

	setStateData(processedData)

}

const getChildServeApi= useCallback(async(mapCategory)=>{
	try{
		// console.log(mapCategory)
		let finalPayload = {
			"entity":mapCategory
		}
		finalPayload.HTCountryId = countryData
		// console.log("final payload >>",finalPayload)
		await APIS.MapDashboardData(finalPayload).then((resp)=>{
			if(resp && resp.data){
				parseStateData(resp.data.States)
				// console.log("page count ",resp.data.pageCount)
				// console.log({pageCount})
			}else{
				// console.log("else");
			}
	})
	}
	catch(err){
		console.log("error catch");
	  }
})

useEffect(()=>{
	if(localStorage.getItem('userRegion')){
		getChildServeApi(mapCategory)
	}else{
		return
	}
	//parseStateData()
},[])

useEffect(()=>{
	if (localStorage.getItem('userRegion')) {
		getChildServeApi(mapCategory)
	}else{
		return
	}
	// parseStateData()
},[localStorage.getItem('userRegion')])

useEffect(()=>{
	if (countryData) {
		getChildServeApi(mapCategory)
	}else{
		return
	}
	// parseStateData()
},[countryData])



	const getGeoJson = () => {
		if (userRegion.toLowerCase() === 'india') {
			return 'https://rawgit.com/Anujarya300/bubble_maps/master/data/geography-data/india.topo.json'
		}
		else
		{
			if (countryData == 2) {
				
				return '/static/uganda-with-regions.topojson'
			} else {
				return 'https://rawgit.com/Anujarya300/bubble_maps/master/data/geography-data/usa.topo.json'
			}
		} 
	}


  
  
  return(
<>
{
    <Card {...other} sx={{height:'42rem'}} >
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
          {mapCategory === 'child' && <Typography
            color="textPrimary"
            variant="h6"
          >
            {t("common:common.Child Map")}
          </Typography>}
		  {mapCategory === 'org' && <Typography
            color="textPrimary"
            variant="h6"
          >
            {t('common:common.Organization Map')}
          </Typography>}
        </Box>
      )}
    />
    <Datamap
					scope={userRegion.toLowerCase()==='india'?userRegion.toLowerCase():countryData==1?'usa':'uganda'}
					responsive
					setProjection={setProjection}
					fills={{
						MAJOR: '#306596',
                		MEDIUM: '#0fa0fa',
                		MINOR: '#bada55',
                		defaultFill: '#dddddd'
					}}
					geographyConfig={{
						borderColor: '#444',
						borderWidth: 0.5,
						dataUrl:getGeoJson()
					}}
					//data={{stateData}}
					bubbles={stateData}
					bubbleOptions={{
						borderWidth:4,
						borderColor:'#306596',
						highlightBorderWidth:4,
						highlightFillColor:'#306596',
						highlightBorderColor:'#306596',
						popupTemplate: (geo, data) =>
							`<div class="hoverinfo">${data.state}: ${data.count}`
					}}
				/>

    </Card>
}
</>
)}
export default MapComponent;
