import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardHeader, Typography, } from '@mui/material';
import { StateMapPoints, StateMapPointsUSA, StateMapPointsUganda } from '../../../../assets/scripts/indiaStateLatlong';
import APIS from '../../../../common/hooks/UseApiCalls';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
let placeholderValue = []

const MapComponent = (props) => {
	const { mapCategory, countryData, ...other } = props
	const { t } = useTranslation(['common']);
	const [stateData, setStateData] = useState(placeholderValue)
	const [HoveredState, setHoveredState] = useState(null)

	const setProjection = () => {
		let centerCordinate = []
		let translateValue = []
		let scaleValue = 0
		if (countryData == 1) {
			centerCordinate = [78.9629, 23.5937]
			translateValue = [200, 200]
			scaleValue = 950
		}
		else if (countryData == 2) {
			centerCordinate = [-98.5795, 39.8283]
			translateValue = [450, 400]
			scaleValue = 280

		} else {
			centerCordinate = [32.2903, 1.3733];
			translateValue = [400, 300]
			scaleValue = 4500

		}
		
		const projection = { scale: scaleValue, center: centerCordinate, translate: translateValue }
		return (projection);
	}

	const parseStateData = (ApiData) => {
		let arrayToTraverse = []
		if (countryData == 1) {
			arrayToTraverse = StateMapPoints?.States;
		} else if (countryData == 2) {
			arrayToTraverse = StateMapPointsUSA?.States;
		} else {
			arrayToTraverse = StateMapPointsUganda?.States;
		}


		let NewArray = [];
		// arrayToTraverse.forEach(item => {
		// 	let newItem = item;
		// 	newItem.fillKey= 'MAJOR'
		// 	NewArray.push(newItem)
		// });
		ApiData.forEach(item => {
			const StateData = arrayToTraverse.find(({ state }) => state === item.state);
			if (StateData !== undefined) {
				let combinedObject = { ...StateData, ...item }
				combinedObject.fillKey = 'MAJOR'
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
			state: item.state,
			count: item.radius,
			radius: Math.min(item.radius, 20), // Add a property to store the fixed radius
		}));
		setStateData(processedData)
	}

	const getChildServeApi = useCallback(async (mapCategory) => {
		try {
			// console.log(mapCategory)
			let finalPayload = {
				"entity": mapCategory
			}
			finalPayload.HTCountryId = countryData
			// console.log("final payload >>",finalPayload)
			await APIS.MapDashboardData(finalPayload).then((resp) => {
				if (resp && resp.data) {
					parseStateData(resp.data.message.States)
					// console.log("page count ",resp.data.pageCount)
					// console.log({pageCount})
				} else {
					// console.log("else");
				}
			})
		}
		catch (err) {
			console.log("error catch");
		}
	})

	useEffect(() => {
		if (countryData) {
			getChildServeApi(mapCategory)
		} else {
			return
		}
	}, [countryData])

	const getGeoJson = () => {
		if (countryData == 1) {
			return '/static/india.json'
		}
		else if (countryData == 2) {
			return '/static/usa.geojson'
		} else
			return '/static/uganda.json'
	}

	return (
		<>
			{
				<Card {...other} >
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
					<div style={{ width: '100%', height: '80vh' }}>
						<ComposableMap
							projection="geoMercator"
							projectionConfig={setProjection()}
							style={{ backgroundColor: 'white', width: '100%', height: '100%' }}
						>
							<Geographies
								geography={getGeoJson()}
							>
								{({ geographies }) =>
									geographies.map((geo, i) => (
										<Geography
											onMouseMove={() => setHoveredState(geo.properties.name)}
											onMouseLeave={() => setHoveredState(null)}
											style={{
												default: {
													fill: "#EEE",
													stroke: "#423e3e",
													strokeWidth: '0.5',
													outline: "none"
												},
												hover: {
													fill: "#F53",
													stroke: "#423e3e",
													strokeWidth: '0.5',
													outline: "none",
												},
												pressed: {
													fill: "#E42",
													stroke: "#423e3e",
													strokeWidth: '0.5',
													outline: "none"
												},
											}}
											key={geo.rsmKey}
											geography={geo}

										/>
									))
								}
							</Geographies>

							{stateData.map((bubble, index) => (
								<Marker key={index} coordinates={[bubble.longitude, bubble.latitude]}>
									<circle style={{ pointerEvents: 'none' }} r={bubble.radius} fill="rgba(2, 87, 245)" />
									{HoveredState && HoveredState === bubble.state &&
										<>
											<rect
												x={-bubble.state.length * 6}
												y={-12}
												width={bubble.state.length * 12}
												height={30}
												rx={5}
												style={{ pointerEvents: 'none' }}
												fill="rgba(0,0,0)"
											/>
											<text x={0} y={8} fontSize={15} textAnchor="middle" fill="#ffffff">
												{bubble.state}:{bubble.count}
											</text>
										</>
									}
								</Marker>
							))}
						</ComposableMap>
					</div>


				</Card>
			}
		</>
	)
}
export default MapComponent;
