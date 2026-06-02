import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import SubHeading from "../../../components/SubHeading";
const FilterPopover = ({ handleClose }) => {
  const { t } = useTranslation(["common"]);

  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const {
    setNavbarFilterValues,
    navbarFilterValues,
    countryListForSidenav,
    linkedAccounts,
  } = useContext(CommonDataContext);
  const [stateFilter, setStateFilter] = useState([]);
  const [regionFilter, setRegionFilter] = useState([]);
  const [zipcodeFilter, setZipcodeFilter] = useState([]);
  const [regionOptions, setRegionOptions] = useState(
    countryListForSidenav?.find(
      (obj) => obj.countryId == localStorage.getItem("userRegion")
    )?.districts || []
  );
  const [regionOptionsLimit, setRegionOptionsLimit] = useState(10);
  const [stateOptionsLimit, setStateOptionsLimit] = useState(10);
  const [localFilterValues, setLocalFilterValues] = useState([]);
  const [zipCodeOptions, setZipCodeOptions] = useState(
    () =>
      countryListForSidenav?.find(
        (obj) => obj.countryId == localStorage.getItem("userRegion")
      )?.zipcodes || []
  );
  const [zipcodeOptionsLimit, setZipcodeOptionsLimit] = useState(10);

  // Sync dropdown values from navbarFilterValues on mount or when navbarFilterValues changes
  useEffect(() => {
    // Extract state, region, and zipcode filters from navbarFilterValues
    const stateFilters = navbarFilterValues.filter((f) => f.key === "STATE");
    const regionFilters = navbarFilterValues.filter((f) => f.key === "REGION");
    const zipcodeFilters = navbarFilterValues.filter(
      (f) => f.key === "ZIPCODE"
    );

    // Get all states, regions, zipcodes, and organizations from countryListForSidenav
    const allOrganizations = linkedAccounts || [];

    // Set selectedOrganization from navbarFilterValues (ORG)
    const orgFilters = navbarFilterValues.filter((f) => f.key === "ORG");
    if (orgFilters.length > 0) {
      const selectedOrgs = allOrganizations.filter((org) =>
        orgFilters.some((f) => f.id === org.accountId)
      );
      setSelectedOrganization(selectedOrgs);
    } else {
      setSelectedOrganization([]);
    }
    const countryData =
      countryListForSidenav.find(
        (obj) => obj.countryId == localStorage.getItem("userRegion")
      ) || {};
    const allStates = countryData.states || [];
    const allRegions = countryData.districts || [];
    const allZipcodes = countryData.zipcodes || [];

    // Set stateFilter
    if (stateFilters.length > 0) {
      const selectedStates = allStates.filter((state) =>
        stateFilters.some((f) => f.id === state.stateId)
      );
      setStateFilter(selectedStates);
    } else {
      setStateFilter([]);
    }

    // Set regionFilter
    if (regionFilters.length > 0) {
      const selectedRegions = allRegions.filter((region) =>
        regionFilters.some((f) => f.id === region.districtId)
      );
      setRegionFilter(selectedRegions);
      setRegionOptions(allRegions);
    } else {
      setRegionFilter([]);
      setRegionOptions(allRegions);
    }

    // Set zipcodeFilter
    if (zipcodeFilters.length > 0) {
      const selectedZipcodes = allZipcodes.filter((zipcode) =>
        zipcodeFilters.some((f) => f.id === zipcode.id)
      );
      setZipcodeFilter(selectedZipcodes);
      setZipCodeOptions(allZipcodes);
    } else {
      setZipcodeFilter([]);
      setZipCodeOptions(allZipcodes);
    }

    // Set localFilterValues to match navbarFilterValues (except ORG)
    setLocalFilterValues(navbarFilterValues);
  }, [navbarFilterValues, countryListForSidenav]);

  // State filter: update local state only
  const handleStateChange = (event, newValue) => {
    setStateFilter(newValue);
    const updatedFilterValue =
      newValue?.map((obj) => ({
        value: obj?.stateName,
        id: obj?.stateId,
        label: "State",
        key: "STATE",
      })) || [];
    setLocalFilterValues((prev) => [
      ...prev.filter((f) => f.key !== "STATE"),
      ...updatedFilterValue,
    ]);
  };

  // Accounts filter: update local state only
  const handleAccountsChange = (event, newValue) => {
    setSelectedOrganization(newValue);
    const updatedFilterValue =
      newValue?.map((org) => ({
        value: org?.accountName,
        id: org?.accountId,
        label: "Organization",
        key: "ORG",
      })) || [];
    setLocalFilterValues((prev) => [
      ...prev.filter((f) => f.key !== "ORG"),
      ...updatedFilterValue,
    ]);
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") == 1) {
      // If no state is selected, use default regions from countryListForSidenav
      if (!stateFilter || stateFilter.length === 0) {
        const defaultRegions =
          countryListForSidenav.find(
            (obj) => obj.countryId == localStorage.getItem("userRegion")
          )?.districts || [];
        setRegionOptions(defaultRegions);
        // Do not clear regionFilter here, let user keep selection if possible
      } else {
        // Filter regionOptions to only include districts belonging to selected states
        const selectedStateIds = stateFilter.map((state) => state.stateId);
        const filteredRegions =
          countryListForSidenav
            .find((obj) => obj.countryId == localStorage.getItem("userRegion"))
            ?.districts.filter((district) =>
              selectedStateIds.includes(district.stateId)
            ) || [];
        setRegionOptions(filteredRegions);
        // Remove region selections that are not in the new options
        setRegionFilter((prev) =>
          prev.filter((region) =>
            filteredRegions.some((d) => d.districtId === region.districtId)
          )
        );
      }
    }
  }, [stateFilter, countryListForSidenav]);

  // Region filter: update local state only
  const handleRegionChange = (_, newValue) => {
    setRegionFilter(newValue);
    const updatedFilterValue = [];
    if (newValue?.length) {
      newValue.forEach((obj) => {
        updatedFilterValue.push({
          value: obj?.districtName,
          stateId: obj?.stateId,
          id: obj?.districtId,
          label: "Region",
          key: "REGION",
        });
      });
    }
    // Do NOT setZipcodeFilter here; let zipcodeFilter be managed by zipcodeChangeHandler and useEffect
    setLocalFilterValues((prev) => [
      ...prev.filter((f) => f.key !== "REGION"),
      ...updatedFilterValue,
    ]);
  };

  useEffect(() => {
    // Filter zipCodeOptions based on selected state and/or region
    let filteredZipcodes = [];

    // Get all zipcodes for the country
    const allZipcodes =
      countryListForSidenav.find(
        (obj) => obj.countryId == localStorage.getItem("userRegion")
      )?.zipcodes || [];

    if (stateFilter && stateFilter.length > 0) {
      let zipcodes = [];
      stateFilter.forEach((state) => {
        // Find regions selected for this state
        const regionsForState = regionFilter.filter(
          (region) => region.stateId === state.stateId
        );
        if (regionsForState.length > 0) {
          // If regions selected for this state, only include zipcodes for those regions
          const selectedDistrictIds = regionsForState.map(
            (region) => region.districtId
          );
          zipcodes = zipcodes.concat(
            allZipcodes.filter(
              (z) =>
                z.stateId === state.stateId &&
                selectedDistrictIds.includes(z.districtId)
            )
          );
        } else {
          // If no regions selected for this state, include all zipcodes for the state
          zipcodes = zipcodes.concat(
            allZipcodes.filter((z) => z.stateId === state.stateId)
          );
        }
      });
      filteredZipcodes = zipcodes;
    } else if (regionFilter && regionFilter.length > 0) {
      // No state selected, but regions are selected
      const selectedDistrictIds = regionFilter.map(
        (region) => region.districtId
      );
      filteredZipcodes = allZipcodes.filter((z) =>
        selectedDistrictIds.includes(z.districtId)
      );
    } else {
      // No state or region selected, show all zipcodes
      filteredZipcodes = allZipcodes;
    }

    setZipCodeOptions(filteredZipcodes);

    // Ensure zipcodeFilter only contains zipcodes present in filteredZipcodes
    setZipcodeFilter((prev) =>
      prev.filter((zipcode) =>
        filteredZipcodes.some((z) => z.zipcode === zipcode.zipcode)
      )
    );
  }, [stateFilter, regionFilter, countryListForSidenav]);

  useEffect(() => {
    // Update localFilterValues when stateFilter, regionFilter, or zipcodeFilter changes
    const stateValues =
      stateFilter?.map((obj) => ({
        value: obj?.stateName,
        id: obj?.stateId,
        label: "State",
        key: "STATE",
      })) || [];
    const regionValues =
      regionFilter?.map((obj) => ({
        value: obj?.districtName,
        stateId: obj?.stateId,
        id: obj?.districtId,
        label: "Region",
        key: "REGION",
      })) || [];
    const zipcodeValues =
      zipcodeFilter?.map((obj) => ({
        value: obj?.zipcode,
        districtId: obj?.districtId,
        id: obj?.id,
        label: "Zipcode",
        key: "ZIPCODE",
      })) || [];

    setLocalFilterValues((prev) => {
      // Remove old state/region/zipcode filters, keep others (like ORG)
      const others = prev.filter(
        (f) => !["STATE", "REGION", "ZIPCODE"].includes(f.key)
      );
      return [...others, ...stateValues, ...regionValues, ...zipcodeValues];
    });
  }, [stateFilter, regionFilter, zipcodeFilter]);

  const zipcodeChangeHandler = (_, newValue) => {
    // newValue is array of { zipcode, districtId }
    const updatedFilterValue = newValue.map((obj) => ({
      value: obj.zipcode,
      districtId: obj.districtId,
      id: obj.id,
      label: "Zipcode",
      key: "ZIPCODE",
    }));
    setZipcodeFilter(newValue);
    setLocalFilterValues((prev) => [
      ...prev.filter((f) => f.key !== "ZIPCODE"),
      ...updatedFilterValue,
    ]);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setStateFilter([]);
    setRegionFilter([]);
    setRegionOptions([]);
    setLocalFilterValues([]);
    setZipcodeFilter([]);
    setZipCodeOptions([]);
    setSelectedOrganization([]);
    if (localFilterValues.length > 0) {
      setNavbarFilterValues([]);
    }
    handleClose();
  };

  // Apply state/region filters to context
  const handleApplyFilters = () => {
    const order = ["ORG", "STATE", "REGION", "ZIPCODE"];
    const sortedFilters = [...localFilterValues].sort(
      (a, b) => order.indexOf(a.key) - order.indexOf(b.key)
    );
    setNavbarFilterValues(sortedFilters);
    handleClose();
  };

  const handleFilteringZipcodes = (options, state) => {
    // Ensure input is a string and trimmed
    const input = String(state.inputValue).toLowerCase().trim();
    return options.filter((option) => {
      const zipcodeStr = option.zipcode
        ? String(option.zipcode).toLowerCase()
        : "";
      const districtNameStr = option.districtName
        ? String(option.districtName).toLowerCase()
        : "";
      // Show if zipcode or districtName matches input
      return zipcodeStr.includes(input) || districtNameStr.includes(input);
    });
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "#D6DBDE",
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 1,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <SubHeading
          fontSize="1rem"
          fontWeight={600}
          value={t("common:common.Filters")}
        />
        <CloseIcon
          sx={{
            cursor: "pointer",
            color: "#1D334B",
            fontSize: "1.2rem",
          }}
          onClick={handleClose}
        />
      </Box>
      <Divider sx={{ mx: -2, my: 2 }} />
      <Box
        gap={2}
        display="flex"
        flexDirection="column"
        minWidth={200}
        width={"100%"}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <SubHeading fontSize="1rem" value={t("common:common.Organization")} />
          <Autocomplete
            multiple
            fullWidth
            id="organization"
            options={linkedAccounts || []}
            disableCloseOnSelect
            getOptionLabel={(option) => option.accountName}
            value={selectedOrganization || []}
            onChange={handleAccountsChange}
            sx={{ width: 1 }}
            limitTags={1}
            renderTags={(value = []) => {
              const numTags = value.length;
              return (
                <Chip
                  color="primary"
                  key={value}
                  label={
                    value.length < 2
                      ? value
                          .slice(0, 1)
                          .map((option) => option.accountName)
                          .join(", ")
                      : numTags > 1 && `${numTags}`
                  }
                  size="medium"
                  sx={{
                    backgroundColor: "#1D334B",
                    borderRadius: "16px",
                    mr: 1,
                    maxWidth: "70%",
                  }}
                  onDelete={() => {
                    setSelectedOrganization([]);
                    setLocalFilterValues((prev) =>
                      prev.filter((f) => f.key !== "ORG")
                    );
                  }}
                  deleteIcon={<CloseIcon style={{ fontSize: "17px" }} />}
                ></Chip>
              );
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.accountName}
              </li>
            )}
            renderInput={(params) => {
              const selectedCount = selectedOrganization?.length || 0;
              return (
                <TextField
                  {...params}
                  sx={{
                    width: 1,
                    bgcolor: "#fff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0px",
                    },
                  }}
                  placeholder={
                    selectedCount < 1 ? t("common:common.All Orgs") : undefined
                  }
                  variant="outlined"
                />
              );
            }}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <SubHeading fontSize="1rem" value={t("common:common.State")} />
          <Autocomplete
            multiple
            fullWidth
            id="state"
            options={
              countryListForSidenav?.find(
                (obj) => obj.countryId == localStorage.getItem("userRegion")
              )?.states || []
            }
            disableCloseOnSelect
            getOptionLabel={(option) => option.stateName}
            value={stateFilter}
            onChange={handleStateChange}
            sx={{ width: 1 }}
            limitTags={1}
            filterOptions={(options, state) => {
              // If no input, show limited options for performance
              if (!state.inputValue) {
                return options.slice(0, stateOptionsLimit || 10);
              }
              // If searching, show all matching options
              const input = state.inputValue.toLowerCase();
              return options.filter(
                (option) =>
                  option.stateName &&
                  option.stateName.toLowerCase().includes(input)
              );
            }}
            ListboxProps={{
              onScroll: (event) => {
                const listboxNode = event.currentTarget;
                if (
                  listboxNode.scrollTop + listboxNode.clientHeight >=
                  listboxNode.scrollHeight - 10
                ) {
                  setStateOptionsLimit((prev) =>
                    Math.min(
                      (
                        countryListForSidenav?.find(
                          (obj) =>
                            obj.countryId == localStorage.getItem("userRegion")
                        )?.states || []
                      ).length,
                      prev + 10
                    )
                  );
                }
              },
            }}
            renderTags={(value, getTagProps) => {
              const numTags = value?.length;
              return (
                <Chip
                  color="primary"
                  key={value}
                  label={
                    value?.length < 2
                      ? value
                          .slice(0, 1)
                          .map((option, _) => option.stateName)
                          .join(", ")
                      : numTags > 1 && `${numTags}`
                  }
                  size="medium"
                  sx={{
                    backgroundColor: "#1D334B",
                    borderRadius: "16px",
                    mr: 1,
                    maxWidth: "70%",
                  }}
                  onDelete={() => {
                    setStateFilter([]);
                    setLocalFilterValues((prev) =>
                      prev.filter((f) => f.key !== "STATE")
                    );
                  }}
                  deleteIcon={<CloseIcon style={{ fontSize: "17px" }} />}
                ></Chip>
              );
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.stateName}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} autoComplete="off" />
            )}
          />
        </Box>

        {localStorage.getItem("userRegion") == 1 && (
          <Box display="flex" flexDirection="column" gap={1}>
            <SubHeading fontSize="1rem" value={t("common:common.Region")} />
            <Autocomplete
              multiple
              fullWidth
              id="region"
              // Always provide all options for search, but only render a limited number in the dropdown
              options={regionOptions}
              groupBy={(option) => option.stateName}
              disableCloseOnSelect
              getOptionLabel={(option) => option?.districtName}
              value={regionFilter}
              onChange={handleRegionChange}
              sx={{ width: 1 }}
              filterOptions={(options, state) => {
                // If no input, show limited options for performance
                if (!state.inputValue) {
                  return options.slice(0, regionOptionsLimit || 10);
                }
                // If searching, show all matching options
                const input = state.inputValue.toLowerCase();
                return options.filter(
                  (option) =>
                    (option.districtName &&
                      option.districtName.toLowerCase().includes(input)) ||
                    (option.stateName &&
                      option.stateName.toLowerCase().includes(input))
                );
              }}
              ListboxProps={{
                onScroll: (event) => {
                  const listboxNode = event.currentTarget;
                  if (
                    listboxNode.scrollTop + listboxNode.clientHeight >=
                    listboxNode.scrollHeight - 10
                  ) {
                    setRegionOptionsLimit((prev) =>
                      Math.min(regionOptions.length, prev + 10)
                    );
                  }
                },
              }}
              renderTags={(value = []) => {
                const numTags = value.length;
                return (
                  <Chip
                    color="primary"
                    key={value}
                    label={
                      value.length < 2
                        ? value
                            .slice(0, 1)
                            .map((option) => option?.districtName)
                            .join(", ")
                        : numTags > 1 && `${numTags}`
                    }
                    size="medium"
                    sx={{
                      backgroundColor: "#1D334B",
                      borderRadius: "16px",
                      mr: 1,
                      maxWidth: "70%",
                    }}
                    onDelete={() => {
                      setRegionFilter([]);
                      setLocalFilterValues((prev) =>
                        prev.filter((f) => f.key !== "REGION")
                      );
                    }}
                    deleteIcon={<CloseIcon style={{ fontSize: "17px" }} />}
                  ></Chip>
                );
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.districtName}
                </li>
              )}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        )}
        <Box display="flex" flexDirection="column" gap={1}>
          <SubHeading fontSize="1rem" value={t("common:common.Zipcode")} />
          <Autocomplete
            multiple
            fullWidth
            id="zipcode"
            options={zipCodeOptions}
            disableCloseOnSelect
            getOptionLabel={(option) => String(option?.zipcode)}
            groupBy={(option) => localStorage?.getItem("userRegion") == 1 ? option.districtName || option.stateName : option.stateName}
            value={zipcodeFilter}
            onChange={zipcodeChangeHandler}
            sx={{ width: 1 }}
            filterOptions={(options, state) => {
              // If no input, show limited options for performance
              if (!state.inputValue) {
                return options.slice(0, zipcodeOptionsLimit || 10);
              }

              return handleFilteringZipcodes(options, state);
            }}
            ListboxProps={{
              onScroll: (event) => {
                const listboxNode = event.currentTarget;
                if (
                  listboxNode.scrollTop + listboxNode.clientHeight >=
                  listboxNode.scrollHeight - 10
                ) {
                  setZipcodeOptionsLimit((prev) =>
                    Math.min(zipCodeOptions.length, prev + 10)
                  );
                }
              },
            }}
            renderTags={(value = []) => {
              const numTags = value.length;
              return (
                <Chip
                  color="primary"
                  key={value}
                  label={
                    value.length < 2
                      ? value
                          .slice(0, 1)
                          .map((option) => option.zipcode || option)
                          .join(", ")
                      : numTags > 1 && `${numTags}`
                  }
                  size="medium"
                  sx={{
                    backgroundColor: "#1D334B",
                    borderRadius: "16px",
                    mr: 1,
                    maxWidth: "70%",
                  }}
                  onDelete={() => {
                    setZipcodeFilter([]);
                    setLocalFilterValues((prev) =>
                      prev.filter((f) => f.key !== "ZIPCODE")
                    );
                  }}
                  deleteIcon={<CloseIcon style={{ fontSize: "17px" }} />}
                ></Chip>
              );
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props} id={option?.id}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option?.zipcode || option}
              </li>
            )}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </Box>
      <Divider sx={{ my: 2, mx: -2 }} />
      <Grid container spacing={2} sx={{ justifyContent: "space-between" }}>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ width: "100%" }}
          >
            {t("common:common.Clear")}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{ width: "100%" }}
          >
            {t("common:common.Apply")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterPopover;
