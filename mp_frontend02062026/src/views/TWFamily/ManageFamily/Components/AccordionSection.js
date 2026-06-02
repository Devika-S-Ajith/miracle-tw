import React from 'react';
import { Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormSectionHeading from './FormSectionHeading';

const AccordionSection = ({
    title,
    children,
    defaultExpanded = false,
    gridProps = { md: 12, xs: 12},
    accordionProps = {},
    summaryProps = {},
    detailsProps = {},
    showExpandIcon = true,
    expandIcon = <ExpandMoreIcon sx={{
        // Default (Collapsed) state: Pointing Left
        transition: '0.2s',
        transform: 'rotate(270deg)'
    }} />,
}) => {
    return (
        <Grid item {...gridProps}>
            <Accordion
                defaultExpanded={defaultExpanded}
                elevation={0}
                disableGutters
                sx={{
                    '&:before': {
                        display: 'none',
                    },
                    '&.Mui-expanded': {
                        margin: 0,
                    },
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                        transform: 'rotate(90deg)', // 270 + 90 = 360/0 (Pointing Down)
      },
                    ...accordionProps.sx,
                }}
                {...accordionProps}
            >
                <AccordionSummary
                    expandIcon={showExpandIcon ? expandIcon : null}

                    sx={{
                        flexDirection: 'row-reverse',
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            marginRight: 1,
                        },
                        padding: 0,
                        minHeight: 'unset',
                        '&.Mui-expanded': {
                            minHeight: 'unset',
                        },
                        ...summaryProps.sx,
                    }}
                    {...summaryProps}
                >
                    {typeof title === 'string' ? (
                        <FormSectionHeading>{title}</FormSectionHeading>
                    ) : (
                        title
                    )}
                </AccordionSummary>
                <AccordionDetails
                    sx={{
                        padding: 0,
                        paddingTop: 1,
                        ...detailsProps.sx,
                    }}
                    {...detailsProps}
                >
                    {children}
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
};

export default AccordionSection;