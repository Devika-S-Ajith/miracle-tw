import React from 'react'
import { useTranslation } from 'react-i18next';
import {
	Box,
	Table,
	TableRow,
	TableCell,
	TableHead,
	TextField,
	Button
} from '@mui/material';
function ImportFileAddition(props) {
	const { t } = useTranslation(['common']);
	const { onFileSubmit, onSetFile, modulename } = props;
	let url = " ";
	if (modulename === "organization") {
		url = process.env.REACT_APP_IMPORT_TEMPLATE_BASE_URL + "template/OrganizationTemplate.csv"
	}
	else if (modulename === "child") {
		url = process.env.REACT_APP_IMPORT_TEMPLATE_BASE_URL + "template/ChildTemplate.csv"
	}
	else if (modulename === "family") {
		url = process.env.REACT_APP_IMPORT_TEMPLATE_BASE_URL + "template/FamilyTemplate.csv"
	}
	else if (modulename === "user") {
		url = process.env.REACT_APP_IMPORT_TEMPLATE_BASE_URL + "template/UserTemplate.csv"
	}

	const onFileHandler = () => {
		onFileSubmit();
	}
	const onGetFile = (item) => {
		onSetFile(item);
	}

	return (
		<div>
			<Box
				sx={{ m: 2, mt: 3 }}
			>
				<Table sx={{ mb: 4 }}>
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontSize: '15pt' }}>
								<b>{t('common:common.Please select a CSV file to import')}</b>
							</TableCell>
							<TableCell align="right">
								<Button color="primary" type="button" variant="contained" target="_blank" href={url}>{t('common:common.Download Import Template')}</Button>
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
							onGetFile(e.target.files[0])
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
							onFileHandler()
						}}>
						{t('common:assessment.Submit')}
					</Button>
				</form>
			</Box>
		</div>
	)
}



export default ImportFileAddition

