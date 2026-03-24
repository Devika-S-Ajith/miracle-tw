import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography } from "@mui/material";
import APIS from "../../../common/hooks/UseApiCalls";
import FamilyListTable from "../Components/FamilyListTable";
import useMounted from "../../../common/hooks/UseMounted";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import PlusIcon from "../../../assets/icons/Plus";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const FamilyList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { signedinUserRoleHT, signedinOrgType } =
    useContext(CommonDataContext);
  const mounted = useMounted();
  const [families, setFamilies] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState(JSON.parse(localStorage.getItem("famPageData")) || {
    page: 1,
    rowCount: 10,
    query: "",
    sort: "familyName",
    sortOrder: "ASC",
    langFilter: "",
    statusFilter: "",
    isOpen: false,
  });

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "ManageFamily",
    true
  );

  const getFamilyListpayloadConstant = {
    rowCount: "10",
    pageNumber: "1",
    orderByField: [["familyName", "ASC"]],
    familyStatus: "",
    globalSearchQuery: "",
    TWAccountId: "",
  };

  const handleAddFamily = () => {
    navigate("/dashboard/families/add",{state:{mode:"add"}});
  };

  const savePageData = (pageObject = {}) => {
    localStorage.setItem("famPageData", JSON.stringify(pageObject));
  };

  useEffect(() => {
    document.title = "Family | ThriveWell";
    setLoading(true);
    let pageObject = {
      orderByField: [[pageData?.sort, pageData?.sortOrder]],
      globalSearchQuery: pageData?.query || "",
      pageNumber: pageData?.page || 1,
      languageFilter: pageData.langFilter || null,
      familyStatus: pageData.statusFilter || null,
      rowCount: pageData.rowCount || null,
      
    };
    getFamilies(pageObject);
    return () => { };
  }, []);

  

  const getFamilies = useCallback(
    async (payload = null) => {
      setLoading(true);
      try {
        let finalPayload;
        if (payload === null) {
          finalPayload = getFamilyListpayloadConstant;
        } else {
          finalPayload = payload;
        }
        finalPayload.TWAccountId = localStorage.getItem("userRegion");
        finalPayload.listType = "LARGE";
        const data = await APIS.GetFamilyList(finalPayload);
        setFamilies(data && data.data && data.data.familyDetails);
        setpageCount(data && data.data && data.data.pageCount);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2,
        }}
      >
        <Grid container width={1} mr={1}>
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
                <Typography color="textPrimary" variant="h5">
                  {t("common:family.Families")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, mr: 1 }}>
          <FamilyListTable
            families={families}
            loading={loading}
            savePageData={savePageData}
            pageCount={pageCount}
            pageData={pageData}
            getFamilyList={getFamilies}
          />
        </Box>
      </Box>
    </>
  );
};

export default FamilyList;
