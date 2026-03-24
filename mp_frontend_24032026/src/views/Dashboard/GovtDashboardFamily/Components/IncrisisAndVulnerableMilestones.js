import { useContext, useEffect, useState } from "react";
import MultiLineGraph from "../../../../components/MultilineGraph/MultiLineGraph";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";

const IncrisisAndVulnerableMilestones = () => {
  const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
   const userRegion = localStorage.getItem("userRegion");
   const [chartData, setChartData] = useState([]);
 
   // Categories configuration
   const chartCategories = [
     {
       key: "InCrisisRedFlagMilestone",
       color: "#BC1041",
       lineType: "solid",
       linearOrMonotone: "linear",
       label: "In crisis red flag milestone",
     },
     {
       key: "VulnerableRedFlagMilestone",
       color: "#F37123",
       lineType: "solid",
       linearOrMonotone: "linear",
       label: "Vulnerable red flag milestone",
     },
     {
       key: "InCrisisMilestone",
       color: "#BC1041",
       lineType: "dotted",
       linearOrMonotone: "linear",
       label: "In crisis milestone",
     },
     {
       key: "VulnerableMilestone",
       color: "#F37123",
       lineType: "dotted",
       linearOrMonotone: "linear",
       label: "Vulnerable milestone",
     },
   ];
 
   const [loading, setLoading] = useState(false);
   const [apiError, setApiError] = useState(false);
 
   const fetchData = async () => {
     setLoading(true);
     setApiError(null);
 
     const payload = {
       ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
     };
     if (payload.countryFilter === null) {
       return;
     }
     try {
       const response = await APIS.GetIncrisisAndVulnerableMilestonesFamilies(
         payload
       );
       const incrisisAndVulnerableMilestonesFamily = response.data.data || [];
       const transformedData = incrisisAndVulnerableMilestonesFamily.map(
         (item, idx) => ({
           shortLabel: `A${item?.assessment_number}`,
           longLabel: `Assessment ${item?.assessment_number}`,
           InCrisisRedFlagMilestone: item?.InCrisisRedFlagMilestones || 0,
           VulnerableRedFlagMilestone: item?.VulnerableRedFlagMilestones || 0,
           InCrisisMilestone: item?.InCrisisMilestones || 0,
           VulnerableMilestone: item?.VulnerableMilestones || 0,
         })
       );
       setChartData(transformedData);
       setApiError(null);
     } catch (err) {
       setApiError("Failed to fetch data");
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
    UpdateDashboardDataViews();
     if (userRegion) {
       fetchData();
     }
   }, [navbarFilterValues, userRegion]);

    return (
        <MultiLineGraph
            title="In crisis and Vulnerable milestones for all families, by assessment"
            data={chartData}
            categories={chartCategories}
            loading={loading}
            apiError={apiError}
            onReload={fetchData}
            showSkeleton={true}
            skeletonCount={3}
        />
    );
};

export default IncrisisAndVulnerableMilestones; ;
