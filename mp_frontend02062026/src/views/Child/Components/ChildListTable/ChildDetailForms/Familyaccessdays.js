import React, { useState } from "react";
import { Box, TextField, MenuItem, Select, Typography } from "@mui/material";
import BodyText from "../../../../../components/BodyText/BodyText";

const FamilyAccessDays = ({ value, onChange, disabled = false }) => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            <BodyText
                value="Family can access child's records for an additional"
            />

            <Select
                value={value ?? 0}
                onChange={(e) => onChange?.(e.target.value)}
                size="small"
                disabled={disabled}
                sx={{
                    width: 80,
                    backgroundColor: "#FFFFFF",
                }}
            >
                <MenuItem value={0}>0</MenuItem>
                {days.map((d) => (
                    <MenuItem key={d} value={d}>
                        {d}
                    </MenuItem>
                ))}
            </Select>

            <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                days
            </Typography>
        </Box>
    );
};

export default FamilyAccessDays;