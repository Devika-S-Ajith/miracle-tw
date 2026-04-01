import { useCallback, useMemo, useRef } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { Paper, TextField } from "@mui/material";
import { fieldToTextField } from "formik-material-ui";
import { useTranslation } from "react-i18next";
import CustomFieldLabel from "./CustomFieldLabel";


const DropdownWithExternalLabel = ({
  textFieldProps = {},
  validateOnChange = false,
  labelKey = "label",
  extraLabel = "",
  valueKey = "id",
  placeholder = "Choose",
  translateLabels = false,
  translationNamespace = "common",
  onChange,
  onBlur,
  onClose=null,
  onClear,
  clearErrorOnChange = true,
  touchOnClear = true,
  validationDelay = 0,
  customFunction = null,
  grouped = false, // NEW: Enable grouped display
  groupBy = "group", // NEW: Key for grouping
  size = "medium",
  ...props
}) => {
  const { t } = useTranslation([translationNamespace]);


  // Safely extract form methods
  const {
    form: {
      setFieldTouched,
      setFieldValue,
      setFieldError,
      validateField
    } = {},
  } = props;

  const { ...field } = fieldToTextField(props);
  const {
    name,
    error,
    helperText,
    required,
  } = field;

  const { label } = textFieldProps;
  const currentValueRef = useRef(field.value);

  // Validate options array
  const validOptions = useMemo(() => {
    if (!props.options || !Array.isArray(props.options)) {
      console.warn(`AutoCompleteDropdown: Invalid options provided for field "${name}"`);
      return [];
    }
    return props.options;
  }, [props.options, name]);

  /**
   * Generate label for option - handles both string values and objects
   */
  const getOptionLabel = useCallback((item) => {
    if (!item) return "";

    // Handle string values (e.g., when value is stored as ID)
    if (typeof item === "string") {
      const option = validOptions.find((opt) => opt[valueKey] === item);
      if (!option) return "";

      let label = option[labelKey];
      if (extraLabel && option[extraLabel]) {
        label += " " + option[extraLabel];
      }
      return translateLabels ? t(`${translationNamespace}.${label}`) : label;
    }

    // Handle option objects
    let label = item[labelKey];
    if (extraLabel && item[extraLabel]) {
      label += " " + item[extraLabel];
    }
    if (!label) return "";

    return translateLabels ? t(`${translationNamespace}.${label}`) : label;
  }, [validOptions, valueKey, labelKey, extraLabel, translateLabels, t, translationNamespace]);

  /**
   * Group options by category
   * NEW: Handle grouping
   */
  const getGroupBy = useCallback((option) => {
    if (!grouped || !option) return undefined;
    return option[groupBy] || "";
  }, [grouped, groupBy]);

  /**
   * Check if option equals value
   */
  const isOptionEqualToValue = useCallback((option, value) => {
    if (!option || !value) return false;
    return option[valueKey] === value;
  }, [valueKey]);

  /**
   * Handle field value change
   */
  const handleChange = useCallback((event, data, reason) => {
    const fieldValue = data?.[valueKey] ?? "";
     currentValueRef.current = fieldValue;
    // Set the field value
    setFieldValue(name, fieldValue, false);

    // Handle validation and errors based on whether value exists
    if (data && data[valueKey]) {
      // Valid value selected
      if (clearErrorOnChange) {
        setFieldTouched(name, false, false);
        setFieldError(name, undefined);
      }
    } else {
      // No value selected (cleared or removed)
      if (touchOnClear) {
        setFieldTouched(name, true, false);
      }

      // Trigger validation after delay if validateOnChange is enabled
      if (validateOnChange) {
        setTimeout(() => {
          validateField(name);
        }, validationDelay);
      }

      // Call onClear callback if provided
      if (onClear && reason === "clear") {
        onClear(name, fieldValue);
      }
    }

    // Call custom onChange handler if provided
    if (onChange) {
      onChange(name, fieldValue, data, reason);
    }
    
    if (customFunction) {
      customFunction(fieldValue);
    }

  }, [
    name,
    valueKey,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateOnChange,
    validationDelay,
    clearErrorOnChange,
    touchOnClear,
    onChange,
    onClear,
  ]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((event) => {
    const currentValue = field.value;

    // Mark as touched if no valid value is selected
    if (!currentValue || currentValue === "") {
      setFieldTouched(name, true, true);
    }

    // Call custom onBlur handler if provided
    if (onBlur) {
      onBlur(name, currentValue, event);
    }
  }, [name, field.value, setFieldTouched, onBlur]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event) => {
    // Prevent form submission on Enter if autocomplete is open
    if (event.key === "Enter" && event.target.value) {
      event.preventDefault();
    }
  }, []);

  // Validate that required form methods exist (after all hooks)
  if (!setFieldValue || !setFieldTouched || !validateField) {
    console.error("AutoCompleteDropdown: Required Formik form methods not provided");
    return null;
  }

  // Return null if options are invalid
  if (validOptions.length === 0 && props.options?.length > 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', margin: '3px 0' }}>
      {label && (
        <CustomFieldLabel mb={1}>
          {required ? `${label}*` : label}
        </CustomFieldLabel>
      )}
      <Autocomplete
        {...field}
        {...props}
        options={validOptions}
        onChange={handleChange}
        size={size}
        onBlur={handleBlur}
        onClose={(e, reason) => {
          if (onClose) {
            setTimeout(() => {
              onClose(e, reason, currentValueRef.current);
            }, 0);
          }
        }}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={(option) => !!option.disabled}
        isOptionEqualToValue={isOptionEqualToValue}
        groupBy={grouped ? getGroupBy : undefined} // NEW: Conditionally apply grouping
        autoHighlight
        renderInput={(inputProps) => (
          <TextField
            {...inputProps}
            {...textFieldProps}
            label=""
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            helperText={helperText}
            error={error}
            margin="none" // ADD THIS
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 'auto', // Remove minimum height
              },
              '& .MuiFormHelperText-root': {
                marginTop: '2px',
                marginLeft: '2px',
                marginRight: 0,
                fontSize: '0.75rem',
              },
              '& .MuiInputBase-root': {
                margin: 0, // Remove any margin from input
              },
              ...textFieldProps.sx
            }}
          />
        )}
        PaperComponent={(props) => (
          <Paper {...props} elevation={4} sx={{ minWidth: 200 }} />
        )}
      />
    </div>
  );
};

export default DropdownWithExternalLabel;