import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@material-ui/core';
import { fieldToTextField } from "formik-material-ui";

const AutoCompleteDropdownMultiNames = ({ textFieldProps, ...props }) => {
    const {
      form: { setTouched, setFieldValue }
    } = props;
    const { ...field } = fieldToTextField(props);
    const { name,error,accessKey1,accessKey2,helperText,required} = field;
    const {label}=textFieldProps
  
    return (
      props.options ?<Autocomplete
        {...field}
        {...props}
        onChange={(_, data) => {
          setFieldValue(name, data?.id);
        }}
        required={required}
        autoHighlight
        onBlur={()=>{setTouched({ [name]: true })} } 
        getOptionLabel={item => {        
          return  typeof item === "string"
            ? props.options.find(i => i.id === item)?props.options.find(i => i.id === item)[accessKey1]+" "+props.options.find(i => i.id === item)[accessKey2]:""        
            : item[accessKey1]+" "+item[accessKey2]
        }}       
        getOptionSelected={(item, current) => {
          return item.id === current;
        }}    
        
        renderInput={props => (
          <TextField
            {...props}
            {...textFieldProps}
            label={required?label+"*":label}
            onKeyDown={e => {
              if (e.code === 'enter' && e.target.value) {
                setFieldValue(name, e.target.value);
              }
            }}
            helperText={helperText}
            error={error}
          />
        )}
      />:<></>
    );
  };

  export default AutoCompleteDropdownMultiNames