import { useCallback, useState, useEffect, useContext } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  // Breadcrumbs,
  Button,
  Container,
  Divider,
  Grid,
  // Link,
  Tab,
  Tabs,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import QuestionBasicDetails from "../Components/QuestionBasicDetails";
// import useMounted from '../../../common/hooks/UseMounted';
import ChevronLeftIcon from "../../../assets/icons/ChevronLeft";
import PencilAltIcon from "../../../assets/icons/PencilAlt";
//import gtm from '../../lib/gtm';
import useSettings from "../../../common/hooks/UseSettings";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

const tabs = [
  { label: "Details", value: "details" },
  //   { label: 'Logs', value: 'logs' }
];

const QuestionDetails = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  // const mounted = useMounted();
  const { settings } = useSettings();
  // const [organisation, setOrganisation] = useState(null);
  const { signedinUserRoleHT, signedinOrgType, languageList } =
    useContext(CommonDataContext);
  const currentLanguage = localStorage.getItem("language");
  const getLanguageId = () => {
    const langId =
      languageList.length &&
      languageList.find((item) => item.languageCode == currentLanguage)?.id;
    return langId;
  };
  const [selectedLanguageId, setSelectedLanguageId] = useState(getLanguageId());
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("details");
  const [options] = useState([
    { choiceName: "In-crisis", score: "1" },
    { choiceName: "Vulnerable", score: "2" },
    { choiceName: "Safe", score: "3" },
    { choiceName: "Thriving", score: "4" },
  ]);
  let { id } = useParams();

  const getQuestionDetails = useCallback(async (languageId) => {
    document.title = "Questions | Details | ThriveWell";
    setIsLoading(true);
    try {
      const data = await APIS.QuestionDetails(id, languageId);
      setQuestion(data.data.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (signedinOrgType !== null && signedinUserRoleHT !== null) {
      if (
        signedinUserRoleHT === "superadmin" ||
        (signedinOrgType == 1 && signedinUserRoleHT === "caseworker")
      ) {
        // has access
      } else {
        navigate("/Unauthorized");
      }
    }
    getQuestionDetails(selectedLanguageId);
    return () => {};
  }, [signedinOrgType, signedinUserRoleHT]);

  useEffect(() => {
    const languageId = getLanguageId();
    if (selectedLanguageId != languageId) {
      getQuestionDetails(languageId);
      setSelectedLanguageId(languageId);
    }
  }, [currentLanguage]);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Details | Material Kit Pro</title>
      </Helmet> */}
      {isLoading && (
        <CircularProgress
          sx={{
            zIndex: 1000,
            position: "absolute",
            top: "55%",
            left: "45%",
          }}
          color="primary"
        />
      )}
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
                onClick={() => navigate("/dashboard/questions")}
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
                {/* {organisation.organizationName} */}
                {t("common:question.Question Details")}
              </Typography>
              {/* <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Dashboard
                </Link>
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Management
                </Link>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                >
                  Customers
                </Typography>
              </Breadcrumbs> */}
            </Grid>
            <Grid item>
              <Box sx={{ m: -1 }}>
                {signedinUserRoleHT === "superadmin" ? (
                  <Button
                    color="primary"
                    component={RouterLink}
                    disabled={question && question.questionPublished}
                    startIcon={<PencilAltIcon fontSize="small" />}
                    sx={{ m: 1 }}
                    //sx={{ml: -11.5,mt : 8,position : "absolute",width : 100 }}
                    to={`/dashboard/questions/${id}/edit`}
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
                  {question && (
                    <QuestionBasicDetails
                      question={question}
                      options={options}
                      isLoading={isLoading}
                    />
                  )}
                </Grid>
                {/* <Grid
                  item
                  lg={settings.compact ? 6 : 4}
                  md={6}
                  xl={settings.compact ? 6 : 3}
                  xs={12}
                >
                  <CustomerInvoicesSummary />
                </Grid> */}
                {/* <Grid
                  item
                  lg={settings.compact ? 6 : 4}
                  md={6}
                  xl={settings.compact ? 6 : 3}
                  xs={12}
                >
                  <CustomerEmailsSummary />
                </Grid> */}
                {/* <Grid
                  item
                  lg={settings.compact ? 6 : 4}
                  md={6}
                  xl={settings.compact ? 6 : 3}
                  xs={12}
                >
                  <CustomerDataManagement />
                </Grid> */}
              </Grid>
            )}
            {/* {currentTab === 'users' && <OrganizationUsers />} */}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default QuestionDetails;
