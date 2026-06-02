import React, { useContext, useMemo, useEffect, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import BarChartGraph from "../../../components/Barchart/Barchart";
import SmallText from "../../../components/SmallText/SmallText";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { getNavbarFilterPayload } from "../../../constants";
import { useParams } from "react-router";

const colorMap = {
  Thriving: "#71C5D4",
  Safe: "#C5D86D",
  Vulnerable: "#F37123",
  "In crisis": "#BC1041",
};

const AverageThriveScaleScores = ({ isGeneralDashboard = false }) => {
  const { t } = useTranslation(["common"]);
  const [chartData, setChartData] = useState(null);
  const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
  const [loading, setLoading] = useState(true);
  const {id} = useParams();
  const [apiError, setApiError] = useState(null);
  const userRegion = localStorage.getItem("userRegion");

  useEffect(() => {
    if (userRegion) {
      fetchAverageThriveScaleScoresData();
    }
  }, [navbarFilterValues, id, userRegion]);

  const fetchAverageThriveScaleScoresData = async () => {
    setLoading(true);
    setApiError(null);
    const payload = getNavbarFilterPayload(navbarFilterValues, linkedAccounts) || {};
    if (id) {
      payload.accountFilter = [id];
    }
      if (isGeneralDashboard) { 
          payload.accountFilter =[localStorage.getItem("orgId")] ;
      }
    if (payload.countryFilter === null || payload.countryFilter === undefined) {
      setLoading(false); // ensure loading is set to false if early return
      return;
    }
    try {
      const response = await APIS.GetGovtDashboardAverageAssessmentScores(
        payload
      );
      const averageThriveScaleScoresRawData = response.data.data || [];
      const transformedData = averageThriveScaleScoresRawData.map(
        (item, idx) => ({
          label: `A${item["assessmentNo"]}`,
          longLabel: `Assessment A${item["assessmentNo"]}`,
          barHeightValue: item.averageThrivescalePercent,
          total: item.totalCount,
          childCount: item.childCount,
          familyCount: item.familyCount,
          primaryBarIndicator: `${item.averageThrivescalePercent}%`,
          secondaryBarIndicator: `(${item.totalCount})`,
          categories: defaultCategories.map((cat) => ({
            ...cat,
            value: item[cat.key],
          })),
        })
      );
      setChartData(transformedData);
    } catch (err) {
      setApiError(err);
    }
    finally{
       setLoading(false);
    }
    };

  // Define categories as a default object above
  const defaultCategories = [
    {
      name: t("common:assessment.Thriving", "Thriving"),
      label: "Thriving",
      key: "thrivingPercent",
      color: colorMap["Thriving"],
    },
    {
      name: t("common:assessment.Safe", "Safe"),
      label: "Safe",
      key: "safePercent",
      color: colorMap["Safe"],
    },
    {
      name: t("common:assessment.Vulnerable", "Vulnerable"),
      label: "Vulnerable",
      key: "vulnerablePercent",
      color: colorMap["Vulnerable"],
    },
    {
      name: t("common:assessment.In-crisis", "In crisis"),
      label: "In-crisis",
      key: "inCrisisPercent",
      color: colorMap["In crisis"],
    },
  ];

  const OnBarHoverComponent = (popperData) => {
    return (
      <>
        <SmallText value={popperData.longLabel} />
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
          {popperData.familyCount} {t("common:common.Families")} |{" "}
          {popperData.childCount} {t("common:common.Children")}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {t("common:common.Average Thrive Scale Scores")}:{" "}
          {popperData.percentage}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {popperData.categories.map((category, index) => {
            const isHighlighted =
              category.name === popperData.hoveredCategory.name;

            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  opacity: isHighlighted ? 1 : 0.7,
                  fontWeight: isHighlighted ? 600 : 400,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 4,
                    backgroundColor: category.color,
                    borderRadius: 0.5,
                  }}
                />
                <SmallText
                  fontWeight={isHighlighted ? 600 : 500}
                  value={`${category.value}% ${t(
                    `common:assessment.${category.label}`,
                    category.label
                  )}`}
                />
              </Box>
            );
          })}
        </Box>
      </>
    );
  };
const reversedCategories = useMemo(() => [...defaultCategories].reverse(), [defaultCategories]);

  return (
    <BarChartGraph
      loading={loading}
      data={chartData}
      categories={reversedCategories}
      hoverComponent={OnBarHoverComponent}
      title={t(
        "common:govtDashboard.Average Thrive Scale scores by assessment (all time)",
        "Average Thrive Scale scores by assessment (all time)"
      )}
      subTitle={t(
        "common:govtDashboard.All active and closed families and children",
        "All active and closed families and children"
      )}
      apiError={apiError}
      onReload={fetchAverageThriveScaleScoresData}
    />
  );
};

export default AverageThriveScaleScores;
