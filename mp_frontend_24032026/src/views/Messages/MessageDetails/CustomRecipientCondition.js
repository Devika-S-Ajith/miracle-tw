import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { convertUnderscoreToText } from "../../../constants";
import BodyText from "../../../components/BodyText/BodyText";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const CustomRecipientCondition = ({
  label,
  subLabel,
  options = [],
  data,
  onConditionChange,
  onValueChange,
  allSelectShowText,
  condition,
  error,
  helperText,
}) => {
  const [isAllSelected, setAllSelected] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (options?.length - 2 === data?.length) {
      setAllSelected(true);
    }
  }, [options, data]);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="subtitle1">{label}</Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Autocomplete
          id={`condition`}
          value={condition === "IS" ? "IS" : "IS_NOT"}
          disableClearable
          options={["IS", "IS_NOT"]}
          getOptionLabel={(option) => convertUnderscoreToText(option)}
          isOptionEqualToValue={(option, value) => {
            return Object.is(JSON.stringify(option), JSON.stringify(value));
          }}
          sx={{ minWidth: 100 }}
          onChange={(_, newValue) => onConditionChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={"Condition"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderWidth: condition ? "1.5px" : undefined,
                    borderColor: condition ? "#34475D" : undefined,
                  },
                  "&:hover fieldset": {
                    borderWidth: condition ? "1.5px" : undefined,
                    // borderColor: condition ? "#34475D" : undefined,
                  },
                  "&.Mui-focused fieldset": {
                    borderWidth: condition ? "1.5px" : undefined,
                    // borderColor: condition ? "#34475D" : undefined,
                  },
                },
              }}
              // required
              // error={touched?.eventType && Boolean(errors?.eventType)}
              // helperText={touched?.eventType && errors?.eventType}
            />
          )}
        />
        <Autocomplete
          sx={{ width: 500 }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiple
          id="event-participants"
          options={options}
          clearIcon={false}
          limitTags={2}
          disableCloseOnSelect
          getOptionLabel={(option) => option.label}
          value={data}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(event, newValue) => {
            if (newValue.some((obj) => obj.id === -1)) {
              setAllSelected(true);
              onValueChange(
                options?.filter((obj) => obj.id !== -1 && obj.id !== -2)
              );
              return;
            } else if (newValue.some((obj) => obj.id === -2)) {
              setAllSelected(false);
              onValueChange([]);
              return;
            } else {
              setAllSelected(false);
              onValueChange(newValue);
            }
          }}
          renderTags={(value, getTagProps) => {
            const displayedTags = isFocused ? value : value.slice(0, 2);
            const remainingCount = value.length - 2;
            return (
              <Box display="flex" gap={1} flexDirection="row" flexWrap="wrap">
                {isAllSelected ? (
                  <BodyText value={allSelectShowText} fontSize="0.875rem" />
                ) : (
                  // <> {allSelectShowText}</>
                  <>
                    {displayedTags.map((obj) => (
                      <Chip
                        color="primary"
                        key={obj.id}
                        label={obj.label}
                        size="medium"
                        sx={{
                          backgroundColor: "#1D334B",
                          borderRadius: "16px",
                        }}
                        onDelete={() => {
                          onValueChange(
                            data?.filter((option) => obj.id !== option?.id)
                          );
                        }}
                        deleteIcon={
                          <CloseIcon
                            style={{
                              fontSize: "17px",
                            }}
                          />
                        }
                      ></Chip>
                    ))}
                    {!isFocused && remainingCount > 0 && (
                      <Chip
                        label={`+${remainingCount}`}
                        color="primary"
                        size="medium"
                        sx={{
                          backgroundColor: "#1D334B",
                          borderRadius: "16px",
                          margin: "0px !important",
                        }}
                        deleteIcon={
                          <CloseIcon
                            style={{
                              fontSize: "17px",
                            }}
                          />
                        }
                        {...getTagProps({ index: 2 })}
                      />
                    )}
                  </>
                )}
              </Box>
            );
          }}
          renderOption={(props, option, { selected }) => {
            if (option.id < 0) {
              if (option.id === -1 && data?.length === options?.length - 2)
                return;
              if (option.id === -2 && !data?.length) return;
              return <li {...props}>{option.label}</li>;
            }
            return (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />

                {option.label}
              </li>
            );
          }}
          renderInput={(params) => {
            const inputProps = {
              ...params.InputProps,
            };

            return (
              <TextField
                {...params}
                sx={{
                  width: 1,

                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderWidth: data?.length ? "1.5px" : undefined,
                      borderColor: data?.length ? "#34475D" : undefined,
                    },
                    "&:hover fieldset": {
                      borderWidth: data?.length ? "1.5px" : undefined,
                      // borderColor: data?.length ? "#34475D" : undefined,
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: data?.length ? "1.5px" : undefined,
                      // borderColor: data?.length ? "#34475D" : undefined,
                    },
                  },
                }}
                error={error}
                helperText={helperText}
                textFieldProps={{
                  fullWidth: true,
                  borderRadius: "0px",
                  margin: "normal",
                  variant: "outlined",
                }}
                label={subLabel}
                variant="outlined"
                InputProps={inputProps}
                required={true}
              />
            );
          }}
        />
      </Box>
    </Box>
  );
};

export default CustomRecipientCondition;
