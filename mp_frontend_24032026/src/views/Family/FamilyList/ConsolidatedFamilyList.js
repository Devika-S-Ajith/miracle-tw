import React, { useCallback, useContext, useEffect, useState } from "react";
import ReusableTrendTable from "../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import APIS from "../../../common/hooks/UseApiCalls";
import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  IconButton,
  Menu,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import PageBreadcrumbs from "../../../components/PageBreadcrumbs/PageBreadcrumbs";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import PencilAltIcon from "../../../assets/icons/PencilAlt";
import TrashIcon from "../../../assets/icons/Trash";
import { AssessmentProgressReportIcon } from "../../../assets/icons/SideBarIcons";
import BodyText from "../../../components/BodyText/BodyText";
import SecondaryButton from "../../../components/SecondaryButton/SecondaryButton";
import CloseIcon from "@mui/icons-material/Close";
import { GenerateFileName } from "../../../helpers/helperFunction";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { ADMIN, ADMIN_CASEWORKER, CASEWORKER } from "../../../helpers/constant";
import useCRUDPermissions from "../../../components/UserComponents/useCRUDPermissions";
import { fr } from "date-fns/locale";

const ConsolidatedFamilyList = (props) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const fromDashboard = location.state && location.state.fromDashboard;
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [filterValues, setFilterValues] = useState(fromDashboard ? location.state.filters : {});
  const [appliedFiltersChipArray, setAppliedFiltersChipArray] = useState([]);
  const [query, setQuery] = useState("");
  const { signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);
  const { htLanguagesList, signedInOrgName, userIdData } =
    useContext(CommonDataContext);
  const { IS_EDIT_ALLOWED,CAN_DELETE } = useCRUDPermissions(); 
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
  const langOptions = [
    { id: 0, language: t("common:common.All") },
    ...htLanguagesList,
  ];
  const [langFilter, setLangFilter] = useState(
    langOptions && langOptions[0].id,
  );
  const [statusFilter, setStatusFilter] = useState(
    statusOptions && statusOptions[0].value,
  );
  //   actions
  const [menuState, setMenuState] = useState({ anchorEl: null, row: null });
  const open = Boolean(menuState.anchorEl);

  const handleClick = (event, row) => {
    setMenuState({ anchorEl: event.currentTarget, row });
  };

  const handleClose = () => {
    setMenuState({ anchorEl: null, row: null });
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Active":
        return "#3DAA1D";
      case "Inactive":
        return "#D6DBDE";
      default:
        return "#D6DBDE";
    }
  };

  const columnDefinition = [
    {
      id: "familyName",
      label: t("common:common.Family Name","Family Name"),
      enableSorting: true,
      render: (row) => (
        <BodyText
          value={row.familyName}
          onClick={() => navigate(`/dashboard/families/${row.id}/view`)}
          sx={{
            fontSize: "0.875rem",
            color: "#F37123",
            cursor: "pointer",
            fontWeight: 700,
          }}
        />
      ),
    },
    { id: "primaryCaregiver", label: t("common:common.Primary Caregiver", "Primary Caregiver"), enableSorting: true },
    {
      id: "contactInfo",
      label: t("common:common.Contact Info","Contact Info"),
      render: (row) => (
        <>
          <BodyText
            value={row.phoneNumber}
            sx={{
              fontSize: "0.875rem",
            }}
          />
          <BodyText
            value={row.email}
            sx={{
              fontSize: "0.875rem",
            }}
          />
        </>
      ),
    },
    { id: "noOfMembers", label: t("common:common.No of Caregivers", "No of Caregivers"), enableSorting: true },
    { id: "noOfChildren", label: t("common:common.No of Children", "No of Children"), enableSorting: true },
    {
      id: "location",
      label: t("common:common.Location", "Location"),
      render: (row) => (
        <>
          <BodyText
            value={row.addressLine1}
            sx={{
              fontSize: "0.875rem",
            }}
          />
          <BodyText
            value={row.addressLine2}
            sx={{
              fontSize: "0.875rem",
            }}
          />
          <BodyText
            value={row.city}
            sx={{
              fontSize: "0.875rem",
            }}
          />
        </>
      ),
    },
    {
      id: "status",
      label: t("common:common.Status", "Status"),
      render: (row) => (
        <Chip
          label={row.status}
          sx={{
            backgroundColor: getStatusBackgroundColor(row.status),
            color: row.status === "Active" ? "#FFFFFF" : "#000000",
          }}
        />
      ),
    },
    {
      id: "actions",
      label: "",
      align: "right",
      minWidth: "30px",
      maxWidth: "30px",
      render: (row) => (
        <>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? "long-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={(e) => handleClick(e, row)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={menuState.anchorEl}
            open={open}
            onClose={handleClose}
          >
            <Stack direction="row" spacing={0.5}>
              {IS_EDIT_ALLOWED &&<Tooltip title={t("common:family.Edit Family")}>
                <IconButton
                  component={RouterLink}
                  to={`/dashboard/families/${menuState.row?.id}/edit`}
                  id="edit-family"
                >
                  <PencilAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>}
              {/* {CAN_DELETE &&<Tooltip
                title={
                  menuState.row?.numberOfChildrenActive > 0
                    ? t(
                        "common:family.Cannot delete family with active children",
                        "Cannot delete family with active children",
                      )
                    : t("common:family.Delete Family")
                }
              >
                <span>
                  <IconButton
                    disabled={menuState.row?.numberOfChildrenActive > 0}
                    // onClick={() => handleDelete(menuState.row?.id)}
                    id="delete-family"
                  >
                    <TrashIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>} */}
              <Tooltip
                title={t(
                  "common:common.Assessments & Progress Reports",
                  "Assessments & Progress Reports",
                )}
              >
                <IconButton
                  onClick={() => {
                    navigate(`/dashboard/families/${menuState.row?.id}/view`, {
                      state: { tabvalue: "assessmentsProgressReports" },
                    });
                  }}
                >
                  <AssessmentProgressReportIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Menu>
        </>
      ),
    },
  ];

  const [isExporting, setIsExporting] = useState(false);

  const exportFamilies = async () => {
    setIsExporting(true);
    try {
      const res = await APIS.exportFamilies(statusFilter, query);
      const linkSource = `data:application/xlsx;base64,${res.data.body}`;
      const downloadLink = document.createElement("a");
      const fileName = GenerateFileName({
        signedInOrgName,
        userIdData,
        module: `Families`,
      });
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.target = "_blank";
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setIsExporting(false);
    } catch (error) {
      setIsExporting(false);
    }
  };

  const handleAddFamily = () => {
    navigate("/dashboard/families/add", { state: { mode: "add" } });
  };

  const getTableData = async (params = {}) => {
    setLoading(true);
    setApiError(null);
    const {
      sort = "dateOfVisit",
      order = "desc",
      page,
      rowCount,
      search = "",
      filter = filterValues,
    } = params || {};
    const payload = {
      globalSearchQuery: search,
      orderByField: [[sort, order.toUpperCase()]],
      pageNumber: page || 1,
      rowCount: rowCount || 10, // Default row count if not provided
      TWAccountId: localStorage.getItem("orgId"),
      caseWorker: "",
      listType: "LARGE",
      filters: filter

    };
    try {
      const response = await APIS.GetFamilyList(payload);
      setTableData({
        data: response?.data?.data || [],
        pageCount: response?.data?.pageCount || 1,
        totalCount: response?.data?.totalCount || 3,
      });
      setApiError(null);
    } catch (error) {
      setApiError("Failed to fetch milestones data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  const tableExtraButtons = (
    <>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        width={1}
        mr={2}
      >
        <SecondaryButton
          startIcon={
            <img
              src="/static/icons/ExportIcon.svg"
              style={{ width: 20, height: 20 }}
            />
          }
          label={t("common:common.Export")}
          onClick={exportFamilies}
          loading={isExporting}
          loadingPosition="start"
          id="export-families-btn"
        />
        {([ADMIN,ADMIN_CASEWORKER,CASEWORKER].includes(signedinUserRoleHT) || [ADMIN,ADMIN_CASEWORKER,CASEWORKER].includes(signedinUserRoleFS)) && (
          <SecondaryButton
            startIcon={
              <img
                src="/static/icons/AddIcon.svg"
                style={{ width: 20, height: 20 }}
              />
          }
          label={t("common:family.Add New Family")}
          onClick={handleAddFamily}
        />)}
      </Stack>
    </>
  );

  const filterComponent = (
    <>
      <Box>
        <BodyText
          value={t("common:infoCard.Status", "Status")}
          sx={{ mb: 1 }}
        />
        <Autocomplete
          disablePortal
          options={[
            { label: "Active", value: "Active", key: "Status" },
            { label: "Inactive", value: "Inactive", key: "Status" },
            { label: "Pending", value: "Pending", key: "Status" },
          ]}
          multiple
          value={filterValues?.status}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              status: newValue.map((item) => item.value),
            }));
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} />}
          renderTags={(value, getTagProps) => (
            <Stack direction="row" gap={1} flexWrap="wrap">
              {value.map((option, index) => (
                <Chip
                  key={option.value}
                  label={`${t(`common:infoCard.${option.label}`)}`}
                  sx={{ mb: 1, backgroundColor: "#34475D", color: "#fff" }}
                  deleteIcon={
                    <CloseIcon style={{ color: "#fff", fontSize: "16px" }} />
                  }
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      status: prev.status.filter(
                        (item) => item.value !== option.value,
                      ),
                    }))
                  }
                />
              ))}
            </Stack>
          )}
        />
      </Box>
      <Box>
        <BodyText
          value={t("common:infoCard.Case manager", "Case manager")}
          sx={{ mb: 1 }}
        />
        <Autocomplete
          disablePortal
          options={[]}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          multiple
          value={filterValues?.caseManager}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              caseManager: newValue.map((item) => item.value),
            }));
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} />}
          renderTags={(value, getTagProps) => (
            <Stack direction="row" gap={1} flexWrap="wrap">
              {value.map((option, index) => (
                <Chip
                  key={option.value}
                  label={`${t(`common:infoCard.${option.label}`)}`}
                  sx={{ mb: 1, backgroundColor: "#34475D", color: "#fff" }}
                  deleteIcon={
                    <CloseIcon style={{ color: "#fff", fontSize: "16px" }} />
                  }
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      caseManager: prev.caseManager.filter(
                        (item) => item.value !== option.value,
                      ),
                    }))
                  }
                />
              ))}
            </Stack>
          )}
        />
      </Box>
      {/* <Box>
        <BodyText
          value={t("common:infoCard.Language", "Language")}
          sx={{ mb: 1 }}
        />
        <Autocomplete
          disablePortal
          options={[]}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          multiple
          value={filterValues?.language}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              language: newValue,
            }));
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} />}
          renderTags={(value, getTagProps) => (
            <Stack direction="row" gap={1} flexWrap="wrap">
              {value.map((option, index) => (
                <Chip
                  key={option.value}
                  label={`${t(`common:infoCard.${option.label}`)}`}
                  sx={{ mb: 1, backgroundColor: "#34475D", color: "#fff" }}
                  deleteIcon={
                    <CloseIcon style={{ color: "#fff", fontSize: "16px" }} />
                  }
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      language: prev.language.filter(
                        (item) => item.value !== option.value,
                      ),
                    }))
                  }
                />
              ))}
            </Stack>
          )}
        />
      </Box> */}
    </>
  );

  const handleApplyFilters = ({ search, rowCount }) => {
    setAppliedFiltersChipArray(filterValues);
    getTableData({ search, filter: filterValues, rowCount });
  };

  const cancelFilterHandler = () => {
    setFilterValues(appliedFiltersChipArray);
  };

  const handleChipDelete = (key, value, { search, rowCount }) => {
    let updated = {
      ...filterValues,
      [key]: filterValues[key].filter((item) => item.value !== value),
    };
    setFilterValues(updated);
    setAppliedFiltersChipArray(updated);
    getTableData({ search, filter: updated, rowCount });
  };

  const clearFiltersHandler = () => {
    const clearedFilters = {};
    setFilterValues(clearedFilters);
  };
  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <PageBreadcrumbs
              data={[
                {
                  label: t("common:common.Families", "Families"),
                },
              ]}
            />

            <Box mt={2} mr>
              <ReusableTrendTable
                columns={columnDefinition}
                searchable
                tableData={tableData.data}
                loading={loading}
                skeltonRowcount={6}
                apiError={apiError}
                onReload={getTableData}
                filterable
                filterComponent={filterComponent}
                handleChipDelete={handleChipDelete}
                appliedFiltersChipArray={appliedFiltersChipArray}
                applyFilter={handleApplyFilters}
                cancelFilter={cancelFilterHandler}
                clearFilter={clearFiltersHandler}
                tableExtraButtons={tableExtraButtons}
                t={t}
                enablePagination
                totalPageCount={tableData.pageCount}
                totalItems={tableData.totalCount || 0}
                cardSx={{ textTransform: "capitalize" }}
                defaultSortField={"familyName"}
                defaultSortFieldOrder={"asc"}
                boldHeaders={false}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default ConsolidatedFamilyList;