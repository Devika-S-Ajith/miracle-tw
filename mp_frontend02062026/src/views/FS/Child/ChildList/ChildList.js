import React, { useContext, useEffect, useRef } from "react";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { ModalService } from "../../../../components/Modal";
import ChildListFilter from "./ChildListFilter";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useLocation, useNavigate } from "react-router";
import { convertUnderscoreToText } from "../../../../constants";
import ChildDetailForm from "../../Components/ChildDetailForm";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import PlusIcon from "../../../../assets/icons/Plus";
import { ArrowRight } from "@mui/icons-material";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";

const ChildList = () => {
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const { getFsChildListData, signedinUserRoleFS } =
    useContext(CommonDataContext);

  useEffect(() => {
    document.title = "Children | ThriveWell";
  }, []);

  useAuthorization(null, signedinUserRoleFS, null, "FSChild", false);

  const location = useLocation();
  const { caseWorkerId } = location.state || {};

  useEffect(() => {
    if (caseWorkerId) gridRef?.current?.doFilter(location.state);
    else if (gridRef?.current) {
      gridRef?.current?.doFilter({
        placementStatus: {
          id: "IN_FOSTER_PLACEMENT",
          value: "In foster placement",
          filterMandatory: true,
        },
      });
    }
  }, []);

  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "firstName",
      headerName: "Name",
      minWidth: 150,
      flex: 1,
      renderCell: ({ formattedValue, row }) => (
        <Typography
          variant="inherit"
          color="rgb(243, 113, 35)"
          sx={{ cursor: "pointer" }}
          fontWeight={500}
          lineHeight={1.57}
          onClick={() => navigate(`/fostershare/children/${row.id}`)}
        >
          {formattedValue}
        </Typography>
      ),
    },
    {
      field: "family.firstName",
      headerName: "Family",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "caseManager.firstName",
      headerName: "Case manager",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "placementStatus",
      headerName: "Placement status",
      flex: 1,
      minWidth: 150,
      sortable: false,
    },
    {
      sortable: false,
      renderCell: (row) => (
        <ArrowRight
          style={{ cursor: "pointer" }}
          fontSize="large"
          id="view-icon"
          onClick={() => navigate(`/fostershare/children/${row.id}`)}
          sx={{ cursor: "pointer" }}
        />
      ),
      width: 60,
      align: "right",
    },
  ];

  const getChildListData = async ({
    rowCount,
    pageNumber,
    globalSearchQuery,
    filter,
    orderByField,
  }) => {
    let params = {
      rowCount,
      pageNumber,
      ...filter,
    };
    if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.getFsChildList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data?.data.map((each) => ({
              id: each.id,
              firstName: `${each.firstName} ${each.lastName}`,
              "family.firstName": each?.familyDetails
                ? each?.familyDetails?.members
                    .map((member) => member?.firstName)
                    .join(", ")
                : "-",
              "caseManager.firstName": each?.caseManager
                ? `${each?.caseManager?.firstName} ${each?.caseManager?.lastName}`
                : "-",
              placementStatus: convertUnderscoreToText(each.placementStatus),
              logs: each.logCount || "-",
            })) || [],
          meta: {
            pageCount: pageCount,
            totalCount: totalCount,
          },
        };
    } catch (error) {}
  };

  const toolBarExtra = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 3,
        width: "100%",
      }}
    >
      {/* <Box flexGrow={1}>
      </Box> */}
      <Button
        id="create-child"
        startIcon={<PlusIcon fontSize="small" />}
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        onClick={() => {
          ModalService.open(
            ({ close }) => (
              <ChildDetailForm
                onSuccess={() => {
                  getFsChildListData();
                  gridRef?.current?.getDataLoader();
                }}
                close={close}
              />
            ),
            {
              modalTitle: "Create Child",
              width: "50%",
              hideModalFooter: true,
            }
          );
        }}
      >
        Add child
      </Button>
      {/* <Button
        id="import-child"
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
      >
        Import
      </Button> */}
    </Box>
  );
  return (
    <Grid container spacing={2} width={1}>
      <Grid xs={12} item>
        <Box px={2}>
          <Grid item sx={{ display: "flex", flexDirection: "row" }} my={3}>
            <Typography
              color="textPrimary"
              variant="h5"
              onClick={() => navigate("/fostershare/dashboard")}
              sx={{ cursor: "pointer" }}
            >
              FosterShare
            </Typography>
            <Box
              sx={{
                m: 0.75,
              }}
              style={{ cursor: "text" }}
            >
              <ChevronRightIcon color="disabled" fontSize="small" />
            </Box>
            <Typography id="child-table-label" color="textPrimary" variant="h5">
              Children
            </Typography>
          </Grid>
          <Card sx={{ borderRadius: 2 / 8 }}>
            <CardContent sx={{ p: 3 }}>
              <Box>
                <TableComponent
                  id="child-table"
                  // rows={rows}
                  showSlno={false}
                  columns={columns}
                  hideToolbar={false}
                  toolBarExtra={toolBarExtra}
                  CustomFilterPanel={ChildListFilter}
                  dataLoader={getChildListData}
                  parentRef={gridRef}
                  filterMandatory
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChildList;
