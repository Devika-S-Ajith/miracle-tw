import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import APIS from "../../../../common/hooks/UseApiCalls";
import Loader from "../../../../components/UserComponents/Loader";
import {
  utcToDateFormat,
  utcToLocalDate,
} from "../../../../helpers/helperFunction";

const RecreationalLogDetails = ({ moduleName, moduleId, close, recId }) => {
  const navigate = useNavigate();
  const [recLogDetail, setRecLogDetail] = useState([]);
  const [loading, setLoading] = useState(false);

  const keyWords = {
    dailyIndoorOutdoorActivity: "Daily indoor outdoor activity",
    individualFreeTimeActivity: "Individual free time activity",
    communityActivity: "Community activity",
    familyActivity: "Family activity",
  };

  const resetRouter = () => {
    navigate(`/fosterShare/${moduleName}/${moduleId}`);
  };

  useEffect(() => {
    getRecLogDetail();
  }, [recId]);

  const generateTableRows = (data) => {
    return data?.flatMap((item, index) => {
      const activityType = item.displayLabel || "";
      let activity = "";
      if (activityType) {
        if (item.userResponseValue) {
          activity = Array.isArray(item.userResponseValue)
            ? item?.userResponseValue
                ?.map((value) => {
                  const individualItem = item?.childItems.find(
                    (child) => child.id === value
                  );
                  return individualItem ? individualItem.title : null;
                })
                .filter(Boolean)
                .join(", ")
            : item.userResponseValue.toString();

          // Return a row for valid userResponseValue
          return (
            <TableRow key={index}>
              <TableCell>{activityType}</TableCell>
              <TableCell>{activity}</TableCell>
            </TableRow>
          );
        } else if (item.components) {
          // Return a row for components with a specific userResponseValue
          return (
            <TableRow key={index}>
              <TableCell>{activityType}</TableCell>
              <TableCell>
                {item.components[0]?.userResponseValue || ""}
              </TableCell>
            </TableRow>
          );
        }
      } else if (item.components) {
        // Recursively handle components
        return generateTableRows(item.components);
      }

      // If no valid data, return an empty array to avoid `undefined`
      return [];
    });
  };

  const getRecLogDetail = useCallback(async () => {
    setLoading(true);
    try {
      let payload = {
        logId: recId,
      };
      const data = await APIS.DetailRecLog(payload);

      setRecLogDetail(
        data && data.data && data.data.data && data.data.data?.logs
      );
      //setpageCount(data && data.data && data.data.pageCount);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography id="recreational-log" color="textPrimary" variant="h5">
            Recreation log details
          </Typography>
          <Typography
            id="log-overview-table-label"
            color="textPrimary"
            variant="body2"
            sx={{ color: "text.secondary" }}
            fontWeight="bold"
            m
          >
            {utcToDateFormat(recLogDetail?.date)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto", // 'auto' will add a scrollbar when needed
            height: "45vh",
            maxHeight: "600px",
          }}
          my
        >
          <Box mt={2}>
            {recLogDetail && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6" sx={{ color: "text.secondary" }}>
                        Activity type
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ color: "text.secondary" }}>
                        Activities
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generateTableRows(recLogDetail?.decodedTemplate)}
                </TableBody>
              </Table>
            )}
          </Box>
        </Box>
      </Box>
      <Box mt={2} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
        <Button
          sx={{ borderRadius: "4px" }}
          variant="contained"
          onClick={() => {
            close();
            resetRouter();
          }}
        >
          Close
        </Button>
      </Box>
    </>
  );
};

export default RecreationalLogDetails;
