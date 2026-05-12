import { Box, Skeleton } from "@mui/material";
import React from "react";

const DashboardSkelton = ({ isWeb }) => {
  const WebSkelton = (
    <>
      {/* Sample Menu Skeleton */}
      <Box sx={{ px: 2, py: 1 }}>
        {[1, 2, 3].map((item) => (
          <>
            <Box
              key={item}
              sx={{ display: "flex", alignItems: "center", mb: 2 }}
            >
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ mr: 2, bgcolor: "#2c425c" }}
              />
              <Skeleton
                variant="rectangular"
                width="80%"
                height={16}
                sx={{ borderRadius: 1, bgcolor: "#2c425c" }}
              />
            </Box>
          </>
        ))}
      </Box>
      <Box sx={{ px: 2, py: 1 }}>
        <Box mb={2}>
          <Skeleton
            variant="rectangular"
            height={16}
            sx={{ borderRadius: 1, bgcolor: "#2c425c" }}
          />
        </Box>
        {[1, 2, 3].map((item) => (
          <>
            <Box
              key={item}
              sx={{ display: "flex", alignItems: "center", mb: 2 }}
            >
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ mr: 2, bgcolor: "#2c425c" }}
              />
              <Skeleton
                variant="rectangular"
                width="80%"
                height={16}
                sx={{ borderRadius: 1, bgcolor: "#2c425c" }}
              />
            </Box>
          </>
        ))}
      </Box>
    </>
  );
  const MobileSkelton = (
    <>
      {/* Sample Menu Skeleton */}
      <Box sx={{ px: 2, py: 1 }}>
        {[1, 2, 3].map((item) => (
          <>
            <Box
              key={item}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                justifyContent: "center",
              }}
            >
              <Skeleton
                variant="rectangular"
                width={20}
                height={20}
                sx={{ borderRadius: 1, bgcolor: "#2c425c" }}
              />
            </Box>
          </>
        ))}
      </Box>
      <Box sx={{ px: 2, py: 1 }}>
        <Box mb={2}>
          <Skeleton
            variant="rectangular"
            height={16}
            sx={{ borderRadius: 1, bgcolor: "#2c425c" }}
          />
        </Box>
        {[1, 2, 3].map((item) => (
          <>
            <Box
              key={item}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                justifyContent: "center",
              }}
            >
              <Skeleton
                variant="rectangular"
                width={20}
                height={20}
                sx={{ borderRadius: 1, bgcolor: "#2c425c" }}
              />
            </Box>
          </>
        ))}
      </Box>
    </>
  );

  return <>{isWeb ? WebSkelton : MobileSkelton}</>;
};

export default DashboardSkelton;
