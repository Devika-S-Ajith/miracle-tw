import React from 'react'
import { Box, Skeleton, Stack } from '@mui/material'

const AssessmentStepIndicatorSkelton = () => {
  return (
    <Box sx={{ width: '100%', py: 1, px: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {[...Array(8)].map((_, index) => (
          <React.Fragment key={index}>
            <Stack spacing={0.75} alignItems="center" sx={{ minWidth: 72 }}>
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="text" width={80} height={18} />
            </Stack>

            {index < 7 && (
              <Skeleton
                variant="rounded"
                width="100%"
                height={4}
                sx={{ flex: 1, borderRadius: 10 }}
              />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  )
}

export default AssessmentStepIndicatorSkelton
