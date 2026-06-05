import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import PlusIcon from "../../../../assets/icons/Plus";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Chip,
  Grid,
  AppBar,
  Toolbar,
  Autocomplete,
  Dialog,
  Menu,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Divider
} from "@mui/material";
import SearchIcon from "../../../../assets/icons/Search";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { customerApi } from "../../../../__fakeApi__/customerApi";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import { statusField } from "../../../../theme/CustomHooks";
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import { ModalService } from "../../../../components/Modal";
import DeactivateUser from "../DeactivateUser";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import { useDebouncedCallback } from "use-debounce";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
  PARENT_ROLE_ID,
  SUPER_ADMIN,
} from "../../../../helpers/constant";

const columnHeaders = [
  {
    label: "User name",
    value: "firstName",
  },
  {
    label: "Organization",
    value: "HTOrganizationId",
  },
  {
    label: "FosterShare role",
    value: "FSUserRoleId",
  },
  {
    label: "Thrive Scale role",
    value: "HTUserRoleId",
  },
  {
    label: "# active families",
    value: "familyCount", 
  },
 
  {
    label: "# active children",
    value: "Children",
  },

  {
    label: "Status",
    value: "isActive",
  },
  {
    label: "Actions",
    value: "Actions",
  },
];

const countryNameList = {
  india: { label: "india" },
  us: { label: "usa" },
  usa: { label: "usa" },
  uganda: { label: "uganda" },
};

