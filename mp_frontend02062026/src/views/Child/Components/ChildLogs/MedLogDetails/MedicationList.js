import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Loader from "../../../../../components/UserComponents/Loader";
import ListPaging from "../../../../../components/UserComponents/ListPaging";
import NoLogImage from "../../../../../assets/images/woman-and-pc-screens.svg";
import { utcToDateFormat } from "../../../../../helpers/helperFunction";
import MedicationLabelValue from "./MedicationLabelValue";

const MedicationList = ({ list, loading }) => {
  const [pageCount, setpageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    //getMedLogList(rowCount, newPage)
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    //getMedLogList(event.target.value, page)
  };

  const [expandedRow, setExpandedRow] = useState(null); // Track expanded row
  const toggleAccordion = (medicationId) => {
    // Toggle the accordion for the row
    setExpandedRow(expandedRow === medicationId ? null : medicationId);
  };

  return (
    <Card>
      <CardContent>
        <Box>
          <Loader loading={loading}></Loader>
          <Typography
            color="textPrimary"
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1.25rem"
            sx={{ pointerEvents: "none" }}
            mb
          >
            Medication list
          </Typography>
          <Box mt={2} sx={{ overflow: "auto " }}>
            {list.length > 0 ? (
              <Table sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Medication name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Strength</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Dosage frequency</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Last administered</TableCell>
                    {/* <TableCell>Psychotropic?</TableCell> */}
                    {/* <TableCell>Notes</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((medListItem) => {
                    const isExpanded =
                      expandedRow === medListItem?.medicationDetailsId;

                    return (
                      <>
                        <TableRow
                          hover
                          key={medListItem?.medicationDetailsId || ""}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <IconButton
                                onClick={() =>
                                  toggleAccordion(
                                    medListItem?.medicationDetailsId
                                  )
                                }
                                size="small"
                              >
                                {isExpanded ? (
                                  <ArrowDropDownIcon
                                    sx={{ color: "#1D334B" }}
                                  />
                                ) : (
                                  <ArrowRightIcon sx={{ color: "#1D334B" }} />
                                )}
                              </IconButton>
                              <Typography variant="body2" ml={1}>
                                {medListItem?.medicationName || ""}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {medListItem?.medicineStatus === null || medListItem?.medicineStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </TableCell>
                          <TableCell>{medListItem?.strength || ""}</TableCell>
                          <TableCell>{medListItem?.dosage || ""}</TableCell>
                          <TableCell>
                            {medListItem?.dosageFrequency || ""}
                          </TableCell>
                          <TableCell>
                            {medListItem?.medicationType || ""}
                          </TableCell>
                          <TableCell>
                            {medListItem?.lastAdministeredDate
                              ? utcToDateFormat(
                                  medListItem?.lastAdministeredDate
                                )
                              : ""}
                          </TableCell>

                          {/* <TableCell>{medListItem?.reason || ""}</TableCell> */}
                          {/* <TableCell>
                            {medListItem?.physicianName || ""}
                          </TableCell>
                          <TableCell>
                            {medListItem?.prescriptionDate
                              ? utcToLocalDate(medListItem?.prescriptionDate)
                              : ""}
                          </TableCell>
                          <TableCell>
                            {medListItem?.medicationNotes || ""}
                          </TableCell> */}
                        </TableRow>

                        {/* Accordion Content Below Row */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8}>
                              <Accordion
                                expanded={isExpanded}
                                sx={{ boxShadow: "none" }}
                              >
                                <AccordionDetails>
                                  <Box
                                    px={4}
                                    py={3}
                                    sx={{ backgroundColor: "#F3F6FA" }}
                                  >
                                    <Grid container spacing={3}>
                                      <Grid item xs={5}>
                                        <MedicationLabelValue
                                          label="Medication form"
                                          value={
                                            medListItem?.medicationFormOption
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={7}>
                                        <MedicationLabelValue
                                          label="Prescribing doctor"
                                          value={medListItem?.physicianName}
                                        />
                                      </Grid>
                                      <Grid item xs={5}>
                                        <MedicationLabelValue
                                          label="Pharmacy"
                                          value={medListItem?.pharmacy}
                                        />
                                      </Grid>
                                      <Grid item xs={7}>
                                        <MedicationLabelValue
                                          label="Prescribing doctor’s phone number"
                                          value={
                                            medListItem?.physicianPhoneNumber
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={5}>
                                        <MedicationLabelValue
                                          label="Pharmacy phone number"
                                          value={
                                            medListItem?.pharmacyPhoneNumber
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={7}>
                                        <MedicationLabelValue
                                          label="Prescription/RX number"
                                          value={medListItem?.RXNumber}
                                        />
                                      </Grid>
                                      <Grid item xs={12}>
                                        <MedicationLabelValue
                                          label="Reason for medication"
                                          value={medListItem?.reason}
                                        />
                                      </Grid>{" "}
                                      <Grid item xs={12}>
                                        <MedicationLabelValue
                                          label="Medication notes"
                                          value={medListItem?.medicationNotes}
                                          wrap
                                        />
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              !loading && (
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
                    There are no medications yet
                  </Typography>
                </>
              )
            )}
          </Box>
          {pageCount > 0 && (
            <Box
              sx={{ display: "flex" }}
              flexDirection="row-reverse"
              pt={1}
              mt={1}
            >
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
      </CardContent>
    </Card>
  );
};

export default MedicationList;
