import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import PopoverBox from "../UserComponents/PopoverBox";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
const CustomToolbar = ({
  title,
  toolBarExtra,
  doSearch,
  isFilterActive,
  CustomFilterPanel,
  clearFilter,
  hideSearchField,
  searchValue,
}) => {
  const [searchValueText, setSearchValueText] = useState("");
  ////////////General Search Controlling States ////////////
  const debouncedHandleSearch = useDebouncedCallback(
    // function
    (value) => {
      doSearch(value);
    },
    800
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();

      if (inputValue.length === 1 || inputValue.length === 2) {
        // Do something for string length 1 or 2
        doSearch(inputValue);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        // justifyContent: "space-between",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      {title && <Typography>{title}</Typography>}
      <Box
        // flexGrow={1}
        sx={{
          display: "flex",
          // justifyContent: hideSearchField ? "end" : "space-between",
          flexWrap: "wrap",

          alignItems: "center",
          gap: 1,
        }}
      >
        {!hideSearchField && (
          <Box>
            <TextField
              id="table-search"
              value={searchValueText}
              InputProps={{
                sx: {
                  height: "48px",
                  borderRadius: 1,
                  width: "21.875rem",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchValue && (
                      <CloseIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          setSearchValueText("");
                          debouncedHandleSearch("");
                        }}
                      />
                    )}
                  </InputAdornment>
                ),
              }}
              placeholder="Search"
              onChange={(e) => {
                if (e.target.value?.trim()?.length > 2) {
                  setSearchValueText(e.target.value);
                  debouncedHandleSearch(e.target.value);
                } else if (e.target.value?.trim()?.length === 0) {
                  setSearchValueText("");

                  debouncedHandleSearch("");
                } else {
                  setSearchValueText(e.target.value);
                }
              }}
              onKeyDown={handleKeyPress} // Handle "Enter" key press
            />
          </Box>
        )}
        <Box>
          {
            /***************** FILTER BOX *********************/
            typeof CustomFilterPanel === "function" && (
              <PopoverBox
                button={
                  <>
                    {/* <FilterListIcon /> */}
                    <IconButton>
                      <img
                        alt="fiter_user"
                        src="/static/icons/filterIcon.svg"
                        width={20}
                        height={17}
                        style={{ alignSelf: "center" }}
                      />
                      {isFilterActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#1D334B", // Change color as needed
                          }}
                        ></div>
                      )}
                    </IconButton>
                  </>
                }
                content={CustomFilterPanel}
              />
            )
          }
        </Box>
        {toolBarExtra && <Box>{toolBarExtra}</Box>}
      </Box>
    </Box>
  );
};
export default CustomToolbar;
