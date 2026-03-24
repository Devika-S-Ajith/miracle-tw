import { useState, useRef, useCallback, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Chip,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DualListBox from "react-dual-listbox";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import AccountDetails from "../../../assets/icons/AccountDetails";
import DeactivateAccount from "../Components/DeactivateAccount/DeactivateAccount";
import { ModalService } from "../../../components/Modal";
import APIS from "../../../common/hooks/UseApiCalls";
import "../Components/OrganizationListTable/OrganizationListTable.css";
import {
  getDistrictList,
  getLocationNames,
} from "../../../helpers/helperFunction";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import {
  ADMIN,
  ADMIN_CASEMANAGER,
  ADMIN_CASEWORKER,
  SUPER_ADMIN,
} from "../../../helpers/constant";
import { Box } from "@mui/system";
import { get } from "lodash";

const AccountDetailsCard = (props) => {
  // Todo - API integration
  const { account, loading, getOrganisation } = props;
  const { t } = useTranslation(["common"]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  // const [orgToLink, setOrgToLink] = useState();
  // const [linkAccountopen, setlinkAccountopen] = useState(false);
  // const [accountListToLink, setAccountListToLink] = useState([]);
  // const [selectedLinkAccount, setSelectedLinkAccount] = useState([]);
  // const [loadingSaveLinkAccounts, setLoadingSaveLinkAccounts] = useState(false);
  const {
    locationList,
    organizationList,
    signedinUserRoleHT,
    signedinUserRoleFS,
    typeList,
    signedinOrgType,
  } = useContext(CommonDataContext);
  const ref = useRef();
  const loggedInUserOrgId = localStorage.getItem("orgId");

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // const parseOrgList = (orgList, linkedOrgList) => {
  //   let finalOrglist = orgList.length
  //     ? orgList.map((item) => ({
  //         ...item,
  //         value: item.id,
  //         label: item.accountName,
  //       }))
  //     : [];
  //   if (linkedOrgList.length) {
  //     let parsedLinkedOrgList;
  //     parsedLinkedOrgList = linkedOrgList.map((item) => ({
  //       value: item.LinkedAccountId,
  //       label:
  //         organizationList &&
  //         organizationList.length &&
  //         organizationList.find((acc) => acc.id === item.LinkedAccountId)
  //           ?.accountName,
  //     }));
  //     let finalLinkedOrgList = linkedOrgList.map(
  //       (item) => `${item.LinkedAccountId}`
  //     );
  //     setAccountListToLink([...finalOrglist, ...parsedLinkedOrgList]);
  //     setSelectedLinkAccount(finalLinkedOrgList);
  //   } else {
  //     setAccountListToLink(finalOrglist);
  //   }
  // };

  // const getOrganizationListToLink = useCallback(async (accountID) => {
  //   try {
  //     const data = await APIS.OrganisationDetails(accountID);
  //     parseOrgList(
  //       data?.data?.data?.linkingAccounts,
  //       data?.data?.data?.linkedAccounts
  //     );
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  // const handleOpenLinkAccountPopUp = (account) => {
  //   setOrgToLink(account);
  //   setlinkAccountopen(true);
  //   getOrganizationListToLink(account.id);
  // };

  // const handleCloseLinkAccountPopUp = () => {
  //   setOrgToLink([]);
  //   setAccountListToLink([]);
  //   setSelectedLinkAccount([]);
  //   setlinkAccountopen(false);
  // };

  // const handleLinkAccountChange = (newSelected) => {
  //   setSelectedLinkAccount(newSelected);
  // };

  // const handleSaveLinkAccount = async () => {
  //   try {
  //     setLoadingSaveLinkAccounts(true);
  //     const payload = {
  //       accountId: orgToLink?.id,
  //       linkedAccountIds: selectedLinkAccount,
  //     };
  //     await APIS.LinkOrganization(payload).then((res) => {
  //       setLoadingSaveLinkAccounts(false);
  //       setlinkAccountopen(false);
  //       if (res.status === 200) {
  //         setRefresh();
  //         toast.success(
  //           t("common:warnings.Organization Links have been saved Successfully")
  //         );
  //       } else {
  //         toast.error(t("common:common.Something went wrong"));
  //         // setStatus({ success: false });
  //       }
  //     });
  //   } catch (err) {
  //     setLoadingSaveLinkAccounts(false);
  //     toast.error(t("common:common.Something went wrong"));
  //   }
  // };

 const handleAccountStatusChange = async (payload) => {
  try {
    const res = await APIS.reActivateOrganization(payload);
    toast.success(t("common:warnings.Organization Status Updated Successfully"));
    getOrganisation();
    return true;
  } catch (err) {
    console.error("Error reactivating organization:", err);
    toast.error(t("common:common.Something went wrong"));
    return false;
  }
};

const handleUserStatusChangeByAccount = async (payload, changeStatusTo) => {
  // Convert MPAccountId to TWAccountId for this specific API
  let updatedPayload = {
    ...payload,
    changeStatusTo
  };
  if (changeStatusTo === "DEACTIVATE") {
    updatedPayload.deactivationInfo.TWAccountId = payload.id;
    delete updatedPayload.deactivationInfo.MPAccountId;
  }

  try {
    const res = await APIS.ChangeUserStatusByOrg(updatedPayload);
    
    if (res?.status === 200) {
      return true;
    }
    
    toast.error(t("common:common.Something went wrong"));
    return false;
  } catch (err) {
    console.error(`Error changing user status to ${changeStatusTo}:`, err);
    toast.error(t("common:common.Something went wrong"));
    return false;
  }
};

const handleUserDeactivationByAccount = async (payload) => {
  return handleUserStatusChangeByAccount(payload, "DEACTIVATE");
};

const handleReactivateUserByAccount = async (payload) => {
  return handleUserStatusChangeByAccount(payload, "ACTIVATE");
};

const handleAccountDelete = async (payload) => {
  try {
    const res = await APIS.deactivateOrganization(payload);
    toast.success(t("common:common.Organization deactivated successfully"));
    getOrganisation();
    return true;
  } catch (err) {
    console.error("Error deactivating organization:", err);
    toast.error(t("common:common.Something went wrong"));
    return false;
  }
};

const handleDeactivateOrReactivate = async (account, ref) => {
  // Debug: Log the account object to see what's available
  console.log("Account object:", account);
  
  // Validation - check for either MPAccountId or id
  const accountId = account?.id;
  
  if (!accountId) {
    console.error("Missing account ID. Account object:", account);
    toast.error(t("common:common.Invalid account"));
    return false;
  }

  try {
    if (account.isActive) {
      // Deactivation flow
      const reason = ref?.current;
      const deactivationInfo = reason ? {
        MPAccountId: accountId,
        reason: reason,
        type: "ACCOUNT_DEACTIVATION",
      } : undefined;

      const payload = {
        id: accountId, // Include both for compatibility
        ...(deactivationInfo && { deactivationInfo }),
      };

      // Step 1: Deactivate users (will convert MPAccountId to TWAccountId internally)
      const userDeactivated = await handleUserDeactivationByAccount(payload);
      
      if (userDeactivated) {
        // Step 2: Deactivate organization (uses MPAccountId)
        
        payload.deactivationInfo.MPAccountId = accountId;
        const accountDeactivated = await handleAccountDelete(payload);
        return accountDeactivated;
      }
      
      return false;
    } else {
      // Reactivation flow
      const payload = { 
        id: accountId // Include both for compatibility
      };
      
      // Step 1: Reactivate users (will convert MPAccountId to TWAccountId internally)
      const userReactivated = await handleReactivateUserByAccount(payload);
      
      if (userReactivated) {
        // Step 2: Reactivate organization (uses MPAccountId)
        const accountReactivated = await handleAccountStatusChange(payload);
        return accountReactivated;
      }
      
      return false;
    }
  } catch (err) {
    console.error("Error in handleDeactivateOrReactivate:", err);
    toast.error(t("common:common.Something went wrong"));
    return false;
  }
};
  const getOrganizationType = (value) => {
    return typeList.find((i) => i.id == value)?.name;
  };

  return (
    // Todo - Handle the menu options based on user role permission
    <Card sx={{ borderRadius: "8px", minWidth: "100%", px: 2 }}>
      {loading && (
        <CircularProgress
          sx={{
            zIndex: 1000,
            position: "absolute",
            top: "55%",
            left: "45%",
          }}
          color="primary"
        />
      )}
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <CardHeader
            avatar={<AccountDetails />}
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                {t("common:organization.Organization Details")}
              </div>
            }
          ></CardHeader>
        </Grid>
        {([SUPER_ADMIN].includes(signedinUserRoleHT) ||
          (account.id === loggedInUserOrgId &&
            ([ADMIN_CASEWORKER, ADMIN].includes(signedinUserRoleHT) ||
              [ADMIN, ADMIN_CASEMANAGER].includes(signedinUserRoleFS)))) && (
          <Grid item>
            <IconButton color="inherit" onClick={handleMenuClick}>
              <img
                alt="view_account"
                src="/static/icons/menuIcon.svg"
                width={24}
                height={24}
                style={{ alignSelf: "center" }}
              />
            </IconButton>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              style={{ borderRadius: "0px" }}
            >
              <MenuItem
                onClick={handleMenuClose}
                style={{ color: "#F37123" }}
                component={RouterLink}
                to={`/dashboard/organizations/${account.id}/edit`}
              >
                <img
                  alt="edit_account"
                  src="/static/icons/editIcon.svg"
                  width={16}
                  height={16}
                  style={{ alignSelf: "center", marginRight: "8px" }}
                />
                {t("common:common.Edit")}
              </MenuItem>
              {/* <MenuItem
              onClick={handleMenuClose}
              onClick={() => {
                handleOpenLinkAccountPopUp(account);
                handleMenuClose();
              }}
              style={{ color: "#F37123" }}
            >
              <img
                alt="add_user"
                src="/static/icons/linkAccountIcon.svg"
                width={20}
                height={16}
                style={{ alignSelf: "center", marginRight: "8px" }}
              />

              {t("common:common.Link Organization")}
            </MenuItem> */}
              {[SUPER_ADMIN].includes(signedinUserRoleHT) && (
                <MenuItem
                  // onClick={handleMenuClose}
                  onClick={() => {
                    ModalService.open(
                      () =>
                        account && account.isActive ? (
                          <DeactivateAccount
                            handleChangeReason={(value) => {
                              ref.current = value;
                            }}
                          />
                        ) : (
                          <></>
                        ),
                      {
                        modalTitle:
                          account && account.isActive
                            ? t("common:common.Deactivate Account")
                            : t("common:common.Reactivate Account"),
                            cancelButtonText:t("common:common.Cancel"),
                        modalDescription:
                          account && account.isActive
                            ? t(
                                "common:common.All users in this account will be deactivated"
                              )
                            : t(
                                "common:common.All users in this account will be reactivated"
                              ),
                        actionButtonText:
                          account && account.isActive
                            ? t("common:common.Deactivate Account")
                            : t("common:common.Reactivate Account"),
                        onClick: () => {
                          handleMenuClose();
                          handleDeactivateOrReactivate(account, ref);
                        },
                      }
                    );
                    handleMenuClose();
                  }}
                  style={{ color: "#F37123" }}
                >
                  <img
                    alt="add_user"
                    src="/static/icons/deactivateIcon.svg"
                    width={20}
                    height={20}
                    style={{ alignSelf: "center", marginRight: "8px" }}
                  />
                  {account && account.isActive
                    ? t("common:common.Deactivate Account")
                    : t("common:common.Reactivate Account")}
                </MenuItem>
              )}
            </Menu>
          </Grid>
        )}
      </Grid>
      <CardContent>
        <Grid container spacing={2}>
          {/* First Column: Name, ID, Type */}
          <Grid item xs={12} md={3}>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t("common:common.Name")}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {account.accountName}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t("common:organization.Organization ID")}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {account.accountCode}
                </Typography>
              </Grid>
              {account?.accessType !== "FOSTER_SHARE" && (
                <Grid item>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t("common:common.Type")}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getOrganizationType(account.MPAccountTypeId)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Second Column: Address */}
          <Grid item xs={12} md={3}>
            <Grid container spacing={1} direction="column">
              <Grid item>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t("common:common.Address")}
                </Typography>
              </Grid>
              {account.addressLine1 && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {account.addressLine1}
                  </Typography>
                </Grid>
              )}
              {account.addressLine2 && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {account.addressLine2}
                  </Typography>
                </Grid>
              )}
              {account.city && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {account.city}
                  </Typography>
                </Grid>
              )}
              {account.zipCode && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {account.zipCode}
                  </Typography>
                </Grid>
              )}
              {account.MPDistrictId && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {
                      getDistrictList(
                        locationList,
                        account.MPCountryId,
                        account.MPStateId
                      )?.find((item) => item.id == account.MPDistrictId)
                        ?.districtName
                    }
                  </Typography>
                </Grid>
              )}
              <Grid item>
                <Typography variant="body2" color="textSecondary">
                  {getLocationNames(
                    locationList,
                    account.MPCountryId,
                    account.MPStateId
                  )}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="textSecondary">
                  {getLocationNames(locationList, account.MPCountryId)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Third Column: Linked Organizations */}
          {([6].includes(Number(account?.MPAccountTypeId)) &&
            (account?.linkedAccounts &&
              account.linkedAccounts?.length > 0))
            ?
            (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {t("common:common.Linked Organizations")}
                </Typography>
                <Grid container spacing={1}>
                  {account?.linkedAccounts?.length > 0 ? (
                    account.linkedAccounts.map((acc, idx) => {
                      const orgName = acc?.accountName;
                      return (
                        <Box sx={{ m: 0.5 }} key={idx}>
                          <Chip
                            label={orgName}
                            sx={{
                              backgroundColor: "#1D334B",
                              color: "#fff"
                            }}
                          />

                        </Box>
                      );
                    })
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        {t("common:common.No linked organizations")}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            ) : 
            ([ADMIN, ADMIN_CASEWORKER, SUPER_ADMIN].includes(signedinUserRoleHT) || [ADMIN, ADMIN_CASEMANAGER, SUPER_ADMIN].includes(signedinUserRoleFS)) &&
            <Grid item xs={12} md={6}>
              {/* Case Managers Section */}
              {account.caseManagerCount && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t("common:common.Case managers", "Case managers")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {account.caseManagerCount}
                  </Typography>
                </Box>
              )}

              {/* Families Served Section */}
              {account.familyCount && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t("common:common.Families Served", "Families Served")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {account.familyCount}
                  </Typography>
                </Box>
              )}

              {/* Children Served Section */}
              {account.childCount && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t("common:common.Children Served", "Children Served")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {account.childCount}
                  </Typography>
                </Box>
              )}
            </Grid>
          }
        </Grid>
      </CardContent>

      {/* <Dialog
        open={linkAccountopen}
        onClose={handleCloseLinkAccountPopUp}
        maxWidth="sm"
        fullWidth
        maxHeight="100px"
      >
        {loadingSaveLinkAccounts && (
          <CircularProgress
            sx={{
              zIndex: 1000,
              position: "absolute",
              top: "30%",
              left: "47%",
            }}
            color="primary"
          />
        )}
        <DialogTitle>
          Link Organization
          <Typography variant="body1">Short Description</Typography>
        </DialogTitle>
        <DialogContent>
          {loading && (
            // Render a loader inside the DualListBox while loading
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              Loading...
            </div>
          )}
          <DualListBox
            options={accountListToLink}
            selected={selectedLinkAccount}
            showHeaderLabels={true}
            lang={{
              availableHeader: "All Accounts",
              selectedHeader: "Linked to " + orgToLink?.accountName,
            }}
            onChange={handleLinkAccountChange}
            icons={{
              moveRight: (
                <ArrowForwardIcon
                  style={{ marginBottom: -3, color: "white" }}
                />
              ),
              moveLeft: (
                <ArrowBackIcon style={{ marginBottom: -3, color: "white" }} />
              ),
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
              //padding: '10px',
            }}
          >
            <Button
              variant="outlined"
              disabled={loadingSaveLinkAccounts}
              onClick={handleCloseLinkAccountPopUp}
              style={{ flex: 1, borderRadius: "4px", marginRight: "5px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveLinkAccount}
              disabled={loadingSaveLinkAccounts}
              color="primary"
              style={{ flex: 1, borderRadius: "4px", marginLeft: "2px" }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </Card>
  );
};

export default AccountDetailsCard;
