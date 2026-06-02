import React from "react";
import { Chip } from "@mui/material";
import { utcToDateFormat, utcToLocalTimeWithoutSeconds } from "../../../../helpers/helperFunction";

const renderFormattedEnum = ({
  childComponentType,
  componentType,
  userResponseValue,
  childItems,
  dateTimer
}) => {
  if (["CUSTOM_DATE_TIME_PICKER", "DATE_VIEW"].includes(componentType)) {
    return dateTimer
      ? `${utcToDateFormat(userResponseValue)} ${utcToLocalTimeWithoutSeconds(
          userResponseValue
        )}`
      : utcToDateFormat(userResponseValue);
  }

  const supportedTypes = new Set([
    "VERTICAL_CARD_WITH_TEXT",
    "SIMPLE_CARD_WITH_TEXT",
    "SIMPLE_CARD_WITH_URL_ICON",
    "SIMPLE_HORIZONTAL_TEXT_CARD",
    "SINGLE_TEXT_INPUT_WITH_BUTTON",
  ]);

  if (!supportedTypes.has(childComponentType)) {
    return userResponseValue;
  }

  const findItem = (id) => childItems?.find((item) => item.id === id);

  if (!Array.isArray(userResponseValue)) {
    const item = findItem(userResponseValue);
    return item?.icon ? (
      <img width={25} height={25} src={item.icon} alt="" />
    ) : (
      item?.title
    );
  }

  return userResponseValue
    ?.map((value) => findItem(value)?.title)
    .filter(Boolean)
    .join(", ");
};

export const renderAnswerColumn = (templateList, isDetailPage) => {
  switch (templateList?.componentType) {
    case 'HORIZONTAL_LIST': {
      if (templateList?.childComponentType === "SIMPLE_CARD_WITH_URL_ICON"){
        return (
          templateList?.childComponentType === "SIMPLE_CARD_WITH_URL_ICON" && !(Array.isArray(templateList?.userResponseValue)) ? <img width={25} height={25}
            src={templateList?.childItems?.find(item => item.id === templateList?.userResponseValue)?.icon}>
          </img> : templateList?.userResponseValue?.map(value => {
            const item = templateList?.childItems.find(child => child.id === value);
            return item ? item.title : null;
          })
            .filter(Boolean) // Filter out null values in case of unmatched IDs
            .join(", ")
        )
      } else if(templateList?.childComponentType === "SIMPLE_CARD_WITH_TEXT"){
        return renderFormattedEnum(templateList);
      } else {
        return templateList?.userResponseValue
      }
    }
    case 'VERTICAL_CARDS':
    case 'VERTICAL_LIST':
    case 'HORIZONTAL_GRID':
    case 'CUSTOM_DATE_TIME_PICKER':
    case 'DATE_VIEW':
      return renderFormattedEnum(templateList);
    case 'YES_NO': {
      if (isDetailPage) {
        return (
          templateList?.userResponseValue === "noAction" ?
            <Chip
              label="NO"
              sx={{
                borderRadius: '4px',
                width: 'fit-content',
                height: 'fit-content',
                py: 1,
                backgroundColor: '#1D334B',
                color: 'white'
              }}
            /> : (templateList?.userResponseValue === "yesAction" &&
              templateList?.actions?.[templateList?.userResponseValue]?.[0]?.componentType === 'HORIZONTAL_LIST') ?
              renderAnswerColumn(templateList?.actions?.[templateList?.userResponseValue]?.[0], isDetailPage)
              : <Chip
                label="Yes"
                sx={{
                  borderRadius: '4px',
                  width: 'fit-content',
                  height: 'fit-content',
                  py: 1,
                  backgroundColor: '#1D334B',
                  color: 'white'
                }}
              />
        )
      } else {
        return templateList?.userResponseValue === "noAction" 
          ? (templateList?.noButton?.label || "No") 
          : (templateList?.yesButton?.label || "Yes");
      }
    }
    case 'DATE_PICKER': {
      return utcToDateFormat(templateList?.responseValue)
    }
    case 'DROP_DOWN': {
      return  templateList?.childItems?.find(child => child.value === templateList?.userResponseValue)?.label;
    }
    case 'CHECK_BOX_WITH_OPTIONS': {
      return templateList?.userResponseValue.join(", ");
    }
    case 'DATE_RANGE_PICKER': {
      return `${utcToDateFormat(templateList?.userResponseValue.fromDate)} - ${utcToDateFormat(templateList?.userResponseValue.toDate)}`;
    }
    default: {
      const value = templateList?.userResponseValue;

      const formatString = (str) =>
        str
          ? str.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))
          : "-"; // Show "-" if empty string

      if (Array.isArray(value)) {
        return value.map((item) =>
          typeof item === "string" ? formatString(item) : item
        );
      }

      return typeof value === "string" ? formatString(value) : value;
    }
  }
}

export const renderAnswerColumnList = (templateList, answerValue) => {
  switch (answerValue?.componentType) {
    case 'HORIZONTAL_LIST': {
      return (
        templateList?.childComponentType === "SIMPLE_CARD_WITH_URL_ICON" ? <img width={25} height={25}
          src={templateList?.childItems?.find(item => item.id === answerValue?.responseValue)?.icon}>
        </img> : answerValue?.responseValue?.join(", ")
      )
    }
    case 'YES_NO': {
      return (
        answerValue?.responseValue === "noAction" ? "No" : "Yes"
      )
    }
    case 'DATE_PICKER': {
      return utcToDateFormat(answerValue?.responseValue)
    }
    case 'TEXT': {
      return answerValue?.responseValue
    }

    default: {
      return answerValue?.responseValue
    }

  }
}

export const renderCommentsColumn = (templateList, innerChild = false) => {
  if (!templateList?.length) return null;

  const lastTemplate = templateList[templateList.length - 1];
  const { componentType, userResponseValue, actions } = lastTemplate || {};

  switch (componentType) {
    case 'TEXT_INPUT':
      return innerChild ? userResponseValue : templateList.length > 1 && userResponseValue;
    case 'YES_NO':
      const innerTemplateList = actions?.[userResponseValue];
      return renderCommentsColumn(innerTemplateList, true);

    default:
      return null;
  }
};

