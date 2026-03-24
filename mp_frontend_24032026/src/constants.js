import moment from "moment-timezone";
import { CommonDataContext } from "./common/contexts/CommonDataContext";
import { useContext } from "react";
import dayjs from "dayjs";
import APIS from "./common/hooks/UseApiCalls";

export const THEMES = {
  LIGHT: "LIGHT",
  DARK: "DARK",
  NATURE: "NATURE",
};

export const GenderList = ["FEMALE", "MALE", "OTHER", "PREFER_NOT_TO_DISCLOSE"];

export const GenderListOptions = [
    {
      id: "FEMALE",
      value: "Female",
    },
    {
      id: "MALE",
      value: "Male",
    },
    {
      id: "OTHER",
      value: "Other",
    },
    {
      id: "PREFER_NOT_TO_DISCLOSE",
      value: "Prefer not to disclose",
    },
  ];
  export const LevelOfCareOptions = [
    {
      id: "BASIC",
      value: "Basic",
    },
    { id: "MODERATE", value: "Moderate" },
    { id: "SPECIALIZED", value: "Specialized" },
    { id: "INTENSE", value: "Intense" },
  ];

export const DateFormat = "MM/DD/YYYY";

export const dateFormatter = (data, month = "numeric", params) => {
  const {region = "en-us"} = params || {};
  if (data) {
    return new Date(fromUtc(data))?.toLocaleString(region, {
      day: "2-digit",
      month: month,
      year: "numeric",
    });
  }
};

export const MonthDayYearFormatter = (data, month = "short") => {
  if (data) {
    return new Date(fromUtc(data))?.toLocaleString("en-us", {
      month: month,
      day: "2-digit",
      year: "numeric",
    });
  }
};

export const timeFormatter = (data ,params) => {
  const {hideSeconds} = params || {};
  if (data) {
    return new Date(fromUtc(data))?.toLocaleString("en-us", {
      // day: "2-digit",
      // month: "numeric",
      // year: "numeric",
      hour12: true,
      hour: "2-digit", // numeric, 2-digit
      minute: "2-digit", // numeric, 2-digit
      second: hideSeconds ? undefined : "2-digit", // numeric, 2-digit
    });
  }
};

export const timeFormatterGB = (data, params ) => {
  const {hideSeconds} = params || {};
  if (data) {
    return new Date(fromUtc(data))?.toLocaleString("en-GB", {
      // day: "2-digit",
      // month: "numeric",
      // year: "numeric",
      hour12: true,
      hour: "2-digit", // numeric, 2-digit
      minute: "2-digit", // numeric, 2-digit
      second: hideSeconds ? undefined : "2-digit", // numeric, 2-digit
    });
  }
};

export const dateTimeFormatter = (data, month = "numeric") => {
  if (data) {
    return new Date(fromUtc(data))?.toLocaleString("en-us", {
      day: "2-digit",
      month: month,
      year: "numeric",
      hour12: true,
      hour: "2-digit", // numeric, 2-digit
      minute: "2-digit", // numeric, 2-digit
      second: "2-digit", // numeric, 2-digit
    });
  }
};

export const dateFormatterRevers = (data, month = "long") => {
  if (data) {
    // Split input date "dd/mm/yyyy"
    const [day, monthValue, year] = data.split("/").map(Number);

    // Create a new Date object in correct format (yyyy, mm-1, dd)
    const date = new Date(year, monthValue - 1, day);

    return date.toLocaleString("en-us", {
      day: "2-digit",
      month: month, // "long" for full month name, "short" for abbreviated
      year: "numeric",
    });
  }
};

export function formatTime(timeString) {
  if (!timeString) return ""; // If input is empty, return empty string

  const date = new Date(timeString); // Parse the date string
  if (isNaN(date.getTime())) return timeString; // Check if the date is valid

  const hours = String(date.getHours()).padStart(2, "0"); // Get hours
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Get minutes
  const seconds = String(date.getSeconds()).padStart(2, "0"); // Get seconds

  return `${hours}:${minutes}:${seconds}`; // Return formatted time
}

export function formatTimeForMapping(timeString) {
  // Extract hours, minutes, and seconds from the time string
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  // Create a new Date object with the desired date and time
  const date = new Date();

  // Get the regional offset in minutes
  const regionalOffsetMinutes = date.getTimezoneOffset();

  // Adjust the time based on the regional offset
  date.setUTCMinutes(date.getUTCMinutes() + regionalOffsetMinutes);
  date.setUTCHours(hours);
  date.setUTCMinutes(minutes);
  date.setUTCSeconds(seconds);

  // Format the Date object to a datetime string without milliseconds
  const datetimeString = date.toISOString().slice(0, -5);
  return datetimeString;
}

