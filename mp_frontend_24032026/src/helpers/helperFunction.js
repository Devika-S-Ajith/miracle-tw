import { isObject } from "lodash";
import { Buffer } from "buffer";
import moment from "moment";
import { ModalService } from "../components/Modal";
import { DateFormatFromRegion } from "../constants";
import APIS from "../common/hooks/UseApiCalls";
import { PhoneNumberUtil } from "google-libphonenumber";


export const getLocationNames = (locationList, countryID, stateID) => {
  const selectedCountry = locationList?.find(
    (individualCountry) => individualCountry.id == countryID
  );

  if (selectedCountry) {
    const countryName = selectedCountry.countryName;
    if (stateID !== null) {
      const selectedState = selectedCountry.states?.find(
        (state) => state.id === stateID
      );

      if (selectedState) {
        const stateName = selectedState.stateName;
        return stateName;
      }
    }

    return countryName;
  }
  return;
};

export const getStateList = (locationList, countryID) => {
  const selectedCountry = locationList?.find(
    (individualCountry) => individualCountry.id == countryID
  );
  if (selectedCountry) {
    const stateList = selectedCountry.states;
    return stateList;
  }
  return;
};

export const getDistrictList = (locationList, countryID, stateID) => {
  const selectedCountry = locationList?.find(
    (individualCountry) => individualCountry.id == countryID
  );
  const selectedState = selectedCountry?.states?.find(
    (individualState) => individualState.id == stateID
  );
  if (selectedState) {
    const districtList = selectedState.districts;
    return districtList;
  }
  return;
};

export const getSelectedCountryDetails = (locationList, countryID) => {
  return locationList?.find(
    (individualCountry) => individualCountry.id == countryID
  );
};

export const handleCloseFormsWarning = (t, dirty, navigate) => {
  if (dirty) {
    ModalService.open(() => <></>, {
      modalTitle: t("common:common.Unsaved Changes"),
      width: "30%",
      modalDescription: t(
        "common:common.If you leave this page, any changes you have made will be lost"
      ),
      actionButtonText: t("common:common.Leave page"),
      cancelButtonText: t("common:common.Cancel"),
      onClick: () => navigate(-1),
    });
  } else {
    navigate(-1);
  }
};

// export const fileUpload = async (selectedFile, signedURL) => {

//   const buffer = Buffer.from(selectedFile.base64, 'base64')
//   const response = await fetch(signedURL, {
//       method: 'PUT',
//       headers: {
//           'Content-Type': selectedFile.type
//       },
//       body: buffer
//   });
//   return response;
// };

export const fileUpload = async (selectedFile, signedURL) => {
  // Convert the selected file to a base64 string
  const reader = new FileReader();
  reader.readAsDataURL(selectedFile);
  console.log("base64String", reader);
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const base64String = reader.result.split(",")[1];
      const buffer = Buffer.from(base64String, "base64");
      console.log("base64String", base64String, buffer);

      try {
        const response = await fetch(signedURL, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.type,
          },
          body: buffer,
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export function getTimeZone() {
  const timezone = moment.tz.guess();
  return timezone;
}

export function utcToLocalDate(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime).local();
  return localDateTime.format(DateFormatFromRegion());
}

export function utcToDateFormat(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime);
  return localDateTime.format(DateFormatFromRegion());
}

export function utcToDateFormatMonthDayYear(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime);
  return localDateTime.format('MMM D, YYYY');
}

export function monthYear(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime);
  return localDateTime.format("MMMM YYYY"); // Output: April 2024
}

export function monthYearShort(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime);
  return localDateTime.format("MMM YYYY"); // Output: Apr 2024
}

export function utcToLocalDateReverse(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime).local();
  return localDateTime.format("YYYY-MM-DD");
}

export function utcToLocal(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime).local();
  return localDateTime.format("DD-MM-YYYY h:mm:ss A");
}
export function utcToLocalWithoutSecond(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime).local();
  return localDateTime.format("DD-MM-YYYY h:mm A");
}

export function utcToLocalTime(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime).local();
  return localDateTime.format("h:mm:ss A");
}

export function utcToLocalTimeWithoutSeconds(utcDateTime) {
  const localDateTime = moment.utc(utcDateTime).local();
  return localDateTime.format("h:mm A");
}

export const toUTCStartofDay = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  // Build UTC midnight from local date parts
  return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
  )).toISOString();
};

// Returns the UTC end-of-day timestamp (23:59:59.999Z) for the given date
export const toUTCEndOfDay = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  // Build UTC end of day from local date parts
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59, 999
  )).toISOString();
};

