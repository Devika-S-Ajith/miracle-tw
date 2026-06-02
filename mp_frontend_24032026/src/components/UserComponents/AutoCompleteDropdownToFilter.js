import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AutoCompleteDropdownToFilter = ({ textFieldProps, ...props }) => {
  const { t } = useTranslation(['common']);

  const { accessKey, required, getValueFunction, name, defaultVal, EnableClearable } = props;
  const { label } = textFieldProps

  const generateOptions = (item, options, key) => {
    if (name === 'role' || name === 'organization_type' || name === 'language') {
      return options.find(i => i.id === item) ? t(`common:common.${options.find(i => i.id === item)[key]}`) : ""
    } else {
      return options.find(i => i.id === item) ? options.find(i => i.id === item)[key] : ""
    }

  }

  const selectedOptions = (item, key) => {
    if (name === 'role' || name === 'organization_type' || name === 'language') {
      return t(`common:common.${item[key]}`)
    } else {
      return item[key]
    }
  }

  return (
    props.options ? <Autocomplete
      {...props}
      onChange={(e, val) => getValueFunction(val?.id)}
      autoHighlight
      getOptionLabel={item => {
        return typeof item === "string"
          ? generateOptions(item, props.options, accessKey)
          : selectedOptions(item, accessKey)
      }}
      getOptionSelected={(item, current) => {
        return item.id === current;
      }}
      disableClearable={EnableClearable ? false : true}
      value={props.value}
      key={props.key}
      defaultValue={defaultVal}
      renderInput={props => (
        <TextField
          {...props}
          {...textFieldProps}
          label={required ? label + "*" : label}
          onKeyDown={e => {
            if (e.code === 'enter' && e.target.value) {
              getValueFunction(e.target.value)
            }
          }}
        />
      )}
    /> : <></>
  );
};

export default AutoCompleteDropdownToFilter