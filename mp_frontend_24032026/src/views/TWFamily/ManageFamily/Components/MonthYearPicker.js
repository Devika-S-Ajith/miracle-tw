import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { Box } from '@mui/system';
import CustomFieldLabel from './CustomFieldLabel';

const MonthYearPicker = ({
    id,
    label,
    value,
    onChange,
    required = false,
    disabled = false,
    error = false,
    helperText,
    maxDate = dayjs(),
    minDate,
    sx = { width: 1 },
    textFieldProps = {},
    ...rest
}) => {
    // Convert string value to dayjs object
    const dayjsValue = value
        ? dayjs(value, "MM/YYYY").isValid()
            ? dayjs(value, "MM/YYYY")
            : undefined
        : undefined;

    // Handle date change
    const handleChange = (newValue) => {
        const formattedValue = newValue ? dayjs(newValue).format("MM/YYYY") : "";
        onChange(formattedValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {label && (
                <Box sx={{ marginBottom: 1 }}>
                    <CustomFieldLabel>
                        {required ? `${label}*` : label}
                    </CustomFieldLabel>
                </Box>
            )}
            <DatePicker
                id={id}
                //label={label}
                disabled={disabled}
                value={dayjsValue}
                onChange={handleChange}
                slotProps={{
                    textField: {
                        required,
                        error,
                        helperText,
                        ...textFieldProps,
                    },
                }}
                views={["year", "month"]}
                format="MM/YYYY"
                maxDate={maxDate}
                minDate={minDate}
                sx={sx}
                {...rest}
            />
        </Box>
    );
};

export default MonthYearPicker;