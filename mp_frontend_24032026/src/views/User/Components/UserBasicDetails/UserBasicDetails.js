import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
// import LockIcon from '../../../../assets/icons/Lock';
import UserAvatar from "../../../../assets/icons/UserAvatar";
import { Link } from "react-router-dom";
import { statusField } from "../../../../theme/CustomHooks";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import SummaryCount from "../../../../components/UserComponents/SummaryCount";
import CustomTableHeader from "../../../../components/UserComponents/CustomTableHeader";
import { getLocationNames } from "../../../../helpers/helperFunction";
import {
  ADMIN,
  ADMIN_CASEMANAGER,
  ADMIN_CASEMANAGER_FOSTER,
  ADMIN_CASEWORKER,
  CASEMANAGER,
  CASEWORKER,
  PENDING,
  SUPER_ADMIN,
} from "../../../../helpers/constant";
import { ModalService } from "../../../../components/Modal";
import DeactivateUser from "../DeactivateUser";

const FamilyTableHeader = [
  {
    label: "Parent 1",
    value: "Parent 1",
  },
  {
    label: "Parent 2",
    value: "Parent 2",
  },
  {
    label: "Location",
    value: "Location",
  },
  {
    label: "No Of Children",
    value: "No.Of Children",
  },
  {
    label: "Status",
    value: "Status",
  },
];

const ChildTableHeader = [
  {
    label: "Child Name",
    value: "Child name",
  },
  {
    label: "Child ID",
    value: "Child ID",
  },
  {
    label: "Family Name",
    value: "Family name",
  },
  {
    label: "Placement Status",
    value: "Placement status",
  },
];

