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
import { useLocation, useNavigate } from "react-router";
import APIS from "../../../../common/hooks/UseApiCalls";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FamilyListFilter from "./FamilyListFilter";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import PlusIcon from "../../../../assets/icons/Plus";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { Tooltip } from "@mui/material";

const FamilyList = () => {
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const { signedinUserRoleFS } = useContext(CommonDataContext);

  useEffect(() => {
    document.title = "Families | ThriveWell";
  }, []);

  useAuthorization(null, signedinUserRoleFS, null, "FSFamily", false);

  const location = useLocation();
  const { familyStatus } = location.state || {};

  useEffect(() => {
    if (familyStatus) gridRef?.current?.doFilter(location.state);
    else if (gridRef?.current) {
      gridRef?.current?.doFilter({ familyStatus: "active_pending" });
    }
  }, []);

  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    {
  field: "primaryParentName",
  headerName: "Primary caregiver",
  minWidth: 200,
  flex: 1,
  renderCell: ({ row, formattedValue }) => {
    const navigateToFamily = () => {
      if (row.status !== "Incompleted") {
        navigate(`/fostershare/families/${row.familyId}`);
      } else {
        navigate(`/fostershare/families/family-details`, {
          state: {
            data: {
              parents: renderCareuserData(row),
              householdAgencyData: {
                casemanagerId: row.casemanagerId,
                id: row.familyId,
                firstName: row.primaryParent.firstName,
                lastName: row.primaryParent.lastName,
                zipCode: row.zipCode,
                city: row.city,
                stateId: row.stateId,
                primaryLanguage: row.primaryLanguage,
                licenceNumber: row.licenceNumber,
                address: row.address,
                DateStartedasFP: row?.DateStartedasFP,
              },
            },
          },
        });
      }
    };

    return (
      <Tooltip title={formattedValue || ""} arrow placement="top">
        <Box
          sx={{
            cursor: "pointer",
            color: "#f37123",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
            lineHeight: "1.4",
            maxHeight: "2.8em", // 2 lines * 1.4 line-height
          }}
          onClick={navigateToFamily}
        >
          {formattedValue}
        </Box>
      </Tooltip>
    );
  },
},
    {
      field: "primaryEmail",
      headerName: "Primary email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "caseManager",
      headerName: "Case manager",
      flex: 1,
      minWidth: 150,
      // align: "center",
      sortable: false,
    },
    {
      field: "secondaryParentsCount",
      headerName: "Number of Caregivers",
      minWidth: 150,
      align: "center",
      sortable: false,
    },
    {
      field: "children",
      headerName: "Number of children",
      // flex: 1,
      minWidth: 150,
      align: "center",
      sortable: false,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      // flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: ({ row, formattedValue }) =>
        formattedValue !== "Incompleted" ? (
          <Box
            display="flex"
            // gap={2}
            alignItems="center"
            justifyContent="space-between"
            width={1}
          >
            <Box
              borderRadius={4 / 8}
              py={3 / 4}
              px={1}
              sx={{
                background: renderStatusColorObject[formattedValue]?.color,
                color: "#fff",
              }}
            >
              {renderStatusColorObject[formattedValue]?.value}
            </Box>
            <ArrowRightIcon
              id="view-icon"
              onClick={() => navigate(`/fostershare/families/${row.familyId}`)}
              titleAccess="View"
              sx={{ cursor: "pointer", fontSize: "2rem" }}
            />
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            sx={{ cursor: "pointer", color: "#f37123" }}
            onClick={() =>
              navigate(`/fostershare/families/family-details`, {
                state: {
                  data: {
                    parents: renderCareuserData(row),
                    householdAgencyData: {
                      casemanagerId: row.casemanagerId,
                      id: row.familyId,
                      firstName: row.primaryParent.firstName,
                      lastName: row.primaryParent.lastName,
                      zipCode: row.zipCode,
                      city: row.city,
                      stateId: row.stateId,
                      primaryLanguage: row.primaryLanguage,
                      licenceNumber: row.licenceNumber,
                      address: row.address,
                      DateStartedasFP: row?.DateStartedasFP,
                    },
                  },
                },
              })
            }
          >
            <EditRoundedIcon
              id="edit-icon"
              onClick={() => navigate(`/fostershare/families/${row.familyId}`)}
              // titleAccess="View"
            />
            <Typography
              color="primary"
              variant="subtitle2"
              fontWeight={500}
              fontSize="1rem"
            >
              Complete setup
            </Typography>
          </Box>
        ),
    },
  ];

  const renderStatusColorObject = {
    Pending: {
      color: "#F5A70B",
      value: "Pending",
    },
    Active: {
      color: "#357323",
      value: "Active",
    },
    InActive: {
      color: "#C6C4BE",
      value: "Inactive",
    },
  };

  const renderCareuserData = ({ primaryParent, secondaryParent }) => {
    let params = [
      {
        id: primaryParent.parentId,
        firstName: primaryParent.firstName,
        lastName: primaryParent.lastName,
        email: primaryParent.email,
        phoneNumber: primaryParent.phoneNumber,
        occupation: primaryParent.occupation,
      },
    ];
    if (secondaryParent)
      params.push({
        firstName: secondaryParent.firstName,
        lastName: secondaryParent.lastName,
        email: secondaryParent.email,
        phoneNumber: secondaryParent.phoneNumber,
        occupation: secondaryParent.occupation,
        id: secondaryParent.parentId,
      });
    return params;
  };

  const getFamilyListData = async ({
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
      const res = await APIS.getFsFamilyList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data?.data.map((each, index) => ({
              id: index,
              primaryParentName: each?.primaryParentId ? `${each?.primaryParent?.lastName} ${each?.primaryParent?.firstName}` : `${each?.firstName} ${each?.lastName}`,
              secondaryParentName: each?.secondaryParent
                ? `${each?.secondaryParent?.firstName} ${each?.secondaryParent?.lastName}`
                : "-",
              primaryEmail: each?.primaryParent?.email || "-",
              location: each.location,
              children: each.childCount,
              status: each?.familyStatus,
              familyId: each.id,
              primaryParent: {
                firstName: each.firstName,
                lastName: each.lastName,
                phoneNumber: each?.primaryParent?.phoneNumber,
                occupation: each?.primaryParent?.occupation,
                parentId: each?.primaryParent?.id,
                email: each?.primaryParent?.email,
              },
              secondaryParent: each.secondaryParent
                ? {
                    firstName: each.secondaryParent?.firstName,
                    lastName: each.secondaryParent?.lastName,
                    phoneNumber: each.secondaryParent?.phoneNumber,
                    occupation: each.secondaryParent?.occupation,
                    parentId: each.secondaryParent?.id,
                    email: each.secondaryParent?.email,
                  }
                : null,
              casemanagerId: each.casemanager,
              caseManager: `${each?.casemanager?.firstName} ${each?.casemanager?.lastName}`,
              zipCode: each.zipCode,
              city: each.city,
              stateId: each.HTStateId,
              primaryLanguage: each.primaryLanguage,
              licenceNumber: each.licenceNumber,
              address: each.address,
              DateStartedasFP: each?.DateStartedasFP,
              secondaryParentsCount: (each.secondaryParentsCount || 0) + 1,
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
      <Button
        id="create-family"
        startIcon={<PlusIcon fontSize="small" />}
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        onClick={() => {
          navigate("/fostershare/families/family-details");
        }}
      >
        {"Add new family"}
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
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/fostershare/dashboard")}
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
              id="family-table-label"
              color="textPrimary"
              variant="h5"
            >
              {"Families"}
            </Typography>
          </Grid>
          <Card sx={{ borderRadius: 2 / 8 }}>
            <CardContent sx={{ p: 3 }}>
              <Box>
                <TableComponent
                  showSlno={false}
                  id="family-table"
                  columns={columns}
                  hideToolbar={false}
                  toolBarExtra={toolBarExtra}
                  dataLoader={getFamilyListData}
                  CustomFilterPanel={FamilyListFilter}
                  parentRef={gridRef}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FamilyList;