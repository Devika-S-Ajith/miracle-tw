import { useCallback, useState, useEffect, useContext } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  IconButton,
} from "@mui/material";
import CaseContactDetails from "../Components/CaseContactDetails";
import Assessments from "../Components/Assessments";
// import useMounted from '../../../common/hooks/UseMounted';
import ChevronLeftIcon from "../../../assets/icons/ChevronLeft";
import PencilAltIcon from "../../../assets/icons/PencilAlt";
import useSettings from "../../../common/hooks/UseSettings";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

const tabs = [
  { label: "Details", value: "details" },
  { label: "Assessments", value: "logs" },
];

const CaseDetails = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { signedinUserRole, signedinOrgType } = useContext(CommonDataContext);
  const [customer, setCustomer] = useState(null);
  const [currentTab, setCurrentTab] = useState("details");
  let { id } = useParams();

  const getCustomer = useCallback(async () => {
    document.title = "Cases | Details | ThriveWell";
    try {
      const data = await APIS.CaseDetails(id);
      // if (mounted.current) {
      setCustomer(data.data.data);
      // }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getCustomer();
    return () => {};
  }, [getCustomer]);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  if (!customer) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? "xl" : false}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{
                  // display: {
                  //   md: 'none'
                  // }
                  mt: -0.5,
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Typography color="textPrimary" variant="h5">
                {`CASE-${customer.id}`}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ m: -1 }}>
                {(signedinOrgType == 3 ||
                  signedinOrgType == 4 ||
                  signedinOrgType == 5) &&
                (signedinUserRole === "admin" ||
                  signedinUserRole === "caseworker") ? (
                  <Button
                    color="primary"
                    component={RouterLink}
                    startIcon={<PencilAltIcon fontSize="small" />}
                    sx={{ m: 1 }}
                    to={`/dashboard/cases/${id}/edit`}
                    variant="contained"
                  >
                    {t("common:common.Edit")}
                  </Button>
                ) : (
                  <></>
                )}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={t(`common:common.${tab.label}`)}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </Box>
          <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === "details" && (
              <Grid container spacing={3}>
                <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={10}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  <CaseContactDetails
                    caseManager={customer.TWUserId}
                    child={
                      customer.childFirstName + " " + customer.childLastName
                    }
                    id={customer.id}
                    caseid={customer.caseid}
                    status={customer.caseStatus}
                  />
                </Grid>
              </Grid>
            )}

            {currentTab === "logs" && <Assessments caseId={customer.id} />}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CaseDetails;
