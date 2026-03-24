import { TextField } from "@mui/material";
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

let InactiveMessage = "",
  SuccessMessage = "",
  ErrorMessage = "";

const DeactivateAccount = (props) => {
  const { t } = useTranslation(["common"]);
  const { handleChangeReason } = props;
  const [reason, setReason] = useState(null);
  const reasonRef = useRef("");

  const handleChange = (value) => {
    setReason(value);
    handleChangeReason(value);
    reasonRef.current = value;
  };

  useEffect(() => {
    InactiveMessage = t("common:organization.Inactive Reassign");
    SuccessMessage = t(
      "common:warnings.Organization Status Updated Successfully"
    );
    ErrorMessage = t("common:common.Something went wrong");
  }, []);
  return (
    <TextField
      id="deactivate-description"
      sx={{ marginBottom: 2 }}
      InputProps={{ sx: { borderRadius: 1 / 8 } }}
      fullWidth
      onChange={(e) => handleChange(e.target.value)}
      placeholder={t(
        "common:common.Why are you deactivating this organization? (Optional)"
      )}
      multiline
      value={reason}
      rows={4}
      variant="outlined"
    />
  );
};

export default DeactivateAccount;
