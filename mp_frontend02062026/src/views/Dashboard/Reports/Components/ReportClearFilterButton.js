import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";

const ReportClearFilterButton = ({ clearFilters }) => {
  const { t } = useTranslation(["common"]);
  return (
    <Button
      color="primary"
      sx={{ height: 56 }}
      variant="contained"
      onClick={clearFilters}
    >
      {t("common:common.Clear Filters")}
    </Button>
  );
};

export default ReportClearFilterButton;
