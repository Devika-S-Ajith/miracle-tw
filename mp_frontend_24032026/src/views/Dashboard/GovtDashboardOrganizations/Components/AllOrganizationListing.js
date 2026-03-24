import { useState, useEffect, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import ReusableTrendTable from "../../GovtDashboardOverview/Components/ReusableTrendTable";
import { Typography } from "@mui/material";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useNavigate } from "react-router-dom";
import { getNavbarFilterPayload } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";

const AllOrganizationListing = (props) => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { navbarFilterValues,linkedAccounts } = useContext(CommonDataContext);
    const [apiError, setApiError] = useState(false);
    const { t } = useTranslation(["common"]);
    const navigate = useNavigate();

    const columnDefinition = [
        {
            id: "accountName",
            label: "Organization name",
            enableSorting: true,
            maxWidth: "250px",
            minWidth: "250px",
            render: (row) => (
                <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`${window.location.pathname}/${row.TWAccountId}?accountName=${encodeURIComponent(row.accountName)}`)}
                >
                    {row?.accountName}
                </Typography>
            )
        },
        {
            id: "stateName",
            label: "State",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" fontWeight="medium">
                    {row.stateName || "-"}
                </Typography>
            )
        },
        {
            id: "districtName",
            label: "District",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.districtName || "-"}
                </Typography>
            )
        },
        {
            id: "zipCode",
            label: "Postal code",
            enableSorting: true,
        },
        {
            id: "active_families",
            label: "# active families",
            maxWidth: "200px",
            minWidth: "200px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.active_families}
                </Typography>
            )
        },
        {
            id: "active_childrens",
            label: "# active children",
            maxWidth: "200px",
            minWidth: "200px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.active_childrens}
                </Typography>
            )
        },
        {
            id: "avg_total_score",
            label: "Average thrive scale score",
            maxWidth: "150px",
            minWidth: "150px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.avg_total_score !== undefined && row.avg_total_score !== null && row.avg_total_score !== "" ? `${row.avg_total_score}%` : "-"}
                </Typography>
            )
        },
        {
            id: "avg_domain_4_score",
            label: "Average education score",
            maxWidth: "150px",
            minWidth: "150px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.avg_domain_4_score !== undefined && row.avg_domain_4_score !== null && row.avg_domain_4_score !== "" ? `${row.avg_domain_4_score}%` : "-"}
                </Typography>
            )
        },
        {
            id: "avg_domain_5_score",
            label: "Average health and mental health score",
            maxWidth: "150px",
            minWidth: "150px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.avg_domain_5_score !== undefined && row.avg_domain_5_score !== null && row.avg_domain_5_score !== "" ? `${row.avg_domain_5_score}%` : "-"}
                </Typography>
            )
        },
        {
            id: "avg_domain_1_score",
            label: "Average family and social relationship score",
            maxWidth: "150px",
            minWidth: "150px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row?.avg_domain_1_score !== undefined && row?.avg_domain_1_score !== null && row?.avg_domain_1_score !== "" ? `${row?.avg_domain_1_score}%` : "-"}
                </Typography>
            )
        },
        {
            id: "avg_domain_2_score",
            label: "Average household economy score",
            maxWidth: "150px",
            minWidth: "150px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.avg_domain_2_score !== undefined && row.avg_domain_2_score !== null && row.avg_domain_2_score !== "" ? `${row.avg_domain_2_score}%` : "-"}
                </Typography>
            )
        },
        {
            id: "avg_domain_3_score",
            label: "Average living condition score",
            maxWidth: "150px",
            minWidth: "150px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.avg_domain_3_score !== undefined && row.avg_domain_3_score !== null && row.avg_domain_3_score !== "" ? `${row.avg_domain_3_score}%` : "-"}
                </Typography>
            )
        },
        {
            id: "total_redflagincrisiscount",
            label: "Active in crisis red flags",
            maxWidth: "250px",
            minWidth: "250px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.total_redflagincrisiscount || 0}
                </Typography>
            )
        },
        {
            id: "total_redflaginvulnerablecount",
            label: "Active Vulnerable red flags",
            maxWidth: "250px",
            minWidth: "250px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.total_redflaginvulnerablecount || 0}
                </Typography>
            )
        },
        {
            id: "total_activeinterventionscount",
            label: "Active interventions",
            maxWidth: "200px",
            minWidth: "200px",
            enableSorting: true,
            render: (row) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    {row.total_activeinterventionscount || 0}
                </Typography>
            )
        }
    ];


    const LinkedOrganizationDetails = useCallback(
        async (params = {}) => {
            try {
                setLoading(true);
                setApiError(false);
                // Extract params
                const { search = '', sort = 'accountName', order = 'asc', page, rowCount } = params || {};

                const payload = {
                    ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
                    accountNameFilter: search,
                    orderByField: [[sort, order.toUpperCase()]],
                    pageNumber: page || 1,
                    rowCount: rowCount || 10, // Default row count if not provided
                };
                if(payload.countryFilter === null) {
                    return;     
                }
                const response = await APIS.GetGovtDashboardOrganizationList(
                    payload
                );
                const organizationListData = response.data || [];
                setTableData(organizationListData);
                setLoading(false);
                setApiError(null);

            } catch (error) {
                setApiError(true);
            } finally {
                setLoading(false);
            }
        },
        [navbarFilterValues,linkedAccounts, localStorage.getItem("userRegion")],
    );

    useEffect(() => {
        if (localStorage.getItem("userRegion")) {
            LinkedOrganizationDetails();
        }
    }, [navbarFilterValues,localStorage.getItem("userRegion")]);


    const handleReload = (params={}) => {
        LinkedOrganizationDetails(params);
    };

    return (
        <ReusableTrendTable
            columns={columnDefinition}
            title="All organizations"
            searchable={true}
            tableData={tableData?.data || []}
            skeltonRowcount={5}
            loading={loading}
            apiError={apiError}
            enablePagination={true}
            enableSorting={true}
            t={t}
            onReload={handleReload}
            totalPageCount={tableData?.pageCount}
            totalItems={tableData?.total || 0}
            defaultSortField="accountName"
            defaultSortFieldOrder="asc"
            searchPlaceholder="Search by organization name"
        />
    );
};

export default AllOrganizationListing;