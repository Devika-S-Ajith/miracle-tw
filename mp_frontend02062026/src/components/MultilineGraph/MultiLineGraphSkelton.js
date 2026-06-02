import React from "react";
import { Box, Paper, Skeleton, useTheme } from "@mui/material";

// Sample demo data lines with steeper vertical variation
const demoCurvePaths = [
  "M10 650 C250 100, 350 450, 800 180",
  "M50 320 C150 370, 400 80, 800 140",
  "M50 200 C150 130, 400 370, 800 260",
];

// Skeleton curve lines with steeper vertical variation
const skeletonCurvePaths = [
  "M50 700 C150 150, 350 550, 800 130",
  "M50 250 C150 320, 400 130, 800 180",
  "M50 300 C150 380, 400 170, 800 290",
];

const LineGraphSkeleton = () => {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: 400,
          p: 3,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Legend skeletons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            mb: 3,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 2,
                  borderRadius: 1,
                  bgcolor: "grey.300",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              <Skeleton
                variant="rounded"
                width={48}
                height={12}
                animation="pulse"
              />
            </Box>
          ))}
        </Box>

        {/* Chart container */}
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          {/* Curved skeleton lines (background) */}
          {skeletonCurvePaths.map((d, i) => (
            <svg
              key={i}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
            >
              <path
                d={d}
                stroke={theme.palette.grey[300]}
                strokeWidth="3"
                fill="none"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </svg>
          ))}

          {/* Sample graph lines (foreground, neutral gray, not animated) */}
          {demoCurvePaths.map((d, i) => (
            <svg
              key={`demo_${i}`}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
            >
              <path
                d={d}
                stroke={theme.palette.grey[400]}
                strokeWidth="3"
                fill="none"
                opacity={0.7}
              />
            </svg>
          ))}

          {/* X-axis line */}
          <Box
            sx={{
              position: "absolute",
              bottom: 32,
              left: 0,
              width: "100%",
              height: "1px",
              bgcolor: "grey.400",
            }}
          />

          {/* X-axis label skeletons */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              px: 2,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={32}
                height={16}
                animation="pulse"
              />
            ))}
          </Box>
        </Box>
      </Paper>
      {/* Pulse animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LineGraphSkeleton;