export function convertTimeToAMPM(timeString) {
  // Split the time string into hours, minutes, and seconds
  const [hours, minutes, seconds] = timeString.split(":")?.map(Number);

  // Create a new Date object with the given time
  const date = new Date();
  date.setHours(hours, minutes, seconds);

  // Get the hours and minutes in AM/PM format
  let hoursInAMPM = date.getHours();
  const minutesString = String(date.getMinutes()).padStart(2, "0");
  const ampm = hoursInAMPM >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hoursInAMPM = hoursInAMPM % 12 || 12;

  // Construct the formatted time string
  const formattedTime = `${hoursInAMPM}:${minutesString} ${ampm}`;

  return formattedTime;
}

export const getDayFromDate = (value) => {
  // Create a Date object from the given date string
  const date = new Date(value);

  // Array to map numeric day of week to its name
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get the day of the week as a number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeekNumber = date.getDay();

  // Get the name of the day of the week
  const dayOfWeek = daysOfWeek[dayOfWeekNumber];
  return dayOfWeek;
};

export const convertUnderscoreToText = (input) => {
  if (!input) return ""; // Return empty string if input is null, undefined, or empty

  // Remove underscores and split the string into words
  const words = input.split("_");

  // Capitalize the first letter of the first word
  const firstWord =
    words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

  // Capitalize the first letter of subsequent words and join them with spaces
  const restWords = words
    .slice(1)
    .map((word) => word.charAt(0).toLowerCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Combine the first word and the rest of the words
  return firstWord + " " + restWords;
};

export const convertUnderscoreToTextWithAnd = (input) => {
  if (!input) return ""; // Return empty string if input is null, undefined, or empty

  // Split the string by underscores
  const words = input.split("_");

  // Capitalize the first letter of the first word
  const firstWord =
    words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

  // Capitalize the first letter of subsequent words
  const restWords = words
    .slice(1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" and ");

  // Combine the first word and the rest of the words
  return firstWord + (restWords ? " and " + restWords : "");
};

export const formatText = (originalString) => {
  let convertedString =
    originalString.charAt(0).toUpperCase() +
    originalString.slice(1).toLowerCase();
  return convertedString;
};

export const combineTimeDate = (date, time) => {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth() + 1;
  const day = parsedDate.getDate();

  let combinedTime = new Date(
    year,
    month - 1,
    day,
    time.split(":")[0],
    time.split(":")[1],
    time.split(":")[2]
  );
  return combinedTime;
};

export function toUtc(value) {
  // Get the browser's current time zone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a moment object from the time and time zone
  const momentObj = moment.tz(value, timeZone);

  // Convert to UTC
  const utcTime = momentObj.utc();

  return utcTime;
}

export function fromUtc(utcTime) {
  // Get the browser's current time zone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a moment object from the UTC time
  const momentObj = moment.utc(utcTime);

  // Convert to local time
  const localTime = momentObj.tz(timeZone);

  return localTime;
}

export const FilterKeywords = {
  placementStatus: "Placement status",
  familyStatus: "Family status",
  IN_FOSTER_PLACEMENT: "In foster placement",
  DISCHARGED: "Discharged",
  caseManager: "Case manager",
  status: "Status",
  MPSystemMessageTypeId: "Message type",
  from: "From",
  to: "To",
  active_pending: "Active and pending",
  caseWorkerId: "Case manager"
};

export const DateFormatFromRegion = (isShort = false) => {
  const { locationList } = useContext(CommonDataContext);

  const userRegion = locationList.find(
    (location) => location.id === localStorage.getItem("userRegion")
  );
    switch (userRegion?.isoCode) {
      case "US":
        return isShort ? "MMM D YYYY" : "MM/DD/YYYY";

      case "UGN":
        return isShort ?  "MMM D YYYY" : "DD/MM/YYYY";

      case "IND":
        return isShort ? "MMM D YYYY" : "DD/MM/YYYY";

      default:
        return "MM/DD/YYYY";
    }
};

export const DateTimeFormatFromRegion = () => {
  const { locationList } = useContext(CommonDataContext);

  const userRegion = locationList.find(
    (location) => location.id === localStorage.getItem("userRegion")
  );

  if (userRegion?.isoCode === "US")
    switch (userRegion?.isoCode) {
      case "US":
        return "MM/DD/YYYY hh:mm a";

      case "UGN":
        return "DD/MM/YYYY hh:mm a";

      case "IND":
        return "DD/MM/YYYY hh:mm a";

      default:
        return "MM/DD/YYYY hh:mm a";
    }
};

export const DaysInWeek = [
  { day: "Monday", label: "MON" },
  { day: "Tuesday", label: "TUE" },
  { day: "Wednesday", label: "WED" },
  { day: "Thursday", label: "THU" },
  { day: "Friday", label: "FRI" },
  { day: "Saturday", label: "SAT" },
  { day: "Sunday", label: "SUN" },
];

// Utility function to strip HTML tags and get plain text
export const stripHtmlTags = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const filterMessagesByCurrentTime = (messages) => {
  const now = new Date(); // Get the current time

  // Ensure messages is an array before filtering
  if (!Array.isArray(messages)) {
    console.error(
      "The messages parameter is not an array or is undefined:",
      messages
    );
    return []; // Return an empty array to avoid further errors
  }

  return messages.filter((message) => {
    const startDateTime = new Date(message.startDateTime);
    const endDateTime = new Date(message.endDateTime);

    // Check if the current time is between startDateTime and endDateTime
    return now >= startDateTime && now <= endDateTime;
  });
};

export const DateTimeFormatStringNumaric = (isoString) => {
  if (isoString) {
    return new Date(fromUtc(isoString))?.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour12: true,
      hour: "2-digit", // numeric, 2-digit
      minute: "2-digit", // numeric, 2-digit
      // numeric, 2-digit
    });
  }
};

