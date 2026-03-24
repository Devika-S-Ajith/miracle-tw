import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PlusIcon from "../../../assets/icons/Plus";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  convertUnderscoreToText,
} from "../../../constants";
import TimeRangePicker from "../../../components/TimeRangePicker";
import DateTimeRangePicker from "../../../components/DateTimeRangePicker";
import SubHeading from "../../../components/SubHeading";
import { useParams } from "react-router";

const MessageFrequency = ["ONCE", "ONCE_A_DAY", "ON_EVERY_LOGIN"];

const PopupMessageDetails = ({ form }) => {
  const { t } = useTranslation(["common"]);
  const { id } = useParams();

  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    form;
  useEffect(() => {
    if (
      !["ONCE", "ONCE_A_DAY", "ON_EVERY_LOGIN"].includes(
        values?.messageFrequency
      )
    )
      setFieldValue("messageFrequency", "ONCE");
  }, [values?.messageFrequency]);
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <SubHeading
        value={t("common:system messages.Available actions (Optional)")}
      />

      <Typography variant="subtitle1">
        {t("common:system messages.Available actions description")}
      </Typography>
      <Box>
        {!values?.addActionEnabled ? (
          <Button
            id="add-action"
            startIcon={<PlusIcon fontSize="small" />}
            sx={{ borderRadius: "4px", height: "48px" }}
            variant="outlined"
            onClick={() => {
              setFieldValue("addActionEnabled", true);
            }}
          >
            {t("common:system messages.Add action")}
          </Button>
        ) : (
          <Box display="flex" gap={2}>
            <TextField
              id="button-label"
              error={Boolean(touched?.buttonLabel && errors?.buttonLabel)}
              helperText={
                <Box display="flex" justifyContent="space-between">
                  {touched?.buttonLabel && errors?.buttonLabel}
                  <Box display="flex" justifyContent="end" flexGrow={1}>
                    <Typography fontSize="0.75rem">
                      {values?.buttonLabel?.trim()?.length}/20
                    </Typography>
                  </Box>
                </Box>
              }
              label={t("common:system messages.Button label")}
              name="buttonLabel"
              onBlur={handleBlur}
              onChange={handleChange}
              required
              value={values?.buttonLabel}
              variant="outlined"
              // {...getFieldProps("firstName")}
            />
            <TextField
              id="url"
              error={Boolean(touched?.buttonUrl && errors?.buttonUrl)}
              required
              fullWidth
              helperText={touched?.buttonUrl && errors?.buttonUrl}
              label={t("URL")}
              name="buttonUrl"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values?.buttonUrl}
              variant="outlined"
            />
            <DeleteIcon
              sx={{ marginTop: 1.5 }}
              onClick={() => setFieldValue("addActionEnabled", false)}
            />
          </Box>
        )}
      </Box>

      <Divider variant="middle" sx={{ my: 2 }} />

      <FormControl component="fieldset">
        <FormLabel id="message-type">
          <SubHeading
            value={t(
              "common:system messages.How often should this message be shown?"
            )}
          />
        </FormLabel>
        <RadioGroup
          aria-labelledby="message-frequency"
          name="radio-buttons-group"
          // sx={{ gap: 3 }}
          onChange={handleChange}
          defaultValue={"ONCE"}
          value={values?.messageFrequency}
        >
          {MessageFrequency.map((msg) => (
            <FormControlLabel
              value={msg}
              control={<Radio />}
              sx={{ alignItems: "start", my: "10px" }}
              name="messageFrequency"
              label={
                <Box display="flex" flexDirection="column" mt gap={1}>
                  <Typography variant="subtitle1">
                    {convertUnderscoreToText(msg)}
                  </Typography>
                  {values?.messageFrequency === msg && (
                    <DateTimeRangePicker
                      disableStartDate={
                        id && values?.messageStatus !== "DRAFT" ? true : false
                      }
                      {...form}
                    />
                  )}
                  {/* <TimeRangePicker /> */}
                </Box>
              }
            />
          ))}
          {/* <FormControlLabel
            value="ONCE"
            control={<Radio />}
            sx={{ alignItems: "start" }}
            name="messageFrequency"
            label={
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1">Once</Typography>
                <DateTimeRangePicker />
              </Box>
            }
          />
          <FormControlLabel
            value="ONCE_A_DAY"
            control={<Radio />}
            sx={{ alignItems: "start" }}
            label={
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1">Once a day</Typography>
                <DateTimeRangePicker />
              </Box>
            }
          />
          <FormControlLabel
            value="ON_EVERY_LOGIN"
            control={<Radio />}
            sx={{ alignItems: "start" }}
            label={
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1">On every login</Typography>
                <DateTimeRangePicker />
              </Box>
            }
          /> */}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default PopupMessageDetails;
