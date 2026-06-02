import { Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { getDomainIcon } from "./HelperFunctions/DashboardHelperFunction";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import MiniStackedBarChart from "./Components/MiniStackedBarChart";
import ReusableTrendTable from "./Components/ReusableTrendTable";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getNavbarFilterPayload } from "../../../constants";

const transformDomainData = (domain) => {
  const {
    domainData,
    domainId,
    domainName,
    startingAverage,
    endingAverage,
  } = domain;
  if (!domainData || domainData.length === 0) return null;

  const assessments = domainData.map(
    ({
      inCrisisRedFlagCount,
      vulnerableRedFlagCount,
      cases,
      totalRedFlagCount,
      redFlagCount,
    }) => {
      return {
        inCrisis: Number(inCrisisRedFlagCount) || 0,
        vulnerable: Number(vulnerableRedFlagCount) || 0,
        cases: Number(cases) || 0,
        total: Number(totalRedFlagCount) || 0,
        actual: Number(redFlagCount) || 0,
        possible: 1,
      };
    }
  );

  return {
    domainId: Number(domainId),
    domainName,
    startingAvg: startingAverage,
    possible: 1,
    assessments,
    finalAvg: endingAverage,
  };
};

const RedFlagMilestonesByDomain = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const [apiError, setApiError] = useState(false);
  const { t } = useTranslation(["common"]);

  const fetchData = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const payload = {
        ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
        ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
        orderByField: [
          ["initial_ranking", "DESC"],
          ["milestone", "ASC"],
        ],
      };
      const response = await APIS.GetRedFlagMilestoneByDomain(payload);
      const transformedData = response.data.data
        .map(transformDomainData)
        .filter(Boolean);
      setTableData(transformedData);
    } catch (error) {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) fetchData();
  }, [navbarFilterValues, localStorage.getItem("userRegion"), signedinOrgType]);

  const columnDefinition = [
    {
      label: "Domain",
      id: "domain",
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {getDomainIcon(row.domainId)}
          {t(`common:common.${row?.domainName?.trim()}`) || row.domainName}
        </Typography>
      ),
    },
    {
      label: "Starting avg # red flags / possible red flags",
      id: "startingAvg",
      maxWidth: 300,
      render: (row) => (
        <Typography variant="body2" fontWeight="medium">
          {row.startingAvg}
        </Typography>
      ),
    },
    {
      label: "Average # of red flags per assessment",
      id: "assessments",
      render: (row) => {
        const maxTotal = Math.max(
          ...row.assessments.map((a) => a.inCrisis + a.vulnerable)
        );
        return (
          <MiniStackedBarChart
            assessments={row.assessments.map((a) => ({
              inCrisis: a.inCrisis,
              vulnerable: a.vulnerable,
              cases: a.cases,
              total: maxTotal,
              totalRedFlagCount: a.total,
            }))}
          />
        );
      },
    },
    {
      label: "Final avg # of red flags / possible red flags",
      id: "finalAvg",
      maxWidth: 300,
      render: (row) => {
        let Icon = ArrowForwardIcon;
        let color = "black";
        if (row.finalAvg > row.startingAvg) {
          Icon = ArrowUpwardIcon;
          color = "red";
        } else if (row.finalAvg < row.startingAvg) {
          Icon = ArrowDownwardIcon;
          color = "green";
        }
        return (
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ display: "flex", alignItems: "center", color }}
          >
            <Icon sx={{ fontSize: 20, mr: 0.5 }} />
            {row.finalAvg}
          </Typography>
        );
      },
    },
  ];

  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title="Red Flag Milestones by Domain"
      subheader="All active and closed families and children with at least 1 assessment"
      tableData={tableData}
      loading={loading}
      skeltonRowcount={4}
      apiError={apiError}
      onReload={fetchData}
      t={t}
    />
  );
};

export default RedFlagMilestonesByDomain;