export const getDate = (dateToFormat = null) => {
  let yourDate;
  if (dateToFormat === null) {
    yourDate = new Date();
  } else {
    yourDate = new Date(dateToFormat);
  }
  // let yourDate = new Date(dateToFormat)
  // yourDate.toISOString().split('T')[0];
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  return yourDate.toISOString().split("T")[0];
};

export function formatDateTimeToISOString(dateToFormat, timeToFormat) {
  let yourDate, yourTime;
  if (dateToFormat === null) {
    yourDate = new Date();
    yourTime = new Date();
  } else {
    yourDate = new Date(dateToFormat);
    yourTime = new Date(timeToFormat);
  }

  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  yourTime = new Date(yourTime.getTime() - offset * 60 * 1000);

  const date = yourDate.toISOString().split("T")[0];
  const time = yourTime.toISOString().split("T")[1];

  const nd = `${date} ${time}`;
  try {
    return new Date(nd).toISOString();
  } catch (e) {}
}

export function formatDateTime(dateToFormat, timeToFormat) {
  let yourDate, yourTime;
  if (dateToFormat === null) {
    yourDate = new Date();
    yourTime = new Date();
  } else {
    yourDate = new Date(dateToFormat);
    yourTime = new Date(timeToFormat);
  }

  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  yourTime = new Date(yourTime.getTime() - offset * 60 * 1000);

  const date = yourDate.toISOString().split("T")[0];
  const time = yourTime.toISOString().split("T")[1].slice(0, 8);

  const nd = `${date} ${time}`;
  try {
    return nd;
  } catch (e) {}
}

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const formattedTime = date.toLocaleString("en-US", options);
  const dateFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = date
    .toLocaleString("en-US", dateFormatOptions)
    .replace(/,/g, ",");

  return `${formattedTime}, ${formattedDate}`;
};

export const currentDateAndTime = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");
  return `${day}_${month}_${year}-${hours}_${minutes}_${seconds}`;
};

export const generateUniqueKeyForImage = (fileName) => {
  const prefix = (
    Math.floor(Math.random() * (99999 - 1000 + 1)) + 1000
  ).toString();
  const resultString = prefix.concat(fileName);
  return resultString;
};

export const getFirstErrorKey = (object, keys = []) => {
  const firstErrorKey = Object.keys(object)[0];
  if (isObject(object[firstErrorKey])) {
    return getFirstErrorKey(object[firstErrorKey], [...keys, firstErrorKey]);
  }
  return [...keys, firstErrorKey].join(".");
};

export function calculateAge(timestamp,t) {
  const birthDate = new Date(timestamp);
  if (isNaN(birthDate)) {
    throw new Error("Invalid timestamp provided to calculateAge");
  }

  const currentDate = new Date();

  // Calculate difference in years
  let ageInYears = currentDate.getFullYear() - birthDate.getFullYear();

  // Adjust age if birthday hasn't occurred yet this year
  const currentMonth = currentDate.getMonth();
  const birthMonth = birthDate.getMonth();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDate.getDate() < birthDate.getDate())
  ) {
    ageInYears--;
  }

  // If less than 1 year old
  if (ageInYears < 1) {
    let ageInMonths =
      (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
      (currentDate.getMonth() - birthDate.getMonth());

    if (currentDate.getDate() < birthDate.getDate()) {
      ageInMonths--; // Birthday day hasn't come yet this month
    }

    ageInMonths = Math.max(0, ageInMonths);

    if (ageInMonths < 1) {
      const ageInDays = Math.floor(
        (currentDate - birthDate) / (1000 * 60 * 60 * 24)
      );

      if (ageInDays >= 7) {
        const ageInWeeks = Math.floor(ageInDays / 7);
        return t("common.weeks", { count: ageInWeeks });
      }
      return t("common.days", { count: ageInDays });
    }
    return t("common.months", { count: ageInMonths });
  }
  return t("common.years", { count: ageInYears });
}


