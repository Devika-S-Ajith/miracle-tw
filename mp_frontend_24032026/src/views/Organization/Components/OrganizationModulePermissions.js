import {
    SUPER_ADMIN,
    ADMIN,
    ADMIN_CASEWORKER,
    MIRACLE,
    GOVT_CCI,
    GOVT_ORG,
    NGO_PARTNER,
    PRIVATE_CCI,
    ADMIN_CASEMANAGER,
  } from '../helpers/constant'
  
  
  export const authorizationConfig = {
    FieldLevelPermision: {
      allowedRoles: [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
      allowedRolesFS: [SUPER_ADMIN, ADMIN, ADMIN_CASEMANAGER],
    },
  };