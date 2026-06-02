import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import APIS from "../../../common/hooks/UseApiCalls";
import InfoCard from "../../../components/InfoCard";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { getNavbarFilterPayload } from "../../../constants";

const ActiveRedFlagMilestones = () => {
  const { t } = useTranslation(["common"]);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([
    {
      label: t("common:Families with active “In crisis” red flags"),
      value: "0/0",
    },
    {
      label: t("common:Families with active “Vulnerable” red flags"),
      value: "0/0",
    },
    {
      label: t("common:Children with active “In crisis” red flags"),
      value: "0/0",
    },
    {
      label: t("common:Children with active “Vulnerable” red flags"),
      value: "0/0",
    },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload =  {
            ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
            ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
          };
      // Update this when the correct API is ready
      const response = await APIS.GetGovtDashboardRedflagOverview(payload);
      if (response.data && response.data.data) {
        const milestones = response.data.data[0];
        setData([
          {
            label: t("common:Families with active  “In crisis” red flags"),
            value: `${milestones.familiesWithIncrisisRedflagMilestone} / ${milestones.totalFamily}`,
          },
          {
            label: t("common:Families with active  “Vulnerable” red flags"),
            value: `${milestones.familiesWithVulnerableRedflagMilestone} / ${milestones.totalFamily}`,
          },
          {
            label: t("common:Children with active  “In crisis” red flags"),
            value: `${milestones.childrenWithIncrisisRedflagMilestone} / ${milestones.totalChildren}`,
          },
          {
            label: t("common:Children with active  “Vulnerable” red flags"),
            value: `${milestones.childrenWithVulnerableRedflagMilestone} / ${milestones.totalChildren}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching active red flag milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) fetchData();
  }, [navbarFilterValues, localStorage.getItem("userRegion"), signedinOrgType]);

  return (
    <InfoCard
      title={t("common:Active Red Flag Milestones")}
      data={data}
      loading={loading}
    />
  );
};

export default ActiveRedFlagMilestones;
