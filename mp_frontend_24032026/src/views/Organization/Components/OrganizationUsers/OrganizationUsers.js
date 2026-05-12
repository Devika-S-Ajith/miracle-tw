import {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Card,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Pagination,
  TableRow,
  Typography,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  ADMIN,
  ADMIN_CASEMANAGER,
  ADMIN_CASEWORKER,
  CASEWORKER,
  SUPER_ADMIN,
} from "../../../../helpers/constant";
import { statusField } from "../../../../theme/CustomHooks";
import toast from "react-hot-toast";
import DeactivateUser from "../../../User/Components/DeactivateUser";
import { ModalService } from "../../../../components/Modal";
import { getLocationNames } from "../../../../helpers/helperFunction";
import ListPaging from "../../../../components/UserComponents/ListPaging";

const OrganizationUsers = ({ selectedCountry }) => {
  const { t } = useTranslation(["common"]);
  const [accountUsers, setAccountUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    roleListHT,
    roleListFS,
    signedinUserRoleHT,
    signedinUserRoleFS,
    locationList,
  } = useContext(CommonDataContext);
  let { id } = useParams();
  const ref = useRef();

  const countryNameList = {
    india: { label: "india" },
    us: { label: "usa" },
    usa: { label: "usa" },
    uganda: { label: "uganda" },
  };

  const [page, setPage] = useState(1);
  const [pageCount, setpageCount] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    getAccountUsers(selectedCountry,{
      rowCount: rowCount,
      pageNumber: newPage,
      globalSearchQuery: "",
      status: ["active", "pending", "deactive"],
      HTUserRoleId: null,
      FSUserRoleId: null,
      accountId: [`${id}`],
      
    });
  };
  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getAccountUsers(selectedCountry,{
      rowCount: event.target.value,
      pageNumber: "1",
      globalSearchQuery: "",
      status: ["active", "pending", "deactive"],
      HTUserRoleId: null,
      FSUserRoleId: null,
      accountId: [`${id}`],
      
    });
  };

  const getAccountUsers = useCallback(async (selCountry,payload = null) => {
    setLoading(true);
    const getUserListpayload = payload?payload:{
      rowCount: "10",
      pageNumber: page,
      globalSearchQuery: "",
      status: ["active", "pending", "deactive"],
      HTUserRoleId: null,
      FSUserRoleId: null,
      accountId: [`${id}`],
      
    };
    try {
      getUserListpayload.HTCountryId = selCountry.id;

      const data = await APIS.ListUsers(getUserListpayload);
      const familyData = await APIS.getFamilyPerCaseWorker({});
      const childData = await APIS.getChildPerCaseWorker(
        countryNameList[
          getLocationNames(locationList, selCountry.id).toLowerCase()
        ].label
      );

      if (data && data.data && data.data.data) {
        let listData = data.data.data;
        listData.map((user) => {
          user.TSChildCount = childData?.data?.data?.[user.id] || 0;
          user.FSFamilyCount = familyData?.data?.data?.[user.id] || 0;
        });
        setAccountUsers(listData);
        setpageCount(data && data.data && data.data?.pageCount);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

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
          getAccountUsers(selectedCountry);
          toast.success("User deactivated successfully");
        } else if (res.data.Message === "Status Changed Successfully") {
          //toast.success(SuccessMessage);
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
      if ([SUPER_ADMIN].includes(signedinUserRoleHT) || [SUPER_ADMIN].includes(signedinUserRoleFS)) {
        deactivateUserAfterValidation(id, ref);
      } else {
        if ([CASEWORKER, ADMIN_CASEWORKER, ADMIN].includes(HTRole) ||
          [CASEWORKER, ADMIN_CASEWORKER, ADMIN].includes(FSRole)) {
          const payloadRoleCheck = {
            TWUserId: id,
            TWAccountId: accountID,
            htuserRole: HTRole,
            fsuserRole: FSRole,
          };
          APIS.ValidateUserDeactivation(payloadRoleCheck).then((res) => {
            if (res?.data?.message === "NOT OK") {
              ModalService.open(({ close }) => <></>, {
                modalTitle: "Deactivate user",
                width: "30%",
                modalDescription: t(`common:common.${res?.data?.data.replace(/\.$/, '')}`, res?.data?.data.replace(/\.$/, '')),
                cancelButtonText: "Ok",
                hideActionButton: true,
              });
            } else if (res?.data?.message === "OK") {
              deactivateUserAfterValidation(id, ref);
            } else {
              toast.error(t("common:common.Something went wrong"));
            }
          });
        } else {
          deactivateUserAfterValidation(id, ref);
        }
      }
      
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
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
          getAccountUsers(selectedCountry);
        } else if (res.data.message === "User organization is not active.") {
          toast.error("User organization is not active");
        } else {
          //toast.error(t("common:common.Something went wrong"));
          //toast.error(ErrorMessage);
        }
      });
    } catch (err) {
      console.log("err on reactivation", err);
      toast.error(t("common:common.Something went wrong"));
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      getAccountUsers(selectedCountry);
    }
  }, [selectedCountry]);

  const menuStates = useMemo(
    () =>
      accountUsers?.map(() => {
        return {
          anchorEl: null,
        };
      }),
    [accountUsers]
  );

  const handleMenuClick = (index) => (event) => {
    const newMenuStates = [...menuStates];
    newMenuStates[index].anchorEl = event.currentTarget;
    setAnchorEl(newMenuStates);
  };

  const handleMenuClose = (index) => () => {
    const newMenuStates = [...menuStates];
    newMenuStates[index].anchorEl = null;
    setAnchorEl(newMenuStates);
  };

  const resendInvitedUser = async ({ id, email }) => {
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

  return (
    <Card sx={{ boxShadow: "none", border: "none", width: "100%",}}>
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
        <Box >
          {accountUsers && accountUsers.length > 0 && (
            <>
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Table sx={{boxShadow: "none", border: "none" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pb: 0, pl: 2 }}>
                      {/* todo - Add to translation file */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: -1 }}
                      >
                        {t("common:common.User name")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ pb: 0, pl: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.FosterShare role","FosterShare role")}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ pb: 0, pl: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Thrive Scale role","Thrive Scale role")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ pb: 0, pl: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ pb: 1.25, pt: 0.5 }}
                      >
                        {t("common:common.# active families","# active families")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ pb: 0, pl: 2 }}>
                      {/* <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          mb: -1,
                          textTransform: "uppercase",
                          fontSize: "12px",
                        }}
                      >
                        {t("common:common.Thrive Scale")}
                      </Typography> */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ pb: 1.25, pt: 0.5 }}
                      >
                        {t("common:common.# active children","# active children")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ pb: 0, pl: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {t("common:common.Status")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountUsers &&
                    accountUsers?.length &&
                    accountUsers?.map((accountUser, index) => (
                      <TableRow key={accountUser.id}>
                        <TableCell>
                          {[SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                            signedinUserRoleHT
                          ) ||
                          [SUPER_ADMIN, ADMIN, ADMIN_CASEMANAGER].includes(
                            signedinUserRoleFS
                          ) ? (
                            <RouterLink
                              sx={{ flex: 1 }}
                              style={{
                                color: "#F37123",
                                textDecoration: "none",
                              }}
                              color="textSecondary"
                              to={`/dashboard/team/${accountUser.id}/view`}
                              underline="none"
                              variant="h6"
                            >
                              {accountUser.firstName}
                              {" " + accountUser.lastName}
                            </RouterLink>
                          ) : (
                            <Typography variant="body2">
                              {accountUser.firstName + " "}
                              {accountUser.lastName}
                            </Typography>
                          )}
                          <Typography variant="body2" color="textSecondary">
                            {accountUser.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {`${
                            roleListFS &&
                            roleListFS.length &&
                            accountUser.FSUserRoleId &&
                            t(
                              `common:common.${
                                roleListFS.find(
                                  (item) => item.id === accountUser.FSUserRoleId
                                )?.role
                              }`
                            )
                          }`}
                        </TableCell>
                       
                        <TableCell>
                          {`${
                            roleListHT &&
                            roleListHT.length &&
                            accountUser.HTUserRoleId &&
                            t(
                              `common:common.${
                                roleListHT.find(
                                  (item) => item.id === accountUser.HTUserRoleId
                                )?.role
                              }`
                            )
                          }`}
                        </TableCell>
                        <TableCell>
                          {/* Todo */}
                          {accountUser.FSFamilyCount}
                        </TableCell>
                        <TableCell>{accountUser.TSChildCount}</TableCell>
                        <TableCell>
                          <Chip
                            color="primary"
                            label={t(
                              `common:common.${
                                statusField[accountUser?.status]?.label
                              }`
                            )}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusField[accountUser?.status]?.color,
                              borderRadius: "2px",
                            }}
                          />
                        </TableCell>
                        {([SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                          signedinUserRoleHT
                        ) ||
                          [SUPER_ADMIN, ADMIN, ADMIN_CASEMANAGER].includes(
                            signedinUserRoleFS
                          )) && (
                          <TableCell align="right">
                            <Tooltip title={t("common:common.Actions")}>
                              <IconButton onClick={handleMenuClick(index)}>
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>

                            <Menu
                              anchorEl={menuStates[index].anchorEl}
                              open={Boolean(menuStates[index].anchorEl)}
                              onClose={handleMenuClose(index)}
                              PaperProps={{
                                style: {
                                  borderRadius: "4px",
                                },
                              }}
                            >
                              <MenuItem
                                onClick={handleMenuClose}
                                style={{ color: "#F37123" }}
                                component={RouterLink}
                                to={`/dashboard/team/${accountUser.id}/view`}
                              >
                                <img
                                  alt="view_account"
                                  src="/static/icons/viewIcon.svg"
                                  width={20}
                                  height={20}
                                  style={{
                                    alignSelf: "center",
                                    marginRight: "8px",
                                  }}
                                />
                                {t("common:common.View details")}
                              </MenuItem>
                              <MenuItem
                                onClick={handleMenuClose}
                                style={{ color: "#F37123" }}
                                component={RouterLink}
                                to={`/dashboard/team/${accountUser.id}/edit`}
                              >
                                <img
                                  alt="edit_account"
                                  src="/static/icons/editIcon.svg"
                                  width={16}
                                  height={16}
                                  style={{
                                    alignSelf: "center",
                                    marginRight: "8px",
                                  }}
                                />
                                {t("common:common.Edit")}
                              </MenuItem>
                              {["Pending"].includes(accountUser.status) && (
                                <MenuItem
                                  onClick={() => {
                                    resendInvitedUser(accountUser);
                                    handleMenuClose(index)();
                                  }}
                                  style={{ color: "#F37123" }}
                                >
                                  <img
                                    alt="add_user"
                                    src="/static/icons/linkAccountIcon.svg"
                                    width={20}
                                    height={16}
                                    style={{
                                      alignSelf: "center",
                                      marginRight: "8px",
                                    }}
                                  />
                                  {t("common:common.Resend Invite")}
                                </MenuItem>
                              )}
                              {accountUser.id !==
                                localStorage.getItem("username") && (
                                <MenuItem
                                  onClick={() => {
                                    ModalService.open(
                                      () =>
                                        accountUser &&
                                        (accountUser.isActive ||
                                          accountUser.status?.toUpperCase() ===
                                            "PENDING") ? (
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
                                          accountUser &&
                                          (accountUser.isActive ||
                                            accountUser.status?.toUpperCase() ===
                                              "PENDING")
                                            ? t("common:common.Deactivate User")
                                            : t(
                                                "common:common.Reactivate User"
                                              ),
                                        modalDescription:
                                          accountUser &&
                                          (accountUser.isActive ||
                                            accountUser.status?.toUpperCase() ===
                                              "PENDING")
                                            ? t(
                                                "common:common.Once deactivated, this user will no longer have access to FosterShare and/or ThriveScale"
                                              )
                                            : t(
                                                "common:common.Once reactivated, this user will have access to FosterShare and/or ThriveScale"
                                              ),
                                        actionButtonText:
                                          accountUser &&
                                          (accountUser.isActive ||
                                            accountUser.status?.toUpperCase() ===
                                              "PENDING")
                                            ? t("common:common.Deactivate User")
                                            : t(
                                                "common:common.Reactivate User"
                                              ),
                                          cancelButtonText:t("common:common.Cancel"),
                                        onClick: () => {
                                          handleMenuClose(index);
                                          setTimeout(() => {
                                            if (
                                              accountUser.isActive ||
                                              accountUser.status?.toUpperCase() ===
                                                "PENDING"
                                            ) {
                                              handleDeactivateUser(
                                                accountUser.id,
                                                accountUser.TWAccountId,
                                                accountUser.HTUserRoleId,
                                                accountUser.FSUserRoleId,
                                                accountUser.countryName,
                                                ref
                                              );
                                            } else {
                                              handleReactivateUser(
                                                accountUser.id,
                                                accountUser.TWAccountId
                                              );
                                            }
                                          }, 0);
                                        },
                                      }
                                    );
                                    handleMenuClose(index);
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
                                  {accountUser &&
                                  (accountUser.isActive ||
                                    accountUser.status?.toUpperCase() ===
                                      "PENDING")
                                    ? t("common:common.Deactivate User")
                                    : t("common:common.Reactivate User")}
                                </MenuItem>
                              )}
                            </Menu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                }}
                p={1}
                m={1}
              >
                <ListPaging
                  rowCount={rowCount}
                  handleRowCountChange={handleRowCountChange}
                ></ListPaging>
                <Box>
                  <Pagination
                    onChange={handlePageChange}
                    page={page}
                    count={pageCount}
                    shape="rounded"
                  />
                </Box>
              </Box>
            </>
          )}
          {accountUsers && accountUsers.length === 0 && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>
                      {t("common:common.No Users In Organization")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
    </Card>
  );
};

export default OrganizationUsers;