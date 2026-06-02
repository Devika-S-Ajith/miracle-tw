import { useState, useEffect, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Pagination,
} from "@mui/material";
import Scrollbar from "../../Dashboard/Components/ScrollBar";
import APIS from "../../../common/hooks/UseApiCalls";
import ListPaging from "../../../components/UserComponents/ListPaging";

const OrganizationListAndCounts = () => {
  const [accountsList, setAccountsList] = useState([]);
  const [pageCount, setpageCount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(10);
  const [page, setPage] = useState(1);

  const getOrganizations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const Payload = {
        rowCount: "10",
        pageNumber: page,
        globalSearchQuery: "",
        accountStatus: "active",
        accountTypeFilter: "",
        orderByField: [["accountName", "ASC"]],
        addressLine1Like: "",
        fsStatus: "enabled",
        HTStatus: "disabled",
        MPAccountTypeId: [],
      };
      const data = await APIS.OrganizationList(Payload);
      const accountDetails = data?.data?.data || [];
      const CountData = await APIS.getCaseManagerChildPerAccount({});
      if (accountDetails?.length) {
        CountData?.data?.data.forEach((count) => {
          let account = accountDetails.find(
            (acc) => acc.id === count.TWAccountId
          );
          if (account) {
            account.CaseManager = count.casemanagerCount;
            account.child = count.childCount;
          }
        });
      }

      setAccountsList(accountDetails);
      setpageCount(data && data.data && data.data.pageCount);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  });

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    // showAllAccounts(event.target.value);
  };

  useEffect(() => {
    getOrganizations();
  }, []);

  const handlePageChange = (event, value) => {
    getOrganizations(value);
    setPage(value);
  };

  return (
    <Card sx={{ boxShadow: "none", border: "none", width: "100%" }}>
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
        <Box sx={{ minWidth: 1150 }}>
          {accountsList && accountsList.length > 0 && (
            <Table sx={{ boxShadow: "none", border: "none" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pb: 0, pl: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      Organization
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ pb: 0, pl: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Location
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ pb: 0, pl: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      # of Case Managers
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ pb: 0, pl: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      # of Children
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountsList &&
                  accountsList?.length &&
                  accountsList?.map((account, index) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <RouterLink
                          sx={{ flex: 1 }}
                          style={{ color: "#F37123", textDecoration: "none" }}
                          color="textSecondary"
                          to={`/dashboard/organizations/${account.id}/view`}
                          underline="none"
                          variant="h6"
                        >
                          {account.accountName}
                        </RouterLink>
                      </TableCell>
                      <TableCell>{account.city}</TableCell>
                      <TableCell>{account.CaseManager}</TableCell>
                      <TableCell>{account.child}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
          {accountsList && accountsList.length === 0 && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>No oraganization to list</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </Scrollbar>
      <Box
        sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
        p={1}
        m={1}
      >
        <ListPaging
          rowCount={rowCount}
          handleRowCountChange={handleRowCountChange}
        ></ListPaging>
        <Box>
          <Pagination
            onChange={handlePageChange}
            page={page}
            count={pageCount}
            shape="rounded"
          />
        </Box>
      </Box>
    </Card>
  );
};

export default OrganizationListAndCounts;
