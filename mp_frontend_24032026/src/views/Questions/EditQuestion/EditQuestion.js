import { useState, useCallback, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  // Breadcrumbs, 
  Button,
  Container,
  Grid,
  // Link, 
  Typography,
  Tab,
  Tabs,
  Divider,
  IconButton
} from '@mui/material';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import EditQuestionForm from '../Components/EditQuestionForm';
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import PlusIcon from '../../../assets/icons/Plus';
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//import gtm from '../../lib/gtm';

const EditQuestion = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const { signedinUserRoleHT } = useContext(CommonDataContext);
  const [currentTab, setCurrentTab] = useState('details');
  // const mounted = useMounted();
  const { settings } = useSettings();
  const [question, setQuestion] = useState(null);
  let { id } = useParams();
  const tabs = [
    { label: 'Details', value: 'details' }
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };




  useEffect(() => {
    if (signedinUserRoleHT !== null) {
      if (signedinUserRoleHT === 'superadmin') {
        // has access
      } else {
        navigate('/Unauthorized');
      }
    }
    getQuestionDetails();
    return () => {
    }
  }, [signedinUserRoleHT]);

  const getQuestionDetails = useCallback(async () => {
    try {
      const data = await APIS.QuestionDetailsForEdit(id);

      data.data.data.otherLanguageDetails[0]?.choiceDetails?.map((item, index) => {
        if (item.choiceName) {
          data.data.data.choiceDetails[index].choiceNameHindi = item.choiceName
        }
      })

      data.data.data.otherLanguageDetails[1]?.choiceDetails?.map((item, index) => {
        if (item.choiceName) {
          data.data.data.choiceDetails[index].choiceNameTamil = item.choiceName
        }
      })

      setQuestion(data.data.data)
    } catch (err) {
      console.error(err);
    }
  }, []);


  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
      </Helmet> */}
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt: 2
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton
                color="inherit"
                onClick={() => navigate('/dashboard/questions')}
                sx={{
                  // display: {
                  //   md: 'none'
                  // }
                  mt: - 0.5
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:question.Edit Question')}
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
                <Button
                  color="primary"
                  component={RouterLink}
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //sx={{ml: -11.5,mt : 8,position : "absolute",width : 100 }}
                  to={`/dashboard/questions/add`}
                  variant="contained"
                >
                  {t('common:question.Add Question')}
                </Button>
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
            {currentTab === 'details' && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={12}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  {question && <EditQuestionForm question={question} />}
                </Grid>
              </Grid>
            )}
          </Box>


        </Container>
      </Box>
    </>
  );
};

export default EditQuestion;
