import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Box, Grid } from "@mui/material";
import APIS from "../../common/hooks/UseApiCalls";
import { useNavigate } from "react-router";
import { dateFormatter, timeFormatter } from "../../../src/constants";
import SecondaryButton from "../../components/SecondaryButton/SecondaryButton";
import ManageEventsForm from "./EventsForm/ManageEventsForm";
import PageBreadcrumbs from "../../components/PageBreadcrumbs/PageBreadcrumbs";
import { ModalService } from "../../components/Modal";
import ReusableTrendTable from "../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import useAuthorization from "../../components/UserComponents/useAuthorization";
import PageLoader from "../../components/UserComponents/PageLoader";
import { ArrowRight } from "@mui/icons-material";

const ConsolidatedEventsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [tableData, setTableData] = useState({
    data: [],
    pageCount: 1,
    totalCount: 0,
  });
  const { authStatus, checkAuth } = useAuthorization("Events");

  useEffect(() => {
    document.title = "Events | Thrivewell";
    checkAuth();
  }, []);

  useEffect(() => {
    if (authStatus === "authorized") {
      getTableData();
    }
  }, [authStatus]);

  const columnDefinition = [
    {
      id: "title",
      label: "Event title",
      enableSorting: true,
    },
    {
      id: "description",
      label: "Description",
      enableSorting: false,
    },
    {
      id: "participantsInvited",
      label: "# of families invited",
      enableSorting: false,
    },
    {
      id: "participantsResponded",
      label: "# of families RSVP'd",
      enableSorting: false,
    },
    {
      id: "date",
      label: "Date",
      enableSorting: true,
    },
    {
      id: "startsAt",
      label: "Time",
      // render: (row) =>
      //   `${row.startsAt}`,
      enableSorting: false,
    },

    {
     id: "actions",
      label: "",
      align: "right",
      minWidth: "30px",
      maxWidth: "30px",

      render: (row) => (
        <ArrowRight
          style={{ cursor: "pointer" }}
          fontSize="large"
          id="view-icon"
          onClick={() => navigate(`/dashboard/events/${row.id}`)}
          sx={{ cursor: "pointer" }}
        />
      ),
    },
  ];

  const getTableData = async (params = {}) => {
    setLoading(true);
    setApiError(null);

    const {
      search = "",
      // filter = filterValues,
      sort = "date",
      order = "desc",
      page = 1,
      rowCount = 10,
    } = params || {};

    const payload = {
      rowCount: rowCount || 10,
      pageNumber: page || 1,
      // searchText: search,
      orderByField: [[sort, order.toUpperCase()]],
    };

    try {
      const response = await APIS.GetEventList(payload);

      const formattedData =
        response?.data?.data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: dateFormatter(item.date),
          startsAt: timeFormatter(item.startsAtTimestamp),
          participantsInvited: item.participantsInvited,
          participantsResponded: item.participantsResponded,
        })) || [];

      setTableData({
        data: formattedData || [],
        pageCount: response?.data?.pageCount || 1,
        totalCount: response?.data?.totalCount || 0,
      });
      console.log("API DATA →", response?.data?.data);
      setApiError(null);
    } catch (err) {
      setApiError("Failed to fetch events data");
    } finally {
      setLoading(false);
    }
  };

  const tableExtraButtons = (
    <>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        width={1}
        mr={2}
      >
        <SecondaryButton
          startIcon={
            <img
              src="/static/icons/AddIcon.svg"
              style={{ width: 20, height: 20 }}
            />
          }
          label={t("common:calendar.Add Event")}
          onClick={() =>
            ModalService.open(
              ({ close }) => <ManageEventsForm onSuccess={getTableData} close={close} />,
              {
                modalTitle: <Box>Event</Box>,
                width: "30%",
                height: "95%",
                hideModalFooter: true,
                enableClose: true,
              },
            )
          }
        />
      </Stack>
    </>
  );

  if (authStatus === "loading" || authStatus === "idle") {
    return <PageLoader />;
  }

  if (authStatus === "unauthorized") {
    return null; // Or a custom message
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <PageBreadcrumbs
              data={[
                {
                  label: t("common:Events", "Events"),
                },
              ]}
            />

            {tableData && (
              <Box mt={2} mr>
                <ReusableTrendTable
                  columns={columnDefinition}
                  searchable
                  tableData={tableData.data}
                  loading={loading}
                  skeltonRowcount={6}
                  apiError={apiError}
                  onReload={getTableData}
                  tableExtraButtons={tableExtraButtons}
                  t={t}
                  enablePagination
                  totalPageCount={tableData.pageCount}
                  totalItems={tableData.totalCount || 0}
                  cardSx={{ textTransform: "capitalize" }}
                  defaultSortField={"date"}
                  defaultSortFieldOrder={"desc"}
                  boldHeaders={false}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ConsolidatedEventsList;
