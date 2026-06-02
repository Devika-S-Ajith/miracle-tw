import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import useMounted from "../../../common/hooks/UseMounted";
import ChildListTable from "../Components/ChildListTable";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";

const ChildList = () => {

  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const mounted = useMounted();
  const [orgOptions, setOrgOptions] = useState([
    { id: "0", organizationName: t("common:common.All") },
  ]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setpageCount] = useState(1);
  const [presentPage, setpresentPage] = useState(1);
  const [payloadData, setPayloadData] = useState({});
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  let dataList;
  const [pageData, setPageData] = useState(() => {
    return JSON.parse(localStorage.getItem("childPageData")) || {
      page: 1,
      rowCount:10,
      query: "",
      sort: "firstName",
      sortOrder:"ASC",
      statusFilter: "",
      typeFilter: "",
      isOpen:false
    };
  });

  const getChildrenListpayloadConstant = {
    rowCount: "10",
    pageNumber: "1",
    orderByField: [["firstName", "ASC"]],
    globalSearchQuery: "",
    childStatus: "",
    HTOrganizationId: "",
  };

  const handleAddChild = () => {
    navigate("/dashboard/children/add");
  };
  const handleImport = () => {
    navigate("/dashboard/children/import");
  };
  const handleExport = useCallback(async () => {
    try {
      let finalPayload;
      let payload = {
        moduleType: "child",
        needFullData: "true",
      };
      finalPayload = { ...payloadData, ...payload };
      finalPayload.HTCountryId = localStorage.getItem("userRegion");
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
    localStorage.setItem("childPageData", JSON.stringify(pageObject));
  };

  const saveCurrentPage = (currentPage) => {
    setpresentPage(currentPage);
  };

  const getChildListAfterFamilySaveFun = () => {
    getChildren();
  };

  const getChildren = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getChildrenListpayloadConstant;
        } else {
          finalPayload = payload;
        }
        dataList = { ...finalPayload };
        setPayloadData(dataList);
        const data = await APIS.ListChildren(finalPayload)
        setUsers(data && data.data && data.data.data);
        setpageCount(data && data.data && data.data.pageCount);
        setLoading(false);
        if (data && data.data && data.data.data.length === 0) {
          setIsExportDisabled(true);
        } else {
          setIsExportDisabled(false);
        }
        //}
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  useEffect(() => {
    document.title = "Child | ThriveWell";
    setLoading(true);
      let pageObject = {
        orderByField: [[pageData?.sort , pageData?.sortOrder]],
        globalSearchQuery: pageData?.query || "",
        pageNumber: pageData?.page || 1,
        HTOrganizationId: pageData.typeFilter || null,
        childStatus: pageData.statusFilter || null,
        rowCount:pageData.rowCount || null ,
      };
      getChildren(pageObject)
    return () => {};
  }, [pageData]);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textPrimary"
                  variant="h5"
                  onClick={() => navigate("/dashboard")}
                  sx={{ cursor: "pointer" }}
                >
                  {t("common:common.Thrive Scale")}
                </Typography>
                <Box
                  sx={{
                    m: 0.75,
                  }}
                  style={{ cursor: "text" }}
                >
                  <ChevronRightIcon color="disabled" fontSize="small" />
                </Box>
                <Grid item>
                  <Typography color="textPrimary" variant="h5">
                    {t("common:common.Children")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, mr: 1 }}>
              {users && (
                <ChildListTable
                  childList={users}
                  savePageData={savePageData}
                  pageCount={pageCount}
                  pageData={pageData}
                  saveCurrentPage={saveCurrentPage}
                  loading={loading}
                  orgOptions={orgOptions}
                  getChildListAfterFamilySave={getChildListAfterFamilySaveFun}
                  getUserlist={getChildren}
                />
              )}
            </Box>
          </Grid>
        </Grid>
        {/* </Container> */}
      </Box>
    </>
  );
};

export default ChildList;