export const toSentenceCase = (str) => {
  const removeUnderScore = str?.replace(/_/g, " ");
  if (removeUnderScore) {
    return (
      removeUnderScore?.charAt(0).toUpperCase() +
      removeUnderScore?.slice(1).toLowerCase()
    );
  } else {
    return "Any";
  }
};

export const getNavbarFilterPayload = (navbarFilterValues = [], linkedAccounts = []) => {
  const getByKey = (key, prop) =>
    navbarFilterValues.filter(item => item.key === key).map(item => item[prop]);

  let accountFilter = getByKey("ORG", "id");
  if (!accountFilter.length && linkedAccounts.length) {
    accountFilter = linkedAccounts.map(acc => acc.accountId);
  }

  const userRegion = localStorage.getItem("userRegion");
  return {
    accountFilter,
    countryFilter: userRegion ? [userRegion] : null,
    stateFilter: getByKey("STATE", "id"),
    districtFilter: getByKey("REGION", "id"),
    zipCodeFilter: getByKey("ZIPCODE", "value"),
  };
};

export const BreadcrumbsLinkThriveScale = (t, navigate) => ({
  label: t("common:common.Thrive Scale", "Thrive Scale"),
  onClick: () => navigate("/dashboard"),
});

export const BreadcrumbsLinkThriveScaleGovtDashboard = (t, navigate) => ({
  label: t("common:common.Thrive Scale", "Thrive Scale"),
  onClick: () => navigate("/governmentDashboardOverview"),
});

export const CommaseparateString = (array, separator = ", ", lastSeparation = ", ") => {
  if (!Array.isArray(array) || array.length === 0) {
    return "";
  }
  // Filter out null or undefined elements
  const filteredArray = array.filter(item => item !== null && item !== undefined);
  if (filteredArray.length === 0) {
    return "";
  }
  if (filteredArray.length === 1) {
    return filteredArray[0];
  }
  if (filteredArray.length === 2) {
    return filteredArray.join(lastSeparation);
  }
  return filteredArray.slice(0, -1).join(separator) + lastSeparation + filteredArray[filteredArray.length - 1];
}

export const EncryptId = (title) => {
  if (!title) return "";
  return btoa(encodeURIComponent(title));
};

export const DecryptId = (encryptedId) => {
  try {
    return decodeURIComponent(atob(encryptedId));
  } catch (e) {
    return "";
  }
};

export const DOMAIN_ICONS = {
  1: "/static/icons/familyAndRelationships.svg",
  2: "/static/icons/householdEconomy.svg",
  3: "/static/icons/livingConditions.svg",
  4: "/static/icons/education.svg",
  5: "/static/icons/healthAndMentalHealth.svg",
};

export const STATUS_ICONS = {
  "Completed": "/static/icons/completedIcon.png",
  "Not Started": "/static/icons/notStartedIcon.png",
  "Intervention Not Started": "/static/icons/notStartedIcon.png",
  "In Progress": "/static/icons/inProgressIcon.png",
  "Intervention No Longer Relevant": "/static/icons/notStartedIcon.png",
};

export const StatusMapping = {
  "Positive Impact": {
    label: "Improved situation",
    color: "#3DAA1D33",
    borderColor: "#3DAA1D",
  },
  "Made Worse": { label: "Worse", color: "#BC104133", borderColor: "#BC1041" },
  "No Impact": {
    label: "No impact",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
  "Potential Positive Impact": {
    label: "Potential positive impact",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
  "No Potential Impact": {
    label: "No potential impact",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
  "Plan To Continue": {
    label: "Continued",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
  "Dont Plan To Continue": {
    label: "Discontinued",
    color: "#BC104133",
    borderColor: "#BC1041",
  },
  "Have Replaced": {
    label: "Another intervention has been selected",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
  "Will Replace": {
    label: "Another intervention will be selected",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
  "Will Not Replace": {
    label: "Another intervention has not been selected",
    color: "#71C5D44D",
    borderColor: "#71C5D4",
  },
};

export const getMappedMessage = (message, statusType) => {
     return StatusMapping[statusType]
       ? message + " - " + StatusMapping[statusType].label
       : message;
   };
export const UpdateDashboardDataViews = async () => {
  try {
    await APIS.UpdateDashboardDataViews();
  } catch (error) {
    console.error("UpdateDashboardDataViews error:", error);
  }
};
