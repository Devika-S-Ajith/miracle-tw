import React, { useState } from "react"
import {
	Box,
	Card,
	Grid,
	Typography,
	Button,
	Container
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	input: {
		position: 'relative',
		border: '2px solid grey',
		fontSize: 16,
		borderRadius: '4px',
		fontWeight: "bold",
		disableUnderline: true,
		"&::placeholder": {
			textAlign: "center",
		},
	},
}));


const ConfirmOperation = () => {
	const { t } = useTranslation(['common']);
	const classes = useStyles();
	const navigate = useNavigate();
	const [formName, setFormName] = useState('')


	const handleConfirmPublishForm = () => {
		navigate('/dashboard/forms/formsuccessfullypublished')
	}
	const handleNameChange = (e) => {
		setFormName(e.target.value)
	}
	return (
		<>
			<Box
				sx={{
					backgroundColor: 'background.default',
					pt: 2
				}}
			>
				<Container>
					<Box >
						<Card sx={{
							borderRadius: '8px', minHeight: '90vh',
							mt: 2,
						}}>
							<Box
								sx={{
									alignItems: 'center',
									position: 'absolute',
									top: '35%',
									left: '10%',
									textAlign: 'center',
									m: 2,
									width: '78%'
								}}
							>
								<Grid
									container
								>
									<Grid item md >
										<Box sx={{ mb: 2 }}>
											<Typography variant="h5" >Publish Form -----Name----- </Typography>
										</Box>
										<Box>
											<Typography variant="body1" >If you choose to move forward, this form will published and all further assessments will be completed for this form. You can unpublish the form at anytime</Typography>
										</Box>
										<Box
											sx={{
												mt: 5,
												textAlign: 'center'
											}}
										>
											<Typography>Are you sure you want to publish this form?</Typography>
											<Box sx={{ mt: 3, mb: 5 }}>
												<Button
													color="primary"
													style={{ borderRadius: 2 }}
													variant="outlined"
													size='small'
												>
													No,Cancel
												</Button>
												<Button
													color="primary"
													style={{ borderRadius: 2, marginLeft: 10 }}
													variant="contained"
													size='small'
													onClick={handleConfirmPublishForm}
												>
													Yes,Publish
												</Button>
											</Box>
										</Box>
									</Grid>
								</Grid>
							</Box>


						</Card>
					</Box>
				</Container>
			</Box>
		</>
	);
}

export default ConfirmOperation 
