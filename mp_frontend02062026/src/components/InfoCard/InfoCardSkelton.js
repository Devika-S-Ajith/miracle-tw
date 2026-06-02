import React from "react";
import { Box, Divider, Skeleton } from "@mui/material";

const InfoCardSkeleton = ({ rows = 4 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <Box key={index}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                        }}
                    >
                        <Skeleton variant="text" width={150} height={24} />
                        <Skeleton variant="text" width={60} height={24} />
                    </Box>
                    <Divider />
                </Box>
            ))}
        </>
    );
};

export default InfoCardSkeleton;