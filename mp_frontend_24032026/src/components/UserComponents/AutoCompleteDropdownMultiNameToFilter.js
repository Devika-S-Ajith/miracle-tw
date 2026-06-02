import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


const AutoCompleteDropdownToFilter = ({ textFieldProps, ...props }) => {

  const { accessKey1, accessKey2, required, getValueFunction, Key } = props;
  const { label } = textFieldProps

  return (
    props.options ? <Autocomplete
      {...props}
      onChange={(e, val) => getValueFunction(val?.id)}
      autoHighlight
      key={Key}
      getOptionLabel={item => {
        return typeof item === "string"
          ? props.options.find(i => i.id === item) ? props.options.find(i => i.id === item)[accessKey1] + " " + props.options.find(i => i.id === item)[accessKey2] : ""
          : item[accessKey1] + " " + item[accessKey2]
      }}
      getOptionSelected={(item, current) => {
        return item.id === current;
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

export default AutoCompleteDropdownToFilter