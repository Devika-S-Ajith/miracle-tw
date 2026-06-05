import React from 'react';
import { Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormSectionHeading from './FormSectionHeading';

const TOGGLE_TRIGGER_CLASS = 'accordion-toggle-trigger';

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
    const isExternallyControlled = accordionProps.expanded !== undefined;
    const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);

    const expanded = isExternallyControlled ? accordionProps.expanded : internalExpanded;

    const resolvedExpandIcon = React.useMemo(() => {
        if (!showExpandIcon || !expandIcon) {
            return null;
        }

        if (React.isValidElement(expandIcon)) {
            const existingClassName = expandIcon.props.className || '';

            return React.cloneElement(expandIcon, {
                className: `${TOGGLE_TRIGGER_CLASS} ${existingClassName}`.trim(),
            });
        }

        return <span className={TOGGLE_TRIGGER_CLASS}>{expandIcon}</span>;
    }, [expandIcon, showExpandIcon]);

    const handleChange = (event, newExpanded) => {
        const targetElement = event.target instanceof Element ? event.target : null;
        const isToggleTriggerClick = targetElement?.closest?.(`.${TOGGLE_TRIGGER_CLASS}`);

        if (!isToggleTriggerClick) {
            return;
        }

        accordionProps.onChange?.(event, newExpanded);

        if (!isExternallyControlled) {
            setInternalExpanded(newExpanded);
        }
    };

    return (
        <Grid item {...gridProps}>
            <Accordion
                {...accordionProps}
                expanded={expanded}
                onChange={handleChange}
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
            >
                <AccordionSummary
                    expandIcon={resolvedExpandIcon}

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
                    <span className={TOGGLE_TRIGGER_CLASS}>
                        {typeof title === 'string' ? (
                            <FormSectionHeading>{title}</FormSectionHeading>
                        ) : (
                            title
                        )}
                    </span>
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