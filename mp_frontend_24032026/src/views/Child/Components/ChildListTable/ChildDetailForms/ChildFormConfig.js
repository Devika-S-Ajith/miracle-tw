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
  validateForm,
  t,
}) => [
  {
    type: "text",
    name: "firstName",
    label: t("common:common.Child’s first name", "Child’s first name"),
    required: true,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
    onChange: (e) => uniqueCheckHandler({ key: "firstName", e }),
  },
  {
    type: "text",
    name: "lastName",
    label: t(`common:common.Child’s last name`, `Child’s last name`),
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
    onChange: (e) => uniqueCheckHandler({ key: "lastName", e }),
  },
  {
    type: "dropdown",
    name: "gender",
    label: t("common:common.Gender", "Gender"),
    translateLabels: true,
    size: "medium",
    color: "#FFFFFF",
    required: true,
    validateOnChange: true,
    options: GenderListOptions,
    // value: values.gender,
    gridProps: { xs: 12 },
    onChange: () => uniqueCheckHandler({ values, setFieldError, validateForm }),
  },
  {
    type: "DatePicker",
    name: "dateOfBirth",
    label: t("common:common.Date of birth", "Date of birth"),
    placeholder: t("common:common.Date of birth", "Date of birth"),
    validateOnChange: true,
    size: "medium",
    color: "#FFFFFF",
    required: true,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12, md: 12 },
    // onChange: ()=>uniqueCheckHandler({values, setFieldError, validateForm})
  },
    ...(!values?.isNewFamily
      ? [{
        type: "dropdown",
        name: "TWFamilyId",
        label: "Family child is living with",
        translateLabels: true,
        required: false,
        validateOnChange: true,
        options: familyList || [],
        onChange: (name, fieldValue, data, reason) => {
          handleFamilyChange({ data, setFieldValue });
        },
        gridProps: { md: 12, xs: 12 },
      }] : []),
  {
    type: "dropdown",
    name: "TWChildCurrentPlacementStatusId",
    label: "Current living condition",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: childDropdownLists?.currentPlacementStatus || [],
    // value: values?.TWChildCurrentPlacementStatusId,
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "dropdown",
    name: "caseWorkerId",
    label: "Case worker for this child",
    translateLabels: true,
    required: true,
    validateOnChange: true,
    disabled: values?.TWFamilyId && values?.caseWorkerId?.length ? true : false, // Disable if family selected
    options:
      users.map((user) => ({
        value: `${user.firstName} ${user.lastName}`,
        id: user.id,
      })) || [],
    gridProps: { md: 12, xs: 12 },
  },
  {
    type: "CheckboxWithLabel",
    name: "childHasDisability",
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
    name: "isSameAsFamilyAddress",
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
  t,
}) => [
  {
    type: "text",
    name: "contactInformation.addressLine1",
    label: t("common:common.Address 1", "Address 1"),
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
  },
  {
    type: "text",
    name: "contactInformation.addressLine2",
    label: t("common:common.Address 2", "Address 2"),
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
    // rops: { md: 6.5, xs: 6.5 }
  },
  {
    type: "text",
    name: "contactInformation.city",
    label: t("common:common.City", "City"),
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
  },
  {
    type: "dropdown",
    name: "contactInformation.TWStateId",
    label: t("common:common.State", "State"),
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options:
      StateList?.map((state) => ({ id: state.id, value: state.stateName })) ||
      [],
    gridProps: { xs: 12 },
  },
  {
    type: "ZIPCode",
    name: "contactInformation.zipCode",
    label: "Mailing code / Postal Index Number / ZIP code",
    required: false,
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12 },
  },
];

