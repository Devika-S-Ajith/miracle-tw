import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import ReusableTrendTable from '../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable';
import { Autocomplete, Stack, TextField, Box, Chip, Grid, Tooltip } from "@mui/material";
import { ModalService } from '../../components/Modal';
import ManageSupportServicesForm from './SupportServicesForm/ManageSupportServicesForm';
import APIS from '../../common/hooks/UseApiCalls';
import { useNavigate } from 'react-router';
// import { SUPER_ADMIN } from '../../helpers/constant';
import SecondaryButton from '../../components/SecondaryButton/SecondaryButton';
import PageBreadcrumbs from '../../components/PageBreadcrumbs/PageBreadcrumbs';
import { ArrowRight } from "@mui/icons-material";

// import useAuthorization from '../../components/UserComponents/useAuthorization';
const SupportServicesList = () => {

  useEffect(() => {
    document.title = "Support Services | Thrivewell";
  }, []);

  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const [ loading, setLoading ] = useState(false);
  const [ apiError, setApiError ] = useState(null); 
  const [ tableData, setTableData ] = useState({
    data: [],
    pageCount:1,
    totalCount:0,
  });
 

  useEffect(()=> {
    getTableData();
  },[]);

  const columnDefinition = [
    {
      id: "name",
      label: t("common:common.Support Service Name", "Support Service Name"),
      enableSorting: true,
    },
    {
      id: "phoneNumber",
      label: t("common:common.Phone", "Phone"),
      enableSorting: false,
    },
    {
      id: "email",
      label: t("common:common.Email", "Email"),
      enableSorting: false,
    },
    {
      id: "website",
      label: t("common:common.Website", "Website"),
      enableSorting: false,
    },
    {
      id: "actions",
      label: "",
      enableSorting: false,
      render: (row) => (
        <ArrowRight
          style={{ cursor: "pointer" }}
          fontSize="large"
          id="view-icon"
          onClick={() => navigate(`/admin/support-services/${row.id}`)}
          sx={{ cursor: "pointer" }}
        />
      )
    }
  ];

  const getTableData = async (params = {}) => {
    setLoading(true);
    setApiError(null);

    const {
      page = 1,
      rowCount = 10,
     search = "",
    } = params || {};

    const payload = {
      rowCount: rowCount || 10,
      pageNumber: page || 1,
      globalSearchQuery:search
    };

    try{
      const response = await APIS.GetSupportServiceList({
        ...payload,});
      const { data } = response;
      const { pageCount, totalCount } = data;
       const formattedData = response?.data?.data.map((item)=> ({
        id: item?.id,
        name: item?.name,
        phoneNumber: item?.phoneNumber || "-",
        email:item?.email || "-",
        website:item?.website || "-",
        
      })) || [];
        setTableData({
        data: formattedData || [],
        pageCount:data?.pageCount || 1,
        totalCount:data?.totalCount || 0,
        
      });
      // console.log("formattedData:", formattedData);
    } catch (error) {
    setApiError("Failed to fetch support service data");
    }
    finally{
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
            label={t("common:tableColumn.Add Support Service", "Add Support Service")}
            onClick={() =>
              ModalService.open(
                ({ close }) => 
                  <ManageSupportServicesForm 
                    close={close} 
                    onSuccess={getTableData}/>,
                {
                  modalTitle: (
                    <Box>
                     {t(
              "common:infoCard.Support service details",
              "Support service details",
            )}
                    </Box>
                  ),
                  width: "30%",
                  maxHeight: "95%",
                  hideModalFooter: true,
                  enableClose: true,
                },
              )
            }
          />
        </Stack>
      </>
    );
  
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
                  label: t("common:common.Support Services", "Support Services"),
                },
              ]}
            />

            <Box mt={2} mr>
              <ReusableTrendTable
                columns={columnDefinition}
                searchable
                tableData={tableData.data}
                loading={loading}
                skeltonRowcount={6}
                apiError={apiError}
                onReload={getTableData}
                // filterable
                // filterComponent={filterComponent}
                // handleChipDelete={handleChipDelete}
                // appliedFiltersChipArray={appliedFiltersChipArray}
                // applyFilter={handleApplyFilters}
                // cancelFilter={cancelFilterHandler}
                // clearFilter={clearFiltersHandler}
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
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default SupportServicesList;