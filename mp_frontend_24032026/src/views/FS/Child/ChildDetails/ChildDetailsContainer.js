import React, { useContext, useEffect, useState } from "react";
import { Grid, Typography, Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import ChildLogDetails from "./ChildLogDetails";
import ChildDetails from "./ChildDetails";
import ChildHistoryList from "./ChildHistoryList";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import APIS from "../../../../common/hooks/UseApiCalls";
import Loader from "../../../../components/UserComponents/Loader";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import ChildCombinedLogsList from "./ChildCombinedLogsList";
import { ChildOverviewList } from "./ChildOverviewList";
import { ConcerningBehaviorList } from "./ConcerningBehaviorList";

const ChildDetailsContainer = () => {
  const navigate = useNavigate();
  const { getFsChildListData, signedinUserRoleFS } = useContext(CommonDataContext);
  const { id } = useParams();

  const [childData, setChildData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [childHistoryData, setChildHistoryData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    document.title = "Children | ThriveWell";
  }, []);

  useAuthorization(null, signedinUserRoleFS, null, "FSChild", false);

  useEffect(() => {
    if (id) getChildDetailsHandler();
  }, [id]);

  const getChildDetailsHandler = async () => {
    setIsLoading(true);
    try {
      const res = await APIS.getFsChild(id);
      if (res?.status === 200) setChildData(res?.data?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const getChildHistoryData = async (page = 0) => {
    const params = {
      childId: id,
      pageNumber: page + 1,
      rowCount: 10,
    };
    try {
      const res = await APIS.getChildHistoryList(params);
      if (res.status === 200) {
        setChildHistoryData(res?.data?.data);
        return res?.data?.totalCount;
      }
      console.log(res);
    } catch (error) {
      // Optionally handle error
    }
  };

  const onSuccessHandler = () => {
    getFsChildListData();
    getChildDetailsHandler();
    getChildHistoryData();
  };

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <Loader loading={isLoading} />
      <Box m={2}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} mb={2}>
          <Typography
            color="textPrimary"
            fontSize="1.5rem"
            fontWeight={700}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/fostershare/dashboard")}
          >
            FosterShare
          </Typography>
          <ChevronRightIcon color="disabled" fontSize="small" />
          <Typography
            color="textPrimary"
            fontWeight={700}
            fontSize="1.5rem"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/fostershare/children")}
          >
            Children
          </Typography>
          <ChevronRightIcon color="disabled" fontSize="small" />
          <Typography
            color="textPrimary"
            fontWeight={700}
            fontSize="1.5rem"
            sx={{ pointerEvents: "none" }}
          >
            {childData ? `${childData?.firstName} ${childData?.lastName}` : "Child details"}
          </Typography>
        </Box>
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Details" />
          <Tab label="Logs" />
        </Tabs>
        {tabIndex === 0 && (
          <Grid container spacing={2}>
            <Grid xs={12} sm={12} md={3} item>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <ChildDetails
                  childData={childData}
                  onSuccess={onSuccessHandler}
                />
                <ChildHistoryList
                  getChildHistoryData={getChildHistoryData}
                  childHistoryData={childHistoryData}
                />
              </Box>
            </Grid>
            <Grid xs={12} sm={12} md={4.5} item>
              {/* You can add more details here if needed */}
              <ChildOverviewList />
            </Grid>
            <Grid xs={12} sm={12} md={4.5} item>
              <ConcerningBehaviorList />
            </Grid>
          </Grid>
        )}
        {tabIndex === 1 && (
          <Grid container spacing={2}>
            <Grid xs={12} item>
              {/* <ChildLogDetails /> */}
              <ChildCombinedLogsList module="children" />
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
};

export default ChildDetailsContainer;
