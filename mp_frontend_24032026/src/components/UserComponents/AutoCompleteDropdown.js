import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@material-ui/core';
import { fieldToTextField } from "formik-material-ui";
import { useTranslation } from 'react-i18next';


const AutoCompleteDropdown = ({ textFieldProps, ...props }) => {
  const { t } = useTranslation(['common']);
    const {
      form: { setTouched, setFieldValue }
    } = props;
    const {  ...field } = fieldToTextField(props);
    const { name,error,accessKey,helperText,getOrgDetails,required,handleValueChange,getOrgTypeForRoleList} = field;
    const {label}=textFieldProps
  const getOrgDetailsOnBlur=(name)=>{
    if(name=='organization_name' || name== 'childCurrentPlacement')
    {
      getOrgDetails()
    }
  }
  const handleValueChangeOnChange=(name,id)=>{
    if(name=='case_id')
    {
      handleValueChange(id)
    }
  }

  const getOrgType=(name,id)=>{
    if(name=='organizationName')
    {
      getOrgTypeForRoleList(id)
    }
  }


  const clearField=(name)=>{
    if(name==='state'){
      setFieldValue('district','')
    }
    if(name==='country'){
      setFieldValue('phone','')
      setFieldValue('state','')
      setFieldValue('district','')
      
    }
        
  }

  const generateOptions=(item,options,key)=>{
    if(name==='role' || name==='organization_type' || name==='language' || name==='recurrenceType'){
      return options.find(i => i.id === item)?t(`common:common.${options.find(i => i.id === item)[key]}`):""
    }else{
      return options.find(i => i.id === item)?options.find(i => i.id === item)[key]:""
    }
   
  }

  const selectedOptions=(item,key)=>{
    if(name==='role' || name==='organization_type' || name==='language' || name==='recurrenceType'){
      return t(`common:common.${item[key]}`) 
    }else{
      return item[key]
    }
    
   }


    return (
      props.options ?<Autocomplete
        {...field}
        {...props}
        onChange={(_, data) => {
          setFieldValue(name, data?.id);handleValueChangeOnChange(name,data?.id);getOrgType(name,data?.HTOrganizationTypeId);clearField(name)
        }}
        autoHighlight
        onBlur={() => {setTouched({ [name]: true });getOrgDetailsOnBlur(name)}}    
        getOptionLabel={item => {        
          return  typeof item === "string"
            ? generateOptions(item,props.options,accessKey)      
            : selectedOptions(item,accessKey)
        }}  
        defaultValue={props.defaultValue}     
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

  export default AutoCompleteDropdown