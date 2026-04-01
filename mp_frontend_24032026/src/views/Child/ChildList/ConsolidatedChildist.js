import React, { useCallback, useContext, useEffect, useState } from "react";
import ReusableTrendTable from "../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
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
import { ModalService } from "../../../components/Modal";
import ManageChildForm from "../Components/ChildListTable/ChildDetailForms/ManageChildForm";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import CloseIcon from "@mui/icons-material/Close";

const statusOptions = [
  { label: "Active", value: "Active", key: "Status" },
  { label: "Case Closed", value: "Case Closed", key: "Status" },
];

const ConsolidatedChildList = (props) => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFiltersChipArray, setAppliedFiltersChipArray] = useState([]);
  const { signedinOrgId } = useContext(CommonDataContext);
  const [users, setUsers] = useState([]);

  //   actions
  const [menuState, setMenuState] = useState({ anchorEl: null, row: null });
  const open = Boolean(menuState?.anchorEl);

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
      id: "childName",
      label: "Child Name",
      enableSorting: true,
      render: (row) => (
        <BodyText
          value={`${row.firstName} ${row.lastName || ""}`}
          sx={{
            fontSize: "0.875rem",
            color: "#F37123",
            cursor: "pointer",
            fontWeight: 700,
          }}
          onClick={() => navigate(`/dashboard/children/${row.id}/view`)}
        />
      ),
    },
    {
      id: "familyName",
      label: "Family Name",
      enableSorting: true,
      render: (row) => (
        <BodyText
          value={row.familyName}
          sx={{
            fontSize: "0.875rem",
            color: "#F37123",
            cursor: "pointer",
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      id: "caseWorker",
      label: "Case Manager",
      enableSorting: true,
      render: (row) => `${row.caseWorkerFirstName} ${row.caseWorkerLastName}`,
    },
    { id: "childPlacementStatusValue", label: "Current Living Situation" },
    {
      id: "status",
      label: "Status",
      enableSorting: true,
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
            aria-controls={open ? `${row.id}-long-menu` : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={(e) => handleClick(e, row)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id={`${row.id}-long-menu`}
            anchorEl={menuState?.anchorEl}
            open={open}
            onClose={handleClose}
          >
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={t("common:common.Edit child", "Edit child")}>
                <IconButton
                  onClick={() => {
                    setMenuState(null);
                    ModalService.open(
                      ({ close }) => (
                        <ManageChildForm
                          close={close}
                          id={menuState?.row?.id}
                          onCaseChange={getTableData} // Refresh data after re-opening case
                        />
                      ),
                      {
                        width: "30%",
                        height: "95%",
                        
                        hideModalFooter: true,
                        enableClose: false,
                      },
                    );
                  }}
                  id="edit-family"
                >
                  <PencilAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
              // title={
              //   family?.numberOfChildrenActive > 0
              //     ? (t("common:family.Cannot delete family with active children", "Cannot delete family with active children"))
              //     : t("common:family.Delete Family")
              // }
              >
                <span>
                  <IconButton
                    // disabled={family?.numberOfChildrenActive > 0}
                    // onClick={() => handleDelete(family.id)}
                    id="delete-family"
                  >
                    <TrashIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={t(
                  "common:common.Assessments & Progress Reports",
                  "Assessments & Progress Reports",
                )}
              >
                <IconButton
                //   onClick={() => {
                //     navigate(
                //       `/dashboard/families/${family.id}/view`,
                //       {
                //         state: { tabvalue: "assessmentsProgressReports" },
                //       }
                //     );
                //   }}
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

  const getTableData = async (params = {}) => {
    setLoading(true);
    setApiError(null);
    const {
      sort = "childName",
      order = "desc",
      page,
      rowCount,
      search = "",
      filter = filterValues,
    } = params || {};
    const payload = {
      rowCount: rowCount || 10, // Default row count if not provided
      pageNumber: page || 1,
      searchText: search,
      orderByField: [[sort, order.toUpperCase()]],
      status:
        filter.status && (filter.status.map((item) => item.value) || undefined),
      caseWorker:
        filter.caseWorker &&
        (filter.caseWorker.map((item) => item.value) || undefined),
      // TWAccountId: localStorage.getItem("orgId"),
      // caseWorker: "",
    };
    try {
      const response = await APIS.GetChildList(payload);
      setTableData({
        data: response?.data?.data || [],
        pageCount: response?.data?.pageCount,
        totalCount: response?.data?.totalCount,
      });
      setApiError(null);
    } catch (error) {
      setApiError("Failed to fetch child data");
    } finally {
      setLoading(false);
    }
  };

  const getUserList = useCallback(async () => {
    try {
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        accountId: [signedinOrgId],
        HTUserRoleId: ["4", "5"],
        HTCountryId: localStorage.getItem("userRegion"),
      };
      payload.HTCountryId = localStorage.getItem("userRegion");
      const data = await APIS.ListUsers(payload);
      setUsers(
        data &&
          data.data &&
          data.data.data?.map((user) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user.id,
            key: "Case Worker",
          })),
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getTableData();
    getUserList();
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
          onClick={() => {}}
        />
        <SecondaryButton
          startIcon={
            <img
              src="/static/icons/AddIcon.svg"
              style={{ width: 20, height: 20 }}
            />
          }
          label={t("common:child.Add new child")}
          onClick={() =>
            ModalService.open(
              ({ close }) => <ManageChildForm close={close} />,
              {
                modalTitle: (
                  <Box>
                    Child <span style={{ color: "#FF8C42" }}>ACTIVE</span>
                  </Box>
                ),
                width: "30%",
                height: "95%",
                hideModalFooter: true,
                enableClose: true,
              },
            )
          }
        />
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
          options={statusOptions}
          multiple
          value={filterValues?.status}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              status: newValue,
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
          options={users}
          getOptionLabel={(option) => option.label}
          multiple
          value={filterValues?.caseWorker}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              caseWorker: newValue,
            }));
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} />}
          renderTags={(value, getTagProps) => (
            <Stack direction="row" gap={1} flexWrap="wrap">
              {value.map((option, index) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  sx={{ mb: 1, backgroundColor: "#34475D", color: "#fff" }}
                  deleteIcon={
                    <CloseIcon style={{ color: "#fff", fontSize: "16px" }} />
                  }
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      caseWorker: prev.caseWorker.filter(
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
                  label: t("common:common.Children", "Children"),
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
                defaultSortField={"childName"}
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
export default ConsolidatedChildList;
