// components/SearchableTextField.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';

const SearchableTextField = ({
  textFieldProps = {},
  name,
  placeholder,
  searchFunction = null,
  getOptionLabel,
  renderOption,
  onSelectionChange,
  minSearchLength = 2,
  debounceDelay = 300,
  freeSolo = true,
  disabled = false,
  required = false,
  noOptionsText,
  size = 'medium',
  onClose,
  enableInlineError = false,
  ...otherProps
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // ✅ Formik value drives inputValue
  const inputValue = field.value ?? '';
  const currentValueRef = useRef(inputValue); 

  /* ---------------- SEARCH ---------------- */
  const searchFunctionCallback = useCallback(() => {
    if (!searchFunction || inputValue.length < minSearchLength) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchFunction(inputValue);
        setOptions(results || []);
      } catch (err) {
        console.error('Search error:', err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [inputValue, minSearchLength, debounceDelay]);

  /* ---------------- INPUT CHANGE ---------------- */
  const handleInputChange = (_, newInputValue) => {
    setFieldValue(name, newInputValue);
    setSelectedOption(null);
    searchFunctionCallback();
    if (onSelectionChange) {
      onSelectionChange(null);
    }
  };

  /* ---------------- OPTION SELECT ---------------- */
  const handleChange = (_, newValue) => {
    if (typeof newValue === 'object' && newValue !== null) {
      setSelectedOption(newValue);
      currentValueRef.current = getOptionLabel?.(newValue) ?? newValue.label ?? newValue.name ?? '';
      const label =
        getOptionLabel?.(newValue) ??
        newValue.label ??
        newValue.name ??
        '';

      setFieldValue(name, label);

      onSelectionChange?.(newValue);
    } else {
      // free text
      currentValueRef.current = newValue || '';
      setSelectedOption(null);
      setFieldValue(name, newValue || '');
      onSelectionChange?.(null);
    }
  };

  const handleBlur = () => {
    setFieldTouched(name, true);
  };

  const defaultGetOptionLabel = (option) =>
    typeof option === 'string'
      ? option
      : option?.label || option?.name || '';

  const defaultNoOptionsText =
    inputValue.length < minSearchLength
      ? `Type at least ${minSearchLength} characters`
      : 'No results found';

  return (
    <Box>
      <Autocomplete
        freeSolo={freeSolo}
        options={options}
        loading={isLoading}
        size={size}
        disabled={disabled}
        value={selectedOption}              // ✅ object or null
        inputValue={inputValue}             // ✅ Formik-controlled
        onInputChange={handleInputChange}
        onChange={handleChange}
        onBlur={handleBlur}
        getOptionLabel={getOptionLabel || defaultGetOptionLabel}
        isOptionEqualToValue={(o, v) => o?.id === v?.id}
        renderOption={renderOption}
        noOptionsText={noOptionsText || defaultNoOptionsText}
        PaperComponent={(props) => (
          <Paper {...props} elevation={4} sx={{ minWidth: 180 }} />
        )}
        onClose={(e, reason) => {
          if (onClose) {
            onClose(e, reason, currentValueRef.current);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={enableInlineError && meta.touched && meta.error ? meta.error : placeholder}
            required={required}
            error={ meta.touched && Boolean(meta.error)}
            helperText={!enableInlineError && meta.touched && meta.error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading && (
                    <CircularProgress color="inherit" size={20} />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{
          '& .MuiFormHelperText-root': {
            mt: '2px',
            ml: '2px',
            fontSize: '0.75rem',
          },
          '& .MuiInputBase-input::placeholder': {
            color: enableInlineError && meta.touched && meta.error ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
            opacity: 1,
          },
          ...textFieldProps.sx,
        }}
        {...otherProps}
      />
    </Box>
  );
};

SearchableTextField.propTypes = {
  name: PropTypes.string.isRequired,
  searchFunction: PropTypes.func,
};

export default SearchableTextField;
