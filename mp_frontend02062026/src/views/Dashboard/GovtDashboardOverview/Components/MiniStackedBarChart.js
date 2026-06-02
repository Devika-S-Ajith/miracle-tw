import { Box, Popover, Typography, Divider } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const colorMap = {
  total: "#FFFFFF",
  inCrisis: "#A61C3C",
  vulnerable: "#FFB600",
};

const MiniStackedBarChart = ({ assessments }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { t } = useTranslation(["common"]);

  const handleMouseEnter = (event, idx) => {
    setAnchorEl(event.currentTarget);
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredIdx(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.75 }}>
      {assessments.map(({ inCrisis = 0, vulnerable = 0, total = 1 }, idx) => {
        const redRatio = inCrisis / total;
        const yellowRatio = vulnerable / total;

        return (
          <Box
            key={idx}
            sx={{
              width: 60,
              height: 40,
              display: "flex",
              flexDirection: "column-reverse",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => handleMouseEnter(e, idx)}
            onMouseLeave={handleMouseLeave}
          >
            <Box
              data-testid="red-segment"
              sx={{
                height: `${redRatio * 100}%`,
                backgroundColor: colorMap.inCrisis,
                width: "100%",
              }}
            />
            <Box
              data-testid="yellow-segment"
              sx={{
                height: `${yellowRatio * 100}%`,
                backgroundColor: colorMap.vulnerable,
                width: "100%",
              }}
            />
          </Box>
        );
      })}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleMouseLeave}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{ pointerEvents: "none" }}
        disableRestoreFocus
      >
        {hoveredIdx !== null && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: -1 }}>
              {t("common:common.Assessment", "Assessment") + ` ${hoveredIdx + 1}`}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t("common:tableColumn.Average # of red flags / possible red flags", "Average # of red flags / possible red flags")}: {(
                (assessments[hoveredIdx].inCrisis +
                  assessments[hoveredIdx].vulnerable) /
                assessments[hoveredIdx].cases
              ).toFixed(2)} / {assessments[hoveredIdx].totalRedFlagCount}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: colorMap.inCrisis,
                  display: "inline-block",
                  borderRadius: "2px",
                }}
              />
              <b>
                {`${(
                  assessments[hoveredIdx].inCrisis /
                  assessments[hoveredIdx].cases
                ).toFixed(2)} / ${assessments[hoveredIdx].totalRedFlagCount}`}
              </b>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: colorMap.vulnerable,
                  display: "inline-block",
                  borderRadius: "2px",
                }}
              />
              <b>
                {`${(
                  assessments[hoveredIdx].vulnerable /
                  assessments[hoveredIdx].cases
                ).toFixed(2)} / ${assessments[hoveredIdx].totalRedFlagCount}`}
              </b>
            </Typography>
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default MiniStackedBarChart;
