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
    characterLimit = 255,
    ...textFieldProps
}) => {

    const showFieldError = Boolean(error) && (Boolean(isTouched) || submitCount > 0);
    const normalizedValue = typeof value === 'string' ? value : String(value || '');
    const numericCharacterLimit = Number(characterLimit);
    const hasCharacterLimit = Number.isFinite(numericCharacterLimit) && numericCharacterLimit >= 0;
    const remainingCharacters = hasCharacterLimit ? numericCharacterLimit - normalizedValue.length : null;
    const characterCounterText = hasCharacterLimit ? `${remainingCharacters}/${numericCharacterLimit}` : '';

    const inputPropsFromParent = textFieldProps.InputProps || {};
    const inputSxFromParent = inputPropsFromParent.sx || {};

    const handleKeyDown = (e) => {
        if (e.key === ' ' && e.target.value === '') {
            e.preventDefault();
        }

        inputPropsFromParent.onKeyDown?.(e);
    };

    const tooltipAdornment = showTooltip && tooltipText ? (
        <InputAdornment position="end">
            <Tooltip title={tooltipText}>
                <InformationCircleIcon
                    sx={{ cursor: 'pointer' }}
                    fontSize="small"
                />
            </Tooltip>
        </InputAdornment>
    ) : null;

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
                    ...inputPropsFromParent,
                    sx: {
                        position: 'relative',
                        backgroundColor: color,
                        '& .MuiInputBase-input::placeholder': {
                            color: enableInlineError && showFieldError ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
                            opacity: 1,
                        },
                        
                        '& .inside-character-counter': {
                            position: 'absolute',
                            right: showTooltip && tooltipText ? 36 : 10,
                            bottom: 4,
                            fontSize: '0.55rem',
                            lineHeight: 1,
                            pointerEvents: 'none',
                            color: remainingCharacters < 0 ? 'error.main' : 'text.secondary',
                        },
                        
                        ...inputSxFromParent,
                    },
                    onKeyDown: handleKeyDown,
                    endAdornment: (
                        <>
                            {hasCharacterLimit && enableInlineError ? (
                                <Typography className="inside-character-counter">
                                    {characterCounterText}
                                </Typography>
                            ) : null}
                            {tooltipAdornment}
                            {inputPropsFromParent.endAdornment}
                        </>
                    ),
                }}
                {...textFieldProps}
            />
        </Box>
    );
};

export default TextFieldWithExternalLabel;