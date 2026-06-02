import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { Box, Grid, Typography } from "@mui/material";
import OrganizationListTable from "../Components/OrganizationListTable";
import useMounted from "../../../common/hooks/UseMounted";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import { SUPER_ADMIN } from "../../../helpers/constant";
import { getLocationNames } from "../../../helpers/helperFunction";
import PageLoader from "../../../components/UserComponents/PageLoader";
import { a } from "aws-amplify";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const DEFAULT_PAYLOAD = {
  rowCount: "10",
  pageNumber: "1",
  globalSearchQuery: "",
  accountStatus: "active",
  accountTypeFilter: "",
  orderByField: [["accountName", "ASC"]],
  fsStatus: "enabled",
  HTStatus: "enabled",
  MPAccountTypeId: [],
};

const OrganizationList = () => {
  const { t } = useTranslation(["common"]);
  const { locationList, signedinUserRoleHT, getUserTokens } =
    useContext(CommonDataContext);

  const mounted = useMounted();

  // Keep latest role/locationList in refs so getOrganizations stays stable
  // and doesn't get recreated (which would re-trigger child effects)
  const roleRef = useRef(signedinUserRoleHT);
  const locationListRef = useRef(locationList);
  const loggedInUserOrgId = localStorage.getItem("orgId");

  useEffect(() => { roleRef.current = signedinUserRoleHT; }, [signedinUserRoleHT]);
  useEffect(() => { locationListRef.current = locationList; }, [locationList]);

  const [accounts, setAccounts] = useState([]);
  const [activeAccountCount, setActiveAccountCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const [pageData, setPageData] = useState({
    page: 1,
    query: "",
    sort: "accountName",
    typeFilter: "",
    statusFilter: "",
  });

  const savePageData = useCallback((pageObject = {}) => {
    localStorage.setItem("orgPageData", JSON.stringify(pageObject));
  }, []);

  const saveCurrentPage = useCallback(() => {}, []);
  const { authStatus, checkAuth } = useAuthorization("ListAccount");
  
  useEffect(() => {
      document.title = "Accounts | Thrivewell";;
      checkAuth();
    }, []);

  // ── Stable fetcher ───────────────────────────────────────────────────────
  // Uses refs for role/locationList so the function identity never changes
  // due to context updates — prevents child buildPayload from going stale.
  const getOrganizations = useCallback(
    async (payload = null) => {
      if (!mounted.current) return;

      // Clear immediately — old rows must never appear on the new page
      setAccounts([]);
      setLoading(true);

      try {
        const finalPayload = payload ? { ...payload } : { ...DEFAULT_PAYLOAD };

        if ([SUPER_ADMIN].includes(roleRef.current)) {
          finalPayload.userCountryId = localStorage.getItem("userRegion"); // Super admin sees all org types
          const res = await APIS.OrganizationList(finalPayload);
          if (!mounted.current) return;

          setAccounts(res?.data?.data ?? []);
          setPageCount(res?.data?.pageCount ?? 1);
          setActiveAccountCount(res?.data?.totalActive ?? 0);
        } else {
          const res = await APIS.OrganisationDetails(loggedInUserOrgId);
          if (!mounted.current) return;

          const orgData = res?.data?.data;
          if (orgData) {
            orgData.countryName = getLocationNames(
              locationListRef.current,
              orgData.MPCountryId
            );
            setAccounts([orgData]);
          } else {
            setAccounts([]);
          }
          setPageCount(1);
          setActiveAccountCount(orgData ? 1 : 0);
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
        if (mounted.current) setAccounts([]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [mounted, loggedInUserOrgId] // stable — context values are read via refs
  );

  useEffect(() => {
   if(authStatus === 'authorized') {
    getUserTokens();
    const stored = localStorage.getItem("orgPageData");
    if (stored === null) {
      getOrganizations();
    } else {
      const local = JSON.parse(stored);
      setPageData({ ...local });
      getOrganizations({
        ...DEFAULT_PAYLOAD,
        orderByField: [[`${local.sort ?? "accountName"}`, "ASC"]],
        globalSearchQuery: local.query ?? "",
        pageNumber: `${local.page ?? 1}`,
        accountTypeFilter: local.typeFilter ?? "",
      });
    }
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  if (authStatus === 'loading' || authStatus === 'idle') {
      return <PageLoader />;
    }
  
    if (authStatus === 'unauthorized') {
      return null; // Or a custom message
    }

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100%", pt: 2 }}>
      <Grid container width={1}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
              <Typography color="textPrimary" variant="h5">
                {t("common:common.Admin")}
              </Typography>
              <Box sx={{ m: 0.75 }} style={{ cursor: "text" }}>
                <ChevronRightIcon color="disabled" fontSize="small" />
              </Box>
              <Typography color="textPrimary" variant="h5">
                {t("common:common.Organizations")}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }} mr={1}>
            <OrganizationListTable
              savePageData={savePageData}
              saveCurrentPage={saveCurrentPage}
              pageCount={pageCount}
              activeAccountCount={activeAccountCount}
              pageData={pageData}
              accounts={accounts}
              loading={loading}
              getOrganisationlist={getOrganizations}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationList;