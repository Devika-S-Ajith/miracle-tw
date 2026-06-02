import React, { useEffect, useCallback, useState } from "react";
import {
  Box,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import MedLogDetailsModal from "./MedLogDetailsModal";
import { ModalService } from "../../../../../components/Modal";
import Loader from "../../../../../components/UserComponents/Loader";
import { formatDate } from "../../../../../helpers/helperFunction";
import ListPaging from "../../../../../components/UserComponents/ListPaging";
import NoLogImage from "../../../../../assets/images/woman-and-pc-screens.svg";


const MedLogOverviewList = ({ medLogDetail, medLogList, decodedTemplate }) => {
  const { id } = useParams();
  const [medLog, setMedLog] = useState(null);
  const [pageCount, setpageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMedLogList(10, 1);
  }, [id]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    getMedLogList(rowCount, newPage);
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    getMedLogList(event.target.value, page);
  };

  const getPreviewDataById = (id) => {
    const entry = decodedTemplate.find((item) => item.logItemEntryId === id);
    return entry ? entry.previewData : null;
  };

  const getMedLogList = useCallback(async (rowCount, page) => {
    //setLoading(true)
    // try {
    //   let payload =
    //   {
    //     "formEngineId": "3",
    //     "rowCount": rowCount,
    //     "pageNumber": page,
    //   }
    //   if (module == 'children') {
    //     payload.childId = "49d94e28-752d-40c9-b527-dbf99624c79f"
    //   } else if (module === 'families') {
    //     payload.familyId = id
    //   }
    //   const data = await APIS.ListRecLog(payload);
    //   setMedLog(data && data.data && data.data.data && data.data.data?.logs);
    //   setpageCount(data && data.data && data.data.pageCount);
    //   setLoading(false)
    // } catch (err) {
    //   console.error(err);
    //   setLoading(false)
    // }
  }, []);

  const openMedLogDetailModal = (details, previewData) => {
    ModalService.open(
      ({ close }) => (
        <MedLogDetailsModal
          propData={details}
          propChildData={medLogDetail}
          propPreviewData={previewData}
          close={close}
        />
      ),
      {
        width: "40%",
        hideModalFooter: true,
      }
    );
  };

  return (
    <Box>
      <Loader loading={loading}></Loader>
      <Typography
        id="export-overview-table-label"
        color="textPrimary"
        fontSize={"1.25rem"}
        fontWeight={700}
      >
        Med log overview
      </Typography>
      <Typography
        id="sub-export-overview-table-label"
        color="textPrimary"
        fontSize={"0.75rem"}
        fontWeight={700}
      >
        This is a list of recently submitted med logs
      </Typography>
      <Box mt={2} sx={{ overflow: "auto " }}>
        {medLogList.length > 0 ? (
          <Table sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date administered</TableCell>
                <TableCell>Time administered</TableCell>
                <TableCell>Successfully administered</TableCell>
                <TableCell>Medication</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medLogList
                ?.sort(
                  (a, b) =>
                    new Date(a?.itemEntryDate) - new Date(b?.itemEntryDate)
                )
                ?.map((medLogListItem) => {
                  if (
                    !medLogListItem.hasOwnProperty("isDeleted") ||
                    medLogListItem.isDeleted !== true
                  ) {
                    return (
                      <TableRow hover key={medLogListItem.id}>
                        <TableCell>
                          {
                            formatDate(medLogListItem?.itemEntryDate)?.split(
                              ","
                            )[2]
                          }
                          {
                            formatDate(medLogListItem?.itemEntryDate)?.split(
                              ","
                            )[3]
                          }
                        </TableCell>
                        <TableCell>
                          {
                            formatDate(medLogListItem?.itemEntryDate)?.split(
                              ","
                            )[0]
                          }
                        </TableCell>
                        <TableCell>
                          {medLogListItem?.administered === "No" ? "No" : "Yes"}
                        </TableCell>
                        <TableCell>
                          {medLogListItem?.administered === "No"
                            ? medLogListItem?.medicationDetailsId
                              ? `${medLogListItem?.noneAdministeredMedicationName}, ${medLogListItem?.noneAdministeredDosage}`
                              : "No Medication"
                            : medLogListItem?.medicationDetailsId
                            ? `${medLogListItem?.medicationName}, ${medLogListItem?.dosage}`
                            : "No Medication"}
                        </TableCell>
                        <TableCell>
                          {medLogListItem?.administered === "No" &&
                          medLogListItem?.medicationDetailsId ? (
                            <RemoveRedEyeIcon
                              id="view-icon"
                              onClick={() => {
                                openMedLogDetailModal(
                                  medLogListItem,
                                  getPreviewDataById(medLogListItem.id)
                                );
                              }}
                            />
                          ) : medLogListItem?.administeredBy ? (
                            <RemoveRedEyeIcon
                              id="view-icon"
                              onClick={() => {
                                openMedLogDetailModal(
                                  medLogListItem,
                                  getPreviewDataById(medLogListItem.id)
                                );
                              }}
                            />
                          ) : (
                            <></>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                })}
            </TableBody>
          </Table>
        ) : (
          <>
            <img
              src={NoLogImage}
              alt="NoLogFound"
              style={{
                width: "40%",
                height: "40%",
                objectFit: "contain",
                display: "block",
                margin: "auto",
                marginBlock: "8px",
              }}
            />
            <Typography
              fontWeight="bold"
              sx={{
                color: "text.secondary",
                display: "block",
                margin: "auto",
                textAlign: "center",
                pt: 2,
              }}
            >
              There are no logs yet
            </Typography>
          </>
        )}
      </Box>
      {pageCount > 0 && (
        <Box sx={{ display: "flex" }} flexDirection="row-reverse" pt={1} mt={1}>
          <Box sx={{ alignContent: "flex-end" }}>
            <Pagination
              onChange={handlePageChange}
              page={page}
              count={pageCount}
              shape="rounded"
            />
          </Box>

          <ListPaging
            rowCount={rowCount}
            handleRowCountChange={handleRowCountChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default MedLogOverviewList;
