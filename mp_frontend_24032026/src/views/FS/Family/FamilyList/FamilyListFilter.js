import { Autocomplete, Box, Button, TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { convertUnderscoreToText, convertUnderscoreToTextWithAnd } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const FamilyListFilter = ({
  onClose,
  applyFilter,
  clearFilter,
  filterValues,
}) => {
  const [familyStatus, setFamilyStatus] = useState();
  const [caseManager, setCaseManager] = useState(null);
  const { signedinUserRoleFS, roleListFS } = useContext(CommonDataContext);
  const [caseWorkerOptions, setCaseWorkerOptions] = useState([]);

  useEffect(() => {
    if (caseWorkerOptions?.length) {
      if (Object.keys(filterValues).length) {
        handlePatchData();
      } else {
        setFamilyStatus();
        setCaseManager(null);
      }
    }
  }, [filterValues, applyFilter, caseWorkerOptions]);

  useEffect(() => {
    const getCaseWorkerList = async () => {
      try {
        const res = await APIS.ListUsers({
          rowCount: 1000,
          FSUserRoleId: [
            roleListFS.find((role) => role.cognitoValue === "casemanager").id,
            roleListFS.find((role) => role.cognitoValue === "admin+casemanager")
              ?.id,
          ],
          accountId: [localStorage.getItem("orgId")],
          allCasemanagerList: true,
        });

        if (res.status === 200) {
          const updatedUsers = res.data.data
            .filter(
              (obj) =>
                obj.accessType === "FOSTER_SHARE" || obj.accessType === "BOTH"
            )
            ?.map((obj) => ({
              id: obj.id,
              firstName: obj.firstName,
              lastName: obj.lastName,
            }));
          setCaseWorkerOptions(updatedUsers);
        }
      } catch (error) {}
    };
    getCaseWorkerList();
  }, []);

  const handlePatchData = () => {
    setFamilyStatus(filterValues.familyStatus || null);
    setCaseManager(
      caseWorkerOptions?.find(
        (obj) => obj.id === filterValues.caseManager?.id
      ) || null
    );
  };

  const handleApplyFilter = () => {
    applyFilter({
      familyStatus: familyStatus,
      caseManager: caseManager?.id
        ? {
            id: caseManager?.id,
            value: `${caseManager?.firstName} ${caseManager?.lastName}`,
          }
        : null,
    });
    onClose();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Autocomplete
        id="child-placement"
        name="familyStatus"
        value={familyStatus}
        options={[
          "All",
          "Active",
          "Inactive",
          "Pending",
          "active_pending",
          "Incomplete",
        ]}
        // options={fsFamilyStatusList}
        // sx={{ width: 1 }}
        sx={{ minWidth: "256px" }}
        fullWidth
        onChange={(_, newValue) => setFamilyStatus(newValue)}
        isOptionEqualToValue={(option, value) => {
          return Object.is(JSON.stringify(option), JSON.stringify(value));
        }}
        disableClearable
        getOptionLabel={(option) => convertUnderscoreToTextWithAnd(option)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Status"
            fullWidth
            // error={
            //   touched?.caseManager && Boolean(errors?.caseManager)
            // }
            // helperText={touched?.caseManager && errors?.caseManager}
          />
        )}
      />
      {signedinUserRoleFS !== "casemanager" && (
        <Autocomplete
          id="caseManager"
          name="userId"
          value={caseManager}
          options={caseWorkerOptions}
          sx={{ width: 1 }}
          isOptionEqualToValue={(option, value) => {
            return Object.is(JSON.stringify(option), JSON.stringify(value));
          }}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          onChange={(_, newValue) => setCaseManager(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Case manager"
              // required
              // error={touched?.userId && Boolean(errors?.userId)}
              // helperText={touched?.userId && errors?.userId}
            />
          )}
        />
      )}
      <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
        <Button
          sx={{ borderRadius: "4px" }}
          variant="outlined"
          onClick={() => {
            clearFilter();
            setTimeout(() => {
              onClose();
            }, 100);
          }}
        >
          Clear
        </Button>
        <Button
          sx={{ borderRadius: "4px" }}
          variant="contained"
          onClick={() => handleApplyFilter()}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default FamilyListFilter;
