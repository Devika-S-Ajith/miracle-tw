import { FormGroup, Grid, Typography } from '@mui/material';
import { Field } from 'formik';
import TextFieldWithExternalLabel from './TextFieldWithExternalLabel';
import DropdownWithExternalLabel from './DropdownWithExternalLabel';
import NumberFormat from 'react-number-format';
import MonthYearPicker from './MonthYearPicker';
import { GenderList, roleInFamily } from '../Configs/MemberFormConfig';
import { Search } from '@mui/icons-material';
import SearchableTextField from './SearchableTextField';
import { DateFormatFromRegion } from '../../../../constants';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { get, size } from 'lodash';
import { Checkbox, FormControlLabel } from '@mui/material';
import { PhoneTextInput } from '../../../../components/PhoneTextInput/PhoneTextInput';
import { id, is } from 'date-fns/locale';
import CalendarIcon from '../../../../assets/icons/CalendarIcon';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomFieldLabel from './CustomFieldLabel';
import { useRef } from 'react';
import FileUploadField from '../../../Dashboard/Components/FileUploadField';
import RadioGroupList from './RadioGroupList';
import BodyText from '../../../../components/BodyText/BodyText';

const DynamicForm = ({
    t,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    situationsAndGoals,
    locationList,
    htLanguagesList,
    caseWorkerList,
    dropdownValues = {}, // NEW: Accept dropdown values as a prop
    config = [], // Allow passing custom config
    searchFunction = () => { },
    RenderOptionList = () => { },
    ChildSelectedInfo = () => { },
    handleChildSelection = () => { },
    index, // NEW: Index for FieldArray items
    parentFieldName = '', // NEW: Parent field name (e.g., 'members')
    handleDateChange = null,
    initialTextValue = '',
    phoneRef = null,
    isDisabled = false,
    key=null
}) => {

    const currentValueRef = useRef(''); // Ref to keep track of current value for onClose events

    // Helper function to construct the full field name
    const getFieldName = (name) => {
        // If we have both index and parentFieldName, construct scoped name
        if (index !== undefined && parentFieldName) {
            return `${parentFieldName}.${index}.${name}`;
        }
        // Otherwise, return the name as-is
        return name;
    };


// Replace your helper functions with:
const getFieldValue = (name) => get(values, name, '');
const getFieldError = (name) => get(errors, name, '');
const getFieldTouched = (name) => get(touched, name, false);

    const renderField = (fieldConfig) => {
        const { type, name, gridProps, condition, ...fieldProps } = fieldConfig;

        // Check if the field should be rendered based on the condition
        if (condition && typeof condition === 'function') {
            const shouldRender = condition(values);
            if (!shouldRender) {
                return null; // Don't render the field
            }
        }

        // Get the full field name (scoped for FieldArray)
        const fullFieldName = getFieldName(name);

        // Get the field value, error, and touched state
        const fieldValue = getFieldValue(name);
        currentValueRef.current = fieldValue; // Keep ref updated with current value
        const fieldError = getFieldError(name);
        const fieldTouched = getFieldTouched(name);

        switch (type) {
            case 'text':
                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <TextFieldWithExternalLabel
                            label={t ? t(fieldProps.label) : fieldProps.label}
                            tooltipText={t && fieldProps.tooltipText ? t(fieldProps.tooltipText) : fieldProps.tooltipText}
                            showTooltip={fieldProps.showTooltip}
                            name={`${fullFieldName}`} // Use full scoped name
                            id={`${fullFieldName}`} // Use full scoped name
                            fullWidth={fieldProps.fullWidth}
                            error={Boolean(fieldTouched && fieldError)}
                            helperText={fieldTouched && fieldError}
                            placeholder={fieldProps.placeholder}
                            value={fieldValue || ''} // Use helper function
                            onChange={(e) => {handleChange(e); fieldProps?.onChange?.(e);}} // Call Formik's handleChange and any custom onChange
                            onBlur={handleBlur}
                            autoFocus={fieldProps.autoFocus}
                            size={fieldProps.size}
                            color={fieldProps.color}
                            multiline={fieldProps.multiline}
                            required={fieldProps.required}
                            disabled={isDisabled}
                        />
                    </Grid>
                );

            case 'dropdown':
                let options = [];
                // Determine options source
                if (fieldProps.optionsSource === 'goals' && fieldProps.getDynamicOptions) {
                    options = fieldProps.getDynamicOptions(values, dropdownValues.familyTypeAndGoal || []);
                } else if (fieldProps.optionsSource === 'familyTypeAndGoal') {
                    options = dropdownValues.familyTypeAndGoal || [];
                } else if (fieldProps.optionsSource === 'familySituation') {
                    options = dropdownValues.familySituation || [];
                } else if (fieldProps.optionsSource === 'locationList') {
                    options = locationList;
                } else if ((fieldProps.optionsSource === 'state' || fieldProps.optionsSource === 'district') && fieldProps.getDynamicOptions) {
                    options = fieldProps.getDynamicOptions(values, locationList);
                } else if (fieldProps.optionsSource === 'languages') {
                    options = htLanguagesList;
                } else if (fieldProps.optionsSource === 'caseWorker') {
                    options = caseWorkerList;
                } else if (fieldProps.optionsSource === 'gender') {
                    options = GenderList;
                } else if (fieldProps.optionsSource === 'MemberRoles') {
                    options = dropdownValues.familyRelations || [];
                } else if (fieldProps.options) {
                    options = fieldProps.options || [];
                }

                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <Field
                            name={fullFieldName} // Use full scoped name
                            id={`${fullFieldName}`}
                            component={DropdownWithExternalLabel}
                            onChange={fieldProps?.onChange}
                            onClose={(e,reason,value) => {
                                handleBlur({ target: { name: fullFieldName, value:value} });
                            }}
                            key={key}
                            options={fieldProps?.options || options}
                            size={fieldProps.size}
                            disabled={isDisabled || fieldProps.disabled}
                            required={fieldProps.required}
                            validateOnChange={fieldProps.validateOnChange}
                            labelKey={fieldProps.labelKey || "value"}
                            placeholder={t(fieldProps.placeholder)}
                            extraLabel={fieldProps.extraLabel}
                            grouped={fieldProps.grouped || false}
                            groupBy={fieldProps.groupBy}
                            color={fieldProps.color}
                            textFieldProps={{
                                label: t(fieldProps.label),
                                disabled: isDisabled || fieldProps.disabled,
                                variant: "outlined",
                                sx: {
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#FFFFFF',
                                    },
                                    '& .MuiAutocomplete-input': {
                                        backgroundColor: 'transparent',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        margin: 0,
                                        marginTop: '2px',
                                        marginLeft: '2px',
                                    }
                                }
                            }}
                        />
                    </Grid>
                );

            case "SearchableTextField":
                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <SearchableTextField
                            name={fullFieldName} // Use full scoped name
                            id={`${fullFieldName}`}
                            placeholder={fieldProps.placeholder}
                            initialTextValue={initialTextValue}
                            searchFunction={searchFunction}
                            onClose={(e, reason, value) => {
                                handleBlur({ target: { name: fullFieldName ,value: value } });
                            }}
                            size={fieldProps.size}
                            disabled={isDisabled}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                return `${option.firstName}`;
                            }}
                            renderOption={RenderOptionList}
                            onSelectionChange={(child) => handleChildSelection(child)}
                            minSearchLength={2}
                            debounceDelay={300}
                            freeSolo={true}
                            textFieldProps={{
                                label: fieldProps.label,
                                variant: "outlined",
                                disabled: isDisabled,
                                sx: {
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#FFFFFF',
                                    },
                                    '& .MuiAutocomplete-input': {
                                        backgroundColor: 'transparent',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        margin: 0,
                                        marginTop: '2px',
                                        marginLeft: '2px',
                                    }
                                }
                            }}
                        />
                    </Grid>
                );

            case "MonthYearPicker":
                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <MonthYearPicker
                            id={fullFieldName} // Use full scoped name
                            label={t ? t(fieldProps.label) : fieldProps.label}
                            value={fieldValue} // Use helper function
                            onChange={(value) => setFieldValue(fullFieldName, value)} // Use full scoped name
                            error={fieldTouched && Boolean(fieldError)}
                            helperText={fieldTouched && fieldError}
                            disabled={isDisabled}
                             slots={{
                                openPickerIcon: CalendarIcon,
                            }}
                        />
                    </Grid>
                );

            case "DatePicker":
                return (
                    <Grid item {...gridProps} key={fullFieldName}>                       
                        {fieldProps.label && (
                            <CustomFieldLabel sx={{ mb: 1 }}>
                                {`${t ? t(fieldProps.label) : fieldProps.label}${fieldProps?.required ? '*' : ''}`}
                            </CustomFieldLabel>
                        )}
                        <DatePicker
                            value={fieldValue ? dayjs(fieldValue) : undefined} // Use helper function
                            format={DateFormatFromRegion(true)}
                            id={`${fullFieldName}`}
                            disabled={isDisabled}
                            onChange={(newValue) => {
                                // If custom handleDateChange is provided, use it
                                currentValueRef.current = newValue ? newValue : '';
                                if (handleDateChange) {
                                    handleDateChange(new Date(newValue).toISOString(), fullFieldName);
                                } else {
                                    // Otherwise, just set the field value
                                    setFieldValue(fullFieldName, new Date(newValue).toISOString());
                                    fieldProps?.onChange?.(newValue); // Call any custom onChange provided in fieldProps
                                }
                            }}
                            // onClose={() => {
                            //     // Trigger blur event when date picker closes
                            //     handleBlur({ target: { name: fullFieldName, value: currentValueRef.current } });
                            // }}
                            maxDate={dayjs().endOf('day')}
                            slots={{
                                openPickerIcon: CalendarIcon,
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: fieldProps.fullWidth,
                                    id: fullFieldName, // Use full scoped name
                                    size: fieldProps.size || 'small',
                                    sx: {
                                        '& .MuiInputBase-root': {
                                            backgroundColor: 'white',
                                        },
                                    },
                                    placeholder: t(fieldProps.placeholder),
                                    error: fieldTouched && Boolean(fieldError),
                                    helperText: fieldTouched && fieldError,
                                },
                            }}
                        />
                    </Grid>
                );

            case 'ZIPCode':
                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <NumberFormat
                            customInput={TextFieldWithExternalLabel}
                            error={Boolean(fieldTouched && fieldError)}
                            fullWidth
                            helperText={fieldTouched && fieldError}
                            placeholder={
                                localStorage.getItem("userRegion") === "1"
                                    ? "888888"
                                    : "88888"
                            }
                            format={
                                localStorage.getItem("userRegion") === "1"
                                    ? "######"
                                    : "#####"
                            }
                            label={t("common:common.ZIP/postal Code")}
                            name={fullFieldName} // Use full scoped name
                            id={fullFieldName} // Use full scoped name
                            type="text"
                            required ={fieldProps.required}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={fieldValue || ''} // Use helper function
                            disabled={isDisabled}
                        />
                    </Grid>
                );

            case 'CheckboxWithLabel':
                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={Boolean(fieldValue)}
                                    onChange={(e) => {setFieldValue(fullFieldName, e.target.checked); fieldProps?.onChange?.(e.target.checked);}}
                                    name={fullFieldName}
                                    id={`${fullFieldName}`}
                                    onBlur={handleBlur}
                                    sx={{
                                        color: isDisabled ? 'grey' : '#1D334B', 
                                        '&.Mui-checked': {
                                            color: isDisabled ? 'grey' : '#1D334B', 
                                        },
                                    }}
                                />
                            }
                            disabled={isDisabled}
                            label={t ? t(fieldProps.label) : fieldProps.label}
                            required={fieldProps.required}
                        />
                    </Grid>);

            case 'MultipleCheckBoxWithLabel':
                return (
                  <Grid item {...gridProps} key={fullFieldName}>
                    {fieldProps.label && (
                        <CustomFieldLabel sx={{ mb: 1 }}>
                            {`${t ? t(fieldProps.label) : fieldProps.label}${fieldProps?.required ? '*' : ''}`}
                        </CustomFieldLabel>
                    )}
                    <FormGroup>
                      {fieldConfig?.options.map((item) => (
                        <FormControlLabel
                          key={item.id}
                          control={
                            <Checkbox
                              checked={fieldValue.includes(item.id)}
                              onChange={() =>
                              {
                                setFieldValue(
                                  fullFieldName,
                                  fieldValue.includes(item.id)
                                    ? fieldValue.filter(
                                        (id) => id !== item.id,
                                      )
                                    : [...fieldValue, item.id],
                                )
                              }
                              }
                            />
                          }
                          label={item.value}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                );
            case 'PhoneNumber':
                return (
                    <Grid item {...gridProps} key={fullFieldName}>
                        <PhoneTextInput
                            name='phone'
                            id="phone"
                            phoneRef={fieldProps?.phoneRef}
                            onBlur={handleBlur}
                            error={fieldTouched && Boolean(fieldError)}
                            helperText={fieldTouched && fieldError}
                            value={fieldValue}
                            onChange={(phone) => setFieldValue(fullFieldName, phone)}
                            defaultCountry={locationList?.find((loc) => loc.id == localStorage.getItem("userRegion"))?.iso2Code || 'us'}
                            showAttachedLabel={false}
                            disabled={isDisabled}
                        />
                    </Grid>
                );
                case "TimePicker":
                return(
                    <Grid item {...gridProps} key={fullFieldName}>                      
                    {fieldProps.label && (
                        <CustomFieldLabel sx={{ mb: 1 }}>
                            {`${t ? t(fieldProps.label) : fieldProps.label}${fieldProps?.required ? '*' : ''}`}
                        </CustomFieldLabel>
                    )}
                    <TimePicker
                        value={fieldValue? dayjs(fieldValue) : null}
                        onChange={(newValue) => setFieldValue(fullFieldName,newValue)}
                        format="hh:mm A"
                        id={`${fullFieldName}`}
                        minuteStep={5}
                        disabled={isDisabled}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size:"medium",
                                error: fieldTouched && Boolean(fieldError),
                                helperText: fieldTouched && fieldError,
                                placeholder:fieldProps.placeholder || "Select time",
                            },
                        }}
                    />
                    </Grid>
                );
                case 'FileUpload':
                    return (
                        <Grid item {...gridProps} key={fullFieldName}>
                            {fieldProps.label && (
                                <CustomFieldLabel sx={{ mb: 1 }}>
                                    {`${t ? t(fieldProps.label) : fieldProps.label}${fieldProps?.required ? '*' : ''}`}
                                </CustomFieldLabel>
                            )}
                            <FileUploadField
                                values={values}
                                setFieldValue={setFieldValue}
                            />
                        </Grid>
                    );
                case "radioGroup":
                    return (
                      <Grid item {...gridProps} key={fullFieldName}>
                        {fieldProps.label && (
                          <CustomFieldLabel>
                            {`${t ? t(fieldProps.label) : fieldProps.label}${fieldProps?.required ? "*" : ""}`}
                          </CustomFieldLabel>
                        )}
                        <RadioGroupList
                          name={fullFieldName}
                          options={fieldProps.options || []}
                          value={fieldValue}
                          onChange={(e) =>
                            setFieldValue(fullFieldName, e.target.value)
                          }
                          renderPrimary={(option) => (
                            <BodyText value={option.label} />
                          )}
                        />
                        {fieldTouched && fieldError && (
                          <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                            {fieldError}
                          </Typography>
                        )}
                      </Grid>
                    );
            default:
                return null;
        }
    };

    return (
        <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {config.map(renderField)}
        </LocalizationProvider>
        </>
    );
};

export default DynamicForm;