import { useState, useEffect, useContext } from "react";
import { Typography, Box } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import CommonCard from "../../../../components/CommonCard/CommonCard";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { getNavbarFilterPayload } from "../../../../constants";

const BAR_MIN_WIDTH = 60;
const BAR_GAP = 16;
const MAX_BAR_HEIGHT = 140;

const scrollWrapperStyle = {
  overflowX: "auto",
  padding: "0 24px",
  WebkitOverflowScrolling: "touch",
  display: "flex",
  justifyContent: "center",
};

const chartInnerStyle = (dataLength) => ({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "stretch",
  position: "relative",
  paddingBottom: "8px",
  minWidth: dataLength * (BAR_MIN_WIDTH + BAR_GAP) - BAR_GAP,
});

const barsRowStyle = {
  display: "flex",
  alignItems: "flex-end",
  gap: `${BAR_GAP}px`,
  paddingTop: "8px",
  position: "relative",
};

const baselineContainerStyle = {
  position: "relative",
  marginTop: "4px",
};

const baselineStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: -15,
  height: "1px",
  backgroundColor: "#D6DBDE",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#374151",
  whiteSpace: "nowrap",
  display: "inline-block",
};

const valueLabelStyle = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "4px",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const tickStyle = {
  width: "1px",
  height: "10px",
  backgroundColor: "#374151",
};

const FamilyAssessmentChart = ({ loading = false }) => {
  const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
  const [apiData, setApiData] = useState([]);
  const [apiLoading, setApiLoading] = useState(loading);

  useEffect(() => {
    setApiLoading(true);
    
    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
    };
    APIS.GetFamilyAssessmentScoreImprovements(payload)
      .then((res) => {
        if (res?.data) {
          setApiData(
            Array.isArray(res.data.data)
              ? res.data.data.map((item) => ({
                  label: item.improvementcategory || "",
                  value: Number(item.familycount) || 0,
                  activefamilycount: Number(item.activefamilycount) || 0,
                  inactivefamilycount: Number(item.inactivefamilycount) || 0,
                }))
              : []
          );
        }
      })
      .catch(() => {
        setApiData([]);
      })
      .finally(() => setApiLoading(false));
  }, [navbarFilterValues, linkedAccounts]);

  const data = Array.isArray(apiData) ? apiData : [];

  const maxValue = Math.max(...data.map((item) => item.value));

  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [open, setOpen] = useState(false);

  const handleBarHover = (event, item) => {
    setAnchorEl(event.currentTarget);
    setHoveredBar(item);
    setOpen(true);
  };

  const handleBarLeave = () => {
    setOpen(false);
    setAnchorEl(null);
    setHoveredBar(null);
  };

  return (
    <CommonCard
      title="Family assessment score increases"
      subtitle="All active and inactive families with at least 2 assessments"
    >
      <div style={{ position: "relative" }}>
      {apiLoading ? (
        <div
          style={scrollWrapperStyle}
          aria-label="Family assessment score increases chart"
        >
          <div style={chartInnerStyle(7)}>
            <div style={barsRowStyle}>
              {[...Array(7)].map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: "0 0 auto",
                    minWidth: BAR_MIN_WIDTH,
                    position: "relative",
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={32}
                    height={18}
                    sx={{ mb: "4px" }}
                    data-testid="skeleton-text"
                  />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={MAX_BAR_HEIGHT}
                    sx={{ borderRadius: "4px" }}
                    data-testid="skeleton-rect"
                  />
                  <div style={tickStyle} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : data.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={180}
        >
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      ) : (
        <div
          style={scrollWrapperStyle}
          aria-label="Family assessment score increases chart"
        >
          <div style={chartInnerStyle(data.length)}>
            {/* Bars, value labels, and ticks */}
            <div style={barsRowStyle}>
              {data.map((item, idx) => {
                const relativeHeight = (item.value / maxValue) * MAX_BAR_HEIGHT;
                const barHeight = Math.max(relativeHeight, 30);

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: "0 0 auto",
                      minWidth: BAR_MIN_WIDTH,
                      position: "relative",
                    }}
                    aria-label={`${item.label}: ${item.value}`}
                  >
                    <div style={valueLabelStyle}>{item.value}</div>
                    <div
                      style={{
                        width: "100%",
                        height: `${barHeight}px`,
                        backgroundColor: "#71C5D4",
                        position: "relative",
                        flexShrink: 0,
                        cursor: "pointer",
                      }}
                      role="img"
                      aria-label={`bar for ${item.label} with value ${item.value}`}
                      onMouseEnter={(e) => handleBarHover(e, item)}
                      onMouseLeave={handleBarLeave}
                    />
                    <div style={tickStyle} />
                  </div>
                );
              })}
            </div>

            {/* Tooltip Popper */}
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
                      minWidth: 120,
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                      border: "1px solid #D6DBDE",
                      borderRadius: 1,
                    }}
                  >
                    {hoveredBar && (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {hoveredBar.activefamilycount} active families
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {hoveredBar.inactivefamilycount} inactive families
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Fade>
              )}
            </Popper>

            {/* Baseline */}
            <div style={baselineContainerStyle} aria-hidden="true">
              <div style={baselineStyle} />
            </div>

            {/* Labels */}
            <div
              style={{
                display: "flex",
                gap: `${BAR_GAP}px`,
                marginTop: "8px",
              }}
            >
              {data.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: "0 0 auto",
                    minWidth: BAR_MIN_WIDTH,
                    textAlign: "center",
                  }}
                >
                  <span style={labelStyle}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </CommonCard>
  );
};

export default FamilyAssessmentChart;
