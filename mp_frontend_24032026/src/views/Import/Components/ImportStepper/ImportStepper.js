import React from 'react'
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
function ImportStepper(props) {
	const { t } = useTranslation(['common']);
	const { formPage } = props;
	return (
		<Card>
			<Box
				sx={{ m: 2, mt: 3 }}
			>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontSize: '18pt' }}>
								<b>{t('common:common.Data Import Wizard')}
								</b>
							</TableCell>

						</TableRow>
					</TableHead>
				</Table>
				{formPage !== 4 &&
					<Box sx={{ width: '100%', marginTop: '30px', marginBottom: '20px', overflow: 'auto' }}>
						<Stepper activeStep={formPage - 1} alternativeLabel>
							<Step key="Upload Data" >
								<StepLabel >{t('common:common.Upload Data')}</StepLabel>
							</Step>
							<Step key="Edit Mappings" >
								<StepLabel>{t('common:common.Edit Mappings')}</StepLabel>
							</Step>
							<Step key="Start Import" >
								<StepLabel >{t('common:common.Start Import')}</StepLabel>
							</Step>
						</Stepper>
					</Box>
				}
			</Box>
		</Card>
	)
}

export default ImportStepper
