import React, { useContext, useMemo } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import BarChartGraph from "../../../../components/Barchart/Barchart";
import BodyText from "../../../../components/BodyText/BodyText";

const colorMap = {
  Improvement: "#71C5D4",
};

const FamilyAssessmentScoreIncrease = () => {
  const { t } = useTranslation(["common"]);
  const [chartData, setChartData] = useState(null);
  const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [apiError, setApiError] = useState(null);
  const userRegion = localStorage.getItem("userRegion");

  useEffect(() => {
    UpdateDashboardDataViews()
    if (userRegion) {
      fetchAverageThriveScaleScoresData();
    }
  }, [navbarFilterValues, id, userRegion]);

  const fetchAverageThriveScaleScoresData = async () => {
    setLoading(true);
    setApiError(null);
    const payload =
      getNavbarFilterPayload(navbarFilterValues, linkedAccounts) || {};
    if (id) {
      payload.accountFilter = [id];
    }
    if (payload.countryFilter === null || payload.countryFilter === undefined) {
      setLoading(false); // ensure loading is set to false if early return
      return;
    }
    try {
      const response = await APIS.GetFamilyAssessmentScoreImprovements(payload);
      const averageThriveScaleScoresRawData = response.data.data || [];
      const transformedData = averageThriveScaleScoresRawData.map(
        (item, idx) => ({
          label: item?.improvementcategory,
          barHeightValue: item?.familycount,
          activefamilycount: item?.activefamilycount,
          inactivefamilycount: item?.inactivefamilycount,
          primaryBarIndicator: item?.familycount,
          categories: defaultCategories.map((cat) => ({
            ...cat,
            value: item?.familycount,
          })),
        })
      );
      setChartData(transformedData);
    } catch (err) {
      setApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Define categories as a default object above
  const defaultCategories = [
    {
      label: "Improvement",
      key: "improvementPercent",
      color: colorMap["Improvement"],
    },
  ];

  const OnBarHoverComponent = (popperData) => {
    return (
      <>
        <BodyText value={`${popperData.activefamilycount} Active families`} />
        <BodyText value={`${popperData.inactivefamilycount} Inactive families`} />
      </>
    );
  };
  const reversedCategories = useMemo(
    () => [...defaultCategories].reverse(),
    [defaultCategories]
  );

  return (
    <BarChartGraph
      loading={loading}
      data={chartData}
      categories={reversedCategories}
      hoverComponent={OnBarHoverComponent}
      title={t(
        "common:govtDashboard.Family assessment score increases",
        "Family assessment score increases"
      )}
      subTitle={t(
        "common:govtDashboard.All active and inactive families with at least 2 assessments",
        "All active and inactive families with at least 2 assessments"
      )}
      apiError={apiError}
      onReload={fetchAverageThriveScaleScoresData}
      hoverTransform={false}
      showLegend={false}
      tooltipPlacement="top"
    />
  );
};

export default FamilyAssessmentScoreIncrease;
