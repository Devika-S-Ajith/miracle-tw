import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormGroup,
  FormControlLabel,
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
  Menu, 
  MenuItem
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useDebouncedCallback } from "use-debounce";

import PlusIcon from "../../../../assets/icons/Plus";
import APIS from "../../../../common/hooks/UseApiCalls";
import SearchIcon from "../../../../assets/icons/Search";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import AutoCompleteDropdownToFilter from "../../../../components/UserComponents/AutoCompleteDropdownToFilter";
import { ModalService } from "../../../../components/Modal";
import { getLocationNames } from "../../../../helpers/helperFunction";
import DeactivateAccount from "../DeactivateAccount";
import "./OrganizationListTable.css";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import { ADMIN, ADMIN_CASEMANAGER, ADMIN_CASEWORKER, SUPER_ADMIN } from "../../../../helpers/constant";

const columnHeaders = [
  {
    label: "Organization Name",
    value: "accountName",
  },
  {
    label: "Organization ID",
    value: "",
  },
  {
    label: "FosterShare",
    value: "",
  },
  {
    label: "ThriveScale",
    value: "",
  },
  {
    label: "Country",
    value: "MPCountryId",
  },
  {
    label: "Status",
    value: "isActive",
  },
  {
    label: "Actions",
    value: "",
    styleValue: { pl: 6, fontWeight: "600" },
  },
];

