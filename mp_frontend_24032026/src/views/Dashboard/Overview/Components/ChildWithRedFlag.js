import React from 'react'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
function ChildwithRedFlag() {
	const navigate = useNavigate();
	const handleReport = () => {
		navigate('/dashboard/reportsChildRedFlag');
	}
	return (
		<div>
			<Card>
				<Typography
					color="textPrimary"
					variant="h6"
					sx={{ ml: 2, mt: 2 }}
				>
					Red Flags
				</Typography>
				<CardContent>
					<Typography variant="h1" color="primary" component="div" align="center" sx={{ fontSize: 200 }}>
						25
					</Typography>

				</CardContent>
				<CardActions
					sx={{
						px: 2,
						py: 1.5,
						backgroundColor: 'background.default'
					}}>
					<Button endIcon={<ArrowRightIcon fontSize="small" />} onClick={handleReport}>View Report</Button>
				</CardActions>
			</Card>
		</div>
	)
}

export default ChildwithRedFlag
