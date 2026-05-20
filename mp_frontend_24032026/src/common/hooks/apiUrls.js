import { AppConfig } from "../config";

const BASE = AppConfig.baseURL;

// Helper to create full URLs from a base sub-path
const createEndpoints = (prefix, map) => {
  const fullUrls = {};
  for (const [key, path] of Object.entries(map)) {
    if (path === "") {
      // If path is empty, do not append an extra slash
      fullUrls[key] = `${BASE}${prefix}`;
    } else {
      fullUrls[key] = path.startsWith("/") ? `${BASE}${prefix}${path}` : `${BASE}${prefix}/${path}`;
    }
  }
  return fullUrls;
};

const API_URLS = {
  systemMessages: {
    ...createEndpoints("/system-messages", {
      create: "",
      messageList: "/list",
      userMessageList: "/userMessageList",
      messageTypeList: "/type-list",
      updateReadStatus: "/readstatus-update",
      details: "/details",
      cancelMessage: "/cancel-message",
      copyMessage: "/copy-message",
      getMessageViewCount: "/get-message-viewCount",
    }),
    root: "/system-messages",
  },
  reports: createEndpoints("/tw-report", {
    exportLegacyAssessmentScore: "/legacyDataExport",
  }),
  forms: createEndpoints("", {
    activeForms: "/default-forms",
    formList: "/get-all-forms",
  }),
  assessment: createEndpoints("/tw-assessment", {
    skipDomain: "/milestoneDeactivationReasons",
  }),

  user: createEndpoints("/user", {
    ChangeUserStatusByOrgId: "/changeUserStatusByOrg",
  }),

  consentForm: createEndpoints("/tw-consent-new", {
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
  dashboards: createEndpoints("/tw-report", {
    familySituationCounts: "/family-situation-counts",
    closedCases: "/case-closed-counts",
  }),
  common: createEndpoints("/mobile", {
    initialUserData: "/initialize",
  }),
};

export default API_URLS;