import { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  Grid,
  Typography
} from "@mui/material";
import OrganizationListTable from "../Components/OrganizationListTable";
import useMounted from "../../../common/hooks/UseMounted";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import { SUPER_ADMIN } from "../../../helpers/constant";
import { getLocationNames } from "../../../helpers/helperFunction";

const OrganizationList = () => {
  const { t } = useTranslation(["common"]);
  const {
    locationList,
    signedinUserRoleHT,
    getUserTokens,
  } = useContext(CommonDataContext);
  const mounted = useMounted();
  const [accounts, setAccounts] = useState([]);
  const [activeAccountCount, setActiveAccountCount] = useState();
  const [pageCount, setpageCount] = useState(1);
  const [presentPage, setpresentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payloadData, setPayloadData] = useState({});
  let dataList;
  const [pageData, setPageData] = useState({
    page: 1,
    query: "",
    sort: "accountName",
    typeFilter: "",
    statusFilter: "",
  });
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const loggedInUserOrgId = localStorage.getItem("orgId");

  const savePageData = (pageObject = {}) => {
    localStorage.setItem("orgPageData", JSON.stringify(pageObject));
  };

  const saveCurrentPage = (currentPage) => {
    setpresentPage(currentPage);
    console.log(`%c${presentPage}`, "display:none");
  };

  let getOrgListpayload = {
    rowCount: "10",
    pageNumber: "1",
    globalSearchQuery: "",
    accountStatus: "",
    orgTypeFilter: "",
    orderByField: [["accountName", "ASC"]],
    fsStatus: "enabled",
    HTStatus: "enabled",
    MPAccountTypeId: []
  };

  const getOrgListpayloadConstant = {
    rowCount: "10",
    pageNumber: "1",
    globalSearchQuery: "",
    accountStatus: "active",
    accountTypeFilter: "",
    orderByField: [["accountName", "ASC"]],
    addressLine1Like: "",
    fsStatus: null,
    HTStatus: "enabled",
    MPAccountTypeId: [],
  };

  const getOrganizations = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getOrgListpayloadConstant;
        } else {
          finalPayload = { ...payload };
          getOrgListpayload = { ...finalPayload };
        }
        dataList = { ...finalPayload };
        setPayloadData(dataList);

        if ([SUPER_ADMIN].includes(signedinUserRoleHT)) {
          const data = await APIS.OrganizationList(finalPayload);
          setAccounts(data && data.data && data.data.data);
          setpageCount(data && data.data && data.data.pageCount);
          setActiveAccountCount(data && data.data && data.data?.totalActive);
          setLoading(false);
          if (data && data.data && data.data.data.length === 0) {
            setIsExportDisabled(true);
          } else {
            setIsExportDisabled(false);
          }
        } else {
          let data = [];
          const temp = await APIS.OrganisationDetails(loggedInUserOrgId);
          data[0] = temp.data.data;
          data[0].countryName = getLocationNames(
            locationList,
            temp.data.data.MPCountryId
          );
          setAccounts(data);
          setpageCount(1);
          setActiveAccountCount(1);
          setLoading(false);
          if (data && data?.length === 0) {
            setIsExportDisabled(true);
          } else {
            setIsExportDisabled(false);
          }
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  useEffect(() => {
    document.title = "Organizations | ThriveWell";
    getUserTokens();
    setLoading(true);
    if (localStorage.getItem("orgPageData") === null) {
      getOrganizations();
    } else {
      let localPageData = JSON.parse(localStorage.getItem("orgPageData"));
      let pageObject = {
        orderByField: [[`${localPageData.sort}`, "ASC"]],
        globalSearchQuery: `${localPageData.query}`,
        pageNumber: `${localPageData.page}`,
        accountStatus: "active",
        accountTypeFilter: `${localPageData.typeFilter}`,
        fsStatus: "enabled",
        HTStatus: "enabled",
        MPAccountTypeId: [],
      };
      setPageData({ ...localPageData });
      getOrganizations(pageObject);
    }
    return () => { };
  }, []);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2, //new style
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid
                item
                sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
              >
                <Typography color="textPrimary" variant="h5">
                {t("common:common.Admin")}
                </Typography>
                <Box
                  sx={{
                    m: 0.75,
                  }}
                  style={{ cursor: "text" }}
                >
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
                pageCount={pageCount}
                activeAccountCount={activeAccountCount}
                pageData={pageData}
                accounts={accounts}
                saveCurrentPage={saveCurrentPage}
                loading={loading}
                getOrganisationlist={getOrganizations}
              />
            </Box>
          </Grid>
        </Grid>{" "}
      </Box>
    </>
  );
};

export default OrganizationList;
