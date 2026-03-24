import React, { useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionDetails,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import {
  ClearIcon,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Loader from "../../../../components/UserComponents/Loader";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import NoLogImage from "../../../../assets/images/woman-and-pc-screens.svg";
import { getDate, formatDate } from "../../../../helpers/helperFunction";
import MedicationLabelValue from "./MedicationLabelValue";
import { DateFormatFromRegion } from "../../../../constants";
import SearchIcon from "../../../../assets/icons/Search";
import APIS from "../../../../common/hooks/UseApiCalls";
import { PrintAsPDF } from "../../../../components/UserComponents/ReportGenerator";

const FIELD_LABELS = {
  medicationName: "Medication Name",
  reason: "Reason",
  dosage: "Dosage",
  strength: "Strength",
  physicianName: "Physician Name",
  prescriptionDate: "Prescription Date",
  medicationNotes: "Medication Notes",
  pharmacyPhoneNumber: "Pharmacy Phone Number",
  pharmacy: "Pharmacy",
  RXNumber: "RX Number",
  physicianPhoneNumber: "Physician Phone Number",
  dosageFrequency: "Dosage Frequency",
  activeTillDate: "Active Till Date",
  medicineStatus: "Medicine Status",
};

const MedicationChangesLog = ({ childId }) => {
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const [query, setQuery] = useState("");
  const [medicationChangesLogList, setMedicationChangesLogList] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // Track expanded row

  const handlePageChange = useCallback(
    (event, newPage) => setPage(newPage),
    []
  );
  const handleRowCountChange = useCallback((event) => {
    setRowCount(event.target.value);
    setPage(1);
  }, []);
  const handleFromDateChange = useCallback((value) => setFromDate(value), []);
  const handleToDateChange = useCallback((value) => setToDate(value), []);

  const toggleAccordion = (medicationId) => {
    setExpandedRow(expandedRow === medicationId ? null : medicationId);
  };

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();
      if (inputValue.length === 1 || inputValue.length === 2) {
        getMedicationChangeLogList(
          rowCount,
          page,
          fromDate,
          toDate,
          inputValue
        );
      }
    }
  };

  const getMedicationChangeLogList = useCallback(
    async (rowCount, page, fromDate, toDate, query) => {
      setLoading(true);
      try {
        const payload = {
          childId: childId,
          medicationName: query,
          pageNumber: page,
          rowCount: rowCount,
          fromDate: fromDate ? getDate(fromDate) : "",
          toDate: toDate ? getDate(toDate) : "",
        };
        const data = await APIS.GetMedicationChangeLogList(payload);
        setMedicationChangesLogList(data?.data?.data?.medicationHistory);
        setPageCount(data?.data?.data?.pagination?.totalPages);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [childId]
  );

  // Fetch on mount and when rowCount, page, date range changes
  useEffect(() => {
    getMedicationChangeLogList(rowCount, page, fromDate, toDate, query);
    // eslint-disable-next-line
  }, [rowCount, page, fromDate, toDate]);

  // Debounced search effect
  useEffect(() => {
    // Avoid second call if query is empty and already handled by first useEffect
    if (query === "") return;

    const delayDebounce = setTimeout(() => {
      setPage(1);
      getMedicationChangeLogList(rowCount, 1, fromDate, toDate, query);
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleExport = useCallback(async () => {
    try {
      setExportLoading(true);
      const payload = {
        childId: childId,
        medicationName: query,
        pageNumber: page,
        rowCount: rowCount,
        fromDate: fromDate ? getDate(fromDate) : "",
        toDate: toDate ? getDate(toDate) : "",
      };
      // payload.timezone = "UTC";
      const data = await APIS.ExportMedicationChangeLogList(payload);
      if (data?.data) {
        PrintAsPDF(data?.data, "MEDICATION CHANGE LOG");
        setExportLoading(false);
      } else if (data?.data?.Message === "Unauthorized") {
        toast.error("Unauthorized");
        setExportLoading(false);
      } else {
        console.log("issue fetching data to export");
        toast.error(
          "Error while fetching data to export,Please try again in some time"
        );
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

  return (
    <Card>
      <CardContent>
        <Box>
          <Loader loading={loading}></Loader>
          <Grid container spacing={2} my alignItems="center">
            <Grid item md={9}>
              <Typography
                color="textPrimary"
                // variant="subtitle2"
                fontWeight={700}
                fontSize="1.25rem"
                sx={{ pointerEvents: "none" }}
                mb
              >
                Medication change log
              </Typography>
            </Grid>
            <Grid item md={3}>
              <Box display="flex" justifyContent="flex-end" alignItems="center">
                <LoadingButton
                  size="small"
                  onClick={handleExport}
                  loading={exportLoading}
                  loadingPosition="start"
                  startIcon={<FileUploadIcon />}
                  color="primary"
                  variant="contained"
                  sx={{ height: 35 }}
                  disabled={!medicationChangesLogList?.length}
                >
                  {"Export"}
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} my alignItems="center">
              <Grid item md={4}>
                <TextField
                  InputProps={{
                    sx: {
                      borderRadius: "0px",
                      height: 48,
                    },
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          borderRadius: 0,
                        }}
                      >
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: query.length > 0 && (
                      <IconButton
                        id="clear-search-btn"
                        data-testid="clear-search-btn"
                        color="inherit"
                        onClick={() => {
                          getMedicationChangeLogList(
                            rowCount,
                            page,
                            fromDate,
                            toDate,
                            ""
                          );
                          setQuery("");
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyPress}
                  placeholder={"Search by medication"}
                  value={query}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={4}>
                <DatePicker
                  id="fromDate"
                  value={fromDate}
                  disableFuture
                  slotProps={{ field: { clearable: true } }}
                  onChange={(newValue) => {
                    handleFromDateChange(newValue);
                  }}
                  format={DateFormatFromRegion()}
                  maxDate={toDate}
                  label={"From"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2 / 8,
                      height: 48, // Adjust the height here
                    },
                    "& .MuiFormLabel-root": {
                      top: "-4px",
                    },
                  }}
                />
              </Grid>
              <Grid item md={4}>
                <DatePicker
                  id="toDate"
                  label={"To"}
                  disableFuture
                  slotProps={{ field: { clearable: true } }}
                  value={toDate}
                  onChange={(newValue) => {
                    handleToDateChange(newValue);
                  }}
                  clearable
                  format={DateFormatFromRegion()}
                  minDate={fromDate}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2 / 8,
                      height: 48, // Adjust the height here
                    },
                    "& .MuiFormLabel-root": {
                      top: "-4px",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <Box mt={2} sx={{ overflow: "auto " }}>
            {medicationChangesLogList?.length > 0 ? (
              <Table sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Medication</TableCell>
                    <TableCell>Update</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Changed by</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicationChangesLogList?.map((medListItem, index) => {
                    const isExpanded = expandedRow === index;

                    return (
                      <React.Fragment key={index}>
                        <TableRow hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <IconButton
                                onClick={() => toggleAccordion(index)}
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
                                {formatDate(medListItem?.date)?.split(",")[2]}
                                {formatDate(medListItem?.date)?.split(",")[3]}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{medListItem?.medication || ""}</TableCell>
                          <TableCell>{medListItem?.update || ""}</TableCell>
                          <TableCell>
                            {medListItem?.update === "Edit" ? (
                              Array.isArray(medListItem?.details) ? (
                                medListItem.details.map((detail, idx) => (
                                  <div key={idx}>
                                    <b>{FIELD_LABELS[detail.field] || detail.field}</b>
                                    {" "}
                                    "{detail.oldVal}" to "
                                    {detail.newVal}"
                                  </div>
                                ))
                              ) : medListItem?.details &&
                                typeof medListItem.details === "object" ? (
                                <div>
                                  <b>{FIELD_LABELS[medListItem.details.field] || medListItem.details.field}</b>
                                  {" "}
                                  "{medListItem.details.oldVal}" to "
                                  {medListItem.details.newVal}"
                                </div>
                              ) : (
                                ""
                              )
                            ) : (
                              <>
                                {typeof medListItem?.details === "object"
                                  ? JSON.stringify(medListItem.details)
                                  : medListItem?.details}
                              </>
                            )}
                          </TableCell>
                          <TableCell>{medListItem?.changedBy || ""}</TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`expanded-${index}`}>
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
                                      <Grid item xs={12}>
                                        <MedicationLabelValue
                                          label="Notes"
                                          value={medListItem?.notes}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
                    There are no medication changes yet
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

export default MedicationChangesLog;
