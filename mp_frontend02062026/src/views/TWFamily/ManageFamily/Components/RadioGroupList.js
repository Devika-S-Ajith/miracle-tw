import React, { forwardRef } from 'react';
import {
    Box,
    Radio,
    RadioGroup,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    Typography,
    FormHelperText,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { formatDateMonthDayYear } from '../../../../helpers/helperFunction';
import { useImperativeHandle } from 'react';

const RadioGroupList = forwardRef(({
    name,
    onChange,
    options = [],
    renderPrimary,
    renderSecondary,
    error,
    helperText,
    disabled = false,
    row = false,
    sx = {},
    listSx = {},
    listItemSx = {},
}, ref) => {

    const [value, setValue] = React.useState('');

    useImperativeHandle(ref, () => ({
        getSelectedValue: () => value,
        getSelectedOption: () => options.find(opt => String(opt.id) === value)
    }));

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const defaultRenderPrimary = (option) => (
        <Typography variant="body1" fontWeight="medium">
            {option.firstName} {option.lastName}
        </Typography>
    );

    const defaultRenderSecondary = (option) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            {option.gender && (
                <Typography variant="body2" color="text.primary">
                    {option.gender}
                </Typography>
            )}
            {option.gender && option.dob && (
                <FiberManualRecordIcon sx={{ fontSize: 6, mx: 0.75, color: 'text.primary' }} />
            )}
            {option.dob && (
                <Typography variant="body2" color="text.primary">
                    {formatDateMonthDayYear(option.dob)}
                </Typography>
            )}
        </Box>
    );

    const primaryRenderer = renderPrimary || defaultRenderPrimary;
    const secondaryRenderer = renderSecondary || defaultRenderSecondary;

    return (
        <Box sx={sx} >
            <RadioGroup
                name={name}
                value={value ?? ''}
                onChange={(e) => {
                    handleChange(e);
                    if (onChange) onChange(e);
                }}
                row={row}
            >
                <List sx={{ width: '100%', pl: 0, ...listSx }}>
                    {options.map((option, index) => {
                        const optionValue = String(option.id);
                        const isChecked = value === optionValue;
                        return (
                            <ListItem
                                key={option.id || index}
                                sx={{
                                    pl: 0,
                                    py: 0,
                                    borderRadius: 1,
                                    ...listItemSx,
                                }}
                                disabled={disabled || option.disabled}
                            >
                                <FormControlLabel
                                    value={optionValue}
                                    control={
                                        <Radio
                                            disabled={disabled || option.disabled}
                                            checked={isChecked}
                                            onClick={(e) => {
                                                // If clicking the already-selected value, deselect it
                                                if (e.target.value === value) {
                                                    // Simulate a change event with empty value
                                                    const deselect = {
                                                        target: { name, value: '' }
                                                    };
                                                    handleChange(deselect);
                                                    if (onChange) onChange(deselect);
                                                }
                                            }}
                                            sx={{
                                                color: '#1D334B', // Red for the unchecked state
                                                '&.Mui-checked': {
                                                    color: '#1D334B', // Red for the checked state
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <ListItemText
                                            primary={primaryRenderer(option)}
                                            secondary={secondaryRenderer(option)}
                                        />

                                    }
                                    sx={{ width: '100%', m: 0 }}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </RadioGroup>
        </Box>
    );
});

export default RadioGroupList;