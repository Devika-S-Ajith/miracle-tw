import { Box, Button, Tabs, Tab, Typography } from "@mui/material";
import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "./PreviewMessage.css";
import DummyPreviewWeb from "./dummyPreviewWeb";
import DummyPreviewMobile from "./dummyPreviewMobile";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import {
    convertUnderscoreToText,
    DateTimeFormatStringNumaric,
    toSentenceCase,
} from "../../../constants";

const CustomTab = styled(Tab)(({ theme }) => ({
    backgroundColor: "white",
    color: "#535F66",
    textTransform: "capitalize",
    fontSize: '18px',
    fontWeight: 600,
    "&.Mui-selected": {
        backgroundColor: "#FEF1E9",
        color: "#1D334B",
        "&.Mui-selected": {
            fontSize: '18px',
            fontWeight: 700,
            backgroundColor: "#FEF1E9",
            color: "#1D334B",
            "&.Mui-selected": {
                backgroundColor: "#FEF1E9",
                color: "#1D334B",
            },
            textTransform: 'capitalize'
        }
    }
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box
                    sx={{
                        display: "flex",
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 3,
                    }}
                >
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    };
}

const HtmlContent = ({ html }) => {
    return (
        <div className="reset-padding" dangerouslySetInnerHTML={{ __html: html }} />
    );
};

const PreviewMessage = ({
    setActiveStepperIndex,
    messageData,
    onSubmit,
    cancelClickHandler,
    draftId,
}) => {
    const { t } = useTranslation(["common"]);
    const theme = useTheme();
    const { id } = useParams();
    const [value, setValue] = React.useState(0);
    const { organizationList, roleListHT, roleListFS, locationList } =
        useContext(CommonDataContext);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const RenderList = (list, idArray, key) => {
        if (idArray.length) {
            return list
                ?.filter((item) => idArray?.includes(item.id)) // Step 1: Filter by ID
                ?.map((item) => item[key]) // Step 2: Extract the names
                ?.join(", ");
        } else {
            return key === "countryName"
                ? "Any location"
                : "Send to all organizations";
        }
    };

    const RenderRoleList = (roleHT, roleFS, roleArray, key) => {
        if (roleArray?.HTUserRoleId?.length || roleArray?.FSUserRoleId?.length) {
            const listOfHTRoles = roleHT
                ?.filter(
                    (item) =>
                        roleArray?.HTUserRoleId?.includes(item.id)
                ) // Step 1: Filter by IDs from both arrays
                ?.map((item) => {
                    // Step 2: Determine which array the ID belongs to
                    return `${item[key]} (Thrive scale)`;
                })
                ?.join(", ");

            const listOfFSRoles = roleFS
                ?.filter(
                    (item) =>
                        roleArray?.FSUserRoleId?.includes(item.id)
                ) // Step 1: Filter by IDs from both arrays
                ?.map((item) => {
                    // Step 2: Determine which array the ID belongs to
                    return `${item[key]} (Foster Share)`;
                })
                ?.join(", ");

            // Combine the two lists, handling cases where one or both might be empty
            const combinedRoles = [listOfHTRoles, listOfFSRoles]
                .filter(Boolean) // Remove any empty strings
                .join(", "); // Join with a comma and space

            return combinedRoles;

        }
        if (!roleArray?.HTUserRoleId?.length && !roleArray?.FSUserRoleId?.length)
            return "Any user role";
    };

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Typography fontWeight={700} lineHeight="25px" fontSize="20px" mt={6} mb={3}>
                    Message Preview
                </Typography>
                <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
                    <AppBar position="static" sx={{ overflow: "hidden" }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor="primary"
                            textColor="#1D334B"
                            variant="fullWidth"
                            aria-label="full width tabs example"
                        >
                            {(["WEB", "WEB_AND_MOBILE"].includes(messageData?.receipientMatchingConditions?.viewingFrom) || !messageData?.receipientMatchingConditions?.viewingFrom?.length) && <CustomTab label="Web" {...a11yProps(0)} />}
                            {(["MOBILE", "WEB_AND_MOBILE"].includes(messageData?.receipientMatchingConditions?.viewingFrom) || !messageData?.receipientMatchingConditions?.viewingFrom?.length) && <CustomTab label="Mobile" {...a11yProps(1)} />}
                        </Tabs>
                    </AppBar>
                    <SwipeableViews
                        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                        index={["MOBILE"].includes(messageData?.receipientMatchingConditions?.viewingFrom) ? 1 : value}
                        onChangeIndex={handleChangeIndex}
                    >
                        <TabPanel value={value} index={0} dir={theme.direction}>
                            {messageData?.messageType == 1 ? (
                                <Box
                                    sx={{
                                        border: "1px solid #919BA5",
                                        padding: 2,
                                        backgroundColor: "#919BA5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    width="100%"
                                    height="450px"
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: "white",
                                            borderRadius: "6px",
                                            padding: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            overflowY: "scroll",
                                        }}
                                        width="400px"
                                        maxHeight="350px"
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ alignSelf: "flex-start", mb: 2 }}
                                        >
                                            {messageData?.messageSubject}
                                        </Typography>
                                        <Box
                                            sx={{
                                                overflowWrap:
                                                    "break-word" /* Ensures long words break properly */,
                                                hyphens:
                                                    "auto" /* Automatically adds hyphens where necessary */,
                                            }}
                                        >
                                            <HtmlContent html={messageData?.messageContent} />
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                paddingTop: 2,
                                                gap: 2,
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                sx={{ width: 1 }}
                                            >
                                                Close
                                            </Button>
                                            {messageData?.addActionEnabled && (
                                                <Button
                                                    id="darft"
                                                    sx={{ borderRadius: "4px", width: 1 }}
                                                    variant="contained"
                                                    onClick={() => {
                                                        window.open(messageData?.buttonUrl, "_blank");
                                                    }}
                                                >
                                                    {messageData?.buttonLabel}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <DummyPreviewWeb
                                    content={
                                        <div
                                            style={{
                                                marginBottom: "20px",
                                                boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.20)",
                                                border: "1px solid #FADE56",
                                                borderRadius: "10px",
                                                padding: "4px",
                                                backgroundColor: "#FADE56",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    overflowWrap:
                                                        "break-word" /* Ensures long words break properly */,
                                                    hyphens:
                                                        "auto" /* Automatically adds hyphens where necessary */,
                                                }}
                                            >
                                                <HtmlContent html={messageData?.messageContent} />
                                            </Box>
                                        </div>
                                    }
                                />
                            )}
                        </TabPanel>
                        <TabPanel value={["MOBILE"].includes(messageData?.receipientMatchingConditions?.viewingFrom) ? 1 : value} index={1} dir={theme.direction}>
                            {messageData?.messageType == 1 ? (
                                <Box
                                    sx={{
                                        border: "1px solid #919BA5",
                                        backgroundImage: `url('/static/mobile.png')`,
                                        padding: 2,
                                        backgroundSize: "cover",
                                        backgroundRepeat: "no-repeat", // Ensure the image covers the entire area
                                        backgroundPosition: "cover", // Adjust this according to your image positioning preferences
                                        backgroundAttachment: "fixed",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            backdropFilter: "drop-shadow(4px 4px 10px blue)",
                                            backgroundColor: "rgba(128, 128, 128, 0.8)",
                                            // Adjust the blur radius as needed
                                            zIndex: 1,
                                            borderRadius: "inherit",
                                        },
                                        "& > *": {
                                            position: "relative",
                                            zIndex: 2,
                                        },
                                    }}
                                    width="300px"
                                    height="630px"
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: "white",
                                            borderRadius: "6px",
                                            padding: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            width: "280px",
                                            maxHeight: "350px", // Set the fixed height
                                            //overflowX: "auto", // Enable vertical scroll
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ alignSelf: "flex-start", mb: 2 }}
                                        >
                                            {messageData?.messageSubject}
                                        </Typography>
                                        <Box
                                            sx={{
                                                overflowWrap:
                                                    "break-word" /* Ensures long words break properly */,
                                                hyphens:
                                                    "auto" /* Automatically adds hyphens where necessary */,
                                            }}
                                        >
                                            <HtmlContent html={messageData?.messageContent} />
                                        </Box>

                                        <Box display="flex" flexDirection="column" gap={2}>
                                            {messageData?.addActionEnabled && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        marginTop: "auto", // Push to the bottom
                                                    }}
                                                >
                                                    <Button
                                                        sx={{ width: 1, mt: 2 }}
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            window.open(messageData?.buttonUrl, "_blank");
                                                        }}
                                                    >
                                                        {messageData?.buttonLabel}
                                                    </Button>
                                                </Box>
                                            )}

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    marginTop: "auto", // Push to the bottom
                                                }}
                                            >
                                                <Button
                                                    variant="text"
                                                    color="primary"
                                                    sx={{ width: 1 }}
                                                >
                                                    Close
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <DummyPreviewMobile
                                    content={
                                        <div
                                            style={{
                                                marginBottom: "20px",
                                                boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.20)",
                                                border: "1px solid #FADE56",
                                                borderRadius: "10px",
                                                padding: "4px",
                                                backgroundColor: "#FADE56",
                                            }}
                                        >
                                            <HtmlContent html={messageData?.messageContent} />
                                        </div>
                                    }
                                />
                            )}
                        </TabPanel>
                    </SwipeableViews>
                    <Box>
                        <hr style={{ margin: 0 }}></hr>
                        <Typography py={3} variant="h6">
                            Schedule:
                        </Typography>
                        <Typography variant="subtitle1">
                            Message will be shown:
                        </Typography>
                        <Typography pt={3} variant="subtitle1">
                            Start:{DateTimeFormatStringNumaric(messageData?.startsAt)} Local
                            time
                        </Typography>
                        <Typography pt={3} variant="subtitle1">
                            End:{DateTimeFormatStringNumaric(messageData?.endsAt)} Local time
                        </Typography>
                        {messageData?.messageFrequency == "ON_CERTAIN_DAYS" && (
                            <Typography pt={3} variant="subtitle1">
                                Reapeating:{" "}
                                {messageData?.messageFreqAdditionalInfo
                                    ?.map((day) => convertUnderscoreToText(day))
                                    ?.join(", ")}
                            </Typography>
                        )}
                        <Typography pt={3} variant="h6">
                            Recipient(s):
                        </Typography>
                        <Typography pt={3} variant="subtitle1">
                            {messageData?.receipientType == "CUSTOM"
                                ? "Custom:"
                                : "All users from all organization"}
                        </Typography>
                        {messageData?.receipientType == "CUSTOM" && (
                            <>
                                <Typography pt={3} variant="subtitle1">
                                    Organization's location{" "}
                                    {Object.keys(
                                        messageData?.receipientMatchingConditions?.accountCountry ||
                                        {}
                                    ) == "is"
                                        ? "is"
                                        : "is not"}
                                    :
                                    {RenderList(
                                        locationList,
                                        messageData?.receipientMatchingConditions?.accountCountry[
                                        Object.keys(
                                            messageData?.receipientMatchingConditions
                                                ?.accountCountry
                                        )
                                        ],
                                        "countryName"
                                    )}
                                </Typography>
                                <Typography pt={3} variant="subtitle1">
                                    Organization name{" "}
                                    {Object.keys(
                                        messageData?.receipientMatchingConditions?.account || {}
                                    ) == "is"
                                        ? "is"
                                        : "is not"}
                                    :
                                    {RenderList(
                                        organizationList,
                                        messageData?.receipientMatchingConditions?.account[
                                        Object.keys(
                                            messageData?.receipientMatchingConditions?.account
                                        )
                                        ],
                                        "accountName"
                                    )}
                                </Typography>
                                <Typography pt={3} variant="subtitle1">
                                    User is viewing from:
                                    {toSentenceCase(
                                        messageData?.receipientMatchingConditions?.viewingFrom
                                    )}
                                </Typography>
                                <Typography pt={3} variant="subtitle1">
                                    User role{" "}
                                    {Object.keys(
                                        messageData?.receipientMatchingConditions?.userRole || {}
                                    ) == "is"
                                        ? "is"
                                        : "is not"}
                                    :
                                    {RenderRoleList(
                                        roleListHT, roleListFS,
                                        messageData?.receipientMatchingConditions?.userRole[
                                        Object.keys(
                                            messageData?.receipientMatchingConditions?.userRole
                                        )
                                        ],
                                        "role"
                                    )}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
                <hr
                    style={{
                        marginInline: "-24px",
                        marginTop: "32px",
                        marginBottom: "24px",
                    }}
                ></hr>
                <Box display="flex" justifyContent="space-between" gap={3}>
                    <Button
                        id="cancel"
                        sx={{ borderRadius: "4px", height: "48px", color: 'black' }}
                        variant="text"
                        onClick={() => {
                            cancelClickHandler();
                        }}
                    >
                        {t("common:common.Cancel")}
                    </Button>
                    <Box display="flex" justifyContent="end" gap={3}>
                        <Button
                            id="draft"
                            startIcon={<ArrowLeftIcon />}
                            sx={{ borderRadius: "4px", height: "48px", color: 'black', borderColor: 'black' }}
                            variant="outlined"
                            onClick={() => {
                                setActiveStepperIndex(1);
                            }}
                        >
                            {t("common:system messages.Previous Recipients")}
                        </Button>
                        <Button
                            id="darft"
                            sx={{ borderRadius: "4px", height: "48px", color: 'black', borderColor: 'black' }}
                            variant="outlined"
                            onClick={() => {
                                onSubmit("DRAFT", null);
                            }}
                        >
                            {t("common:system messages.Save draft")}
                        </Button>
                        <Button
                            id="add recipients"
                            endIcon={<ArrowRightIcon />}
                            sx={{ borderRadius: "4px" }}
                            variant="contained"
                            onClick={() => {
                                onSubmit("ACTIVE");
                            }}
                        >
                            {id || draftId ? "Update message" : "Create message"}
                        </Button>
                    </Box>
                </Box>
            </LocalizationProvider >
        </>
    );
};

export default PreviewMessage;
