import React from "react";
import BodyText from "../../../../../components/BodyText/BodyText";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from "@mui/material";
import SecondaryButton from "../../../../../components/SecondaryButton/SecondaryButton";

const DeleteReasons = [
  {
    id: 1,
    label: "This is “test” or “fake” data",
  },
  {
    id: 2,
    label: "This is a duplicate",
  },
  {
    id: 3,
    label:
      "Consent has been explicitly withdrawn by the data owner(s) or a representative thereof",
  },
  {
    id: 4,
    label:
      "This data has been inactive beyond the applicable retention period as defined by governing policy or law",
  },
  {
    id: 5,
    label: "None of these are true",
  },
];
const DeleteChild = ({ close }) => {
  const { t } = useTranslation(["common"]);

  return (
    <>
      <BodyText
        value={t(
          "common:infoCard.Deleting a child removes profile data and any associated records, when possible.",
          "Deleting a child removes profile data and any associated records, when possible.",
        )}
        sx={{ py: 2 }}
      />
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">
          <BodyText
            value={t(
              "common:infoCard.Due to data retention policies, a child should be deleted ONLY IF (select one ):",
              "Due to data retention policies, a child should be deleted ONLY IF (select one ):",
            )}
          />
        </FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
        >
          {DeleteReasons.map((reason) => (
            <FormControlLabel
              key={reason.id}
              value={reason.id}
              control={<Radio />}
              label={reason.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <BodyText
        value={t(
          "common:infoCard.If none of these reasons are true, please close the child’s case instead.",
          "If none of these reasons are true, please close the child’s case instead.",
        )}
        sx={{ py: 2 }}
      />
      <BodyText
        value={t(
          "common:infoCard.Deleting a child is permanent and cannot be undone.",
          "Deleting a child is permanent and cannot be undone.",
        )}
        sx={{ py: 2 }}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SecondaryButton
            label={t("common:common.No, Cancel", "No, Cancel")}
            fullWidth
            onClick={close}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ backgroundColor: "#BC1041" }}
          >
            {t("common:common.Yes, delete", "Yes, delete child")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default DeleteChild;
