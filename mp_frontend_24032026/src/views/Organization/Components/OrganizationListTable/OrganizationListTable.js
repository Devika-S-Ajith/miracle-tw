import { useState, useEffect, useRef, useContext, useCallback } from "react";
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
  MenuItem,
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
import { ADMIN, ADMIN_CASEWORKER, SUPER_ADMIN } from "../../../../helpers/constant";

const columnHeaders = [
  { label: "Organization Name", value: "accountName" },
  { label: "Organization ID", value: "" },
  { label: "FosterShare", value: "" },
  { label: "ThriveScale", value: "" },
  { label: "Country", value: "MPCountryId" },
  { label: "Status", value: "isActive" },
  { label: "Actions", value: "", styleValue: { pl: 6, fontWeight: "600" } },
];

// ---------------------------------------------------------------------------
// Helpers — convert nullable booleans to API string values
// ---------------------------------------------------------------------------
const toFsStatus  = (val) => (val === null ? "enabled" : val ? "enabled" : "disabled");
const toHtStatus  = (val) => (val === null ? null      : val ? "enabled" : "disabled");
const toAccStatus = (val) => (val === null ? null      : val ? "active"  : "deactive");

// ---------------------------------------------------------------------------

const OrganizationListTable = (props) => {
  const { t } = useTranslation(["common"]);

  const sortOptions = [
    { label: t("common:common.None"),         id: "none" },
    { label: t("common:common.Location"),     id: "HTDistrictId" },
    { label: t("common:common.Name"),         id: "accountName" },
    { label: t("common:common.Phone Number"), id: "phoneNumber" },
    { label: t("common:common.Status"),       id: "isActive" },
    { label: t("common:common.Type"),         id: "HTOrganizationTypeId" },
  ];

  const statusOptions = [
    { label: t("common:common.All"),      id: "All" },
    { label: t("common:common.Active"),   id: "Active" },
    { label: t("common:common.Inactive"), id: "Inactive" },
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

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [rowCount, setRowCount] = useState(10);

  // ── Per-row menu anchors ───────────────────────────────────────────────
  const [menuAnchors, setMenuAnchors] = useState({});

  // ── Filter panel anchor ───────────────────────────────────────────────
  const [anchorE2, setAnchorE2] = useState(null);

  // ── Filter values ─────────────────────────────────────────────────────
  const typeOptions = [{ id: "0", name: "All" }, ...typeList];
  const [typeFilter, setTypeFilter]     = useState(typeOptions[0].id);
  const [statusFilter, setStatusFilter] = useState(statusOptions[1].id);
  const [isFSEnabled, setIsFSEnabled]   = useState(null);
  const [isHTEnabled, setHTEnabled]     = useState(true);
  const [HTAccountTypes, setHTAccountTypes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [accountStatus, setAccountStatus]     = useState(null);

  // ── Applied chip labels ───────────────────────────────────────────────
  const [filtersApplied, setFiltersApplied]           = useState(false);
  const [selectedFilterLabels, setSelectedFilterLabels] = useState([]);

  // ── Dialogs ───────────────────────────────────────────────────────────
  const [isOpen, setIsOpen]                       = useState(false);
  const [selectedOrgToDelete, setSelectedOrgToDelete] = useState(null);


  const navigate = useNavigate();
  const ref = useRef();
  const loggedInUserOrgId = localStorage.getItem("orgId");

  // Click-count refs for single/double-click column sort
  const clickCountRef      = useRef(0);
  const singleClickTimerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Keep a ref of every filter value so buildPayload always reads
  // the CURRENT value, not a stale closure capture.
  // ---------------------------------------------------------------------------
  const filtersRef = useRef({});
  useEffect(() => {
    filtersRef.current = {
      query, page, rowCount, isFSEnabled, isHTEnabled,
      HTAccountTypes, selectedCountry, accountStatus, sort, sortOrder,
    };
  });

  // ---------------------------------------------------------------------------
  // buildPayload — reads from filtersRef so it's always fresh,
  // then merges any call-site overrides on top.
  // ---------------------------------------------------------------------------
  const buildPayload = useCallback((overrides = {}) => {
    const f = filtersRef.current;
    return {
      globalSearchQuery: f.query.length > 2 ? f.query : "",
      pageNumber:        f.page,
      rowCount:          f.rowCount,
      fsStatus:          toFsStatus(f.isFSEnabled),
      HTStatus:          toHtStatus(f.isHTEnabled),
      MPAccountTypeId:   f.HTAccountTypes,
      MPCountryId:       f.selectedCountry,
      accountStatus:     toAccStatus(f.accountStatus),
      orderByField:      [[`${f.sort}`, f.sortOrder === "DESC" ? "DESC" : "ASC"]],
      ...overrides,
    };
  }, []); // stable — never needs to be recreated

  // ---------------------------------------------------------------------------
  // Initialise from pageData / localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (localStorage.getItem("orgPageData") === null) {
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
      setTypeFilter(pageData.typeFilter);
      setStatusFilter(pageData.statusFilter);
    } else {
      const local = JSON.parse(localStorage.getItem("orgPageData"));
      setPage(local.page);
      setQuery(local.query);
      setSort(local.sort);
      setTypeFilter(local.typeFilter);
      setStatusFilter(local.statusFilter);
      if (local.typeFilter || local.statusFilter) setOpen(true);
    }
  }, [pageData]);

  // ── Menu ──────────────────────────────────────────────────────────────
  const handleMenuClick  = (index) => (event) =>
    setMenuAnchors((prev) => ({ ...prev, [index]: event.currentTarget }));
  const handleMenuClose  = (index) => () =>
    setMenuAnchors((prev) => ({ ...prev, [index]: null }));

  // ── Filter panel ──────────────────────────────────────────────────────
  const handleClickFilter = (event) => setAnchorE2(event.currentTarget);
  const handleCloseFilter = () => setAnchorE2(null);

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  const debouncedHandleSearch = useDebouncedCallback((event) => {
    handleQueryChange(event);
  }, 800);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const v = e.target.value.trim();
      if (v.length === 1 || v.length === 2) handleQueryChange(e, true);
    }
  };

  const handleQueryChange = (event, force = false) => {
    const val = event.target.value;
    setQuery(val);
    setPage(1);
    if (val === "" || val.trim().length > 2 || force) {
      // Pass overrides explicitly — state hasn't flushed yet
      getOrganisationlist(buildPayload({ globalSearchQuery: val, pageNumber: 1 }));
    }
  };

  // ---------------------------------------------------------------------------
  // Pagination — pass pageNumber as override; don't rely on state flush
  // ---------------------------------------------------------------------------
  const handlePageChange = (_event, value) => {
    setPage(value);
    getOrganisationlist(buildPayload({ pageNumber: value }));
  };

  // ---------------------------------------------------------------------------
  // Row-count
  // ---------------------------------------------------------------------------
  const handleRowCountChange = (event) => {
    const newRowCount = event.target.value;
    setRowCount(newRowCount);
    setPage(1);
    getOrganisationlist(buildPayload({ rowCount: newRowCount, pageNumber: 1 }));
  };

  // ---------------------------------------------------------------------------
  // Column sort
  // ---------------------------------------------------------------------------
  const handleSingleClickColumn = (value) => {
    const newOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    setSort(value);
    setSortOrder(newOrder);
    setPage(1);
    getOrganisationlist(buildPayload({
      orderByField: [[`${value}`, newOrder]],
      pageNumber: 1,
    }));
  };

  const handleDblClickColumn = () => {
    setSort("none");
    setSortOrder("ASC");
    setPage(1);
    getOrganisationlist(buildPayload({ orderByField: [[]], pageNumber: 1 }));
  };

  const handleClickColumn = (e, value) => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 1) {
      singleClickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        handleSingleClickColumn(value);
      }, 300);
    } else if (clickCountRef.current === 2) {
      clearTimeout(singleClickTimerRef.current);
      clickCountRef.current = 0;
      handleDblClickColumn();
    }
  };

  // ---------------------------------------------------------------------------
  // Legacy type/status filter bar
  // ---------------------------------------------------------------------------
  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    setPage(1);
    getOrganisationlist(buildPayload({ accountTypeFilter: value, pageNumber: 1 }));
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
    getOrganisationlist(buildPayload({ accountStatus: value, pageNumber: 1 }));
  };

  // ---------------------------------------------------------------------------
  // Advanced filter panel — only update local state; Apply fires the API
  // ---------------------------------------------------------------------------
  const handleFSAccountTypeFilter = (value) =>
    setIsFSEnabled((prev) => (prev === value ? null : value));

  const handleHTAccountTypes = (typeId) => {
    if (typeId === true || typeId === false) {
      setHTEnabled(typeId);
      setHTAccountTypes([]);
    } else {
      setHTAccountTypes((prev) => {
        const idx = prev.indexOf(typeId);
        return idx === -1 ? [...prev, typeId] : prev.filter((_, i) => i !== idx);
      });
      setHTEnabled(true);
    }
  };

  const handleCountryFilter   = (value) => setSelectedCountry(value);
  const handleAccountStatusFilter = (value) =>
    setAccountStatus((prev) => (prev === value ? null : value));

  // ---------------------------------------------------------------------------
  // Build chip label list from explicit values (avoids async-state lag)
  // ---------------------------------------------------------------------------
  const buildFilterLabels = ({ fsEnabled, htEnabled, htTypes, country, accStatus }) => {
    const labels = [];
    if (accStatus !== null)
      labels.push({ label: accStatus ? "Active" : "Deactivated", id: accStatus, filterName: "Status" });
    if (fsEnabled !== null)
      labels.push({ label: fsEnabled ? "Enabled" : "Disabled", id: fsEnabled, filterName: "FosterShare" });
    if (country)
      labels.push({ label: getLocationNames(locationList, country, null), id: country, filterName: "Country" });
    if (htEnabled === false)
      labels.push({ label: "Disabled", id: false, filterName: "ThriveScale" });
    htTypes.forEach((id) => {
      const option = typeList.find((o) => o.id === id);
      if (option) labels.push({ label: option.name, id, filterName: "ThriveScale" });
    });
    return labels;
  };

  // ---------------------------------------------------------------------------
  // Apply filters — accepts explicit values to avoid async-state lag
  // ---------------------------------------------------------------------------
  const handleApplyFilters = useCallback(({
    fsEnabled  = isFSEnabled,
    htEnabled  = isHTEnabled,
    htTypes    = HTAccountTypes,
    country    = selectedCountry,
    accStatus  = accountStatus,
  } = {}) => {
    const payload = {
      globalSearchQuery: filtersRef.current.query.length > 2 ? filtersRef.current.query : "",
      pageNumber:   1,
      rowCount:     filtersRef.current.rowCount,
      fsStatus:     toFsStatus(fsEnabled),
      HTStatus:     toHtStatus(htEnabled),
      MPCountryId:  country,
      accountStatus: toAccStatus(accStatus),
      MPAccountTypeId: htTypes,
      orderByField: [[`${filtersRef.current.sort}`, filtersRef.current.sortOrder === "DESC" ? "DESC" : "ASC"]],
    };

    getOrganisationlist(payload);

    const labels = buildFilterLabels({ fsEnabled, htEnabled, htTypes, country, accStatus });
    setSelectedFilterLabels(labels);
    setFiltersApplied(labels.length > 0);
    setPage(1);
    handleCloseFilter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFSEnabled, isHTEnabled, HTAccountTypes, selectedCountry, accountStatus]);

  // ---------------------------------------------------------------------------
  // Remove chip — compute new values synchronously, pass to handleApplyFilters
  // ---------------------------------------------------------------------------
  const handleRemoveFilter = (id, filterName) => {
    let newFS      = isFSEnabled;
    let newHT      = isHTEnabled;
    let newTypes   = HTAccountTypes;
    let newCountry = selectedCountry;
    let newStatus  = accountStatus;

    if (filterName === "Status") {
      newStatus = null; setAccountStatus(null);
    } else if (filterName === "FosterShare") {
      newFS = null; setIsFSEnabled(null);
    } else if (filterName === "ThriveScale") {
      if (id === false) {
        newHT = true; newTypes = [];
        setHTEnabled(true); setHTAccountTypes([]);
      } else {
        newTypes = HTAccountTypes.filter((t) => t !== id);
        setHTAccountTypes(newTypes);
      }
    } else if (filterName === "Country") {
      newCountry = null; setSelectedCountry(null);
    }

    handleApplyFilters({ fsEnabled: newFS, htEnabled: newHT, htTypes: newTypes, country: newCountry, accStatus: newStatus });
  };

  // ---------------------------------------------------------------------------
  // Clear all filters
  // ---------------------------------------------------------------------------
  const handleClearFilters = () => {
    setIsFSEnabled(null);
    setHTEnabled(true);
    setSelectedCountry(null);
    setAccountStatus(null);
    setHTAccountTypes([]);
    setTypeFilter(typeOptions[0].id);
    setFiltersApplied(false);
    setSelectedFilterLabels([]);
    setPage(1);
    handleCloseFilter();
    getOrganisationlist(buildPayload({
      fsStatus: "enabled", HTStatus: "enabled",
      MPCountryId: null, accountStatus: null,
      MPAccountTypeId: [], pageNumber: 1,
    }));
  };

  // ---------------------------------------------------------------------------
  // Search clear
  // ---------------------------------------------------------------------------
  const loadDefaultList = () => {
    setQuery("");
    getOrganisationlist(buildPayload({ globalSearchQuery: "", pageNumber: 1 }));
  };

  // ---------------------------------------------------------------------------
  // Delete dialog
  // ---------------------------------------------------------------------------
  const handleClose = () => setIsOpen(false);

  const handleConfirmDelete = async () => {
    try {
      const res = await APIS.ChangeOrganizationStatus({
        id: selectedOrgToDelete, isActive: "true", isDeleted: "true",
      });
      if (res.data.Message !== "Organization deleted Successfully") {
        toast.error(res.data.Message);
      } else {
        toast.success(t("common:organization.Deleted Organization Successfully"));
      }
    } catch {
      toast.error(t("common:common.Something went wrong"));
    } finally {
      setIsOpen(false);
      getOrganisationlist(buildPayload());
    }
  };

  // ---------------------------------------------------------------------------
  // Deactivate / Reactivate
  // ---------------------------------------------------------------------------
  const handleAccountStatusChange = async (payload) => {
    try {
      await APIS.reActivateOrganization(payload);
      toast.success(t("common:warnings.Organization Status Updated Successfully"));
      getOrganisationlist(buildPayload({ pageNumber: 1 }));
      return true;
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
      return false;
    }
  };

  const handleUserStatusChangeByAccount = async (payload, changeStatusTo) => {
    let updated = { ...payload, changeStatusTo };
    if (changeStatusTo === "DEACTIVATE" && updated.deactivationInfo) {
      updated.deactivationInfo.TWAccountId = payload.id;
      delete updated.deactivationInfo.MPAccountId;
    }
    try {
      const res = await APIS.ChangeUserStatusByOrg(updated);
      if (res?.status === 200) return true;
      toast.error(t("common:common.Something went wrong"));
      return false;
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
      return false;
    }
  };

  const handleAccountDelete = async (payload) => {
    try {
      await APIS.deactivateOrganization(payload);
      toast.success(t("common:common.Organization deactivated successfully"));
      getOrganisationlist(buildPayload());
      return true;
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
      return false;
    }
  };

  const handleDeactivateOrReactivate = async (account, reasonRef) => {
    const accountId = account?.id;
    if (!accountId) { toast.error(t("common:common.Invalid account")); return false; }
    try {
      if (account.isActive) {
        const deactivationInfo = { MPAccountId: accountId, reason: reasonRef?.current || "", type: "ACCOUNT_DEACTIVATION" };
        const payload = { id: accountId, deactivationInfo };
        const userDone = await handleUserStatusChangeByAccount(payload, "DEACTIVATE");
        if (userDone) { payload.deactivationInfo.MPAccountId = accountId; return handleAccountDelete(payload); }
        return false;
      } else {
        const payload = { id: accountId };
        const userDone = await handleUserStatusChangeByAccount(payload, "ACTIVATE");
        if (userDone) return handleAccountStatusChange(payload);
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
      return false;
    }
  };

  // ---------------------------------------------------------------------------
  // Chips
  // ---------------------------------------------------------------------------
  const StatusChips = ({ selectedfilterList }) =>
    selectedfilterList?.map((item, index) => (
      <Chip
        color="primary" key={index}
        label={`${item.filterName} : ${item.label}`}
        size="medium"
        sx={{ backgroundColor: "#1D334B", borderRadius: "16px", mb: 1, mr: 1 }}
        onDelete={() => handleRemoveFilter(item.id, item.filterName)}
        deleteIcon={<CloseIcon />}
      />
    ));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Card sx={{ borderRadius: 2 }} {...other}>
      {/* ── Toolbar ── */}
      <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", p: 2 }}>
        {/* Search */}
        <Box sx={{ m: 1, maxWidth: "100%", width: 350 }}>
          <TextField
            fullWidth
            InputProps={{
              sx: { borderRadius: "4px" },
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
              endAdornment: query.length > 0 && (
                <IconButton color="inherit" onClick={loadDefaultList}><ClearIcon /></IconButton>
              ),
            }}
            onChange={(e) => { setQuery(e.target.value); debouncedHandleSearch(e); }}
            onKeyDown={handleKeyPress}
            placeholder={t("common:common.Search")}
            value={query}
            variant="outlined"
          />
        </Box>

        {/* Filter icon */}
        <Box sx={{ mr: 4, width: 20 }}>
          {signedinUserRoleHT === "superadmin" && (
            <IconButton color="inherit" onClick={handleClickFilter}>
              <img alt="filter_accounts" src="/static/icons/filterIcon.svg" width={20} height={17} style={{ alignSelf: "center" }} />
              {filtersApplied && (
                <div style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1D334B" }} />
              )}
            </IconButton>
          )}

          <Menu anchorEl={anchorE2} open={Boolean(anchorE2)} onClose={handleCloseFilter}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}>
            <MenuItem disableRipple sx={{ cursor: "default", "&:hover": { backgroundColor: "inherit" } }}>
              <strong>{t("common:common.Filters")}</strong>
            </MenuItem>
            <Divider />

            <Box sx={{ ml: 1 }}><strong>{t("common:common.FosterShare")}</strong></Box>
            <MenuItem disableRipple sx={{ cursor: "default", "&:hover": { backgroundColor: "inherit" } }}>
              <FormGroup>
                <FormControlLabel control={<Checkbox checked={isFSEnabled === true}  onChange={() => handleFSAccountTypeFilter(true)}  />} label={t("common:common.Enabled")} />
                <FormControlLabel control={<Checkbox checked={isFSEnabled === false} onChange={() => handleFSAccountTypeFilter(false)} />} label={t("common:common.Disabled")} />
              </FormGroup>
            </MenuItem>

            <Box sx={{ ml: 1 }}><strong>{t("common:common.ThriveScale")}</strong></Box>
            <MenuItem disableRipple sx={{ cursor: "default", "&:hover": { backgroundColor: "inherit" } }}>
              <FormGroup>
                {typeList.map((type) => (
                  <FormControlLabel key={type.id}
                    control={<Checkbox checked={HTAccountTypes.includes(type.id)} onChange={() => handleHTAccountTypes(type.id)} />}
                    label={t(`common:common.${type.name}`)}
                  />
                ))}
                <FormControlLabel
                  control={<Checkbox checked={isHTEnabled === false} onChange={() => handleHTAccountTypes(!isHTEnabled)} />}
                  label={t("common:common.Disabled")}
                />
              </FormGroup>
            </MenuItem>

            <Box sx={{ ml: 1 }}><strong>{t("common:common.Country")}</strong></Box>
            <MenuItem disableRipple sx={{ cursor: "default", "&:hover": { backgroundColor: "inherit" } }}>
              <TextField
                name="country" accessKey="countryName"
                component={AutoCompleteDropdownToFilter}
                getValueFunction={handleCountryFilter}
                label="" placeholder={t("common:common.Select a country")}
                defaultVal={selectedCountry}
                options={locationList.filter((locItem) =>
                  localStorage.getItem("userRegion") === "1" ? locItem.id === "1" : locItem.id !== "1"
                )}
                sx={{ width: 250, ml: 1, "& .MuiOutlinedInput-root": { borderRadius: "0px" } }}
                EnableClearable
                textFieldProps={{ fullWidth: true, borderRadius: "0px", margin: "normal", variant: "outlined", label: "", placeholder: t("common:common.Country") }}
              />
            </MenuItem>

            <Box sx={{ ml: 1 }}><strong>{t("common:common.Status")}</strong></Box>
            <MenuItem disableRipple sx={{ cursor: "default", "&:hover": { backgroundColor: "inherit" } }}>
              <FormGroup>
                <FormControlLabel control={<Checkbox checked={accountStatus === true}  onChange={() => handleAccountStatusFilter(true)}  />} label={t("common:common.Active")} />
                <FormControlLabel control={<Checkbox checked={accountStatus === false} onChange={() => handleAccountStatusFilter(false)} />} label={t("common:common.Deactivated")} />
              </FormGroup>
            </MenuItem>

            <AppBar position="sticky" color="default" sx={{ top: "auto", bottom: 0 }}>
              <Toolbar sx={{ justifyContent: "space-between", paddingRight: 2 }}>
                <Button variant="outlined"   onClick={handleClearFilters}>{t("common:common.Clear")}</Button>
                <Button variant="contained"  onClick={() => handleApplyFilters()}>{t("common:common.Apply")}</Button>
              </Toolbar>
            </AppBar>
          </Menu>
        </Box>

        {([SUPER_ADMIN].includes(signedinUserRoleHT) || [SUPER_ADMIN].includes(signedinUserRoleFS)) && (
          <Button sx={{ mr: 1, borderRadius: "4px" }} variant="contained" startIcon={<PlusIcon fontSize="small" />}
            onClick={() => navigate("/dashboard/organizations/add")}>
            {t("common:organization.Add Organization")}
          </Button>
        )}
      </Box>

      {loading && (
        <CircularProgress sx={{ zIndex: 1000, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} color="primary" />
      )}

      <Box className={accounts?.length ? "scrollListTable" : ""} sx={{ minWidth: "auto" }}>
        {/* Legacy filter bar */}
        {open && (
          <Box sx={{ ml: 2, mt: 1, mb: 1 }}>
            <Grid container spacing={3}>
              <Grid item md={3} xs={6} sx={{ mt: -2 }}>
                <TextField sx={{ width: 250, ml: 1 }} name="organization_type" accessKey="name"
                  component={AutoCompleteDropdownToFilter} getValueFunction={handleTypeFilter}
                  label="organization_type" defaultVal={typeOptions[0]} options={typeOptions}
                  textFieldProps={{ fullWidth: true, margin: "normal", variant: "outlined", label: t("common:organization.Organization Type") }}
                />
              </Grid>
              <Grid item md={3} xs={6} sx={{ mt: -2 }}>
                <TextField sx={{ width: 250, ml: 1 }} name="status" accessKey="label"
                  component={AutoCompleteDropdownToFilter} getValueFunction={handleStatusFilter}
                  label="status" defaultVal="All" options={statusOptions}
                  textFieldProps={{ fullWidth: true, margin: "normal", variant: "outlined", label: t("common:common.Status") }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Filter chips */}
        <Box sx={{ ml: 2, mb: 2 }}>
          {filtersApplied && (
            <>
              <StatusChips selectedfilterList={selectedFilterLabels} />
              <span onClick={handleClearFilters} style={{ color: "#F37123", cursor: "pointer", marginLeft: "4px" }}>
                {t("common:common.Clear Filters")}
              </span>
            </>
          )}
        </Box>

        <div style={{ width: "100%", height: "100%", border: "1px #C6C4BE solid" }} />

        {accounts?.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                {columnHeaders.map((option, i) =>
                  option.value ? (
                    <TableCell key={i} onClick={(e) => handleClickColumn(e, option.value)}>
                      <TableSortLabel active={sort === option.value} direction={sortOrder === "ASC" ? "asc" : "desc"} sx={{ fontWeight: "600" }}>
                        {t(`common:common.${option.label}`)}
                      </TableSortLabel>
                    </TableCell>
                  ) : (
                    <TableCell key={i} align={option.label === "Actions" ? "center" : ""} sx={option.style || { fontWeight: "600" }}>
                      {option.label === "Actions" ? "" : t(`common:common.${option.label}`)}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account, index) => (
                <TableRow hover key={account.id} selected={selectedOrganizations.includes(account.id)}>
                  <TableCell>
                    <Box sx={{ alignItems: "center", display: "flex" }}>
                      <Box sx={{ ml: 1 }}>
                        <Link color="inherit" component={RouterLink} to={`/dashboard/organizations/${account.id}/view`}
                          variant="subtitle2" style={{ color: "#F37123", textDecoration: "none", cursor: "pointer" }}>
                          {account.accountName}
                        </Link>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{account.accountCode}</TableCell>
                  <TableCell>
                    {["BOTH", "FOSTER_SHARE"].includes(account.accessType) ? t("common:common.Enabled") : t("common:common.Disabled")}
                  </TableCell>
                  <TableCell>
                    {["BOTH", "THRIVE_SCALE"].includes(account.accessType) ? t("common:common.Enabled") : t("common:common.Disabled")}
                  </TableCell>
                  <TableCell>{account.countryName}</TableCell>
                  <TableCell>
                    <Chip color="primary"
                      label={account.isActive ? t("common:common.Active") : t("common:common.Deactivated")}
                      size="small"
                      sx={{ backgroundColor: account.isActive ? "#357323" : "#C6C4BE", borderRadius: "2px" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("common:common.Actions")}>
                      <IconButton onClick={handleMenuClick(index)}><MoreVertIcon /></IconButton>
                    </Tooltip>
                    <Menu anchorEl={menuAnchors[index] ?? null} open={Boolean(menuAnchors[index])}
                      onClose={handleMenuClose(index)} PaperProps={{ style: { borderRadius: "4px" } }}>
                      {/* View */}
                      <MenuItem onClick={handleMenuClose(index)} style={{ color: "#F37123" }}
                        component={RouterLink} to={`/dashboard/organizations/${account.id}/view`}>
                        <img alt="view_account" src="/static/icons/viewIcon.svg" width={20} height={20} style={{ alignSelf: "center", marginRight: "8px" }} />
                        {t("common:common.View details")}
                      </MenuItem>
                      {/* Edit */}
                      {([SUPER_ADMIN].includes(signedinUserRoleHT) ||
                        (account.id === loggedInUserOrgId &&
                          ([ADMIN, ADMIN_CASEWORKER].includes(signedinUserRoleFS) ||
                           [ADMIN, ADMIN_CASEWORKER].includes(signedinUserRoleHT)))) && (
                        <MenuItem onClick={handleMenuClose(index)} style={{ color: "#F37123" }}
                          component={RouterLink} to={`/dashboard/organizations/${account.id}/edit`}>
                          <img alt="edit_account" src="/static/icons/editIcon.svg" width={16} height={16} style={{ alignSelf: "center", marginRight: "10px" }} />
                          {t("common:common.Edit")}
                        </MenuItem>
                      )}
                      {/* Add team member */}
                      {([SUPER_ADMIN, ADMIN_CASEWORKER, ADMIN].includes(signedinUserRoleHT) ||
                        [SUPER_ADMIN, ADMIN, ADMIN_CASEWORKER].includes(signedinUserRoleFS)) &&
                        account.isActive && (
                        <MenuItem onClick={() => { handleMenuClose(index)(); navigate("/dashboard/team/add", { state: { fromOrg: account?.id } }); }}
                          style={{ color: "#F37123" }}>
                          <img alt="add_user" src="/static/icons/addUserIcon.svg" width={20} height={16} style={{ alignSelf: "center", marginRight: "8px" }} />
                          {t("common:common.Add Team Member")}
                        </MenuItem>
                      )}
                      {/* Deactivate / Reactivate */}
                      {([SUPER_ADMIN].includes(signedinUserRoleHT) || [SUPER_ADMIN].includes(signedinUserRoleFS)) && (
                        <MenuItem style={{ color: "#F37123" }}
                          onClick={() => {
                            handleMenuClose(index)();
                            ModalService.open(
                              () => account.isActive
                                ? <DeactivateAccount handleChangeReason={(v) => { ref.current = v; }} />
                                : <></>,
                              {
                                modalTitle:       account.isActive ? t("common:common.Deactivate Account")  : t("common:common.Reactivate Account"),
                                modalDescription: account.isActive ? t("common:common.All users in this account will be deactivated") : t("common:common.All users in this account will be reactivated"),
                                actionButtonText: account.isActive ? t("common:common.Deactivate Account")  : t("common:common.Reactivate Account"),
                                cancelButtonText: t("common:common.Cancel"),
                                minWidth: 560,
                                onClick: () => handleDeactivateOrReactivate(account, ref),
                              }
                            );
                          }}>
                          <img alt="deactivate_account" src="/static/icons/deactivateIcon.svg" width={20} height={20} style={{ alignSelf: "center", marginRight: "8px" }} />
                          {account.isActive ? t("common:common.Deactivate Account") : t("common:common.Reactivate Account")}
                        </MenuItem>
                      )}
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {accounts?.length === 0 && (
          <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
            <Grid container spacing={3}>
              <Grid item md={3} xs={6}>
                {!loading && <Typography>{t("common:common.No match")}</Typography>}
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }} p={1} m={1}>
        <ListPaging rowCount={rowCount} handleRowCountChange={handleRowCountChange} />
        <Box>
          <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" />
        </Box>
      </Box>

      {/* Delete dialog */}
      <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
        <DialogTitle id="simple-dialog-title">{t("common:question.Are you sure")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("common:organization.confirmdelete")}<br /></DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDelete} color="primary">{t("common:common.Yes")}</Button>
          <Button onClick={handleClose} color="primary" autoFocus>{t("common:common.No")}</Button>
        </DialogActions>
      </Dialog>

    </Card>
  );
};

OrganizationListTable.propTypes = { accounts: PropTypes.array.isRequired };

export default OrganizationListTable;