const UserListTable = (props) => {
  const { t } = useTranslation(["common"]);
  const sortOptions = [
    {
      label: t("common:common.None"),
      id: "none",
    },
    {
      label: t("common:common.Email"),
      id: "email",
    },
    {
      label: t("common:common.Name"),
      id: "firstName",
    },
    {
      label: t("common:common.Organization"),
      id: "HTOrganizationId",
    },
    {
      label: t("common:common.Phone"),
      id: "phoneNumber",
    },
    {
      label: t("common:common.Role"),
      id: "HTUserRoleId",
    },
    {
      label: t("common:common.Status"),
      id: "isActive",
    },
  ];

  const statusOptions = [
    {
      label: t("common:common.Active"),
      id: "active",
    },
    {
      label: t("common:common.Deactivated"),
      id: "deactive",
    },
    {
      label: t("common:common.Pending"),
      id: "pending",
    },
  ];
  const {
    customers,
    getUserlist,
    savePageData,
    pageCount,
    saveCurrentPage,
    pageData,
    loading,
    orgOptions,
    activeUserCount,
    ...other
  } = props;
  const [stateData, setStateData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [countryData, setCountryData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [anchorE2, setAnchorE2] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [modelFlag, setModelFlag] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState("ASC");
  const {
    roleListHT,
    roleListFS,
    signedinUserRoleHT,
    signedinUserRoleFS,
    getLocationList,
  } = useContext(CommonDataContext);
  const typeOptions = orgOptions;
  const [typeFilter, setTypeFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [HTRoleId, setHTRoleID] = useState([]);
  const [FSRoleId, setFSRoleID] = useState([]);
  const [key, setKey] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [selectedFilterLabels, setSelectedFilterLabels] = useState(null);
  const [selectedFilterLabelsRoles, setSelectedFilterLabelsRoles] =
    useState(null);
  const [filterChipCleared, setFilterChipCleared] = useState(false);
  const [rowCount, setRowCount] = useState(10);
  const navigate = useNavigate();
  let singleClickTimer = "";
  let clickCount = 0;
  const ref = useRef();

  const handleClose2 = () => {
    setModelFlag(false);
    setSelectedUser(null);
  };

  const handleMenuClose = (index) => {
    const newMenuStates = [...menuStates];
    newMenuStates[index].anchorEl = null;
    setAnchorEl(newMenuStates);
  };

  const handleAddUser = () => {
    navigate("/dashboard/team/add", {
      state: {
        isAddForm: true,
      },
    });
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
          toast.success(t("common:common.User deactivated successfully"));
          getRefreshedUserList();
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
          toast.success(t("common:common.User reactivated successfully"));
          getRefreshedUserList();
        } else if (res.data.message === "User organization is not active.") {
          toast.error(t("common:common.User organization is not active"));
        }
      });
    } catch (err) {
      console.log("err on reactivation", err);
      toast.error(t("common:common.Something went wrong"));
    }
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getUserlist({
      globalSearchQuery: query.length > 2 ? query : "",
      orderByField: [[`${sort}`, `${sortOrder}`]],
      status:
        statusFilter.length > 0 && statusFilter.length < 3
          ? statusFilter
          : ["active", "pending"],
      pageNumber: 1,
      rowCount: event.target.value,
      HTUserRoleId: HTRoleId.length > 0 ? HTRoleId : null,
      FSUserRoleId: FSRoleId.length > 0 ? FSRoleId : null,
      accountId: typeFilter?.length
        ? typeFilter?.map((item) => item.id) || null
        : null,
    });
    setPage(1);
  };

  useEffect(() => {
    if (filterChipCleared) {
      handleApplyFilters();
      setFilterChipCleared(false);
    }
  }, [filterChipCleared]);

  const StatusChips = ({ selectedfilterList }) =>
    selectedfilterList?.map((item, index) => (
      <Chip
        color="primary"
        key={index}
        label={`${t(`common:common.${item.filterName}`)} : ${item.label}`}
        size="medium"
        sx={{
          backgroundColor: "#1D334B",
          borderRadius: "16px",
          mb: 1,
          mr: 1,
        }}
        onDelete={() => handleRemoveFilter(item.id, item.filterName)}
        deleteIcon={<CloseIcon />}
      />
    ));

  const handleRemoveFilter = (id, filterName) => {
    if (filterName === "Status") {
      handleStatusFilter(id, true);
    } else if (filterName === "FosterShare") {
      handleRoleChangeFS(id, true);
    } else if (filterName === "Thrive Scale") {
      handleRoleChangeHT(id, true);
    } else if (filterName === "Account") {
      handleTypeFilter(id);
    }
  };

  const handleApplyFilters = () => {
    let payload = {
      globalSearchQuery: query.length > 2 ? query : "",
      status:
        statusFilter.length > 0 && statusFilter.length < 4
          ? statusFilter
          : ["active", "pending"],
      pageNumber: "1",
      rowCount: rowCount,
      HTUserRoleId: HTRoleId.length > 0 ? HTRoleId : null,
      FSUserRoleId: FSRoleId.length > 0 ? FSRoleId : null,
      accountId: typeFilter?.length
        ? typeFilter?.map((item) => item.id) || null
        : null,
    };
    getUserlist(payload);
    if (
      statusFilter?.length > 0 ||
      HTRoleId?.length > 0 ||
      FSRoleId?.length > 0 ||
      (typeFilter != 0 && typeFilter?.length > 0)
    ) {
      setFiltersApplied(true);

      const selectedLabels = [];

      // Add status filter labels
      if (statusFilter) {
        statusFilter.forEach((id) => {
          const option = statusOptions.find((option) => option.id === id);
          if (option) {
            selectedLabels.push({
              label: option.label,
              id: option.id,
              filterName: "Status",
            });
          }
        });
      }
      // Add HT role labels
      if (HTRoleId) {
        HTRoleId.forEach((id) => {
          const option = roleListHT.find((option) => option.id === id);
          if (option) {
            selectedLabels.push({
              label: t(`common:common.${option.role}`),
              id: option.id,
              filterName: "Thrive Scale",
            });
          }
        });
      }
      if (FSRoleId) {
        FSRoleId.forEach((id) => {
          const option = roleListFS.find((option) => option.id === id);
          if (option) {
            selectedLabels.push({
              label: t(`common:common.${option.role}`),
              id: option.id,
              filterName: "FosterShare",
            });
          }
        });
      }
      if (typeFilter?.length) {
        typeFilter.map((acc) => {
          selectedLabels.push({
            label: acc?.accountName,
            id: acc.id,
            filterName: "Account",
          });
        });
      }
      setSelectedFilterLabels(selectedLabels);
    } else {
      setFiltersApplied(false);
    }
    setPage(1);
    handleCloseFilter(true);
  };

  const handleClearFilters = () => {
    let payload = {
      globalSearchQuery: query.length > 2 ? query : "",
      status: ["active", "pending"],
      pageNumber: "1",
      rowCount: rowCount,
      HTUserRoleId: null,
      FSUserRoleId: null,
      accountId: null,
    };
    setSelectedFilterLabelsRoles(null);
    setSelectedFilterLabels(null);
    setKey(!key);
    setStatusFilter([]);
    setTypeFilter([]);
    setHTRoleID([]);
    setFSRoleID([]);
    setFiltersApplied(false);
    handleCloseFilter(false);
    getUserlist(payload);
    setPage(1);
  };

  const handleConfirmResendInvite = async () => {
    try {
      const statusPayload = {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        phoneNumber: selectedUser.phoneNumber,
        email: selectedUser.email,
        HTOrganizationId: selectedUser.HTOrganizationId,
        HTUserRoleId: selectedUser.HTUserRoleId,
      };
      await APIS.ResendInvitation(statusPayload).then((res) => {
        if (res.data.Message === "Invitation sent Successfully") {
          toast.success(t("common:user.Invitation has been sent to User"));
          setModelFlag(false);
        } else {
          toast.error(t("common:common.Something went wrong"));
          setModelFlag(false);
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };

  useEffect(() => {
    setPagedata();
    getLocationsFromAPI();
    getTypesFromAPI();
    getLocationList();
  }, []);

  const setPagedata = () => {
    if (localStorage.getItem("userPageData") === null) {
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
      setStatusFilter(pageData.statusFilter);
    } else {
      let localPageData = JSON.parse(localStorage.getItem("userPageData"));
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
      setStatusFilter(localPageData.statusFilter);
      if (localPageData.typeFilter || localPageData.statusFilter) {
        setOpen(true);
      }
    }
  };

  const getLocationsFromAPI = async () => {
    try {
      const data = await customerApi.getLocations();
      setStateData([...data.states]);
      setCountryData([...data.countries]);
      setDistrictData([...data.districts]);
    } catch (err) {
      console.error(err);
    }
  };
  const getTypesFromAPI = async () => {
    try {
      const data = await customerApi.getOrganizationType();
      setTypesData([...data.organisationTypes]);
    } catch (err) {
      console.error(err);
    }
  };

  ////////////General Search Controlling States ////////////
  const debouncedHandleSearch = useDebouncedCallback(
    // function
    (event) => {
      handleQueryChange(event);
    },
    800
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();

      if (inputValue.length === 1 || inputValue.length === 2) {
        // Do something for string length 1 or 2
        handleQueryChange(e, true);
      }
    }
  };

  const handleQueryChange = (event, flag = false) => {
    setQuery(event.target.value);
    setPage(1);
    if (event.target.value === "" || event.target.value.length > 2 || flag) {
      getUserlist({
        globalSearchQuery: event.target.value,
        pageNumber: "1",
        rowCount: rowCount,
        HTUserRoleId: HTRoleId.length > 0 ? HTRoleId : null,
        FSUserRoleId: FSRoleId.length > 0 ? FSRoleId : null,
        accountId: typeFilter?.length
          ? typeFilter?.map((item) => item.id) || null
          : null,
        status:
          statusFilter.length > 0 && statusFilter.length < 3
            ? statusFilter
            : ["active", "pending"],
      });
    } else {
      return;
    }
    setQuery(event.target.value);
  };

  const handlePageChange = async (event, value) => {
    let payload = {
      globalSearchQuery: query.length > 2 ? query : "",
      orderByField: [[`${sort}`, `${sortOrder}`]],
      status:
        statusFilter.length > 0 && statusFilter.length < 3
          ? statusFilter
          : ["active", "pending"],
      pageNumber: value,
      rowCount: rowCount,
      HTUserRoleId: HTRoleId.length > 0 ? HTRoleId : null,
      FSUserRoleId: FSRoleId.length > 0 ? FSRoleId : null,
      accountId: typeFilter?.length
        ? typeFilter?.map((item) => item.id) || null
        : null,
    };
    await getUserlist(payload);
    setPage(value);
  };

  const handleSingleClickColumn = (value) => {
    let payload = {
      orderByField: [[`${value}`, `${sortOrder === "ASC" ? "DESC" : "ASC"}`]],
      pageNumber: "1",
      rowCount: rowCount,
      globalSearchQuery: query.length > 2 ? query : "",
      status:
        statusFilter.length > 0 && statusFilter.length < 3
          ? statusFilter
          : ["active", "pending"],
      HTUserRoleId: HTRoleId.length > 0 ? HTRoleId : null,
      FSUserRoleId: FSRoleId.length > 0 ? FSRoleId : null,
      accountId: typeFilter?.length
        ? typeFilter?.map((item) => item.id) || null
        : null,
    };
    getUserlist(payload);
    setSort(value);
    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    setPage(1);
  };

  const handleDblClickColumn = () => {
    let payload = {
      orderByField: [[]],
      pageNumber: "1",
    };
    getUserlist(payload);
    setSort("none");
    setPage(1);
  };

  const handleClickColumn = (e, value) => {
    clickCount++;
    if (value === "firstName") {
      if (clickCount === 1) {
        singleClickTimer = setTimeout(function () {
          clickCount = 0;
          handleSingleClickColumn(value);
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(singleClickTimer);
        clickCount = 0;
        handleDblClickColumn();
      }
    }
  };

  const handleSelectAllCustomers = (event) => {
    setSelectedCustomers(
      event.target.checked ? customers.map((customer) => customer.id) : []
    );
  };

  const handleTypeFilter = (id) => {
    const removedAccount = typeFilter.filter((option) => option.id !== id);
    setTypeFilter(removedAccount);
    setFilterChipCleared(true);
  };

  const handleStatusFilter = (value, isManualFilterClear = false) => {
    const updatedStatus = [...statusFilter];
    const index = updatedStatus.indexOf(value);

    if (index === -1) {
      updatedStatus.push(value);
    } else {
      updatedStatus.splice(index, 1);
    }
    setStatusFilter(updatedStatus);

    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const handleRoleChangeHT = (roleId, isManualFilterClear = false) => {
    const updatedRoles = [...HTRoleId];
    const index = updatedRoles.indexOf(roleId);
    if (index === -1) {
      updatedRoles.push(roleId);
    } else {
      updatedRoles.splice(index, 1);
    }
    setHTRoleID(updatedRoles);
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const handleRoleChangeFS = (roleId, isManualFilterClear = false) => {
    const updatedRoles = [...FSRoleId];
    const index = updatedRoles.indexOf(roleId);

    if (index === -1) {
      updatedRoles.push(roleId);
    } else {
      updatedRoles.splice(index, 1);
    }
    setFSRoleID(updatedRoles);
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const loadDefaultList = () => {
    setQuery("");
    setPage(1);
    getUserlist({
      globalSearchQuery: "",
      status: [],
      pageNumber: "1",
      HTUserRoleId: null,
      FSUserRoleId: null,
      accountId: null,
    });
  };
  const loadDefaultListOnClose = () => {
    if (open) {
      setQuery("");
      setPage(1);
      getUserlist({
        globalSearchQuery: "",
        organizationId: "",
        status: "",
        pageNumber: "1",
      });
    }
  };

  const menuStates = useMemo(
    () =>
      customers.map(() => {
        return {
          anchorEl: null,
        };
      }),
    [customers]
  );

  const handleMenuClick = (index) => (event) => {
    const newMenuStates = [...menuStates];
    newMenuStates[index].anchorEl = event.currentTarget;
    setAnchorEl(newMenuStates);
  };

  const getRefreshedUserList = (rowCount = 10) => {
    getUserlist({
      globalSearchQuery: query.length > 2 ? query : "",
      status:
        statusFilter.length > 0 && statusFilter.length < 3
          ? statusFilter
          : ["active", "pending"],
      pageNumber: page,
      rowCount: rowCount,
      HTUserRoleId: HTRoleId.length > 0 ? HTRoleId : null,
      FSUserRoleId: FSRoleId.length > 0 ? FSRoleId : null,
      accountId: typeFilter?.length
        ? typeFilter?.map((item) => item.id) || null
        : null,
    });
  };

  const handleClickFilter = (event) => {
    setAnchorE2(event.currentTarget);
  };

  const handleCloseFilter = (isfilterApplied) => {
    setAnchorE2(null);

    if (!isfilterApplied) {
      setKey(!key);
      setTypeFilter([]);
      setStatusFilter([]);
      setHTRoleID([]);
      setFSRoleID([]);
    }
  };

  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers =
    selectedCustomers.length > 0 && selectedCustomers.length < customers.length;
  const selectedAllCustomers = selectedCustomers.length === customers.length;

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
    <Card
      //
      sx={{ borderRadius: 2 }}
      {...other}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          pt: 1,
          p: 1,
        }}
      >
        <Box
          sx={{
            m: 1,
            maxWidth: "100%",
            width: 350,
          }}
        >
          <TextField
            fullWidth
            InputProps={{
              sx: {
                borderRadius: "4px",
              },
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{
                    borderRadius: 0,
                  }}
                >
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query.length > 0 && (
                <IconButton color="inherit" onClick={() => loadDefaultList()}>
                  <ClearIcon />
                </IconButton>
              ),
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              debouncedHandleSearch(e);
            }}
            onKeyDown={handleKeyPress} // Handle "Enter" key press
            //onKeyUp={handleSearch}
            placeholder={t("common:common.Search")}
            value={query}
            variant="outlined"
          />
        </Box>
        <Box
          sx={{
            mr: 4,
            width: 20,
          }}
        >
          <IconButton
            color="inherit"
            onClick={(e) => {
              handleClickFilter(e);
              loadDefaultListOnClose();
            }}
          >
            {/* <FilterListIcon /> */}
            <img
              alt="fiter_user"
              src="/static/icons/filterIcon.svg"
              width={20}
              height={17}
              style={{ alignSelf: "center" }}
            />
            {filtersApplied && (
              <div
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#1D334B", // Change color as needed
                }}
              ></div>
            )}
          </IconButton>
          <Menu
            anchorEl={anchorE2}
            open={Boolean(anchorE2)}
            onClose={() => handleCloseFilter(filtersApplied)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              disableRipple
              sx={{
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "inherit", // Override the hover background color
                },

                cursor: "default",
              }}
            >
              <strong>{t("common:common.Filters")}</strong>
            </MenuItem>
            <Divider />
            {[SUPER_ADMIN].includes(signedinUserRoleHT) && (
              <>
                <Box sx={{ ml: 1 }}>
                  <strong>{t("common:common.Organization")}</strong>
                </Box>
                <Box>
                  <MenuItem>
                    <Autocomplete
                      multiple
                      id="checkboxes-tags-demo"
                      options={typeOptions}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.accountName}
                      value={typeFilter}
                      onChange={(event, newValue) => {
                        setTypeFilter(newValue);
                      }}
                      defaultValue={typeOptions && typeOptions[0]}
                      sx={{ width: 1 }}
                      renderTags={(value, getTagProps) => {
                        const numTags = value?.length;

                        return (
                          <Chip
                            color="primary"
                            key={value}
                            label={
                              value?.length < 2
                                ? value
                                    .slice(0, 1)
                                    .map((option, _) => option.accountName)
                                    .join(", ")
                                : numTags > 1 && `${numTags}`
                            }
                            size="medium"
                            sx={{
                              backgroundColor: "#1D334B",
                              borderRadius: "16px",
                              mr: 1,
                              maxWidth: "70%",
                            }}
                            onDelete={() => setTypeFilter([])}
                            deleteIcon={
                              <CloseIcon style={{ fontSize: "17px" }} />
                            }
                          ></Chip>
                        );
                      }}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option.accountName}
                        </li>
                      )}
                      renderInput={(params) => {
                        const selectedCount = typeFilter?.length;
                        const inputProps = {
                          ...params.InputProps,
                        };

                        return (
                          <TextField
                            {...params}
                            sx={{
                              width: 1,
                              // ml: 1,

                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                              },
                            }}
                            textFieldProps={{
                              fullWidth: true,
                              borderRadius: "0px",
                              margin: "normal",
                              variant: "outlined",
                              label: "",
                              placeholder: "Select an account",
                            }}
                            placeholder={
                              selectedCount < 1 &&
                              t("common:common.Select an organization")
                            }
                            //label="Multi-select Dropdown"
                            variant="outlined"
                            InputProps={inputProps}
                          />
                        );
                      }}
                    />
                  </MenuItem>
                </Box>
              </>
            )}

            {signedinUserRoleFS && signedinUserRoleFS != "unassigned" && (
              <>
                <Box sx={{ ml: 1 }}>
                  <strong>{t("common:common.FosterShare")}</strong>
                </Box>
                <Box>
                  <MenuItem
                    disableRipple
                    sx={{
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "inherit", // Override the hover background color
                      },

                      cursor: "default",
                    }}
                  >
                    <FormGroup>
                      {roleListFS
                        .sort((a, b) => a.id - b.id)
                        .filter((role) => role.id !== PARENT_ROLE_ID)
                        .map((role) => (
                          <FormControlLabel
                            key={role.id}
                            control={
                              <Checkbox
                                checked={FSRoleId.includes(role.id)}
                                onChange={() => handleRoleChangeFS(role.id)}
                              />
                            }
                            label={`${t(`common:common.${role.role}`)}`}
                          />
                        ))}
                    </FormGroup>
                  </MenuItem>
                </Box>
              </>
            )}

            {signedinUserRoleHT && signedinUserRoleHT != "unassigned" && (
              <>
                <Box sx={{ ml: 1 }}>
                  <strong>{t("common:common.ThriveScale")}</strong>
                </Box>
                <Box>
                  <MenuItem
                    disableRipple
                    sx={{
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "inherit", // Override the hover background color
                      },

                      cursor: "default",
                    }}
                  >
                    <FormGroup>
                      {roleListHT
                        .sort((a, b) => a.id - b.id)
                        .map((role) => (
                          <FormControlLabel
                            key={role.id}
                            control={
                              <Checkbox
                                checked={HTRoleId.includes(role.id)}
                                onChange={() => handleRoleChangeHT(role.id)}
                              />
                            }
                            label={`${t(`common:common.${role.role}`)}`}
                          />
                        ))}
                    </FormGroup>
                  </MenuItem>
                </Box>
              </>
            )}
            <Box sx={{ ml: 1 }}>
              <strong>{t("common:common.Status")}</strong>
            </Box>
            <Box>
              <MenuItem
                disableRipple
                sx={{
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "inherit", // Override the hover background color
                  },

                  cursor: "default",
                }}
              >
                <FormGroup>
                  {statusOptions.map((status) => (
                    <FormControlLabel
                      key={status.id}
                      control={
                        <Checkbox
                          checked={statusFilter?.includes(status.id)}
                          onChange={() => handleStatusFilter(status.id)}
                        />
                      }
                      label={status.label}
                    />
                  ))}
                </FormGroup>
              </MenuItem>
            </Box>
            <AppBar
              position="sticky"
              color="default"
              sx={{ top: "auto", bottom: 0 }}
            >
              <Toolbar
                sx={{ justifyContent: "space-between", paddingRight: 2 }}
              >
                <Button variant="outlined" onClick={handleClearFilters}>
                  {t("common:common.Clear")}
                </Button>
                <Button variant="contained" onClick={handleApplyFilters}>
                  {t("common:common.Apply")}
                </Button>
              </Toolbar>
            </AppBar>
          </Menu>
        </Box>
        {([SUPER_ADMIN, ADMIN_CASEWORKER, ADMIN].includes(signedinUserRoleHT) ||
          [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
            signedinUserRoleFS
          )) && (
          <Button
            sx={{ mr: 1, borderRadius: "4px" }}
            variant="contained"
            startIcon={<PlusIcon fontSize="small" />}
            onClick={() => handleAddUser()}
          >
            {t("common:user.Add User")}
          </Button>
        )}
      </Box>
      {enableBulkActions && (
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              backgroundColor: "background.paper",
              mt: "6px",
              position: "absolute",
              px: "4px",
              width: "100%",
              zIndex: 2,
            }}
          >
            <Checkbox
              checked={selectedAllCustomers}
              color="primary"
              indeterminate={selectedSomeCustomers}
              onChange={handleSelectAllCustomers}
            />

            <Button color="primary" sx={{ ml: 2 }} variant="outlined">
              {"common:common.Delete"}
            </Button>
            <Button color="primary" sx={{ ml: 2 }} variant="outlined">
              {"common:common.Edit"}
            </Button>
          </Box>
        </Box>
      )}

        {loading && (
          <CircularProgress
            sx={{
              zIndex: 1000,
              position: "fixed",
              top: "50%", // Adjusted to 50% to center vertically
              left: "50%", // Adjusted to 50% to center horizontally
              transform: "translate(-50%, -50%)", // Centering trick
            }}
            color="primary"
          />
        )}
        <Box
          className={customers.length ? "scrollListTable" : ""}
          sx={{ minWidth: "auto" }}
        >
          <Box sx={{ ml: 2, mb: 2 }}>
            {filtersApplied && (
              <>
                {selectedFilterLabels && (
                  <StatusChips selectedfilterList={selectedFilterLabels} />
                )}
                <span
                  onClick={handleClearFilters}
                  style={{
                    color: "#F37123",
                    cursor: "pointer",
                    marginLeft: "4px",
                  }}
                >
                  {t("common:common:Clear Filters")}
                </span>
              </>
            )}
          </Box>
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px #C6C4BE solid",
            }}
          ></div>
          {customers && customers.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  {columnHeaders.map((option) => (
                    <TableCell
                      key={option.value} // Make sure to provide a unique key
                      align={option.label === "Actions" ? "center" : "inherit"}
                      sx={option.style || null}
                    >
                      {option.value === "firstName" ? (
                        <TableSortLabel
                          active={sort === "firstName"}
                          direction={sortOrder === "ASC" ? "asc" : "desc"}
                          onClick={(e) => handleClickColumn(e, option.value)}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {t(`common:common.${option.label}`)}
                          </Typography>{" "}
                        </TableSortLabel>
                      ) : (
                        <span>
                          {option.label === "Actions" ? (
                            ""
                          ) : (
                            <Box>
                              {option.subLabel && (
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{
                                    mb: -0.5,
                                    textTransform: "uppercase",
                                    fontSize: "12px",
                                  }}
                                >
                                  {t(`common:common.${option.subLabel}`)}
                                </Typography>
                              )}
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ pb: 1.25 }}
                              >
                                {t(`common:common.${option.label}`)}
                              </Typography>
                            </Box>
                          )}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer, index) => {
                  const isCustomerSelected = selectedCustomers.includes(
                    customer.id
                  );

                  return (
                    <TableRow
                      hover
                      key={customer.id}
                      selected={isCustomerSelected}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            alignItems: "center",
                            display: "flex",
                          }}
                        >
                          <Box sx={{ ml: 1 }}>
                            {customer?.id ===
                              localStorage.getItem("username") ||
                            [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                              signedinUserRoleHT
                            ) ||
                            [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                              signedinUserRoleFS
                            ) ? (
                              <Link
                                color="inherit"
                                component={RouterLink}
                                to={`/dashboard/team/${customer.id}/view`}
                                variant="subtitle2"
                                style={{
                                  color: "#F37123",
                                  textDecoration: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {customer.firstName + " "}
                                {customer.lastName}
                              </Link>
                            ) : (
                              <Typography variant="body2">
                                {customer.firstName + " "}
                                {customer.lastName}
                              </Typography>
                            )}
                            <Typography variant="body2" color="textSecondary">
                              {customer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {customer?.accountName}
                      </TableCell>
                      <TableCell>
                        {roleListFS &&
                        roleListFS.length &&
                        customer.FSUserRoleId &&
                        roleListFS.find(
                          (item) => item.id == customer.FSUserRoleId
                        )?.cognitoValue !== "unassigned" ? (
                          `${t(
                            `common:common.${
                              roleListFS.find(
                                (item) => item.id == customer.FSUserRoleId
                              )?.role
                            }`
                          )}`
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontStyle="italic"
                          >
                            {t(
                              `common:common.${
                                roleListFS.find(
                                  (item) => item.id == customer.FSUserRoleId
                                )?.role
                              }`
                            )}
                          </Typography>
                        )}
                      </TableCell>
                       <TableCell>
                        {roleListHT &&
                        roleListHT.length &&
                        customer.HTUserRoleId &&
                        roleListHT.find(
                          (item) => item.id == customer.HTUserRoleId
                        )?.cognitoValue !== "unassigned" ? (
                          `${t(
                            `common:common.${
                              roleListHT.find(
                                (item) => item.id == customer.HTUserRoleId
                              )?.role
                            }`
                          )}`
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontStyle="italic"
                          >
                            {t(
                              `common:common.${
                                roleListHT.find(
                                  (item) => item.id == customer.HTUserRoleId
                                )?.role
                              }`
                            )}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer?.FSFamilyCount ? (
                          customer?.FSFamilyCount
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontStyle="italic"
                          >
                            {t("common:common.none")}
                          </Typography>
                        )}
                      </TableCell>
                     
                      <TableCell>
                        {customer.TSChildCount ? (
                          customer.TSChildCount
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontStyle="italic"
                          >
                            {t("common:common.none")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color="primary"
                          label={t(
                            `common:common.${
                              statusField[customer?.status]?.label
                            }`
                          )}
                          size="small"
                          sx={{
                            backgroundColor:
                              statusField[customer?.status]?.color,
                            borderRadius: "2px",
                          }}
                        />
                      </TableCell>
                      {([SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                        signedinUserRoleHT
                      ) ||
                        [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(
                          signedinUserRoleFS
                        )) && (
                        <TableCell align="right">
                          <Tooltip title={t("common:common.Actions")}>
                            <IconButton onClick={handleMenuClick(index)}>
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>

                          {/* Render the Menu component with its own anchorEl state */}
                          <Menu
                            anchorEl={menuStates[index].anchorEl}
                            open={Boolean(menuStates[index].anchorEl)}
                            onClose={() => handleMenuClose(index)}
                            PaperProps={{
                              style: {
                                borderRadius: "4px",
                              },
                            }}
                          >
                            <MenuItem
                              onClick={() => handleMenuClose(index)}
                              style={{ color: "#F37123" }}
                              component={RouterLink}
                              to={`/dashboard/team/${customer.id}/view`}
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
                              onClick={() => handleMenuClose(index)}
                              style={{ color: "#F37123" }}
                              component={RouterLink}
                              to={{
                                pathname: `/dashboard/team/${customer.id}/edit`,
                                state: { isAddForm: false },
                              }}
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
                            {customer.status?.toUpperCase() === "PENDING" && (
                              <MenuItem
                                onClick={() => {
                                  handleMenuClose(index);
                                  resendInvitedUser(customer);
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
                            {customer.id !==
                              localStorage.getItem("username") && (
                              <MenuItem
                                onClick={() => {
                                  ModalService.open(
                                    () =>
                                      customer &&
                                      (customer.isActive ||
                                        customer.status?.toUpperCase() ===
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
                                        customer &&
                                        (customer.isActive ||
                                          customer.status?.toUpperCase() ===
                                            "PENDING")
                                          ? t("common:common.Deactivate User")
                                          : t("common:common.Reactivate User"),
                                      modalDescription:
                                        customer &&
                                        (customer.isActive ||
                                          customer.status?.toUpperCase() ===
                                            "PENDING")
                                          ? t(
                                              "common:common.Once deactivated, this user will no longer have access to FosterShare and/or ThriveScale"
                                            )
                                          : t(
                                              "common:common.Once reactivated, this user will have access to FosterShare and/or ThriveScale"
                                            ),
                                      actionButtonText:
                                        customer &&
                                        (customer.isActive ||
                                          customer.status?.toUpperCase() ===
                                            "PENDING")
                                          ? t("common:common.Deactivate User")
                                          : t("common:common.Reactivate User"),
                                        cancelButtonText:t("common:common.Cancel"),
                                      width: "35%",
                                      onClick: () => {
                                        handleMenuClose(index);
                                        setTimeout(() => {
                                          if (customer.isActive) {
                                            handleDeactivateUser(
                                              customer.id,
                                              customer.TWAccountId,
                                              customer.HTUserRoleId,
                                              customer.FSUserRoleId,
                                              customer.countryName,
                                              ref
                                            );
                                          } else if (
                                            customer.status?.toUpperCase() ===
                                            "PENDING"
                                          ) {
                                            deactivateUserAfterValidation(
                                              customer.id,
                                              ref
                                            );
                                          } else {
                                            handleReactivateUser(
                                              customer.id,
                                              customer.TWAccountId
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
                                {customer &&
                                (customer.isActive ||
                                  customer.status?.toUpperCase() === "PENDING")
                                  ? t("common:common.Deactivate User")
                                  : t("common:common.Reactivate User")}
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {!loading && customers && customers.length === 0 && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>{t("common:common.No match")}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      <Box
        sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
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

      <Dialog aria-labelledby="simple-dialog-title" open={modelFlag}>
        <DialogTitle id="simple-dialog-title">
          {t("common:question.Are you sure")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("common:user.confirmreset")}
            <br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmResendInvite} color="primary">
            {t("common:common.Yes")}
          </Button>
          <Button onClick={handleClose2} color="primary" autoFocus>
            {t("common:common.No")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

UserListTable.propTypes = {
  customers: PropTypes.array.isRequired,
};

export default UserListTable;
