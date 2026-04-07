import { AppConfig } from "../config";

const BASE = AppConfig.baseURL;

const API_URLS = {
  systemMessages: {
    create: `${BASE}/system-messages`,
    messageList: `${BASE}/system-messages/list`,
    userMessageList: `${BASE}/system-messages/userMessageList`,
    messageTypeList: `${BASE}/system-messages/type-list`,
    updateReadStatus: `${BASE}/system-messages/readstatus-update`,
    details: `${BASE}/system-messages/details`,
    cancelMessage: `${BASE}/system-messages/cancel-message`,
    copyMessage: `${BASE}/system-messages/copy-message`,
    getMessageViewCount: `${BASE}/system-messages/get-message-viewCount`,
    root: "/system-messages", // If you need the relative path
  },
  user: {
    ChangeUserStatusByOrgId: `${BASE}/user/changeUserStatusByOrg`,
  },
  consentForm: {
    familyChildConsent: `${BASE}/ht-consent-new/familyChildConsent`,
    generateConsentPDF: `${BASE}/ht-consent-new/generateConsentPdf`,
  },

  family: {
    getFamilyDetails: `${BASE}/tw-families/family-details`,
    createFamily: `${BASE}/tw-families/create`,
    updateFamily: `${BASE}/tw-families/update`,
    getFamilyList: `${BASE}/tw-families/list`,
    getFamilyDropdownList: `${BASE}/tw-families/dropdowns`,
    updateFamilyMember: `${BASE}/tw-families/update-family-member`, 
    closeCase: `${BASE}/tw-families/close-case`,
   // getFamilyMembers: `${BASE}/tw-families/family-members`,
  },
    child: {
    getChildList: `${BASE}/tw-child/children`,
    getChildDropdownLists: `${BASE}/tw-child/dropdownlists`,
    createChild: `${BASE}/tw-child/child`,
    getChildDetails: `${BASE}/tw-child/child`,
    uniqueChildList: `${BASE}/tw-child/uniqueChildList`,
    closeChildCase: `${BASE}/tw-child/closeCase`,
    checkUniqueChild: `${BASE}/tw-child/isUniqueChild`
  },
  events:{
    getEventList: `${BASE}/events`,
  }

<<<<<<< Updated upstream
=======
  consentForm: createEndpoints("/tw-consent", {
    familyChildConsent: "/familyChildConsent",
    generateConsentPDF: "/generateConsentPdf",
  }),

  family: createEndpoints("/tw-families", {
    getFamilyDetails: "/family-details",
    createFamily: "/create",
    updateFamily: "/update",
    getFamilyList: "/list",
    getFamilyDropdownList: "/dropdowns",
    updateFamilyMember: "/update-family-member",
    closeCase: "/close-case",
    reOpenCase: "/reopen-case",
    familyAudit: "/auditlog",
  }),

  child: createEndpoints("/tw-child", {
    getChildList: "/children",
    getChildDropdownLists: "/dropdownlists",
    createChild: "/child",
    getChildDetails: "/child",
    uniqueChildList: "/uniqueChildList",
    closeChildCase: "/closeCase",
    checkUniqueChild: "/isUniqueChild",
    reOpenChildCase: "/reopenCase",
  }),

  events: createEndpoints("/events", {
    getEventList: "",
  }),
>>>>>>> Stashed changes
};

export default API_URLS;