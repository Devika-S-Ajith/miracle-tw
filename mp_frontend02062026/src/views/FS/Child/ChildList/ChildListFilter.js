import { Autocomplete, Box, Button, TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { convertUnderscoreToText } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";

const ChildListFilter = ({
  onClose,
  applyFilter,
  clearFilter,
  filterValues,
}) => {
  const { fsChildPlacementList } = useContext(CommonDataContext);
  const [childPlacement, setChildPlacement] = useState();
  const [caseManager, setCaseManager] = useState(null);
  const [caseWorkerOptions, setCaseWorkerOptions] = useState([]);
  const { signedinUserRoleFS, roleListFS } = useContext(CommonDataContext);

  useEffect(() => {
    if (caseWorkerOptions?.length) {
      if (Object.keys(filterValues).length) {
        handlePatchData();
      } else {
        setChildPlacement();
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
    setChildPlacement(filterValues.placementStatus?.id);

    setCaseManager(
      caseWorkerOptions?.find(
        (obj) => obj.id === filterValues.caseWorkerId?.id
      ) || null
    );
  };

  const handleApplyFilter = () => {
    applyFilter({
      placementStatus: {
        id: childPlacement,
        value: convertUnderscoreToText(childPlacement),
        filterMandatory: true,
      },
      caseWorkerId: caseManager?.id
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
        name="childPlacement"
        value={childPlacement}
        options={["IN_FOSTER_PLACEMENT", "DISCHARGED"]}
        // options={fsChildPlacementList}
        // sx={{ width: 1 }}
        sx={{ minWidth: "256px" }}
        fullWidth
        onChange={(_, newValue) => setChildPlacement(newValue)}
        isOptionEqualToValue={(option, value) => {
          return Object.is(JSON.stringify(option), JSON.stringify(value));
        }}
        disableClearable
        getOptionLabel={(option) => convertUnderscoreToText(option)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Child Placement"
            required
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
            />
          )}
        />
      )}

      <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
        <Button
          sx={{ borderRadius: "4px" }}
          variant="outlined"
          onClick={() => {
            applyFilter({
              placementStatus: {
                id: "IN_FOSTER_PLACEMENT",
                value: "In foster placement",
                filterMandatory: true,
              },
            });
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

export default ChildListFilter;
