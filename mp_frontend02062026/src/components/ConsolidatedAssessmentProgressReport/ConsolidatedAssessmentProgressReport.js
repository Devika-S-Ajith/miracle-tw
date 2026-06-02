import React, { useEffect, useState } from "react";
import ReusableTrendTable from "../../views/Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
import APIS from "../../common/hooks/UseApiCalls";
import SmallText from "../SmallText/SmallText";
import { MonthDayYearFormatter } from "../../constants";
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import ChartSquareBarIcon from "../../assets/icons/ChartSquareBar";
import { useNavigate } from "react-router";
import {
  ChildIconBlack,
  FamilyIconBlack,
} from "../../assets/icons/SideBarIcons";
import BodyText from "../BodyText/BodyText";
import CloseIcon from "@mui/icons-material/Close";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

const AssessmentStatusOptions = [
  { label: "All", value: "All", key: "Assessment status" },
  { label: "Not started", value: "Not started", key: "Assessment status" },
  { label: "In Progress", value: "In progress", key: "Assessment status" },
  { label: "Completed", value: "Completed", key: "Assessment status" },
];

const ProgressReportStatusOptions = [
  { label: "All", value: "All", key: "Progress report status" },
  { label: "Not started", value: "Not started", key: "Progress report status" },
  { label: "Completed", value: "Completed", key: "Progress report status" },
  {
    label: "Not Required",
    value: "Not required",
    key: "Progress report status",
  },
];

const OverdueOptions = [
  { label: "All", value: "All", key: "Overdue assessments" },
  { label: "Not overdue", value: "Not overdue", key: "Overdue assessments" },
  { label: "Overdue", value: "Overdue", key: "Overdue assessments" },
];

