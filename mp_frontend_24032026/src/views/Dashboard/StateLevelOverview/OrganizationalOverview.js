import { useState, useEffect } from "react";
import InfoCard from "../../../components/InfoCard";
import { useTranslation } from "react-i18next";

const OrganizationalOverview = () => {
  const { t } = useTranslation(["common"]);
  // Example data, replace with real data as needed
const [data, setData] = useState([
    {
        label: t("common:govtDashboard.Total # of active orgs"),
        value: 0,
    },
    {
        label: t("common:govtDashboard.Total # of active children"),
        value: 0,
    },
    {
        label: t("common:govtDashboard.New children (last 30 days)"),
        value: 0,
    },
    {
        label: t("common:govtDashboard.Total # of active families"),
        value: 0,
    },
    {
        label: t("common:govtDashboard.New families (last 30 days)"),
        value: 0,
    },
    {
        label: t("common:govtDashboard.Total active interventions"),
        value: 0,
    },
]);

const fetchData = async () => {
    // Replace with your actual API call
    // Example response:
    const response = await fetch("/api/dashboard/overview");
    const result = await response.json();
    setData([
        {
            label: t("common:govtDashboard.Total # of active orgs"),
            value: result.activeOrgs,
        },
        {
            label: t("common:govtDashboard.Total # of active children"),
            value: result.activeChildren,
        },
        {
            label: t("common:govtDashboard.New children (last 30 days)"),
            value: result.newChildren,
        },
        {
            label: t("common:govtDashboard.Total # of active families"),
            value: result.activeFamilies,
        },
        {
            label: t("common:govtDashboard.New families (last 30 days)"),
            value: result.newFamilies,
        },
        {
            label: t("common:govtDashboard.Total active interventions"),
            value: result.activeInterventions,
        },
    ]);
};

useEffect(() => {
    // fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
     <InfoCard  title={"Organizational overview"} data={data} />
  );
};

export default OrganizationalOverview;
