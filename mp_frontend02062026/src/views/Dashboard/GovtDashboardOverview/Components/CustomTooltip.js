import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Popper
} from '@mui/material';
import InCrisisFlag from '../../../../assets/icons/InCrisisFlag';
import VulnerableFlags from '../../../../assets/icons/VulnerableFlags';
import SmallText from '../../../../components/SmallText/SmallText';

const CustomTooltip = ({ active, payload, coordinate, chartRef }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (active && chartRef && chartRef.current) {
      setAnchorEl(chartRef.current);
    }
  }, [active, chartRef]);

  if (active && payload && payload.length && anchorEl && coordinate) {
    const data = payload[0].payload;
    return (
      <Popper
        open={active}
        anchorEl={anchorEl}
        placement="top-start"
        disablePortal={false}
        modifiers={[
          {
            name: 'offset',
            options: {
              // Offset the tooltip to appear near the hovered point
              offset: [coordinate.x - 320, coordinate.y - 60],
            },
          },
        ]}
        style={{ zIndex: 2000, pointerEvents: 'none' }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            minWidth: 280,
            maxWidth: 320,
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            boxShadow: 8,
            backgroundColor: theme => theme.palette.background.paper,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
            Assessment {data.key}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {data?.familyCount} Families | {data?.childrenCount} Children
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: "18px",
                height: "4px",
                backgroundColor:'#71C5D4',
                borderRadius: 0.5,
                mr: 1,
              }}
            />
            {data.value}%
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InCrisisFlag sx={{ mr: 1 }} />
              <SmallText value={`"In crisis" red flags: ${data?.responses?.redFlagInCrisis}`} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VulnerableFlags sx={{ mr: 1 }} />
              <SmallText value={`"Vulnerable" red flags:${data?.responses?.redFlagVulnerable}`} />
            </Box>
          </Box>
        </Paper>
      </Popper>
    );
  }
  return null;
};

export default CustomTooltip;