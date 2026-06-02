import React, { useCallback, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { fieldToTextField } from "formik-material-ui";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const AutoCompleteDropdown = ({ 
  textFieldProps = {}, 
  validateOnChange = false, // New prop to control validation timing
  ...props 
}) => {
  const { t } = useTranslation(["common"]);
  const {
    form: { setTouched, setFieldTouched, setFieldValue, setFieldError, validateField },
  } = props;
  
  const { ...field } = fieldToTextField(props);
  const {
    name,
    error,
    accessKey,
    helperText,
    getOrgDetails,
    getFamilyDetails,
    required,
    handleValueChange,
    getOrgTypeForRoleList,
    getRoleAccess,
    onOrgTypeChange,
  } = field;
  
  const { label } = textFieldProps;

  // Memoize field names that require org details on blur
  const orgDetailsFields = useMemo(() => 
    new Set(["organization_name", "childCurrentPlacement"]), 
    []
  );

  // Memoize translatable field names
  const translatableFields = useMemo(() => 
    new Set(["FSRole", "HTRole", "organization_type", "language", "recurrenceType"]), 
    []
  );

  // Memoized handlers to prevent unnecessary re-renders
  const getOrgDetailsOnBlur = useCallback((fieldName) => {
    if (orgDetailsFields.has(fieldName)) {
      getOrgDetails?.();
    }
  }, [getOrgDetails, orgDetailsFields]);

  const getFamilyDetailsOnBlur = useCallback((fieldName, newValue) => {
    if (fieldName === "family") {
      getFamilyDetails?.(newValue);
    }
  }, [getFamilyDetails]);

  const handleValueChangeOnChange = useCallback((fieldName, id) => {
    if ((fieldName === "case_id" || fieldName === "country") && handleValueChange) {
      handleValueChange(id);
    }
  }, [handleValueChange]);

  const getOrgType = useCallback((fieldName, id) => {
    if (fieldName === "organizationName") {
      getOrgTypeForRoleList?.(id);
      setFieldValue("FSRole", "9");
      setFieldValue("HTRole", "9");
    }
  }, [getOrgTypeForRoleList, setFieldValue]);

  const handleRoleTypeChange = useCallback((fieldName, id) => {
    if (fieldName === "FSRole" || fieldName === "HTRole") {
      getRoleAccess?.(fieldName, id, setFieldValue, setFieldError);
      if (_.isUndefined(id)) {
        setFieldValue(fieldName, "9");
      }
    }
  }, [getRoleAccess, setFieldValue, setFieldError]);

  const clearField = useCallback((fieldName, data) => {
    switch (fieldName) {
      case "state":
        setFieldValue("district", "");
        break;
      case "country":
        setFieldValue("phone", data?.countryCode || "");
        setFieldValue("state", "");
        setFieldValue("district", "");
        setFieldValue("zip_code", "");
        break;
      case "family_situation":
        setFieldValue("goal", "");
        break;
      case "relation":
        setFieldValue("other_relation", "");
        break;
      default:
        break;
    }
  }, [setFieldValue]);

  const generateOptions = useCallback((item, options, key) => {
    const option = options.find((i) => i.id === item);
    if (!option) return "";

    return translatableFields.has(name) 
      ? t(`common:common.${option[key]}`, option[key])
      : option[key];
  }, [name, t, translatableFields]);

  const selectedOptions = useCallback((item, key) => {
    return translatableFields.has(name) 
      ? t(`common:common.${item[key]}`, item[key])
      : item[key];
  }, [name, t, translatableFields]);

  const handleChange = useCallback((_, data, reason) => {
    const fieldValue = data?.id;
    
    setFieldValue(name, fieldValue);
    
    // Handle different scenarios based on the data and reason
    if (data && data.id) {
      // Valid value selected - clear touched state and errors
      setFieldTouched(name, false, false);
      setFieldError(name, undefined);
    } else {
      // No value selected (either cleared, removed, or never selected)
      // Mark as touched and manually trigger validation
      setFieldTouched(name, true, false);
      
      // Manually trigger field validation after a brief delay
      setTimeout(() => {
        validateField(name);
      }, 0);
    }
    
    // Execute side effects
    handleValueChangeOnChange(name, fieldValue);
    getFamilyDetailsOnBlur(name, fieldValue);
    getOrgType(name, data?.HTOrganizationTypeId);
    handleRoleTypeChange(name, fieldValue);
    onOrgTypeChange?.(fieldValue);
    clearField(name, data);
    
  }, [
    name,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    handleValueChangeOnChange,
    getFamilyDetailsOnBlur,
    getOrgType,
    handleRoleTypeChange,
    onOrgTypeChange,
    clearField
  ]);

  const handleBlur = useCallback(() => {
    const currentValue = field.value;
    // Only mark as touched if no valid value is selected
    if (!currentValue || currentValue === "" || currentValue === "9") {
      setFieldTouched(name, true, false);
    }
    getOrgDetailsOnBlur(name);
  }, [name, setFieldTouched, getOrgDetailsOnBlur, field.value]);

  const getOptionLabel = useCallback((item) => {
    return typeof item === "string"
      ? generateOptions(item, props.options, accessKey)
      : selectedOptions(item, accessKey);
  }, [generateOptions, selectedOptions, props.options, accessKey]);

  const isOptionEqualToValue = useCallback((option, value) => {
    return option.id === value;
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.code === "Enter" && e.target.value) {
      setFieldValue(name, e.target.value);
    }
  }, [name, setFieldValue]);

  // Early return if no options provided
  if (!props.options || !Array.isArray(props.options)) {
    return null;
  }

  return (
    <Autocomplete
      {...field}
      {...props}
      onChange={handleChange}
      onBlur={handleBlur}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={(option) => !!option.disabled}
      isOptionEqualToValue={isOptionEqualToValue}
      autoHighlight
      defaultValue={props.defaultValue}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          {...textFieldProps}
          label={required ? `${label}*` : label}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            // Call the original onBlur if it exists
            if (inputProps.onBlur) {
              inputProps.onBlur(e);
            }
            // Then call our custom blur handler
            handleBlur();
          }}
          helperText={helperText}
          error={error}
        />
      )}
    />
  );
};

export default AutoCompleteDropdown;