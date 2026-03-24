import React from "react";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import UploadIcon from "../../../../assets/icons/Upload";

const ReportExportButton = ({ handleExport, isExportDisabled }) => {
  const { t } = useTranslation(["common"]);
  return (
    <Box>
      <Button
        color="primary"
        startIcon={<UploadIcon fontSize="small" />}
        sx={{ m: 2 }}
        onClick={handleExport}
        disabled={isExportDisabled}
      >
        {t("common:common.Export")}
      </Button>
    </Box>
  );
};

export default ReportExportButton;
