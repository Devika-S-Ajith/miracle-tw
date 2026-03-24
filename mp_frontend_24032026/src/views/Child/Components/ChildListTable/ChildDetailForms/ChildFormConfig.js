import {
  GenderListOptions,
  LevelOfCareOptions,
} from "../../../../../constants";

export const ChildBasicDetails = ({
  childDropdownLists,
  users,
  familyList,
  handleFamilyChange,
  setFieldValue,
  values,
  uniqueCheckHandler,
  setFieldError,
  validateForm
}) => [
  {
    type: "text",
    name: "firstName",
    label: "Child’s first name",
    required: true,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
    onChange: ()=>uniqueCheckHandler({values, setFieldError, validateForm})
  },
  {
    type: "text",
    name: "lastName",
    label: "Child’s last name",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
    onChange: ()=>uniqueCheckHandler({values, setFieldError, validateForm})
  },
  {
    type: "dropdown",
    name: "gender",
    label: "Gender",
    translateLabels: true,
    size: "medium",
    color: "#FFFFFF",
    required: true,
    validateOnChange: true,
    options: GenderListOptions,
    // value: values.gender,
    gridProps: { xs: 12 },
    onChange: ()=>uniqueCheckHandler({values, setFieldError, validateForm})
  },
  {
    type: "DatePicker",
    name: "dob",
    label: "Date of birth",
    placeholder: "Date of birth",
    validateOnChange: true,
    size: "small",
    color: "#FFFFFF",
    required: true,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12, md: 12 },
    onChange: ()=>uniqueCheckHandler({values, setFieldError, validateForm})
  },
  {
    type: "dropdown",
    name: "family",
    label: "Family child is living with",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: familyList || [],
    onChange: (name, fieldValue, data, reason) => {
      handleFamilyChange({ data, setFieldValue });
    },
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "dropdown",
    name: "currentLivingCondition",
    label: "Current living condition",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: childDropdownLists?.currentPlacementStatus || [],
    // value: values?.currentLivingCondition,
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "dropdown",
    name: "caseWorker",
    label: "Case worker for this child",
    translateLabels: true,
    required: true,
    validateOnChange: true,
    disabled: values?.family && values?.caseWorker?.length ? true : false, // Disable if family selected
    options:
      users.map((user) => ({
        value: `${user.firstName} ${user.lastName}`,
        id: user.id,
      })) || [],
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "CheckboxWithLabel",
    name: "disability",
    label: "This child has a legally recognized disability",
    gridProps: { xs: 12 },
  },
];

export const ChildAddressConditionalFields = ({
  values,
  handleSameAddressChange,
  setFieldValue,
}) => [
  {
    type: "CheckboxWithLabel",
    name: "sameAddress",
    label: "Child's address is the same as family's address",
    gridProps: { xs: 12 },
    onChange: (checked) =>
      handleSameAddressChange({ checked, values, setFieldValue }),
  },
];

export const ChildContactDetails = ({
  StateList,
  handleFamilyChange,
  values,
  setFieldValue,
}) => [
  {
    type: "text",
    name: "address1",
    label: "Address 1",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
  },
  {
    type: "text",
    name: "address2",
    label: "Address 2",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
    // rops: { md: 6.5, xs: 6.5 }
  },
  {
    type: "text",
    name: "city",
    label: "City",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
  },
  {
    type: "dropdown",
    name: "state",
    label: "State",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options:
      StateList?.map((state) => ({ id: state.id, value: state.stateName })) ||
      [],
    gridProps: { xs: 12 },
  },
  {
    type: "text",
    name: "zipCode",
    label: "Mailing code / Postal Index Number / ZIP code",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
  },
];

export const ChildAdditionalDetails = ({
  childDropdownLists,
  allLanguagesList,
}) => {
  return [
    {
      type: "PhoneNumber",
      name: "phoneNumber",
      label: "common:common.Phone Number",
      fullWidth: true,
      variant: "outlined",
      gridProps: { md: 12, xs: 12 },
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      required: false,
      showTooltip: false,
      fullWidth: true,
      variant: "outlined",
      gridProps: { xs: 12 },
    },
    {
      type: "dropdown",
      name: "primaryLanguage",
      label: "Primary language",
      translateLabels: true,
      required: false,
      validateOnChange: true,
      options:
        allLanguagesList.map((language) => ({
          id: language.id,
          value: language.language,
        })) || [],
      gridProps: { xs: 12 },
    },
    {
      type: "dropdown",
      name: "ethnicity",
      label: "Ethnicity (only for US-based orgs)",
      translateLabels: true,
      required: false,
      validateOnChange: true,
      options: childDropdownLists?.ethnicity || [],
      gridProps: { xs: 12 },
    },
    {
      type: "dropdown",
      name: "educationLevel",
      label: "Education level",
      translateLabels: true,
      required: false,
      validateOnChange: true,
      options: childDropdownLists?.educationLevel || [],
      gridProps: { xs: 12 },
    },
    {
      type: "text",
      name: "allergies",
      label: "Allergies",
      required: false,
      showTooltip: false,
      fullWidth: true,
      variant: "outlined",
      gridProps: { xs: 12 },
    },
    {
      type: "text",
      name: "notes",
      label: "Notes",
      required: false,
      showTooltip: false,
      fullWidth: true,
      variant: "outlined",
      multiline: true,
      gridProps: { xs: 12 },
      // gridProps: { md: 6.5, xs: 6.5 }
    },
  ];
};
export const CaseManagementDetails = (childDropdownLists) => [
  {
    type: "DatePicker",
    name: "dateEnteredAgency",
    label: "Date child entered agency",
    placeholder: "Date child entered agency",
    // size: "small",
    color: "#FFFFFF",
    fullWidth: true,
    size: "medium",
    variant: "outlined",
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "MonthYearPicker",
    name: "dateOfCWSEntry",
    label: "Date child entered welfare system",
    placeholder: "Date child entered welfare system",
    // size: "small",
    color: "#FFFFFF",
    fullWidth: true,
    size: "medium",
    variant: "outlined",
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "dropdown",
    name: "caseManagementStep",
    label: "Case management step",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: childDropdownLists?.placementStatus || [],
    gridProps: { xs: 12 },
  },
  {
    type: "dropdown",
    name: "levelOfCare",
    label: "Level of care (US logs only)",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: LevelOfCareOptions || [],
    gridProps: { xs: 12 },
  },
  {
    type: "text",
    name: "medicaidNumber",
    label: "Medicaid number (US logs only)",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    multiline: true,
    gridProps: { xs: 12 },
  },
  {
    type: "text",
    name: "placementId",
    label: "Placement ID (US logs only)",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    multiline: true,
    gridProps: { xs: 12 },
    // gridProps: { md: 6.5, xs: 6.5 }
  },
  {
    type: "dropdown",
    name: "caseManagementStep",
    label: "# of previous placements (US logs only)",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    labelKey: "firstName",
    extraLabel: "lastName",
    optionsSource: "caseWorker",
    gridProps: { xs: 12 },
  },
];

export const CaseCloseDetails = [
  {
    type: "DatePicker",
    name: "dateCaseClosed",
    label: "Date case was closed",
    required: false,
    showTooltip: false,
    fullWidth: true,
    size: "medium",
    variant: "outlined",
    multiline: true,
    gridProps: { xs: 12 },
    // gridProps: { md: 6.5, xs: 6.5 }
  },
];
