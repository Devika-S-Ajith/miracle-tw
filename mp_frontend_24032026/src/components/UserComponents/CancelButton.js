import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CancelButton = ({ isSubmitting,onClick ,variant = "outlined" }) => {
  const { t } = useTranslation(["common"]);

  return (
    <Button

      disabled={isSubmitting}
      type="button"
      onClick={onClick}
      variant="outlined"
    >
      {t("common:common.Cancel")}
    </Button>
  );
};

export default CancelButton;