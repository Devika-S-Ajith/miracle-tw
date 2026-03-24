import { Typography } from "@mui/material";
import {  useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { getNavbarFilterPayload } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getDomainIcon } from "../../GovtDashboardOverview/HelperFunctions/DashboardHelperFunction";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import ReusableTrendTable from "../../GovtDashboardOverview/Components/ReusableTrendTable";
import RatingComponent from "../../../../components/RatingComponent/RatingComponent";
import InCrisisFlag from "../../../../assets/icons/InCrisisFlag";

const AllInterventions = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const [apiError, setApiError] = useState(false);
  const { t } = useTranslation(["common"]);

  const encryptedUrl = (title) => {
    if (!title) return "";
    return btoa(encodeURIComponent(title));
  };

  const getAllInterventions = async (params = {}) => {
      try {
        setLoading(true);
        setApiError(false);
        // Extract params
        const {
          search = "",
          sort = "intervention",
          order = "asc",
          page,
          rowCount,
        } = params || {};

        const payload = {
          ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
          ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
          accountNameFilter: search,
          orderByField: [[sort, order.toUpperCase()]],
          pageNumber: page || 1,
          rowCount: rowCount || 10, // Default row count if not provided
        };
        if (payload.countryFilter === null) {
          return;
        }
        const response = await APIS.GetAllInterventions(payload);
        const interventionListData = response.data || [];
        setTableData(interventionListData);
        setLoading(false);
        setApiError(null);
      } catch (error) {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) {
      getAllInterventions();
    }
  }, [navbarFilterValues, id, localStorage.getItem("userRegion"), signedinOrgType]);

  const columnDefinition = [
    {
      label: "Intervention",
      id: "intervention",
      enableSorting: true,
      enableColumnSelector: false,
      minWidth: 400,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          color="primary"
          onClick={() =>
            navigate(
              `${window.location.pathname}/${encryptedUrl(row.intervention)}`
            )
          }
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span
            style={{ display: "flex", alignItems: "center", marginRight: 1 }}
          >
            {getDomainIcon(row?.domain_id)}
          </span>
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row?.intervention?.trim()}
          </span>
        </Typography>
      ),
    },
    {
      label: "Milestone",
      id: "milestone_name",
      enableSorting: true,
      enableColumnSelector: false,
      minWidth: 400,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          color="primary"
          onClick={() =>
            navigate(
              `/governmentDashboardMilestones/${encryptedUrl(
                row.milestone_name
              )}`
            )
          }
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span
            style={{ display: "flex", alignItems: "center", marginRight: 1 }}
          >
            <InCrisisFlag sx={{ mr: 1 }} />
          </span>
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row?.milestone_name?.trim()}
          </span>
        </Typography>
      ),
    },
    {
      label: "# active interventions",
      id: "active_interventions_count",
      enableColumnSelector: true,
      enableSorting: true,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row.active_interventions_count}
          </span>
        </Typography>
      ),
    },
    {
      label: "% of cases assigned",
      id: "cases_assigned_percentage",
      enableSorting: true,
      enableColumnSelector: true,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row.cases_assigned_percentage}%
          </span>
        </Typography>
      ),
    },
    {
      label: "# completed interventions",
      id: "completed_interventions_count",
      enableSorting: true,
      enableColumnSelector: true,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row.completed_interventions_count}
          </span>
        </Typography>
      ),
    },
    {
      label: "Completion rate",
      id: "completion_rate_percentage",
      enableColumnSelector: true,
      enableSorting: true,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row.completion_rate_percentage}%
          </span>
        </Typography>
      ),
    },
    {
      label: "Overall rating",
      id: "rating",
      enableColumnSelector: true,
      enableSorting: false,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            <RatingComponent rating={row?.rating} readOnly={true} />
          </span>
        </Typography>
      ),
    },
  ];

  const handleReload = (params = {}) => {
    getAllInterventions(params);
  };

  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title="All interventions"
      searchable={false}
      tableData={tableData?.data || []}
      skeltonRowcount={5}
      loading={loading}
      apiError={apiError}
      enablePagination={true}
      enableSorting={true}
      filterable={true}
      t={t}
      onReload={handleReload}
      totalPageCount={tableData?.pageCount}
      totalItems={tableData?.total || 0}
      defaultSortField="intervention"
      defaultSortFieldOrder="asc"
    />
  );
};

export default AllInterventions;