const ConsolidatedAssessmentProgressReport = ({ pageType, id }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState({
    assessmentStatus: [],
    progressReportStatus: [],
    overdueStatus: [],
  });
  const [appliedFiltersChipArray, setAppliedFiltersChipArray] = useState([]);
  const columnDefinition = [
    ...(pageType === "ASSESSMENT"
      ? [
          {
            id: "assessmentFor",
            label: "Assessment for",
            render: (row, value) => (
              <Stack direction="row" spacing={1} alignItems="center">
                {row?.type === "CHILD" ? (
                  <ChildIconBlack fontSize="small" />
                ) : (
                  <FamilyIconBlack fontSize="small" />
                )}
                <SmallText value={value} />
              </Stack>
            ),
          },
        ]
      : []),
    {
      id: "caseWorker",
      label: "Case worker",
    },
    {
      id: "status",
      label: "Assessment status",
      render: (_, value) => <SmallText value={t(`common:infoCard.${value}`)} />,
    },
    {
      id: "dateOfVisit",
      label: "Date of visit",
      render: (row, value) => (
        <SmallText value={MonthDayYearFormatter(value) || "-"} />
      ),
    },
    {
      id: "dateOfSubmission",
      label: "Date assessment submitted",
      render: (row, value) => {
        // Calculate overdue days if value is not present (i.e., due)
        let overdueText = null;

        if (row?.dateOfSubmission && row?.dateOfSubmission !== "") {
          const dueDate = new Date(row?.dueDate);
          const actualDate = new Date(row?.dateOfSubmission);
          // Zero out time for accurate day diff
          dueDate.setHours(0, 0, 0, 0);
          actualDate.setHours(0, 0, 0, 0);
          const diffMs = actualDate - dueDate;
          const daysOverdue =
            diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
          if (daysOverdue > 0) {
            overdueText = (
              <SmallText
                color="red"
                value={`${daysOverdue} ${daysOverdue === 1 ? t("common:infoCard.day overdue", "day overdue") : t("common:infoCard.days overdue", "days overdue")}`}
              />
            );
          }
        } else {
          const dueDate = new Date(row?.dueDate);
          const today = new Date();
          // Zero out time for accurate day diff
          dueDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffMs = today - dueDate;
          const daysOverdue =
            diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
          if (daysOverdue > 0) {
            overdueText = (
              <SmallText
                color={"red"}
                value={`${daysOverdue} ${daysOverdue === 1 ? t("common:infoCard.day overdue", "day overdue") : t("common:infoCard.days overdue", "days overdue")}`}
              />
            );
          }
        }
        return (
          <>
            <SmallText value={MonthDayYearFormatter(value) || "-"} />
            {row?.assessmentNumber !== "1" &&
              row?.dateOfSubmission &&
              row?.dateOfSubmission !== "" &&
              overdueText}
          </>
        );
      },
    },
    {
      id: "totalScore",
      label: "ThriveScale Score",
      render: (row, value) => row?.status === "Completed" ? <SmallText value={value ? `${value}%` : "-"} /> : <SmallText value="-" />,
    },
    {
      id: "progressReportStatus",
      label: "Progress report status",
      render: (_, value) => <SmallText value={t(`common:infoCard.${value}`)} />,
    },
    {
      id: "progressreportSubmissionDate",
      label: "Date progress report submitted",
      render: (row, value) => {
        // Calculate overdue days if value is not present (i.e., due)
        let overdueText = null;

        if (value && value !== "") {
          const dueDate = new Date(row?.dateOfVisit);
          // Add 87 days to dueDate for progress report due date
          const progressReportDueDate = new Date(dueDate);
          progressReportDueDate.setDate(progressReportDueDate.getDate() + 86);
          const actualDate = new Date(value);
          // Zero out time for accurate day diff
          dueDate.setHours(0, 0, 0, 0);
          actualDate.setHours(0, 0, 0, 0);
          const diffMs = actualDate - progressReportDueDate;
          const daysOverdue =
            diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;

          if (daysOverdue > 0) {
            overdueText = (
              <SmallText
                color={"red"}
                value={`${daysOverdue} ${daysOverdue === 1 ? t("common:infoCard.day overdue", "day overdue") : t("common:infoCard.days overdue", "days overdue")}`}
              />
            );
          }
        }

        return (
          <>
            <SmallText value={MonthDayYearFormatter(value) || "-"} />
            {value && value !== "" && overdueText}
          </>
        );
      },
    },
    {
      id: "interventionStatus",
      label: "Intervention status",
      render: (row, value) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={t("common:infoCard.Not started")}>
            <img
              src={"/static/icons/notStartedIcon.png"}
              alt={"Not started icon"}
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
            />
          </Tooltip>
          <SmallText value={row?.activeNotStartedIntervention} />
          <Tooltip title={t("common:infoCard.In Progress")}>
            <img
              src={"/static/icons/inProgressIcon.png"}
              alt={"In progress icon"}
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
            />
          </Tooltip>
          <SmallText value={row?.inProgressIntervention} />
          <Tooltip title={t("common:infoCard.Completed")}>
            <img
              src={"/static/icons/completedIcon.png"}
              alt={"Completed icon"}
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
            />
          </Tooltip>
          <SmallText value={row?.completedIntervention} />
          <Tooltip title={t("common:infoCard.No longer relevant")}>
            <img
              src={"/static/icons/noLongerRelevant.png"}
              alt={"No longer relevant icon"}
              width={20}
              height={20}
              style={{ objectFit: "contain" }}
            />
          </Tooltip>
          <SmallText value={row?.interventionNoLongerRelevant} />
        </Stack>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      fixed: true,
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {row?.status === "Completed" && (
            <Tooltip title={t("common:common.Assessments")}>
              <IconButton
                onClick={() => {
                  navigate(
                    `/dashboard/assessments/${row?.TWAssessmentId}/view`,
                  );
                }}
              >
                <ChartSquareBarIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
          {row?.progressReportStatus === "Completed" && (
            <Tooltip title={t("common:common.Progress Report")}>
              <IconButton
                onClick={() => {
                  pageType === "CHILD"
                    ? navigate(`/dashboard/progressReportChildren`, {
                        state: { assessmentId: row?.TWAssessmentId },
                      })
                    : navigate(`/dashboard/reportProgressReportsFamilies`, {
                        state: { assessmentId: row?.TWAssessmentId },
                      });
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 24,
                    width: 24,
                  }}
                >
                  <img
                    alt="Progress report icon"
                    src="/static/icons/ProgressReport.svg"
                    height="16"
                    width="16"
                  />
                </Box>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  useEffect(() => {
    getTableData({ filter: filterValues });
  }, []);

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
      searchText: search,
      orderByField: [[sort, order.toUpperCase()]],
      pageNumber: page || 1,
      rowCount: rowCount || 10, // Default row count if not provided
      TWChildId: pageType === "CHILD" ? id : null,
      TWFamilyId: pageType === "FAMILY" ? id : null,
      TWAccountId: localStorage.getItem("orgId"),
      caseWorker: "",
      assessmentStatus:
        filter.assessmentStatus &&
        (filter.assessmentStatus.map((item) => item.value) || undefined),
      progressReportStatus:
        filter.progressReportStatus &&
        (filter.progressReportStatus.map((item) => item.value) || undefined),
      overdueAssessments:
        filter.overdueStatus &&
        (filter.overdueStatus.map((item) => item.value) || undefined),
    };
    try {
      const response =
        await APIS.GetConsolidatedAssessmentProgressReport(payload);
      setAppliedFiltersChipArray(filter);
      setTableData({
        data: response?.data?.data || [],
        pageCount: response?.data?.pageCount,
        totalCount: response?.data?.totalCount || 0,
      });
      setApiError(null);
    } catch (error) {
      setApiError("Failed to fetch milestones data");
    } finally {
      setLoading(false);
    }
  };

  const filterComponent = (
    <>
      <Box>
        <BodyText
          value={t("common:infoCard.Assessment status", "Assessment status")}
          sx={{ mb: 1 }}
        />
        <Autocomplete
          disablePortal
          options={AssessmentStatusOptions}
          multiple
          value={filterValues?.assessmentStatus}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              assessmentStatus: newValue,
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
                      assessmentStatus: prev.assessmentStatus.filter(
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
          value={t(
            "common:infoCard.Progress report status",
            "Progress report status",
          )}
          sx={{ mb: 1 }}
        />
        <Autocomplete
          disablePortal
          options={ProgressReportStatusOptions}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          multiple
          value={filterValues?.progressReportStatus}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              progressReportStatus: newValue,
            }));
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} />}
          renderTags={(value, getTagProps) => (
            <Stack direction="row" gap={1} flexWrap="wrap">
              {value.map((option, index) => (
                <Chip
                  key={option.value}
                  // label={`${item.key}: ${item.label}`}
                  label={`${t(`common:infoCard.${option.label}`)}`}
                  sx={{ mb: 1, backgroundColor: "#34475D", color: "#fff" }}
                  deleteIcon={
                    <CloseIcon style={{ color: "#fff", fontSize: "16px" }} />
                  }
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      progressReportStatus: prev.progressReportStatus.filter(
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
          value={t(
            "common:infoCard.Overdue assessments",
            "Overdue assessments",
          )}
          sx={{ mb: 1 }}
        />
        <Autocomplete
          disablePortal
          options={OverdueOptions}
          getOptionLabel={(option) =>
            t(`common:infoCard.${option.label}`, option.label)
          }
          multiple
          value={filterValues?.overdueStatus}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            setFilterValues((prev) => ({
              ...prev,
              overdueStatus: newValue,
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
                      overdueStatus: prev.overdueStatus.filter(
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
    const clearedFilters = {
      assessmentStatus: [],
      progressReportStatus: [],
      overdueStatus: [],
    };
    setFilterValues(clearedFilters);
  };

  const tableExtraButtons = (
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
            src="/static/icons/aiIcon.svg"
            style={{ width: 20, height: 20 }}
          />
        }
        label="New ThriveAssist assessment"
        onClick={() => {
          window.open('https://aiprojects.thrivewellapp.com/', '_blank');
        }}
      />
    </Stack>
  );

  return (
    <>
      <ReusableTrendTable
        columns={columnDefinition}
        title={
          pageType !== "ASSESSMENT"
            ? "Assessments & Progress Reports"
            : undefined
        }
        searchable
        filterable
        filterComponent={filterComponent}
        handleChipDelete={handleChipDelete}
        appliedFiltersChipArray={appliedFiltersChipArray}
        applyFilter={handleApplyFilters}
        cancelFilter={cancelFilterHandler}
        clearFilter={clearFiltersHandler}
        tableData={tableData?.data || []}
        loading={loading}
        skeltonRowcount={6}
        apiError={apiError}
        onReload={getTableData}
        t={t}
        enablePagination
        totalPageCount={tableData?.pageCount}
        totalItems={tableData?.totalCount || 0}
        cardSx={{
          pt: pageType === "ASSESSMENT" ? 1 : undefined,
          textTransform: "capitalize",
        }}
        defaultSortField={"dateOfVisit"}
        defaultSortFieldOrder={"desc"}
        searchPlaceholder={t(
          "common:infoCard.Search by child name, family name, case worker",
          "Search by child name, family name, case worker",
        )}
        // tableExtraButtons={tableExtraButtons}
      />
    </>
  );
};

export default ConsolidatedAssessmentProgressReport;
