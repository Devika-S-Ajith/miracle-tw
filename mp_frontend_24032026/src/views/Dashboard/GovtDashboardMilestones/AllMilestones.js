import React, { useContext } from "react";
import { useState, useEffect } from "react";
import ReusableTrendTable from "../GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import SmallText from "../../../components/SmallText/SmallText";
import TrendingUp from "../../../assets/icons/TrendingUp";
import TrendingDown from "../../../assets/icons/TrendingDown";
import TrendingStraight from "../../../assets/icons/TrendingStraight";
import { MoodImageMapping } from "../Components/StateGovDashboardComponents/MoodImageMapping";
import { useNavigate } from "react-router-dom";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

const AllMilestones = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  // Component state
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  // Example columns definition
  const columnDefinition = [
    {
      id: "milestone",
      label: "Milestone",
      enableSorting: true,
      enableColumnSelector: false,
      render: (row, value) => (
        <Box
          display="flex"
          gap={1}
          sx={{
            maxWidth: {
              xs: 250, // mobile
              sm: 350, // small screens
              md: 500, // medium screens
              lg: 700, // large screens
            },
          }}
        >
          {getDomainIcon(row.domainId)}
          <SmallText
            value={value}
            color="primary"
            onClick={() =>
              navigate(
                `${window.location.pathname}/${encryptedUrl(row.milestone)}`
              )
            }
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              cursor: "pointer",
            }}
          />
        </Box>
      ),
    },
    {
      id: "redFlag",
      label: "Red flag?",
      enableColumnSelector: true,
      enableSorting: true,
      render: (row, value) =>
        value ? (
          <img
            src="/static/icons/redFlag.svg"
            style={{ width: 20, height: 20 }}
          />
        ) : (
          "-"
        ),
    },
    { id: "initialRanking", label: "Initial ranking", enableSorting: true , enableColumnSelector: true, },
    {
      id: "activeInCrisisCases",
      label: "Active “In crisis” cases",
      enableSorting: true,
      enableColumnSelector: true,
    },
    {
      id: "activeVulnerableCases",
      label: "Active “Vulnerable” cases",
      enableSorting: true,
      enableColumnSelector: true,
    },
    {
      id: "milestoneModeByAssessment",
      label: "Milestone “mode” by assessment",
      enableColumnSelector: true,
      render: (row) => {
        // Map mode to icon path
        return (
          <Box display="flex" gap={2}>
            {row?.milestoneModeByAssessment?.map((mode, index) => (
              <img
                key={index}
                src={MoodImageMapping[mode.toUpperCase()]}
                alt={mode}
                style={{ width: 20, height: 20 }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      id: "averageScoreChange",
      label: "Average score change",
      enableColumnSelector: true,
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span
            style={{ display: "flex", alignItems: "center", marginRight: 1 }}
          >
            {getScoreChangeIcon(row.averageScoreChange)}
          </span>
          <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
            {row.averageScoreChange}%
          </span>
        </Typography>
      ),
    },
  ];

  const encryptedUrl = (title) => {
    if (!title) return "";
    return btoa(encodeURIComponent(title));
  };

  const getDomainIcon = (id) => {
    const domainIcons = {
      1: "/static/icons/familyAndRelationships.svg",
      2: "/static/icons/householdEconomy.svg",
      3: "/static/icons/livingConditions.svg",
      4: "/static/icons/education.svg",
      5: "/static/icons/healthAndMentalHealth.svg",
    };
    return <img src={domainIcons[id]} style={{ width: 20, height: 20 }} />;
  };

  const getScoreChangeIcon = (score) => {
    const num = Number(score);
    if (num > 0) return <TrendingUp sx={{ fontSize: 27, mb: -1 }} />;
    if (num < 0) return <TrendingDown sx={{ fontSize: 27, mb: -1 }} />;
    return (
      <TrendingStraight
        sx={{ fontSize: 27, mb: -1, transform: "rotate(-90deg)" }}
      />
    );
  };

  // API call function
  const getAllMilestoneData = async (params = {}) => {
    setLoading(true);
    setApiError(null);
    const {
      // search = "", // Removed unused variable
      sort = "milestone",
      order = "asc",
      page,
      rowCount,
    } = params || {};
    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      orderByField: [[sort, order.toUpperCase()]],
      pageNumber: page || 1,
      rowCount: rowCount || 10, // Default row count if not provided
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      const response = await APIS.GetAllMilestones(payload);
      const allMilestoneListData = response.data;
      allMilestoneListData?.data?.forEach((item) => {
        if (
          item.milestoneModeByAssessment &&
          typeof item.milestoneModeByAssessment === "object" &&
          !Array.isArray(item.milestoneModeByAssessment)
        ) {
          item.milestoneModeByAssessment = Object.values(
            item.milestoneModeByAssessment
          );
        }
      });
      setTableData(allMilestoneListData);
      setApiError(null);
    } catch (error) {
      setApiError("Failed to fetch milestones data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType)  {
      getAllMilestoneData();
    }
  }, [navbarFilterValues, localStorage.getItem("userRegion"), signedinOrgType]);

  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title="All milestones"
      tableData={tableData?.data || []}
      loading={loading}
      skeltonRowcount={6}
      apiError={apiError}
      onReload={getAllMilestoneData}
      t={t}
      enablePagination={true}
      totalPageCount={tableData?.pageCount}
      totalItems={tableData?.total || 0}
    />
  );
};

export default AllMilestones;