const OrganizationListTable = (props) => {
  const { t } = useTranslation(["common"]);
  const sortOptions = [
    {
      label: t("common:common.None"),
      id: "none",
    },
    {
      label: t("common:common.Location"),
      id: "HTDistrictId",
    },
    {
      label: t("common:common.Name"),
      id: "accountName",
    },

    {
      label: t("common:common.Phone Number"),
      id: "phoneNumber",
    },
    {
      label: t("common:common.Status"),
      id: "isActive",
    },
    {
      label: t("common:common.Type"),
      id: "HTOrganizationTypeId",
    },
  ];

  const statusOptions = [
    {
      label: t("common:common.All"),
      id: "All",
    },
    {
      label: t("common:common.Active"),
      id: "Active",
    },
    {
      label: t("common:common.Inactive"),
      id: "Inactive",
    },
  ];
  const {
    accounts,
    activeAccountCount,
    getOrganisationlist,
    savePageData,
    pageCount,
    saveCurrentPage,
    pageData,
    loading,
    ...other
  } = props;
  const { locationList, typeList, signedinUserRoleHT, signedinUserRoleFS } =
    useContext(CommonDataContext);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [anchorEl, setAnchorEl] = useState(null);
  const typeOptions = [{ id: "0", name: "All" }, ...typeList];
  const [typeFilter, setTypeFilter] = useState(
    typeOptions && typeOptions[0].id
  );
  const [statusFilter, setStatusFilter] = useState(
    statusOptions && statusOptions[1].id
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrgToDelete, setSelectedOrgToDelete] = useState(null);
  const [orgToLink, setOrgToLink] = useState([]);
  const [accountListToLink, setAccountListToLink] = useState([]);
  const [selectedLinkAccount, setSelectedLinkAccount] = useState([]);
  const [linkAccountopen, setlinkAccountopen] = useState(false);
  const [loadingSaveLinkAccounts, setLoadingSaveLinkAccounts] = useState(false);
  const [anchorE2, setAnchorE2] = useState(null);
  const [HTAccountTypes, setHTAccountTypes] = useState([]);
  const [isFSEnabled, setIsFSEnabled] = useState(null);
  const [isHTEnabled, setHTEnabled] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [selectedFilterLabels, setSelectedFilterLabels] = useState(null);
  const navigate = useNavigate();
  let singleClickTimer = "";
  let clickCount = 0;
  const ref = useRef();
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filterChipCleared, setFilterChipCleared] = useState(false);
  const [rowCount, setRowCount] = useState(10);
  const loggedInUserOrgId = localStorage.getItem("orgId");

  const handleCloseLinkAccountPopUp = () => {
    setOrgToLink([]);
    setAccountListToLink([]);
    setSelectedLinkAccount([]);
    setlinkAccountopen(false);
  };

  const handleLinkAccountChange = (newSelected) => {
    setSelectedLinkAccount(newSelected);
  };

  const handleSaveLinkAccount = async () => {
    try {
      setLoadingSaveLinkAccounts(true);
      const statusPayload = {
        accountId: orgToLink?.id,
        linkedAccountIds: selectedLinkAccount,
      };

      await APIS.LinkOrganization(statusPayload).then((res) => {
        setLoadingSaveLinkAccounts(false);
        setlinkAccountopen(false);
        if (res.status === 200) {
          toast.success(
            t("common:warnings.Organization Links have been saved Successfully")
          );
        } else {
          toast.error(t("common:common.Something went wrong"));
        }
      });
    } catch (err) {
      setLoadingSaveLinkAccounts(false);
      toast.error(t("common:common.Something went wrong"));
    }
  };

  const parseOrganisation = (accounts) => {
    return accounts;
  };

  useEffect(() => {
    setPagedata();
    return () => { };
  }, [pageData]);

  const handleAddAccount = () => {
    navigate("/dashboard/organizations/add");
  };

  const setPagedata = () => {
    if (localStorage.getItem("orgPageData") === null) {
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
      setTypeFilter(pageData.typeFilter);
      setStatusFilter(pageData.statusFilter);
    } else {
      let localPageData = JSON.parse(localStorage.getItem("orgPageData"));
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
      setTypeFilter(localPageData.typeFilter);
      setStatusFilter(localPageData.statusFilter);
      if (localPageData.typeFilter || localPageData.statusFilter) {
        setOpen(true);
      }
    }
  };

  const showAllAccounts = (rowCount = 10) => {
    getOrganisationlist({
      globalSearchQuery: query.length > 2 ? query : "",
      pageNumber: "1",
      rowCount: rowCount,
      accountStatus: statusFilter || 'active',
      fsStatus:
        isFSEnabled === null
          ? "enabled"
          : isFSEnabled
            ? "enabled"
            : "disabled",
      HTStatus:
        isHTEnabled === null
          ? null
          : isHTEnabled
            ? "enabled"
            : "disabled",
      MPAccountTypeId: HTAccountTypes || [],
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      MPCountryId: selectedCountry,
    });
  };

  const handlePageChange = (event, value) => {
    getOrganisationlist({
      pageNumber: value,
      accountStatus: statusFilter || 'active',
      globalSearchQuery: query.length > 2 ? query : "",
      rowCount: rowCount,
      fsStatus:
        isFSEnabled === null
          ? "enabled"
          : isFSEnabled
            ? "enabled"
            : "disabled",
      HTStatus:
        isHTEnabled === null
          ? null
          : isHTEnabled
            ? "enabled"
            : "disabled",
      MPAccountTypeId: HTAccountTypes || [],
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      MPCountryId: selectedCountry,
    });
    setPage(value);
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
    if (event.target.value === "") {
      getOrganisationlist({
        globalSearchQuery: "",
        pageNumber: "1",
        rowCount: rowCount,
        fsStatus:
          isFSEnabled === null
            ? "enabled"
            : isFSEnabled
              ? "enabled"
              : "disabled",
        HTStatus:
          isHTEnabled === null
            ? null
            : isHTEnabled
              ? "enabled"
              : "disabled",
        MPAccountTypeId: HTAccountTypes,
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
        accountStatus: statusFilter,
        MPCountryId: selectedCountry,
      });
    } else {
      if (event.target?.value?.trim()?.length > 2 || flag)
        if (open) {
          let payload = {
            globalSearchQuery: event.target.value,
            accountStatus: statusFilter,
            pageNumber: "1",
            rowCount: rowCount,
            fsStatus:
              isFSEnabled === null
                ? "enabled"
                : isFSEnabled
                  ? "enabled"
                  : "disabled",
            HTStatus:
              isHTEnabled === null
                ? null
                : isHTEnabled
                  ? "enabled"
                  : "disabled",
            MPAccountTypeId: HTAccountTypes,
             MPCountryId: selectedCountry,
            orderByField: [
              [`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`],
            ],
          };
          getOrganisationlist(payload);
        } else {
          getOrganisationlist({
            globalSearchQuery: event.target.value,
            pageNumber: "1",
            accountStatus: statusFilter,
            rowCount: rowCount,
            fsStatus:
              isFSEnabled === null
                ? "enabled"
                : isFSEnabled
                  ? "enabled"
                  : "disabled",
            HTStatus:
              isHTEnabled === null
                ? null
                : isHTEnabled
                  ? "enabled"
                  : "disabled",
            MPAccountTypeId: HTAccountTypes,
             MPCountryId: selectedCountry,
            orderByField: [
              [`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`],
            ],
          });
        }
    }
    setQuery(event.target.value);
    setPage(1);
  };

  const handleFSAccountTypeFilter = (value, isManualFilterClear = false) => {
    if (isFSEnabled === value) {
      let payload = {
        globalSearchQuery: query.length > 2 ? query : "",
        pageNumber: "1",
        rowCount: rowCount,
        accountStatus: statusFilter,
        fsStatus: "enabled",
        HTStatus: "enabled",
        MPAccountTypeId: [],
        MPCountryId: selectedCountry,
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      };
      setIsFSEnabled(null);
    } else {
      let payload = {
        globalSearchQuery: query.length > 2 ? query : "",
        pageNumber: "1",
        rowCount: rowCount,
        accountStatus: statusFilter,
        fsStatus: value === true ? "enabled" : "disabled",
        HTStatus: "enabled",
        MPAccountTypeId: [],
        MPCountryId: selectedCountry,
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      };
      setIsFSEnabled(value);
    }
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const handleHTAccountTypes = (typeId, isManualFilterClear = false) => {
    if (typeId === true || typeId === false) {
      let payload = {
        globalSearchQuery: query.length > 2 ? query : "",
        pageNumber: "1",
        rowCount: rowCount,
        accountStatus: statusFilter,
        fsStatus: "enabled",
        HTStatus: typeId == true ? "enabled" : "disabled",
        MPAccountTypeId: [],
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      };
      setHTAccountTypes([]);
      setHTEnabled(typeId);
    } else {
      const updatedAccountTypes = [...HTAccountTypes];
      const index = updatedAccountTypes.indexOf(typeId);

      if (index === -1) {
        // Role not selected, add it to the state
        updatedAccountTypes.push(typeId);
      } else {
        // Role already selected, remove it from the state
        updatedAccountTypes.splice(index, 1);
      }

      let payload = {
        globalSearchQuery: query.length > 2 ? query : "",
        pageNumber: "1",
        rowCount: rowCount,
        accountStatus: statusFilter,
        fsStatus: "enabled",
        HTStatus: "enabled",
        MPAccountTypeId: updatedAccountTypes,
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      };
      setHTAccountTypes(updatedAccountTypes);
      setHTEnabled(true);
    }
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const handleCountryFilter = (value, isManualFilterClear = false) => {
    let payload = {
      MPCountryId: value,
      globalSearchQuery: query.length > 2 ? query : "",
      pageNumber: "1",
      rowCount: rowCount,
      fsStatus: "enabled",
      HTStatus: "disabled",
      MPAccountTypeId: HTAccountTypes,
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      accountStatus: statusFilter,
    };

    setSelectedCountry(value);
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const handleAccountStatusFilter = (value, isManualFilterClear = false) => {
    if (accountStatus === value) {
      let payload = {
        globalSearchQuery: query.length > 2 ? query : "",
        pageNumber: "1",
        accountStatus: statusFilter,
        fsStatus: "enabled",
        HTStatus: "enabled",
        MPAccountTypeId: [],
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      };
      setAccountStatus(null);
    } else {
      let payload = {
        globalSearchQuery: query.length > 2 ? query : "",
        pageNumber: "1",
        accountStatus: statusFilter,
        fsStatus: "enabled",
        HTStatus: "enabled",
        MPAccountTypeId: [],
        isActive: value,
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      };
      setAccountStatus(value);
    }
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const handleSingleClickColumn = (value) => {
    let payload = {
      orderByField: [[`${value}`, `${sortOrder === "ASC" ? "DESC" : "ASC"}`]],
      globalSearchQuery: query,
      pageNumber: "1",
      accountStatus: statusFilter,
      rowCount: rowCount,
      fsStatus:
        isFSEnabled === null
          ? "enabled"
          : isFSEnabled
            ? "enabled"
            : "disabled",
      HTStatus:
        isHTEnabled === null
          ? null
          : isHTEnabled
            ? "enabled"
            : "disabled",
      MPAccountTypeId: HTAccountTypes,
      MPCountryId: selectedCountry,
    };
    getOrganisationlist(payload);
    setSort(value);
    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    setPage(1);
  };

  const handleDblClickColumn = () => {
    let payload = {};
    payload = {
      orderByField: [[]],
      globalSearchQuery: query,
      pageNumber: "1",
      accountStatus: statusFilter,
      rowCount: rowCount,
      fsStatus:
        isFSEnabled === null
          ? "enabled"
          : isFSEnabled
            ? "enabled"
            : "disabled",
      HTStatus:
        isHTEnabled === null
          ? null
          : isHTEnabled
            ? "enabled"
            : "disabled",
      MPAccountTypeId: HTAccountTypes,
      MPCountryId: selectedCountry,
    };
    getOrganisationlist(payload);
    setSort("none");
    setSortOrder("ASC");
    setPage(1);
  };

  const handleClickColumn = (e, value) => {
    clickCount++;
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
  };

  const handleTypeFilter = (value) => {
    let payload = {
      accountTypeFilter: value,
      accountStatus: statusFilter,
      pageNumber: "1",
      rowCount: rowCount,
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
    };

    getOrganisationlist(payload);
    setPage(1);
    setTypeFilter(value);
  };

  const handleStatusFilter = (value, isManualFilterClear = false) => {
    let payload = {
      accountStatus: value,
      pageNumber: "1",
      rowCount: rowCount,
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
    };
    getOrganisationlist(payload);
    setPage(1);
    setStatusFilter(value);
    if (isManualFilterClear) {
      setFilterChipCleared(true);
    }
  };

  const loadDefaultList = () => {
    setQuery("");
    getOrganisationlist({
      globalSearchQuery: "",
      accountTypeFilter: "",
      accountStatus: "",
      rowCount: rowCount,
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
    });
  };

  const loadDefaultListOnClose = () => {
    if (open) {
      setQuery("");
      getOrganisationlist({
        globalSearchQuery: "",
        accountTypeFilter: "",
        accountStatus: "",
        rowCount: rowCount,
        orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleConfirmDelete = async () => {
    try {
      const statusPayload = {
        id: selectedOrgToDelete,
        isActive: `true`,
        isDeleted: "true",
      };
      await APIS.ChangeOrganizationStatus(statusPayload).then((res) => {
        if (res.data.Message !== "Organization deleted Successfully") {
          toast.error(res.data.Message);
          setIsOpen(false);
          let payload = {
            globalSearchQuery: query.length > 2 ? query : "",
            pageNumber: page,
            rowCount: rowCount,
            fsStatus:
              isFSEnabled === null
                ? "enabled"
                : isFSEnabled
                  ? "enabled"
                  : "disabled",
            HTStatus:
              isHTEnabled === null
                ? null
                : isHTEnabled
                  ? "enabled"
                  : "disabled",
            MPCountryId: selectedCountry,
            accountStatus:
              accountStatus === null
                ? null
                : accountStatus
                  ? "active"
                  : "deactive",
            MPAccountTypeId: HTAccountTypes,
            orderByField: [
              [`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`],
            ],
          };
          getOrganisationlist(payload);
        } else if (res.data.Message === "Organization deleted Successfully") {
          toast.success(
            t("common:organization.Deleted Organization Successfully")
          );
          setIsOpen(false);
          let payload = {
            globalSearchQuery: query.length > 2 ? query : "",
            pageNumber: page,
            rowCount: rowCount,
            fsStatus:
              isFSEnabled === null
                ? "enabled"
                : isFSEnabled
                  ? "enabled"
                  : "disabled",
            HTStatus:
              isHTEnabled === null
                ? null
                : isHTEnabled
                  ? "enabled"
                  : "disabled",
            MPCountryId: selectedCountry,
            accountStatus:
              accountStatus === null
                ? null
                : accountStatus
                  ? "active"
                  : "deactive",
            MPAccountTypeId: HTAccountTypes,
            orderByField: [
              [`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`],
            ],
          };
          getOrganisationlist(payload);
        } else {
          toast.error(t("common:common.Something went wrong"));
          getOrganisationlist();
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };
  const paginatedOrganizations = parseOrganisation(accounts);

  const menuStates = useMemo(
    () =>
      paginatedOrganizations?.map(() => {
        return {
          anchorEl: null,
        };
      }),
    [paginatedOrganizations]
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

  const handleClickFilter = (event) => {
    setAnchorE2(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setAnchorE2(null);
  };

  const StatusChips = ({ selectedfilterList }) =>
    selectedfilterList?.map((item, index) => (
      <Chip
        color="primary"
        key={index}
        label={`${item.filterName} : ${item.label}`}
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
      handleAccountStatusFilter(null, true);
    } else if (filterName === "FosterShare") {
      handleFSAccountTypeFilter(null, true);
    } else if (filterName === "ThriveScale") {
      if (id === false) {
        setHTEnabled(true);
        setHTAccountTypes([]);
        setFilterChipCleared(true);
      } else {
        handleHTAccountTypes(id, true);
      }
    } else if (filterName === "Country") {
      handleCountryFilter(null, true);
    }
  };

  const handleApplyFilters = () => {
    let payload = {
      globalSearchQuery: query.length > 2 ? query : "",
      pageNumber: "1",
      rowCount: rowCount,
      fsStatus:
        isFSEnabled === null ? null : isFSEnabled ? "enabled" : "disabled",
      HTStatus:
        isHTEnabled === null ? null : !isHTEnabled ? "disabled" : HTAccountTypes.length ? "enabled" : null,
      MPCountryId: selectedCountry,
      accountStatus:
        accountStatus === null ? null : accountStatus ? "active" : "deactive",
      MPAccountTypeId: HTAccountTypes,
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
    };

    getOrganisationlist(payload);

    if (
      statusFilter?.length > 0 ||
      payload?.HTStatus !== "enabled" ||
      payload?.fsStatus !== null ||
      payload?.accountStatus !== null ||
      payload.MPAccountTypeId.length ||
      selectedCountry?.length
    ) {
      setFiltersApplied(true);
      const selectedLabels = [];

      if (payload?.accountStatus !== null) {
        selectedLabels.push({
          label: accountStatus ? "Active" : "Deactivated",
          id: accountStatus,
          filterName: "Status",
        });
      }

      if (payload?.fsStatus) {
        selectedLabels.push({
          label: isFSEnabled ? "Enabled" : "Disabled",
          id: isFSEnabled,
          filterName: "FosterShare",
        });
      }

      if (selectedCountry) {
        selectedLabels.push({
          label: getLocationNames(locationList, selectedCountry, null),
          id: selectedCountry,
          filterName: "Country",
        });
      }
      if (HTAccountTypes) {
        HTAccountTypes.forEach((id) => {
          const option = typeList.find((option) => option.id === id);
          selectedLabels.push({
            label: option.name,
            id: id,
            filterName: "ThriveScale",
          });
        });
      }
      // Add this block to handle ThriveScale Disabled chip
      if (isHTEnabled === false) {
        selectedLabels.push({
          label: "Disabled",
          id: false,
          filterName: "ThriveScale",
        });
      }

      setSelectedFilterLabels(selectedLabels);
      if( !selectedLabels.length ) {
        setFiltersApplied(false);
      }
    } else {
      setFiltersApplied(false);
    }
    setPage(1);
    handleCloseFilter();
  };

  useEffect(() => {
    if (filterChipCleared) {
      handleApplyFilters();
      setFilterChipCleared(false);
    }
  }, [filterChipCleared]);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    showAllAccounts(event.target.value);
  };

  const handleClearFilters = () => {
    let payload = {
      globalSearchQuery: query.length > 2 ? query : "",
      pageNumber: "1",
      rowCount: rowCount,
      fsStatus: "enabled",
      HTStatus: "enabled",
      MPCountryId: null,
      accountStatus: null,
      MPAccountTypeId: [],
      orderByField: [[`${sort}`, `${sortOrder === "DESC" ? "DESC" : "ASC"}`]],
    };
    setIsFSEnabled(null);
    setHTEnabled(true);
    setSelectedCountry(null);
    setAccountStatus(null);
    setHTAccountTypes([]);

    setTypeFilter(typeOptions[0].id);

    setFiltersApplied(false);
    handleCloseFilter();
    getOrganisationlist(payload);
    setPage(1);
  };

  const handleAccountStatusChange = async (payload) => {
  try {
    const res = await APIS.reActivateOrganization(payload);
    toast.success(t("common:warnings.Organization Status Updated Successfully"));
    
    const listPayload = {
      globalSearchQuery: query.length > 2 ? query : "",
      pageNumber: "1",
      rowCount: rowCount,
      fsStatus: null,
      HTStatus: "enabled",
      MPCountryId: null,
      accountStatus: statusFilter,
      MPAccountTypeId: [],
      orderByField: [[sort, sortOrder === "DESC" ? "DESC" : "ASC"]],
    };
    
    await getOrganisationlist(listPayload);
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
    if (updatedPayload.deactivationInfo){
      updatedPayload.deactivationInfo.TWAccountId = payload.id;
      delete updatedPayload.deactivationInfo.MPAccountId;
    }
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
    
    const listPayload = {
      globalSearchQuery: query.length > 2 ? query : "",
      pageNumber: page,
      rowCount: rowCount,
      fsStatus: isFSEnabled === null ? "enabled" : isFSEnabled ? "enabled" : "disabled",
      HTStatus: isHTEnabled === null ? null : isHTEnabled ? "enabled" : "disabled",
      HTCountryId: selectedCountry,
      accountStatus: accountStatus === null ? null : accountStatus ? "active" : "deactive",
      MPAccountTypeId: HTAccountTypes,
      orderByField: [[sort, sortOrder === "DESC" ? "DESC" : "ASC"]],
    };

    await getOrganisationlist(listPayload);
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
      const reason = ref?.current || "";
      const deactivationInfo = reason ? {
        MPAccountId: accountId,
        reason: reason,
        type: "ACCOUNT_DEACTIVATION",
      } : {
        MPAccountId: accountId,
        reason: "",
        type: "ACCOUNT_DEACTIVATION",
      };

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


  return (
    <Card sx={{ borderRadius: 2 }} {...other}>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          pt: 2,
          //m: -1,
          p: 2,
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
          {signedinUserRoleHT === "superadmin" && <IconButton
            color="inherit"
            onClick={(e) => {
              handleClickFilter(e);
              loadDefaultListOnClose();
            }}
          >
            <img
              alt="fiter_accounts"
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
          </IconButton>}
          <Menu
            anchorEl={anchorE2}
            open={Boolean(anchorE2)}
            onClose={handleCloseFilter}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFSEnabled === true}
                        onChange={() => handleFSAccountTypeFilter(true)}
                      />
                    }
                    label={t("common:common.Enabled")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFSEnabled === false}
                        onChange={() => handleFSAccountTypeFilter(false)}
                      />
                    }
                    label={t("common:common.Disabled")}
                  />
                </FormGroup>
              </MenuItem>
            </Box>
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
                  {typeList.map((type) => (
                    <FormControlLabel
                      key={type.id}
                      control={
                        <Checkbox
                          checked={HTAccountTypes.includes(type.id)}
                          onChange={() => handleHTAccountTypes(type.id)}
                        />
                      }
                      label={t(`common:common.${type.name}`)}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!isHTEnabled}
                        onChange={() => handleHTAccountTypes(!isHTEnabled)}
                      />
                    }
                    label={t("common:common.Disabled")}
                  />
                </FormGroup>
              </MenuItem>
            </Box>
            <Box sx={{ ml: 1 }}>
              <strong>{t("common:common.Country")}</strong>
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
                <TextField
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
                    width: 250,
                    ml: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0px",
                    },
                  }}
                  EnableClearable={true}
                  textFieldProps={{
                    fullWidth: true,
                    borderRadius: "0px",
                    margin: "normal",
                    variant: "outlined",
                    label: "",
                    placeholder: t("common:common.Country"),
                  }}
                />
              </MenuItem>
            </Box>
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={accountStatus === true}
                        onChange={() => handleAccountStatusFilter(true)}
                      />
                    }
                    label={t("common:common.Active")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={accountStatus === false}
                        onChange={() => handleAccountStatusFilter(false)}
                      />
                    }
                    label={t("common:common.Deactivated")}
                  />
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
        {([SUPER_ADMIN].includes(signedinUserRoleHT) ||
          [SUPER_ADMIN].includes(signedinUserRoleFS)) && (
            <Button
              sx={{ mr: 1, borderRadius: "4px" }}
              variant="contained"
              startIcon={<PlusIcon fontSize="small" />}
              onClick={() => handleAddAccount()}
            >
              {t("common:organization.Add Organization")}
            </Button>
          )}
      </Box>
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
          className={accounts?.length ? "scrollListTable" : ""}
          sx={{ minWidth: "auto" }}
        >
          {open && (
            <Box sx={{ ml: 2, mt: 1, mb: 1 }}>
              <Grid container spacing={3}>
                <Grid
                  item
                  md={3} //6
                  xs={6} //12
                  sx={{ mt: -2 }}
                >
                  <TextField
                    sx={{ width: 250, ml: 1 }}
                    name="organization_type"
                    accessKey="name"
                    component={AutoCompleteDropdownToFilter}
                    getValueFunction={(value) => {
                      handleTypeFilter(value);
                    }}
                    label="organization_type"
                    defaultVal={typeOptions[0]}
                    options={typeOptions}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:organization.Organization Type"),
                    }}
                  />
                </Grid>

                <Grid
                  item
                  md={3} //6
                  xs={6} //12
                  sx={{ mt: -2 }}
                >
                  <TextField
                    sx={{ width: 250, ml: 1 }}
                    name="status"
                    accessKey="label"
                    component={AutoCompleteDropdownToFilter}
                    getValueFunction={(value) => {
                      handleStatusFilter(value);
                    }}
                    label="status"
                    defaultVal="All"
                    options={statusOptions}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Status"),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
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
                  {t("common:common.Clear Filters")}
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
          {accounts && accounts?.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  {columnHeaders.map((option) =>
                    option.value ? (
                      <TableCell
                        onClick={(e) => handleClickColumn(e, option.value)}
                      >
                        <TableSortLabel
                          active={sort === option.value}
                          direction={sortOrder === "ASC" ? "asc" : "desc"}
                          sx={{ fontWeight: "600" }}
                        >
                          {t(`common:common.${option.label}`)}
                        </TableSortLabel>
                      </TableCell>
                    ) : (
                      <TableCell
                        align={option.label === "Actions" ? "center" : ""}
                        sx={option.style || { fontWeight: "600" }}
                      >
                        {option.label === "Actions" ?"": t(`common:common.${option.label}`)}
                        {/* Todo - translation */}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrganizations.map((account, index) => {
                  const isOrganizationSelected = selectedOrganizations.includes(
                    account.id
                  );

                  return (
                    <TableRow
                      hover
                      key={account.id}
                      selected={isOrganizationSelected}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            alignItems: "center",
                            display: "flex",
                          }}
                        >
                          <Box sx={{ ml: 1 }}>
                            <Link
                              color="inherit"
                              component={RouterLink}
                              to={`/dashboard/organizations/${account.id}/view`}
                              variant="subtitle2"
                              style={{
                                color: "#F37123",
                                textDecoration: "none",
                                cursor: "pointer",
                              }}
                            >
                              {account.accountName}
                            </Link>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{account.accountCode}</TableCell>
                      <TableCell>
                        {["BOTH", "FOSTER_SHARE"].includes(account.accessType)
                          ? t("common:common.Enabled")
                          : t("common:common.Disabled")}
                      </TableCell>
                      <TableCell>
                        {["BOTH", "THRIVE_SCALE"].includes(account.accessType)
                          ? t("common:common.Enabled")
                          : t("common:common.Disabled")}
                      </TableCell>
                      <TableCell>{account.countryName}</TableCell>
                      <TableCell>
                        <Chip
                          color="primary"
                          label={
                            account && account.isActive
                              ? `${t("common:common.Active")}`
                              : `${t("common:common.Deactivated")}`
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              account && account.isActive
                                ? "#357323"
                                : "#C6C4BE",
                            borderRadius: "2px",
                          }}
                        />
                      </TableCell>
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
                            to={`/dashboard/organizations/${account.id}/view`}
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
                          {([SUPER_ADMIN].includes(signedinUserRoleHT) ||
                            (account.id === loggedInUserOrgId &&
                              ([ADMIN, ADMIN_CASEMANAGER].includes(
                                signedinUserRoleFS
                              ) ||
                                [ADMIN, ADMIN_CASEWORKER].includes(
                                  signedinUserRoleHT
                                )))) && (
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
                                  style={{
                                    alignSelf: "center",
                                    marginRight: "10px",
                                  }}
                                />
                                {t("common:common.Edit")}
                              </MenuItem>
                            )}
                          {([SUPER_ADMIN, ADMIN_CASEWORKER, ADMIN].includes(
                            signedinUserRoleHT
                          ) ||
                            [SUPER_ADMIN, ADMIN, ADMIN_CASEMANAGER].includes(
                              signedinUserRoleFS
                            )) &&
                            account.isActive && (
                              <MenuItem
                                onClick={() =>
                                  navigate(`/dashboard/team/add`, {
                                    state: {
                                      fromOrg: account?.id,
                                    },
                                  })
                                }
                                style={{ color: "#F37123" }}
                              >
                                <img
                                  alt="add_user"
                                  src="/static/icons/addUserIcon.svg"
                                  width={20}
                                  height={16}
                                  style={{
                                    alignSelf: "center",
                                    marginRight: "8px",
                                  }}
                                />
                                {t("common:common.Add Team Member")}
                              </MenuItem>
                            )}
                          {([SUPER_ADMIN].includes(signedinUserRoleHT) ||
                            [SUPER_ADMIN].includes(signedinUserRoleFS)) && (
                              <MenuItem
                                onClick={() => {
                                  handleMenuClose(index)();
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
                                      cancelButtonText:t("common:common.Cancel"),
                                      minWidth: 560,
                                      onClick: () => {
                                        handleDeactivateOrReactivate(
                                          account,
                                          ref
                                        );
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
                                  style={{
                                    alignSelf: "center",
                                    marginRight: "8px",
                                  }}
                                />
                                {account && account.isActive
                                  ? t("common:common.Deactivate Account")
                                  : t("common:common.Reactivate Account")}
                              </MenuItem>
                            )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {accounts && accounts?.length === 0 && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    {!loading && (
                      <Typography>{t("common:common.No match")}</Typography>
                    )}
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
      <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
        <DialogTitle id="simple-dialog-title">
          {t("common:question.Are you sure")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("common:organization.confirmdelete")}
            <br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDelete} color="primary">
            {t("common:common.Yes")}
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            {t("common:common.No")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
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
          {t("common:common.Link Organization")}
          <Typography variant="body1">
            {t("common:common.Short Description")}
          </Typography>
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
              {t("common:common.Loading")}
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
            }}
          >
            <Button
              variant="outlined"
              disabled={loadingSaveLinkAccounts}
              onClick={handleCloseLinkAccountPopUp}
              style={{ flex: 1, borderRadius: "4px", marginRight: "5px" }}
            >
              {t("common:common.Cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveLinkAccount}
              disabled={loadingSaveLinkAccounts}
              color="primary"
              style={{ flex: 1, borderRadius: "4px", marginLeft: "2px" }}
            >
              {t("common:common.Save Changes")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

OrganizationListTable.propTypes = {
  accounts: PropTypes.array.isRequired,
};

export default OrganizationListTable;
