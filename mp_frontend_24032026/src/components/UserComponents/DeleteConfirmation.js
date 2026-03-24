import React, { useState } from "react";
import { Typography, Button, Grid, Box, TextField } from "@mui/material";
import AutoCompleteDropdownToFilter from "./AutoCompleteDropdownToFilter";

const DeleteConfirmation = ({
    t,
    type = "family",
    deleteReason,
    handleConfirmDelete,
    close,
}) => {

    const [reason, setReason] = useState(null)
    const [otherReason, setOtherReason] = useState('')

    const handleConfirm = () => {
        handleConfirmDelete(reason, otherReason); // Pass updated reason when confirming delete
    };

    const handleReasonChange = (value) => {
        setReason(value)
        setOtherReason('')
    }

    const handleChangeOtherReason = (e) => {
        setOtherReason(e?.target?.value)
    }

    const content = {
        family: {
            title: t("common:family.deleteConfimationtitle"),
            warning: t(
                "common:family.deleteConfimationwarning"
            ),
            confirmMessage: t("common:family.deleteConfimationconfirmMessage"),
            buttonText: t("common:family.deleteConfimationbuttonText"),
        },
        child: {
            title: t("common:child.deleteConfimationtitle"),
            warning: t(
                "common:child.deleteConfimationwarning"
            ),
            confirmMessage: t("common:child.deleteConfimationconfirmMessage"),
            buttonText: t("common:child.deleteConfimationbuttonText"),
        },
    };

    return (
        <Box width="100%">
            {/* Title */}
            <Typography variant="body1" gutterBottom>
                {content[type].title}
            </Typography>

            {/* Reason Dropdown */}
            <AutoCompleteDropdownToFilter
                name="deleteReason"
                getValueFunction={(value) => handleReasonChange(value)}
                accessKey="reason"
                required={true}
                options={deleteReason || []}
                textFieldProps={{
                    fullWidth: true,
                    margin: "normal",
                    variant: "outlined",
                    label: t("common:family.deleteReason"),
                }}
            />
            {(
                (type == 'family' && reason == 12) ||
                (type == 'child' && reason == 6)
            ) && (
                <TextField
                    fullWidth
                    label={t("common:family.specifyReason")}
                    name="OtherReason"
                    onChange={(e) => {
                        if (e.target.value.length <= 500) {
                            handleChangeOtherReason(e);
                        }
                    }}
                    value={otherReason}
                    variant="outlined"
                    required
                    error={otherReason.length > 500}
                    helperText={
                        otherReason.length > 500
                            ? t("common:family.max255Chars")
                            : `${otherReason.length}/500`
                    }
                    inputProps={{ maxLength: 501 }}
                />
            )}
            
            <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                {content[type].warning}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
                {content[type].confirmMessage}
            </Typography>

            {/* Buttons */}
            <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={6}>
                    <Button
                        onClick={close}
                        color="primary"
                        variant="outlined"
                        fullWidth
                    >
                        {t("common:common.Cancel")}
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        onClick={handleConfirm}
                        color="primary"
                        disabled={!(reason) || (((type == 'family' && reason == 12)|| (type == 'child' && reason == 6) ) && !otherReason)}
                        variant="contained"
                        fullWidth
                    >
                        {content[type].buttonText}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DeleteConfirmation;
