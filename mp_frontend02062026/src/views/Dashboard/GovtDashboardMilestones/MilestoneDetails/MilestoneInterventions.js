import { Typography } from "@mui/material";
import {  useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { EncryptId, getNavbarFilterPayload } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import ReusableTrendTable from "../../GovtDashboardOverview/Components/ReusableTrendTable";
import RatingComponent from "../../../../components/RatingComponent/RatingComponent";

const MilestoneInterventions = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  // Example decryption function (replace with your actual logic)
  const decryptId = (encryptedId) => {
    try {
      return decodeURIComponent(atob(encryptedId));
    } catch (e) {
      return "";
    }
  };
  const decryptedId = decryptId(id);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const [apiError, setApiError] = useState(false);
  const { t } = useTranslation(["common"]);

  const getAllInterventions = async (params = {}) => {
    setLoading(true);
    setApiError(null);
    const {
      sort = "intervention",
      order = "asc",
      page,
      rowCount,
    } = params || {};
    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6"
        ? { accountFilter: [localStorage.getItem("orgId")] }
        : {}),
      milestoneNameFilter: decryptedId,
      orderByField: [[sort, order.toUpperCase()]],
      pageNumber: page || 1,
      rowCount: rowCount || 10,
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      setLoading(true);
      const resp = await APIS.GetAllInterventionsForMilestone(payload);
      setTableData(resp?.data);
      setLoading(false);
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
  }, [localStorage.getItem("userRegion"), signedinOrgType]);

  const columnDefinition = [
    {
      label: "Intervention",
      id: "intervention",
      enableSorting: true,
      render: (_, value) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          color="primary"
          onClick={() =>
            navigate(`/governmentDashboardInterventions/${EncryptId(value)}`, {
              state: { milestone: decryptedId },
            })
          }
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {value?.trim()}
          </span>
        </Typography>
      ),
    },
    {
      label: "# active interventions",
      id: "activeInterventions",
      enableSorting: true,
    },

    {
      label: "# completed interventions",
      id: "completedInterventions",
      enableSorting: true,
    },

    {
      label: "intervention rating",
      id: "interventionRating",
      render: (_, value) => <RatingComponent rating={value} readOnly={true} />,
    },
  ];

  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title={`${t("common:infoCard.Interventions for this milestone")} (${tableData?.total || 0})`}
      searchable={false}
      tableData={tableData?.data || []}
      skeltonRowcount={5}
      loading={loading}
      apiError={apiError}
      enablePagination={true}
      enableSorting={true}
      t={t}
      onReload={getAllInterventions}
      totalPageCount={tableData?.pageCount}
      totalItems={tableData?.total || 0}
      defaultSortField="Intervention"
      defaultSortFieldOrder="asc"
    />
  );
};

export default MilestoneInterventions;
