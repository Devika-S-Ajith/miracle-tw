// assets/authorizationConfig.js
import {
  SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY,
  MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI,
  PARENT_ORGANIZATION
} from '../helpers/constant';
import Reports from '../views/Dashboard/Reports/Reports';

export const authorizationConfig = {

  // ── Common modules (both TS + FS paths apply) ──────────────────────────

  ManageChild: {
    allowedRoles:    [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
    allowedOrgTypes: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
  },
  ListChild: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
  },
  ManageFamily: {
    allowedRoles:    [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
    allowedOrgTypes: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
  },
  ListFamily: {
    allowedRoles:    [ADMIN, CASEWORKER, ADMIN_CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [ GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
  },
  AddUser: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI, PARENT_ORGANIZATION],
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
  },
  EditUser: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI, PARENT_ORGANIZATION],
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER],
  },
  ListUser: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI, PARENT_ORGANIZATION],
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER],
  },
  EditAccount: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI, PARENT_ORGANIZATION],
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
  },
  AddAccount: {
    allowedRoles:    [SUPER_ADMIN],
    allowedOrgTypes: [MIRACLE],
    allowedRolesFS:  [SUPER_ADMIN],
  },
  ListAccount: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER],
  },
  Notification: {
    allowedRoles:    [ADMIN, ADMIN_CASEWORKER, CASEWORKER],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [ADMIN, CASEWORKER, ADMIN_CASEWORKER],
  },
  DashboardOverview: {
    allowedRoles:    [SUPER_ADMIN, ADMIN,ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER],
  },

  // ── TS-only modules (no allowedRolesFS) ───────────────────────────────

  FormList: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  ManageForm: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  Assessment: {
    allowedRoles:    [ADMIN, ADMIN_CASEWORKER, CASEWORKER],
    allowedOrgTypes: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },
  Reports: {
    allowedRoles:    [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [MIRACLE, GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI],
  },


  GOVTOverview: {
    allowedRoles:    [ADMIN, VIEW_ONLY],
    allowedOrgTypes: [PARENT_ORGANIZATION],
  },
  GOVTDashboard: {
    allowedRoles:    [ADMIN, VIEW_ONLY],
    allowedOrgTypes: [PARENT_ORGANIZATION],
  },
  GOVTDashboardInterventions: {
    allowedRoles:    [ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI, PARENT_ORGANIZATION],
  },
  GOVTDashboardMilestones: {
    allowedRoles:    [ADMIN, ADMIN_CASEWORKER, CASEWORKER, VIEW_ONLY],
    allowedOrgTypes: [GOVT_CCI, GOVT_ORG, NGO_PARTNER, PRIVATE_CCI, PARENT_ORGANIZATION],
  },

// ── FS-only modules (no allowedRolesFS) ───────────────────────────────
 
Events: {
    allowedRolesFS: [ADMIN, ADMIN_CASEWORKER, CASEWORKER],
  },
  Messages: {
    allowedRolesFS: [ADMIN, ADMIN_CASEWORKER, CASEWORKER],
  },
  Resource: {
    allowedRolesFS: [SUPER_ADMIN],
  },
  SupportService: {
    allowedRolesFS:  [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER],
  },
};