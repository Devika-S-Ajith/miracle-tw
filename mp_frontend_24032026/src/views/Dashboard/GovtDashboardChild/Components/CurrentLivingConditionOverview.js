import { useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import OrganizationOverviewCard from "../../Components/StateGovDashboardComponents/OrganizationOverviewCard";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const CurrentLivingConditionOverview = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [apiError, setApiError] = useState(false);
      const { navbarFilterValues, linkedAccounts } = useContext(CommonDataContext);
      const [loading, setLoading] = useState(false);

    const getCurrentLivingCondition = async () => {
            setLoading(true);
            setApiError(null);  
            const payload = {
                ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
              
            };
            if (payload.countryFilter === null) {
                return;
            }
            try {
                const response = await APIS.GetCurrentLivingCondition(payload);
                const transformedData = response?.data?.data?.map(item => ({
                    label: item.category,
                    value: item.count
                }));
                
                setData(transformedData || []);
                setApiError(null);
            } catch (error) {
                setApiError("Failed to fetch current living condition data");
            } finally {
                setLoading(false);
            }
        };
    

    useEffect(() => {
        UpdateDashboardDataViews();
        if (localStorage.getItem("userRegion")) {
            getCurrentLivingCondition();
        }
    }, [localStorage.getItem("userRegion"), navbarFilterValues, linkedAccounts]);

    return (
        <OrganizationOverviewCard
            data={data}
            loading={loading}
            title={t(
                "common:infoCard.Current living condition",
                "Current living condition"
            )}
            apiError={apiError}
            onReload={getCurrentLivingCondition}
        />
    );
};

export default CurrentLivingConditionOverview;