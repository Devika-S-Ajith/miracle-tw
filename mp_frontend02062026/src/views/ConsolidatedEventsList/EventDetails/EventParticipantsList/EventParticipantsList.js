import React, { useContext, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useNavigate } from "react-router";
import APIS from "../../../../common/hooks/UseApiCalls";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import { formatAddressFromContactInfo } from "../../../../helpers/helperFunction";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const EventParticipantsList = ({ eventId, eventData }) => {
  const gridRef = useRef(null);
  const { locationList } = useContext(CommonDataContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (gridRef?.current) {
      gridRef?.current?.getDataLoader();
    }
  }, [eventData]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "children",
      headerName: "Children",
      minWidth: 150,
      flex: 1,
      sortable: false,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 1,
    },

    {
      sortable: false,
      align: "center",
      renderCell: ({ row }) => (
        <RemoveRedEyeIcon
          id="view-icon"
          onClick={() => navigate(`/dashboard/families/${row?.familyId}/view`)}
          sx={{ cursor: "pointer" }}
          titleAccess="View"
        />
      ),
    },
  ];

  const getEventParticipantsList = async ({
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
      eventId: eventId,
    };
    if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.getEventParticipantsList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data?.data.map((each) => ({
              id: each.id,
              familyId: each?.family?.id,
              name: each.family.familyName,
              "family.firstName": each?.familyDetails
                ? each?.familyDetails?.members
                    .map((member) => member?.firstName)
                    .join(", ")
                : "-",
              "caseManager.firstName": each?.caseManager
                ? `${each?.caseManager?.firstName} ${each?.caseManager?.lastName}`
                : "-",
              email: each.parent.email,
              location: formatAddressFromContactInfo(
                                  each?.family,
                                  locationList,
                                ),
                                //  [each?.family?.address, each?.family?.city].join(", "),
              children: each.childrenCount,

              status: each?.status,
            })) || [],
          meta: {
            pageCount: pageCount,
            totalCount: totalCount,
          },
        };
    } catch (error) {}
  };
  return (
    <Box width={1}>
      <Box mb={2}>
        <Typography
          id="family-table-label"
          color="textPrimary"
          variant="h5"
          pb={0}
        >
          Event participants
        </Typography>
      </Box>
      <TableComponent
        id="log-overview-table"
        showSlno={false}
        // rows={rows}
        columns={columns}
        hideToolbar={false}
        // toolBarExtra={toolBarExtra}
        dataLoader={getEventParticipantsList}
        parentRef={gridRef}
      />
    </Box>
  );
};

export default EventParticipantsList;
