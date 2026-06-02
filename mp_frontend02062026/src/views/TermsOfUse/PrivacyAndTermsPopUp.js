import React from "react";
import { Box, Button, Typography } from "@mui/material";
var __htmlTerms = require("./terms.html");
var templateTerms = { __html: __htmlTerms };
var __htmlPrivacy = require("../PrivacyPolicy/policy.html")
var templatePrivacy = { __html: __htmlPrivacy };

const PrivacyAndTermsPopUp = ({ onClose, PageId,title }) => {
    return (
        <>
            <Box
                sx={{
                    margin: "auto",
                    maxWidth: "283px",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <img
                    alt="Miracle Foundation Logo"
                    src="/static/login_logo.png"
                    style={{
                        width: "50%",
                    }}
                />
            </Box>
            <Typography color="#000" variant="h6">{title}</Typography>
            <Box
                sx={{
                    border: '1px solid #ccc',
                    padding: '16px',
                    height: '50vh',
                    overflowY: 'auto',
                    my: "10px",
                }}
            >
                <Typography variant="body1">
                    <span dangerouslySetInnerHTML={PageId === 'TOF' ? templateTerms : templatePrivacy} />
                </Typography>
            </Box>
            <Button
                variant="contained"
                style={{ borderRadius: 8 }}
                fullWidth
                size="large"
                onClick={() => {
                    onClose();
                }}
            >
                Return to ThriveWell
            </Button>

        </>
    );
};

export default PrivacyAndTermsPopUp;