import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Scrollbar from "../../../Dashboard/Components/ScrollBar";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import moment from "moment";


const Keywords = {
  HTFamilyId: "Family Id",
  firstName: "First Name",
  lastName: "LAst Name",
  addressLine1: "Address 1",
  addressLine2: "Address 2",
  zipCode: "Zipcode",
  highestEducationLevel: "Highest Education",
  birthDate: "Date of Birth",
  gender: "Gender",
  phoneNumber: "Phone Number",
  email: "Email",
  HTChildEducationLevelId: "Education",
  dateOfEntry: "Added Date",
  dateOfExit: "Closed Date",
  HTOrganizationId: "Organization",
  HTLanguageId: "Language",
  HTChildPlacementStatusId: "Placement Status",
  HTChildCurrentPlacementStatusId: "Current Placement",
  HTChildStatusId: "Child Status",
  city: "City",
  HTCountryId: "Country",
  HTDistrictId: "District",
  HTStateId: "State",
  isActive: "Child Status",
  isDeleted: "Child Delete Status",
  TWUserId: "Case Worker",
};

const ChildHistory = (props) => {
  const { t } = useTranslation(["common"]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const { id, caseId, ...other } = props;
  const [auditList, setAuditList] = useState([]);
  const [loading, setLoading] = useState(false);

  let getAuditListpayload = {
    rowCount: "10",
    pageNumber: "1",
    childId: id,    // ← was "1021"
    caseId: caseId, // ← was "1031"
  };

  const getAuditLog = useCallback(async (pageValue = 1) => {
    try {
      setLoading(true);
      getAuditListpayload.childId = id;
      getAuditListpayload.pageNumber = pageValue;
      getAuditListpayload.caseId = caseId;
      const data = await APIS.ChildAuditLog(getAuditListpayload);
      setAuditList(data && data.data && data.data.data);
      setPageCount(data && data.data && data.data.pageCount);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id, caseId]);

  useEffect(() => {
    getAuditLog();
  }, [getAuditLog]);

  const handlePageChange = (event, value) => {
    getAuditLog(value);
    setPage(value);
  };

  function utcToLocal(utcDateTime) {
    const localDateTime = moment.utc(utcDateTime).local();
    return localDateTime.format("DD/MM/YYYY HH:mm:ss");
  }

  return (
    <>
      <Card {...other}>
        <CardHeader title={t("common:common.Change History")} />
        <Divider />

        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            //m: -1,
          }}
        ></Box>
        <Scrollbar>
          {loading && (
            <CircularProgress
              sx={{
                zIndex: 1000,
                position: "fixed",
                top: "50%", // Adjusted to 50% to center vertically
                left: "50%", // Adjusted to 50% to center horizontally
                transform: "translate(-50%, -50%)", // Centering trick
              }}
              color="primary"
            />
          )}
          <Box sx={{ minWidth: 700 }}>
            {auditList && auditList.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAllCustomers}
                    color="primary"
                    indeterminate={selectedSomeCustomers}
                    onChange={handleSelectAllCustomers}
                  />
                </TableCell> */}
                    <TableCell>{t("common:common.Change ID")}</TableCell>
                    <TableCell>{t("common:common.Field Changed")}</TableCell>
                    <TableCell>{t("common:common.Changed By")}</TableCell>
                    <TableCell>{t("common:common.Old Value")}</TableCell>
                    <TableCell>{t("common:common.New Value")}</TableCell>
                    <TableCell>{t("common:common.Time Stamp")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditList.map((auditItem) => {
                    return (
                      <TableRow hover key={auditItem.id}>
                        <TableCell>{auditItem.id}</TableCell>
                        <TableCell>{Keywords[auditItem.entity] ?? auditItem.entity}</TableCell>
                        <TableCell>
                          {auditItem.updatedUser
                            ? auditItem.updatedUser
                            : "Unavailable"}
                        </TableCell>
                        <TableCell>
                          {!auditItem?.oldvalue?.length 
                            ? "-"
                            : auditItem.oldvalue}
                        </TableCell>
                        <TableCell>
                          {!auditItem?.newvalue?.length
                            ? "-"
                            : auditItem.newvalue}
                        </TableCell>
                        <TableCell>{utcToLocal(auditItem.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {auditList && auditList.length === 0 && (
              <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
                <Box>
                  <Grid container spacing={3}>
                    <Grid
                      item
                      md={3} //6
                      xs={6} //12
                    >
                      <Typography>{t("common:common.No Change")}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
        </Scrollbar>
        <Box sx={{ display: "flex" }} flexDirection="row-reverse" p={1} m={1}>
          <Box sx={{ alignContent: "flex-end" }}>
            <Pagination
              onChange={handlePageChange}
              page={page}
              count={pageCount}
              shape="rounded"
            />
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default ChildHistory;
