import React, { useState, useCallback, useEffect } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Card,
	Table,
	TableRow,
	TableCell,
	TableHead,
	Stepper,
	Step,
	StepLabel,
	Button,
	MenuItem,
	TextField,
	CircularProgress,
	TableBody,
	Typography
} from '@mui/material';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
const AddOrganizationImport = () => {
	const [formPage, setFormPage] = useState(1);
	const [csvFile, setCsvFile] = useState(null);
	const [csvHeader, setCSVHeader] = useState([]);
	const [orgHeader, setOrgHeader] = useState([]);
	const [actualImportHeader, setActualImportHeader] = useState({ "mappedData": [] });
	const [selectedHeader, setSelectedHeader] = useState([]);
	const [loading, setLoading] = useState(false);
	const [required, setRequired] = useState([]);
	const [count, setCount] = useState(0);
	const [id, setId] = useState(null);
	const navigate = useNavigate();
	useEffect(() => {
		if (required.length === 0) {
			handleReq()
		}
	}, [loading]);
	const submit = () => {
		if (csvFile.type === "text/csv") {
			getSignedURL(csvFile);
			setFormPage(formPage + 1);
			console.log("csv ", csvFile);
		}
		else {
			toast.error("Please select file with CSV format");
		}

	}
	const handleReq = () => {
		let reqarray = [...required]
		orgHeader.map((item, index) => {
			if (item.isMandatory === true) {
				reqarray.push(index)

			}
		})
		setRequired(reqarray);
	}
	const handleFieldValue = (event, entityIndex, entityKey) => {
		let data = event.target.value;
		onActualImportHandler(data, entityIndex, entityKey)
		let array = [...selectedHeader]
		let flag = false;
		required.map((item) => {
			if (item === entityIndex) {
				if (count !== required.length) {
					setCount(count + 1)
				}
				array.forEach((item, i) => {
					if (item.key === entityIndex) {
						array[i] = { key: entityIndex, value: data };
						flag = true;
					}
				})
				if (!flag) {
					array.push({ key: entityIndex, value: data });
				}
			}
			else {
				array.forEach((item, i) => {
					if (item.key === entityIndex) {
						array[i] = { key: entityIndex, value: data };
						flag = true;
					}
				})
				if (!flag) {
					array.push({ key: entityIndex, value: data });
				}
			}
		})
		setSelectedHeader(array);

	}
	const onActualImportHandler = (csvCurrentData, entityIndex, entityKey) => {
		let flag = false;
		let actualImportData = { ...actualImportHeader }
		actualImportData.mappedData.forEach((item) => {
			if (item.csvProperty.id === entityIndex) {
				item.csvProperty.csvKey = csvCurrentData;
				flag = true;
			}
		})
		if (!flag) {
			actualImportData["documentId"] = id;
			actualImportData.mappedData.push({
				"csvProperty":
				{
					"id": entityIndex,
					"csvKey": csvCurrentData
				}, "entityProperty":
				{
					"entityKey": entityKey
				}
			});

		}
		setActualImportHeader(actualImportData);
	}
	const handleNextPage = () => {
		actualImport(actualImportHeader)
		setFormPage(formPage + 1)
	}

	const handleCancel = () => {
		setSelectedHeader([])
		setCount(0)
	}

	const getSignedURL = useCallback(async (value) => {
		setLoading(true);
		try {
			let finalPayload = {
				moduleType: 'organization',
				documentType: 'csv',
				fileName: `${value.name}`,
				fileSize: `${value.size / 1024}`,
				description: `csvfile`
			}
			const data = await APIS.UploadCSVFile(finalPayload);
			if (data.status === 200) {
				fileUpload(value, data.data.signedUrl, data.data.id);
			} else {
				console.log('An Error occurred');
			}
		} catch (err) {
			console.error(err);
		}
	}, [csvFile]);

	const fileUpload = useCallback(async (selectedFile, signedURL, id) => {
		let config = {
			transformRequest: [(data, headers) => {
				delete headers.common.Authorization;
				return data
			}]
		};
		config.headers = {
			'Content-Type': 'text/csv'
		}
		config.method = "PUT";
		config.url = signedURL;
		config.data = selectedFile;
		const res = await axios(config)
		console.log("response of file upload", res);
		getHeaderValue(id);
	})
	const getHeaderValue = useCallback(async (id) => {
		setId(id);
		try {
			const data = await APIS.CSVDataBinding(id);
			if (data) {
				setCSVHeader(data.data.csvProperties);
				setOrgHeader(data.data.entityProperties);
				setLoading(false)
			} else {
				console.log('An Error occurred');
			}

		} catch (err) {
			console.error(err);
		}

	}, [csvFile]);

	const actualImport = useCallback(async (actualImportHeader) => {
		console.log({ actualImportHeader })
		try {
			const data = await APIS.SaveCsvFile(actualImportHeader);
			console.log('data inside api call for actual import', data)
			if (data) {
				toast.success("Import Started Successfully");

			} else {
				console.log('An Error occurred for actual import ');
			}

		} catch (err) {
			console.error(err);
		}
	})

	return (
		<Box>
			<Card>
				<Box
					sx={{ m: 2, mt: 3 }}
				>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontSize: '18pt' }}>
									Data Import Wizard
								</TableCell>
							</TableRow>
						</TableHead>
					</Table>
					{formPage !== 4 &&
						<Box sx={{ width: '100%', marginTop: '30px', marginBottom: '20px', overflow: 'auto' }}>
							<Stepper activeStep={formPage - 1} alternativeLabel>
								<Step key="Upload Data" >
									<StepLabel >Upload Data</StepLabel>
								</Step>
								<Step key="Edit Mappings" >
									<StepLabel>Edit Mappings</StepLabel>
								</Step>
								<Step key="Start Import" >
									<StepLabel >Start Import</StepLabel>
								</Step>
							</Stepper>
						</Box>

					}

				</Box>

			</Card>
			<Card sx={{ mt: 3 }}>
				{formPage === 1 &&
					<Box
						sx={{ m: 2, mt: 3 }}
					>
						<Table sx={{ mb: 4 }}>
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontSize: '15pt' }}>
										Please select a CSV file to import
									</TableCell>
								</TableRow>
							</TableHead>
						</Table>
						<form id='csv-form'>
							<TextField

								type='file'
								accept='.csv'
								id='csvFile'
								onChange={(e) => {
									setCsvFile(e.target.files[0])
								}}
							>
							</TextField>
							<Button
								color="primary"
								sx={{ width: 150, height: 40, m: 2 }}
								type="button"
								variant="contained"
								onClick={(e) => {
									e.preventDefault()
									if (csvFile) submit()
								}}>
								Submit
							</Button>
						</form>
					</Box>
				}
				{formPage === 2 &&
					<Box>
						<Box
							sx={{ m: 2, mt: 3 }}
						>
							<Table>
								<TableHead>
									<TableRow sx={{ fontSize: '15pt' }}>
										<TableCell sx={{ fontSize: '15pt', mb: 2 }}>
											Edit Mappings
										</TableCell>
										<TableCell />
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										<TableCell >
											<Typography color="black" variant="h6" sx={{ ml: 2, mb: 1 }}>Organization Field</Typography>
											{/* <TextField inputProps={{style: {fontSize: '12pt',fontWeight:"bold"}}} InputProps={{ disableUnderline: true }} sx={{ml:1}} value="User Field" variant="standard"/> */}
										</TableCell>
										<TableCell >
											<Typography color="black" variant="h6" sx={{ ml: 4, mb: 1 }}>CSV Field</Typography>
											{/* <TextField inputProps={{style: {fontSize: '12pt',fontWeight:"bold"}}} InputProps={{ disableUnderline: true }} sx={{ml:4}}value="CSV Field" variant = "standard"/> */}
										</TableCell>
										{/* <TableCell/> */}
									</TableRow>
									{orgHeader && orgHeader.map((item, index) => (
										<TableRow key={index} sx={{ mt: 2 }}>
											<TableCell>
												{item.isMandatory ?
													<Typography sx={{ width: 500, m: 1 }}>{item.entityLabel + " *"}</Typography>
													:
													<Typography sx={{ width: 500, m: 1 }}>{item.entityLabel}</Typography>
												}
											</TableCell>
											<TableCell>
												{csvHeader &&
													<TextField sx={{ width: 500, m: 1 }} fullWidth
														onChange={(event) => handleFieldValue(event, index, item.entityKey)}
														//name={item.entityLabel} 
														// value={selectedHeader.mappedData.length > 0 ?()=>{
														//    // console.log(selectedHeader.mappedData)
														//   return "organizationName" 
														// }: 0}
														name={item.entityLabel}
														value={selectedHeader.length > 0 ? selectedHeader.find(ele => ele.key === index) !== undefined ?
															selectedHeader.find(ele => ele.key === index).value : "" : ""}
														// name={selectedHeader.length > 0 ? selectedHeader.find(ele=>ele.key===index)?.value :''}
														// value={selectedHeader.length > 0 ? selectedHeader.find(ele=>ele.key===index)?.value :''}
														// value={selectedHeader.mappedData.length > 0 ? selectedHeader.mappedData.find(ele=>ele.csvProperty.id===index) !== undefined ?
														// selectedHeader.mappedData.find(ele=>ele.csvProperty.id===index) : "" : ""}
														//value="organizationName"
														label="Select from options"
														select
													>
														{csvHeader.length > 0 && csvHeader.map((option) => (
															<MenuItem key={option.id}
																value={option.csvKey}>
																{option.csvKey}
															</MenuItem>
														))
														}
													</TextField>
												}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							{loading && <CircularProgress
								sx={{
									zIndex: 1000,
									position: "absolute",
									top: "80%",
									left: "45%"
								}}
								color="primary" />
							}
						</Box>
						<Box sx={{ mb: 2 }}>
							{loading === false && <Typography color="red" variant="subtitle2" sx={{ ml: 4, mb: 2 }}>All fields marked * are to be filled</Typography>}
							<Button
								color="primary"
								sx={{ width: 200, ml: 4 }}
								disabled={selectedHeader <= 0 ? true : false || count === required.length ? false : true}
								variant="contained"
								onClick={() => handleNextPage()}
							>
								Next
							</Button>
							<Button
								color="primary"
								sx={{ width: 200, ml: 21 }}
								type="reset"
								disabled={selectedHeader <= 0 ? true : false}
								variant="contained"
								onClick={handleCancel}
							>
								Cancel
							</Button>
						</Box>
					</Box>
				}
				{formPage === 3 &&
					<Box
						sx={{ m: 2, mt: 3 }}
					>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontSize: '15pt' }}>
										Start Import
									</TableCell>
								</TableRow>
							</TableHead>
						</Table>
						<br></br>
						Your data has been sucessfully uploaded and your fields have been mapped. If you are ready to begin the import process,please select the CONTINUE button below.
						<br></br>
						<Button
							color="primary"
							sx={{ width: 150, height: 40, m: 2 }}
							type="button"
							variant="contained"
							onClick={() => navigate(-1)}
						>
							Continue
						</Button>

					</Box>
				}
			</Card>
		</Box>

	)
}
export default AddOrganizationImport