export function calculateAgeReverseOrder(timestamp) {
  const [day, month, year] = timestamp.split("/").map(Number);

  // Create the date object with the correct order (year, month - 1, day)
  const birthDate = new Date(year, month - 1, day);
  const currentDate = new Date();

  let ageInYears = currentDate.getFullYear() - birthDate.getFullYear();

  // Adjust age if birthday hasn't occurred yet this year
  const currentMonth = currentDate.getMonth();
  const birthMonth = birthDate.getMonth();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDate.getDate() < birthDate.getDate())
  ) {
    ageInYears--;
  }

  // If less than 1 year old
  if (ageInYears < 1) {
    let ageInMonths =
      (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
      (currentDate.getMonth() - birthDate.getMonth());

    if (currentDate.getDate() < birthDate.getDate()) {
      ageInMonths--; // Birthday day hasn't come yet this month
    }

    ageInMonths = Math.max(0, ageInMonths);

    if (ageInMonths < 1) {
      const ageInDays = Math.floor(
        (currentDate - birthDate) / (1000 * 60 * 60 * 24)
      );

      if (ageInDays >= 7) {
        const ageInWeeks = Math.floor(ageInDays / 7);
        return `${ageInWeeks} week${ageInWeeks === 1 ? "" : "s"} old`;
      }

      return `${ageInDays} day${ageInDays === 1 ? "" : "s"} old`;
    }

    return `${ageInMonths} month${ageInMonths === 1 ? "" : "s"} old`;
  }

  return `${ageInYears} year${ageInYears === 1 ? "" : "s"} old`;
}

const getConsentName = (assessment) => {
  if (!assessment) return "";

  const { HTFamilyMemberId, HTChildId, memberFirstName, memberLastName, childFirstName, childLastName } = assessment;

  // Determine which name fields to use based on which ID is present
  const isMember = HTFamilyMemberId != null;
  const isChild = HTChildId != null;

  // Edge case: both null or both non-null — fallback priority: member > child > ""
  const firstName = isMember
    ? memberFirstName
    : isChild
    ? childFirstName
    : memberFirstName ?? childFirstName ?? "";

  const lastName = isMember
    ? memberLastName
    : isChild
    ? childLastName
    : memberLastName ?? childLastName ?? "";

  const first = firstName?.trim() || "";
  const last = lastName?.trim() || "";

  if (!first && !last) return "";
  return last ? `${first} ${last}`.trim() : first;
};

export const generateConsentPdfHandler = async (id, assessment) => {
  try {
    const payLoad = {
      HTConsentId: id,
      HTLanguageId: getLanguageId(),
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const res = await APIS.generateConsent(payLoad);
    // Open PDF in a new tab using Blob to avoid deprecated document.write and ensure full load
    const byteCharacters = atob(res.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const newTab = window.open();
    if (newTab) {
      newTab.document.title = `Consent_${getConsentName(assessment)}`;
      newTab.document.body.style.margin = "0";
      const embed = newTab.document.createElement("embed");
      embed.src = blobUrl;
      embed.type = "application/pdf";
      embed.width = "100%";
      embed.height = "100%";
      newTab.document.body.appendChild(embed);
    }
  } catch (error) {
    console.error(error);
  }
};


export const getLanguageId = () => {
  const currentLanguage = localStorage.getItem("language");
  const currentLanguageList = JSON.parse(localStorage.getItem("languageList"));
  let langId;
  if (!currentLanguage || !currentLanguageList?.length) {
    langId = "1";
  } else {
    langId =
      currentLanguageList?.length &&
      currentLanguageList.find((item) => item.languageCode == currentLanguage)
        ?.id;
  }
  return langId;
};

export const validatePhoneNumber = (value, ref, params) => {
  
  if(!value) return true
  const phoneUtil = PhoneNumberUtil.getInstance();
  try {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(value);
    return phoneUtil.isValidNumber(phoneNumber);
  } catch (error) {
    // Allow only dial code if not required, or disallow if required and only dial code is present
    if (value === "+" + ref.current.dialCode) {
      return !params?.required;
    }
    if (value === ref.current.dialCode && params?.required) {
      return false;
    }
    return false; // Handle parsing errors
  }
};

export const splitCountryCodeAndPhoneNumber = (phoneValue) => {
  if (!phoneValue || typeof phoneValue !== "string") {
    return {
      countryCode: "",
      countryCodeDigits: "",
      phoneNumber: "",
      e164PhoneNumber: "",
    };
  }

  const normalizedValue = phoneValue.trim();
  if (!normalizedValue) {
    return {
      countryCode: "",
      countryCodeDigits: "",
      phoneNumber: "",
      e164PhoneNumber: "",
    };
  }

  const phoneUtil = PhoneNumberUtil.getInstance();
  try {
    const parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(normalizedValue);
    const countryCodeDigits = String(parsedPhoneNumber.getCountryCode() || "");
    const phoneNumber = phoneUtil.getNationalSignificantNumber(parsedPhoneNumber);

    return {
      countryCode: countryCodeDigits ? `+${countryCodeDigits}` : "",
      countryCodeDigits,
      phoneNumber: phoneNumber || "",
      e164PhoneNumber: normalizedValue,
    };
  } catch (error) {
    return {
      countryCode: "",
      countryCodeDigits: "",
      phoneNumber: normalizedValue.replace(/^\+/, ""),
      e164PhoneNumber: normalizedValue,
    };
  }
};

export const GenerateFileName = ({signedInOrgName,userIdData,module}) => {  
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}${month}${day}_${module}_${signedInOrgName}_${userIdData}.xlsx`;
};

export const formattedDate = (originalDate) => {
  const dateFormat = DateFormatFromRegion(); // e.g., "MM/DD/YYYY"

  // Split the original date string
  const [dd, mm, yyyy] = originalDate?.split("/");

  // Rearrange based on the desired format
  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    default:
      return `${mm}/${dd}/${yyyy}`; // fallback
  }
};

export const getDayStartISOString = (date) => {
  if (!date) return "";
  // If using dayjs or similar, convert to JS Date first
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
};

export const getDayEndISOString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T23:59:59.999Z`;
};

export function getSixMonthRange() {
    const now = new Date();
    // Set end to the first day of the previous month
    const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // Set start to 6 months before end
    const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);

    const pad = (n) => n.toString().padStart(2, "0");
    const startDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`;
    const endDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-01`;
    return { startDate, endDate };
}

