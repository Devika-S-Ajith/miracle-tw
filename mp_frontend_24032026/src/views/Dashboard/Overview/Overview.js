import React, { useContext } from "react";
import LegacyOverviewPage from "../../Dashboard/Overview/Components/LegacyOverviewPage";
import ConsolidatedOverviewPage from "../../Dashboard/Overview/Components/ConsolidatedOverviewPage";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { SUPER_ADMIN } from "../../../helpers/constant";

const Overview = () => {
  return <ConsolidatedOverviewPage />;
};

export default Overview;
