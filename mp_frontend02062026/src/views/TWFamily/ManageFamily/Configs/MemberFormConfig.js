import dayjs from "dayjs";
export const InlineMemberCreationConfig = [
    {
        type: 'text',
        name: 'firstName',
        placeholder: 'common:common.First name',
        enableInlineError: true,
        size: 'small',
        color:"#FFFFFF",
        required: true,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 1.5, xs: 12 }
    },
    {
        type: 'text',
        name: 'lastName',
        placeholder: 'common:common.Last name',
        enableInlineError: true,
        size: 'small',
        color:"#FFFFFF",
        required: true,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 1.5, xs: 12 }
    },
    {
        type: 'CheckboxWithLabel',
        name: 'isMajor',
        label: 'common:common.Over age consent',
        required: false,
        variant: 'outlined',
        gridProps: { md: 4, xs: 12 }
    },
    {
        type: 'RadioButton',
        name: 'isPrimaryCaregiver',
        label: 'common:common.Primary Caregiver',
        required: false,
        variant: 'outlined',
        //gridProps: { md: 2.5, xs: 2.5 }
    },
    
];

export const InlineChildCreationConfig = [
    {
        type: 'SearchableTextField',
        name: 'firstName',
        placeholder: ('common:common.First name','First name'),
        enableInlineError: true,
        required: true,
        showTooltip: false,
        fullWidth: true,
        color:"#FFFFFF",
        size: 'small',
        variant: 'outlined',
        gridProps: { md: 1.5, xs: 12 }
    },
    {
        type: 'text',
        name: 'lastName',
        placeholder: ('common:common.Last name','Last name'),
        size: 'small',
        enableInlineError: true,
        color:"#FFFFFF",
        required: true,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 1.5, xs: 12 }
    },
    {
        type: 'dropdown',
        name: 'gender',
        placeholder: 'common:common.Gender',
        enableInlineError: true,
        translateLabels: true,
        size: 'small',
        color:"#FFFFFF",
        required: false,
        validateOnChange: true,
        labelKey: 'gender',
        optionsSource: 'gender',
        gridProps: { md: 1.5, xs: 12 }
    },
     {
        type: 'DatePicker',
        name: 'dateOfBirth',
        placeholder: 'common:common.Date of Birth',
        enableInlineError: true,
        size: 'small',
        color:"#FFFFFF",
        required: false,
        fullWidth: true,
        variant: 'outlined',
        maxDate: dayjs().endOf('day'),
        gridProps: { md: 2, xs: 12 }
    },
];

export const modalMemberBasicFormConfig = [
    {
        type: 'text',
        name: 'firstName',
        placeholder: 'common:common.First name',
        required: true,
        enableInlineError: false,
        autoFocus: true,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 12, xs: 12 }
    },
    {
        type: 'text',
        name: 'lastName',   
        placeholder: 'common:common.Last name',
        required: false,
        enableInlineError: false,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 12, xs: 12 }
    },
    {
        type: 'dropdown',
        name: 'TWFamilyRelationId',
        translateLabels: true,
        label: 'common:common.Role',
        optionsSource: 'MemberRoles',
        accessKey: 'label',
        labelKey: 'value',
        grouped: true,
        groupBy: "groupValue",
        valueKey: 'id',
        textFieldProps: {
            fullWidth: true,
            margin: 'normal',
            variant: 'outlined'
        },
        gridProps: { md: 12, xs: 12 }
    },
    {
        type: 'CheckboxWithLabel',  
        name: 'isMajor',
        label: 'common:common.This person is over the legal age of consent'
    }

];

export const modalMemberPersonalFormConfig = ({phoneRef}) => [{
        type: 'PhoneNumber',
        name: 'phoneNumber',
        label: 'common:common.Phone Number',
        fullWidth: true,
        required: true,
        variant: 'outlined',
        gridProps: { md: 12, xs: 12 },
        phoneRef: phoneRef
    },
    {
        type: 'text',
        name: 'occupation',
        label: 'common:common.Occupation',
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 12, xs: 12 }
    },
    {
        type: 'text',
        name: 'note',
        label: 'common:question.Note',
        fullWidth: true,
        multiline: true,
        variant: 'outlined',
        gridProps: { md: 12, xs: 12 }

    }];

    export const modalMemberUserFormConfig = [
    {
        type: 'CheckboxWithLabel',  
        name: 'appAccessEnabled',
        label:'This person needs access to the ThriveWell mobile app',
    },
    {
        type: 'text',
        name: 'email',   
        label: 'Email',
        required: true,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 8, xs: 8 ,ml:4 },
        condition: (values) => values.appAccessEnabled === true
    },
];


export const GenderList = [
    {
      id: "FEMALE",
      gender: "Female",
    },
    {
      id: "MALE",
      gender: "Male",
    },
    {
      id: "OTHER",
      gender: "Other",
    },
    {
      id: "PREFER_NOT_TO_DISCLOSE",
      gender: "Prefer not to disclose",
    },
  ];
