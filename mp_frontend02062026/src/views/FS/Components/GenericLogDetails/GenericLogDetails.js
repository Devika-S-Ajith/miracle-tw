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
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIS from "../../../../common/hooks/UseApiCalls";
import { utcToDateFormat } from "../../../../helpers/helperFunction";
import Loader from "../../../../components/UserComponents/Loader";
import { renderAnswerColumn } from "../helperFunction";

const GenericLogDetails = ({
  moduleName,
  moduleId,
  behavioralLogId,
  close,
  logName,
}) => {
  const navigate = useNavigate();
  const [genericLogDetail, setGenericLogDetail] = useState([]);
  const [filtertedDecodeTemplate, setFiltertedDecodeTemplate] = useState([]);
  const [loading, setLoading] = useState(false);

  const resetRouter = () => {
    navigate(`/fostershare/${moduleName}/${moduleId}`);
  };

  useEffect(() => {
    getGenericLogDetail();
  }, [behavioralLogId]);

  const getGenericLogDetail = useCallback(async () => {
    setLoading(true);
    try {
      let payload = {
        logId: behavioralLogId,
      };
      const data = await APIS.DetailRecLog(payload);

      setGenericLogDetail(
        data && data.data && data.data.data && data.data.data?.logs
      );

      if (data?.data?.data?.logs?.decodedTemplate) {
        const decodedTemplate = data.data.data.logs.decodedTemplate;
        decodedTemplate.forEach((item, index) => {
          if (item?.components?.length > 0) {
            item.components.forEach((component, componentIndex) => {
              if (component?.userResponseValue === "yesAction") {
                const yesActions = component?.actions?.yesAction || [];

                yesActions.forEach((action, index) => {
                  // Create a new object for each action and insert it
                  const transformedItem = { components: [{ ...action }] };

                  // Insert the transformed item right after the current component index
                  item.components.splice(
                    componentIndex + 1 + index, // Ensure items are inserted sequentially
                    0,
                    transformedItem.components[0]
                  );
                });
              }
              if (component?.userResponseValue === "noAction") {
                const noActions = component?.actions?.noAction || [];

                noActions.forEach((action, index) => {
                  // Create a new object for each action and insert it
                  const transformedItem = { components: [{ ...action }] };

                  // Insert the transformed item right after the current component index
                  item.components.splice(
                    componentIndex + 1 + index, // Ensure items are inserted sequentially
                    0,
                    transformedItem.components[0]
                  );
                });
              }
            });
          }
        });
        setFiltertedDecodeTemplate(decodedTemplate);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <Box
        sx={{
          height: "70vh",
          maxHeight: "600px",
          mr: -2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography
              id="log-overview-table-label"
              color="textPrimary"
              variant="h5"
            >
              {logName} Details
            </Typography>
            <Typography color="textPrimary" variant="h6">
              {genericLogDetail?.childName}
            </Typography>
          </Box>

          <Box>
            <Typography
              id="log-overview-table-label"
              variant="body2"
              sx={{ color: "text.secondary", mt: 1 }}
              fontWeight="bold"
            >
              {utcToDateFormat(genericLogDetail?.date)}
            </Typography>
            <Typography
              id="log-overview-table-label"
              variant="body2"
              sx={{ color: "text.secondary" }}
              fontWeight="bold"
            >
              Submitted by: {genericLogDetail?.submittedBy}
            </Typography>
          </Box>
        </Box>
        <Box
          height="90%"
          overflow="scroll"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            "&::-webkit-scrollbar": {
              width: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "white",
              display: "none",
            },
          }}
        >
          <Box sx={{ mr: 2 }}>
            {genericLogDetail && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        variant="subtitle1"
                        sx={{ color: "text.secondary" }}
                      >
                        Question
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        variant="subtitle1"
                        sx={{ color: "text.secondary" }}
                      >
                        Response
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtertedDecodeTemplate?.map((individualItem, index) => {
                    return individualItem?.components.map((item, index) =>
                      item?.displayLabel ? (
                        <TableRow hover key={item?.page}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {individualItem?.components[index]?.displayLabel}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {renderAnswerColumn(
                              individualItem?.components[index],
                              false
                            )}
                          </TableCell>
                        </TableRow>
                      ) : null
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        </Box>
      </Box>
      <Box mt={2} sx={{ display: "flex", justifyContent: "end", gap: 0 }}>
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

export default GenericLogDetails;
