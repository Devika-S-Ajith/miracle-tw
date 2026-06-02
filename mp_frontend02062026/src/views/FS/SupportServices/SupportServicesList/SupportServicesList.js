import React, { useContext, useEffect, useRef, useState } from "react";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Box, Button, Card, Grid, Typography } from "@mui/material";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import SupportServiceDetailForm from "../../Components/SupportServiceDetailForm";
import { ModalService } from "../../../../components/Modal";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { useNavigate } from "react-router";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import APIS from "../../../../common/hooks/UseApiCalls";
import PlusIcon from "../../../../assets/icons/Plus";
import { ArrowRight } from "@mui/icons-material";
import { SUPER_ADMIN } from "../../../../helpers/constant";

const SupportServicesList = () => {
  const { signedinUserRoleFS } = useContext(CommonDataContext);
  const gridRef = useRef(null);
  const navigate = useNavigate();
  useAuthorization(null, signedinUserRoleFS, null, "SupportService", false);

  useEffect(() => {
    document.title = "Support services | ThriveWell";
  }, []);

  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Support service name",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone",
      minWidth: 80,
      flex: 1,
      sortable: false,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "website",
      headerName: "Website",
      minWidth: 150,
      flex: 1,
    },
    {
      sortable: false,
      renderCell: (row) => (
        <ArrowRight
          style={{ cursor: "pointer" }}
          fontSize="large"
          id="view-icon"
          onClick={() => navigate(`/fostershare/support-services/${row.id}`)}
          sx={{ cursor: "pointer" }}
        />
      ),
      width: 60,
      align: "right",
    },
  ];

  const getSupportServiceList = async ({
    rowCount,
    pageNumber,
    globalSearchQuery,
    orderByField,
  }) => {
    let params = {
      rowCount,
      pageNumber,
      accountId: [SUPER_ADMIN].includes(signedinUserRoleFS)
        ? null
        : localStorage.getItem("orgId"),
    };
    if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.GetSupportServiceList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data?.data.map((each) => ({
              id: each?.id,
              name: each?.name,
              phone: each?.phoneNumber,
              email: each?.email || "-",
              website: each?.website || "-",
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
        justifyContent: "end",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      <Button
        id="create-support-service"
        sx={{ borderRadius: "4px", height: "48px" }}
        startIcon={<PlusIcon fontSize="small" />}
        variant="contained"
        onClick={() => {
          ModalService.open(
            ({ close }) => (
              <SupportServiceDetailForm
                close={close}
                onSuccess={() => gridRef?.current?.getDataLoader()}
              />
            ),
            {
              modalTitle: "Support service information",
              width: "35%",
              hideModalFooter: true,
            }
          );
        }}
      >
        Add support service
      </Button>
    </Box>
  );
  return (
    <Box p={1}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={1}>
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
        <Typography
          id="support services-table-label"
          color="textPrimary"
          variant="h5"
        >
          Support services
        </Typography>
      </Grid>

      <Card sx={{ borderRadius: 2 / 8 }}>
        <Box p={2}>
          <TableComponent
            id="support-services-table"
            showSlno={false}
            columns={columns}
            hideToolbar={false}
            dataLoader={getSupportServiceList}
            parentRef={gridRef}
            toolBarExtra={toolBarExtra}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default SupportServicesList;
