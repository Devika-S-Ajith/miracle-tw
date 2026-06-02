import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

const PreAssessmentSkelton = () => {
	return (
		<Box sx={{ p: 2 }} mt>
            <Skeleton variant="rectangular" width={200} height={30} sx={{ borderRadius: 1, mx: 'auto' }} />
			<Grid container spacing={2} mt>
				<Grid item xs={12} md={6}>
					<Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
				</Grid>
				<Grid item xs={12} md={6}>
					<Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
				</Grid>

				<Grid item xs={12}>
					<Skeleton variant="rectangular" height={90} sx={{ borderRadius: 1 }} />
				</Grid>
			</Grid>
		</Box>
	);
};

export default PreAssessmentSkelton;