export const ChildAdditionalDetails = ({
  phoneRef,
  childDropdownLists,
  allLanguagesList,
}) => {
  return [
    {
      type: "PhoneNumber",
      name: "profileInformation.phoneNumber",
      label: "common:common.Phone Number",
      fullWidth: true,
      variant: "outlined",
      gridProps: { md: 12, xs: 12 },
      phoneRef: phoneRef,
    },
    {
      type: "text",
      name: "profileInformation.email",
      label: "Email",
      required: false,
      showTooltip: false,
      fullWidth: true,
      variant: "outlined",
      gridProps: { xs: 12 },
    },
    {
      type: "dropdown",
      name: "profileInformation.TWLanguageId",
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
      name: "profileInformation.ethnicity",
      label: "Ethnicity (only for US-based orgs)",
      translateLabels: true,
      required: false,
      validateOnChange: true,
      options: childDropdownLists?.ethnicity || [],
      gridProps: { xs: 12 },
    },
    {
      type: "dropdown",
      name: "profileInformation.TWChildEducationLevelId",
      label: "Education level",
      translateLabels: true,
      required: false,
      validateOnChange: true,
      options: childDropdownLists?.educationLevel || [],
      gridProps: { xs: 12 },
    },
    {
      type: "text",
      name: "profileInformation.allergy",
      label: "Allergies",
      required: false,
      showTooltip: false,
      fullWidth: true,
      variant: "outlined",
      gridProps: { xs: 12 },
    },
    {
      type: "text",
      name: "profileInformation.notes",
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
    name: "caseManagementInformation.dateOfEntry",
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
    name: "caseManagementInformation.dateOfCWSEntry",
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
    name: "caseManagementInformation.TWChildPlacementStatusId",
    label: "Case management step",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: childDropdownLists?.placementStatus || [],
    gridProps: { xs: 12 },
  },
  {
    type: "dropdown",
    name: "caseManagementInformation.level",
    label: "Level of care (US logs only)",
    translateLabels: true,
    required: false,
    validateOnChange: true,
    options: LevelOfCareOptions || [],
    gridProps: { xs: 12 },
  },
  {
    type: "text",
    name: "caseManagementInformation.medicaidNumber",
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
    name: "caseManagementInformation.placementId",
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
    type: "text",
    name: "caseManagementInformation.previousPlacementsCount",
    label: "# of previous placements (US logs only)",
    showTooltip: false,
    fullWidth: true,
    variant: "outlined",
    multiline: true,
    gridProps: { xs: 12 },
    // gridProps: { md: 6.5, xs: 6.5 }
  },
];

export const CaseCloseDetails = ({
  associationOptions,
  deactivationDeletionReason,
  values,
  t,
}) => [
  {
    type: "DatePicker",
    name: "dateCaseClosed",
    label: "Date case was closed",
   validateOnChange: true,
    size: "medium",
    color: "#FFFFFF",
    required: true,
    fullWidth: true,
    variant: "outlined",
    gridProps: { xs: 12, md: 12 },
  },
  {
    type: "radioGroup",
    name: "association",
    required: true,
    label: t(
      "common:family.Child/family association",
      "Child/family association",
    ),
    options: associationOptions,
  },
  {
    type: "radioGroup",
    name: "deactivationReason",
    required: true,
    label: t(
      "common:family.Why is this person being deactivated?",
      "Why is this person being deactivated?",
    ),
    options: deactivationDeletionReason.map((reason) => ({
      id: reason.id,
      label: reason.value
    })),
  },
  ...(values?.deactivationReason == "37"
    ? [{
        type: "text",
        name: "otherReason",
        label: "Please specify other reason",
        required: true,
        fullWidth: true,
        showTooltip: false,
        variant: "outlined",
        gridProps: { xs: 12 },
      }]
    : []),

];

export const FamilyChangeDetails = ({
  familyChangeValues,
  familyChangeReasons,
}) => {
  const reasons = familyChangeValues?.familyChangeDetails?.childDischargeReason;
  const showOther = Array.isArray(reasons) && reasons.includes("OTHER");
  return [
    {
      type: "DatePicker",
      name: "familyChangeDetails.childDischargedDate",
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
    {
      type: "MultipleCheckBoxWithLabel",
      name: "familyChangeDetails.childDischargeReason",
      label: "Why is this child being assigned to a different family?",
      options: familyChangeReasons || [],
      translateLabels: true,
      required: true,
      gridProps: { xs: 12 },
    },
  ];
};
