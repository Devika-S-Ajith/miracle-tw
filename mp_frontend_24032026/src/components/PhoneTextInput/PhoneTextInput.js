import "react-international-phone/style.css";

import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";
import { useTranslation } from "react-i18next";
import CustomFieldLabel from "../../views/TWFamily/ManageFamily/Components/CustomFieldLabel";
import { Box } from "@mui/system";

export const PhoneTextInput = ({
  value,
  onChange,
  defaultCountry = "in",
  phoneRef,
  required = false,
  showAttachedLabel = true,
  ...restProps
}) => {
  const { t } = useTranslation(["common"]);

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: defaultCountry,
      value,
      countries: defaultCountries,
      forceDialCode: true,
      onChange: (data) => {
        onChange(data.phone);
      },
    });

  // Update country when defaultCountry prop changes
  useEffect(() => {
    if (defaultCountry && country.iso2 !== defaultCountry) {
      setCountry(defaultCountry);
    }
  }, [defaultCountry]);

  useEffect(() => {
    if (phoneRef) {
      phoneRef.current = country;
    }
  }, [country]);

  return (
    <Box sx={{ width: "100%" }}>
      {!showAttachedLabel && (
        <Box sx={{ marginBottom: 1 }}>
          <CustomFieldLabel>
            {required
              ? `${t("common:common.Phone Number")}*`
              : t("common:common.Phone Number")}
          </CustomFieldLabel>
        </Box>
      )}
      <TextField
        fullWidth
        variant="outlined"
        label={
          showAttachedLabel
            ? required
              ? `${t("common:common.Phone Number")} *`
              : t("common:common.Phone Number")
            : ""
        }
        color="primary"
        placeholder={
          showAttachedLabel
            ? required
              ? `${t("common:common.Phone Number")} *`
              : t("common:common.Phone Number")
            : ""
        }
        value={inputValue}
        onChange={handlePhoneValueChange}
        type="tel"
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
              style={{ marginRight: "2px", marginLeft: "-8px" }}
            >
              <Select
                MenuProps={{
                  style: {
                    height: "300px",
                    width: "360px",
                    top: "10px",
                    left: "-34px",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
                sx={{
                  width: "max-content",
                  // Remove default outline (display only on focus)
                  fieldset: {
                    display: "none",
                  },
                  '&.Mui-focused:has(div[aria-expanded="false"])': {
                    fieldset: {
                      display: "block",
                    },
                  },
                  // Update default spacing
                  ".MuiSelect-select": {
                    padding: "8px",
                    paddingRight: "24px !important",
                  },
                  svg: {
                    right: 0,
                  },
                }}
                value={country.iso2}
                onChange={(e) => {
                  setCountry(e.target.value);
                }}
                renderValue={(value) => (
                  <FlagImage iso2={value} style={{ display: "flex" }} />
                )}
              >
                {defaultCountries.map((c) => {
                  const country = parseCountry(c);
                  return (
                    <MenuItem key={country.iso2} value={country.iso2}>
                      <FlagImage
                        iso2={country.iso2}
                        style={{ marginRight: "8px" }}
                      />
                      <Typography marginRight="8px">{country.name}</Typography>
                      <Typography color="gray">+{country.dialCode}</Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </InputAdornment>
          ),
        }}
        {...restProps}
      />
    </Box>
  );
};
