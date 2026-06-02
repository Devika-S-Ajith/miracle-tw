import React from "react";
import { Box, Divider, Skeleton } from "@mui/material";

const OrganizationAppliedSkeleton = ({ rows = 5 }) => (
    <Box
        display="flex"
        flexDirection="column"
        sx={{
            height: {
                xs: 250,   // mobile
                sm: 350,   // small screens
            },
            overflowY: "auto",
            pr: 2,
            py: 1,
        }}
    >
        {Array.from({ length: rows }).map((_, index) => (
            <React.Fragment key={index}>
                <Skeleton
                    variant="text"
                    width="60%"
                    height={32}
                    sx={{ bgcolor: "#f5f5f5", mb: 1 }}
                />
                <Divider sx={{ my: 2 }} />
            </React.Fragment>
        ))}
    </Box>
);

export default OrganizationAppliedSkeleton;