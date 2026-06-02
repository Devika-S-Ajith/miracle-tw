
import React, { useState, useEffect, useCallback } from "react";
import { Box, Card, CardContent } from "@mui/material";
import LogOverviewList from "../../Components/LogOverviewList/LogOverviewList";
import RecreationLogsList from "../../Components/RecreationLogsList";
import MonthlyMedLogsList from "../../Components/MonthlyMedLogsList";
import GenericLogsList from "../../Components/GenericLogsList";
import APIS from "../../../../common/hooks/UseApiCalls";

const FamilyLogDetails = () => {
  const [formEngines, setFormEngines] = useState([]);

  useEffect(() => {
    getFormEngineList();
  }, []);

  const getFormEngineList = useCallback(async () => {
    try {
      const data = await APIS.ListGenericLogs();

      setFormEngines(data && data.data && data.data.data && data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {formEngines.map((item, index) => {
      let ComponentToRender;

      switch (item.formType) {
        case "BEHAVIOR_LOG":
          ComponentToRender = LogOverviewList;
          break;
        case "RECREATION_LOG":
          ComponentToRender = RecreationLogsList;
          break;
        case "MED_LOG":
          ComponentToRender = MonthlyMedLogsList;
          break;
        case "GENERIC_CUSTOM_LOG":
          ComponentToRender = GenericLogsList;
          break;
        default:
          return null; // Skip rendering if no valid formType is found
      }

      return (
        <Card key={`${item.formType}-${index}`} sx={{ borderRadius: 2 / 8 }}>
          <CardContent>
            <ComponentToRender module="families" listData={item} />
          </CardContent>
        </Card>
      );
    })}
  </Box>
  );
};

export default FamilyLogDetails;
