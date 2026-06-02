import React from 'react';
import { Box, TextField, Tooltip, Typography, InputAdornment } from '@mui/material';
import InformationCircleIcon from '@mui/icons-material/InfoOutlined'; // Adjust import based on your icon library
import CustomFieldLabel from './CustomFieldLabel';

const TextFieldWithExternalLabel = ({
    label,
    tooltipText,
    name,
    id,
    error,
    helperText,
    value,
    onChange,
    onBlur,
    placeholder = "",
    autoFocus = false,
    fullWidth = true,
    variant = "outlined",
    labelVariant = "body2",
    showTooltip = false,
    required = false,
    size = "medium",
    color = 'inherit',
    multiline = false,
    enableInlineError = false,
    isTouched = false,
    submitCount = 0,
    ...textFieldProps
}) => {

    const showFieldError = Boolean(error) && (Boolean(isTouched) || submitCount > 0);

    return (
        <Box sx={{ width: '100%' }}>
            {label && (
                <Box sx={{ marginBottom: 1 }}>
                    <CustomFieldLabel>
                        {required ? `${label}*` : label}
                    </CustomFieldLabel>
                </Box>
            )}
            <TextField
                error={showFieldError}
                size={size}
                multiline={multiline}
                fullWidth={fullWidth}
                autoFocus={autoFocus}
                helperText={!enableInlineError && showFieldError ? helperText : ''}
                name={name}
                id={id || name}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                variant={variant}
                InputLabelProps={{ shrink: false }}
                placeholder={enableInlineError && showFieldError ? helperText : placeholder}
                InputProps={{
                    sx: {
                        backgroundColor: color,
                        '& .MuiInputBase-input::placeholder': {
                            color: enableInlineError && showFieldError ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
                            opacity: 1,
                        },
                    },
                    endAdornment: showTooltip && tooltipText ? (
                        <InputAdornment position="end">
                            <Tooltip title={tooltipText}>
                                <InformationCircleIcon
                                    sx={{ cursor: 'pointer' }}
                                    fontSize="small"
                                />
                            </Tooltip>
                        </InputAdornment>
                    ) : null,
                    ...textFieldProps.InputProps
                }}
                {...textFieldProps}
            />
        </Box>
    );
};

export default TextFieldWithExternalLabel;