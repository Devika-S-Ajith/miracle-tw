import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';


const AutoCompleteDropdownOrgId = ({ textFieldProps, ...props }) => {

  const { accessKey, required, getValueFunction } = props;
  const { label } = textFieldProps

  return (
    props.options ? <Autocomplete
      {...props}
      onChange={(e, val) => getValueFunction(e, val?.linkedOrganizationId)}
      autoHighlight
      //required={required}   
      getOptionLabel={item => {
        return typeof item === "string"
          ? props.options.find(i => i.linkedOrganizationId === item) ? props.options.find(i => i.linkedOrganizationId === item)[accessKey] : ""
          : item[accessKey]
      }}
      getOptionSelected={(item, current) => {
        return item.linkedOrganizationId === current;
      }}
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

export default AutoCompleteDropdownOrgId