export function getOrdinal(n) {
  // Handle invalid input
  if (typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
    throw new Error('Input must be a positive integer');
  }
  
  // Get the last two digits to determine suffix
  const lastTwoDigits = n % 100;
  const lastDigit = n % 10;
  
  // Special cases: 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return n + 'th';
  }
  
  // Determine suffix based on last digit
  switch (lastDigit) {
    case 1:
      return n + 'st';
    case 2:
      return n + 'nd';
    case 3:
      return n + 'rd';
    default:
      return n + 'th';
  }
}


export function longMonthDayYear(utcDateTime) {
  if (!utcDateTime) return "";
  return moment.utc(utcDateTime).local().format("MMMM D YYYY"); // e.g., April 1 2024
}

export const formatDateMonthDayYear = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replace(/,/g, "");
};

export const getCurrentLanguageIdFromCode = (languageCode) => {
  const currentLanguageList = JSON.parse(
    localStorage.getItem("languageList")
  );
  let langId;
  if (!languageCode || !currentLanguageList?.length || languageCode === "en") {
    langId = "";
  } else {
    langId =
      currentLanguageList.length &&
      currentLanguageList.find(
        (item) => item.languageCode == languageCode
      )?.id;
  }
  return langId;
}

export const formatAddressFromContactInfo = (contactInfo, locationList) => {
  if (!contactInfo) return "-";

  const addressParts = [];

  // Add address lines
  if (contactInfo?.addressLine1) {
    addressParts.push(contactInfo.addressLine1);
  }
  if (contactInfo?.addressLine2) {
    addressParts.push(contactInfo.addressLine2);
  }

  // Add city
  if (contactInfo?.city) {
    addressParts.push(contactInfo.city);
  }

  // Add state/province name by looking it up
  if (contactInfo?.TWStateId && locationList?.length) {
    const country = locationList.find(
      (item) => item.id == contactInfo.TWCountryId
    );
    if (country?.states?.length) {
      const state = country.states.find(
        (item) => item.id == contactInfo.TWStateId
      );
      if (state?.stateName) {
        addressParts.push(state.stateName);
      }
    }
  }

  // Add district
  if (contactInfo?.TWDistrictId && locationList?.length) {
    const country = locationList.find(
      (item) => item.id == contactInfo.TWCountryId
    );
    if (country?.states?.length) {
      const state = country.states.find(
        (item) => item.id == contactInfo.TWStateId
      );
      if (state?.districts?.length) {
        const district = state.districts.find(
          (item) => item.id == contactInfo.TWDistrictId
        );
        if (district?.districtName) {
          addressParts.push(district.districtName);
        }
      }
    }
  }

  // Add zip code
  if (contactInfo?.zipCode) {
    addressParts.push(contactInfo.zipCode);
  }

   // Add country name
  if (contactInfo?.TWCountryId && locationList?.length) {
    const country = locationList.find(
      (item) => item.id == contactInfo.TWCountryId
    );
    if (country?.countryName) {
      addressParts.push(country.countryName);
    }
  }

  return addressParts.length > 0 ? addressParts.join(", ") : "-";
};

export const getLanguageNameFromId = (languageId) => {
  const currentLanguageList = JSON.parse(
    localStorage.getItem("languageList")
  );
  let languageName = "-";
  if (languageId && currentLanguageList?.length) {
    const foundLanguage = currentLanguageList.find(
      (item) => item.id == languageId
    );
    languageName = foundLanguage?.language || "-";
  }
  return languageName;
};