const UserBasicDetails = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const {
    country,
    district,
    city,
    address1,
    address2,
    zip,
    email,
    status,
    phone,
    state,
    organization,
    firstName,
    lastName,
    id,
    HTRole,
    FSRole,
    cognitoId,
    selectedCountry,
    permission,
    ...other
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [childList, setChildList] = useState(null);
  const [familyList, setFamilyList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryCount, setSummaryCount] = useState(null);
  const [tileData, setTileData] = useState(null);
  const [summaryCountLoading, setSummaryCountLoading] = useState(false);
  const {
    locationList,
    childPlacementList,
    roleListFS,
    roleListHT,
    signedinUserRoleHT,
    signedinUserRoleFS,
    organizationList,
    signedinOrgType
  } = useContext(CommonDataContext);
  const signedinUserId = localStorage.getItem("username");
  const signedInUserCountry = localStorage.getItem("userRegion");
  const ref = useRef();

  const countryNameList = {
    india: { label: "india" },
    us: { label: "usa" },
    usa: { label: "usa" },
    uganda: { label: "uganda" },
  };

 
  useEffect(() => {
    if (selectedCountry?.id) {
      getSummaryCounts();
      if (selectedCountry?.id == 2) {
        getFosterShareCounts();
      }

      if (
        [ADMIN, ADMIN_CASEWORKER].includes(signedinUserRoleHT) ||
        id === signedinUserId
      ) {
        getChildList();
      }
      if (
        ([ADMIN, ADMIN_CASEMANAGER].includes(signedinUserRoleFS) ||
          id === signedinUserId) &&
        selectedCountry?.id == 2
      ) {
        getFamilyListData();
      }
    }
  }, [selectedCountry]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const deactivateUserAfterValidation = async (id, ref) => {
    try {
      const reason = ref.current;
      let deactivationInfo;

      if (reason) {
        deactivationInfo = {
          TWUserId: id,
          reason: reason || "",
          type: "USER_DEACTIVATION",
        };
      }
      const payload = {
        id: id,
        deactivationInfo: deactivationInfo,
      };

      await APIS.ChangeUserStatus(payload).then((res) => {
        if (res.data.message === "User Deleted Successfully!") {
          toast.success("User deactivated successfully");
        } else if (res.data.Message === "Status Changed Successfully") {
        } else {
          toast.error(t("common:common.Something went wrong"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };

  const handleDeactivateUser = async (
    id,
    accountID,
    HTRole,
    FSRole,
    countryName,
    ref
  ) => {
    try {
      const payloadRoleCheck = {
        TWUserId: id,
        TWAccountId: accountID,
        HTRoleFrom: HTRole,
        country: countryNameList[countryName.toLowerCase()].label,
      };
      if ([SUPER_ADMIN].includes(signedinUserRoleHT) || [SUPER_ADMIN].includes(signedinUserRoleFS)) {
        deactivateUserAfterValidation(id, ref);
      } else {
        if (HTRole !== "9") {
          await APIS.ValidateUserDeactivationTS(payloadRoleCheck).then((res) => {
            if (res?.data?.message === "NOT OK") {
              ModalService.open(({ close }) => <></>, {
                modalTitle: "Deactivate user",
                width: "30%",
                modalDescription: t(`common:common.${res?.data?.data}`),
                cancelButtonText: "Ok",
                hideActionButton: true,
              });
            } else if (res?.data?.message === "OK") {
              if (FSRole !== "9") {
                const payloadRoleCheckFS = {
                  FSUserId: id,
                  TWAccountId: accountID,
                  FSRoleFrom: FSRole,
                  country: countryNameList[countryName.toLowerCase()].label,
                };
                APIS.ValidateUserDeactivationFS(payloadRoleCheckFS).then((res) => {
                  if (res?.data?.message === "NOT OK") {
                    ModalService.open(({ close }) => <></>, {
                      modalTitle: "Deactivate user",
                      width: "30%",
                      modalDescription: t(`common:common.${res?.data?.data.replace(/\.$/, '')}`,res?.data?.data.replace(/\.$/, '')),
                      cancelButtonText: "Ok",
                      hideActionButton: true,
                    });
                  } else if (res?.data?.message === "OK") {
                    deactivateUserAfterValidation(id, ref);
                  } else {
                    toast.error(t("common:common.Something went wrong"));
                  }
                });
              }else{
                deactivateUserAfterValidation(id, ref);
              } 
            } else {
              toast.error(t("common:common.Something went wrong"));
            }
          });
        } else {
          if (FSRole !== "9") {
            const payloadRoleCheckFS = {
              FSUserId: id,
              TWAccountId: accountID,
              FSRoleFrom: FSRole,
              country: countryNameList[countryName.toLowerCase()].label,
            };
            APIS.ValidateUserDeactivationFS(payloadRoleCheckFS).then((res) => {
              if (res?.data?.message === "NOT OK") {
                ModalService.open(({ close }) => <></>, {
                  modalTitle: "Deactivate user",
                  width: "30%",
                  modalDescription: t(`common:common.${res?.data?.data.replace(/\.$/, '')}`,res?.data?.data.replace(/\.$/, '')),
                  cancelButtonText: "Ok",
                  hideActionButton: true,
                });
              } else if (res?.data?.message === "OK") {
                deactivateUserAfterValidation(id, ref);
              } else {
                toast.error(t("common:common.Something went wrong"));
              }
            });
          }
        }
      }
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
      // toast.error(ErrorMessage);
    }
  };

  const handleReactivateUser = async (id, MPAccountId) => {
    try {
      const payload = {
        id: id,
        isActive: true,
        isDeleted: false,
        TWAccountId: MPAccountId,
      };

      await APIS.EditUser(payload).then((res) => {
        if (res.data.message === "User Details Updated Successfully!") {
          toast.success("User reactivated successfully");
          //getRefreshedUserList();
          //toast.error(t("common:organization.Inactive Reassign"));
          //toast.error(InactiveMessage);
        } else if (res.data.message === "User organization is not active.") {
          toast.error("User organization is not active");
        } else {
          //toast.error(t("common:common.Something went wrong"));
          //toast.error(ErrorMessage);
        }
        //toast.success(SuccessMessage);
      });
    } catch (err) {
      console.log("err on reactivation", err);
      toast.error(t("common:common.Something went wrong"));
      // toast.error(ErrorMessage);
    }
  };

  const getSummaryCounts = useCallback(async () => {
    try {
      const payload = {
        rowCount: "100",
        pageNumber: "1",
        stateFilter: "",
        countryFilter: selectedCountry?.id || signedInUserCountry,
        districtFilter: "",
        startDate: "",
        endDate: "",
      };
      setSummaryCountLoading(true);
      payload.HTCountryId = selectedCountry?.id || signedInUserCountry;
      const response = await APIS.DashboardTileData(payload);
      if (response && response.status === 200) {
        setSummaryCount(response?.data?.message.data);
        setSummaryCountLoading(false);
      }
      setSummaryCountLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const getFosterShareCounts = async () => {
    const payload = {
      TWAccountId: "",
      FSCountryId: selectedCountry.id,
      FSUserId: id,
      FSStateId: "",
      FSDistrictId: "",
    };
    try {
      setLoading(true);
      const response = await APIS.DashboardTileDataFS(payload);
      if (response && response.status === 200) {
        setTileData(response?.data?.data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const resendInvitedUser = async () => {
    try {
      const statusPayload = {
        id: id,
        email: email,
      };
      await APIS.ResendInvitation(statusPayload).then((res) => {
        if (res.status === 200) {
          toast.success(t("common:user.Invitation has been sent to User"));
        } else {
          toast.error(t("common:common.Something went wrong"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };

  const handleChangePassword = () => {
    navigate("/dashboard/changePassword");
  };

  const getChildList = useCallback(async () => {
    setLoading(true);
    try {
      const getChildListpayload = {
        rowCount: "10",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        HTOrganizationId: "",
        childStatus: "",
        HTLanguageId: "",
        HTChildPlacementStatusId: "",
        HTChildStatusId: "",
      };

      getChildListpayload.HTCountryId = selectedCountry?.id || signedInUserCountry;
      const data = await APIS.ListChildren(getChildListpayload);
      setChildList(data && data.data && data.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

  const getFamilyListData = async () => {
    const data = await APIS.getFsFamilyList({
      rowCount: 10,
      pageNumber: 1,
      orderByField: [["primaryParentName", "desc"]],
      entityStatus: "All",
      caseManager: id,
    });
    setFamilyList(data && data.data && data.data.data);
  };

  return (
    <>
      <Card {...other} sx={{ borderRadius: "8px", minWidth: "100%" }}>
        <CardHeader
          avatar={<UserAvatar />}
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              {firstName + " " + lastName}
              <Chip
                color="primary"
                label={t(`common:common.${statusField[status]?.label}`)}
                size="small"
                sx={{
                  backgroundColor: statusField[status]?.color,
                  ml: 1,
                  borderRadius: "2px",
                }}
              />
            </div>
          }
          action={
            <>
              <IconButton aria-label="menu" color="inherit">
                <MenuIcon onClick={handleClick} style={{ color: "#F37123" }} />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  style: {
                    borderRadius: "4px",
                  },
                }}
              >
                <MenuItem
                  to={{
                    pathname: `/dashboard/team/${id}/edit`,
                    state: { isAddForm: false },
                  }}
                  onClick={handleClose}
                  component={Link}
                >
                  <img
                    alt="edit_account"
                    src="/static/icons/editIcon.svg"
                    width={16}
                    height={16}
                    style={{ alignSelf: "center", marginRight: "8px" }}
                  />
                  <Typography sx={{ color: "#F37123" }}>
                    {t("common:common.Edit")}
                  </Typography>
                </MenuItem>
                {(signedinUserId === id || signedinUserId === cognitoId) && (
                  <MenuItem
                    onClick={() => {
                      handleChangePassword();
                      handleClose();
                    }}
                  >
                    <img
                      alt="edit_account"
                      src="/static/icons/PasswordKeyIcon.svg"
                      width={16}
                      height={16}
                      style={{ alignSelf: "center", marginRight: "8px" }}
                    />
                    <Typography sx={{ color: "#F37123" }}>
                      {t("common:signin.Change Password")}
                    </Typography>
                  </MenuItem>
                )}
                {status === PENDING && (
                  <MenuItem
                    onClick={() => {
                      resendInvitedUser();
                      handleClose();
                    }}
                  >
                    <img
                      alt="edit_account"
                      src="/static/icons/mailIcon.svg"
                      width={16}
                      height={16}
                      style={{ alignSelf: "center", marginRight: "8px" }}
                    />
                    <Typography sx={{ color: "#F37123" }}>
                      {t("common:common.Resend Invite")}
                    </Typography>
                  </MenuItem>
                )}
                {id !== localStorage.getItem("username") && (
                  <MenuItem
                    onClick={() => {
                      ModalService.open(
                        () =>
                          status.toUpperCase() === "ACTIVE" ||
                            status?.toUpperCase() === "PENDING" ? (
                            <DeactivateUser
                              handleChangeReason={(value) => {
                                ref.current = value;
                              }}
                            />
                          ) : (
                            <></>
                          ),
                        {
                          modalTitle:
                            status.toUpperCase() === "ACTIVE" ||
                              status?.toUpperCase() === "PENDING"
                              ? t("common:common.Deactivate User")
                              : t("common:common.Reactivate User"),
                          cancelButtonText:t("common:common.Cancel"),
                          modalDescription:
                            status.toUpperCase() === "ACTIVE" ||
                              status?.toUpperCase() === "PENDING"
                              ? t(
                                "common:common.Once deactivated, this user will no longer have access to FosterShare and/or ThriveScale"
                              )
                              : t(
                                "common:common.Once reactivated, this user will have access to FosterShare and/or ThriveScale"
                              ),
                          actionButtonText:
                            status.toUpperCase() === "ACTIVE" ||
                              status?.toUpperCase() === "PENDING"
                              ? t("common:common.Deactivate User")
                              : t("common:common.Reactivate User"),
                          width: "35%",
                          onClick: () => {
                            handleClose();
                            setTimeout(() => {
                              if (status.toUpperCase() === "ACTIVE") {
                                handleDeactivateUser(
                                  id,
                                  organization,
                                  HTRole,
                                  FSRole,
                                  getLocationNames(locationList, country),
                                  ref
                                );
                              } else if (status?.toUpperCase() === "PENDING") {
                                deactivateUserAfterValidation(id, ref);
                              } else {
                                handleReactivateUser(id, organization);
                              }
                            }, 0);
                          },
                        }
                      );
                      handleClose();
                    }}
                    style={{ color: "#F37123" }}
                  >
                    <img
                      alt="add_user"
                      src="/static/icons/deactivateIcon.svg"
                      width={20}
                      height={20}
                      style={{
                        alignSelf: "center",
                        marginRight: "8px",
                      }}
                    />
                    {status.toUpperCase() === "ACTIVE" ||
                      status?.toUpperCase() === "PENDING"
                      ? t("common:common.Deactivate User")
                      : t("common:common.Reactivate User")}
                  </MenuItem>
                )}
              </Menu>
            </>
          }
        ></CardHeader>
        <CardContent sx={{ mt: -3 }}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Name")}:
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {firstName + " " + lastName}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Email")}:
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {email}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Phone")}:
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {phone}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Address")}:
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {getLocationNames(locationList, country)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {getLocationNames(locationList, country, state)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {city}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {zip}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {address1}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {address2}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={7}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Organization")}:
                      </Typography>
                    }
                    secondary={
                      <Link
                        sx={{ flex: 1 }}
                        style={{ color: "#F37123", textDecoration: "none" }}
                        color="textSecondary"
                        to={`/dashboard/organizations/${organization}/view`}
                        underline="none"
                        variant="h6"
                      >
                        {` ${organizationList &&
                          organizationList.length &&
                          organizationList.find(
                            (item) => item.id === organization
                          )?.accountName
                          } `}
                      </Link>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Role")}:
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          <span style={{ color: "black", marginRight: "8px" }}>
                            {t("common:common.Thrive Scale")}:
                          </span>
                          {roleListHT &&
                            roleListHT.length &&
                            HTRole &&
                            `${t(
                              `common:common.${roleListHT.find((item) => item.id === HTRole)
                                ?.role
                              }`
                            )}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <span style={{ color: "black", marginRight: "8px" }}>
                            {t("common:common.FosterShare")}:
                          </span>
                          {roleListFS &&
                            roleListFS.length &&
                            FSRole &&
                            `${t(
                              `common:common.${roleListFS.find((item) => item.id === FSRole)
                                ?.role
                              }`
                            )}`}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid item xs={12}>
        {/* <TextField
          name="country"
          accessKey="countryName"
          component={AutoCompleteDropdownToFilter}
          getValueFunction={(value) => {
            handleCountryFilter(value);
          }}
          label=""
          placeholder={t("common:common.Select a country")}
          defaultVal={selectedCountry}
          options={locationList}
          sx={{
            width: 150,
            ml: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "0px",
            },
          }}
          //EnableClearable={true}
          textFieldProps={{
            fullWidth: true,
            borderRadius: "0px",
            margin: "normal",
            variant: "outlined",
            label: "",
            placeholder: t("common:common.Country"),
          }}
        /> */}
      </Grid>
      {[ADMIN, ADMIN_CASEMANAGER, CASEMANAGER, SUPER_ADMIN].includes(
        signedinUserRoleFS
      ) &&
        selectedCountry?.id == 2 && (
          <Card
            {...other}
            sx={{ borderRadius: "8px", mt: 2, minWidth: "100%" }}
          >
            <CardHeader
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {t("common:common.FosterShare")}
                </div>
              }
            ></CardHeader>
            <CardContent>
              {FSRole !== "9" ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={2} sx={{ ml: 2 }}>
                      <SummaryCount
                        summaryCountLoading={summaryCountLoading}
                        count={tileData?.familyServed}
                        label={t("common:common.ACTIVE FOSTER FAMILIES")}
                        signedinUserRoleHT={signedinUserRoleHT}
                        redirectLink={
                          ([CASEMANAGER, ADMIN_CASEMANAGER].includes(
                            signedinUserRoleFS
                          ) ||
                            id === signedinUserId) &&
                          (roleListFS.find((item) => item.id === FSRole)
                            ?.cognitoValue === ADMIN_CASEMANAGER ||
                            roleListFS.find((item) => item.id === FSRole)
                              ?.cognitoValue === CASEMANAGER)
                            ? `/fostershare/families`
                            : ""
                        }
                        filter={{
                          familyStatus: "Active",
                          caseManager: {
                            id: id,
                            value: `${firstName} ${lastName}`,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ ml: 2 }}>
                      <SummaryCount
                        summaryCountLoading={summaryCountLoading}
                        count={tileData?.childrenServed}
                        label={t("common:common.ACTIVE CHILDREN")}
                        redirectLink={
                          ([CASEMANAGER, ADMIN_CASEMANAGER].includes(
                            signedinUserRoleFS
                          ) ||
                            id === signedinUserId) &&
                          (roleListFS.find((item) => item.id === FSRole)
                            ?.cognitoValue === ADMIN_CASEMANAGER ||
                            roleListFS.find((item) => item.id === FSRole)
                              ?.cognitoValue === CASEMANAGER)
                            ? `/fostershare/children`
                            : ""
                        }
                        filter={{
                          placementStatus: {id:"IN_FOSTER_PLACEMENT",value: "In foster placement", filterMandatory: true},
                          caseWorkerId: {
                            id: id,
                            value: `${firstName} ${lastName}`,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {familyList?.length > 0 && (
                    <Table size="medium" stickyHeader id="FosterShareFamily">
                      <TableHead>
                        <CustomTableHeader headers={FamilyTableHeader} />
                      </TableHead>
                      <TableBody>
                        {familyList?.map((family) => (
                          <TableRow key={family.familyId}>
                            <TableCell align="Left">
                              {family.firstName + " " + family.lastName}{" "}
                              <Typography variant="body2" color="textSecondary">
                                {family.email}
                              </Typography>
                            </TableCell>
                            {family?.secondaryParents?.length ? (
                              <TableCell align="Left">
                                {family?.secondaryParents[0]?.firstName +
                                  " " +
                                  family?.secondaryParents[0]?.lastName}
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {family?.secondaryParents[0]?.email}
                                </Typography>
                              </TableCell>
                            ) : (
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  fontStyle="italic"
                                >
                                  {t("common:common.none")}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell align="Left">
                              {family.location || ""}
                            </TableCell>
                            <TableCell align="Left">
                              {family.childCount || (
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  fontStyle="italic"
                                >
                                  {t("common:common.none")}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="Left">
                              <Chip
                                color="primary"
                                label={
                                  family.familyStatus &&
                                  t(
                                    `common:common.${statusField[family.familyStatus]?.label
                                    }`
                                  )
                                }
                                size="small"
                                sx={{
                                  backgroundColor:
                                    family.familyStatus &&
                                    statusField[family.familyStatus]?.color,
                                  ml: 1,
                                  borderRadius: "2px",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {familyList?.length > 0 && (
                    <CardActions sx={{ mt: 2, mb: -2 }}>
                      <Link
                        style={{ color: "#F37123", textDecoration: "none" }}
                        color="textSecondary"
                        to={`/fostershare/families`}
                        underline="none"
                        variant="h6"
                      >
                        {t("common:common.View all in FosterShare")}
                      </Link>
                    </CardActions>
                  )}
                </>
              ) : (
                <>
                  <Typography>
                    This user has not been assigned a role in Foster Share
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        )}
      {[ADMIN, ADMIN_CASEWORKER, CASEWORKER, SUPER_ADMIN].includes(
        signedinUserRoleHT
      ) && ![6].includes(Number(signedinOrgType)) && (
          <Card {...other} sx={{ borderRadius: "8px", mt: 2, minWidth: "100%" }}>
            <CardHeader
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {t("common:common.Thrive Scale")}
                </div>
              }
            ></CardHeader>
            <CardContent>
              {HTRole !== "9" ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={2} sx={{ ml: 2 }}>
                      <SummaryCount
                        summaryCountLoading={summaryCountLoading}
                        count={summaryCount?.childrenAssessed}
                        label="CHILDREN ASSESSED"
                        redirectLink={
                          [ADMIN, ADMIN_CASEWORKER].includes(
                            signedinUserRoleFS
                          ) || id === signedinUserId
                            ? "/dashboard/reportsChildServed"
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ ml: 2 }}>
                      <SummaryCount
                        summaryCountLoading={summaryCountLoading}
                        count={summaryCount?.redflagCount}
                        label="CHILDREN WITH RED FLAGS"
                        redirectLink={
                          [ADMIN, ADMIN_CASEWORKER].includes(
                            signedinUserRoleFS
                          ) || id === signedinUserId
                            ? "/dashboard/reportsChildRedFlag"
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ ml: 2 }}>
                      <SummaryCount
                        summaryCountLoading={summaryCountLoading}
                        count={summaryCount?.overallOverdue}
                        label="OVERALL OVERDUE"
                        redirectLink={
                          [ADMIN, ADMIN_CASEWORKER].includes(
                            signedinUserRoleFS
                          ) || id === signedinUserId
                            ? "/dashboard/reportsChildrenOverdue"
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ ml: 2 }}>
                      <SummaryCount
                        summaryCountLoading={summaryCountLoading}
                        count={summaryCount?.familyServed}
                        label="FAMILIES ASSESSED"
                      />
                    </Grid>
                  </Grid>
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px",
                      }}
                    >
                      <CircularProgress
                        sx={{
                          zIndex: 1000,
                        }}
                        color="primary"
                      />
                    </div>
                  ) : (
                    <>
                      {childList?.length > 0 && (
                        <Table
                          size="medium"
                          stickyHeader
                          id="ThriveScaleChildren"
                        >
                          <TableHead>
                            <CustomTableHeader headers={ChildTableHeader} />
                          </TableHead>
                          <TableBody>
                            {childList?.map((child) => (
                              <TableRow key={child.childId}>
                                <TableCell align="Left">
                                  {child.firstName + " , " + child.lastName}
                                </TableCell>
                                <TableCell align="Left">
                                  {child.childId}{" "}
                                </TableCell>
                                <TableCell align="Left">
                                  {child.familyName || (
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                      fontStyle="italic"
                                    >
                                      Unassigned
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="Left">
                                  {child.HTChildPlacementStatusId &&
                                    childPlacementList &&
                                    childPlacementList.length &&
                                    `${childPlacementList.find(
                                      (item) =>
                                        item.id ===
                                        child.HTChildPlacementStatusId
                                    ).placementStatus
                                    }`}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Typography>
                    This user has not been assigned a role in Thrive Scale
                  </Typography>
                </>
              )}
            </CardContent>
            {childList?.length > 0 && (
              <CardActions>
                <Link
                  style={{ color: "#F37123", textDecoration: "none" }}
                  color="textSecondary"
                  to={`/dashboard/children`}
                  underline="none"
                  variant="h6"
                >
                  {t("common:common.View all in ThriveScale")}
                </Link>
              </CardActions>
            )}
          </Card>
        )}
    </>
  );
};

UserBasicDetails.propTypes = {
  address1: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string,
};

export default UserBasicDetails;
