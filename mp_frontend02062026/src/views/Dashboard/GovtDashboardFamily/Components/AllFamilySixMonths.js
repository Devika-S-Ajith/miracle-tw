import { useContext, useEffect, useState } from "react";
import MultiLineGraph from "../../../../components/MultilineGraph/MultiLineGraph";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";
import { getSixMonthRange } from "../../../../helpers/helperFunction";



const AllFamiliesSixMonths = () => {
     const {
        navbarFilterValues,
        linkedAccounts,
      } = useContext(CommonDataContext);
      const [tableData, setTableData] = useState([]);
      const [loading, setLoading] = useState(false);
      const [apiError, setApiError] = useState(false);

    // Categories configuration
    const chartCategories = [
        {
            key: "NewFamilies",
            color: "#C5D86D",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "New families",
        },
        {
            key: "ActiveFamilies",
            color: "#71C5D4",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "Active families",
        },
        {
            key: "InactiveFamilies",
            color: "#1D334B",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "Inactive families",
        },
        
    ];

    


    const getAllFamiliesSixMonths = async () => {
        setLoading(true);
        setApiError(null);
        const { startDate, endDate } = getSixMonthRange();

        const payload = {
            ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
            "startDate": startDate,
            "endDate": endDate
        };
        if (payload.countryFilter === null) {
            return;
        }
        try {
            const response = await APIS.GetAllFamilesSixMonths(payload);
            const allFamiliesSixMonths = response?.data?.data || [];
            allFamiliesSixMonths.map((item) => {
                item.shortLabel = new Date(item.month_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                item.longLabel = new Date(item.month_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });   
                item.NewFamilies = item.new_families_created;
                item.ActiveFamilies = item.active_families_count;
                item.InactiveFamilies = item.inactive_families_count;
                return item;   
            });
            setTableData(allFamiliesSixMonths);
            setApiError(null);
        } catch (error) {
            setApiError("Failed to fetch milestones data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    UpdateDashboardDataViews();
        if (localStorage.getItem("userRegion")) {
            getAllFamiliesSixMonths();
        }
    }, [navbarFilterValues, localStorage.getItem("userRegion")]);

    const handleReload = () => {
         getAllFamiliesSixMonths();
    };

    return (
        <MultiLineGraph
            title="All families (last 6 months)"
            data={tableData}
            categories={chartCategories}
            loading={loading}
            apiError={apiError}
            onReload={handleReload}
            showSkeleton={true}
            skeletonCount={3}
        />
    );
};

export default AllFamiliesSixMonths ;
