import React, { useState, useEffect, useContext } from "react";
import ReusableTrendTable from "../../GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
import SmallText from "../../../../components/SmallText/SmallText";
import { Typography, Box, Divider, Paper, Fade, Popper } from "@mui/material";
import { MoodImageMapping } from "../../Components/StateGovDashboardComponents/MoodImageMapping";
import { getNavbarFilterPayload } from "../../../../constants";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";
const colorMap = {
  Thriving: "#71C5D4",
  Safe: "#C5D86D",
  Vulnerable: "#F37123",
  "In crisis": "#BC1041",
};

const MilestoneRatingsTrendByAssessment = ({ setSummaryMilestones }) => {
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperData, setPopperData] = useState(null);
  const [open, setOpen] = useState(false);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
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
  const handleSegmentHover = (
    event,
    barData,
    categoryData,
    segmentIndex,
    row
  ) => {
    setAnchorEl(event.currentTarget);
    setPopperData({
      ...barData,
      hoveredCategory: categoryData,
      assessmentNumber: row.assessmentNumber,
      familyCount: row.familyCount,
      childCount: row.childCount,
    });
    setHoveredSegment(`${segmentIndex}-${row.assessmentNumber}`);
    setOpen(true);
  };
  const handleSegmentLeave = () => {
    setOpen(false);
    setAnchorEl(null);
    setPopperData(null);
    setHoveredSegment(null);
  };

  const columnDefinition = [
    {
      id: "assessmentNumber",
      label: "Assessment #",
      enableSorting: true,
      minWidth: 100,
      render: (_, value) => <SmallText value={`Assessment ${value}`} />,
    },
    {
      id: "mode",
      label: "Mode",
      maxWidth: 80,
      minWidth: 80,
      // enableSorting: true,
      render: (row) => (
        <img
          src={MoodImageMapping[row.mode.toUpperCase()]}
          style={{ width: 30, height: 30 }}
        />
      ),
    },
    {
      id: "ratings",
      label: "Ratings",
      // enableSorting: true,
      minWidth: 500,
      // minWidth: "1000px",
      render: (row, barData) => (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              height: 40,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              position: "relative",
            }}
          >
            {barData.categories.map((category, catIndex) => {
              const segmentId = `${catIndex}-${row.assessmentNumber}`;
              const isHovered = hoveredSegment === segmentId;

              return (
                <Box
                  key={catIndex}
                  data-testid="bar-segment"
                  onMouseEnter={(e) =>
                    handleSegmentHover(e, barData, category, catIndex, row)
                  }
                  onMouseLeave={handleSegmentLeave}
                  sx={{
                    backgroundColor: category.color,
                    width: `${category.value}%`,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: isHovered ? "scaleY(1.08)" : "scaleY(1)",
                    filter: isHovered ? "brightness(1.1)" : "brightness(1)",
                    boxShadow: isHovered
                      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                      : "none",
                    zIndex: isHovered ? 10 : 1,
                    position: "relative",
                    "&:hover": {
                      transform: "scaleY(1.08)",
                      filter: "brightness(1.1)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                      zIndex: 10,
                    },
                  }}
                >
                </Box>
              );
            })}
          </Box>
          {/* Hover Tooltip */}
          <Popper
            open={open}
            anchorEl={anchorEl}
            placement="top"
            transition
            sx={{ zIndex: 1300 }}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={200}>
                <Paper
                  sx={{
                    p: 2,
                    minWidth: 200,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    border: "1px solid #D6DBDE",
                    borderRadius: 1,
                  }}
                >
                  {popperData && OnBarHoverComponent(popperData)}
                </Paper>
              </Fade>
            )}
          </Popper>
        </>
      ),
    },
    {
      id: "averageMilestoneScorePercent",
      label: "Average score",
      minWidth: 100,
      enableSorting: true,
      render: (row, value) => <SmallText value={`${value}%`} />,
    },
  ];

  const [tableData, setTableData] = useState(null);

  const fetchTableData = async (params = {}) => {
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
      milestoneNameFilter: decryptedId,
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      const response = await APIS.GetMilestoneRatingsTrendByAssessment(payload);
      let data = response.data;
      if (Array.isArray(data?.data)) {
        data.data = data.data.map((item) => ({
          ...item,
          ratings: {
            categories: defaultCategories.map((cat) => ({
              ...cat,
              value: item[cat.key] || 0,
            })),
          },
        }));
        if (data.data.length === 1) {
          setSummaryMilestones([data.data[0]]);
        } else if (data.data.length >= 2) {
          setSummaryMilestones([data.data[0], data.data[data.data.length - 1]]);
        }
      }

      setTableData(data);
      setApiError(null);
    } catch (err) {
      setApiError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchTableData();
  };
  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) fetchTableData();
  }, [localStorage.getItem("userRegion"), signedinOrgType]);

  const OnBarHoverComponent = (popperData) => {
    return (
      <>
        <SmallText value={`Assessment ${popperData.assessmentNumber}`} />
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
          {popperData.familyCount} {t("common:common.Families")} |{" "}
          {popperData.childCount} {t("common:common.Children")}
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
  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title="Milestone ratings trend by assessment (all time)"
      subheader="Ratings for this milestone for all families and children"
      tableData={tableData?.data || []}
      skeltonRowcount={5}
      loading={loading}
      apiError={apiError}
      enablePagination={false}
      enableSorting={true}
      t={t}
      onReload={handleReload}
    />
  );
};

export default MilestoneRatingsTrendByAssessment;
