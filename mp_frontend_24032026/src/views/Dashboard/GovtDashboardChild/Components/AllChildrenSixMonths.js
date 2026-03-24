import { useContext, useEffect, useState } from "react";
import { getSixMonthRange } from "../../../../helpers/helperFunction";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import MultiLineGraph from "../../../../components/MultilineGraph/MultiLineGraph";

const AllChildrenSixMonths = () => {
    const {
        navbarFilterValues,
        linkedAccounts,
    } = useContext(CommonDataContext);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(false);

    const chartCategories = [
        {
            key: "NewChildren",
            color: "#C5D86D",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "New children",
        },
        {
            key: "ActiveChildren",
            color: "#71C5D4",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "Active children",
        },
        {
            key: "MaleChildren",
            color: "#F37123",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "Male children",
        },
        {
            key: "FemaleChildren",
            color: "#F79C65",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "Female children",
        },
        {
            key: "InactiveChildren",
            color: "#1D334B",
            lineType: "solid",
            linearOrMonotone: "linear",
            label: "Inactive children",
        },
        
    ];

       useEffect(() => {
            UpdateDashboardDataViews();
            if (localStorage.getItem("userRegion")) {
                getAllChildrenSixMonths();
            }
        }, [navbarFilterValues, localStorage.getItem("userRegion")]);

    

    const getAllChildrenSixMonths = async () => {
            setLoading(true);
            setApiError(null);
            const { startDate, endDate } = getSixMonthRange();
    
            const payload = {
                ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
                "startDate": startDate,
                "endDate": endDate
            };
            if (payload.countryFilter === null) {
                setLoading(false);
                return;
            }
            try {
                const response = await APIS.GetAllChildrenSixMonths(payload);
                const allChildrenSixMonths = response?.data?.data || [];
                allChildrenSixMonths.map((item) => {
                    item.shortLabel = new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    item.longLabel = new Date(item.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    item.NewChildren = item.newChildren
                    item.ActiveChildren = item.activeChildren
                    item.InactiveChildren = item.caseClosed 
                    item.MaleChildren = item.maleChildren
                    item.FemaleChildren = item.femaleChildren
                    return item;   
                });
                setTableData(allChildrenSixMonths);
                setApiError(null);
            } catch (error) {
                setApiError("Failed to fetch milestones data");
            } finally {
                setLoading(false);
            }
        };

    const handleReload = () => {
       getAllChildrenSixMonths();
    };

    return (
        <MultiLineGraph
            title="All children (last 6 months)"
            data={tableData}
            categories={chartCategories}
            loading={loading}
            apiError={apiError}
            onReload={handleReload}
        />
    );
};

export default AllChildrenSixMonths;
