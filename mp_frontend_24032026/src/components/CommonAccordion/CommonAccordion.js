import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BodyText from '../BodyText/BodyText';

const CommonAccordion = ({ title, children, defaultOpen = false, expandIconPosition = 'left' }) => {
  const [expandedAdditional, setExpandedAdditional] = useState(false);

  return (
    <Accordion
      expanded={expandedAdditional || defaultOpen}
      onChange={() => setExpandedAdditional(!expandedAdditional)}
      sx={{
        boxShadow: 'none',
        '&:before': { display: 'none' },
        border: 'none',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 0,
          minHeight: 48,
          flexDirection: expandIconPosition === 'left' ? 'row-reverse' : 'row', // 👈 move icon based on prop
          '& .MuiAccordionSummary-content': {
            margin: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            marginRight: expandIconPosition === 'left' ? 1 : 0, // spacing between icon & text

            marginLeft: 0,
          },
        }}
      >
        <BodyText value={title} fontWeight={600} />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default CommonAccordion;