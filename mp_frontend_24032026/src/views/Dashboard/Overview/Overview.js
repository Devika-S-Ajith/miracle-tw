import ConsolidatedOverviewPage from "../../Dashboard/Overview/Components/ConsolidatedOverviewPage";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import PageLoader from "../../../components/UserComponents/PageLoader";
import { useEffect } from "react";


const Overview = () => {
  const { authStatus, checkAuth } = useAuthorization("DashboardOverview");

  useEffect(() => {
    // You decide when to trigger it here
    checkAuth();
  }, []); // Only runs once on mount, or based on your specific logic

  if (authStatus === 'loading' || authStatus === 'idle') {
    return <PageLoader />;
  }

  if (authStatus === 'unauthorized') {
    return null; // Or a custom message
  }

  return <ConsolidatedOverviewPage />;
};

export default Overview;