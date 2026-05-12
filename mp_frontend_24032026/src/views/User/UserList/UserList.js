import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import UserListTable from "../Components/UserListTable";
import useMounted from "../../../common/hooks/UseMounted";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

//API CALL
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import { SUPER_ADMIN } from "../../../helpers/constant";

const UserList = () => {
  const { signedinUserRoleHT } =
    useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const mounted = useMounted();
  const [users, setUsers] = useState([]);
  const [orgOptions, setOrgOptions] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [presentPage, setpresentPage] = useState(1);
  const [activeUserCount, setActiveUserCount] = useState();
  const [payloadData, setPayloadData] = useState({});
  let dataList;
  const [pageData, setPageData] = useState({
    page: 1,
    query: "",
    sort: "firstName",
    statusFilter: "",
    typeFilter: "",
  });
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const loggedInUserOrgId = localStorage.getItem("orgId");

  const getUserListpayloadConstant = {
    rowCount: "10",
    pageNumber: "1",
    globalSearchQuery: "",
    status: ["active", "pending"],
    HTUserRoleId: null,
    FSUserRoleId: null,
    accountId: "",
  };

  useEffect(() => {
    document.title = "Team | ThriveWell";
    setLoading(true);
    getOrgList();
    if (localStorage.getItem("userPageData") === null) {
      getUserList();
    } else {
      let localPageData = JSON.parse(localStorage.getItem("userPageData"));
      let pageObject = {
        orderByField: [[`${localPageData.sort}`, "ASC"]],
        globalSearchQuery: `${localPageData.query}`,
        pageNumber: `${localPageData.page}`,
        organizationId: `${localPageData.typeFilter}`,
        status: `${localPageData.statusFilter}`,
      };
      setPageData({ ...localPageData });
      getUserList(pageObject);
    }
  }, []);

  const handleAddOrg = () => {
    navigate("/dashboard/team/add");
  };
  const handleImport = () => {
    navigate("/dashboard/team/import");
  };

  const handleExport = useCallback(async () => {
    try {
      let finalPayload;
      let payload = {
        moduleType: "user",
        needFullData: "true",
      };

      finalPayload = { ...payloadData, ...payload };

      if (signedinUserRoleHT === "superadmin") {
        finalPayload.TWCountryId = "";
      } else {
        finalPayload.TWCountryId = localStorage.getItem("userRegion");
      }
      const data = await APIS.ExportFile(finalPayload);
      if (data.data.Message === "Data export started.") {
        toast.success(t("common:common.Data export started"));
      } else if (data.data.Message === "Unauthorized") {
        toast.error(t("common:common.Unauthorized"));
      }
    } catch (err) {
      console.error(err);
    }
  });

  const savePageData = (pageObject = {}) => {
    localStorage.setItem("userPageData", JSON.stringify(pageObject));
  };

  const saveCurrentPage = (currentPage) => {
    setpresentPage(currentPage);
    console.log(`%c${presentPage}`, "display:none");
  };

  const getUserList = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getUserListpayloadConstant;
        } else {
          finalPayload = payload;
        }

        if (![SUPER_ADMIN].includes(signedinUserRoleHT)) {
          finalPayload.accountId = [loggedInUserOrgId];
          
        }
        if ([SUPER_ADMIN].includes(signedinUserRoleHT)) {
          finalPayload.userCountryId = localStorage.getItem("userRegion");
          
        }
        dataList = { ...finalPayload };
        setPayloadData(dataList);
        const data = await APIS.ListUsers(finalPayload);
        const familyData = await APIS.getFamilyPerCaseWorker({});
        const childDataIndia = await APIS.getChildPerCaseWorker("india");
        const childDataUSA = await APIS.getChildPerCaseWorker("usa");
        const mergedChildData = {
          data: {
            ...childDataIndia?.data?.data,
            ...childDataUSA?.data?.data,
          },
        };

        if (data && data.data && data.data.data) {
          let listData = data.data.data;
          listData.map((user) => {
            user.TSChildCount = mergedChildData?.data?.[user.id] || 0;
            user.FSFamilyCount = familyData?.data?.data?.[user.id] || 0;
          });
          setUsers(listData);
          setpageCount(data && data.data && data.data?.pageCount);
          setActiveUserCount(data && data.data && data.data?.totalActive);
          setLoading(false);
          if (data && data.data && data.data.users?.length === 0) {
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

  const getOrgList = useCallback(async () => {
    const payload = {
      rowCount: "1000",
      pageNumber: "1",
      globalSearchQuery: "",
      accountStatus: "",
      accountTypeFilter: "",
      orderByField: [["accountName", "ASC"]],
      addressLine1Like: "",
      userCountryId:localStorage.getItem("userRegion"),
    };
    payload.TWCountryId = [SUPER_ADMIN].includes(signedinUserRoleHT)
      ? ""
      : localStorage.getItem("userRegion");
    try {
      const data = await APIS.OrganizationList(payload);
      if (data && data.data && data.data.data.length) {
        setOrgOptions([...data.data.data]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

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
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
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
                  {t("common:common.Team")}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }} mr={1}>
              {users && (
                <UserListTable
                  customers={users}
                  savePageData={savePageData}
                  pageCount={pageCount}
                  activeUserCount={activeUserCount}
                  pageData={pageData}
                  saveCurrentPage={saveCurrentPage}
                  loading={loading}
                  orgOptions={orgOptions}
                  getUserlist={getUserList}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default UserList;
