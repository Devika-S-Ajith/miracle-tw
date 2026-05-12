import { getDistrictList, getStateList } from "../../../../helpers/helperFunction";

export const familyBasicDetails = [
    {
        type: 'text',
        name: 'familyName',
        label: 'common:common.Family Name',
        required: true,
        showTooltip: false,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 6.5, xs: 12 }
    },
    {
        type: 'dropdown',
        name: 'caseWorker',
        label: 'common:common.Case worker',
        translateLabels: true,
        required: true,
        validateOnChange: true,
        labelKey: 'firstName',
        extraLabel: 'lastName',
        optionsSource: 'caseWorker',
        gridProps: { md: 6.5, xs: 12 }
    }
];

export const familyAdditionalDetails = [
    {
        type: 'dropdown',
        name: 'family_situation',
        label: 'common:family.Family Situation',
        required: false,
        validateOnChange: true,
        labelKey: 'value',
        optionsSource: 'familySituation',
        gridProps: { md: 6.5, xs: 12 }
    },
    {
        type: 'dropdown',
        name: 'family_type',
        label: 'common:family.Family type',
        required: false,
        validateOnChange: true,
        labelKey: 'type',
        optionsSource: 'familyTypeAndGoal',
        gridProps: { md: 6.5, xs: 12 }
    },
    {
        type: 'dropdown',
        name: 'goal',
        label: 'common:family.Goal',
        required: false,
        validateOnChange: true,
        labelKey: 'value',
        optionsSource: 'goals', // Special flag for dynamic options
        getDynamicOptions: (values, familyTypeAndGoal) => {
            return familyTypeAndGoal
                ?.find((item) => item.id === values.family_type)
                ?.goals || [];
        },
        gridProps: { md: 6.5, xs: 12 }
    },
    {
        type: 'dropdown',
        name: 'language',
        translateLabels: true,
        label: 'common:common.Primary Language',
        optionsSource: 'languages',
        accessKey: 'language',
        labelKey: 'language',
        valueKey: 'id',
        textFieldProps: {
            fullWidth: true,
            margin: 'normal',
            variant: 'outlined'
        },
        gridProps: { md: 6.5, xs: 12 }
    },
    {
        type: 'text',
        name: 'licenceNumber',
        label: 'common:common.Licence number',
        showTooltip: false,
        autoFocus: false,
        gridProps: { md: 6.5, xs: 12 }
    },
];

export const familyAddressDetails = [
    // Address Line 1
    {
        type: 'text',
        name: 'address1',
        label: 'common:common.Address 1',
        required: false,
        autoFocus: false,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 6.5, xs: 12 }
    },

    // Address Line 2
    {
        type: 'text',
        name: 'address2',
        label: 'common:common.Address 2',
        showTooltip: false,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 6.5, xs: 12 }
    },

    // City
    {
        type: 'text',
        name: 'city',
        label: 'common:common.City',
        required: false,
        showTooltip: false,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 6.5, xs: 12 }
    },

    {
        type: 'dropdown',
        name: 'state',
        translateLabels: true,
        label: 'common:common.State/Region',
        required: false,
        optionsSource: 'state',
        accessKey: 'stateName',
        labelKey: 'stateName',
        valueKey: 'id',
        // Custom function to get states for selected country
        getDynamicOptions: (values, locationList) => getStateList(locationList, values.country),
        textFieldProps: {
            fullWidth: true,
            margin: 'normal',
            variant: 'outlined'
        },
        gridProps: { md: 6.5, xs: 12 }
    },

    // District/County (conditional - only shows if country requires it)
    {
        type: 'dropdown',
        name: 'district',
        translateLabels: true,
        label: 'common:common.District/County',
        required: false,
        optionsSource: 'district',
        accessKey: 'districtName',
        labelKey: 'districtName',
        valueKey: 'id',
        // Custom function to get districts for selected state
        getDynamicOptions: (values, locationList) => getDistrictList(locationList, values?.country, values.state),
        // Conditional rendering - only show if country requires district
        condition: {
            field: 'country',
            operator: 'custom',
            evaluate: (values, dataOptions) => {
                if (!values.country) return false;
                const country = dataOptions.locationList?.find(c => c.id === values.country);
                return country?.districtRequired === true;
            }
        },
        textFieldProps: {
            fullWidth: true,
            margin: 'normal',
            variant: 'outlined'
        },
        gridProps: { md: 6.5, xs: 12 }
    },

    // ZIP/Postal Code (with dynamic formatting)
    {
        type: 'ZIPCode',
        name: 'zip_code',
        label: 'common:common.ZIP/postal Code',
        required: false,
        disabled: false,
        // Dynamic placeholder based on country
        getPlaceholder: (values, locationList) => {
            const country = locationList?.find(obj => obj.id === values.country);
            return country?.isoCode?.toUpperCase() === 'IND' ? '888888' : '88888';
        },
        // Dynamic format based on country
        getFormat: (values, locationList) => {
            const country = locationList?.find(obj => obj.id === values.country);
            return country?.isoCode?.toUpperCase() === 'IND' ? '######' : '#####';
        },
        condition: {
            field: 'country',
            operator: 'truthy'
        },
        gridProps: { md: 6.5, xs: 12 }
    },
    {
        type: 'MonthYearPicker',
        name: 'DateStartedasFP',
        label: 'common:family.Date the family first started serving as a foster family',
        showTooltip: false,
        fullWidth: true,
        variant: 'outlined',
        gridProps: { md: 6.5, xs: 12 }
    },

];


