import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Popper,
  Paper,
  Fade,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import Heading from "../Heading";
import SmallText from "../SmallText/SmallText";
import BarChartSkeleton from "./BarchartSkelton";
import { useTranslation } from "react-i18next";
import ErrorWithReload from "../../views/Dashboard/GovtDashboardOverview/Components/ErrorWithReload";

const BarChartGraph = ({
  title,
  subTitle,
  data,
  categories,
  hoverComponent,
  loading = true,
  onReload = () => {},
  apiError = false,
  hoverTransform = true,
  showLegend = true,
  tooltipPlacement = "left",
}) => {
  const { t } = useTranslation(["common"]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperData, setPopperData] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [open, setOpen] = useState(false);

  const handleSegmentHover = (
    event,
    barData,
    categoryData,
    barIndex,
    segmentIndex
  ) => {
    setAnchorEl(event.currentTarget);
    setPopperData({ ...barData, hoveredCategory: categoryData });
    setHoveredSegment(`${barIndex}-${segmentIndex}`);
    setOpen(true);
  };

  const handleSegmentLeave = () => {
    setOpen(false);
    setAnchorEl(null);
    setPopperData(null);
    setHoveredSegment(null);
  };

  const maxHeight =
    Array.isArray(data) && data.length > 0
      ? Math.max(...data.map((d) => d?.barHeightValue ?? 0))
      : 0;
  const chartHeight = 300;

  return (
    <Card
      elevation={0}
      sx={{
        // maxWidth: 600,
        height: "100%",
        width: "100%",
        // background: "rgba(255, 255, 255, 0.95)",
        // backdropFilter: "blur(10px)",
        borderRadius: 1,
        // boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        border: "1px solid #D6DBDE",
        margin: "auto",
        // mt: 4
      }}
    >
      <CardContent
        sx={{ p: 2, position: "relative", minHeight: 350, height: "100%" }}
      >
        <Box display="flex" flexDirection="column" mb>
          <Heading heading={title} />
          <SmallText value={subTitle} />
        </Box>
        <Divider sx={{ borderBottomWidth: 2, mb: 1, mt: 2 }} />

        {apiError ? (
          <Box
            sx={{
              py: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <ErrorWithReload
              onReload={() => onReload()} // Pass the onReload function to handle reload
            />
          </Box>
        ) : loading ? (
          <BarChartSkeleton bars={6} height={chartHeight} />
        ) : (
          <>
            {!loading && data?.length === 0 ? (
              <Box
                height={chartHeight}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SmallText
                  color="text.secondary"
                  value={t(
                    "common:common.Sorry, we couldn't find any results",
                    "Sorry, we couldn't find any results"
                  )}
                />
              </Box>
            ) : (
              <>
                {showLegend && (
                  <Grid container spacing={2} mt>
                    {categories.map((category) => (
                      <Grid
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        item
                        key={category.name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          minHeight: 24, // Ensure enough height for indicator
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 16,
                            width: 16,
                            height: 16,
                            backgroundColor: category.color,
                            flexShrink: 0,
                            mr: 1, // Add right margin for spacing
                            boxShadow: "0 0 0 1px #fff", // Add white outline for visibility
                          }}
                        />
                        <SmallText
                          value={category.name}
                          title={category.name}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 120, // Limit legend text width
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Box
                  sx={{
                    position: "relative",
                    height: chartHeight,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    borderBottom: `2px solid #b1a6a6ff`,
                    mb: 6,
                    mx: { xs: 1, sm: 2, md: 2, lg: 2 }, // Responsive horizontal margin
                  }}
                >
                  {data?.map((barData, barIndex) => {
                    const barHeight =
                      (barData.barHeightValue / maxHeight) * (chartHeight - 80);

                    // Calculate responsive bar width based on number of bars
                    const minBarWidth = 28;
                    const maxBarWidth = 60;
                    const barCount = data.length;
                    // Clamp width between min and max
                    const barWidth = Math.max(
                      minBarWidth,
                      Math.min(maxBarWidth, Math.floor(320 / barCount))
                    );

                    // Determine font size based on number of bars
                    let fontSize = "1rem";
                    if (barCount > 10) fontSize = "0.7rem";
                    else if (barCount > 7) fontSize = "0.85rem";
                    else if (barCount > 4) fontSize = "0.95rem";

                    return (
                      <Box
                        key={barIndex}
                        sx={{
                          width: barWidth,
                          height: barHeight,
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: -20,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 2,
                            height: 20,
                            backgroundColor: "#b1a6a6ff",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: barData.secondaryBarIndicator?.length > 0 ? -40 : -25,
                            left: "50%",
                            transform: "translateX(-50%)",
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          <SmallText
                            value={barData.primaryBarIndicator}
                            fontSize={fontSize}
                          />
                          {barData.secondaryBarIndicator?.length > 0 && (
                            <SmallText
                              value={barData?.secondaryBarIndicator}
                              fontSize={fontSize}
                            />
                          )}
                        </Box>

                        {barData.categories.map((category, catIndex) => {
                          const categoryHeight =
                            (category.value / barData.barHeightValue) *
                            barHeight;
                          const segmentId = `${barIndex}-${catIndex}`;
                          const isHovered = hoveredSegment === segmentId;

                          return (
                            <Box
                              key={catIndex}
                              data-testid="bar-segment"
                              onMouseEnter={(e) =>
                                handleSegmentHover(
                                  e,
                                  barData,
                                  category,
                                  barIndex,
                                  catIndex
                                )
                              }
                              onMouseLeave={handleSegmentLeave}
                              sx={{
                                backgroundColor: category.color,
                                height: `${categoryHeight}px`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 600,
                                fontSize: 12,
                                // borderBottom:
                                //   catIndex < barData.categories.length - 1
                                //     ? "1px solid rgba(255, 255, 255, 0.3)"
                                //     : "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                transform:
                                  isHovered && hoverTransform
                                    ? "scale(1.05)"
                                    : "scale(1)",
                                filter: isHovered
                                  ? "brightness(1.1)"
                                  : "brightness(1)",
                                boxShadow:
                                  isHovered && hoverTransform
                                    ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                                    : "none",
                                zIndex: isHovered && hoverTransform ? 10 : 1,
                                position: "relative",
                                "&:hover": hoverTransform
                                  ? {
                                      transform: "scale(1.05)",
                                      filter: "brightness(1.1)",
                                      boxShadow:
                                        "0 4px 12px rgba(0, 0, 0, 0.3)",
                                      zIndex: 10,
                                    }
                                  : {},
                              }}
                            >
                              {/* Show value on hover for larger segments */}
                              {isHovered && categoryHeight > 25 && (
                                <Typography
                                  sx={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#000",
                                  }}
                                >
                                  {category.value}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}

                  {/* X-Axis Labels */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -40,
                      left: 0,
                      right: 0,
                      height: 40,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-around",
                    }}
                  >
                    {data?.map((barData, index) => {
                      // Calculate barWidth for each label
                      const minBarWidth = 28;
                      const maxBarWidth = 60;
                      const barCount = data.length;
                      const barWidth = Math.max(
                        minBarWidth,
                        Math.min(maxBarWidth, Math.floor(320 / barCount))
                      );

                      return (
                        <Tooltip key={index} title={barData.label}>
                          <SmallText
                            key={index}
                            value={barData.label}
                            fontSize={{
                              xs: "0.65rem",
                              sm: "0.70rem",
                              md: "0.75rem",
                              lg: "1rem",
                            }}
                            sx={{
                              width: barWidth,
                              maxWidth: barWidth,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>

                {/* Hover Tooltip */}
                {hoverComponent && (
                  <Popper
                    open={open}
                    anchorEl={anchorEl}
                    placement={tooltipPlacement}
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
                          {popperData && hoverComponent(popperData)}
                        </Paper>
                      </Fade>
                    )}
                  </Popper>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartGraph;
